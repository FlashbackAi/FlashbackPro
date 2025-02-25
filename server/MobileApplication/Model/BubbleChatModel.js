const { getConfig } = require('../../config');
const logger = require('../../logger');

const docClient = getConfig().docClient;

const chatsTable = 'bubbleChats';
const messagesTable = 'Messages';

exports.getExistingChat = async (participants) => {
  const params = {
    TableName: chatsTable,
    IndexName: 'participants-index',
    KeyConditionExpression: 'participants = :participants',
    ExpressionAttributeValues: {
      ':participants': participants,
    },
  };

  const result = await docClient.query(params).promise();
  if (result.Items && result.Items.length > 0) {
    return result.Items[0].chat_id;
  }
  return null;
};


exports.markMessageAsRead = async (params) => {
  return await docClient.update(params).promise();
};

exports.storeMessage = async (params) => {
  return await docClient.put(params).promise();
};

exports.updateChatLastMessage = async (params) => {
  return await docClient.update(params).promise();
};


exports.getMessagesByChatId = async (params) => {
  return await docClient.query(params).promise();
};

exports.updateChat = async (chatId, timestamp, messageId) => {
  const params = {
    TableName: chatsTable,
    Key: {
      chat_id: chatId,
    },
    UpdateExpression: 'SET lastMessageAt = :timestamp, lastMessageId = :messageId',
    ExpressionAttributeValues: {
      ':timestamp': { S: timestamp },
      ':messageId': { S: messageId },
    },
  };

  await docClient.update(params).promise();
};

exports.createChat = async (chatId, participants, timestamp, messageId, senderName, senderPhone, recipientUsers) => {
  const chatItem = {
    chat_id:chatId,
    participants,
    isGroup: false,
    createdAt: timestamp,
    lastMessageAt: timestamp,
    lastMessageId: messageId,
    senderPhone,
    senderName,
    recipientUsers:recipientUsers,
  };

  const params = {
    TableName: chatsTable,
    Item: chatItem,
  };

  await docClient.put(params).promise();
  logger.info("Chat created Successfully")
};

exports.createMessage = async ({ messageId, chatId, senderId, recipientId, memoryUrl, timestamp, senderName, senderPhone, recipientUsers }) => {
  const messageItem = {
    messageId,
    chatId,
    senderId,
    recipientId,
    messageType: 'memory' ,
    content:  memoryUrl,
    timestamp,
    status: 'sent',
    senderPhone,
    senderName,
    recipientUsers:recipientUsers,
  };

  const params = {
    TableName: messagesTable,
    Item: messageItem,
  };

  await docClient.put(params).promise();
};

exports.getExistingGroupChatByParticipants = async (participants) => {
    const params = {
      TableName: chatsTable,
      IndexName: 'participants-index',
      KeyConditionExpression: 'participants = :participants',
      ExpressionAttributeValues: {
        ':participants': participants,
      },
    };
  
    const result = await docClient.query(params).promise();
    if (result.Items && result.Items.length > 0) {
      return result.Items[0].chat_id;
    }
    return null;
  };

  exports.getGroupChatById = async (chatId) => {
    const params = {
      TableName: chatsTable,
      KeyConditionExpression: 'chat_id = :chatId',
      ExpressionAttributeValues: {
        ':chatId': chatId,
      },
    };
  
    const result = await docClient.query(params).promise();
    if (result.Items && result.Items.length > 0) {
      return result.Items[0];
    }
    return null;
  };
  
  exports.updateGroupChat = async (chatId, timestamp, messageId) => {
    const params = {
      TableName: chatsTable,
      Key: {
        chat_id: chatId,
      },
      UpdateExpression: 'SET lastMessageAt = :timestamp, lastMessageId = :messageId',
      ExpressionAttributeValues: {
        ':timestamp': timestamp,
        ':messageId': messageId,
      },
    };
  
    await docClient.update(params).promise();
  };
  exports.updateGroupChat = async (chatId, updates) => {
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }
  
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
  
    // Dynamically construct UpdateExpression and attributes
    for (const [key, value] of Object.entries(updates)) {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;
  
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value; // Directly assign the value without type checking
    }
  
    const params = {
      TableName: chatsTable,
      Key: { chat_id: chatId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };
  
    try {
      const result = await docClient.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('Error updating group chat:', error);
      throw error;
    }
  };
  
  
  exports.createGroupChat = async (chatId, participants, timestamp, messageId, senderName, senderPhone, allMembers) => {
    const chatItem = {
      chat_id: chatId,
      participants,
      isGroup: true,
      createdAt: timestamp,
      lastMessageAt:timestamp,
      lastMessageId: messageId,
      senderPhone,
      senderName,
      groupMembers:allMembers,
      groupAdmins:[senderPhone]
    };
  
    const params = {
      TableName: chatsTable,
      Item: chatItem,
    };
  
    await docClient.put(params).promise();
  };
  
  exports.createGroupMessage = async ({ messageId, chatId, senderId, memoryUrl, timestamp, senderName, senderPhone, recipientUsers}) => {
    const messageItem = {
      messageId,
      chatId,
      senderId,
      messageType: 'memory',
      content: memoryUrl,
      timestamp,
      status: 'sent',
      senderPhone,
      senderName,
      recipientUsers
    };
  
    const params = {
      TableName: messagesTable,
      Item: messageItem,
    };
  
    await docClient.put(params).promise();
  };

  exports.updateParticipants = async (chatId, participants) => {
    const params = {
      TableName: 'Chats',
      Key: { chatId },
      UpdateExpression: 'SET participants = :participants',
      ExpressionAttributeValues: {
        ':participants': participants,
      },
    };
  
    await dynamoDB.update(params).promise();
  };


  exports.deleteChat = async (chat_id) => {
    const params = {
      TableName: chatsTable,
      Key: {'chat_id':chat_id},
    };
  
    await docClient.delete(params).promise();
  };

  exports.getChatsByParticipant = async (userPhoneNumber, lastEvaluatedKey) => {
    const params = {
      TableName: chatsTable,
      FilterExpression: 'contains(#participants, :userPhoneNumber)',
      ExpressionAttributeNames: {
        '#participants': 'participants',
      },
      ExpressionAttributeValues: {
        ':userPhoneNumber': userPhoneNumber,
      },
      ExclusiveStartKey: lastEvaluatedKey || undefined, // Continue pagination if key exists
    };
  
    return await docClient.scan(params).promise();
  };
  
  