// models/globalToLocalUserMapping.js

const { getConfig } = require('../../config');
const tableNames = require('../tables'); // or wherever you store your table names
const logger = require('../../logger');

const docClient = getConfig().docClient;
const GLOBAL_TO_LOCAL_MAPPING_TABLE = 'global_to_local_user_mapping';
// Retrieve a specific record by (global_user_id, folder_name)
exports.getMappingByGlobalUserAndCollection = async (globalUserId, collectionName) => {
  try {
    logger.info(`Fetching mapping for global_user_id=${globalUserId} and folder_name=${collectionName}`);

    const params = {
      TableName: GLOBAL_TO_LOCAL_MAPPING_TABLE, // e.g. "global_to_local_user_mapping"
      Key: {
        global_user_id: globalUserId,   // Partition key (or primary key)
        folder_name: collectionName     // Sort key
      }
    };

    const result = await docClient.get(params).promise();
    return result.Item; // undefined if not found
  } catch (error) {
    logger.error('Error in getMappingByGlobalUserAndCollection:', error);
    throw error;
  }
};

exports.getMappingByLocalUserAndCollection = async (localUserId) => {
  try {
    logger.info(`Fetching mapping for global_user_id=${localUserId}`);

    const params = {
      TableName: GLOBAL_TO_LOCAL_MAPPING_TABLE,
      IndexName: 'local_user_id-index',
      KeyConditionExpression: 'local_user_id = :localUserId',
      ExpressionAttributeValues: {
        ':localUserId': localUserId
      }
    };

    const result = await docClient.query(params).promise();
    return (result.Items && result.Items.length > 0) ? result.Items[0] : undefined; // undefined if not found
  } catch (error) {
    logger.error('Error in getMappingByGlobalUserAndCollection:', error);
    throw error;
  }
};
