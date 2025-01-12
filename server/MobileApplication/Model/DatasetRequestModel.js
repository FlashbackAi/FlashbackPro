const { getConfig } = require('../../config');
const logger = require('../../logger');

const docClient = getConfig().docClient;
const requestsTable = 'model_dataset_requests'; // Replace with your actual table name

exports.updateRequestStatusInDB = async (model_name, model_org_name, dataset_name, dataset_org_name, status) => {
    const key = {
      model: `${model_name}-${model_org_name}`,
      dataset: `${dataset_name}-${dataset_org_name}`,
    };
  
    const params = {
      TableName: requestsTable,
      Key: key,
      UpdateExpression: "set #status = :status, #updated_date = :updated_date",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updated_date": "updated_date",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updated_date": new Date().toISOString(),
      },
      ReturnValues: "UPDATED_NEW",
    };
  
    try {
      const data = await docClient.update(params).promise();
      logger.info(`Successfully updated status for model: ${model_name}, dataset: ${dataset_name}`);
      return data.Attributes;
    } catch (error) {
      logger.error(`Failed to update status in DB for model: ${model_name}, dataset: ${dataset_name}`);
      throw error;
    }
  };

  exports.getRequestsByDataset = async (dataset) => {
    const params = {
      TableName: requestsTable,
      FilterExpression: "#datasetKey = :datasetValue",
      ExpressionAttributeNames: {
        "#datasetKey": "dataset"
      },
      ExpressionAttributeValues: {
        ":datasetValue": dataset
      }
    };
  
    const data = await docClient.scan(params).promise();
    return data.Items;
  };