const axios = require("axios");
const fs = require("fs");
const logger = require("../../logger");
const FormData = require("form-data");
const { getConfig } = require("../../config");
const sharp = require("sharp");
const generativeImageModel = require("../Model/GenerativeImageModel");

// AWS SDK & S3 Instance
const s3 = getConfig().s3;
const docClient = getConfig().docClient;
const SERVER_ADDRESS = "http://13.234.246.123:8188";
const CLIENT_ID = require("crypto").randomUUID();
const POLL_INTERVAL = 3000;
const S3_BUCKET = "flashbackgenai";

// ✅ Upload Image to S3
async function uploadToS3(imageBuffer, filename, requestId) {
    try {
        const key = `${requestId}/${filename}`;
        const params = {
            Bucket: S3_BUCKET,
            Key: key,
            Body: imageBuffer,
        };

        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location;
    } catch (error) {
        logger.error(`Error uploading image to S3: ${error.message}`);
        throw error;
    }
}

// ✅ Download & Resize Image from S3
async function downloadAndResizeImage(imageUrl) {
    try {
        const urlParts = imageUrl.split("/");
        const bucketName = urlParts[2].split(".")[0];
        let key = decodeURIComponent(urlParts.slice(3).join("/").replace(/\+/g, " "));

        logger.info(`Downloading image from S3: Bucket=${bucketName}, Key=${key}`);
        const s3Response = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
        let imageBuffer = s3Response.Body;

        if (imageBuffer.length > 1024 * 1024) {
            imageBuffer = await sharp(imageBuffer)
                .resize({ width: 1024 })
                .jpeg({ quality: 85 })
                .toBuffer();
            logger.info(`Image resized.`);
        }
        return imageBuffer;
    } catch (error) {
        logger.error(`Error processing image from S3: ${error.message}`);
        throw new Error(`Error processing image: ${error.message}`);
    }
}

// ✅ Upload File to ComfyUI
async function uploadToComfyUI(imageBuffer, filename) {
    try {
        const formData = new FormData();
        formData.append("image", imageBuffer, { filename, contentType: "image/jpeg" });

        const response = await axios.post(`${SERVER_ADDRESS}/upload/image`, formData, {
            headers: formData.getHeaders(),
        });

        return response.data.name;
    } catch (error) {
        throw new Error(`Error uploading file to ComfyUI: ${error.message}`);
    }
}

// ✅ Queue Prompt
async function queuePrompt(prompt) {
    try {
        const payload = { prompt, client_id: CLIENT_ID };
        const response = await axios.post(`${SERVER_ADDRESS}/prompt`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        return response.data;
    } catch (error) {
        throw new Error(`Error queuing prompt: ${error.message}`);
    }
}

// ✅ Get Workflow History
async function getHistory(promptId) {
    try {
        const response = await axios.get(`${SERVER_ADDRESS}/history/${promptId}`);
        return response.data[promptId] || response.data;
    } catch (error) {
        throw new Error(`Error fetching history: ${error.message}`);
    }
}

// ✅ Poll for Progress
async function pollForProgress(promptId, res) {
    try {
        let completed = false;
        while (!completed) {
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

            const history = await getHistory(promptId);
            if (!history.status || !history.status.messages) continue;

            for (const message of history.status.messages) {
                if (message[0] === "execution_success") {
                    completed = true;
                    break;
                }
            }
        }
        return await getHistory(promptId);
    } catch (error) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: "Error fetching progress." })}\n\n`);
        res.end();
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

// ✅ Main Business Logic
exports.processImagesProgress = async (user_phone_number, prompt, s3_url_image1, s3_url_image2, res) => {
    try {
        const requestId = require("crypto").randomUUID();

        // 1️⃣ Store Request in DynamoDB
        await generativeImageModel.createRequest(requestId, user_phone_number, [s3_url_image1, s3_url_image2]);
        logger.info(`Stored requestId: ${requestId}`);

        // 2️⃣ Download & Resize Images
        const image1Buffer = await downloadAndResizeImage(s3_url_image1);
        const image2Buffer = await downloadAndResizeImage(s3_url_image2);

        // 3️⃣ Upload to ComfyUI
        const image1Path = await uploadToComfyUI(image1Buffer, "image1.jpg");
        const image2Path = await uploadToComfyUI(image2Buffer, "image2.jpg");
        logger.info(`Uploaded to ComfyUI: ${image1Path}, ${image2Path}`);

        // 4️⃣ Load Workflow JSON
        const workflow = JSON.parse(fs.readFileSync("MobileApplication/ComfyWorkFlow/PuLID_with_attn_mask.json", "utf8"));
        workflow["191"]["inputs"]["text"] = prompt;
        workflow["206"]["inputs"]["image"] = image1Path;
        workflow["207"]["inputs"]["image"] = image2Path;

        // 5️⃣ Submit Workflow
        const promptResponse = await queuePrompt(workflow);
        const promptId = promptResponse.prompt_id;
        logger.info(`Workflow submitted: ${promptId}`);

        // 6️⃣ Poll for Progress
        res.write(`event: progress\ndata: ${JSON.stringify({ message: `Workflow started with Prompt ID: ${promptId}` })}\n\n`);
        const history = await pollForProgress(promptId, res);

        // 7️⃣ Upload Generated Images to S3
        let generatedImages = [];
        for (const nodeId in history.outputs) {
            if (history.outputs[nodeId].images) {
                for (const image of history.outputs[nodeId].images) {
                    const imageData = await getImage(image.filename, image.subfolder, image.type);
                    const s3Url = await uploadToS3(imageData, image.filename, promptId);
                    generatedImages.push(s3Url);
                }
            }
        }

        // 8️⃣ Update Request in DynamoDB
        await generativeImageModel.updateRequest(requestId, promptId, generatedImages);

        // 9️⃣ Send Response
        res.write(`event: image\ndata: ${JSON.stringify({ images: generatedImages })}\n\n`);
        res.end();
    } catch (error) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
        res.end();
    }
};
