const bubbleChatModel = require('../Model/BubbleChatModel');
const globalToLocalUsermappingModel = require('../Model/GlobalToLocalUsermappingModel');
const userModel = require('../Model/UserModel')
const logger = require('../../logger');
const FCMService = require('./FCMService');

exports.createBubbleChat = async ({ senderId, recipientId, memoryUrl, senderName, senderPhone }) => {
  if (!senderId || !recipientId ) {
    throw new Error('Missing required fields');
  }

  const timestamp = new Date().toISOString();
  const messageId = require('crypto').randomBytes(16).toString('hex');

  const globalRecepientMapping =  await globalToLocalUsermappingModel.getMappingByLocalUserAndCollection(
    recipientId
    );
  
  let recipientUsers;
  let participants;
  if(!globalRecepientMapping){
    participants = [senderPhone, recipientId].sort().join('#');
    recipientUsers = [];
  }else{
    //const recipientUserDetails = await userModel.getUserObjectByUserId(GlobalRecepientMapping.global_user_id);
    participants = [senderPhone, globalRecepientMapping.user_phone_number].sort().join('#');
    recipientUsers = [globalRecepientMapping.user_phone_number];
  }
  const recipientUserIds = [recipientId]
  // Check for existing chat
  let chatId = await bubbleChatModel.getExistingChat(participants);

  let isNewChat = false;

  if (chatId) {
    // Update existing chat
    if (memoryUrl !== null) {
    await bubbleChatModel.updateChat(chatId, timestamp, messageId);
    }
  } else {
    // Create new chat
    isNewChat = true;
    chatId = require('crypto').randomBytes(16).toString('hex');
    
    await bubbleChatModel.createChat(chatId, participants, timestamp, messageId, senderName, senderPhone, recipientUsers,recipientUserIds);
  }


  if (memoryUrl !== null) {
  // Create message
  await bubbleChatModel.createMessage({
    messageId,
    chatId,
    senderId,
    recipientId,
    senderPhone,
    recipientUsers,
    memoryUrl,
    timestamp,
    senderName,
  });
  await FCMService.sendNotification(chatId, senderName, senderPhone, 'shared a flashback', recipientUsers);
  logger.info('Memory successfully shared');
} else {
  logger.info('Chat successfully created or retrieved without sending a message');
}
  return { chatId, messageId, isNewChat };
};


exports.updateChatCustomName = async (chatId, userIdentifier, customName) => {
  // Validate inputs
  if (!chatId || !userIdentifier || !customName) {
    throw new Error('chatId, userIdentifier, and customName are required');
  }

  // Update the custom name
  const updatedChat = await bubbleChatModel.updateChatCustomName(chatId, userIdentifier, customName);
  return updatedChat;
};


exports.getInChatMemories = async (userPhoneNumber, recipientId) => {
  try {
    const memories = await bubbleChatModel.getMemoriesByUserFolder(recipientId, userPhoneNumber);

    const memoryData = memories.map(memory => ({
      s3_url: memory.s3_url,
      image_name: memory.image_name,
      bounding_box: memory.bounding_box,
      faces_in_image: memory.faces_in_image,
      indexed_date: memory.indexed_date,
    }));

    logger.info(`Fetched ${memoryData.length} memories for user ${userPhoneNumber} and recipient ${recipientId}`);
    return memoryData;
  } catch (error) {
    logger.error('Error in getInChatMemories service:', error);
    throw error;
  }
};

exports.markAsRead = async (chatId, messageId) => {
  try {
    const params = {
      TableName: 'Messages',
      Key: {
        messageId: { S: messageId },
        chatId: { S: chatId },
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: 'read' }
      },
      ReturnValues: 'UPDATED_NEW'
    };

    const result = await bubbleChatModel.markMessageAsRead(params);

    logger.info(`Marked message ${messageId} as read for chat: ${chatId}`);
    return {
      messageId,
      chatId,
      status: 'read'
    };
  } catch (error) {
    logger.error('Error marking message as read:', error);
    throw error;
  }
};

