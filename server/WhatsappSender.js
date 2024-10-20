const axios = require('axios');
const { initializeConfig, getConfig } = require('./config');


class WhatsAppSender {
  constructor() {
    const config = getConfig();  // Get the loaded config
    this.accessToken = config.whatsapp.WHATSAPP_ACCESS_TOKEN;//config.whatsapp.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = config.whatsapp.WHATSAPP_PHONE_NUMBER_ID;//config.whatsapp.WHATSAPP_PHONE_NUMBER_ID;
    this.apiUrl = `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(recipientPhoneNumber, eventName, userId) {
    try {
      const temp = eventName.split('_');
      const event = temp.slice(0, -2).join(' ');

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
                  { type: 'text', text: event.trim() },
                  { type: 'text', text: eventName },
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

      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
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
            name: 'authflash',
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: otp }
                ]
              },
              {
                type: 'button',
                sub_type: 'url',
                index: 0,
                parameters: [
                  {
                    type: 'text',
                    text: otp
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

      console.log('OTP sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending OTP via WhatsApp:', error.response ? error.response.data : error.message);
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

      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending Message via WhatsApp:', error.response ? error.response.data : error.message);
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

      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending Message via WhatsApp:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

module.exports = WhatsAppSender;