
const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const ENV = process.env.NODE_ENV || 'production';  // Change this to ```production``` for production build & ```development``` for local dev/test

// AWS Secrets Manager Client
const secretsClient = new SecretsManagerClient({
  region: 'ap-south-1',
});
let config = {}; 

async function fetchWhatsappSecrets() {
  const secretName = 'flashback-prod-whatsapp-secrets'; // Replace with your actual secret name

  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT', // Optional: Fetch the current version of the secret
      })
    );

    const secretString = response.SecretString;
    const secrets = JSON.parse(secretString); // Parse the JSON string to an object

    return {
        WHATSAPP_ACCESS_TOKEN: secrets.WHATSAPP_ACCESS_TOKEN,
        WHATSAPP_PHONE_NUMBER_ID: secrets.WHATSAPP_PHONE_NUMBER_ID,

    };
  } catch (error) {
    console.error('Error retrieving secrets from AWS Secrets Manager:', error);
    throw error;
  }
}
async function fetchAWSSecrets() {
  const secretName = 'flashback-prod-aws-secrets'; // Replace with your actual secret name

  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT', // Optional: Fetch the current version of the secret
      })
    );

    const secretString = response.SecretString;
    const secrets = JSON.parse(secretString); // Parse the JSON string to an object

    return {
        accessKeyId: secrets.AWS_ACCESS_KEY_ID,
        secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
      
    };
  } catch (error) {
    console.error('Error retrieving secrets from AWS Secrets Manager:', error);
    throw error;
  }
}

// Function to initialize the app with secrets
async function initializeConfig() {
  try {
    //const aptosConfig  = await fetchAptosSecrets();
    const whatsappConfig = await fetchWhatsappSecrets();
    const awsCredentials = await fetchAWSSecrets();

    console.log(whatsappConfig);
    // Set AWS SDK credentials using the retrieved secrets
    AWS.config.update({
      region: 'ap-south-1',
      credentials: awsCredentials,
    });

    config= {
      AWS: AWS,
      awsCredentials: awsCredentials,
      whatsapp: whatsappConfig
    };
    return config;
  } catch (error) {
    console.error('Failed to initialize configuration:', error);
    throw error;
  }
}

function getConfig() {
  if (Object.keys(config).length === 0) {
    throw new Error('Config not loaded. Please load the config first.');
  }
  return config;
}

// Export fetchSecrets and getConfig so they can be used in other parts of the app
module.exports = {
  initializeConfig,
  getConfig,
  ENV
};
