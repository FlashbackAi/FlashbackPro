const express = require('express');
const winston = require('winston');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const { CognitoUserPool, CognitoUserAttribute } = require('amazon-cognito-identity-js');

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const app = express();
const PORT = process.env.PORT || 5000; // Different port to avoid conflicts with React's default port

app.use(cors()); // Allow cross-origin requests
app.use(express.json());

// Configuring winston application logger

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/application.log' })
   ]
 });

// Set up AWS S3
const s3 = new AWS.S3({ 
    accessKeyId: 'AKIA3F6QTNFWD5WYPIET', 
    secretAccessKey: '03c4tmEvBt2kWOBCh8H868bmVEtGrb5Glv+Usfff', 
    region: 'ap-south-1' // Update with your AWS region 
});
const bucketName = 'flashbackuseruploads';

const poolData = {
    UserPoolId: 'ap-south-1_rTy0HL6Gk',
    ClientId: '6goctqurrumilpurvtnh6s4fl1'
};
app.post('/signup', function(req, res) {
  var userPool = new CognitoUserPool(poolData);

  var attributeList = [];
  attributeList.push(new CognitoUserAttribute({Name:"email",Value:req.body.email}));

  userPool.signUp(req.body.username, req.body.password, attributeList, null, function(err, result){
      if (err) {
          res.status(500).send(err.message);
          return;
      }
      const data={
        status:'Success',
        message:'User registered successfully'
      }
      res.send(data);
  });
});



const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

app.post('/login', function(req, res) {
  
  const  username = req.body.username;
  const password = req.body.password;

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: username,
      Password: password
  });
  const userData = {
      Username: username,
      Pool: userPool
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        console.log(res)
          const accessToken = result.getAccessToken().getJwtToken();
         
          // You can also get idToken and refreshToken here
          const data={
            status:'Success',
            message:'User LoggedIn successfully',
            accessToken:accessToken,
            username:result.ge

          }
          res.send(data);
      },
      onFailure: (err) => {
        console.log(err.message);
          res.status(500).send(err.message);
      },
      mfaSetup: (challengeName, challengeParameters) => {
        // MFA setup logic here
        // You might want to send a response to the user indicating that MFA setup is required
        console.log("user logged in")
    },
  });
});

app.post('/confirmUser', function(req, res) {
  
  const  username = req.body.username;
  const confirmationCode = req.body.verificationCode;
  const userData = {
      Username: username,
      Pool: userPool
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
    if (err) {
        res.status(500).send(err.message);
    }
    else{
    const data={
      status:'Success',
      message:'User confirmed successfully',
      data:result
    }
    res.send(data);
  }
});
});

app.post('/createFolder', (req, res) => {
    
    const folderName = req.body.folderName;
  
    const params = {
      Bucket: bucketName,
      Key: `${folderName}/`,
      //ACL: 'public-read', // or whatever ACL you want
    };
  
    s3.putObject(params, (err, data) => {
      if (err) {
        console.error("Error creating the folder: ", err);
        res.status(500).send("Error creating the folder");
      } else {
        res.send(`Folder ${folderName} created successfully`);
      }
    });
  });


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

app.post('/upload/:folderName', upload.array('images', 10), (req, res) => {
  const { folderName } = req.params;
  const files = req.files;

  //console.log(req.files);
  if (!files || files.length === 0) {

    return res.status(400).json({ message: 'No files uploaded' });
  }

  const uploadPromises = files.map((file) => {
    const params = {
      Bucket: bucketName,
      Key: `${folderName}/${file.originalname}`,
      Body: file.buffer,
      //ACL: 'public-read',
    };

    return s3.upload(params).promise();
  });

  Promise.all(uploadPromises)
    .then(() => {
      res.status(200).json({ message: 'Files uploaded successfully.' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error uploading files to S3.' });
    });
})
app.get('/images/:folderName', async (req, res) => {

    try {
      const  folderName  = req.params.folderName;
      console.log(folderName);
      const params = {
      Bucket: bucketName,
      Prefix: folderName,
        // You can add a Prefix if you want to list images from a specific folder
      };
    
      const s3Response = await s3.listObjectsV2(params).promise();
      // const s3Response = await s3.listObjectsV2({
      //   Bucket: '${folderName}',
      // }).promise()
      console.log(s3Response);
      const images = s3Response.Contents.map((item) => {
        return `https://${params.Bucket}.s3.amazonaws.com/${item.Key}`;
      });
      console.log(images);
      res.json(images);
    } catch (err) {
      console.log("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
    }
});

function getPresignedUrl(bucketName, objectKey, expiryDuration) {
  const s3 = new AWS.S3();
  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Expires: expiryDuration // in seconds
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
}



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://0.0.0.0:${PORT}`);
});
