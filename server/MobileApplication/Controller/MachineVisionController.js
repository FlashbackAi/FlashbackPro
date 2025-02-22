const machineVisionService = require('../Service/MachineVisionService');
const logger = require('../../logger');

exports.unMergeUser = async (req, res) => {
    const { face_id, existing_user_id, account_owner } = req.body;
    if (!face_id || !existing_user_id || !account_owner) {
      return res.status(400).json({
        error: 'face_id, existing_user_id, and account_owner are required'
      });
    }
  
    try {
      const result = await machineVisionService.unMergeUser({
        face_id,
        existing_user_id,
        account_owner,
      });
  
      res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error unMerging User:', error);
      res.status(500).send({
        success: false,
        error: error.message,
      });
    }
  };
