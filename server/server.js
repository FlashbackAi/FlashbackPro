const express = require('express');
const winston = require('winston');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { AWS, AmazonCognitoIdentity, userPool } = require('./config');
const { CognitoUserPool, CognitoUserAttribute } = require('amazon-cognito-identity-js');
const archiver = require('archiver');

const { fold } = require('prelude-ls');

const app = express();
const port = 5000; // Different port to avoid conflicts with React's default port

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
const s3 = new AWS.S3({ // accessKey and SecretKey is being fetched from config.js
    region: 'ap-south-1' // Update with your AWS region 
});

const bucketName = 'flashbackuseruploads';

const poolData = {
  UserPoolId: 'ap-south-1_rTy0HL6Gk',
  ClientId: '6goctqurrumilpurvtnh6s4fl1',
};
// Setting up AWS DynamoDB
const dynamoDB = new AWS.DynamoDB({ region: 'ap-south-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'ap-south-1' });

//  2 tables one for user data and other which has the user uploads data
const userDataTableName = 'userData';
const userUploadsTableName = 'userUploads';

// Function that creates DynamoDB Tables
const createTable = async (tableName, KeySchema) => {
  const AttributeDefinitions = KeySchema.map(attr => ({
    AttributeName: attr.AttributeName,
    AttributeType: attr.AttributeType,
  }));

  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: KeySchema[0].AttributeName, KeyType: 'HASH' },
    ],
    AttributeDefinitions: AttributeDefinitions,
    BillingMode: 'PAY_PER_REQUEST',
  };    

  try {
    await dynamoDB.createTable(params).promise();
    logger.info(`Table ${tableName} created successfully. `);
    } catch (err) {
      if (err.code !== 'ResourceInUseException') {
        logger.error(`Error creating table ${tableName}: ${err.message}`);
      } else {
        logger.info(`Validated that Table ${tableName} already exists. Hence, continuing without creating new table`);
      }
    }
  };

  
const createTables = async () => {
  try {
    await createTable(userDataTableName, [
      {AttributeName: 'username', AttributeType: 'S', KeyType: 'HASH'},
    ]);

    await createTable(userUploadsTableName, [
      {AttributeName: 'imageId', AttributeType: 'S', KeyType: 'HASH'},
    ]);
  } catch (error){
    logger.error(`Error creating tables: ${error.message}`);
  }
  
};

// Calling createTables to create the tables at the start of the script, ignores if the tables already exists.
createTables();

// This  will be used to import the userId to create a record in the userUploads DDB by a respective user
const getUserIdByUsername = async (username) => {
  const params = {
    TableName: 'userData',
    Key: {
      username: username,
    },
  };

  try {
    logger.info(`Fetching user ID with params:`, params);
    const result = await docClient.get(params).promise();

    if (result.Item && result.Item.userId) {
      const userId = result.Item.userId;
      logger.info(`UserID fetched successfully: ${userId}`);
      return userId;
    } else {
      console.error(`User not found for username: ${username}`);
      throw new Error(`User not found for username: ${username}`);
    }
  } catch (error) {
    console.error(`Error fetching userId: ${error.message}`);
    throw new Error(`Error fetching userId: ${error.message}`);
  }
};

app.post('/signup', async function(req, res) {
  try {
    const Flash = 'Flash';
    // This will create a unique userId with format "Flash" as Prefix _"Username"_"randoom number" Eg: Flash_srialla_098
    const userId = `${Flash}_${req.body.username}_${Math.floor(Math.random() * 1000)}`; 
    const created_date = new Date().toISOString(); // Created date of the user registration
    const checkUserParams = {
      TableName: userDataTableName,
      Key: {
        username: req.body.username,
      },
    };

    // Check if the username already exists in DynamoDB
    const existingUser = await docClient.get(checkUserParams).promise();

    if (existingUser.Item) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    // DynamoDB params for user_data table
    const userDataParams = {
      TableName: userDataTableName,
      Item: {
        username: req.body.username,
        userId: userId,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        created_date: created_date,
        // referrerCode: req.body.referrerCode,
      },
    };
    
    await docClient.put(userDataParams).promise();
  var userPool = new CognitoUserPool(poolData);
  logger.info(req.body)
  const emailAttribute = new CognitoUserAttribute({
    Name: "email",
    Value: req.body.email
});

const phoneNumberAttribute = new CognitoUserAttribute({
    Name: "phone_number",
    Value: req.body.phoneNumber // Make sure this follows the E.164 format, e.g., '+12345678900'
});

  var attributeList = [];
  attributeList.push(emailAttribute);
  attributeList.push(phoneNumberAttribute);

  userPool.signUp(req.body.username, req.body.password, attributeList, null, function(err, result){
      if (err) {
          res.status(500).send(err.message);
          logger.info(err.message)
          return;
      }
      const data={
        status:'Success',
        message:'User registered successfully'
      }
      res.send(data);
  });
} catch (err) {
  logger.error(`Error creating user:`, err);
  res.status(500).send(err.message);
}
});


