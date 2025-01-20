const OTPModel = require('../Model/OTPModel');
const WhatsAppSender = require('../../WhatsappSender');
const logger = require('../../logger');
const { getConfig } = require('../../config');

const config = getConfig();
const whatsappSender = new WhatsAppSender(
  config.whatsapp.WHATSAPP_ACCESS_TOKEN,
  config.whatsapp.WHATSAPP_PHONE_NUMBER_ID
);

exports.generateAndSendOTP = async (phoneNumber) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in the database
    await OTPModel.saveOTP(phoneNumber, otp);

    try {
      // Send OTP via WhatsApp
      await whatsappSender.sendOTP(phoneNumber, otp);
      return 'OTP sent successfully via WhatsApp';
    } catch (whatsappError) {
      logger.error('Error sending OTP via WhatsApp:', whatsappError);
      return 'OTP saved but failed to send via WhatsApp';
    }
  } catch (error) {
    logger.error('Error generating or sending OTP:', error);
    throw error;
  }
};

exports.verifyOTP = async (phoneNumber, otp, login_platform) => {
  try {
    const isValid = await OTPModel.verifyOTP(phoneNumber, otp);

    if (isValid) {
      logger.info(`User ${phoneNumber} successfully authenticated`);
      await OTPModel.recordLoginHistory(phoneNumber, login_platform);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error verifying OTP:', error);
    throw error;
  }
};
