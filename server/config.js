
const AWS = require('aws-sdk');
require('dotenv').config();
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
AWS.config.region = 'ap-south-1';

// Set the AWS SDK region
AWS.config.update({ 
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIA3F6QTNFWD5WYPIET',
        secretAccessKey: '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',
      },
    
});

const whatsapp = {
  WHATSAPP_ACCESS_TOKEN:'EAAfgEXyItdIBO1AvBNxloieHLC4mjAZCJSSmsXbrWOj9mdUMB7hMFqZAPPxMql7HiZCK3PE1MwMsYhZCsYlJZBVZCMEBNA1mqLF4vfAX5WVZAajHrCcibVuNbgQrFQpAHgZA9ZBd1ZBkl43eUUZBS31KX8GHO0DSEYfBZCJKRSKj5KZBq8wtF53YUYbVTpZBhoMrNRE10XJwZDZD',
  WHATSAPP_PHONE_NUMBER_ID:'421479604375270',
};

// Set up Amazon Cognito User Pool
const poolData = {
  UserPoolId: 'ap-south-1_rTy0HL6Gk',
  ClientId: '6goctqurrumilpurvtnh6s4fl1',
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const aptosConfig = {
  SENDER_MOBILE_NUMBER:'+919090401234',
  APTOS_NODE_URL: 'https://fullnode.mainnet.aptoslabs.com/v1',
  SENDER_ADDRESS: '0xad42dbc223a72cf73c5c653dafde255cab01d73103acf49988c7f2eb43f2dd08',
  SENDER_PRIVATE_KEY: '0X53632582437017e387f177fe158a35c0f7ac58a8a476a2d69f77650f3a54b644',//process.env.SENDER_PRIVATE_KEY, // Sender's private key
  RECIPIENT_ADDRESS: '1b8dab4f14b7f78399a456d7ad7d2e974838b6cd3f4b6c6757b8b375d9a3c7a5',//process.env.RECIPIENT_ADDRESS,   // Recipient's wallet address
  DEFAULT_AMOUNT: process.env.DEFAULT_AMOUNT || '1000000'
};
// const aptosConfig = {
//   APTOS_NODE_URL: 'https://fullnode.mainnet.aptoslabs.com/v1',
//   SENDER_ADDRESS: '0x1d1d422215ab4ea03df4203a55bac2c60cefdcda5e8db0f2464e35f38998c49c',//'0xad42dbc223a72cf73c5c653dafde255cab01d73103acf49988c7f2eb43f2dd08',
//   SENDER_PRIVATE_KEY: '0x6416fa7859abc9bf9b0e175fa246263240324c90f3bca424189e9d552408288c',//53632582437017e387f177fe158a35c0f7ac58a8a476a2d69f77650f3a54b644',//process.env.SENDER_PRIVATE_KEY, // Sender's private key
//   RECIPIENT_ADDRESS: '0xad42dbc223a72cf73c5c653dafde255cab01d73103acf49988c7f2eb43f2dd08',//'1b8dab4f14b7f78399a456d7ad7d2e974838b6cd3f4b6c6757b8b375d9a3c7a5',//process.env.RECIPIENT_ADDRESS,   // Recipient's wallet address
//   DEFAULT_AMOUNT: process.env.DEFAULT_AMOUNT || '1000000'
// };

module.exports = {
  AWS: AWS,
  AmazonCognitoIdentity: AmazonCognitoIdentity,
  userPool: userPool,
  poolData: poolData,
  whatsapp: whatsapp,
  aptosConfig:aptosConfig,
};

