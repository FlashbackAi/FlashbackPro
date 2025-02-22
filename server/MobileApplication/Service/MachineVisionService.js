const axios = require('axios');
const { getIndexedRecord, updateIndexedRecordUserId } = require('../Model/MachineVisionIndexedDataModel');
const { getImageRecord, updateImageRecordUserIds } = require('../Model/MachineVisionImageRecognitionModel');

const logger = require('../../logger');

// Example external API URL
const EXTERNAL_API_URL = 'http://localhost:8000/unmerge_face';

exports.unMergeUser = async ({ face_id, existing_user_id, account_owner }) => {
  // 1. Call External API
  let externalApiRes;
  try {
    externalApiRes = await axios.post(EXTERNAL_API_URL, {
      face_id,
      collection_name:'test_prod'
    });
  } catch (err) {
    console.error('Failed to call external API:', err);
    throw new Error('External service call failed');
  }

  // 2. Check if the external API responded with an error
  if (externalApiRes.data.error) {
    throw new Error(externalApiRes.data.error);
  }

  // 3. Extract any relevant data
  // const { new_user_id, image_id } = externalApiRes.data;
  const { new_user_id } = externalApiRes.data;
  const image_id = 'e021db17-1c94-4b78-9a0b-0ec1e856ec98'
  if (!new_user_id || !image_id) {
    throw new Error('new_user_id or image_id missing from external API response');
  }

  // ================================================
  // 4. Update MachineVisionImageRecognition table
  //    Remove old existing_user_id from user_ids and add new_user_id
  // ================================================
  const imageRecord = await getImageRecord(image_id);
  if (!imageRecord) {
    throw new Error(`No record found in MachineVisionImageRecognition for image_id: ${image_id}`);
  }

  // Update the user_ids array
  let userIds = JSON.parse(imageRecord.user_ids) || [];
  // Remove the old ID
  userIds = userIds.filter((uid) => uid !== existing_user_id);
  // Add the new ID if it isn’t there already
  if (!userIds.includes(new_user_id)) {
    userIds.push(new_user_id);
  }

  // Perform the update in Dynamo
  await updateImageRecordUserIds(image_id, JSON.stringify(userIds));

  // ================================================
  // 5. Update MachineVisionIndexedData table
  //    Find the record by face_id + existing_user_id, then update user_id to new_user_id
  // ================================================
  const indexedRecord = await getIndexedRecord({ image_id, user_id: existing_user_id });
  if (!indexedRecord) {
    throw new Error('No indexed record found for the specified face_id and existing_user_id');
  }

  // Update the user_id to new_user_id
  await updateIndexedRecordUserId({ image_id, face_id, oldUserId: existing_user_id, newUserId: new_user_id });

  // Return the new user_id and image_id or any relevant info
  return {
    message: 'User un-merged successfully',
    new_user_id,
    image_id
  };
};


// const { storeGlobalToLocalMapping } = require('../models/globalLocalMappingModel');
// const { getUserDetalsByUserid } = require('./someLocalUserService'); 
// // Adjust import to where your getUserDetalsByUserid is located

// async function mapGlobalToLocalUser({ user_id, face_id, collection_name }) {
//   try {
//     // 1. External API call
//     const response = await axios.post('https://some-external-api.com/check', {
//       user_id,
//       face_id,
//       collection_name,
//     });

//     // 2. Check for matched_user_id
//     const { matched_user_id } = response.data;
//     if (!matched_user_id) {
//       console.log('No matched_user_id in external API response. Exiting...');
//       return { success: false, message: 'No matched_user_id returned.' };
//     }

//     // 3. Lookup local user details (phone, etc.)
//     const userDetails = await getUserDetalsByUserid(user_id);
//     if (!userDetails) {
//       console.warn(`No user details found for user_id: ${user_id}`);
//       return { success: false, message: 'No user details found.' };
//     }

//     const userPhoneNumber = userDetails.phone; // or however it’s structured

//     // 4. Prepare record for global_to_local_user_mapping table
//     const now = new Date().toISOString();
//     const itemToStore = {
//       globalUserId: matched_user_id,
//       localUserId: user_id,
//       faceId: face_id,
//       phoneNumber: userPhoneNumber,
//       createdAt: now,
//       collectionName: collection_name,
//     };

//     // 5. Use the model function to store this mapping
//     const savedItem = await storeGlobalToLocalMapping(itemToStore);

//     console.log('Successfully stored mapping in global_to_local_user_mapping');

//     return {
//       success: true,
//       data: savedItem
//     };
//   } catch (error) {
//     console.error('Error in mapGlobalToLocalUser:', error);
//     throw error;
//   }
// }

// module.exports = {
//   mapGlobalToLocalUser
// };

