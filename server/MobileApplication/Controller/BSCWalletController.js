// walletController.js
const walletService = require('../Service/BSCWalletService');
const logger = require('../../logger');

// Create wallet for a user
exports.createWallet = async (req, res) => {
    const { mobileNumber } = req.body;

    try {
        const result = await walletService.handleBSCWalletCreation(mobileNumber)
        res.status(result.status).json(result);
    } catch (error) {
        logger.error(`Error in createWallet: ${error.message}`);
        res.status(500).json({ message: `Failed to create wallet: ${error.message}` });
    }
};
// get the wallet details 
exports.getWalletDetails = async (req, res) => {
  const { mobileNumber } = req.params;

  try {
    logger.info(`Received request to fetch wallet for mobile number: ${mobileNumber}`);
    
    // Call the service to fetch wallet details
    const walletDetails = await walletService.getWalletDetails(mobileNumber);
    
    // Return the wallet details if found
    res.status(200).json({
      message: 'Wallet found',
      walletDetails,
      status: 200,
    });
  } catch (error) {
    if (error.message === "Mobile number is required" || error.message === "Wallet not found") {
      return res.status(400).json({
        message: error.message,
        status: 400,
      });
    }

    logger.error(`Error in fetching wallet for mobile number ${mobileNumber}: ${error.message}`);
    res.status(500).json({
      message: 'Failed to fetch wallet',
      error: error.message,
      status: 500,
    });
  }
};


  //API to get the dataset requests
  exports.savePermissionsOnChain = async (req, res) => {
    const { userPhoneNumber } = req.body;
    try {
      const result = await walletService.savePermissionsOnChain(userPhoneNumber);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error writing permissions on chain', error: error.message });
    }
  };



