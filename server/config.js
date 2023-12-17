
const AWS = require('aws-sdk');
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

// Set up Amazon Cognito User Pool
const poolData = {
  UserPoolId: 'ap-south-1_rTy0HL6Gk',
  ClientId: '6goctqurrumilpurvtnh6s4fl1',
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

module.exports = {
  AWS: AWS,
  AmazonCognitoIdentity: AmazonCognitoIdentity,
  userPool: userPool,
  poolData: poolData,
};
