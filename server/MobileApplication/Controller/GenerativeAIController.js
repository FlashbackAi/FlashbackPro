const axios = require("axios");
const fs = require("fs");
const base64 = require("base64-js");
const logger = require("../../logger"); // Using your logger
const FormData = require("form-data");
const { getConfig } = require('../../config');
const sharp = require("sharp");
const generativeImageModel = require("../Model/GenerativeImageModel");

// Get AWS SDK & S3 Instance
const s3 = getConfig().s3;
const docClient = getConfig().docClient;
const SERVER_ADDRESS = "http://13.234.246.123:8188";
const CLIENT_ID = require("crypto").randomUUID();
const POLL_INTERVAL = 3000; // Poll every 3 seconds
const S3_BUCKET = "flashbackgenai";  // Change to your actual S3 bucket

// **Upload Image to S3 Inside `requestId` Folder**
async function uploadToS3(imageBuffer, filename, requestId) {
    try {
        const key = `${requestId}/${filename}`;  // Store inside requestId subfolder
        const params = {
            Bucket: S3_BUCKET,
            Key: key,
            Body: imageBuffer,
        };

        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location; // S3 URL
    } catch (error) {
        logger.error(`Error uploading image to S3: ${error.message}`);
        throw error;
    }
}

// **Download & Resize Image from S3**
async function downloadAndResizeImage(imageUrl) {
    try {
        // **1️⃣ Extract Bucket & Key for Private S3 Access**
        const urlParts = imageUrl.split("/");
        const bucketName = urlParts[2].split(".")[0]; // Extracts bucket name from the URL
        let key = decodeURIComponent(urlParts.slice(3).join("/").replace(/\+/g, " ")); // Decode Key

        logger.info(`Downloading image from S3: Bucket=${bucketName}, Key=${key}`);

        // **2️⃣ Download from S3**
        const s3Response = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
        let imageBuffer = s3Response.Body;
        logger.info(`Image successfully downloaded from S3: ${imageUrl}`);

        // **3️⃣ Resize if Image >1MB**
        if (imageBuffer.length > 1024 * 1024) {
            imageBuffer = await sharp(imageBuffer)
                .resize({ width: 1024 })  // Resize while keeping aspect ratio
                .jpeg({ quality: 85 })   // Convert to JPEG with compression
                .toBuffer();
            logger.info(`Image resized (compressed for processing).`);
        }

        return imageBuffer;
    } catch (error) {
        logger.error(`Error downloading or resizing image from S3: ${imageUrl}`, error);
        throw new Error(`Error processing image: ${error.message}`);
    }
}


// **Upload File to ComfyUI**
async function uploadToComfyUI(imageBuffer, filename) {
    try {
        const formData = new FormData();
        formData.append("image", imageBuffer, { filename, contentType: "image/jpeg" });

        const response = await axios.post(`${SERVER_ADDRESS}/upload/image`, formData, {
            headers: formData.getHeaders()
        });

        return response.data.name;
    } catch (error) {
        throw new Error(`Error uploading file to ComfyUI: ${error.message}`);
    }
}

