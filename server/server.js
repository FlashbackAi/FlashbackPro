const express = require('express');
const winston = require('winston');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { AWS, AmazonCognitoIdentity, userPool } = require('./config', 'aws-sdk');
const { CognitoUserPool, CognitoUserAttribute } = require('amazon-cognito-identity-js');
const archiver = require('archiver');
const https = require('https');
const { fold } = require('prelude-ls');
const { func } = require('prop-types');
const app = express();
const PORT = process.env.PORT || 5000;
const base64 = require('base64-js');
const { Readable } = require('stream');
const axios = require('axios');


app.use(cors()); // Allow cross-origin requests
app.use(express.json());

app.use(express.json());

// Configuring winston application logger

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/application.log' })
   ]
 });

 // *** Comment these certificates while testing changes in local developer machine. And, uncomment while pushing to mainline***
const privateKey = fs.readFileSync('/etc/letsencrypt/live/app.flashback.inc/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/app.flashback.inc/fullchain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate
}

// Set up AWS S3
const s3 = new AWS.S3({ // accessKey and SecretKey is being fetched from config.js
    region: 'ap-south-1' // Update with your AWS region 
});

const bucketName = 'flashbackuseruploads';
const userBucketName='flashbackuserthumbnails';
const indexBucketName = 'flashbackusercollection';
const imagesBucketName = 'flashbackusercollection';

const rekognition = new AWS.Rekognition({ region: 'ap-south-1' });


