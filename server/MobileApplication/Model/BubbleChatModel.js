const { getConfig } = require('../../config');
const logger = require('../../logger');

const docClient = getConfig().docClient;
const dynamoDB = getConfig().dynamoDB;

const chatsTable = 'bubbleChats';
const messagesTable = 'Messages';
const indexedDataTable = 'machinevision_indexed_data';
const globalToLocalUserMappingTable = 'global_to_local_user_mapping';

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

exports.updateChatCustomName = async (chatId, userIdentifier, customName) => {
  try {
    // Step 1: Try to initialize customNames if it doesn't exist
    const initParams = {
      TableName: chatsTable,
      Key: { chat_id: chatId },
      UpdateExpression: 'SET customNames = :value',
      ExpressionAttributeValues: {
        ':value': { [userIdentifier]: customName.trim() }, 
      },
      ConditionExpression: 'attribute_not_exists(customNames)',
      ReturnValues: 'UPDATED_NEW',
    };

    try {
      const result = await docClient.update(initParams).promise();
      logger.info(`Initialized customNames for chat ${chatId}, user ${userIdentifier} to ${customName}`);
      return result.Attributes;
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        // Step 2: customNames exists, update the specific user's entry
        const updateParams = {
          TableName: chatsTable,
          Key: { chat_id: chatId },
          UpdateExpression: 'SET customNames.#user = :customName',
          ExpressionAttributeNames: {
            '#user': userIdentifier,
          },
          ExpressionAttributeValues: {
            ':customName': customName.trim(),
          },
          ReturnValues: 'UPDATED_NEW',
        };
        const result = await docClient.update(updateParams).promise();
        return result.Attributes;
      }
      throw error; // Rethrow other errors
    }
  } catch (error) {
    logger.error(`Error updating customName for chat ${chatId}:`, error);
    throw error;
  }
};

exports.getSenderMapping = async (globalUserId, folderName) => {
  try {
    const params = {
      TableName: globalToLocalUserMappingTable,
      Key: {
        global_user_id: globalUserId,
        folder_name: folderName,
      },
    };

    logger.info(`Querying sender mapping for global_user_id: ${globalUserId}, folder_name: ${folderName}`);
    const result = await docClient.get(params).promise();
    return result.Item;
  } catch (error) {
    logger.error('Error querying sender mapping:', error);
    throw error;
  }
};

exports.getMemoriesByUserFolder = async (userId, folderName) => {
  try {
    const params = {
      TableName: indexedDataTable,
      IndexName: 'user_id-folder_name-index',
      KeyConditionExpression: '#user_id = :user_id AND #folder_name = :folder_name',
      ExpressionAttributeNames: {
        '#user_id': 'user_id',
        '#folder_name': 'folder_name',
      },
      ExpressionAttributeValues: {
        ':user_id': userId,
        ':folder_name': folderName,
      },
    };

    logger.info(`Querying memories for user_id: ${userId}, folder_name: ${folderName}`);
    const result = await docClient.query(params).promise();
    return result.Items || [];
  } catch (error) {
    logger.error('Error querying memories:', error);
    throw error;
  }
};


exports.markMessageAsRead = async (params) => {
  return await dynamoDB.updateItem(params).promise();
};

exports.storeMessage = async (params) => {
  return await dynamoDB.putItem(params).promise();
};

exports.updateChatLastMessage = async (params) => {
  return await dynamoDB.updateItem(params).promise();
};

exports.getMessagesByChatId = async (params) => {
  try {
    logger.info(`Executing DynamoDB query with params:`, params);
    const result = await dynamoDB.query(params).promise();
    logger.info(`DynamoDB query result for chatId: ${params.ExpressionAttributeValues[':chatId'].S}:`, result);
    return result;
  } catch (error) {
    logger.error(`Error executing DynamoDB query for chatId: ${params.ExpressionAttributeValues[':chatId'].S}:`, error);
    throw error;
  }
};

exports.updateChat = async (chatId, timestamp, messageId) => {
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

exports.createChat = async (chatId, participants, timestamp, messageId, senderName, senderPhone, recipientUsers,recipientUserIds) => {
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
    recipientUserIds:recipientUserIds
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
  
  