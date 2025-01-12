// walletController.js
const walletService = require('../Service/WalletService');
const logger = require('../../logger');

// Create wallet for a user
exports.createWallet = async (req, res) => {
    const { mobileNumber } = req.body;

    try {
        const result = await walletService.handleWalletCreation(mobileNumber);
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

//get walletbalance
exports.getWalletBalance = async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    const result = await walletService.getWalletBalance(phoneNumber);

    if (!result) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    logger.info(`Successfully fetched wallet details for the user: ${phoneNumber}`);
    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Error fetching wallet balance', error: error.message });
  }
};

//get wallet transactions
exports.getTransactionsByUserPhoneNumber = async (req, res) => {
  const { userPhoneNumber } = req.params;

  if (!userPhoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const transactions = await walletService.fetchTransactionsByUserPhoneNumber(userPhoneNumber);
    logger.info(`Transactions successfully fetched for user phone number: ${userPhoneNumber}`);
    res.status(200).json(transactions);
  } catch (error) {
    logger.error(`Error fetching transactions for user phone number: ${userPhoneNumber}`, error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};


//API to transfer coins
exports.transferCoinsByNumber = async (req, res) => {
  try {
    const { amount, senderMobileNumber, recipientMobileNumber } = req.body;

    if (!amount || !senderMobileNumber || !recipientMobileNumber) {
      return res.status(400).json({ message: 'Amount, senderMobileNumber, and recipientMobileNumber are required' });
    }

    logger.info(`Transfer request received: amount = ${amount}, sender = ${senderMobileNumber}, recipient = ${recipientMobileNumber}`);

    const status = await walletService.transferCoinsByNumber(amount, senderMobileNumber, recipientMobileNumber);

    res.status(200).json({
      message: 'Chewy Coin transfer successful',
      status,
    });
  } catch (error) {
    logger.error(`Transfer failed: ${error}`);
    res.status(500).json({ error: 'Chewy Coin transfer failed', details: error.message });
  }
};

//API to transfer coins using the wallet address
exports.transferCoinsByWalletAddress = async (req, res) => {
  try {
    const { amount, senderMobileNumber, recipientAddress } = req.body;

    if (!amount || !senderMobileNumber || !recipientAddress) {
      return res.status(400).json({
        message: 'Amount, senderMobileNumber, and recipientAddress are required',
      });
    }

    logger.info(`Transfer request received: amount = ${amount}, sender = ${senderMobileNumber}, recipientAddress = ${recipientAddress}`);

    const status = await walletService.transferCoins(recipientAddress,amount, senderMobileNumber, '');

    res.status(200).json({
      message: 'Chewy Coin transfer successful',
      status,
    });
  } catch (error) {
    logger.error(`Transfer failed: ${error}`);
    res.status(500).json({
      error: 'Chewy Coin transfer failed',
      details: error.message,
    });
  }
};
