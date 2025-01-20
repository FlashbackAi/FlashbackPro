const logger = require('../../logger');
const relationsService = require('../Service/RelationsService');

exports.createRelationRequest = async (req, res) => {
    const { senderPhoneNumber, receiverPhoneNumber, senderUserId, receiverUserId } = req.body;
  
    try {
      if (!senderPhoneNumber || !receiverPhoneNumber || !senderUserId || !receiverUserId) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const createdRequest = await relationsService.createRequest(senderPhoneNumber, receiverPhoneNumber, senderUserId, receiverUserId);
  
      res.status(201).json({
        message: "Relation request created successfully.",
        request: createdRequest,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create relation request.", error: error.message });
    }
  };
  
  exports.updateRelationRequestStatus = async (req, res) => {
    const { requestId, status } = req.body;
  
    try {
      if (!requestId || !status) {
        return res.status(400).json({ message: "Missing required fields." });
      }
  
      const timestamp = new Date().toISOString();
      const updatedRequest = await relationsService.updateRequestStatus(requestId, status, timestamp);
  
      res.status(200).json({
        message: "Relation request status updated successfully.",
        updatedRequest,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update relation request status.", error: error.message });
    }
  };
  
  