const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

app.post('/resend-verification', (req, res) => {  
  const params = {
    Username: req.body.username,
    ClientId: poolData.ClientId
  };
 // const params = poolData.add(username)

  cognitoidentityserviceprovider.resendConfirmationCode(params, function(err, data) {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    } else {
      res.send({ message: 'Verification code resent successfully' });
    }
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
          const accessToken = result.getAccessToken().getJwtToken();
          const decodedCAccessToken = result.getIdToken().decodePayload()
         
          // You can also get idToken and refreshToken here
          const data={
            status:'Success',
            message:'User LoggedIn successfully',
            accessToken:accessToken,
            username:decodedCAccessToken['cognito:username']

          }
          res.send(data);
      },
      onFailure: (err) => {
        logger.info(err.message)
          res.status(500).send(err.message);
      },
      mfaSetup: (challengeName, challengeParameters) => {
        // MFA setup logic here
        // You might want to send a response to the user indicating that MFA setup is required
        logger.info("usr logged in")
    },
  });
});


app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  const params = {
      ClientId: poolData.ClientId,
      Username: email,
  };

  cognitoidentityserviceprovider.forgotPassword(params, (err, data) => {
      if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error initiating password reset' });
      } else {
          res.json({ message: 'Password reset initiated, check your email' });
      }
  });
});

app.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;

  const params = {
      ClientId: poolData.ClientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
  };

  cognitoidentityserviceprovider.confirmForgotPassword(params, (err, data) => {
      if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error resetting password' });
      } else {
          res.json({ message: 'Password reset successfully' });
      }
  });
});


// app.post('/createFolder', (req, res) => {
    
//     const folderName = req.body.folderName;
  
//     const params = {
//       Bucket: bucketName,
//       Key: `${folderName}/`,
//       //ACL: 'public-read', // or whatever ACL you want
//     };
  
//     s3.putObject(params, (err, data) => {
//       if (err) {
//         console.error("Error creating the folder: ", err);
//         res.status(500).send("Error creating the folder");
//       } else {
//         res.send(`Folder ${folderName} created successfully`);
//       }
//     });
//   });


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

app.post('/upload/:folderName', upload.array('images', 100), async (req, res) => {
  try {
  const { folderName } = req.params;
  const username = req.body.username;
  logger.info(`Received upload request for folder ${folderName} from user ${username}`);
  
  const files = req.files;
  if (!files || files.length === 0) {

    return res.status(400).json({ message: 'No files uploaded' });
  }

  const userId = await getUserIdByUsername(req.body.username);
  logger.info(`Retrieved userId: ${userId}`);

  const uploadDate = new Date().toISOString();

  const uploadParams = files.map((file) => ({
    PutRequest: {
      Item: {
        imageId: `${folderName}/${encodeURIComponent(file.originalname)}`,
        s3_url: `https://${bucketName}.s3.amazonaws.com/${folderName}/${encodeURIComponent(file.originalname)}`,
        userId: userId,
        upload_date: uploadDate,
      },
    },
  }));
  logger.info(`uploadParams:`, uploadParams);
  // DynamoDB batchWrite params
  const dynamoParams = {
    RequestItems: {
      [userUploadsTableName]: uploadParams,
    },
  };

  
  // writing data to dynamoDB and uploading files to S3 Concurrently
  logger.info(`Writing to DynamoDB and uploading to s3 concurrently...`);
  try {
   const [dynamoResponse, s3UploadResponse] = await Promise.all([
      docClient.batchWrite(dynamoParams).promise(),
      Promise.all(files.map((file) => {
        const params = {
          Bucket: bucketName,
          Key: `${folderName}/${encodeURIComponent(file.originalname)}`,
          Body: file.buffer,
          //ACL: 'public-read',
    };
    logger.info("images uploaded succesfully in "+folderName)
    return s3.upload(params).promise();
  })),
]);

  logger.info(`DynamoDB response:`, dynamoResponse);
  
  if (dynamoResponse.UnprocessedItems && Object.keys(dynamoResponse.UnprocessedItems).length > 0) {
    logger.error(`Some items were not processed: ${JSON.stringify(dynamoResponse.UnprocessedItems)}`);
    res.status(500).json({ message: `Error Processing items in DynamoDB. ` });
  } else {
    // Continue with the existing S3 upload messages
    logger.info(`Files uploaded successfully. `);
    res.status(200).json({ message: 'Files uploaded successfully.' });
  }
} catch (error) {
  logger.error(`Error uploading files and updating DynamoDB: ${error.message}`);
  res.status(500).json({ message: `Error uploading files and updating DynamoDB ` });
}

// call the function to upload low-resolution images to S3
uploadLowResoltionImages(folderName,files);
  } catch (error) {
    logger.error(`Error uploading files and updating DynamoDB: ${error.message}`);
    res.status(500).json({ message: `Error uploading files and updating DynamoDB.` });
  }
});


