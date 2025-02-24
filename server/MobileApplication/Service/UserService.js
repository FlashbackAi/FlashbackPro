const userModel = require('../Model/UserModel');
const globalToLocalUsermappingModel = require('../Model/GlobalToLocalUsermappingModel')
const logger = require('../../logger'); // Shared logger utility
const { getConfig } = require('../../config');
const https = require('https');
const axios = require('axios');

const crypto = require('crypto');
const { kms, KMS_KEY_ID } = getConfig();
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
  
  // 1) Convert the phone number into a 'collectionName' (e.g., removing '+' character)
  const collectionName = user_phone_number.replace('+', '');

  // 2) Fetch user details from your DB
  const userDetails = await userModel.getUser(user_phone_number);
  if (!userDetails) {
    // If there's no user at all, return null or handle the situation
    return null;
  }

  // 3) Check if a global_to_local_user_mapping record exists for (userDetails.user_id, collectionName)
  let userMapping = await globalToLocalUsermappingModel.getMappingByGlobalUserAndCollection(
    userDetails.user_id,
    collectionName
  );

  // 4) If a mapping exists, overwrite userDetails.user_id with the mapping's global_user_id
  if (userMapping) {
    logger.info(`Mapping found: Overwriting user_id with global_user_id = ${userMapping.global_user_id}`);
    const globalUserId = userDetails.user_id
    userDetails.user_id = userMapping.local_user_id;
    userDetails.global_user_id = globalUserId;
  } else {
    logger.info('No mapping found; returning userDetails as-is.');
  }

  // 5) Return the final userDetails object (modified if a mapping was found)
  return userDetails;
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

// Generate a Data Encryption Key (DEK) using AWS KMS
async function generateKmsKey() {
  const response = await kms.generateDataKey({
      KeyId: KMS_KEY_ID,
      KeySpec: "AES_256",
  }).promise();

  return { encryptedKey: response.CiphertextBlob, plainKey: response.Plaintext };
}


// Encrypt Image Using AES-256-CBC
async function encryptImage(buffer) {
  const { encryptedKey, plainKey } = await generateKmsKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", plainKey, iv);

  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { encryptedData: encrypted, iv, encryptedKey };
}


exports.uploadUserPortrait = async (fileBuffer, username) => {
  const bucketName = 'flashbackmobileappuserthumbnails';
  const sanitizedUsername = username.startsWith('+') ? username.slice(1) : username;
  const fileName = `${sanitizedUsername}.jpg`;
  const { encryptedData, iv, encryptedKey } = await encryptImage(fileBuffer);
  // Step 1: Upload image to S3
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: encryptedData,
    Metadata: {
      iv: iv.toString("base64"),
      encryptedKey: encryptedKey.toString("base64"),
      encryption: "AES-256-CBC"
    },
    ContentType: 'image/jpeg',
  };

  logger.info(`Uploading image for sanitized username: ${sanitizedUsername} to S3`);
  const uploadResult = await s3.upload(uploadParams).promise();
  const s3Url = uploadResult.Location;
  logger.info(`Image uploaded successfully. S3 URL: ${s3Url}`);

  // Step 2: Call external API to generate user_id
  logger.info(`Calling external API to generate user_id for image URL: ${s3Url}`);
  //const externalApiUrl = 'https://127.0.0.1:8000/generate-user-Id-byUserImage/';
  const externalApiUrl = 'https://52.66.187.182:3000/generate-user-Id-byUserImage/';
  let userId;

  try {
    const response = await axios.post(
      externalApiUrl,
      { image_url: s3Url },
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        httpsAgent: httpsAgent, // Pass the custom HTTPS agent here
      }
    );
    if (response.data && response.data.user_id) {
      logger.info(response.data);
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
  await userModel.updateUser(username, {
    user_id: userId,
    potrait_s3_url: s3Url,
  });

  return { s3Url, user_id: userId };
};


// Helper Functions (external API calls, Rekognition, event handling)
async function searchUsersByImage(s3Url, username) {
  // Implement Rekognition search logic
}
