const userModel = require('../Model/UserModel');
const logger = require('../../logger'); // Shared logger utility
const { getConfig } = require('../../config');
const https = require('https');
const axios = require('axios');

// Create an HTTPS agent with rejectUnauthorized set to false
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Ignore self-signed certificate issues
});

const s3 = getConfig().s3;

exports.createUser = async (user_phone_number) => {
  logger.info(`Creating user: ${user_phone_number}`);

  // Check if user already exists
  const existingUser = await userModel.getUser(user_phone_number);
  if (existingUser && existingUser.potrait_s3_url) {
    logger.info(`User already exists: ${user_phone_number}`);
    return { message: 'User Already Exists', status: 'Exists' };
  }

  // Create a new user
  if (!existingUser) {
    await userModel.createUser(user_phone_number, 0); // reward_points default to 0
    logger.info(`Successfully created new user: ${user_phone_number}`);
  }

  return { message: 'User created successfully', status: 'created' };
};

exports.updateUser = async (user_phone_number, fieldsToUpdate) => {
  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new Error('No fields to update were provided');
  }

  logger.info(`Updating user: ${user_phone_number} with fields: ${JSON.stringify(fieldsToUpdate)}`);
  const updatedUser = await userModel.updateUser(user_phone_number, fieldsToUpdate);
  return updatedUser;
};

exports.getUserDetails = async (user_phone_number) => {
  logger.info(`Fetching user details for user_phone_number: ${user_phone_number}`);

  // Fetch user details from the database
  const userDetails = await userModel.getUser(user_phone_number);

  return userDetails; // Return the fetched user details
};

exports.verifyUserActivation = async (user_phone_number, activation_code) => {
  logger.info(`Verifying activation code for user_phone_number: ${user_phone_number}`);

  // Fetch activation details
  const record = await userModel.getUserActivationDetails(user_phone_number);

  // Check if record exists
  if (!record) {
    logger.warn(`No activation record found for user_phone_number: ${user_phone_number}`);
    return { status: false, message: 'Invalid user_phone_number or activation record not found' };
  }

  // Check if activation code has already been used
  if (record.activated_date) {
    logger.warn(`Activation code already used for user_phone_number: ${user_phone_number}`);
    return { status: false, message: 'Activation code expired' };
  }

  // Check if activation code matches
  if (record.activation_code === activation_code) {
    logger.info(`Activation code verified for user_phone_number: ${user_phone_number}`);

    // Update the activation date in the table
    await userModel.updateUserActivationDate(user_phone_number);

    return { status: true, message: 'Activation code verified successfully' };
  }

  // If activation code does not match
  logger.warn(`Invalid activation code for user_phone_number: ${user_phone_number}`);
  return { status: false, message: 'Invalid activation code' };
};


exports.uploadUserPortrait = async (fileBuffer, username) => {
  const bucketName = 'flashbackmobileappuserthumbnails';
  const sanitizedUsername = username.startsWith('+') ? username.slice(1) : username;
  const fileName = `${sanitizedUsername}.jpg`;

  // Step 1: Upload image to S3
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: 'image/jpeg',
  };

  logger.info(`Uploading image for sanitized username: ${sanitizedUsername} to S3`);
  const uploadResult = await s3.upload(uploadParams).promise();
  const s3Url = uploadResult.Location;
  logger.info(`Image uploaded successfully. S3 URL: ${s3Url}`);

  // Step 2: Call external API to generate user_id
  logger.info(`Calling external API to generate user_id for image URL: ${s3Url}`);
  const externalApiUrl = 'http://127.0.0.1:8000/generate-user-Id-byUserImage/';
  let userId;

  try {
    const response = await axios.post(externalApiUrl, { image_url: s3Url }, {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },{
      httpsAgent: httpsAgent, // Pass the custom HTTPS agent
    });

    if (response.data && response.data.user_id) {
      userId = response.data.user_id;
      logger.info(`Generated user_id: ${userId} for sanitized username: ${sanitizedUsername}`);
    } else {
      throw new Error('Failed to fetch user_id from external API');
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // If external API returns 400, propagate the message to the client
      logger.warn(`External API returned 400: ${error.response.data.message}`);
      throw new Error(error.response.data.message);
    } else {
      // Handle other errors
      logger.error(`Error calling external API: ${error.message}`);
      throw new Error('Failed to generate user_id from external service');
    }
  }

  // Step 3: Update user details in the database
  await userModel.updateUser(sanitizedUsername, {
    user_id: userId,
    potrait_s3_url: s3Url,
  });

  return { s3Url, user_id: userId };
};


// Helper Functions (external API calls, Rekognition, event handling)
async function searchUsersByImage(s3Url, username) {
  // Implement Rekognition search logic
}
