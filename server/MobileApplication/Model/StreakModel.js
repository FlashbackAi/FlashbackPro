const { getConfig } = require('../../config');
const docClient = getConfig().docClient;
const tableNames = require('../tables');



class StreakModel {
    static async updateStreak(user_phone_number, related_user_id, interactionType) {
      const today = new Date().toISOString().split('T')[0]; // e.g., "2025-03-22"
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
      const { Item } = await docClient.get({
        TableName: tableNames.userRelationshipsTableName,
        Key: { user_phone_number, related_user_id }
      }).promise();
  
      const lastDate = Item?.lastInteractionDate || null;
      const newStreak = lastDate === today ? Item.currentStreak :
                       lastDate === yesterday ? (Item.currentStreak || 0) + 1 : 1;
  
      const params = {
        TableName: tableNames.userRelationshipsTableName,
        Key: { user_phone_number, related_user_id },
        UpdateExpression: `
          SET currentStreak = :newStreak,
              lastInteractionDate = :today,
              todayInteractions = list_append(if_not_exists(todayInteractions, :empty), :interaction),
              totalDaysInteracted = :newDays,
              highestStreak = if_not_exists(highestStreak, :zero) < :newStreak ? :newStreak : highestStreak,
              totalMemoriesCreated = if_not_exists(totalMemoriesCreated, :zero) + :memCreated,
              totalMemoriesShared = if_not_exists(totalMemoriesShared, :zero) + :memShared
        `,
        ExpressionAttributeValues: {
          ':today': today,
          ':newStreak': newStreak,
          ':interaction': [interactionType],
          ':empty': [],
          ':zero': 0,
          ':newDays': lastDate === today ? Item?.totalDaysInteracted || 0 : (Item?.totalDaysInteracted || 0) + 1,
          ':memCreated': interactionType === 'memory_generated' ? 1 : 0,
          ':memShared': interactionType === 'memory_shared' ? 1 : 0
        }
      };
  
      await docClient.update(params).promise();
      return { currentStreak: newStreak, lastInteractionDate: today };
    }
  
    static async getStreak(user_phone_number, related_user_id) {
      const { Item } = await docClient.get({
        TableName: TABLE_NAME,
        Key: { user_phone_number, related_user_id }
      }).promise();
      return Item || {};
    }
  }
  
  module.exports = StreakModel;