exports.sendMessage = async (chatId, senderId, content, senderName, senderPhone, recipientUsers, recipientId, messageType, timestamp, status, replyTo) => {
  try {
    // Generate a unique message ID
    const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Store the message in the Messages table
    const messageParams = {
      TableName: 'Messages',
      Item: {
        messageId: { S: messageId },
        chatId: { S: chatId },
        senderId: { S: senderId },
        senderName: { S: senderName }, // Fetch or provide sender name dynamically
        senderPhone: { S: senderPhone }, // Fetch or provide sender phone dynamically
        messageType: { S: messageType },
        recipientId: {S: recipientId},
        recipientUsers: {L: recipientUsers.map(user => ({S: user}))},
        content: { S: content },
        timestamp: { S: timestamp },
        status: { S: status || 'sent' },
        ...(replyTo && {
          replyTo: {
            M: {
              messageId: { S: replyTo.messageId },
              content: { S: replyTo.content },
              type: { S: replyTo.type }
            }
          }
        })
      }
    };

    await bubbleChatModel.storeMessage(messageParams);

    // Update the bubbleChats table with the new last message
    const chatUpdateParams = {
      TableName: 'bubbleChats',
      Key: {
        chat_id: { S: chatId }
      },
      UpdateExpression: 'SET #lastMessageId = :lastMessageId, #lastMessageAt = :lastMessageAt',
      ExpressionAttributeNames: {
        '#lastMessageId': 'lastMessageId',
        '#lastMessageAt': 'lastMessageAt'
      },
      ExpressionAttributeValues: {
        ':lastMessageId': { S: messageId },
        ':lastMessageAt': { S: timestamp }
      },
      ReturnValues: 'UPDATED_NEW'
    };

    await bubbleChatModel.updateChatLastMessage(chatUpdateParams);

    await FCMService.sendNotification(chatId, senderName, senderPhone, content, recipientUsers);

    logger.info(`Sent message with ID ${messageId} for chat: ${chatId}`);
    return {
      messageId,
      chatId,
      senderId,
      content,
      timestamp,
      status
    };
  } catch (error) {
    logger.error('Error sending message:', error);
    throw error;
  }
};

exports.getChatMessages = async (chatId, lastMessageId) => {
  try {
    let params = {
      TableName: 'Messages',
      IndexName: 'chatId-index',
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': { S: String(chatId) } // Ensure chatId is a string
      },
      ScanIndexForward: false,
      Limit: 50
    };

    if (lastMessageId) {
      params.ExclusiveStartKey = { 
        messageId: { S: String(lastMessageId) }, // Ensure lastMessageId is a string
        chatId: { S: String(chatId) }
      };
    }

    logger.info(`Fetching messages for chatId: ${chatId} with params:`, params);
    const result = await bubbleChatModel.getMessagesByChatId(params);

    // Transform DynamoDB items to regular objects
    const messages = result.Items.map(item => ({
      messageId: item.messageId?.S,
      chatId: item.chatId?.S,
      senderId: item.senderId?.S,
      senderName: item.senderName?.S,
      senderPhone: item.senderPhone?.S,
      ...(item.recipientId && { recipientId: item.recipientId.S }),
      type: item.messageType?.S || 'text',
      content: item.content?.S,
      timestamp: item.timestamp?.S,
      status: item.status?.S || 'sent',
      flashbackId: item.flashbackId?.S,
      reactions: item.reactions?.M || {},
      ...(item.replyTo?.M && {
        replyTo: {
          messageId: item.replyTo.M.messageId?.S,
          content: item.replyTo.M.content?.S,
          type: item.replyTo.M.type?.S
        }
      })
    }))
    .filter(message => message.messageId && message.content)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    logger.info(`Fetched ${messages.length} messages for chat: ${chatId} with data:`, messages);
    return messages;
  } catch (error) {
    logger.error(`Error fetching messages for chatId: ${chatId}:`, error);
    throw error;
  }
};

