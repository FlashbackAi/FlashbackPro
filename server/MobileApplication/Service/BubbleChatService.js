const bubbleChatModel = require('../Model/BubbleChatModel');
const userModel = require('../Model/UserModel')
const logger = require('../../logger');

exports.createBubbleChat = async ({ senderId, recipientId, memoryUrl, flashbackId, senderName, senderPhone }) => {
  if (!senderId || !recipientId || !memoryUrl || !flashbackId) {
    throw new Error('Missing required fields');
  }

  const timestamp = new Date().toISOString();
  const messageId = require('crypto').randomBytes(16).toString('hex');
  const recipientUserDetails = await userModel.getUserObjectByUserId(recipientId);
  let recipientUsers;
  let participants;
  if(!recipientUserDetails){
    participants = [senderPhone, recipientId].sort().join('#');
  }else{
    participants = [senderPhone, recipientUserDetails.user_phone_number].sort().join('#');
    recipientUsers = [recipientUserDetails.user_phone_number];
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
    flashbackId,
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

exports.createGroupBubbleChat = async ({ senderId, memberIds, memoryUrl, flashbackId, senderName, senderPhone }) => {
    if (!senderId || !memberIds || !Array.isArray(memberIds) || !memoryUrl || !flashbackId) {
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
      flashbackId,
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
