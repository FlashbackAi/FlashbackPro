const { getConfig } = require('../../config');
const logger = require('../../logger');

const docClient = getConfig().docClient;
const datasetTable = 'datasets'; // Replace with your actual table name

exports.saveDataset = async (item) => {
  try {
    const newItem = {
        'dataset_name': item.dataset_name,
        'org_name': item.org_name,
        // Add any other necessary fields here
      };
      
      logger.info(`Saving item with dataset_name: ${item.dataset_name} and org_name: ${item.org_name}`);
  
      // Iterate over the keys of the item to add them to the newItem object
      for (const key in item) {
        if (key !== 'dataset_name' && key !== 'org_name') {
          newItem[key] = item[key];
        }
      }
  
      const params = {
        TableName: datasetTable,
        Item: newItem
      };
  
      // Save the new item
      const data = await docClient.put(params).promise();
      logger.info(`Successfully saved item with dataset_name: ${item.dataset_name} and org_name: ${item.org_name}`);
      
    logger.info(`Saving item in DynamoDB with dataset_name: ${newItem.dataset_name}`);
    return data
  } catch (error) {
    logger.error(`Error in saving dataset to DynamoDB: ${error.message}`);
    throw error;
  }
};

exports.getDatasetDetails = async (orgName, datasetName) => {
    const params = {
      TableName: datasetTable,
      KeyConditionExpression: 'org_name = :orgName and dataset_name = :datasetName',
      ExpressionAttributeValues: {
        ':orgName': orgName,
        ':datasetName': datasetName,
      },
    };
  
    try {
      const result = await docClient.query(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error(`Error fetching dataset details from DynamoDB: ${error.message}`);
      throw error;
    }
  };