// **Queue Prompt**
async function queuePrompt(prompt) {
    try {
        logger.info("Queuing prompt to ComfyUI...");
        const payload = { prompt, client_id: CLIENT_ID };
        const response = await axios.post(`${SERVER_ADDRESS}/prompt`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        logger.info(`Prompt queued successfully. Prompt ID: ${response.data.prompt_id}`);
        return response.data;
    } catch (error) {
        logger.error(`Error queuing prompt: ${error.message}`);
        throw error;
    }
}

// **Get Image**
async function getImage(filename, subfolder, folderType) {
    try {
        logger.info(`Fetching image: ${filename} (Subfolder: ${subfolder}, Type: ${folderType})`);
        const response = await axios.get(`${SERVER_ADDRESS}/view`, {
            params: { filename, subfolder, type: folderType },
            responseType: "arraybuffer",
        });
        return response.data;
    } catch (error) {
        logger.error(`Error fetching image: ${error.message}`);
        throw error;
    }
}

// **Get Workflow History**
async function getHistory(promptId) {
    try {
        logger.info(`Fetching history for Prompt ID: ${promptId}`);
        const response = await axios.get(`${SERVER_ADDRESS}/history/${promptId}`);
        return response.data[promptId] || response.data;
    } catch (error) {
        logger.error(`Error fetching history: ${error.message}`);
        throw error;
    }
}

// **Poll for Progress Using History API**
async function pollForProgress(promptId, res) {
    try {
        logger.info(`Polling for progress updates for Prompt ID: ${promptId}`);
        let completed = false;

        while (!completed) {
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL)); // Poll every 3 seconds

            const history = await getHistory(promptId);
            if (!history.status || !history.status.messages) continue;

            // Extract execution messages
            for (const message of history.status.messages) {
                if (message[0] === "execution_start") {
                    logger.info("Execution started.");
                }
                if (message[0] === "execution_success") {
                    logger.info("Workflow execution completed.");
                    completed = true;
                    break; // **Break the loop immediately after success**
                }
            }
        }

        return await getHistory(promptId);
    } catch (error) {
        logger.error(`Error polling progress: ${error.message}`);
        res.write(`event: error\ndata: ${JSON.stringify({ message: "Error fetching progress." })}\n\n`);
    }
}

// **Main API**
exports.processImagesProgress = async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    logger.info("Client connected for SSE updates");

    try {
        const { user_phone_number, prompt, s3_url_image1, s3_url_image2 } = req.body;
        const requestId = require("crypto").randomUUID();

        // **1️⃣ Store Initial Entry in DynamoDB**
        await generativeImageModel.createRequest(requestId, user_phone_number, [s3_url_image1, s3_url_image2]);
        logger.info(`Stored request in DynamoDB with requestId: ${requestId}`);

        // **2️⃣ Download & Resize Images if >1MB**
        logger.info("Downloading and processing images...");
        const image1Buffer = await downloadAndResizeImage(s3_url_image1);
        const image2Buffer = await downloadAndResizeImage(s3_url_image2);

        // **3️⃣ Upload Processed Images to ComfyUI**
        const image1Path = await uploadToComfyUI(image1Buffer, "image1.jpg");
        const image2Path = await uploadToComfyUI(image2Buffer, "image2.jpg");
        logger.info(`Uploaded images to ComfyUI: ${image1Path}, ${image2Path}`);

        // **4️⃣ Load & Modify Workflow JSON**
        const workflow = JSON.parse(fs.readFileSync("MobileApplication/ComfyWorkFlow/PuLID_with_attn_mask.json", "utf8"));
        workflow["191"]["inputs"]["text"] = prompt;
        workflow["206"]["inputs"]["image"] = image1Path;
        workflow["207"]["inputs"]["image"] = image2Path;

        // **5️⃣ Submit Workflow**
        const promptResponse = await queuePrompt(workflow);
        const promptId = promptResponse.prompt_id;
        logger.info(`Workflow submitted with Prompt ID: ${promptId}`);

        // **6️⃣ Poll for Progress**
        res.write(`event: progress\ndata: ${JSON.stringify({ message: `Workflow started with Prompt ID: ${promptId}` })}\n\n`);
        const history = await pollForProgress(promptId, res);

        // **7️⃣ Fetch & Upload Generated Images to S3**
        logger.info("Fetching generated images...");
        let generatedImages = [];
        for (const nodeId in history.outputs) {
            if (history.outputs[nodeId].images) {
                for (const image of history.outputs[nodeId].images) {
                    const imageData = await getImage(image.filename, image.subfolder, image.type);
                    const s3Url = await uploadToS3(imageData, image.filename, promptId);
                    generatedImages.push(s3Url);
                    logger.info(`Image uploaded to S3: ${s3Url}`);
                }
            }
        }

        // **8️⃣ Update DynamoDB Entry**
        await generativeImageModel.updateRequest(requestId, promptId, generatedImages);
        logger.info(`Updated request ${requestId} with promptId and generated images.`);

        // **9️⃣ Send Final Image URLs via SSE**
        res.write(`event: image\ndata: ${JSON.stringify({ images: generatedImages })}\n\n`);
        res.end();
    } catch (error) {
        logger.error(`Error during workflow execution: ${error.message}`);
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
        res.end();
    }
};
