const axios = require("axios");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const base64 = require("base64-js");
const eventEmitter = require("../utils/eventEmitter");

const SERVER_ADDRESS = process.env.SERVER_ADDRESS;
const CLIENT_ID = require("crypto").randomUUID();

// Upload File to ComfyUI
async function uploadFile(file) {
    const formData = new FormData();
    formData.append("image", file.buffer, file.originalname);

    const response = await axios.post(`${SERVER_ADDRESS}/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.name;
}

// Queue Prompt
async function queuePrompt(prompt) {
    const payload = { prompt, client_id: CLIENT_ID };

    const response = await axios.post(`${SERVER_ADDRESS}/prompt`, payload, {
        headers: { "Content-Type": "application/json" },
    });

    return response.data;
}

// Get History
async function getHistory(promptId) {
    const response = await axios.get(`${SERVER_ADDRESS}/history/${promptId}`);
    return response.data;
}

// Get Image
async function getImage(filename, subfolder, folderType) {
    const response = await axios.get(`${SERVER_ADDRESS}/view`, {
        params: { filename, subfolder, type: folderType },
        responseType: "arraybuffer",
    });
    return response.data;
}

// Start Workflow
async function startWorkflow(image1, image2, prompt) {
    console.log("Uploading images...");
    const image1Path = await uploadFile(image1);
    const image2Path = await uploadFile(image2);

    console.log("Loading workflow...");
    const workflow = JSON.parse(fs.readFileSync("C:\\Users\\AnirudhThadem\\FLASHBACK\\Generative Model\\API_Code\\PuLID_with_attn_mask.json", "utf8"));

    workflow["191"]["inputs"]["text"] = prompt;
    workflow["206"]["inputs"]["image"] = image1Path;
    workflow["207"]["inputs"]["image"] = image2Path;

    // Submit Workflow
    const promptResponse = await queuePrompt(workflow);
    const promptId = promptResponse.prompt_id;

    console.log(`Workflow submitted with Prompt ID: ${promptId}`);
    eventEmitter.emit("progress", { message: `Workflow submitted with Prompt ID: ${promptId}` });

    // WebSocket Connection for Real-Time Progress
    const ws = new WebSocket(`${SERVER_ADDRESS.replace("http", "ws")}/ws?clientId=${CLIENT_ID}`);

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "progress" && data.data.prompt_id === promptId) {
                const progress = ((data.data.value / data.data.max) * 100).toFixed(2);
                console.log(`Generation progress: ${progress}%`);
                eventEmitter.emit("progress", { progress: `${progress}%` });
            }

            if (data.type === "executing" && data.data.node === null) {
                console.log("Workflow execution completed.");
                eventEmitter.emit("complete", { message: "Workflow execution completed." });

                // Fetch generated image
                const history = await getHistory(promptId);
                let finalImageData = null;

                for (const nodeId in history[promptId].outputs) {
                    if (history[promptId].outputs[nodeId].images) {
                        for (const image of history[promptId].outputs[nodeId].images) {
                            const imageData = await getImage(image.filename, image.subfolder, image.type);
                            const encodedImage = base64.fromByteArray(new Uint8Array(imageData));
                            finalImageData = `data:image/png;base64,${encodedImage}`;
                            console.log("Image encoded in Base64.");
                        }
                    }
                }

                if (finalImageData) {
                    eventEmitter.emit("image", { image: finalImageData });
                }

                ws.close();
            }
        } catch (error) {
            console.error("Error processing WebSocket message:", error);
        }
    });

    return promptId;
}

module.exports = { startWorkflow };
