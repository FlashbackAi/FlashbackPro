const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const logger = require('../../logger');

const walletTransactions = 'wallet_transactions'



  exports.updateWalletTransaction = async  (transactionId, senderMobileNumber,recipientMobileNumber, fromAddress, toAddress, amount, transactionStatus, coinType) =>{
    const params = {
      TableName: walletTransactions,  // DynamoDB table name
      Item: {
        transaction_id: transactionId,  // Primary key: transaction ID provided by the SDK
        from_mobile_number: senderMobileNumber,
        to_mobile_number:recipientMobileNumber,
        from_address: fromAddress,      // From address (sender's wallet address)
        to_address: toAddress,          // To address (receiver's wallet address)
        amount: amount,                 // Amount of coins transferred
        coin_type: coinType,            // Type of coin being transferred (e.g., Aptos, ChewyCoin)
        status: transactionStatus,      // Status of the transaction (e.g., COMPLETED, FAILED)
        transaction_date: new Date().toISOString()  // Storing the transaction date
      }
    };
  
    try {
      // Insert the transaction details into the DynamoDB table
      await docClient.put(params).promise();
      logger.info(`Transaction with ID ${transactionId} successfully logged in wallet_transactions table`);
      return true;
    } catch (error) {
      logger.error(`Error updating transaction with ID ${transactionId}: ${error.message}`);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }
  