exports.createGroupBubbleChat = async ({ senderId, memberIds, memoryUrl, senderName, senderPhone }) => {
    if (!senderId || !memberIds || !Array.isArray(memberIds) || !memoryUrl) {
      throw new Error('Missing required fields');
    }
  
    const timestamp = new Date().toISOString();
    const messageId = require('crypto').randomBytes(16).toString('hex');
    

    const memberPhones = await Promise.all(
      memberIds.map(async (memberId) => {
        const memberDetails = await userModel.getUserObjectByUserId(memberId);
        return memberDetails ? memberDetails.user_phone_number : memberId;
      })
    );
    const allMembers = [...new Set([senderPhone, ...memberPhones])];
    const participants = allMembers.sort().join('#');
  
    // Check for existing group chat
    let chatId = await bubbleChatModel.getExistingGroupChatByParticipants(participants);
  
    if (chatId) {
      // Update existing group chat
      await bubbleChatModel.updateGroupChat(chatId, { "lastMessageAt":timestamp, "lastMessageId":messageId});
    } else {
      // Create new group chat
      chatId = require('crypto').randomBytes(16).toString('hex');
      await bubbleChatModel.createGroupChat(chatId, participants, timestamp, messageId, senderName, senderPhone, allMembers);
    }
  
    // Create group message
    await bubbleChatModel.createGroupMessage({
      messageId,
      chatId,
      senderId,
      memoryUrl,
      timestamp,
      senderName,
      senderPhone,
      memberPhones
    });
  
    // Send notifications to all group members except the sender
    // const notificationPromises = memberIds
    //   .filter(memberId => memberId !== senderId)
    //   .map(memberId =>
    //     sendPushNotification(memberId, senderName, {
    //       title: 'New Memory in Group',
    //       body: `${senderName} shared a memory in the group`,
    //       data: {
    //         type: 'memory_share',
    //         chatId,
    //         messageId,
    //         senderId,
    //         memoryUrl,
    //         isGroup: true,
    //       },
    //     })
    //   );
  
    //await Promise.all(notificationPromises);
  
    logger.info('Memory successfully shared with group');
    return { chatId, messageId };
  };

exports.addMembersToGroup = async (chatId, newMembers) => {
    // Fetch group chat details
    const chat = await bubbleChatModel.getGroupChatById(chatId);
    if (!chat) {
      throw new Error('Group chat not found');
    }
  
    // Fetch phone numbers for new members
    // const newMemberPhones = await Promise.all(
    //   newMembers.map(async (memberId) => {
    //     const memberDetails = await userModel.getUserObjectByUserId(memberId);
    //     return memberDetails ? memberDetails.user_phone_number : memberId; // Use memberId if details are not found
    //   })
    // );
  
    // Combine existing and new members
    const updatedGroupMembers = [...new Set([...chat.groupMembers, ...newMembers])];
    
    // Generate participants string (sorted and unique)
    const participants = updatedGroupMembers.sort().join('#');
  
    // Update the group chat with new members and participants
    await bubbleChatModel.updateGroupChat(chatId, {
      groupMembers: updatedGroupMembers,
      participants,
    });
  
    return {
      chatId,
      groupMembers: updatedGroupMembers,
      participants,
    };
  };
  exports.removeMembersFromGroup = async (chatId, members) => {
    // Fetch group chat details
    const chat = await bubbleChatModel.getGroupChatById(chatId);
    if (!chat) {
      throw new Error('Group chat not found');
    }
  
    // Fetch phone numbers for new members
    // const newMemberPhones = await Promise.all(
    //   newMembers.map(async (memberId) => {
    //     const memberDetails = await userModel.getUserObjectByUserId(memberId);
    //     return memberDetails ? memberDetails.user_phone_number : memberId; // Use memberId if details are not found
    //   })
    // );
  
    // remove members from existing users
    const updatedGroupMembers = chat.groupMembers.filter(
      (member) => !members.includes(member)
    );
    
    // Generate participants string (sorted and unique)
    const participants = updatedGroupMembers.sort().join('#');
  
    // Update the group chat with new members and participants
    await bubbleChatModel.updateGroupChat(chatId, {
      groupMembers: updatedGroupMembers,
      participants,
    });
  
    return {
      chatId,
      groupMembers: updatedGroupMembers,
      participants,
    };
  };

  exports.deleteGroupChat = async (chatId) => {
    const chat = await bubbleChatModel.getGroupChatById(chatId);
    if (!chat) {
      throw new Error('Group chat not found');
    }
  
    await bubbleChatModel.deleteChat(chatId);
  };

