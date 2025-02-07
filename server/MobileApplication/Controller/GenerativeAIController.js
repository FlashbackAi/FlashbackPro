const generativeAIService = require("../Service/GenerativeAIService");
const logger = require("../../logger");

exports.processImagesProgress = async (req, res) => {
    logger.info("Client connected for SSE updates");

    try {
        // Validate Required Properties
        const { user_phone_number, prompt, s3_url_image1, s3_url_image2 } = req.body;
        if (!user_phone_number || !prompt || !s3_url_image1 || !s3_url_image2) {
            return res.status(400).json({ error: "Missing required fields: user_phone_number, prompt, s3_url_image1, s3_url_image2" });
        }

        // Set correct headers for SSE (Server-Sent Events)
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Call Service Layer
        await generativeAIService.processImagesProgress(user_phone_number, prompt, s3_url_image1, s3_url_image2, res);
    } catch (error) {
        logger.error(`Error in Controller: ${error.message}`);
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
        res.end();
    }
};
