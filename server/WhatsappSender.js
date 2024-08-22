const axios = require('axios');
const config = require('./config');

class WhatsAppSender {
  constructor() {
    this.accessToken = config.whatsapp.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = config.whatsapp.WHATSAPP_PHONE_NUMBER_ID;
    this.apiUrl = `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`;
  }

  async sendMessage(recipientPhoneNumber, eventName, userId) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: recipientPhoneNumber,
          type: 'template',
          template: {
            name: 'flashback_notificationv1',
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: eventName },
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
}

module.exports = WhatsAppSender;