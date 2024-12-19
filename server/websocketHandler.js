// websocketHandler.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const logger = require('./logger');
const endpoint = 'wss://nh8j3qoqtb.execute-api.ap-south-1.amazonaws.com/production/';
const MemoryCarrierARN = 'arn:aws:sns:ap-south-1:768699754860:MemoryShareNotifier.fifo';

const WebSocket = new AWS.ApiGatewayManagementApi({
  endpoint: endpoint.replace('wss://', '')
});

// Main WebSocket handler
exports.handleWebSocketConnection = async (event) => {
  const { connectionId, routeKey } = event.requestContext;
  const user_id = event.queryStringParameters?.user_id;

  try {
    switch (routeKey) {
      case '$connect':
        await handleConnect(connectionId, user_id);
        break;

      case '$disconnect':
        await handleDisconnect(connectionId);
        break;

      case 'message':
        const messageData = JSON.parse(event.body);
        await handleMessage(connectionId, messageData);
        break;
    }

    return { statusCode: 200, body: 'Success' };
  } catch (err) {
    logger.error('WebSocket error:', err);
    return { statusCode: 500, body: err.message };
  }
};

// Connection handlers
async function handleConnect(connectionId, user_id) {
  if (!user_id) {
    throw new Error('user_id is required');
  }

  await dynamoDB.put({
    TableName: 'WebSocketConnections',
    Item: {
      connectionId,
      user_id,
      connectedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hour TTL
    }
  }).promise();
}

async function handleDisconnect(connectionId) {
  await dynamoDB.delete({
    TableName: 'WebSocketConnections',
    Key: { connectionId }
  }).promise();
}

async function handleMessage(connectionId, messageData) {
  const { type, recipientId, chatId, content } = messageData;

  switch (type) {
    case 'memory_share':
      await handleMemoryShare(messageData);
      break;
    case 'typing':
      await handleTypingStatus(connectionId, chatId);
      break;
    case 'read_receipt':
      await handleReadReceipt(messageData);
      break;
  }
}

// Message handlers
async function handleMemoryShare(data) {
  const { senderId, recipientId, memoryUrl, chatId } = data;
  
  // Get recipient's active connections
  const connections = await getActiveConnections(recipientId);
  
  // Send to all active connections of the recipient
  await Promise.all(connections.map(conn => 
    sendWebSocketMessage(conn.connectionId, {
      type: 'memory_share',
      senderId,
      memoryUrl,
      chatId,
      timestamp: new Date().toISOString()
    })
  ));
}

async function handleTypingStatus(connectionId, chatId) {
  const connection = await getConnectionDetails(connectionId);
  if (!connection) return;

  const chat = await getChatDetails(chatId);
  if (!chat) return;

  const otherParticipants = chat.participants
    .split('#')
    .filter(id => id !== connection.user_id);

  await broadcastToUsers(otherParticipants, {
    type: 'typing',
    chatId,
    user_id: connection.user_id
  });
}

async function handleReadReceipt(data) {
  const { chatId, messageId, user_id } = data;
  
  const chat = await getChatDetails(chatId);
  if (!chat) return;

  const otherParticipants = chat.participants
    .split('#')
    .filter(id => id !== user_id);

  await broadcastToUsers(otherParticipants, {
    type: 'read_receipt',
    chatId,
    messageId,
    user_id
  });
}

// Utility functions
async function getActiveConnections(user_id) {
  const result = await dynamoDB.query({
    TableName: 'WebSocketConnections',
    IndexName: 'user_id-index',
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': user_id
    }
  }).promise();
  
  return result.Items || [];
}

async function getConnectionDetails(connectionId) {
  const result = await dynamoDB.get({
    TableName: 'WebSocketConnections',
    Key: { connectionId }
  }).promise();

  return result.Item;
}

async function getChatDetails(chatId) {
  const result = await dynamoDB.get({
    TableName: 'Chats',
    Key: { chat_id: chatId }
  }).promise();

  return result.Item;
}

async function broadcastToUsers(userIds, message) {
  const connectionPromises = userIds.map(userId => getActiveConnections(userId));
  const connectionsArrays = await Promise.all(connectionPromises);
  const allConnections = connectionsArrays.flat();

  return Promise.all(
    allConnections.map(conn => sendWebSocketMessage(conn.connectionId, message))
  );
}

async function sendWebSocketMessage(connectionId, message) {
  try {
    await WebSocket.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message)
    }).promise();
  } catch (err) {
    if (err.statusCode === 410) {
      await handleDisconnect(connectionId);
    } else {
      throw err;
    }
  }
}

exports.MessageService = {
  broadcastMessage: async (message, recipients) => {
    await broadcastToUsers(recipients, message);
  },

  sendNotification: async (user_id, notification) => {
    const sns = new AWS.SNS();
    
    try {
      await sns.publish({
        TopicArn: MemoryCarrierARN,
        Message: JSON.stringify({
          user_id,
          notification
        }),
        MessageAttributes: {
          'type': {
            DataType: 'String',
            StringValue: 'chat_notification'
          }
        }
      }).promise();
    } catch (err) {
      logger.error('Push notification error:', err);
    }
  }
};

// // websocketHandler.js
// const AWS = require('aws-sdk');
// const dynamoDB = new AWS.DynamoDB.DocumentClient();
// const logger = require('./logger');
// const endpoint = 'wss://nh8j3qoqtb.execute-api.ap-south-1.amazonaws.com/production/';
// const MemoryCarrierARN = 'arn:aws:sns:ap-south-1:768699754860:MemoryShareNotifier.fifo;'

