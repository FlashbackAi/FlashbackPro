const { getConfig } = require('../../config');
const logger = require('../../logger');

const docClient = getConfig().docClient;

exports.storePermissionsInDB = async (permissionEntry) => {
    const params = {
        TableName: 'smart_contract_hash_details',
        Item: permissionEntry
    };

    try {
        await docClient.put(params).promise();
        logger.info(`Wallet info stored in DynamoDB for mobile number: ${permissionEntry.user_phone_number}`);
    } catch (error) {
        logger.error(`Error in storeWalletInDynamoDB: ${error.message}`);
        throw error;
    }
};