app.get('/images/:folderName', async (req, res) => {
  try {
      const folderName = req.params.folderName;
      const params = { Bucket: bucketName, Prefix: folderName+"/lowRes" };
      const s3Response = await s3.listObjectsV2(params).promise();

      const imagesPromises = s3Response.Contents.map(async file => {
        try {
          const imageData = await s3.getObject({
              Bucket: bucketName,
              Key: file.Key
          }).promise();

          logger.info("Image fetched from cloud: " + file.Key);

          // Convert image data to base64
          const base64Image = `data:image/jpeg;base64,${imageData.Body.toString('base64')}`;
          return base64Image;
      } catch (err) {
          logger.error("Error fetching image: " + file.Key, err);
          return null; // Or handle the error as per your application's need
      }
    });
      const images = await Promise.all(imagesPromises);
      res.json(images);
  } catch (err) {
      console.error("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
  }
});



app.get('/folders', (req, res) => {
  s3.listObjectsV2({ Bucket: bucketName }, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    // Process data to extract folder names
    const folders = extractFolderNames(data.Contents);
    res.json(folders);
  });
});

function extractFolderNames(contents) {
  const folderSet = new Set();
  contents.forEach(item => {
    const folderName = item.Key.split('/')[0];
    folderSet.add(folderName);
  });
  return Array.from(folderSet);
}

app.get('/downloadFolder-old/:folderName', async (req, res) => {

  const localDownloadPath = '/Downloads/'
  const  folderName  = req.params.folderName;
  s3.listObjectsV2({ Bucket: bucketName, Prefix: folderName }, async (err, data) => {
    if (err) {
      logger.error("Error in listing S3 objects:", err);
      return res.status(500).send(err);
    }

    for (const item of data.Contents) {
      const fileKey = item.Key;
      const localFilePath = path.join(localDownloadPath, fileKey);

      // Create directory if it doesn't exist
      const dir = path.dirname(localFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Download and save file
      const params = { Bucket: bucketName, Key: fileKey };
      const fileStream = fs.createWriteStream(localFilePath);
      s3.getObject(params).createReadStream().pipe(fileStream);
      logger.info(`File downloaded: ${fileKey}`)
    }
    res.json(folderName);
  });
});


app.get('/downloadFolder/:folderName', async (req, res) => {

  const folderName = req.params.folderName;

  
  logger.info("downloading ZIP folder :"+folderName)

  s3.listObjectsV2({ Bucket: bucketName, Prefix: folderName }, async (err, data) => {
    if (err) {
      // Handle error
      return res.status(500).send(err);
    }

    const zip = archiver('zip', { zlib: { level: 9 } });
    zip.on('error', err => {
      // Handle errors
      res.status(500).send(err);
    });

    // Set the archive name
    res.attachment(`${folderName}.zip`);

    // Pipe archive data to the response
    zip.pipe(res);

    for (const item of data.Contents) {
      const fileKey = item.Key;
      
      // Stream files directly from S3 to the ZIP file
      const fileStream = s3.getObject({ Bucket: bucketName, Key: fileKey }).createReadStream();
      zip.append(fileStream, { name: path.basename(fileKey) });
    }

    // Finalize the archive
    zip.finalize();
  });
});

async function uploadLowResoltionImages(folderName,files)
{
  const uploadPromises = files.map(async (file) => {
    const buffer = await sharp(file.buffer)
      .resize(800) // Example: resize to a width of 800 pixels
      .jpeg({ quality: 50 }) // Convert to JPEG with 50% quality
      .toBuffer();
    // Upload the processed image to S3
    const params = {
      Bucket: bucketName,
      Key: `${folderName}/lowRes/${file.originalname}`,
      Body: buffer,
      ContentType: 'image/jpeg', // Assuming conversion to JPEG
    };
    logger.info("Low-resolution image uploaded successfully to " + folderName+"/lowRes");
    return await s3.upload(params).promise();
  });

  try {
    await Promise.all(uploadPromises);
    logger.info("All low resolution images uploaded successfully");
  } catch (err) {
    throw new Error(err);
  }

}



const PORT = process.env.PORT || 5000;
app.listen(PORT ,() => {
  logger.info(`Server started on https://localhost:${PORT}`);
});