exports.getChatsByUser = async (userPhoneNumber) => {
  try {
    const chats = [];
    let lastEvaluatedKey = null;

    do {
      const result = await bubbleChatModel.getChatsByParticipant(userPhoneNumber, lastEvaluatedKey);
      chats.push(...result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey; // Update for pagination
    } while (lastEvaluatedKey);

    logger.info(`Fetched ${chats.length} chats for user: ${userPhoneNumber}`);
    for (const chat of chats) {
      // Create a set of all possible phone numbers in this chat
      const allPhoneNumbers = new Set([
        ...(chat.recipientUsers || []),
        ...(chat.senderPhone ? [chat.senderPhone] : [])
      ]);

      // Remove the current user's phone number (if present)
      allPhoneNumbers.delete(userPhoneNumber);

      // Convert the Set back to an array
      const otherPhoneNumbers = Array.from(allPhoneNumbers);

      // 3. Fetch user details for these other phone numbers
      const otherUserDetails = await Promise.all(
        otherPhoneNumbers.map(async (phone) => {
          logger.info("fetching user details for user number :", phone)
          return userModel.getUser(phone);  // hypothetical function
        })
      );

    // Fetch secondary display picture for the recipientUserId (assuming 1-to-1 chat)
    const recipientUserId = chat.recipientUserIds?.[0]; // Get the first (and only) UUID
    let secondaryDisplayPictureUrl = null;
    if (recipientUserId) {
      secondaryDisplayPictureUrl = await userModel.getSecondaryDisplayPicture(recipientUserId);
    }

    // 4. Attach user details to the chat object
    if (otherUserDetails.length > 0) {
      // If there are registered user details, add secondarydisplaypictureurl to them
      chat.chatUserDetails = otherUserDetails.map((userDetail) => ({
        ...userDetail, // Spread existing user details
        secondarydisplaypictureurl: secondaryDisplayPictureUrl || null, // Add secondary picture
        customName: chat.customNames?.[userPhoneNumber] || null, //user-specific customName
      }));
    } else {
      // If no registered user details, create a minimal object with secondarydisplaypictureurl
      chat.chatUserDetails = [{
        secondarydisplaypictureurl: secondaryDisplayPictureUrl || null,
        customName: chat.customNames?.[userPhoneNumber] || null, // User-specific customName
      }];
    }
    }
    return chats;
  } catch (error) {
    logger.error('Error fetching chats by user:', error);
    throw error;
  }
};


exports.addAdminGroupMembers = async (chatId, newMembers) => {
  // Fetch group chat details
  const chat = await bubbleChatModel.getGroupChatById(chatId);
  if (!chat) {
    throw new Error('Group chat not found');
  }

  // Fetch phone numbers for new members
  // const newMemberPhones = await Promise.all(
  //   newMembers.map(async (memberId) => {
  //     const memberDetails = await userModel.getUserObjectByUserId(memberId);
  //     return memberDetails ? memberDetails.user_phone_number : memberId; // Use memberId if details are not found
  //   })
  // );

  // Combine existing and new members
  const updatedGroupAdmins = [...new Set([...chat.groupAdmins, ...newMembers])];


  // Update the group chat with new members and participants
  await bubbleChatModel.updateGroupChat(chatId, {
    groupAdmins: updatedGroupAdmins,
  });

  return {
    chatId,
    groupAdmins: updatedGroupAdmins
  };
};
exports.removeAdminGroupMembers = async (chatId, members) => {
  // Fetch group chat details
  const chat = await bubbleChatModel.getGroupChatById(chatId);
  if (!chat) {
    throw new Error('Group chat not found');
  }

  // Fetch phone numbers for new members
  // const newMemberPhones = await Promise.all(
  //   newMembers.map(async (memberId) => {
  //     const memberDetails = await userModel.getUserObjectByUserId(memberId);
  //     return memberDetails ? memberDetails.user_phone_number : memberId; // Use memberId if details are not found
  //   })
  // );

  // remove members from existing users
  const updatedGroupAdmins = chat.groupAdmins.filter(
    (member) => !members.includes(member)
  );
  

  // Update the group chat with new members and participants
  await bubbleChatModel.updateGroupChat(chatId, {
    groupAdmins: updatedGroupAdmins
  });

  return {
    chatId,
    groupAdmins: updatedGroupAdmins
  };
};
