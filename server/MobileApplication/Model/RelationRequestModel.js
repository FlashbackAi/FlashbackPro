const { getConfig } = require('../../config');
const logger = require('../../logger');

const docClient = getConfig().docClient;

RelatiosRequestTable = 'RelationRequests'

exports.createRelationRequest = async (request) => {
  const params = {
    TableName: RelatiosRequestTable,
    Item: request,
  };

  try {
    await docClient.put(params).promise();
    return request; // Return the created request for confirmation
  } catch (error) {
    throw new Error(`Failed to create relation request: ${error.message}`);
  }
};

exports.updateRelationRequest = async (request_id, updates) => {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
  
    for (const [key, value] of Object.entries(updates)) {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;
  
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value; // Directly assign the value
    }
  
    const params = {
      TableName: RelatiosRequestTable,
      Key: {
        request_id,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };
  
    try {
      const result = await docClient.update(params).promise();
      return result.Attributes; // Return updated attributes
    } catch (error) {
      throw new Error(`Failed to update relation request: ${error.message}`);
    }
  };
  