const userService = require('../Service/UserService');
const OTPService = require('../Service/OTPService');
const logger = require('../../logger'); // Assuming shared utilities for logging

exports.createUser = async (req, res) => {
  const { user_phone_number} = req.body;
  try {
    const result = await userService.createUser(user_phone_number);
    res.status(result.status === 'created' ? 201 : 200).json(result);
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    res.status(500).json({ error: 'Error creating user' });
  }
};

exports.updateUser = async (req, res) => {
  const { user_phone_number, ...fieldsToUpdate } = req.body;

  if (!user_phone_number) {
    return res.status(400).json({ error: 'user_phone_number is required' });
  }

  try {
    const result = await userService.updateUser(user_phone_number, fieldsToUpdate);
    res.status(200).json({ message: 'User updated successfully', data: result });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.getUserLoginDetails = async (req, res) => {
  const { user_phone_number } = req.params;

  // Validate request
  if (!user_phone_number) {
    return res.status(400).json({ error: 'user_phone_number is required' });
  }

  try {
    const userDetails = await userService.getUserLoginDetails(user_phone_number);

    if (userDetails) {
      return res.status(200).json({ message: 'User details retrieved successfully', data: userDetails });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    logger.error(`Error fetching user details: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

exports.getUserDetails = async (req, res) => {
  const { user_phone_number } = req.params;
  logger.info(`successfully fetched user details for flashback mobile user: ${user_phone_number}`);

  // Validate request
  if (!user_phone_number) {
    return res.status(400).json({ error: 'user_phone_number is required' });
  }

  try {
    const userDetails = await userService.getUserDetails(user_phone_number);

    if (userDetails) {
      return res.status(200).json({ message: 'User details retrieved successfully', data: userDetails });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    logger.error(`Error fetching user details: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

exports.verifyUserActivation = async (req, res) => {
  const { user_phone_number, activation_code } = req.body;

  // Validate input
  if (!user_phone_number || !activation_code) {
    return res.status(400).json({ error: 'user_phone_number and activation_code are required' });
  }

  try {
    const result = await userService.verifyUserActivation(user_phone_number, activation_code);

    if (result.status) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(400).json({ error: result.message });
    }
  } catch (error) {
    logger.error(`Error verifying user activation: ${error.message}`);
    res.status(500).json({ error: 'Failed to verify user activation' });
  }
};

exports.uploadUserPortrait = async (req, res) => {
  const file = req.body.image; // Uploaded file
  const username = req.body.username;
  // Validate input
  if (!file || !username) {
    return res.status(400).json({ error: 'Image file and username are required' });
  }

  try {
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const result = await userService.uploadUserPortrait(imageBuffer, username);

    res.status(200).json({
      message: 'User portrait uploaded and processed successfully',
      data: result,
    });
  } catch (error) {
    logger.error(`Error uploading user portrait: ${error.message}`);
    res.status(500).json({ error: 'Failed to upload user portrait' });
  }
};



exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const message = await OTPService.generateAndSendOTP(phoneNumber);
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Error sending OTP', details: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp, login_platform } = req.body;

  try {
    const isValid = await OTPService.verifyOTP(phoneNumber, otp, login_platform);
    if (isValid) {
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(200).json({ success: false, error: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error verifying OTP', details: error.message });
  }
};


exports.getUserProfileStats = async (req, res) => {
  const { userPhoneNumber } = req.params;
  logger.info(`Fetching profile stats for user: ${userPhoneNumber}`);

  // Validate request
  if (!userPhoneNumber) {
    return res.status(400).json({ error: 'userPhoneNumber is required' });
  }

  try {
    const profileStats = await userService.getUserProfileStats(userPhoneNumber);
    return res.status(200).json({ 
      success: true, 
      message: 'Profile stats retrieved successfully', 
      data: profileStats 
    });
  } catch (error) {
    logger.error(`Error fetching profile stats: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch profile stats' });
  }
};


