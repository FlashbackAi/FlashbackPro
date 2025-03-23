// resetTodayInteractions/index.js
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async () => {
  try {
    let lastEvaluatedKey = null;
    let totalUpdated = 0;

    do {
      const { Items, LastEvaluatedKey } = await docClient.scan({
        TableName: 'UserRelationships',
        ProjectionExpression: 'user_phone_number, related_user_id',
        ExclusiveStartKey: lastEvaluatedKey
      }).promise();

      for (const item of Items) {
        await docClient.update({
          TableName: 'UserRelationships',
          Key: {
            user_phone_number: item.user_phone_number,
            related_user_id: item.related_user_id
          },
          UpdateExpression: 'SET todayInteractions = :empty',
          ExpressionAttributeValues: { ':empty': [] }
        }).promise();
        totalUpdated++;
      }
      lastEvaluatedKey = LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log(`Reset todayInteractions for ${totalUpdated} user pairs`);
    return { status: 'success', updated: totalUpdated };
  } catch (error) {
    console.error(`Error resetting todayInteractions: ${error.message}`);
    throw error;
  }
};