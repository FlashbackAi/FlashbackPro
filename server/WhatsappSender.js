const axios = require('axios');
const { initializeConfig, getConfig } = require('./config');
const logger = require('./logger');


class WhatsAppSender {
  constructor() {
    const config = getConfig();  // Get the loaded config
    this.accessToken = config.whatsapp.WHATSAPP_ACCESS_TOKEN;//config.whatsapp.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = config.whatsapp.WHATSAPP_PHONE_NUMBER_ID;//config.whatsapp.WHATSAPP_PHONE_NUMBER_ID;
    this.apiUrl = `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(recipientPhoneNumber, folderName,eventName, userId) {
    try {

      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: recipientPhoneNumber,
          type: 'template',
          template: {
            name: 'flashback_notification',
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: eventName.replace(/_/g, ' ') },
                  { type: 'text', text: folderName },
                  { type: 'text', text: userId }
                ]
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully delivered flashbacks to: ${recipientPhoneNumber} from the event: ${eventName.replace(/_/g, ' ').trim()}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to deliver flashbacks via WhatsApp: ', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async sendOTP(recipientPhoneNumber, otp) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: recipientPhoneNumber,
          type: 'template',
          template: {
            name: 'flashback_announcement',
            language: {
              code: 'en'
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      

      logger.info(`Successfully sent OTP to: ${recipientPhoneNumber}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to send OTP via WhatsApp:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  async sendRegistrationMessage(recipientPhoneNumber, eventName, orgName, PortfolioLink) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: recipientPhoneNumber,
          type: 'template',
          template: {
            name: 'registration_confirmation',
            language: {
              code: 'en_US'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: eventName },
                  { type: 'text', text: orgName }
                ]
              }
              ,{
                type: 'button',
                sub_type: 'url',
                index: 0,
                parameters: [
                  {
                    type: 'text',
                    text: PortfolioLink
                  }
                ]
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Successfully sent event registration acknowledgement to : ', recipientPhoneNumber,' for the event: ',eventName);
      return response.  data;
    } catch (error) {
      logger.error('Failed to send event registration acknowledgement via WhatsApp:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async sendEventReminder(recipientPhoneNumber, day, eventName, time, location, PortfolioLink) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: recipientPhoneNumber,
          type: 'template',
          template: {
            name: 'event_reminder',
            language: {
              code: 'en_US'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: day},
                  { type: 'text', text: eventName },
                  { type: 'text', text: time },
                  { type: 'text', text: location }
                ]
              }
              ,{
                type: 'button',
                sub_type: 'url',
                index: 0,
                parameters: [
                  {
                    type: 'text',
                    text: PortfolioLink
                  }
                ]
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully sent event reminder to: ${recipientPhoneNumber} for the event: ${eventName}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to send event reminder via WhatsApp: ', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async sendAnnouncementMessage(recipientPhoneNumber) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: recipientPhoneNumber,
          type: 'template',
          template: {
            name: 'flashback_announcement',
            language: {
              code: 'en'
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      

      logger.info('Successfully sent announcement: ', recipientPhoneNumber);
      return response.  data;
    } catch (error) {
      logger.error('Failed to send announcement via WhatsApp:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

module.exports = WhatsAppSender;