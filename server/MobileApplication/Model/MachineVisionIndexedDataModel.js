// models/machineVisionIndexedDataModel.js

const { getConfig } = require('../../config');
const docClient = getConfig().docClient;
const TABLE_NAME = 'machinevision_indexed_data';

const logger = require("../../logger");

/**
 * Retrieve a single record by face_id + user_id.
 * 
 * Adjust the Key object below if your actual PK/SK differ.
 * 
 * For example, if your table uses (PK: face_id, SK: user_id) 
 * in the same item, you might use Key: { face_id, user_id }.
 * If your table uses only a single primary key, you’ll need
 * a different approach (e.g., a GSI).
 */
exports.getIndexedRecord = async ({ image_id, user_id }) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      image_id,
      user_id
    }
  };

  const result = await docClient.get(params).promise();
  return result.Item;
};

/**
 * Update the user_id to a new value in the same item.
 * This only works if face_id is the partition key,
 * and user_id is the sort key, so you may need to do a Delete + Put approach 
 * if your design requires changing a PK or SK.
 */
exports.updateIndexedRecordUserId = async ({image_id, face_id, oldUserId, newUserId }) => {
  // Example approach if user_id is the SORT KEY
  // Changing sort key in Dynamo typically requires re-writing the item 
  // since you can’t simply update the key. 
  // Below is a pseudo-sequence:
  //
  // 1) Read existing item
  // 2) Create new item with newUserId
  // 3) Delete old item
  // 
  // Or, if your design allows user_id to be just a top-level attribute 
  // and not the key, you can do a direct UpdateExpression.

  // 1) Get the existing item
  const existingItem = await this.getIndexedRecord({ image_id, user_id: oldUserId });
  if (!existingItem) {
    throw new Error('Record not found. Cannot update user_id.');
  }

  // 2) Put a new item with the same data, but updated user_id
  const newItem = {
    ...existingItem,
    user_id: newUserId // overwriting old userId
  };

  const putParams = {
    TableName: TABLE_NAME,
    Item: newItem
  };
  await docClient.put(putParams).promise();

  // 3) Delete the old item
  const deleteParams = {
    TableName: TABLE_NAME,
    Key: {
      image_id,
      user_id: oldUserId
    }
  };
  await docClient.delete(deleteParams).promise();

  return true;
};


exports.getUserImagesFromFolder = async ( user_id, folder_name) => {

  logger.info(`Received request to fetch images for user_id: ${user_id} in folder: ${folder_name}`);

  try {
      let records = [];
      let lastEvaluatedKey = null;

      do {
          // Define query parameters
          const params = {
              TableName: TABLE_NAME, // Replace with your DynamoDB table name
              IndexName: 'user_id-folder_name-index', // Replace with your GSI name
              KeyConditionExpression: 'folder_name = :folder_name AND user_id = :user_id',
              ExpressionAttributeValues: {
                  ':folder_name': folder_name,
                  ':user_id': user_id
              },
              ExclusiveStartKey: lastEvaluatedKey // Continue from the last evaluated key
          };

          // Query DynamoDB
          const result = await docClient.query(params).promise();

          logger.info(`Fetched ${result.Items.length} records for this page`);

          // Append the complete records to the array
          records = records.concat(result.Items);

          // Update LastEvaluatedKey
          lastEvaluatedKey = result.LastEvaluatedKey;

          if (lastEvaluatedKey) {
              logger.info(`LastEvaluatedKey found, continuing to the next page: ${JSON.stringify(lastEvaluatedKey)}`);
          }
      } while (lastEvaluatedKey); // Continue querying until LastEvaluatedKey is null

      logger.info(`Fetched a total of ${records.length} records for user_id: ${user_id} in folder: ${folder_name}`);

      // Respond with the complete records
      return records;
  } catch (err) {
      logger.error(`Error fetching images for user_id ${user_id} in folder ${folder_name}: ${err.message}`, { error: err });
      throw err;
  }
};