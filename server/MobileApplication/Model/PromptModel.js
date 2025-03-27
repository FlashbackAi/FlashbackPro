const AWS = require('aws-sdk');
const logger = require('../../logger');
const { getConfig } = require('../../config');

const docClient = getConfig().docClient;

exports.getRelationPrompts = async (relation, gender) => {
    try {
        // Validate inputs
        if (!relation || !gender) {
            throw new Error('Relation and gender are required parameters');
        }

        // Normalize inputs to lowercase to ensure consistent querying
        // const normalizedRelation = relation.toLowerCase();
        // const normalizedGender = gender.toLowerCase();

        // Define query parameters for DynamoDB
        const params = {
            TableName: 'genAI_prompts',
            IndexName: 'relation-related_gender-index',
            KeyConditionExpression: '#rel = :relation and #gen = :gender',
            ExpressionAttributeNames: {
                '#rel': 'relation',
                '#gen': 'related_gender'
            },
            ExpressionAttributeValues: {
                ':relation': relation,
                ':gender': "male"
            }
        };

        // Query DynamoDB
        const result = await docClient.query(params).promise();

        if (!result.Items || result.Items.length === 0) {
            // Fallback to default prompts if no specific prompts found
            logger.warn(`No prompts found for relation: ${relation}, gender: ${gender}. Using defaults.`);
            //return getDefaultPrompts(normalizedRelation);
            return;
        }

        // Extract prompts from query results
        return result.Items[0].prompts;
    } catch (error) {
        logger.error('Error in getRelationPrompts:', error);
        throw new Error(`Failed to fetch relation prompts: ${error.message}`);
    }
};