// Setting up AWS DynamoDB
const dynamoDB = new AWS.DynamoDB({ region: 'ap-south-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'ap-south-1' });

// Below are the tables we are using currently
const userrecordstable = 'users';
const userDataTableName = 'userData';
const userUploadsTableName = 'userUploads';
const userFoldersTableName = 'userFolders';
const userEventTableName='user_event_mapping';
const userOutputTable='user_outputs';
const eventsTable = 'events';
const indexedDataTableName = 'indexed_data'


const ClientId = '6goctqurrumilpurvtnh6s4fl1'
const cognito = new AWS.CognitoIdentityServiceProvider({region: 'ap-south-1'});



// This function is used to generate the unique random folder_id
const generateRandomId = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

app.post('/signup', async function(req, res) {
  try {
    const username = req.body.username.toLowerCase();
    const Flash = 'Flash';
    // This will create a unique userId with format "Flash" as Prefix _"Username"_"randoom number" Eg: Flash_srialla_098
    const referralId = `${Flash}_${username}_${Math.floor(Math.random() * 1000)}`; 
    const created_date = new Date().toISOString(); // Created date of the user registration
    const checkUserParams = {
      TableName: userDataTableName,
      Key: {
        user_name: username,
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
        user_name: username,
        referral_id: referralId,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        created_date: created_date,
        referrer_Code: req.body.referrerCode,
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
    ClientId: ClientId
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

// app.post('/request-otp', (req, res) => {
//   const phoneNumber = req.body.phoneNumber;
//   const password = generateRandomPassword(12); // Ensure this function exists and generates a secure password

//   const params = {
//       ClientId: ClientId,
//       Username: phoneNumber,
//       Password: password, // Password should meet the user pool policy
//       UserAttributes: [
//           {
//               Name: 'phone_number',
//               Value: phoneNumber
//           },
//       ]
//   };

//   // Sign up the user
//   cognito.signUp(params, (err, data) => {
//       if (err) {
//           console.log(err);
//           // Check if the error is because the user already exists
//           if (err.code === 'UsernameExistsException') {
//               // The user already exists, initiate the resend of the OTP
//               const resendParams = {
//                   ClientId: ClientId,
//                   Username: phoneNumber,
//               };
//               cognito.resendConfirmationCode(resendParams, (err, data) => {
//                   if (err) {
//                       // Handle the error if the OTP resend fails
//                       res.status(500).send('Error resending confirmation code: ' + err.message);
//                   } else {
//                       // OTP resend succeeded
//                       console.log(data);
//                       res.status(200);
//                       res.json({ message: 'OTP sent successfully.' });
//                   }
//               });
//           } else {
//               // Handle other errors
//               res.status(500).send('Error signing up: ' + err.message);
//           }
//       } else {
//           // User signed up successfully, OTP is automatically sent by Cognito
//           res.json({ message: 'OTP sent successfully.' });
//       }
//   });
// });


// function generateRandomPassword(length = 8) {
//   const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?";
//   let password = "";
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * charset.length);
//     password += charset[randomIndex];
//   }
//   return password;
// }

// app.post('/verify-otp', (req, res) => {
//   const phoneNumber = req.body.phoneNumber;
//   const otpCode = req.body.otpCode;

//   const params = {
//       ClientId: ClientId,
//       ConfirmationCode: otpCode,
//       Username: phoneNumber,
//   };

//   // Confirm the user's sign-up with the OTP code they received
//   cognito.confirmSignUp(params, (err, data) => {
//       if (err) {
//           console.log(err);
//           res.status(500).send('Error verifying OTP: ' + err.message);
//       } else {
//           res.json({ message: 'User confirmed successfully.' });
//       }
//   });
// });

app.post('/getPeopleThumbnails', async (req, res) => {
  try {
    const { eventName } = req.body;

    console.log('Received a request for the event:', eventName);

    // Scan the table with the event name and get all records
    const params = {
      TableName: indexedDataTableName,
      FilterExpression: 'folder_name = :eventName',
      ExpressionAttributeValues: {
        ':eventName': eventName
      }
    };

    const data = await docClient.scan(params).promise();

    // Process the data to get thumbnails for each unique user ID
    const thumbnails = [];
    const userIdCounts = {};

    for (const item of data.Items) {
      const userId = item.user_id;

      if (!thumbnails.some(thumbnail => thumbnail.userId === userId)) {
        console.log('Getting the thumbnail for the user:', userId);
        const s3Url = item.s3_url;

        thumbnails.push({
          userId,
          s3Url,
          count: 1
        });

        userIdCounts[userId] = 1; // Initialize count to 1
      } else {
        userIdCounts[userId]++; // Increment count
        thumbnails.find(thumbnail => thumbnail.userId === userId).count++;

      }
    }

    // Sort thumbnails by the count of occurrences of each user ID (most appeared to least appeared)
    thumbnails.sort((a, b) => userIdCounts[b.userId] - userIdCounts[a.userId]);
    const totalUniqueUserIds = Object.keys(userIdCounts).length;

    res.json({ thumbnails });
  } catch (error) {
    console.error('Error fetching thumbnails:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/fetch-events', async (req, res) => {
  try {
    const params = {
      TableName: eventsTable, // Replace with your DynamoDB table name
    };
    // Scan the DynamoDB table to fetch all events
    const data = await dynamoDB.scan(params).promise();
    const eventNames = data.Items.map(item => item.event_name);
    
    // Return the list of events
    res.json(eventNames);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/trigger-flashback', async (req, res) => {
  try {
    const { eventName } = req.body;

    // Query user_event_mapping table to get phone_numbers list
    const phoneNumbers = await queryUserEventMapping(eventName);
    const totalUsers = phoneNumbers.length;

    // Set response headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // send immediate response regarding the progress 
    res.write(`${JSON.stringify({ progress: 0 })}\n\n`);

    let processedUsers = 0; // Initialize processedUsers count

    // Function to send progress updates
    const sendProgressUpdate = (progress) => {
      res.write(`${JSON.stringify({ progress })}\n\n`);
    };

    // Iterate over phoneNumbers and process each user
    for (const phoneNumber of phoneNumbers) {
      try {
        // Increment processed users count
        processedUsers++;

        // Query users table to get portrait_s3_url
        const userData = await queryUsersTable(phoneNumber);
        const portraitS3Url = userData.portraitS3Url;
        const uniqueUid = userData.uniqueUid;

        if (!portraitS3Url) {
          console.error(`No portrait URL found for phone number: ${phoneNumber}`);
          continue; // Skip to the next phone number
        }

        // Call searchUsersByImage API with portraitS3Url
        const result = await searchUsersByImage(portraitS3Url, phoneNumber);
        const matchedUserIds = result.matchedUserIds;
        console.log('preparing to extract s3_urls with Matched UserIds:', result.matchedUserIds);
        
        for (const matchedUser of matchedUserIds) {
          const s3Urls = await getS3Url(matchedUser);

          if (s3Urls.length > 0) {
            for (const s3Url of s3Urls) {
              // Store attributes in user_outputs table
              await storeUserOutput({ unique_uid: uniqueUid, user_phone_number: phoneNumber, s3_url: s3Url, event_name: eventName });
            }
          } else {
            // Handle case where no S3 URLs are found for the current userId
            console.error(`No S3 URLs found for userId: ${matchedUser}`);
          }
        }

        // Calculate progress percentage
        const progress = Math.floor((processedUsers / totalUsers) * 100);
        console.log('Progress:', progress);

        // Send progress update to the frontend using SSE
        sendProgressUpdate(progress);
        console.log('Progress update sent.');

      } catch (error) {
        console.error('Error processing user:', error);
      }
    }

    // After processing all users, send the final success message along with progress status indicating completion
    // sendProgressUpdate(100);
    res.end(); // End the response stream

  } catch (error) {
    console.error('Error triggering flashback:', error);
    // If an error occurs, send an error response to the client
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to query user_event_mapping table
async function queryUserEventMapping(eventName) {
  const params = {
    TableName: userEventTableName,
    KeyConditionExpression: '#eventName = :eventName',
    ExpressionAttributeNames: {
      '#eventName': 'event_name'
    },
    ExpressionAttributeValues: {
      ':eventName': { S: eventName }
    },
    ProjectionExpression: 'user_phone_number' // Specify the attribute(s) you want to retrieve
  };

  const data = await dynamoDB.query(params).promise();
  const phoneNumbers = data.Items.map(item => item.user_phone_number.S);
  return phoneNumbers;
}

// Function to query users table
async function queryUsersTable(phoneNumber) {
  const params = {
    TableName: userrecordstable,
    Key: { 'user_phone_number': { S: phoneNumber } }
  };

  const data = await dynamoDB.getItem(params).promise();
  const userData = {
    uniqueUid: data.Item.unique_uid.S,
    portraitS3Url: data.Item.potrait_s3_url.S
  };
  return userData;
}

// Function to call searchUsersByImage API
async function searchUsersByImage(portraitS3Url, phoneNumber) {
  try {
    // Decode the URL-encoded characters in the S3 URL
    const decodedUrl = decodeURIComponent(portraitS3Url);
    console.log('Potrait s3 url fetched:', portraitS3Url);

    // Extract the object key from the decoded S3 URL
    const objectKey = decodedUrl.split('/').pop();
    console.log('Object key:', objectKey);

    // Construct the parameters to get the object from S3
    const s3Params = {
      Bucket: userBucketName, // Replace 'your-bucket-name' with the name of your S3 bucket
      Key: objectKey // Use the extracted object key
    };

    // Get the object from S3
    const s3Data = await s3.getObject(s3Params).promise();

    // Convert the image data to base64
    const base64Image = s3Data.Body.toString('base64')

    const startIndex = base64Image.indexOf('/9j');
    const croppedBase64EncodedImage = base64Image.substring(startIndex);

    // console.log('Cropped Base64 Encoded Image:', croppedBase64EncodedImage);


    // Construct the parameters for the searchUsersByImage operation
    const rekognitionParams = {
      CollectionId: 'FlashbackUserDataCollection', // Replace 'your-collection-id' with the ID of your Rekognition collection
      Image: {
        Bytes: Buffer.from(croppedBase64EncodedImage, 'base64') // Convert the base64-encoded image to a Buffer
      },
      MaxUsers: 1,
      UserMatchThreshold: 90
    };

    // Call the searchUsersByImage operation
    const data = await rekognition.searchUsersByImage(rekognitionParams).promise();

    const userData = await queryUsersTable(phoneNumber);
    const uniqueUid = userData.uniqueUid;

    console.log('unique_uid for the user:', uniqueUid);

    // Extract and return the matched faces
    if (data.UserMatches && data.UserMatches.length > 0) {
      console.log('Writing the ImageIds of the matched UserIds to user_outputs table');
      const matchedUserIds = data.UserMatches.map(match => match.User.UserId);
      console.log('Matched UserIds:', matchedUserIds);
      return {matchedUserIds};
    } else {
      throw new Error('No faces found in the image');
    }

  } catch (error) {
    console.error('Error searching faces by image:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}


// Function to get s3_url using matchedUser
async function getS3Url(matchedUser) {
  const params = {
    TableName: indexedDataTableName,
    IndexName: 'user_id-index', // Specify the GSI name
    KeyConditionExpression: 'user_id = :partitionKey', // Specify the GSI partition and sort key
    ExpressionAttributeValues: {
      ':partitionKey': { S: matchedUser } // Specify the value for the partition key
    }
  };


  try {
    const data = await dynamoDB.query(params).promise();
    if (!data.Items || data.Items.length === 0 || !data.Items[0].s3_url || !data.Items[0].s3_url.S) {
      throw new Error(`No s3_url found for user_id: ${matchedUser}`);
    }
    const s3Urls = data.Items.map(item => item.s3_url.S);
    console.log('Returned s3_urls data:', s3Urls);
    return s3Urls.filter(Boolean);
  } catch (error) {
    console.error('Error retrieving s3_url:', error);
    return []; // Return an empty array to continue with the execution further.
  }
}

// Function to store attributes in user_outputs table
async function storeUserOutput(attributes) {
  //we're skipping the write if there is no s3_url found for the image
  if (!attributes.s3_url) {
    console.error(`Skipping storing user output: No s3_url found for user_phone_number: ${attributes.user_phone_number}`);
    return; // Skip storing if s3_url is not found
  }
  const params = {
    TableName: userOutputTable,
    Item: {
      'unique_uid': { S: attributes.unique_uid },
      'user_phone_number': { S: attributes.user_phone_number },
      's3_url': { S: attributes.s3_url },
      'event_name': { S: attributes.event_name }
    }
  };

  try {
    await dynamoDB.putItem(params).promise();
    console.log(`User output stored successfully for user_phone_number: ${attributes.user_phone_number}`);
  } catch (error) {
    console.error('Error storing user output:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

module.exports = { searchUsersByImage };


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

  const res =  await addFolderToUser(folderName,username,files.length);
  const uploadDate = new Date().toISOString();
  const folder_id = username+"//"+folderName;
 console.log(res+ "after adding user and folder");


  const uploadParams = files.map((file) => ({
    PutRequest: {
      Item: {
        image_id: `${folderName}/${file.originalname}`,
        s3_url: `https://${bucketName}.s3.amazonaws.com/${folderName}/${encodeURIComponent(file.originalname)}`,
        user_name: username,
        upload_date: uploadDate,
        folder_name:`${folderName}`,
        folder_id: folder_id,
        image_status: "available"
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
          Key: `${folderName}/${file.originalname}`,
          Body: file.buffer,
          //ACL: 'public-read',
    };
    logger.info("images uploaded succesfully in "+folderName)
    return s3.upload(params).promise();
  })),
]);


  logger.info(`DynamoDB response:`, dynamoResponse);

  // call the function to upload low-resolution images to S3
  uploadLowResoltionImages(folderName,files);
  
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
  } catch (error) {
    logger.error(`Error uploading files and updating DynamoDB: ${error.message}`);
    res.status(500).json({ message: `Error uploading files and updating DynamoDB.` });
  }
});


async function addFolderToUser(folderName,username,files_length){
  
  const uploadDate = new Date().toISOString();
  const folder_id = username+"//"+folderName; // this will be fetching the randomId from the function we implemented earlier
  console.log(folder_id);

  // Now, update userFolders table
  const userFoldersParams = {
    TableName: userFoldersTableName,
    Item: {
      folder_id: folder_id,
      folder_name: folderName,
      user_name: username,
      image_count: files_length,
      upload_date: uploadDate,
      folder_status: "uploaded"
    },
  };
  // Put the item into userFolders table
  const res= await docClient.put(userFoldersParams).promise();
  logger.info(`${folder_id}, ${folderName} for the user ${username} has been succesfully stored in userFolders table`);
  return res;
}

app.post('/images/:eventName/:userId', async (req, res) => {
  try {
   
     const eventName = req.params.eventName;
     const userId = req.params.userId;
     const lastEvaluatedKey = req.body.lastEvaluatedKey;
     logger.info("Image are being fetched for event of pageNo -> "+eventName+"; userId -> "+userId +"; pageNo -> "+lastEvaluatedKey);

    //  const pageSize = 21;
    //  const start = (pageNo - 1) * pageSize;
    //  const end = start + pageSize;

    //  const params = {
    //   TableName: userOutputTable,
    //   IndexName: 'user_outputs_GSI', // Specify the GSI name
    //   KeyConditionExpression: 'user_phone_number = :partitionKey AND event_name = :sortKey', // Specify the GSI partition and sort key
    //   ExpressionAttributeValues: {
    //     ':partitionKey': userId, // Specify the value for the partition key
    //     ':sortKey': eventName // Specify the value for the sort key
    //   }
    // };
 // logger.info(params)
    const result = await userEventImages(eventName,userId,lastEvaluatedKey);
      const imagesPromises = result.Items.map(async file => {
      //   try {
      //     const imagekey=file.s3_url.split("amazonaws.com/")[1];
      //     const imageData = await s3.getObject({
      //         Bucket: imagesBucketName,
      //         Key:imagekey
      //     }).promise();

      // const resizedImageBuffer = await sharp(imageData.Body)
      // .resize(500,500)
      // .jpeg({ quality: 90, force: true })
      // .toBuffer();
        

        // // Convert the image to base64 with updated metadata
        // const base64Image = await sharp(imageBuffer)
        //     .withMetadata() // Ensure metadata preservation
        //     .toFormat('jpeg') // Convert to JPEG format (or 'png' if needed)
        //     .toBuffer(); // Convert to buffer

        //logger.info(resizedImageData)
        // Convert image data to base64
       
          const base64ImageData =  {
            "url": file.s3_url,
           "thumbnailUrl":"https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/"+file.s3_url.split("amazonaws.com/")[1],
         }
         console.log(base64ImageData.url);
          return base64ImageData;
      
    });
      const images = await Promise.all(imagesPromises);
      logger.info("Sucessfully fetched images");
      res.json({"images":images, 'totalImages':result.Count,'lastEvaluatedKey':result.LastEvaluatedKey});
  } catch (err) {
     logger.info("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
  }
});

async function userEventImages(eventName,userId,lastEvaluatedKey){

      try {
      const params = {
        TableName: userOutputTable,
        IndexName: 'unique_uid-event_name-index', // Specify the GSI name
        KeyConditionExpression: 'unique_uid = :partitionKey AND event_name = :sortKey', // Specify the GSI partition and sort key
        ExpressionAttributeValues: {
          ':partitionKey': userId, // Specify the value for the partition key
          ':sortKey': eventName // Specify the value for the sort key
        },
        Limit: 20
      };
      if(lastEvaluatedKey){
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
      const result = await docClient.query(params).promise();
      logger.info('total images fetched for the user -> '+userId+'  in event -> '+eventName +' : '+result.Count);
      return result;
    }
    catch (err) {
      logger.info(err)
      return err;
    }
  
}

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

app.get('/folderByUsername/:username', async (req, res) => {

  try{
  const username = req.params.username;
  console.log(username)
  const params = {
    TableName: 'userFolders',
    IndexName: 'UserNameIndex',
    ProjectionExpression: 'folder_name',
    KeyConditionExpression: 'user_name = :username',
    FilterExpression: 'folder_status <> :folderstatus',
    ExpressionAttributeValues: {
      ':username': username,
      ':folderstatus': "deleted"
    }
  };
  logger.info(params)
  const result = await docClient.query(params).promise();
  logger.info('total flashbacks fetched for the user: '+result.Count);
  res.send(result.Items)
}
catch(err)
{
  logger.error("Error in getting flashbacks created by user", err);
  res.status(500).send('Error in getting flashbacks created by user');
}
  
});


app.post('/deleteImages', async(req, res) => {

  try{
    const imageIds = req.body;

    // let updatePromises = [];

    //  // Loop through each imageName and create an update promise
    //  for (let image_id of imageNames) {
    //   const params = {
    //       TableName: 'userUploads',
    //       Key: { 'image_id': image_id },
    //       UpdateExpression: 'SET #attr1 = :value1',
    //       ExpressionAttributeNames: { '#attr1': 'image_status' },
    //       ExpressionAttributeValues: { ':value1': 'deleted' },
    //       ReturnValues: 'UPDATED_NEW'
    //   };

    //   // Add the update promise to the array
    //   updatePromises.push(docClient.update(params).promise());
  //}
  let results = await deleteImages(imageIds);
  res.status(200).send('Successfully deleted images');
}
  catch(err)
  {
    logger.error("Error in deleting images", err);
    res.status(500).send('Error in deleting selected images');
  }

});

async function deleteImages(imageIds){

  try{
    let updatePromises = [];

    // Loop through each imageName and create an update promise
    for (let image_id of imageIds) {
     const params = {
         TableName: 'userUploads',
         Key: { 'image_id': image_id },
         UpdateExpression: 'SET #attr1 = :value1',
         ExpressionAttributeNames: { '#attr1': 'image_status' },
         ExpressionAttributeValues: { ':value1': 'deleted' },
         ReturnValues: 'UPDATED_NEW'
     };

     // Add the update promise to the array
     updatePromises.push(docClient.update(params).promise());
 }
 let results = await Promise.all(updatePromises);

 return results;
  }
  catch(err)
  {
    return err;
  }
}

app.post('/deleteFlashBack/:folderName', async(req,res)=> {

  try{
    const folderName = req.params.folderName;
    const folder_id = "anirudhthadem//"+folderName;
    console.log(folderName);
    const params = {
      TableName: 'userFolders',
      //IndexName: 'UserNameIndex',
      Key: {
        'folder_id': folder_id,
    },
    UpdateExpression: 'SET #attr1 = :value1',
    ExpressionAttributeNames: {
        '#attr1': 'folder_status' // Replace with the name of the attribute to update
    },
    ExpressionAttributeValues: {
        ':value1': 'deleted'
    },
    ReturnValues: 'UPDATED_NEW' // Returns the values of the attributes after they were updated
    };
    docClient.update(params, function (err, data) {
    if (err) {
      res.status(500).send('Error in deleting flashback');
    } 
  });
  const imageIds = await folderImages(folderName);
  let results = await deleteImages(imageIds);
  res.status(200).send('Successfully deleted FlashBack');
}
  catch(err)
  {
    logger.error("Error in deleting flashback", err);
    res.status(500).send('Error in getting flashback');
  }

});



app.post('/fetchOriginalImages', async (req, res) => {

  const imagesList = req.body;
  console.log(imagesList)

  try{
  const imagesPromises = imagesList.map(async file => {
    try {
      const imageData = await s3.getObject({
          Bucket: bucketName,
          Key: file
      }).promise();

      logger.info("Image fetched from cloud: " + file);

      // Convert image data to base64
      const base64Image =  {
        "url": `${file}`,
       "imageData":`data:${file};base64,${imageData.Body.toString('base64')}`
     }
      return base64Image;
  }  catch (err) {
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

app.post('/addFolder', async(req, res) => {


  const username = req.body.username;
  const folderName =  req.body.folderName;
  try{
    
  const result =  await addFolderToUser(folderName,username,0);
  res.status(200).send('Successfully deleted images');
}
  catch(err)
  {
    logger.error("Error in deleting images", err);
    res.status(500).send('Error in deleting selected images');
  }

});



app.post('/downloadImage', async (req, res) => {
   
  const imageUrl = req.body.imageUrl;
 
        try {
          
          logger.info("Image downloading started from cloud: " +imagesBucketName+ "-> "+ imageUrl);
          const imageData = await s3.getObject({
              Bucket: imagesBucketName,
              Key: imageUrl
          }).promise();

          logger.info("Image downloaded from cloud: " + imageUrl);
         // res.json(imageData.Body.toString('base64'));
          res.json(`data:image/jpeg;base64,${imageData.Body.toString('base64')}`);
      }  catch (err) {
          logger.error("Error downloading image: "+imageUrl, err);
          res.status(500).send('Error getting images from S3');
      }
    });

      app.post('/uploadUserPotrait', upload.single('image'), async (req, res) => {
        const file = req.body.image;
        const username = req.body.username;
        const params = {
          Bucket: userBucketName,
          Key: username+".jpg",
          Body: Buffer.from(file, 'base64'),
          //ACL: 'public-read', // Optional: Set ACL to public-read for public access
        };
      
        try {
          // Upload image to S3
          const data = await s3.upload(params).promise();
          console.log('Upload successful:', data.Location);
      
          // Update DynamoDB with the S3 URL
          const updateParams = {
            TableName: userrecordstable,
            Key: { user_phone_number: username }, // Assuming you have a primary key 'id'
            UpdateExpression: 'set potrait_s3_url = :url',
            ExpressionAttributeValues: {
              ':url': data.Location,
            },
            ReturnValues: 'UPDATED_NEW',
          };
      
          const updateResult = await docClient.update(updateParams).promise();

          console.log('updating s3 image  url for user is successful:', updateResult);

          
          res.json({ potrait_s3_url: data.Location });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'Error uploading image' });
        }
      });

      app.post('/createUser', async (req, res) => {
        const  username  = req.body.username;
        logger.info("creating user "+username);
      
        try {
          // Check if the user already exists
          const existingUser = await getUser(username);
          logger.info("existingUser"+ existingUser);
          if (existingUser && existingUser.potrait_s3_url) {

            const updateParamsUserEvent = {
              TableName: userEventTableName,
              Item: {
                event_name: 'ShraddInn_10052024',
                user_phone_number: username,
                created_date: new Date().toISOString()
              }
            };
            const putResult = await docClient.put(updateParamsUserEvent).promise()
            logger.info('insert in user-event mapping is successful:', putResult);
            return res.json({ error: 'User already exists', status:'exists' });
          }
      
          // Create a new user entry in DynamoDB
          await createUser(username);
          console.log("created sucessfulyy ->"+username)

          const updateParamsUserEvent = {
            TableName: userEventTableName,
            Item: {
              event_name: 'ShraddInn_10052024',
              user_phone_number: username,
              created_date: new Date().toISOString()
            }
          };
          const putResult = await docClient.put(updateParamsUserEvent).promise()
          logger.info('insert in user-event mapping is successful:', putResult);
      
          res.status(201).json({ message: 'User created successfully', status:'created' });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'Error creating user' });
        }
      });
      
      // Function to get a user from DynamoDB
      async function getUser(username) {
        const params = {
          TableName: userrecordstable,
          Key: {
            user_phone_number: username
          }
        };

        try {
          const data = await docClient.get(params).promise();
          return data.Item; // Return user data if found
      } catch (error) {
          console.error('Error retrieving user:', error);
          throw error;
      }
  }
      
      // Function to create a new user in DynamoDB
      async function createUser(username) {
        const unique_uid = `${username}_Flash_${Math.floor(Math.random() * 1000)}`;
        const params = {
          TableName: userrecordstable,
          Item: {
            user_phone_number: username,
            user_name: username,
            unique_uid: unique_uid,
            created_date: new Date().toISOString()
          }
        };
      
        await docClient.put(params).promise();
      }
     

      // Route to resize and copy images from a specific subfolder of one S3 bucket to another
      app.post('/api/resize-copy-images', async (req, res) => {
        try {
            const sourceBucket = "flashbackprathimacollection";
            const sourceFolder = "Convocation_PrathimaCollege";
            const destinationBucket = "flashbackimagesthumbnail";
    
            let continuationToken = null;
            let allImageObjects = [];
    
            do {
                // List objects in the source subfolder
                const listParams = {
                    Bucket: sourceBucket,
                    Prefix: sourceFolder,
                    ContinuationToken: continuationToken
                };
    
                const sourceObjects = await s3.listObjectsV2(listParams).promise();
    
                // Filter out subfolder entries
                const imageObjects = sourceObjects.Contents.filter(obj => !obj.Key.endsWith('/'));
                allImageObjects = allImageObjects.concat(imageObjects);
    
                continuationToken = sourceObjects.NextContinuationToken;
            } while (continuationToken);
    
            // Resize and copy each image to the destination bucket
            await Promise.all(allImageObjects.map(async (obj) => {
                const sourceObjectKey = obj.Key;
    
                try {
                    // Get the image from the source bucket
                    const { Body } = await s3.getObject({ Bucket: sourceBucket, Key: sourceObjectKey }).promise();
    
                    // Check if the Body is empty or null
                    if (!Body) {
                        throw new Error(`Empty or null Body for object: ${sourceObjectKey}`);
                    }
    
                    // Resize the image
                    const resizedImageStream = await sharp(Body)
                        .resize(500, 500)
                        .jpeg({ quality: 50, force: false }) // Convert image to JPEG with specified quality
                        .toBuffer();
    
                    // Extract the relative path excluding the folder
                    const relativePath = sourceObjectKey.replace(sourceFolder, '');
    
                    // Upload the resized image to the destination bucket with the same relative path
                    await s3.upload({
                        Bucket: destinationBucket,
                        Key: sourceFolder + relativePath, // Use the same relative path in the destination bucket
                        Body: Readable.from(resizedImageStream)
                    }).promise();
                } catch (error) {
                    console.error(`Error processing object: ${sourceObjectKey}`, error);
                }
            }));
    
            console.log("Images from subfolder resized and copied successfully.");
            res.status(200).json({ message: 'Images from subfolder resized and copied successfully.' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
    


const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  logger.info(`Server is running on https://localhost:${PORT}`);
});


//**Uncomment for dev testing and comment when pushing the code to mainline**/ &&&& uncomment the above "https.createServer" code when pushing the code to prod.
// app.listen(PORT ,() => {
//   logger.info(`Server started on http://localhost:${PORT}`);
// });