// exports.handleWebSocketConnection = async (event) => {
//   const { connectionId, routeKey } = event.requestContext;
//   const user_id = event.queryStringParameters?.user_id;

//   try {
//     switch (routeKey) {
//       case '$connect':
//         if (!user_id) {
//           return { statusCode: 400, body: 'user_id is required' };
//         }
        
//         await dynamoDB.put({
//           TableName: 'WebSocketConnections',
//           Item: {
//             connectionId,
//             user_id,
//             connectedAt: new Date().toISOString()
//           }
//         }).promise();
//         break;

//       case '$disconnect':
//         await dynamoDB.delete({
//           TableName: 'WebSocketConnections',
//           Key: { connectionId }
//         }).promise();
//         break;

//       case 'typing':
//         const { chatId } = JSON.parse(event.body);
//         await broadcastTypingStatus(chatId, user_id, connectionId);
//         break;
//     }

//     return { statusCode: 200, body: 'Success' };
//   } catch (err) {
//     logger.error('WebSocket error:', err);
//     return { statusCode: 500, body: err.message };
//   }
// };

// // Message Broadcasting Service
// exports.MessageService = {
//   async broadcastMessage(message, recipients) {
//     const api = new AWS.ApiGatewayManagementApi({
//       endpoint: endpoint
//     });

//     const broadcastPromises = recipients.map(async recipient_id => {
//       const connections = await getActiveConnections(recipient_id);
      
//       return Promise.all(connections.map(async connection => {
//         try {
//           await api.postToConnection({
//             ConnectionId: connection.connectionId,
//             Data: JSON.stringify(message)
//           }).promise();
//         } catch (err) {
//           if (err.statusCode === 410) {
//             await removeStaleConnection(connection.connectionId);
//           }
//         }
//       }));
//     });

//     await Promise.all(broadcastPromises);
//   },

//   async sendNotification(user_id, notification) {
//     // Integration with push notification service
//     const sns = new AWS.SNS();
    
//     try {
//       await sns.publish({
//         TopicArn: MemoryCarrierARN,
//         Message: JSON.stringify({
//           user_id,
//           notification
//         }),
//         MessageAttributes: {
//           'type': {
//             DataType: 'String',
//             StringValue: 'chat_notification'
//           }
//         }
//       }).promise();
//     } catch (err) {
//       logger.error('Push notification error:', err);
//     }
//   }
// };

// // ChatService for handling chat-specific operations
// exports.ChatService = {
//   async updateChatStatus(chatId, user_id, status) {
//     await dynamoDB.update({
//       TableName: 'ChatMembers',
//       Key: {
//         chatId,
//         user_id
//       },
//       UpdateExpression: 'SET lastSeenAt = :timestamp, status = :status',
//       ExpressionAttributeValues: {
//         ':timestamp': new Date().toISOString(),
//         ':status': status
//       }
//     }).promise();
//   },

//   async markMessagesAsRead(chatId, user_id, lastMessageId) {
//     await dynamoDB.update({
//       TableName: 'ChatMembers',
//       Key: {
//         chatId,
//         user_id
//       },
//       UpdateExpression: 'SET lastReadMessageId = :messageId, lastSeenAt = :timestamp',
//       ExpressionAttributeValues: {
//         ':messageId': lastMessageId,
//         ':timestamp': new Date().toISOString()
//       }
//     }).promise();

//     // Notify other participants
//     const chat = await this.getChatDetails(chatId);
//     const otherParticipants = chat.participants
//       .split('#')
//       .filter(id => id !== user_id);

//     await MessageService.broadcastMessage({
//       type: 'message_read',
//       chatId,
//       user_id,
//       lastMessageId
//     }, otherParticipants);
//   }
// };

// // Memory Sharing Service
// exports.MemoryService = {
//   async shareMemory(senderId, recipientId, memoryId) {
//     const timestamp = new Date().toISOString();
//     const messageId = require('crypto').randomBytes(16).toString('hex');

//     // Create or get existing chat
//     let chatId = await this.getOrCreateChat(senderId, recipientId);

//     // Save the memory share
//     await dynamoDB.put({
//       TableName: 'Messages',
//       Item: {
//         messageId,
//         chatId,
//         senderId,
//         recipientId,
//         type: 'memory',
//         content: memoryId,
//         timestamp,
//         status: 'sent',
//         reactions: {}
//       }
//     }).promise();

//     // Send real-time notification
//     await MessageService.broadcastMessage({
//       type: 'new_memory',
//       chatId,
//       messageId,
//       memoryId,
//       senderId
//     }, [recipientId]);

//     return messageId;
//   }
// };

// // Utility functions
// async function getActiveConnections(user_id) {
//   const result = await dynamoDB.query({
//     TableName: 'WebSocketConnections',
//     IndexName: 'user_id-index',
//     KeyConditionExpression: 'user_id = :user_id',
//     ExpressionAttributeValues: {
//       ':user_id': user_id
//     }
//   }).promise();
  
//   return result.Items;
// }

// async function removeStaleConnection(connectionId) {
//   await dynamoDB.delete({
//     TableName: 'WebSocketConnections',
//     Key: { connectionId }
//   }).promise();
// }

// async function broadcastTypingStatus(chatId, user_id, senderConnectionId) {
//   const chat = await ChatService.getChatDetails(chatId);
//   const otherParticipants = chat.participants
//     .split('#')
//     .filter(id => id !== user_id);

//   await MessageService.broadcastMessage({
//     type: 'typing',
//     chatId,
//     user_id
//   }, otherParticipants);
// }