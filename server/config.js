const AWS = require('aws-sdk');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const ENV = process.env.NODE_ENV || 'production'; // Change to `production` for production builds | development

// AWS Secrets Manager Client
const secretsClient = new SecretsManagerClient({
  region: 'ap-south-1',
});

// Configuration object to store initialized secrets and AWS configurations
let config = {};



// Fetch secrets from AWS Secrets Manager
async function fetchAptosSecrets() {
  const secretName = 'flashback-prod-aptos-secrets'; // Replace with your actual secret name
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
      })
    );

    const secrets = JSON.parse(response.SecretString); // Parse the JSON string
    return {
      senderMobileNumber: secrets.APTOS_SENDER_MOBILE_NUMBER,
      aptosNodeUrl: secrets.APTOS_NODE_URL,
      senderAddress: secrets.SENDER_ADDRESS,
      senderPrivateKey: secrets.SENDER_PRIVATE_KEY,
      recipientAddress: secrets.RECIPIENT_ADDRESS,
    };
  } catch (error) {
    console.error('Error retrieving Aptos secrets:', error);
    throw error;
  }
}

async function fetchWhatsappSecrets() {
  const secretName = 'flashback-prod-whatsapp-secrets'; // Replace with your actual secret name
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
      })
    );

    const secrets = JSON.parse(response.SecretString);
    return {
      WHATSAPP_ACCESS_TOKEN: secrets.WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: secrets.WHATSAPP_PHONE_NUMBER_ID,
    };
  } catch (error) {
    console.error('Error retrieving WhatsApp secrets:', error);
    throw error;
  }
}

async function fetchAWSSecrets() {
  const secretName = 'flashback-prod-aws-secrets'; // Replace with your actual secret name
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
      })
    );

    const secrets = JSON.parse(response.SecretString);
    return {
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
    };
  } catch (error) {
    console.error('Error retrieving AWS secrets:', error);
    throw error;
  }
}
async function fetchKMSSecrets() {
  const secretName = "flashback-prod-kms-secrets";
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
      })
    );

    const secrets = JSON.parse(response.SecretString);
    return {
      KMS_KEY_ID: secrets.AWS_KMS_ACCESS_KEY_ID , // Fetching the KMS Key ID
    };
  } catch (error) {
    console.error("Error retrieving AWS KMS secrets:", error);
    throw error;
  }
}

// Function to initialize the app with secrets and AWS SDK configuration
async function initializeConfig() {
  try {
    // Fetch all secrets
    const aptosConfig = await fetchAptosSecrets();
    const whatsappConfig = await fetchWhatsappSecrets();
    const awsCredentials = await fetchAWSSecrets();
    const kmsConfig = await fetchKMSSecrets();

    // Configure AWS SDK with credentials and region
    AWS.config.update({
      region: 'ap-south-1',
      credentials: {
        accessKeyId: awsCredentials.accessKeyId,
        secretAccessKey: awsCredentials.secretAccessKey,
      },
    });

    // Initialize DynamoDB DocumentClient
    const docClient = new AWS.DynamoDB.DocumentClient();

     // Initialize S3 Client
     const s3 = new AWS.S3({
      region: 'ap-south-1',
    });
    const kms = new AWS.KMS({ region: "ap-south-1" });


    // Populate the configuration object
    config = {
      AWS,
      awsCredentials,
      whatsapp: whatsappConfig,
      aptosConfig,
      docClient,
      s3,
      kms,
      KMS_KEY_ID: kmsConfig.KMS_KEY_ID
    };

    console.log('Configuration initialized successfully.');
    return config;
  } catch (error) {
    console.error('Failed to initialize configuration:', error);
    throw error;
  }
}

// Function to retrieve the loaded configuration
function getConfig() {
  if (Object.keys(config).length === 0) {
    throw new Error('Config not loaded. Please load the config first.');
  }
  return config;
}

// Export the functions to be used in other parts of the app
module.exports = {
  initializeConfig,
  getConfig,
  ENV,
};
