const bubbleChatService = require('../Service/BubbleChatService');
const logger = require('../../logger');

exports.createBubbleChat = async (req, res) => {
    const { senderId, recipientId, memoryUrl, flashbackId, senderName, senderPhone } = req.body;
  
    try {
      const result = await bubbleChatService.createBubbleChat({
        senderId,
        recipientId,
        memoryUrl,
        flashbackId,
        senderName,
        senderPhone,
      });
  
      res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error sharing memory:', error);
      res.status(500).send({
        success: false,
        error: error.message,
      });
    }
  };


exports.createGroupBubbleChat = async (req, res) => {
  const { senderId, memberIds, memoryUrl, flashbackId, senderName, senderPhone } = req.body;

  try {
    const result = await bubbleChatService.createGroupBubbleChat({
      senderId,
      memberIds,
      memoryUrl,
      flashbackId,
      senderName,
      senderPhone,
    });

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error sharing memory to group:', error);
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.addGroupMembers = async (req, res) => {
  const { chatId, newMembers } = req.body;

  try {
    if (!chatId || !Array.isArray(newMembers) || newMembers.length === 0) {
      return res.status(400).json({ error: 'Chat ID and new members are required.' });
    }

    const updatedChat = await bubbleChatService.addMembersToGroup(chatId, newMembers);

    res.status(200).json({
      message: 'Members added successfully',
      chat: updatedChat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.removeGroupMembers = async (req, res) => {
  const { chatId, members } = req.body;

  try {
    if (!chatId || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Chat ID and new members are required.' });
    }

    const updatedChat = await bubbleChatService.removeMembersFromGroup(chatId, members);

    res.status(200).json({
      message: 'Members Removed successfully',
      chat: updatedChat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGroupChat = async (req, res) => {
  const { chatId } = req.body;

  try {
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required.' });
    }

    await bubbleChatService.deleteGroupChat(chatId);

    res.status(200).json({ message: 'Group chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChatsByUser = async (req, res) => {
  const { user_phone_number } = req.params;

  if (!user_phone_number) {
    return res.status(400).json({ error: 'user_phone_number is required' });
  }

  try {
    const chats = await bubbleChatService.getChatsByUser(user_phone_number);
    return res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    logger.error(`Error fetching chats for user: ${user_phone_number}`, error);
    return res.status(500).json({
      error: 'Error fetching chats',
      details: error.message,
    });
  }
};

exports.addAdminGroupMembers = async (req, res) => {
  const { chatId, newMembers } = req.body;

  try {
    if (!chatId || !Array.isArray(newMembers) || newMembers.length === 0) {
      return res.status(400).json({ error: 'Chat ID and new members are required.' });
    }

    const updatedChat = await bubbleChatService.addAdminGroupMembers(chatId, newMembers);

    res.status(200).json({
      message: 'Members added successfully',
      chat: updatedChat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeAdminGroupMembers = async (req, res) => {
  const { chatId, members } = req.body;

  try {
    if (!chatId || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Chat ID and new members are required.' });
    }

    const updatedChat = await bubbleChatService.removeAdminGroupMembers(chatId, members);

    res.status(200).json({
      message: 'Members Removed successfully',
      chat: updatedChat,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



