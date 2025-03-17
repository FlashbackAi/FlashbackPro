// FCMService.js
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const logger = require('../../logger'); // Assuming you have a logger
const tableNames = require('../tables');
const { getConfig } = require('../../config');


const config = getConfig();
const docClient = config.docClient;

// Initialize Firebase Admin SDK (we'll handle serviceAccountKey securely later)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(config.firebaseServiceAccount)),
  });
}

const messaging = getMessaging();
class FCMService {
  static async sendNotification(chatId, senderName, senderPhone, content, recipientUsers) {
    try {
      if (!recipientUsers || recipientUsers.length === 0) {
        logger.info('No registered recipientUsers found; skipping notification');
        return;
      }

      // Truncate content for notification body
      const notificationBody = content.length > 50 ? `${content.substring(0, 47)}...` : content;

      // Use senderPhone as fallback if senderName is null, undefined, or empty
      const displayName = senderName ? senderName.trim() : '';
      const notificationTitle = displayName || senderPhone;

      // Fetch FCM tokens for all recipientUsers
      const fcmTokens = [];
      for (const phoneNumber of recipientUsers) {
        const params = {
          TableName: tableNames.userTableName,
          Key: { user_phone_number: phoneNumber },
        };
        const user = await docClient.get(params).promise();
        if (user.Item?.fcmToken) {
          fcmTokens.push(user.Item.fcmToken);
        }
      }

      if (fcmTokens.length === 0) {
        logger.info('No FCM tokens found for recipients; skipping notification');
        return;
      }

      // Prepare multicast message
      const message = {
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
        data: { chatId }, // Custom data for navigation
        tokens: fcmTokens, // Multicast to multiple tokens
      };

      // Send notification
      const response = await messaging.sendEachForMulticast(message);
      logger.info(`Notifications sent successfully: ${response.successCount} succeeded, ${response.failureCount} failed`);

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            logger.error(`Failed to send to token ${fcmTokens[idx]}: ${resp.error.message}`);
          }
        });
      }
    } catch (error) {
      logger.error('Error sending FCM notification:', error);
      throw error;
    }
  }
}

module.exports = FCMService;