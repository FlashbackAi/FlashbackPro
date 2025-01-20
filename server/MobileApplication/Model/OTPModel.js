const AWS = require('aws-sdk');
const logger = require('../../logger');
const { getConfig } = require('../../config');
const tableNames = require('../tables'); // Import table names

const docClient = getConfig().docClient;


const userAuthenticationTable = 'UserAuthentication';
const userLoginHistoryTable = 'UserLoginHistory';

exports.saveOTP = async (phoneNumber, otp) => {
  const expirationTime = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now

  const params = {
    TableName: userAuthenticationTable,
    Item: {
      phoneNumber,
      otp,
      expirationTime: expirationTime.toISOString(),
    },
  };

  await docClient.put(params).promise();
};

exports.verifyOTP = async (phoneNumber, otp) => {
  const params = {
    TableName: userAuthenticationTable,
    Key: { phoneNumber },
  };

  const result = await docClient.get(params).promise();
  if (result.Item && result.Item.otp === otp) {
    const currentTime = new Date();
    const expirationTime = new Date(result.Item.expirationTime);

    if (currentTime <= expirationTime) {
      await this.deleteOTP(phoneNumber); // Remove OTP after successful verification
      return true;
    }
  }

  return false;
};

exports.deleteOTP = async (phoneNumber) => {
  const params = {
    TableName: userAuthenticationTable,
    Key: { phoneNumber },
  };

  await docClient.delete(params).promise();
};

exports.recordLoginHistory = async (phoneNumber, login_platform) => {
  const params = {
    TableName: userLoginHistoryTable,
    Item: {
      user_phone_number: phoneNumber,
      login_timestamp: new Date().toISOString(),
      login_type: 'Whatsapp_OTP',
      login_status: 'success',
      login_platform,
    },
  };

  try {
    await docClient.put(params).promise();
    logger.info(`Login history recorded for user ${phoneNumber}`);
  } catch (error) {
    logger.error(`Error recording login history for user ${phoneNumber}: ${error.message}`);
  }
};
