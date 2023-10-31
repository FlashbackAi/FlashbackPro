AWS.config.region = 'ap-south-1'; // e.g. us-east-1

AWSCognito.config.region = 'us-east-1';

var poolData = {
    UserPoolId : 'us-east-1_3hQRAxInV',
    ClientId : '786408425710'
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
