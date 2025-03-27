const axios = require("axios");
const fs = require("fs");
const logger = require("../../logger");
const FormData = require("form-data");
const { getConfig } = require("../../config");
const sharp = require("sharp");
const generativeImageModel = require("../Model/GenerativeImageModel");
const crypto = require('crypto');
const StreakModel = require("../Model/StreakModel");
const userService = require("../Service/UserService")
const promptModel = require("../Model/PromptModel")
const machineVisionIndexedDataModel = require("../Model/MachineVisionIndexedDataModel")

// AWS SDK & S3 Instance
const s3 = getConfig().s3;
const docClient = getConfig().docClient;
const { kms } = getConfig();
const SERVER_ADDRESS = "http://13.234.246.123:8188"; //This was AWS GPU IP
// const SERVER_ADDRESS = "http://198.145.126.6:8188"; // This is IO.NET IP
const CLIENT_ID = require("crypto").randomUUID();
const POLL_INTERVAL = 3000;
const S3_BUCKET = "flashbackgenai";

// ✅ Upload Image to S3
async function uploadToS3(imageBuffer,folderName,related_user_id, filename, requestId) {
    try {
        const key = `${folderName}/${related_user_id}/${requestId}-${filename}`;
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

// Decrypt Image Function
async function decryptImage(encryptedBuffer, ivBase64, encryptedKeyBase64) {
  const decryptedKeyResponse = await kms.decrypt({
      CiphertextBlob: Buffer.from(encryptedKeyBase64, "base64"),
  }).promise();

  const decryptedKey = decryptedKeyResponse.Plaintext;
  const iv = Buffer.from(ivBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", decryptedKey, iv);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

// ✅ Download & Resize Image from S3
async function downloadAndResizeImage(imageUrl) {
    try {
        const urlParts = imageUrl.split("/");
        const bucketName = urlParts[2].split(".")[0];
        let key = decodeURIComponent(urlParts.slice(3).join("/").replace(/\+/g, " "));

        logger.info(`Downloading image from S3: Bucket=${bucketName}, Key=${key}`);
        const s3Response = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
        
        const iv = s3Response.Metadata.iv;
        const encryptedKey = s3Response.Metadata.encryptedkey;
        if (!iv || !encryptedKey) {
            logger.info("image Url : ", imageUrl, "Normal image");
            let imageBuffer = s3Response.Body;
            if (imageBuffer.length > 1024 * 1024) {
                imageBuffer = await sharp(imageBuffer)
                    .resize({ width: 1024 })
                    .jpeg({ quality: 85 })
                    .toBuffer();
                logger.info(`Image resized.`);
            }
            return imageBuffer;
        }else{
            // Decrypt the image
            logger.info("image Url : ", imageUrl, "Encrypted image");
            const encryptedImage = s3Response.Body;
            let imageBuffer = await decryptImage(encryptedImage, iv, encryptedKey);
            if (imageBuffer.length > 1024 * 1024) {
                imageBuffer = await sharp(imageBuffer)
                    .resize({ width: 1024 })
                    .jpeg({ quality: 85 })
                    .toBuffer();
                logger.info(`Image resized.`);
            }
            return imageBuffer;
        }
        
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
exports.processImagesProgress = async (user_phone_number, prompt, s3_url_image1, s3_url_image2, related_user_id, related_user_phone, res) => {
    try {
        const requestId = require("crypto").randomUUID();

        // 1️⃣ Store Request in DynamoDB
        await generativeImageModel.createRequest(requestId, user_phone_number, prompt, [s3_url_image1, s3_url_image2], related_user_id, related_user_phone);
        logger.info(`Stored requestId: ${requestId}`);

        await StreakModel.updateStreak(user_phone_number, related_user_id, 'memory_generated');

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
        const folderName = user_phone_number.replace('+','')
        for (const nodeId in history.outputs) {
            if (history.outputs[nodeId].images) {
                for (const image of history.outputs[nodeId].images) {
                    const imageData = await getImage(image.filename, image.subfolder, image.type);                    
                    const s3Url = await uploadToS3(imageData,folderName,related_user_id, image.filename, promptId);
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


exports.getGeneratedImagesByPhoneNumber = async (phoneNumber) => {
    try {
      
      // Get generated images from model using the static method
      const generatedImages = await generativeImageModel.queryByPhoneNumber(phoneNumber);
      
      // Process results if needed (e.g., sort by date, filter by status)
      const processedResults = generatedImages
        // Only include completed generations
        .filter(image => image.generation_status === 'completed')
        // Sort by created_at in descending order (newest first)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return processedResults;
    } catch (error) {
      throw error;
    }
  };

  const generateImages = async (
    user_phone_number,
    prompt,
    s3_url_image1,
    s3_url_image2,
    related_user_id,
    related_user_phone
  ) => {
    try {
      // 1️⃣ Store Request in DynamoDB
      const requestId =require("crypto").randomUUID();
      await generativeImageModel.createRequest(
        requestId,
        user_phone_number,
        prompt,
        [s3_url_image1, s3_url_image2],
        related_user_id,
        related_user_phone,
        "auto_trigger"
      );
      logger.info(`Stored requestId: ${requestId}`);
  
      // Optionally track user streak
      //await updateStreak(user_phone_number, related_user_id, "memory_generated");
  
      // 2️⃣ Download & Resize Images
      const image1Buffer = await downloadAndResizeImage(s3_url_image1);
      const image2Buffer = await downloadAndResizeImage(s3_url_image2);
  
      // 3️⃣ Upload to ComfyUI
      const image1Path = await uploadToComfyUI(image1Buffer, "image1.jpg");
      const image2Path = await uploadToComfyUI(image2Buffer, "image2.jpg");
      logger.info(`Uploaded to ComfyUI: ${image1Path}, ${image2Path}`);
  
      // 4️⃣ Load Workflow JSON
      const workflowRaw = fs.readFileSync("MobileApplication/ComfyWorkFlow/PuLID_with_attn_mask.json", "utf8");
      const workflow = JSON.parse(workflowRaw);
  
      // Inject the prompt and image paths into the workflow
      workflow["191"]["inputs"]["text"] = prompt;
      workflow["206"]["inputs"]["image"] = image1Path;
      workflow["207"]["inputs"]["image"] = image2Path;
  
      // 5️⃣ Submit Workflow
      const promptResponse = await queuePrompt(workflow);
      const promptId = promptResponse.prompt_id;
      logger.info(`Workflow submitted: ${promptId}`);
  
      // 6️⃣ Poll for Progress (no SSE, just wait until done)
      //    pollForProgress might return the final "history" or "outputs"
      //    after it detects the workflow is finished
      const history = await pollForProgress(promptId);
      logger.info(`Workflow completed for Prompt ID: ${promptId}`);
  
      // 7️⃣ Upload Generated Images to S3
      const generatedImages = [];
      const folderName = user_phone_number.replace('+','')
      for (const nodeId in history.outputs) {
        const nodeOutput = history.outputs[nodeId];
        if (nodeOutput.images) {
          for (const image of nodeOutput.images) {
            const imageData = await getImage(image.filename, image.subfolder, image.type);
            const s3Url = await uploadToS3(imageData, folderName, related_user_id, image.filename, promptId);
            generatedImages.push(s3Url);
          }
        }
      }
  
      // 8️⃣ Update Request in DynamoDB
      await generativeImageModel.updateRequest(requestId, promptId, generatedImages);
  
      // 9️⃣ Return the result instead of streaming via SSE
      return {
        success: true,
        requestId,
        promptId,
        generatedImages
      };
    } catch (error) {
      logger.error(`Error in processImagesNoRes: ${error.message}`);
    }
  };

  exports.triggerGeneratedMemories = async(user_phone_number, related_user_id, related_user_phone, relation, gender) => {
    try {

        // 2. Fetch prompts based on relationship
        const relationPrompts = await promptModel.getRelationPrompts(relation, gender);
        // 1. Fetch face thumbnail URLs for both users
        if(!relationPrompts){
            logger.info("No prompts exists for this combination of relation and gender")
        }
        const userDetails = await userService.getUserDetails(user_phone_number);
        const folderName = user_phone_number.replace('+', '');
        const userFaceUrl = await getBestFaceThumbnail(userDetails.user_id,folderName);
        logger.info(userFaceUrl)
        const relatedUserFaceUrl = await getBestFaceThumbnail(related_user_id,folderName);
        logger.info(relatedUserFaceUrl)

        

        // Array to store generated image results
        const generatedImages = [];

        // Generate images for each prompt
        for (const prompt of relationPrompts) {
            const imageResult = await generateImages(user_phone_number, prompt, userFaceUrl, relatedUserFaceUrl, related_user_id, related_user_phone, '');
            generatedImages.push(imageResult);
        }

        return {
            status: 'success',
            phone_number: user_phone_number,
            generated_images: generatedImages,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        logger.error('Error in triggerGeneratedMemories:', error);
        return {
            status: 'error',
            phone_number: user_phone_number,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

const getNumericValue = (obj) => {
    if (obj && obj.N) return parseFloat(obj.N);
    return null;
};

// Helper function to extract string value from DynamoDB-style object
const getStringValue = (obj) => {
    if (obj && obj.S) return obj.S;
    return null;
};

// Helper function to extract boolean value from DynamoDB-style object
const getBooleanValue = (obj) => {
    if (obj && obj.BOOL !== undefined) return obj.BOOL;
    return null;
};

const getBestFaceThumbnail = async (user_id, folderName) => {
    try {
        // Fetch all images from the folder
        const images = await machineVisionIndexedDataModel.getUserImagesFromFolder(user_id, folderName);

        if (!images || images.length === 0) {
            throw new Error(`No images found for user ${user_id} in folder ${folderName}`);
        }

        // Function to calculate a quality score for each image
        const calculateImageScore = (image) => {
            const brightness = getNumericValue(image.brightness) || 0;
            const roll = getNumericValue(image.face_alignment) || 0;
            const pitch = getNumericValue(image.pitch) || 0;
            const yaw = getNumericValue(image.yaw) || 0;
            const sharpness = getNumericValue(image.sharpness) || 0;
            const occlusion = getBooleanValue(image.occlusion_flag);

            // Scoring criteria for straight-facing face:
            // 1. No occlusion (must be false)
            // 2. Low pitch, roll, and yaw values (closer to 0 is better)
            // 3. High brightness (better visibility)
            // 4. High sharpness
            // 5. High confidence
            // 6. Preferably single face in image
            // 7. Low face alignment value (indicates better alignment)

            if (occlusion) return -Infinity; // Disqualify occluded images

            // Normalize values and apply weights
            const pitchScore = (90 - Math.abs(pitch)) / 90; // 0 to 1 scale
            const rollScore = (90 - Math.abs(roll)) / 90;
            const yawScore = (90 - Math.abs(yaw)) / 90;
            const brightnessScore = brightness / 255; // Assuming 255 max
            const sharpnessScore = sharpness / 100; // Assuming 100 max

            // Weighted average
            return (
                (yawScore * 0.3) +      // Most important for straight face
                (pitchScore * 0.2) +     // Important for straight face
                (rollScore * 0.2) +      // Important for straight face
                (brightnessScore * 0.1) +
                (sharpnessScore * 0.1) 
            );
        };

        // Find the best image
        const bestImage = images.reduce((best, current) => {
            
            const currentScore = calculateImageScore(current);
            const bestScore = best ? calculateImageScore(best) : -Infinity;
            
            return currentScore > bestScore ? current : best;
        }, null);

        if (!bestImage) {
            throw new Error('No suitable image found after scoring');
        }

        // Return the S3 URL of the best image
        return `https://machinevisionuserscroppedfaces.s3.ap-south-1.amazonaws.com/${folderName}/${bestImage.user_id}/${bestImage.face_id}_cropped.jpg`

    } catch (error) {
        console.error('Error in getBestFaceThumbnail:', error);
        throw new Error(`Failed to get best face thumbnail: ${error.message}`);
    }
};
  
  
