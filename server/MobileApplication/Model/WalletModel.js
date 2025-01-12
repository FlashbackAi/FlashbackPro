const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const logger = require('../../logger');

const walletDetailsTable = 'wallet_details';
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

  exports.getTransactionsByUserPhoneNumber = async (userPhoneNumber) => {
    const params = {
      TableName: walletTransactions,
      FilterExpression: '(from_mobile_number = :phone OR to_mobile_number = :phone) AND coin_type = :coinType',
      ExpressionAttributeValues: {
        ':phone': userPhoneNumber,
        ':coinType': 'Chewy', // Assuming 'Chewy' is a fixed coin type
      },
    };
  
    let items = [];
    let lastEvaluatedKey = null;
  
    try {
      // Fetching paginated data
      do {
        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }
  
        const data = await docClient.scan(params).promise();
        items = items.concat(data.Items);
        lastEvaluatedKey = data.LastEvaluatedKey;
      } while (lastEvaluatedKey);
  
      logger.info(`Fetched ${items.length} transactions for phone number: ${userPhoneNumber}`);
      return items;
    } catch (error) {
      logger.error('Error in transactionModel.getTransactionsByUserPhoneNumber:', error);
      throw error;
    }
  };
  

  
  
