const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const logger = require('../../logger');

const walletDetailsTable = 'bsc_wallet_details';
const walletTransactions = 'wallet_transactions'

exports.checkWalletExists = async (mobileNumber) => {
    const params = {
        TableName: walletDetailsTable,
        Key: {
            user_phone_number: mobileNumber
        }
    };

    try {
        const result = await docClient.get(params).promise();
        return result.Item ? result.Item : null;
    } catch (error) {
        logger.error(`Error in checkWalletExists: ${error.message}`);
        throw error;
    }
};

exports.storeWalletInDynamoDB = async (mobileNumber, walletDetails) => {
    const params = {
        TableName: walletDetailsTable,
        Item: {
            user_phone_number: mobileNumber,
            wallet_address: walletDetails.walletAddress,
            public_key: walletDetails.publicKey,
            encrypted_private_key: walletDetails.encryptedPrivateKey,
            balance: walletDetails.balance,
            created_date: new Date().toISOString()
        }
    };

    try {
        await docClient.put(params).promise();
        logger.info(`Wallet info stored in DynamoDB for mobile number: ${mobileNumber}`);
    } catch (error) {
        logger.error(`Error in storeWalletInDynamoDB: ${error.message}`);
        throw error;
    }
};

exports.getWalletDetails = async (mobileNumber) => {

  logger.info(mobileNumber)
    // Define the DynamoDB query parameters
    const params = {
      TableName: walletDetailsTable,
      Key: {
        user_phone_number: mobileNumber
      }
    };
  
    try {
      const result = await docClient.get(params).promise();
      logger.info("Fetched wallet for mobile number:", mobileNumber);
  
      // If no wallet found, throw an error
      if (!result || !result.Item) {
        return;
      }
  
      // Return the wallet details
      return result.Item;
  
    } catch (error) {
      // Log the error and rethrow it
      logger.error(`Error fetching wallet for mobile number ${mobileNumber}: ${error.message}`);
      throw error;
    }
  };


  
  
