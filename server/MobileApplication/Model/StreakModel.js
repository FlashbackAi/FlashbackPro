const { getConfig } = require('../../config');
const docClient = getConfig().docClient;
const tableNames = require('../tables');
const logger = require('../../logger');
class StreakModel {
  static async updateStreak(user_phone_number, related_user_id, interactionType) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Fetch the current item
      const { Item } = await docClient.get({
        TableName: tableNames.userRelationshipsTableName,
        Key: { user_phone_number, related_user_id }
      }).promise();

      const lastDate = Item?.lastInteractionDate || null;
      const newStreak = lastDate === today ? Item.currentStreak :
                       lastDate === yesterday ? (Item.currentStreak || 0) + 1 : 1;
      
      // Calculate new highestStreak in JavaScript
      const currentHighest = Item?.highestStreak || 0;
      const newHighest = newStreak > currentHighest ? newStreak : currentHighest;

      const params = {
        TableName: tableNames.userRelationshipsTableName,
        Key: { user_phone_number, related_user_id },
        UpdateExpression: `
          SET currentStreak = :newStreak,
              lastInteractionDate = :today,
              todayInteractions = list_append(if_not_exists(todayInteractions, :empty), :interaction),
              totalDaysInteracted = :newDays,
              highestStreak = :newHighest,
              totalMemoriesCreated = if_not_exists(totalMemoriesCreated, :zero) + :memCreated,
              totalMemoriesShared = if_not_exists(totalMemoriesShared, :zero) + :memShared
        `,
        ExpressionAttributeValues: {
          ':today': today,
          ':newStreak': newStreak,
          ':newHighest': newHighest, // Explicitly set the calculated value
          ':interaction': [interactionType],
          ':empty': [],
          ':zero': 0,
          ':newDays': lastDate === today ? Item?.totalDaysInteracted || 0 : (Item?.totalDaysInteracted || 0) + 1,
          ':memCreated': interactionType === 'memory_generated' ? 1 : 0,
          ':memShared': interactionType === 'memory_shared' ? 1 : 0
        }
      };

      await docClient.update(params).promise();
      logger.info(`Streak updated: ${user_phone_number} -> ${related_user_id}, type: ${interactionType}, streak: ${newStreak}, highest: ${newHighest}`);
      return { currentStreak: newStreak };
    } catch (error) {
      logger.error(`Error updating streak: ${error.message}`);
      throw error;
    }
  }

  static async getStreak(user_phone_number, related_user_id) {
    try {
      const { Item } = await docClient.get({
        TableName: tableNames.userRelationshipsTableName,
        Key: { user_phone_number, related_user_id }
      }).promise();
      return Item || {};
    } catch (error) {
      logger.error(`Error fetching streak: ${error.message}`);
      throw error;
    }
  }
}

module.exports = StreakModel;