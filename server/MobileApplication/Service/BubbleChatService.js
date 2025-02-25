const bubbleChatModel = require('../Model/BubbleChatModel');
const globalToLocalUsermappingModel = require('../Model/GlobalToLocalUsermappingModel');
const userModel = require('../Model/UserModel')
const logger = require('../../logger');

exports.createBubbleChat = async ({ senderId, recipientId, memoryUrl, senderName, senderPhone }) => {
  if (!senderId || !recipientId || !memoryUrl) {
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
  }else{
    //const recipientUserDetails = await userModel.getUserObjectByUserId(GlobalRecepientMapping.global_user_id);
    participants = [senderPhone, globalRecepientMapping.user_phone_number].sort().join('#');
    recipientUsers = [globalRecepientMapping.user_phone_number];
  }
  // Check for existing chat
  let chatId = await bubbleChatModel.getExistingChat(participants);

  if (chatId) {
    // Update existing chat
    await bubbleChatModel.updateChat(chatId, timestamp, messageId);
  } else {
    // Create new chat
    chatId = require('crypto').randomBytes(16).toString('hex');
    
    await bubbleChatModel.createChat(chatId, participants, timestamp, messageId, senderName, senderPhone, recipientUsers);
  }

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

  // Send push notification
  // await sendPushNotification(recipientId, senderName, {
  //   title: 'New Memory Incoming',
  //   body: `${senderName} shared a memory with you`,
  //   data: {
  //     type: 'memory_share',
  //     chatId,
  //     messageId,
  //     senderId,
  //     memoryUrl,
  //   },
  // });

  logger.info('Memory successfully shared');
  return { chatId, messageId };
};

exports.markAsRead = async (chatId, userId, messageId) => {
  try {
    const params = {
      TableName: 'Messages',
      Key: {
        messageId: messageId,
        chatId: chatId
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
      userId,
      status: 'read'
    };
  } catch (error) {
    logger.error('Error marking message as read:', error);
    throw error;
  }
};

exports.sendMessage = async (chatId, senderId, content, type, timestamp, status, replyTo) => {
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
        senderName: { S: 'Sender Name' }, // Fetch or provide sender name dynamically
        senderPhone: { S: 'Sender Phone' }, // Fetch or provide sender phone dynamically
        type: { S: type },
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
      UpdateExpression: 'SET #lastMessageId = :lastMessageId, #lastMessageAt = :lastMessageAt, #senderName = :senderName, #senderPhone = :senderPhone',
      ExpressionAttributeNames: {
        '#lastMessageId': 'lastMessageId',
        '#lastMessageAt': 'lastMessageAt',
        '#senderName': 'senderName',
        '#senderPhone': 'senderPhone'
      },
      ExpressionAttributeValues: {
        ':lastMessageId': { S: messageId },
        ':lastMessageAt': { S: timestamp },
        ':senderName': { S: 'Sender Name' }, // Fetch or provide dynamically
        ':senderPhone': { S: 'Sender Phone' } // Fetch or provide dynamically
      },
      ReturnValues: 'UPDATED_NEW'
    };

    await bubbleChatModel.updateChatLastMessage(chatUpdateParams);

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
        ':chatId': chatId,
      },
      ScanIndexForward: false, // Sort in descending order (newest first)
      Limit: 50,
    };

    if (lastMessageId) {
      params.ExclusiveStartKey = { 
        messageId: lastMessageId,
        chatId: chatId
      };
    }

    const result = await bubbleChatModel.getMessagesByChatId(params);
    // Transform DynamoDB items to regular objects
    const messages = result.Items.map(item => ({
      messageId: item.messageId?.S,
      chatId: item.chatId?.S,
      senderId: item.senderId?.S,
      senderName: item.senderName?.S,
      senderPhone: item.senderPhone?.S,
      recipientId: item.recipientId?.S, // Include if exists
      type: item.messageType?.S,
      content: item.content?.S,
      timestamp: item.timestamp?.S,
      status: item.status?.S || 'sent',
      reactions: item.reactions?.M || {},
      replyTo: item.replyTo?.M && {
        messageId: item.replyTo.M.messageId?.S,
        content: item.replyTo.M.content?.S,
        type: item.replyTo.M.type?.S
      }
    }))
    .filter(message => message.messageId && message.content) // Filter malformed messages
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Ensure sorted by timestamp

    logger.info(`Fetched ${messages.length} messages for chat: ${chatId}`);
    return messages;
  } catch (error) {
    logger.error('Error fetching chat messages:', error);
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

      // 4. Attach user details to the chat object
      chat.chatUserDetails = otherUserDetails;
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
