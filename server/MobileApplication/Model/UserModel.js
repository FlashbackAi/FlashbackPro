const { getConfig } = require('../../config');
const tableNames = require('../tables'); // Import table names
const logger = require('../../logger')
const docClient = getConfig().docClient;

exports.getUser = async (user_phone_number) => {
  const params = {
    TableName: tableNames.userTableName, // Replace with your actual table name
    Key: { user_phone_number },
  };
  const result = await docClient.get(params).promise();
  return result.Item;
};


exports.getSecondaryDisplayPicture = async (userId) => {
  const faceParams = {
    TableName: tableNames.flashbackMobileRecognitionUserDataTableName,
    KeyConditionExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    const faceResult = await docClient.query(faceParams).promise();
    if (faceResult.Items?.length > 0) {
      let faceUrl = faceResult.Items[0]?.face_url;
      if (typeof faceUrl === 'string' && faceUrl.startsWith('s3://')) {
        const bucketAndKey = faceUrl.replace('s3://', '');
        const [bucket, ...keyParts] = bucketAndKey.split('/');
        faceUrl = `https://${bucket}.s3.ap-south-1.amazonaws.com/${keyParts.join('/')}`;
        return faceUrl;
      }
      return faceUrl; // Return raw URL if not an S3 URL
    }
    return null; // No secondary picture found
  } catch (error) {
    logger.error(`Error fetching secondary display picture for user_id: ${userId}`, error);
    return null; // Return null on error to avoid breaking the flow
  }
};

exports.createUser = async (user_phone_number, rewardPoints) => {
  const params = {
    TableName: tableNames.userTableName, // Replace with your actual table name
    Item: {
      user_phone_number,
      reward_points: rewardPoints,
      created_date: new Date().toISOString(),
      isUserActivated: false,
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


exports.updateUserActivationStatus = async (user_phone_number) => {
  const params = {
    TableName: tableNames.userTableName,
    Key: { user_phone_number },
    UpdateExpression: 'SET isUserActivated = :isActivated',
    ExpressionAttributeValues: {
      ':isActivated': true
    },
    ReturnValues: 'UPDATED_NEW'
  };

  const result = await docClient.update(params).promise();
  return result.Attributes;
};

exports.getUserObjectByUserId = async (userId)=>{
  try{
    logger.info("getting user info for userId : "+userId);
    params = {
      TableName: tableNames.userTableName,
      FilterExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };
    const result = await docClient.scan(params).promise();

    if (result.Items.length === 0) {
      logger.info("user details not found for userId: ",userId);
      // throw new Error("userId not found");
      return;
    }
    logger.info("user details fetched successfully");
    return result.Items[0];
  } catch (error) {
    console.error("Error getting user object:", error);
    throw error;
  }
}


exports.countFriendsByUserPhone = async (userPhoneNumber) => {
  const params = {
    TableName: tableNames.relationsTableName,
    KeyConditionExpression: 'user_phone_number = :phone',
    ExpressionAttributeValues: {
      ':phone': userPhoneNumber
    }
  };
  
  try {
    const result = await docClient.query(params).promise();
    return result.Items.length;
  } catch (error) {
    logger.error(`Error counting friends: ${error.message}`);
    return 0; // Return 0 on error instead of throwing to avoid breaking the entire request
  }
};


exports.countPhotosByFolderName = async (folderName) => {
  const params = {
    TableName: tableNames.machineVisionRecognitionTableName,
    IndexName: 'folder_name-index',
    KeyConditionExpression: 'folder_name = :folder',
    ExpressionAttributeValues: {
      ':folder': folderName
    }
  };
  
  try {
    const result = await docClient.query(params).promise();
    return result.Items.length;
  } catch (error) {
    logger.error(`Error counting photos: ${error.message}`);
    return 0;
  }
};



exports.countFacesByFolderName = async (folderName) => {
  const params = {
    TableName: tableNames.machineVisionIndexedDataTableName,
    IndexName: 'folder_name-index',
    KeyConditionExpression: 'folder_name = :folder',
    ExpressionAttributeValues: {
      ':folder': folderName
    }
  };
  
  try {
    const result = await docClient.query(params).promise();
    return result.Items.length;
  } catch (error) {
    logger.error(`Error counting faces: ${error.message}`);
    return 0;
  }
};