const { getConfig } = require('../../config');
const tableNames = require('../tables'); // Import table names

const docClient = getConfig().docClient;

exports.getUser = async (user_phone_number) => {
  const params = {
    TableName: tableNames.userTableName, // Replace with your actual table name
    Key: { user_phone_number },
  };
  const result = await docClient.get(params).promise();
  return result.Item;
};

exports.createUser = async (user_phone_number, rewardPoints) => {
  const params = {
    TableName: tableNames.userTableName, // Replace with your actual table name
    Item: {
      user_phone_number,
      reward_points: rewardPoints,
      created_date: new Date().toISOString(),
    },
  };
  await docClient.put(params).promise();
};



exports.updateUser = async (user_phone_number, fieldsToUpdate) => {
  const params = {
    TableName: tableNames.userTableName,
    Key: { user_phone_number: user_phone_number }, // Ensure this matches your primary key
    UpdateExpression: '',
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: 'ALL_NEW', // Return the updated record
  };

  // Construct UpdateExpression
  let updateExpression = 'SET ';
  const attributeNames = params.ExpressionAttributeNames;
  const attributeValues = params.ExpressionAttributeValues;

  Object.keys(fieldsToUpdate).forEach((key, index) => {
    const attributeNameKey = `#field${index}`;
    const attributeValueKey = `:value${index}`;
    attributeNames[attributeNameKey] = key;
    attributeValues[attributeValueKey] = fieldsToUpdate[key];
    updateExpression += `${attributeNameKey} = ${attributeValueKey}, `;
  });

  params.UpdateExpression = updateExpression.slice(0, -2); // Remove trailing comma and space

  // Update the user in DynamoDB
  const result = await docClient.update(params).promise();
  return result.Attributes; // Return the updated attributes
};

exports.getUserActivationDetails = async (user_phone_number) => {
  const params = {
    TableName: tableNames.flashbackMobileActivationCodeTableName,
    Key: { user_phone_number }, // Primary key for the table
  };

  const result = await docClient.get(params).promise();
  return result.Item; // Return the activation details if found, otherwise undefined
};

exports.updateUserActivationDate = async (user_phone_number) => {
  const params = {
    TableName: tableNames.flashbackMobileActivationCodeTableName, // Ensure this table name is correct
    Key: { user_phone_number }, // Partition key
    UpdateExpression: 'SET activated_date = :activated_date',
    ExpressionAttributeValues: {
      ':activated_date': new Date().toISOString(),
    },
    ReturnValues: 'UPDATED_NEW', // Return the updated attributes
  };

  const result = await docClient.update(params).promise();
  return result.Attributes; // Return the updated record
};
