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
const { fold, last } = require('prelude-ls');
const { func } = require('prop-types');
const app = express();
const PORT = process.env.PORT || 5000;
const base64 = require('base64-js');
const { Readable } = require('stream');
const axios = require('axios');
const ReactDOMServer = require('react-dom/server');
const React = require('react');
const { set } = require('lodash');
const ExcelJS = require('exceljs');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
//const App = require('..\\client');
const oldEvents = ["Aarthi_Vinay_19122021","Convocation_PrathimaCollege","KSL_25042024","Jahnavi_Vaishnavi_SC_28042024","KSL_22052024","KSL_16052024","V20_BootCamp_2024","Neha_ShivaTeja_18042024"]

dotenv.config();
app.use(cors()); // Allow cross-origin requests
app.use(express.json());

app.use(express.json());

// SSR Start
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "SSR"));
app.use(express.static(path.join(__dirname, "SSR/public")));

app.get("/share/:eventName/:userId", async(req, res) => {
  try{
    const eventName=req.params.eventName
    const userId=req.params.userId
    const redirectTo=req.query.redirectTo
    let redirectUrl=""
    if(!!redirectTo?.length && redirectTo === "photos"){
      redirectUrl=`photos/${eventName}/${userId}`
    }
    else if(!!redirectTo?.length && redirectTo === "singleImage"){
      redirectUrl=`sharedImage/${eventName}/${userId}.jpg`
    }
    else{
      redirectUrl = `photos/${eventName}/${userId}`;
    } 
    const image = `https://rekognitionuserfaces.s3.amazonaws.com/thumbnails/${userId}.jpg`
    res.render("index",{eventName:req.params.eventName,userId:req.params.userId,image,redirectUrl}); // Assuming you have an "index.ejs" file in the "views" directory
  } catch (err) {
     logger.info("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
  }
});

// SSR ends

// Configuring winston application logger

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/application.log' })
   ]
 });

 // *** Comment these certificates while testing changes in local developer machine. And, uncomment while pushing to mainline***
const privateKey = fs.readFileSync('/etc/letsencrypt/live/flashback.inc/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/flashback.inc/fullchain.pem', 'utf8');

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
const userClientInteractionTable ='user_client_interaction';
const eventsTable = 'events';
const eventsDataTable = 'events_data';
const projectsTable = 'projects_data';
const indexedDataTableName = 'indexed_data'
const formDataTableName = 'selectionFormData'; 
const recokgImages = 'RekognitionImageProperties';
const proShareDataTable = 'pro_share_data';


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

        logger.info("fetch s3 url for phoneNumber: "+phoneNumber);
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
        const matchedUserIds = result.matchedUserId;
        console.log('preparing to extract s3_urls with Matched UserIds:', result.matchedUserId);
        
        for (const matchedUser of matchedUserIds) {
          const s3Urls = await getS3Url(matchedUser,eventName);

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


app.post('/trigger-flashback-new', async (req, res) => {
  try {
    const result ={};
    const { eventName } = req.body;
    
     logger.info("Images are being fetched for event : " +eventName);

     const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index', 
      ProjectionExpression: 'user_id, image_id,s3_url,folder_name,faces_in_image',
      KeyConditionExpression: 'folder_name = :folderName',
      ExpressionAttributeValues: {
        ':folderName': eventName
      }        
    };

    let items = [];
    let lastEvaluatedKey = null;
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const data = await docClient.query(params).promise();
      items = items.concat(data.Items);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey)
      logger.info("total image entries fetched from index table : "+items.length)
      items.sort((a, b) => a.faces_in_image - b.faces_in_image);
      // const userIds = [...new Set(items.map(item => item.user_id))];
      // const userBatches = [];
      // const usersObject = {};
      // for (let i = 0; i < userIds.length; i += 100) {
      //   userBatches.push(userIds.slice(i, i + 100));
      //  }
    
      //  for (const batch of userBatches) {
      // //   const userParams = {
      // //   RequestItems: {
      // //     'users': { // Replace with your table name
      // //       Keys: batch,
      // //       ProjectionExpression: 'user_id, phone_number' 
      // //     }
      // //   }
      // // };
    
      // try {
      //   const data = await docClient.batchGet(userParams).promise();
      //   const responses = data.Responses['users'];
      //   usersObject.push(...responses);
      // } catch (error) {
      //   console.error('Error fetching user data:', error);
      //   throw new Error('Error fetching user data from DynamoDB');
      // }
      //const userMap = new Map(userData.map(user => [user.user_id, user.phone_number]));
      const indexData = items.map(item => ({
        event_name: item.folder_name,
        unique_uid: item.user_id,
        faces_in_image: item.faces_in_image,
        s3_url: item.s3_url,
        image_id: item.image_id
      }));
      
      const promises = indexData.map(item => {
        const params = {
          TableName: "user_outputs",
          Item: item
        };
       // console.log(item.faces_in_image)
        return docClient.put(params).promise();
      });
    
      try {
        await Promise.all(promises);
        result.IndexDataCount = indexData.length;
        logger.info('All items successfully inserted');
        const phoneNumbers = await queryUserEventMapping(eventName);
        const totalUsers = phoneNumbers.length;
        result.totalExistingUsers = totalUsers;
        logger.info("total number of users fetched from user-event mapping: "+totalUsers)
        // Iterate over phoneNumbers and process each user
        for (const phoneNumber of phoneNumbers) {
          try {
            
            // Query users table to get portrait_s3_url
            const userData = await queryUsersTable(phoneNumber);
            const portraitS3Url = userData.portraitS3Url;
            const uniqueUid = userData.uniqueUid;
    
            if (!portraitS3Url) {
              console.error(`No portrait URL found for phone number: ${phoneNumber}`);
              continue; // Skip to the next phone number
            }

            const mappedUser = await mapUserIdAndPhoneNumber(phoneNumber,portraitS3Url,eventName,'');
            logger.info(result)
          } catch (error) {
            logger.info("Failure in marking the userId and phone number:", error);
            throw new Error('Error inserting or updating items in DynamoDB');
            // res.status(500).send({"message":"Failure in marking the userId and phone number"});
          }
        }
       
      } catch (error) {
        console.error('Error inserting or updating items:', error);
        throw new Error('Error inserting or updating items in DynamoDB',error);
      }
      res.send(result); // End the response stream 
}catch (error) {
    console.error('Error triggering flashback:', error);
    // If an error occurs, send an error response to the client
    res.status(500).json({"message":"Failure in creating flashbacks"+error});
  }
});

// Function to query user_event_mapping table
async function queryUserEventMapping(eventName) {
  const params = {
    TableName: userEventTableName,
    FilterExpression: 'event_name = :eventName AND flashback_status <> :flashbackStatus',
    ExpressionAttributeValues: {
      ':eventName': { S: eventName }, // Assuming eventName is a string variable
      ':flashbackStatus': { S: 'triggered' } // Assuming flashbackStatus is a string
    },
    ProjectionExpression: 'user_phone_number'
  };

  const data = await dynamoDB.scan(params).promise();
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
  logger.info(phoneNumber);
  const userData = {
    uniqueUid: data.Item.unique_uid.S
  };
  if(data.Item.potrait_s3_url){
    userData.portraitS3Url=data.Item.potrait_s3_url.S;
  }
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
      MaxUsers: 2,
      UserMatchThreshold: 90
    };

    // Call the searchUsersByImage operation
    const data = await rekognition.searchUsersByImage(rekognitionParams).promise();

    const userData = await queryUsersTable(phoneNumber);
    const uniqueUid = userData.uniqueUid;

    console.log('unique_uid for the user:', uniqueUid);

    // Extract and return the matched faces
    if (data.UserMatches && data.UserMatches.length > 0) {
      //console.log('Writing the ImageIds of the matched UserIds to user_outputs table');
      const matchedUserId = data.UserMatches.map(match => match.User.UserId);
      console.log('Matched UserIds:', matchedUserId);
      return {matchedUserId};
    } else {
      logger.info(data);
      return;
      //throw new Error('No Matches found for the image');
    }

  } catch (error) {
    console.error('Error searching faces by image:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

//async function mapUserIdAndPhoneNumber(phoneNumber,imageUrl,eventName,userId){
  async function mapUserIdAndPhoneNumber(phoneNumber,imageUrl,eventName,userId){
    try {
      // Call searchUsersByImage API with portraitS3Url
      const result = await searchUsersByImage(imageUrl, phoneNumber);
      if(!result){
        logger.info("matched user not found: "+phoneNumber);
        logger.info("deleting the S3 url for unmacthed  userId->"+userId);
        const userDeleteParams = {
          TableName: userrecordstable, // Replace with your table name
          Key: {
              'user_phone_number': phoneNumber // Replace with your partition key name
          },
          UpdateExpression: 'REMOVE potrait_s3_url',
          ReturnValues: 'UPDATED_NEW'
      };
  
      const deltResult = docClient.update(userDeleteParams).promise();
      logger.info("deleted the s3 url for userId ->"+userId);
        return;
      }
      const matchedUserId = result.matchedUserId[0];
      if(userId && matchedUserId != userId){
          logger.info("deleting the S3 url for unmacthed  userId->"+userId);
            const userDeleteParams = {
              TableName: userrecordstable, // Replace with your table name
              Key: {
                  'user_phone_number': phoneNumber // Replace with your partition key name
              },
              UpdateExpression: 'REMOVE potrait_s3_url',
              ReturnValues: 'UPDATED_NEW'
          };
      
          const deltResult = docClient.update(userDeleteParams).promise();
          logger.info("deleted the s3 url for userId ->"+userId);
      }
      logger.info('Matched userId for the phoneNumber: '+phoneNumber+' and imageUrl: '+imageUrl+'is :', matchedUserId);
      const userUpdateParams = {
        TableName: userrecordstable, // Replace with your table name
        Key: {
          'user_phone_number': phoneNumber // Replace with your partition key name
        },
        UpdateExpression: 'set user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': matchedUserId
        },
        ReturnValues: 'UPDATED_NEW'
      };

      const userEventUpdateParams = {
        TableName: userEventTableName, // Replace with your table name
        Key: {
          'event_name':eventName,
          'user_phone_number': phoneNumber // Replace with your partition key name
        },
        UpdateExpression: 'set flashback_status = :flashbackStatus, user_id = :userId',
        ExpressionAttributeValues: {
          ':flashbackStatus': "triggered",
          ':userId':matchedUserId
        },
        ReturnValues: 'UPDATED_NEW'
      };
    
    
      try {
        const userResult = await docClient.update(userUpdateParams).promise();
        const eventResult = await docClient.update(userEventUpdateParams).promise();
        logger.info('Updated userId and flashback status for :'+ phoneNumber);
        return userResult;
      } catch (error) {
        logger.info("Failure is updating the userId in users table : "+error);
        throw error;
      }

    } catch (error) {
      logger.info("Error in marking the userId and phone number");
      throw error;
    }
}

// Function to get s3_url using matchedUser
async function getS3Url(matchedUser,eventName) {
  const params = {
    TableName: indexedDataTableName,
    IndexName: 'folder_name-user_id-index', // Specify the GSI name
    KeyConditionExpression: 'user_id = :partitionKey and folder_name = :eventName', // Specify the GSI partition and sort key
    ExpressionAttributeValues: {
      ':partitionKey': { S: matchedUser },
      ':eventName': {S: eventName} 
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

app.post('/userIdPhoneNumberMapping',async (req,res) =>{

  try{
    const phoneNumber =req.body.phoneNumber;
    const eventName = req.body.eventName;
    const userId = req.body.userId;
    const imageUrl = "https://flashbackuserthumbnails.s3.ap-south-1.amazonaws.com/"+phoneNumber+".jpg";
    const result = await mapUserIdAndPhoneNumber(phoneNumber,imageUrl,eventName,userId);
    logger.info(result)
    logger.info("Succesfully mapped userId and phone number");
    res.send(result);
  }
  catch(error)
  {
    logger.info("Error in mapping userId with phone number");
    res.status(500).send({"message":"Error in mapping userId with phone number"});
  }

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


// Serve static assets (e.g., CSS, JS, images)
//app.use(express.static(path.resolve(__dirname, '..', 'client//build')));

// Define a route to render the React app
// app.get('/photos/:eventName/:userId', async (req, res) => {
//   const { eventName, userId } = req.params;

//   // Construct the user-specific image URL based on the parameters
//   const userImage =  await userEventImages(eventName,userId,'');
//   const userImageUrl = userImage.Items[0].s3_url;
//   logger.info("eventName : "+eventName+" userId : "+ " image rendering");

//   // Read the index.html file
//   const indexHtmlPath = path.resolve(__dirname, '..', 'client//build', 'index.html');
//   fs.readFile(indexHtmlPath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading index.html:', err);
//       return res.status(500).send('Internal Server Error');
//     }

//     // Modify the HTML content to include the Open Graph meta tags
//     const modifiedHtml = data.replace(
//       '<!-- SSR_META_TAGS -->',
//       `
//       <meta property="og:title" content="Flashabck" />
//       <meta property="og:description" content="Create and Share Memories" />
//       <meta property="og:image" content="${userImageUrl}" />
//       <!-- Add other Open Graph meta tags here -->
//       `
//     );

//     // Send the modified HTML content as the server response
//     return res.send(modifiedHtml.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`));
//   });
// });



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
       
           // Convert image data to base64
        const base64ImageData =  {
          "thumbnailUrl":"https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/"+file.s3_url.split("amazonaws.com/")[1]
        }
         if(eventName === 'Convocation_PrathimaCollege'){
           base64ImageData.url = "https://flashbackprathimacollection.s3.ap-south-1.amazonaws.com/"+file.s3_url.split("amazonaws.com/")[1];
 
         }
         else{
           base64ImageData.url = file.s3_url;
         }
         //console.log(base64ImageData.url);
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
        KeyConditionExpression: 'unique_uid = :partitionKey AND event_name = :sortKey',
        FilterExpression: "is_favourite <> :isFav",
        ExpressionAttributeValues: {
          ':partitionKey': userId, // Specify the value for the partition key
          ':sortKey': eventName,
          ':isFav':  true// Specify the value for the sort key
        },
        Limit:20
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


app.post('/images-new/:eventName/:userId', async (req, res) => {
  try {
   
     const eventName = req.params.eventName;
     const userId = req.params.userId;
     const isFavourites = req.body.isFavourites;
     const lastEvaluatedKey = req.body.lastEvaluatedKey;
     let isUserRegistered ;
     let clientName;
     let clientObject;
     let userObject;
     if(!oldEvents.includes(eventName))
      {
        isUserRegistered = await checkIsUserRegistered(userId);
      }
      else{
        isUserRegistered =true;
        logger.info("old event user");
      }
     // isUserRegistered = await checkIsUserRegistered(userId);
     logger.info("isUserRegistered: "+ isUserRegistered);
     if(!isUserRegistered)
      {
        logger.info("user doesnot exists... navigate to login page");
          res.status(700).send({"message":"Oh! You are not registered, please register to view photographs"})
      }else{
      logger.info("user exists:"+userId);
     logger.info("Image are being fetched for event of pageNo -> "+eventName+"; userId -> "+userId +"; isFavourites -> "+isFavourites);

    const result = await userEventImagesNew(eventName,userId,lastEvaluatedKey,isFavourites);
    logger.info("total"+result.Items.length)
    if(!lastEvaluatedKey && isFavourites){
      clientObject = await getClientObject(eventName);
      userObject = await getUserObjectByUserId(userId);
    }
       
    
    result.Items.sort((a, b) => a.faces_in_image - b.faces_in_image);
      const imagesPromises = result.Items.map(async file => {
        const base64ImageData =  {
          "facesCount":file.faces_in_image,
          "thumbnailUrl":"https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/"+file.s3_url.split("amazonaws.com/")[1]
        }
         if(eventName === 'Convocation_PrathimaCollege'){
           base64ImageData.url = "https://flashbackprathimacollection.s3.ap-south-1.amazonaws.com/"+file.s3_url.split("amazonaws.com/")[1];
         }
         else{
           base64ImageData.url = file.s3_url;
         }
          return base64ImageData;
      
    });
      const images = await Promise.all(imagesPromises);
      logger.info('total images fetched for the user -> '+userId+'  in event -> '+eventName +"isFavourites -> "+isFavourites+' : '+result.Count);
      res.json({"images":images, 'totalImages':result.Count,'lastEvaluatedKey':result.LastEvaluatedKey,'clientObj':clientObject,'userObj':userObject});
  }
  } catch (err) {
     logger.info("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
  }
});

// async function userEventImagesNew(eventName,userId,lastEvaluatedKey,isFavourites){
    
//    logger.info(isFavourites)
//     try {
//     let params = {}
//     if(isFavourites === true){
//       params = {
//         TableName: userOutputTable,
//         IndexName: 'unique_uid-event_name-index', 
//         KeyConditionExpression: 'unique_uid = :partitionKey AND event_name = :sortKey',
//         FilterExpression : "is_favourite = :isFav",
//         ExpressionAttributeValues: {
//           ':partitionKey': userId, // Specify the value for the partition key
//           ':sortKey': eventName,
//           ':isFav':  true// Specify the value for the sort key
//         }        
//       };
//     }
//     else{
//       params = {
//         TableName: userOutputTable,
//         IndexName: 'unique_uid-event_name-index', 
//         KeyConditionExpression: 'unique_uid = :partitionKey AND event_name = :sortKey',
//         FilterExpression : "is_favourite <> :isFav",
//         ExpressionAttributeValues: {
//           ':partitionKey': userId, // Specify the value for the partition key
//           ':sortKey': eventName,
//           ':isFav':  true// Specify the value for the sort key
//         },
//         Limit : 100,        
//       };
//       if(lastEvaluatedKey){
//         params.ExclusiveStartKey = lastEvaluatedKey;
//       }
//     }
//       const result = await docClient.query(params).promise();
//     logger.info(`Fetched ${result.Items.length} items.`)
//       return result;
//     }
//     catch (err) {
//       logger.info(err)
//       return err;
//     }
  
// }
async function getClientObject(eventName) {

  try {
    logger.info("fetching client info for eventName: "+eventName);
    let params = {
      TableName: eventsTable,
      KeyConditionExpression: 'event_name = :eventName',
      ExpressionAttributeValues: {
        ':eventName': eventName
      },    
    };
    const res = await docClient.query(params).promise();
    let clientName = res.Items[0].client_name;
    logger.info("fetched clientName"+clientName)
    params = {
      TableName: userrecordstable,
      FilterExpression: "user_name = :clientName",
      ExpressionAttributeValues: {
        ":clientName": clientName
      }
    };

    const result = await docClient.scan(params).promise();

    if (result.Items.length === 0) {
      throw new Error("Client not found");
    }
    logger.info("client details fetched successfully");
    return result.Items[0];
  } catch (error) {
    console.error("Error getting client object:", error);
    throw error;
  }
}

async function getUserObjectByUserId(userId){
  try{
    logger.info("getting user info for userId : "+userId);
    params = {
      TableName: userrecordstable,
      FilterExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };
    const result = await docClient.scan(params).promise();

    if (result.Items.length === 0) {
      throw new Error("userId not found");
    }
    logger.info("user details fetched successfully");
    return result.Items[0];
  } catch (error) {
    console.error("Error getting user object:", error);
    throw error;
  }
}

async function getUserObjectByUserPhoneNumber(userPhoneNumber){
  try{
    logger.info("getting user info for userPhoneNumber : "+userPhoneNumber);
    params = {
      TableName: userrecordstable,
      FilterExpression: "user_phone_number = :userPhoneNumber",
      ExpressionAttributeValues: {
        ":userPhoneNumber": userPhoneNumber
      }
    };
    const result = await docClient.scan(params).promise();

    if (result.Items.length === 0) {
      throw new Error("userPhoneNumber not found");
    }
    logger.info("user details fetched successfully");
    return result.Items[0];
  } catch (error) {
    console.error("Error getting user object:", error);
    throw error;
  }
}

async function checkIsUserRegistered(userId){

  const params = {
    TableName: "users",
    FilterExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ProjectionExpression: 'userId' // Only return the userId field
  };

  try {
    const data = await docClient.scan(params).promise();
     const res = data.Items.length > 0;
     return res;
  } catch (error) {
    console.error('Error scanning DynamoDB:', error);
    throw new Error('Error scanning DynamoDB');
  }
}

app.get('/userThumbnails-old/:eventName', async (req, res) => {
  
  const eventName = req.params.eventName;
  try {
     logger.info("Thumbnails are being fetched for even : " +eventName);

     const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index', 
      ProjectionExpression: 'user_id, image_id, Gender_Value, AgeRange_Low, AgeRange_High',
      KeyConditionExpression: 'folder_name = :folderName',
      ExpressionAttributeValues: {
        ':folderName': eventName
      }        
    };

    let items = [];
    let lastEvaluatedKey = null;
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const data = await docClient.query(params).promise();
      items = items.concat(data.Items);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const userCountMap = new Map();

    items.forEach(item => {
      const userId = item.user_id;
      const gender = item.Gender_Value;
      const ageLow = item.AgeRange_Low;
      const ageHigh = item.AgeRange_High;
      if (!userCountMap.has(userId)) {
        // Initialize the map with an object containing userId, count, and gender
        userCountMap.set(userId, { userId, count: 0, gender, age:0 });
      }
    
      // Increment the count for this userId
      const userInfo = userCountMap.get(userId);
      userInfo.count += 1;
      //age average
      if(ageLow && ageHigh){ 
        userInfo.age  = (userCountMap.get(userId).age+((ageLow+ageHigh)/2))/2
      
      }
      // Update the map with the new object
      userCountMap.set(userId, userInfo);
  
    });
    logger.info("Total number of user userIds fetched : "+userCountMap.length)
    const usersIds = Array.from(userCountMap.keys());
    const keys = usersIds.map(userId => ({ user_id: userId }));

    const thumbnailObject = await getThumbanailsForUserIds(keys);
    thumbnailObject.forEach( item=>{
      item.count = userCountMap.get(item.user_id).count;
      item.gender = userCountMap.get(item.user_id).gender;
      item.avgAge = userCountMap.get(item.user_id).age;
    })
     thumbnailObject.sort((a, b) => b.count - a.count);
   
    logger.info("Total number of user thumbnails fetched : "+thumbnailObject.length)
     res.json(thumbnailObject);
  } catch (err) {
     logger.info("Error in S3 get", err);
      res.status(500).send('Error getting thumbnails for the event: '+eventName);
  }
});



app.get('/userThumbnails/:eventName/:userId', async (req, res) => {
  try {
   
     const eventName = req.params.eventName;
     const userId = req.params.userId;

     logger.info("Thumbnails are being fetched for event : " +eventName+" and userId : "+userId);

     const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index', 
      ProjectionExpression: 'user_id, image_id',
      KeyConditionExpression: 'folder_name = :folderName and user_id =:userId',
      ExpressionAttributeValues: {
        ':folderName': eventName,
        ':userId': userId
      }        
    };

    let items = [];
    let lastEvaluatedKey = null;
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const data = await docClient.query(params).promise();
      items = items.concat(data.Items);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const userCountMap = new Map();

    // Iterate over each item
    items.forEach(item => {
      const userId = item.user_id;
      // If the userId is not in the map, initialize it with a Set
     if (!userCountMap.has(userId)) {
          userCountMap.set(userId, 0);
        }
        // Increment the count for this userId
        userCountMap.set(userId, userCountMap.get(userId) + 1);
       // logger.info(userCountMap.size)
    }); 
    logger.info("Total number of  userIds fetched : "+userCountMap.size)
    const usersIds = Array.from(userCountMap.keys());
    const keys = usersIds.map(userId => ({ user_id: userId }));

    const thumbnailObject = await getThumbanailsForUserIds(keys);
   
    logger.info("Total number of user thumbnails fetched : "+thumbnailObject.length)
     res.send({"message":"Successfully fetched thumb"});
  } catch (err) {
     logger.info("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
  }
});

app.get('/userThumbnails/:eventName', async (req, res) => {
  const eventName = req.params.eventName;

  try {
    logger.info("Thumbnails are being fetched for event: " + eventName);

    // Step 1: Check if userThumbnails already exist in EventTable using scan
    const scanParams = {
      TableName: eventsTable,
      FilterExpression: 'event_name = :eventName',
      ExpressionAttributeValues: {
        ':eventName': eventName
      },
      ProjectionExpression: 'userThumbnails'
    };

    const scanResult = await docClient.scan(scanParams).promise();
    if (scanResult.Items.length > 0 && scanResult.Items[0].userThumbnails) {
      logger.info("User thumbnails found in db for event: " + eventName);
      return res.json(scanResult.Items[0].userThumbnails);
    }

    logger.info("User thumbnails not found in DynamoDB");

    // Step 2: Query indexedDataTableName to get imageIds associated with the eventName
    const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index',
      ProjectionExpression: 'user_id, image_id, Gender_Value, AgeRange_Low, AgeRange_High',
      KeyConditionExpression: 'folder_name = :folderName',
      ExpressionAttributeValues: {
        ':folderName': eventName
      }
    };

    let items = [];
    let lastEvaluatedKey = null;
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const data = await docClient.query(params).promise();
      items = items.concat(data.Items);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const userCountMap = new Map();

    items.forEach(item => {
      const userId = item.user_id;
      const gender = item.Gender_Value;
      const ageLow = item.AgeRange_Low;
      const ageHigh = item.AgeRange_High;
      if (!userCountMap.has(userId)) {
        // Initialize the map with an object containing userId, count, and gender
        userCountMap.set(userId, { userId, count: 0, gender, age: 0 });
      }

      // Increment the count for this userId
      const userInfo = userCountMap.get(userId);
      userInfo.count += 1;
      // Age average
      if (ageLow && ageHigh) {
        userInfo.age = (userInfo.age + ((ageLow + ageHigh) / 2)) / 2;
      }
      // Update the map with the new object
      userCountMap.set(userId, userInfo);
    });

    logger.info("Total number of user userIds fetched: " + userCountMap.size);
    const usersIds = Array.from(userCountMap.keys());
    const keys = usersIds.map(userId => ({ user_id: userId }));

    const thumbnailObject = await getThumbanailsForUserIds(keys);
    thumbnailObject.forEach(item => {
      item.count = userCountMap.get(item.user_id).count;
      item.gender = userCountMap.get(item.user_id).gender;
      item.avgAge = userCountMap.get(item.user_id).age;
    });
    thumbnailObject.sort((a, b) => b.count - a.count);

    logger.info("Total number of user thumbnails fetched: " + thumbnailObject.length);

    // Step 3: Store the result in EventTable
    const storeParams = {
      TableName: eventsTable,
      Item: {
        event_name: eventName,
        event_date:'09-06-2024',
        userThumbnails: thumbnailObject
      }
    };

    await docClient.put(storeParams).promise();
    logger.info("User thumbnails saved for event: " + eventName);

    res.json(thumbnailObject);
  } catch (err) {
    logger.error("Error in fetching thumbnails", err);
    res.status(500).send('Error getting thumbnails for the event: ' + eventName);
  }
});


async function getThumbanailsForUserIds(keys){

  const TABLE_NAME = 'RekognitionUsersData';
    const BATCH_SIZE = 100;
   const keyBatches = [];
   const thumbnailObject = [];
   for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    keyBatches.push(keys.slice(i, i + BATCH_SIZE));
   }

   for (const batch of keyBatches) {
    const params1 = {
      RequestItems: {
        [TABLE_NAME]: {
          Keys: batch,
          ProjectionExpression: 'user_id, face_url',
        }
      }
    };

    try {
      const data = await docClient.batchGet(params1).promise();
      const responses = data.Responses[TABLE_NAME];
      thumbnailObject.push(...responses);
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  }

 return thumbnailObject;
}

async function userEventImagesNew(eventName,userId,lastEvaluatedKey,isFavourites){
    
   logger.info(isFavourites)
    try {
    let params = {}
    if(isFavourites){
      params = {
        TableName: userOutputTable,
        IndexName: 'unique_uid-event_name-index', 
        KeyConditionExpression: 'unique_uid = :partitionKey AND event_name = :sortKey',
        FilterExpression : "is_favourite = :isFav",
        ExpressionAttributeValues: {
          ':partitionKey': userId, // Specify the value for the partition key
          ':sortKey': eventName,
          ':isFav':  true// Specify the value for the sort key
        }        
      };
    }
    else{
      params = {
        TableName: userOutputTable,
        IndexName: 'unique_uid-event_name-index', 
        KeyConditionExpression: 'unique_uid = :partitionKey AND event_name = :sortKey',
        FilterExpression : "is_favourite <> :isFav",
        ExpressionAttributeValues: {
          ':partitionKey': userId, // Specify the value for the partition key
          ':sortKey': eventName,
          ':isFav':  true// Specify the value for the sort key
        },
        Limit : 100,        
      };
      if(lastEvaluatedKey){
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
    }
      const result = await docClient.query(params).promise();

      return result;
    }
    catch (err) {
      logger.info(err)
      return err;
    }
  
}

app.post('/setFavourites', async (req,res) => {

  try{

    const userId = req.body.userId;
    const imageUrl = req.body.imageUrl;
    const isFav = req.body.isFav;

    const params = {
      TableName: userOutputTable,
      Key: {
        unique_uid: userId,
        s3_url: imageUrl
      },
      UpdateExpression: 'set is_favourite = :isFav',
      ExpressionAttributeValues: {
          ':isFav': isFav
      },
      ReturnValues: 'UPDATED_NEW'
  };

  const result = await docClient.update(params).promise();
  logger.info("Update succeeded:", result);
  res.send(result);

  }
  catch (err) {
    logger.error("Unable to update item. Error JSON:", err);
    res.status(500).send('Unable to mark the photo as favourite');
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
          
          
          const eventName = imageUrl.split('/')[0];
          logger.info("Image downloading started from cloud: " +imagesBucketName+ "-> "+ imageUrl +"for event - >"+eventName);
          let bucket = imagesBucketName
          if(eventName === 'Convocation_PrathimaCollege'){
               bucket = 'flashbackprathimacollection'
               logger.info(bucket);
          }
          
          const imageData = await s3.getObject({
              Bucket: bucket,
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

      // app.post('/uploadEventImage', upload.single('image'), async (req, res) => {
      //   const file = req.file;
      //   const clientName = req.body.clientName;
      //   const eventName = req.body.eventName;
      //   const fileKey = clientName+eventName +".jpg";
      //   logger.info(fileKey);
      //   const params = {
      //     Bucket: "flashbackeventthumbnail",
      //     Key: fileKey,
      //     Body: file.buffer,
      //     ContentType: file.mimetype,
      //   };
      
      //   try {
      //     const data = await s3.upload(params).promise();
      //     res.json({ imageUrl: data.Location });
      //   } catch (error) {
      //     console.error('Error uploading image:', error);
      //     res.status(500).json({ error: 'Error uploading image' });
      //   }
      // });

      app.post('/createUser', async (req, res) => {
        const  username  = req.body.username;
        let eventName = req.body.eventName;
        const userSource = req.body.userSource;
        const role = req.body.role;
        logger.info("creating user "+username);
      
        try {
          // Check if the user already exists
          if(!eventName)
            {
              eventName = 'SreeChaitanya_CSE_Freshers_2024'
            }
          const existingUser = await getUser(username);
          logger.info("existingUser"+ existingUser);
          if (existingUser && existingUser.potrait_s3_url) {

            const updateParamsUserEvent = {
              TableName: userEventTableName,
              Item: {
                event_name: eventName,
                user_phone_number: username,
                created_date: new Date().toISOString()
              }
            };
            const putResult = await docClient.put(updateParamsUserEvent).promise()
            logger.info('insert in user-event mapping is successful:', eventName);
            return res.json({ error: 'User already exists', status:'exists' });
          }
      
          // Create a new user entry in DynamoDB
          await createUser(username,userSource,role);
          console.log("created sucessfulyy ->"+username)

          const updateParamsUserEvent = {
            TableName: userEventTableName,
            Item: {
              event_name: eventName,
              user_phone_number: username,
              created_date: new Date().toISOString()
            }
          };
          const putResult = await docClient.put(updateParamsUserEvent).promise()
          logger.info('insert in user-event mapping is successful:', eventName);
      
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
      async function createUser(username,userSource,role) {
        const unique_uid = `${username}_Flash_${Math.floor(Math.random() * 1000)}`;
        const params = {
          TableName: userrecordstable,
          Item: {
            user_phone_number: username,
            user_name: username,
            unique_uid: unique_uid,
            created_date: new Date().toISOString(),
            user_source:userSource,
            role:role
          }
        };
      
        await docClient.put(params).promise();
      }
     

      // Route to resize and copy images from a specific subfolder of one S3 bucket to another
      app.post('/api/resize-copy-images', async (req, res) => {
        try {
            const sourceBucket = "flashbackusercollection";
            const sourceFolder = req.body.sourceFolder;
            const destinationBucket = "flashbackimagesthumbnail";
    
            let continuationToken = null;
            let allImageObjects = [];
            logger.info("creating image thumbnails for the event :" +sourceFolder);
    
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
                        .resize(1000, 1000)
                        .jpeg({ quality: 80, force: false }) // Convert image to JPEG with specified quality
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
    
            logger.info("Images from subfolder resized and copied successfully.");
            res.status(200).json({ message: 'Images from subfolder resized and copied successfully.' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.post("/removeSpace",async(req,res)=>{

     // const eventName = req.body.eventName;
        const scanParams = {
          TableName: 'indexed_data',
          ProjectionExpression: 'image_id, user_id, folder_name', // Replace with your table's keys and foldername attribute
          FilterExpression: 'folder_name = :folderName',
          ExpressionAttributeValues: {
            ':folderName': "Aarthi_SriCharan_Wedding_16122022 "
          }
        };
      
        try {
          let allData = [];
          let lastEvaluatedKey = null;
          
          do {
            if (lastEvaluatedKey) {
              scanParams.ExclusiveStartKey = lastEvaluatedKey;
            }
        
            const data = await docClient.scan(scanParams).promise();
            allData = allData.concat(data.Items);
            lastEvaluatedKey = data.LastEvaluatedKey;
        
          } while (lastEvaluatedKey);

          logger.info("Total items retrieved: " + allData.length);

          for (const item of allData) {
            if (item.folder_name && item.folder_name === "Aarthi_SriCharan_Wedding_16122022 ") { 
              const trimmedFolderName = item.folder_name.trim();
      
              logger.info(item);
              const updateParams = {
                TableName: 'indexed_data',
                Key: {
                  'image_id': item.image_id, // Replace with your primary key
                  'user_id': item.user_id // If you have a sort key
                },
                UpdateExpression: 'set folder_name = :newFolderName',
                ExpressionAttributeValues: {
                  ':newFolderName': trimmedFolderName
                }
              };
      
             const resl= await docClient.update(updateParams).promise();
              console.log(`Updated foldername for item with primaryKey: ${item.primaryKey}`);
            }
          }
          res.send("Successful");
        } catch (err) {
          res.status(500).send("error in flow");
          console.error('Error updating foldernames:', err);
        }
    });
    

    app.post("/generateUserIdsForExistingUsers",async(req,res)=>{
        const eventName = req.body.eventName;
         const scanParams = {
           TableName: userEventTableName,
           ProjectionExpression: 'user_phone_number, potrait_s3_url',
           FilterExpression: 'attribute_not_exists(user_id) and event_name = :eventName',
           ExpressionAttributeValues: {
            ":eventName": eventName
          }
         };
       
         try {
           let allData = [];
           let lastEvaluatedKey = null;
           
           do {
             if (lastEvaluatedKey) {
               scanParams.ExclusiveStartKey = lastEvaluatedKey;
             }
         
             const data = await docClient.scan(scanParams).promise();
             allData = allData.concat(data.Items);
             lastEvaluatedKey = data.LastEvaluatedKey;
         
           } while (lastEvaluatedKey);
 
           logger.info("Total items retrieved: " + allData.length);
 
           for (const item of allData) {

            const userParams = {
              TableName: userrecordstable,
              ProjectionExpression: 'user_phone_number, potrait_s3_url',
              FilterExpression: 'user_phone_number = :userPhoneNumber',
              ExpressionAttributeValues: {
               ":userPhoneNumber": item.user_phone_number
             }
            }
            const userData = await docClient.scan(userParams).promise();
            logger.info(item)
            console.log(userData);
            if(userData.Items[0].potrait_s3_url){
            const mappedUser = await mapUserIdAndPhoneNumber(item.user_phone_number,userData.Items[0].potrait_s3_url,eventName,'');
            logger.info("mapped for user: "+mappedUser);
            }
            else{
              logger.info("url not found for user: "+item.user_phone_number+" url: "+item.potrait_s3_url)
            }

           }
           res.send("Successful");
         } catch (err) {
           res.status(500).send("error in flow");
           console.error('Error updating foldernames:', err);
         }
     });
     
     app.post("/saveSelectionFormData",async(req,res)=>{

        const item = req.body;
        try{  

              // Initialize UpdateExpression, ExpressionAttributeNames, and ExpressionAttributeValues
              let updateExpression = 'SET ';
              const expressionAttributeNames = {};
              const expressionAttributeValues = {};
              logger.info("Saving the formData withe event->"+item.event_name+" for the owner -> "+item.form_owner);
              // Iterate over the keys of the item
              for (const key in item) {
                  if (key !== 'event_name' && key !== 'form_owner') {
                      const attributeName = `#${key.replace(/\s+/g, '')}`;
                      const attributeValue = `:${key.replace(/\s+/g, '')}`;
                      
                      updateExpression += `${attributeName} = ${attributeValue}, `;
                      expressionAttributeNames[attributeName] = key;
                      expressionAttributeValues[attributeValue] = item[key];
                  }
              }

              // Remove the trailing comma and space from updateExpression
              updateExpression = updateExpression.slice(0, -2);
              const params = {
                  TableName: formDataTableName,
                  Key: {
                      'event_name': item.event_name,
                      'form_owner': item.form_owner
                  },
                  UpdateExpression: updateExpression,
                  ExpressionAttributeNames: expressionAttributeNames,
                  ExpressionAttributeValues: expressionAttributeValues,
                  ReturnValues: 'UPDATED_NEW'
              };
                  const data = await docClient.update(params).promise();
                  logger.info(`Successfully upserted item with event_name: ${item.event_name}`);
                  res.send(data);
        }
        catch(error){
          logger.info(error.message);
          res.status(500).send(error.message);

        }
     });

     app.get("/getSelectionFormData/:eventName/:formOwner",async(req,res)=>{

      const event_name = req.params.eventName;
      const form_owner = req.params.formOwner;
      try{
        logger.info("fetching form data for event name ->"+event_name +" form owner -> "+form_owner )  
        const params = {
          TableName: formDataTableName, 
          Key:{
            event_name: event_name,
            form_owner: form_owner
          }      
        };  
        const data = await docClient.get(params).promise();
        logger.info("Successfully fetched form data for  event name ->"+event_name +" form owner -> "+form_owner );

        // const clientObject = await getClientObject(event_name);
        // const userObject = await getUserObject(userId);
        // res.send({'data':data.Item,'clientObj':clientObject,'userObj':userObject});
        res.send(data.Item);
      }
      catch(error){
        logger.info(error.message);
        res.status(500).send(error.message);

      }
   });

   app.get("/getUsersWithMultipleEvents", async(req,res)=>{
    try{
      const results = {};
      const params = {
        TableName: userrecordstable,       
      };

      logger.info("started fetching the user event details");
      let items = [];
      let lastEvaluatedKey = null;
      do {
        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }

        const data = await docClient.scan(params).promise();
        items = items.concat(data.Items);
        lastEvaluatedKey = data.LastEvaluatedKey;
      } while (lastEvaluatedKey)
       
        for(const item of items){
          try{
            logger.info("fetching event details for user -> "+item.user_phone_number);
            const eventParams = {
              TableName: userEventTableName,
              IndexName: 'user_event_mapping_GSI', // Specify the GSI name
              KeyConditionExpression: 'user_phone_number = :partitionKey', // Specify the GSI partition and sort key
              ExpressionAttributeValues: {
                ':partitionKey': item.user_phone_number
              }
            };
            //logger.info(eventParams);
            const eventData = await docClient.query(eventParams).promise();
            if (eventData) {
              let userDetail ={};
              const eventCount = eventData.Items.length;
              if (!results[eventCount]) {
                results[eventCount] = [];
              }
              userDetail[item.user_phone_number] = eventData.Items;
              results[eventCount].push(userDetail);
            }
           

          }
          catch(err){
            logger.info(err.message);
            res.status(500).send("Issue");
          }
        }
        logger.info("Succesfully fetched the user event details");
        res.send(results);
    }
    catch(err){
      logger.info(err.message)
      res.status(500).send("Issue");
    }
    
   });
   app.get("/getUsersWithNoSelfie", async(req,res)=>{
    try{
      const results = {};
      const params = {
        TableName: userrecordstable, 
        FilterExpression: 'attribute_not_exists(potrait_s3_url)'      
      };

      logger.info("started fetching the user event details");
      let items = [];
      let lastEvaluatedKey = null;
      do {
        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }

        const data = await docClient.scan(params).promise();
        items = items.concat(data.Items);
        lastEvaluatedKey = data.LastEvaluatedKey;
      } while (lastEvaluatedKey)
        let count = 0;
        for(const item of items){
          try{
            logger.info("fetching event details for user with no selfie-> "+item.user_phone_number);
            const eventParams = {
              TableName: userEventTableName,
              IndexName: 'user_event_mapping_GSI', // Specify the GSI name
              KeyConditionExpression: 'user_phone_number = :partitionKey', // Specify the GSI partition and sort key
              ExpressionAttributeValues: {
                ':partitionKey': item.user_phone_number
              }
            };
            //logger.info(eventParams);
            const eventData = await docClient.query(eventParams).promise();
            
            if (eventData) {
              let userDetail ={};
              const event = eventData.Items[0].event_name;
              if (!results[event]) {
                results[event] = [];
              }
              userDetail[item.user_phone_number] = eventData.Items;
              results[event].push(userDetail);
              count++;
            }

          }
          catch(err){
            logger.info(err.message);
            res.status(500).send("Issue");
          }
        }
        logger.info("Succesfully fetched the user with no selfie event details " +count);

        const workbook = new ExcelJS.Workbook();
        for (const [eventName, eventData] of Object.entries(results)) {
          const worksheet = workbook.addWorksheet(eventName);
      
          // Add headers
          worksheet.columns = [
            { header: 'Phone Number', key: 'user_phone_number', width: 20 },
            { header: 'Created Date', key: 'created_date', width: 25 },
            { header: 'Event Name', key: 'event_name', width: 30 }
          ];
      
          // Iterate over each item and add rows to the worksheet
          eventData.forEach(item => {
            Object.values(item).forEach(events => {
              events.forEach(event => {
                worksheet.addRow(event);
              });
            });
          });
        }
      
        // Set the response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=events.xlsx');
        // Write the workbook to the response
        await workbook.xlsx.write(res);
        res.end();
    }
    catch(err){
      logger.info(err.message)
      res.status(500).send("Issue");
    }
    
   });

   async function getImagesForUser(userId) {
    logger.info("Fetching images of users ->"+userId);
    const params = {
        TableName: indexedDataTableName,
        IndexName: 'user_id-index',  
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
            ':user_id': userId
        },
        ProjectionExpression: 's3_url'
    };

    const result = await docClient.query(params).promise();
    logger.info("Total images fetched for user->"+userId+" : "+result.Items.length);
    return result.Items.map(item => item.s3_url);
}
   app.post("/getImagesWithUserIds-old",async(req,res)=>{
      const userIds = req.body.userIds;
      const operation = req.body.operation;
      const mode = req.body.mode;
      const eventName = req.body.eventName;
      try {
        // Construct FilterExpression with dynamic userIds
        logger.info(operation);
        let filterExpressions;
        const userConditions = userIds.map((_, index) => `contains(#attr, :val${index})`).join(operation === 'AND' ? ' AND ' : ' OR ');

        // Add the new condition for s3_url containing eventName
        const s3UrlCondition = `contains(s3_url, :eventName)`;

        // Combine the userConditions and s3UrlCondition
        if (userConditions) {
          filterExpressions = `(${userConditions}) AND ${s3UrlCondition}`;
        } else {
          filterExpressions = s3UrlCondition;
        }
      logger.info(filterExpressions);
        const expressionAttributeValues = userIds.reduce((acc, userId, index) => {
          acc[`:val${index}`] = userId;
          return acc;
        }, {});
        expressionAttributeValues[`:eventName`] = eventName;
      
        const params = {
          TableName: recokgImages,
          FilterExpression: filterExpressions,
          ExpressionAttributeNames: {
            '#attr': 'user_ids',
          },
          ExpressionAttributeValues: expressionAttributeValues,
          ProjectionExpression: 's3_url, user_ids, image_id, selected'
        };
      
        let items = [];
        let lastEvaluatedKey = null;
      
        do {
          if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
          }
      
          const data = await docClient.scan(params).promise();
      
          // No need for extra filtering as the FilterExpression already ensures all userIds are included
          let UserItems;
          if(mode === 'Loose'){
          UserItems = data.Items.map(item => ({
              ...item,
              thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + item.s3_url.split("amazonaws.com/")[1]
          }));
          }else{
            UserItems = data.Items.filter(item => 
                item.user_ids.length === userIds.length
            ).map(item => ({
                ...item,
                thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + item.s3_url.split("amazonaws.com/")[1]
            }));
          }
         
      
          items = items.concat(UserItems);
          lastEvaluatedKey = data.LastEvaluatedKey;
        } while (lastEvaluatedKey);
      
        logger.info("Fetching common images of users -> " + userIds);
        logger.info("Total common images fetched for users-> " + userIds + " : " + items.length);
        items.sort((a, b) => a.user_ids.length - b.user_ids.length);
        res.send(items);
      } catch (error) {
        logger.error("Error fetching images: " + error);
        res.status(500).send("Error fetching images");
      }
      
    });

    
    const emotionOrder = ["SAD", "SURPRISED", "FEAR", "HAPPY", "CALM", "ANGRY", "CONFUSED", "DISGUSTED"];

    const getHighestPriorityEmotion = (emotions) => {
      const highestEmotion = emotions[0]; // Assume the first emotion has the highest confidence
      return highestEmotion;
    };

    app.post("/getImagesWithUserIds", async (req, res) => {
      const { userIds, operation, mode, eventName, sort } = req.body;

      logger.info(`Received request to get images with userIds: ${userIds}, operation: ${operation}, mode: ${mode}, eventName: ${eventName}`);

      try {
        let imageIds = new Set();
        let imageDetails = [];

        // Step 1: Iterate over each userId to get imageIds and emotions associated with them
        for (const userId of userIds) {
          let lastEvaluatedKey = null;
          do {
            const params = {
              TableName: indexedDataTableName,
              IndexName: 'user_id-folder_name-index',
              KeyConditionExpression: "user_id = :userId and folder_name = :eventName",
              ExpressionAttributeValues: {
                ":userId": userId,
                ":eventName": eventName
              },
              ProjectionExpression: "image_id, Emotions, user_id",
              ExclusiveStartKey: lastEvaluatedKey
            };

            logger.info(`Querying indexedDataTableName for userId: ${userId} and eventName: ${eventName}`);

            const data = await docClient.query(params).promise();
            data.Items.forEach(item => {
              imageIds.add(item.image_id);
              imageDetails.push(item); // Collect the image details here
            });

            lastEvaluatedKey = data.LastEvaluatedKey;
            logger.info(`Found ${data.Items.length} imageIds for userId: ${userId}, lastEvaluatedKey: ${lastEvaluatedKey}`);
          } while (lastEvaluatedKey);
        }

        if (imageIds.size === 0) {
          logger.info('No images found for the given userIds and eventName');
          return res.send([]);
        }

        logger.info(`Total unique imageIds found: ${imageIds.size}`);

        // Step 2: Fetch user_ids for each image_id from RecogImages table
        const recogImageDetailsPromises = Array.from(imageIds).map(imageId => {
          const params = {
            TableName: recokgImages,
            Key: { image_id: imageId },
            ProjectionExpression: 's3_url, user_ids, image_id, selected'
          };
          return docClient.get(params).promise();
        });

        logger.info('Fetching image details from RecogImages table');

        const recogImageDetailsResults = await Promise.all(recogImageDetailsPromises);
        const recogImageDetailsMap = new Map(recogImageDetailsResults.map(result => [result.Item.image_id, result.Item]));

        logger.info('Fetched image details successfully');

        // Step 3: Combine details and filter based on operation and mode
        let filteredImages;
        if (operation === 'AND' && mode !== 'Loose') {
          // AND + Strict: Images that have exactly the specified user IDs
          filteredImages = imageDetails.filter(item =>
            userIds.length === recogImageDetailsMap.get(item.image_id).user_ids.length &&
            userIds.every(userId => recogImageDetailsMap.get(item.image_id).user_ids.includes(userId))
          );
          logger.info(`Filtered images with AND + Strict. Count: ${filteredImages.length}`);
        } else if (operation === 'AND' && mode === 'Loose') {
          // AND + Loose: Images that have all the specified user IDs but may also have other user IDs
          filteredImages = imageDetails.filter(item =>
            userIds.every(userId => recogImageDetailsMap.get(item.image_id).user_ids.includes(userId))
          );
          logger.info(`Filtered images with AND + Loose. Count: ${filteredImages.length}`);
        } else if (operation === 'OR' && mode === 'Loose') {
          // OR + Loose: Images that have at least one of the specified user IDs but may also have other user IDs
          filteredImages = imageDetails.filter(item =>
            userIds.some(userId => recogImageDetailsMap.get(item.image_id).user_ids.includes(userId))
          );
          logger.info(`Filtered images with OR + Loose. Count: ${filteredImages.length}`);
        } else {
          logger.error('Invalid operation or mode specified');
          throw new Error('Invalid operation or mode specified');
        }

        // Step 4: Enrich with highest emotion and sort the images
        const items = filteredImages.map(item => {
          const recogDetails = recogImageDetailsMap.get(item.image_id);
          let highestEmotion = null;

          if (recogDetails.user_ids.length === 1 && item.Emotions) {
            try {
              const emotions = JSON.parse(item.Emotions);
              // logger.info(`Parsed emotions for image_id ${item.image_id}: ${JSON.stringify(emotions)}`);
              highestEmotion = getHighestPriorityEmotion(emotions);
            } catch (error) {
              logger.error(`Error parsing emotions for image_id ${item.image_id}: ${error.message}`);
            }
          }

          return {
            ...recogDetails,
            thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + recogDetails.s3_url.split("amazonaws.com/")[1],
            highestEmotion: highestEmotion ? highestEmotion.Type : null,
            highestEmotionConfidence: highestEmotion ? highestEmotion.Confidence : null
          };
        });

        // Sort items based on the highest emotion and confidence
        items.sort((a, b) => {
          const emotionIndexA = emotionOrder.indexOf(a.highestEmotion);
          const emotionIndexB = emotionOrder.indexOf(b.highestEmotion);
    
          if (emotionIndexA !== emotionIndexB) {
            return emotionIndexA - emotionIndexB;
          }
    
          return b.highestEmotionConfidence - a.highestEmotionConfidence;
        });

        logger.info(`Total images to be returned: ${items.length}`);
        res.send(items);
      } catch (error) {
        logger.error(`Error fetching images: ${error.message}`);
        res.status(500).send("Error fetching images");
      }
    });

    
    app.post("/getCombinationImagesWithUserIds-old", async (req, res) => {
      const userIds = req.body.userIds;
      const eventName = req.body.eventName;
      const minUserCount = 1;  // Minimum number of user IDs that must be present in each image
    
      try {
        // Construct FilterExpression with dynamic userIds
        let filterExpressions = [];
        
        // Map userIds to contains conditions
        userIds.forEach((_, index) => {
          filterExpressions.push(`contains(#attr, :val${index})`);
        });
    
        // Add the new condition for s3_url containing eventName
        const s3UrlCondition = `contains(s3_url, :eventName)`;
    
        // Combine the userConditions and s3UrlCondition
        const combinedUserConditions = filterExpressions.join(" OR ");
        const finalFilterExpression = `(${combinedUserConditions}) AND ${s3UrlCondition}`;
    
        const expressionAttributeValues = userIds.reduce((acc, userId, index) => {
          acc[`:val${index}`] = userId;
          return acc;
        }, {});
        expressionAttributeValues[`:eventName`] = eventName;
    
        const params = {
          TableName: recokgImages,
          FilterExpression: finalFilterExpression,
          ExpressionAttributeNames: {
            '#attr': 'user_ids',
          },
          ExpressionAttributeValues: expressionAttributeValues,
          ProjectionExpression: 's3_url, user_ids, image_id, selected'
        };
    
        let items = [];
        let lastEvaluatedKey = null;
    
        logger.info("Starting scan for images with parameters: ", params);
    
        do {
          if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
          }
    
          const data = await docClient.scan(params).promise();
          logger.info(`Scanned ${data.Items.length} items from DynamoDB`);
    
          // Filter items to ensure they meet the criteria:
          // 1. Contain at least two user IDs.
          // 2. All user IDs in each image are from the provided list of user IDs.
          const filteredItems = data.Items.filter(item => {
            const matchingUserIds = item.user_ids.filter(userId => userIds.includes(userId));
            return matchingUserIds.length >= minUserCount && matchingUserIds.length === item.user_ids.length;
          }).map(item => ({
            ...item,
            thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + item.s3_url.split("amazonaws.com/")[1]
          }));
    
          logger.info(`Filtered ${filteredItems.length} items after applying criteria`);
    
          items = items.concat(filteredItems);
          lastEvaluatedKey = data.LastEvaluatedKey;
        } while (lastEvaluatedKey);
    
        logger.info(`Total items fetched: ${items.length}`);
        items.sort((a, b) => a.user_ids.length - b.user_ids.length);
        res.send(items);
      } catch (error) {
        logger.error("Error fetching images: " + error);
        res.status(500).send("Error fetching images");
      }
    });

    app.post("/getCombinationImagesWithUserIds", async (req, res) => {
      const { userIds, eventName } = req.body;
      const minUserCount = 1; // Minimum number of user IDs that must be present in each image
      
      logger.info(`Received request to get images with userIds: ${userIds}, eventName: ${eventName}`);
    
      try {
        let imageIds = new Set();
        let imageDetails = [];
    
        // Step 1: Iterate over each userId to get imageIds associated with them
        for (const userId of userIds) {
          let lastEvaluatedKey = null;
          do {
            const params = {
              TableName: indexedDataTableName,
              IndexName: 'user_id-folder_name-index',
              KeyConditionExpression: "user_id = :userId and folder_name = :eventName",
              ExpressionAttributeValues: {
                ":userId": userId,
                ":eventName": eventName
              },
              ProjectionExpression: "image_id, Emotions, user_id",
              ExclusiveStartKey: lastEvaluatedKey
            };
    
            logger.info(`Querying indexedDataTableName for userId: ${userId} and eventName: ${eventName}`);
    
            const data = await docClient.query(params).promise();
            data.Items.forEach(item => {
              imageIds.add(item.image_id);
              imageDetails.push(item); // Collect the image details here
            });
    
            lastEvaluatedKey = data.LastEvaluatedKey;
            logger.info(`Found ${data.Items.length} imageIds for userId: ${userId}, lastEvaluatedKey: ${lastEvaluatedKey}`);
          } while (lastEvaluatedKey);
        }
    
        if (imageIds.size === 0) {
          logger.info('No images found for the given userIds and eventName');
          return res.send([]);
        }
    
        logger.info(`Total unique imageIds found: ${imageIds.size}`);
    
        // Step 2: Fetch user_ids for each image_id from RecogImages table
        const imageDetailsPromises = Array.from(imageIds).map(imageId => {
          const params = {
            TableName: recokgImages,
            Key: { image_id: imageId },
            ProjectionExpression: 's3_url, user_ids, image_id, selected'
          };
          return docClient.get(params).promise();
        });
    
        logger.info('Fetching image details from RecogImages table');
    
        const imageDetailsResults = await Promise.all(imageDetailsPromises);
        const recogImageDetailsMap = new Map(imageDetailsResults.map(result => [result.Item.image_id, result.Item]));
    
        logger.info('Fetched image details successfully');
    
        // Step 3: Combine details and filter based on operation and mode
        const filteredImages = imageDetails.filter(item => {
          const recogDetails = recogImageDetailsMap.get(item.image_id);
          if (!recogDetails) return false;
    
          const matchingUserIds = recogDetails.user_ids.filter(userId => userIds.includes(userId));
          return matchingUserIds.length >= minUserCount && matchingUserIds.length === recogDetails.user_ids.length;
        });
    
        logger.info(`Filtered images based on user IDs and event name. Count: ${filteredImages.length}`);
    
        // Step 4: Enrich with primary emotion and sort the images
        const items = filteredImages.map(item => {
          const recogDetails = recogImageDetailsMap.get(item.image_id);
          let primaryEmotion = null;
    
          if (recogDetails.user_ids.length === 1 && item.Emotions) {
            try {
              const emotions = JSON.parse(item.Emotions);
              // logger.info(`Parsed emotions for image_id ${item.image_id}: ${JSON.stringify(emotions)}`);
              highestEmotion = getHighestPriorityEmotion(emotions);
            } catch (error) {
              logger.error(`Error parsing emotions for image_id ${item.image_id}: ${error.message}`);
            }
          }
    
          return {
            ...recogDetails,
            thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + recogDetails.s3_url.split("amazonaws.com/")[1],
            highestEmotion: highestEmotion ? highestEmotion.Type : null,
            highestEmotionConfidence: highestEmotion ? highestEmotion.Confidence : null
          };
        });
    
        // Sort items based on the primary emotion
        items.sort((a, b) => {
          // Sort by the number of user IDs in each image
          if (a.user_ids.length !== b.user_ids.length) {
            return a.user_ids.length - b.user_ids.length;
          }
    
          // Sort by primary emotion order
          const emotionIndexA = emotionOrder.indexOf(a.primaryEmotion);
          const emotionIndexB = emotionOrder.indexOf(b.primaryEmotion);
    
          if (emotionIndexA !== emotionIndexB) {
            return (emotionIndexA !== -1 ? emotionIndexA : emotionOrder.length) - (emotionIndexB !== -1 ? emotionIndexB : emotionOrder.length);
          }
    
          // Sort by confidence level of the primary emotion
          return b.primaryEmotionConfidence - a.primaryEmotionConfidence;
        });
    
        logger.info(`Total images to be returned: ${items.length}`);
        res.send(items);
      } catch (error) {
        logger.error(`Error fetching images: ${error.message}`);
        res.status(500).send("Error fetching images");
      }
    });
    
    

    app.post("/fillUserIdsforImageIds",async (req,res)=>{
     
      logger.info("started filling userids");
      try{
        const imageParams ={
          TableName: recokgImages, 
          ProjectionExpression: 'image_id',
          FilterExpression: 'attribute_not_exists(user_ids)'      

        }
        let lastEvaluatedKey = null;
        let images=[];
        do {
          if (lastEvaluatedKey) {
            imageParams.ExclusiveStartKey = lastEvaluatedKey;
          }
          const imagesResult = await docClient.scan(imageParams).promise();
          images = images.concat(imagesResult.Items);
          lastEvaluatedKey = imagesResult.LastEvaluatedKey;
        } while (lastEvaluatedKey);
        // Iterate over each image and fetch corresponding user IDs
        for (const image of images) {
          const imageName = image.image_id;
    
          // Query users table to get list of user IDs for the image
          const usersResult = await docClient.query({
            TableName: indexedDataTableName,
            // IndexName: 'user_id-index',
            KeyConditionExpression: 'image_id = :image',
            ProjectionExpression: 'user_id',
            ExpressionAttributeValues: {
              ':image': imageName
            }
          }).promise();
    
          const userIds = usersResult.Items.map(item => item.user_id);
          const userIdsAsString = userIds.map(id => String(id));

          logger.info(`Formatted user IDs for image ${imageName}: ${JSON.stringify(userIdsAsString)}`);
          //Update images table with the list of user IDs
          await docClient.update({
            TableName: recokgImages,
            Key: { image_id: imageName },
            UpdateExpression: 'set user_ids = :userIds',
            ExpressionAttributeValues: {
              ':userIds': userIdsAsString
            }
          }).promise();
        }
    
        console.log('Successfully updated images with user IDs');
        res.send(images);

    
      }
      catch(err){
        logger.info(err.message);
        res.status(500).send(err.message);
      }
    });

    app.get("/fetchSolosByUserId/:userId", async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const params = {
          TableName: recokgImages,
          FilterExpression: 'contains(#attr, :val)',
          ExpressionAttributeNames: {
            '#attr': 'user_ids',
          },
          ExpressionAttributeValues: {
            ':val': userId, 
          },
           ProjectionExpression: 's3_url, user_ids, image_id, selected'
        };
        let items = [];
        let lastEvaluatedKey = null;
        do {
            if (lastEvaluatedKey) {
                params.ExclusiveStartKey = lastEvaluatedKey;
            }

            const data = await docClient.scan(params).promise();
            const strictlySingleUserItems = data.Items.filter(item => 
                item.user_ids.length === 1 && item.user_ids.includes(userId)
            ).map(item => ({
                ...item,
                thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + item.s3_url.split("amazonaws.com/")[1]
            }));
            items = items.concat(strictlySingleUserItems);
          lastEvaluatedKey = data.LastEvaluatedKey;
       } while (lastEvaluatedKey)

        logger.info("Total Solos fetched for user->" + userId + " : " + items.length);
        res.send(items);
    } catch (err) {
        logger.info(err.message);
        res.status(500).send(err.message);
    }
});


app.post("/saveSelectedImage", async (req, res) => {
  logger.info("Updating Selected Image");
  const imageId  = req.body.imageId;
  const value = req.body.value
  logger.info("Updating Selected Image"+imageId+":"+value);
  try {
    const imageParams = {
      TableName: recokgImages,
      Key: {
        image_id: imageId
      },
      UpdateExpression: "set #selected = :selected",
      ExpressionAttributeNames: {
        "#selected": "selected"
      },
      ExpressionAttributeValues: {
        ":selected": value
      },
      ReturnValues: "UPDATED_NEW"
    };

    const result = await docClient.update(imageParams).promise();
    logger.info(`Image ${imageId} updated successfully: ${JSON.stringify(result)}`);
    res.status(200).send(result);
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});



// app.post('/saveProjectDetails', upload.single('image'), async (req, res) => {
//   const file = req.file;
//   const projectName = req.body.projectName;
//   const clientName = req.body.clientName;
//   const projectType = req.body.projectType;
//   const events = req.body.events;

//   logger.info('Saving project Info:', projectName); 

//   const fileKey = `${projectName}-${clientName}.jpg`;

//   const params = {
//     Bucket: "flashbackeventthumbnail",
//     Key: fileKey,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//   };


//   try {
//     // Upload image to S3
//     const data = await s3.upload(params).promise();
//     const imageUrl = data.Location;

//     // Save project details to DynamoDB
//     const projectParams = {
//       TableName: projectsTable,
//       Item: {
//         project_name: projectName,
//         client_name: clientName,
//         project_image: imageUrl,
//         project_created_date:new Date().toISOString(),
//         project_type: projectType
//       },
//     };

//     const putResult = await docClient.put(projectParams).promise();
//     events.map(async (event,index)=>{
//       const eventParams = {
//         TableName: eventsDataTable,
//         Item: {
//           project_name: projectName,
//           event_name: event,
//           event_created_date:new Date().toISOString(),
//           user_deduplication_processed:false
//         },
//       };
//       const putResult = await docClient.put(eventParams).promise();
//       logger.info("Saved event: ",event);
//       const eventNameWithoutSpaces = event.replace(/\s+/g, '_');
//       const CreateUploadFolderName = `${eventNameWithoutSpaces}`;
//       logger.info('CreateUploadFolderName:', CreateUploadFolderName);
    
//       const createfolderparams = {
//         Bucket: indexBucketName,
//         Key: `${CreateUploadFolderName}/`,
//         Body: ''
//       };
    
//       try {
//         s3.putObject(createfolderparams).promise();
//         logger.info('Folder created successfully:', CreateUploadFolderName);
//       } catch (s3Error) {
//         logger.info('S3 error details:', JSON.stringify(s3Error, null, 2));
//         throw new Error(`Failed to create S3 folder: ${s3Error.message}`);
//       }
//     })

//     logger.info('Project Created Successfully: ' + projectName);
//     res.status(200).send({ message: 'Event Created Successfully', projectName: imageUrl });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Error creating event' });
//   }
// });

app.post('/saveProjectDetails', async (req, res) => {
  const projectName = req.body.projectName;
  const clientName = req.body.clientName;

  logger.info('Saving project Info:', projectName); 

  try {
    // Save project details to DynamoDB
    const projectParams = {
      TableName: projectsTable,
      Item: {
        project_name: projectName,
        client_name: clientName,
        project_created_date:new Date().toISOString()
      },
    };

    const putResult = await docClient.put(projectParams).promise();

    logger.info('Project Created Successfully: ' + projectName);
    res.status(200).send({ message: 'Project Created Successfully',data:projectName});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
});



app.post('/saveEventDetails', upload.single('eventImage'), async (req, res) => {
  const file = req.file;
  //  logger.info(file);
  const {
    eventName,
    eventDate,
    projectName,
    clientName,
    eventLocation,
    invitationNote,
    invitation_url
  } = req.body;

  logger.info('Event Location:', eventLocation); 

 

  const eventNameWithoutSpaces = eventName.replace(/\s+/g, '_');
  const clientNameWithoutSpaces = clientName.replace(/\s+/g, '_');
  const CreateUploadFolderName = `${eventNameWithoutSpaces}_${clientNameWithoutSpaces}`;
  logger.info('CreateUploadFolderName:', CreateUploadFolderName);
  const fileKey = `${CreateUploadFolderName}.jpg`;

  const createfolderparams = {
    Bucket: indexBucketName,
    Key: `${CreateUploadFolderName}/`,
    Body: ''
  };

  const params = {
    Bucket: "flashbackeventthumbnail",
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };


  try {
    s3.putObject(createfolderparams).promise();
    logger.info('Folder created successfully:', CreateUploadFolderName);
  } catch (s3Error) {
    logger.info('S3 error details:', JSON.stringify(s3Error, null, 2));
    throw new Error(`Failed to create S3 folder: ${s3Error.message}`);
  }

  try {
    // Upload image to S3

    const data = await s3.upload(params).promise();
    const imageUrl = data.Location;

    // Save event details to DynamoDB
    const eventNameWithoutSpaces = eventName.replace(/\s+/g, '_');
    const clientNameWithoutSpaces = clientName.replace(/\s+/g, '_');
    const CreateUploadFolderName = `${eventNameWithoutSpaces}_${clientNameWithoutSpaces}`;
    logger.info('CreateUploadFolderName:', CreateUploadFolderName);
  
    const eventParams = {
      TableName: eventsTable,
      Item: {
        event_name: CreateUploadFolderName,
        project_name:projectName,
        client_name: clientName,
        event_date: eventDate,
        event_location: eventLocation,
        invitation_note: invitationNote,
        invitation_url: invitation_url,
        event_image: imageUrl,
        folder_name: CreateUploadFolderName
      },
    };

    const putResult = await docClient.put(eventParams).promise();
    logger.info('Event Created Successfully: ' + eventName);
    res.status(200).send({ message: 'Event Created Successfully', data: putResult });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
});
app.get("/getClientEventDetails/:clientName", async (req, res) => {
  
  const clientName = req.params.clientName; // Adjust based on your token payload
  logger.info(`Fetching event details for ${clientName}`)
  try {
    const eventParams = {
      TableName: eventsTable,
      FilterExpression: "client_name = :clientName",
      ExpressionAttributeValues: {
        ":clientName": clientName
      }

    };


    const result = await docClient.scan(eventParams).promise();

    if (result.Items && result.Items.length > 0) {
      logger.info(`Fetched event details for ${clientName}`)
      res.status(200).send(result.Items);
    } 
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});

app.get("/getClientDetailsByEventname/:eventName", async (req, res) => {
  
  const eventName = req.params.eventName; // Adjust based on your token payload
  logger.info(`Fetching event details for ${eventName}`)
  try {
   const clientObj = await getClientObject(eventName);
   res.send(clientObj);
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});

app.get("/getUserDetails/:userPhoneNumber", async (req, res) => {
  
  const userPhoneNumber = req.params.userPhoneNumber; // Adjust based on your token payload
  logger.info(`Fetching user details for ${userPhoneNumber}`)
  try {
   const userObj = await getUserObjectByUserPhoneNumber(userPhoneNumber)
   res.send(userObj);
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});


// app.post('/saveEventDetails', upload.single('image'), async (req, res) => {
//   const file = req.file;
//   //  logger.info(file);
//   const {
//     eventName,
//     eventDate,
//     projectName,
//     eventLocation,
//     street,
//     city,
//     state,
//     pinCode,
//     invitationNote,
//     invitation_url
//   } = req.body;

//   logger.info('Event Location:', eventLocation); 

//   const fileKey = `${projectName}-${eventName}.jpg`;

//   const eventNameWithoutSpaces = eventName.replace(/\s+/g, '_');
//   const formattedEventCreateDate = eventDate.split('T')[0].replace(/-/g,'');
//   const CreateUploadFolderName = `${eventNameWithoutSpaces}_${formattedEventCreateDate}`;
//   logger.info('CreateUploadFolderName:', CreateUploadFolderName);

//   const createfolderparams = {
//     Bucket: indexBucketName,
//     Key: `${CreateUploadFolderName}/`,
//     Body: ''
//   };

//   const params = {
//     Bucket: "flashbackeventthumbnail",
//     Key: fileKey,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//   };


//   try {
//     s3.putObject(createfolderparams).promise();
//     logger.info('Folder created successfully:', CreateUploadFolderName);
//   } catch (s3Error) {
//     logger.info('S3 error details:', JSON.stringify(s3Error, null, 2));
//     throw new Error(`Failed to create S3 folder: ${s3Error.message}`);
//   }

//   try {
//     // Upload image to S3
//     const data = await s3.upload(params).promise();
//     const imageUrl = data.Location;

//     // Save event details to DynamoDB
//     const eventParams = {
//       TableName: eventsTable,
//       Item: {
//         event_name: eventName,
//         client_name: clientName,
//         event_date: eventDate,
//         event_location: eventLocation,
//         street,
//         city,
//         state,
//         pin_code: pinCode,
//         invitation_note: invitationNote,
//         invitation_url: invitation_url,
//         event_image: imageUrl,
//         folder_name: CreateUploadFolderName
//       },
//     };

//     const putResult = await docClient.put(eventParams).promise();
//     logger.info('Event Created Successfully: ' + eventName);
//     res.status(200).send({ message: 'Event Created Successfully', eventImage: imageUrl });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Error creating event' });
//   }
// });


// app.post('/deleteProjectDetails', async (req, res) => {
//   const projectName = req.body.projectName;
//   const clientName = req.body.clientName;

//   logger.info('Deleting project Info:', projectName);

//   const fileKey = `${projectName}-${clientName}.jpg`;

//   // Set up parameters for S3 deletion
//   const deleteParams = {
//     Bucket: "flashbackeventthumbnail",
//     Key: fileKey,
//   };

//   try {
//     // Delete image from S3
//     await s3.deleteObject(deleteParams).promise();
//     logger.info('Image Deleted Successfully:', fileKey);

//     // Set up parameters for deleting project details from DynamoDB
//     const deleteProjectParams = {
//       TableName: projectsTable,
//       Key: {
//         project_name: projectName,
//         client_name: clientName
//       }
//     };

//     // Delete project details from DynamoDB
//     await docClient.delete(deleteProjectParams).promise();
//     logger.info('Project Deleted Successfully:', projectName);

//     // Query for related events in the Events table
//     const scanParams = {
//       TableName: eventsTable,
//       FilterExpression: "project_name = :projectName",
//       ExpressionAttributeValues: {
//         ':projectName': projectName
//       }
//     };

//     const eventsData = await docClient.scan(scanParams).promise();

//     // Extract S3 keys from event URLs and delete the events
//     const deleteEventPromises = eventsData.Items.map(async event => {
//       const eventImageUrl = event.event_image; // Assuming event_image_url is the field containing the URL
//       const eventFileKey = eventImageUrl.split('/').pop(); // Extract the key from the URL

//       // Delete the event image from S3
//       const deleteEventImageParams = {
//         Bucket: "flashbackeventthumbnail",
//         Key: eventFileKey
//       };
//       await s3.deleteObject(deleteEventImageParams).promise();

//       // Delete the event from DynamoDB
//       const deleteEventParams = {
//         TableName: eventsTable,
//         Key: {
//           event_id: event.event_name // Assuming event_id is the primary key
//         }
//       };
//       return docClient.delete(deleteEventParams).promise();
//     });

//     await Promise.all(deleteEventPromises);
//     logger.info('All related events and their images deleted successfully.');

//     res.status(200).send({ message: 'Project and related events deleted successfully' });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Error deleting project and related events' });
//   }
// });


app.put('/updateEvent/:eventName/:projectName', async (req, res) => {
  const { eventName, projectName } = req.params;
  const {
    invitationNote,
    eventLocation,
    street,
    city,
    state: newState,
    pinCode,
    invitation_url
  } = req.body;

  const updateParams = {
    TableName: eventsTable,
    Key: {
      event_name: eventName,
      project_name: projectName,
    },
    UpdateExpression: "set event_location = :eventLocation, invitation_note = :invitationNote, street = :street, city = :city, #st = :state, pin_code = :pinCode, invitation_url = :invitation_url",
    ExpressionAttributeNames: {
      "#st": "state",
    },
    ExpressionAttributeValues: {
      ":eventLocation": eventLocation,
      ":invitationNote": invitationNote,
      ":street": street,
      ":city": city,
      ":state": newState,
      ":pinCode": pinCode,
      ":invitation_url": invitation_url,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await docClient.update(updateParams).promise();
    logger.info(`Updated event: ${eventName} on ${eventDate}`);
    res.status(200).send(result.Attributes);
  } catch (err) {
    logger.info(err.message);
    res.status(500).send({ error: 'Failed to update the event' });
  }
});

app.get("/getEventDetails/:eventName", async (req, res) => {
  
  const eventName = req.params.eventName; // Adjust based on your token payload
  logger.info(`Fetching event details for ${eventName}`)
  try {
    const eventParams = {
      TableName: eventsTable,
      FilterExpression: "event_name = :eventName",
      ExpressionAttributeValues: {
        ":eventName": eventName
      }

    };


    const result = await docClient.scan(eventParams).promise();

    if (result.Items && result.Items.length > 0) {
      logger.info(`Fetched event details for ${eventName}`)
      res.status(200).send(result.Items[0]);
    } else {
      res.status(404).send({ message: "Event not found" });
    }
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});




// API endpoint to delete an event
// app.delete('/deleteEvent/:eventName/:projectName', async (req, res) => {
//   const { eventName, projectName } = req.params;

//   const params = {
//     TableName: eventsTable,
//     Key: {
//       event_name: eventName,
//       project_name: projectName,
//     }
//   };
//   logger.info(params.Key)
//   logger.info("Deletion Started");
//   try {
//     const result = await docClient.delete(params).promise();
//     res.status(200).json({ message: 'Event deleted successfully', result });
//     logger.info("Deletion");
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting event', error: error.message });
//   }
// });

// app.post("/deleteEvent", async (req, res) => {
//   const eventName = req.body.eventName;
//   const eventDate = req.body.projectName;
//   logger.info("Deleting Event: " + eventName);
//     try {
//       const eventParams = {
//         TableName: eventsTable,
//         Key: {
//           event_name: eventName,
//           project_name:projectName
//         }
//       };
//       const deleteResult = await docClient.delete(eventParams).promise();
//       logger.info("Event Deleted Successfully: " + eventName);
//       res.status(200).send({"message": "Event Deleted Successfully"});
//     } catch (err) {
//       logger.info(err.message);
//       res.status(500).send(err.message);
//     }
// });

// API endpoint to delete an event
app.delete('/deleteEvent/:eventName/:eventDate', async (req, res) => {
  const { eventName, eventDate } = req.params;

  const params = {
    TableName: eventsTable,
    Key: {
      event_name: eventName,
      event_date: eventDate,
    }
  };
  logger.info(params.Key)
  logger.info("Deletion Started");
  try {
    const result = await docClient.delete(params).promise();
    res.status(200).json({ message: 'Event deleted successfully', result });
    logger.info("Deletion");
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

app.get("/getProjectDetails/:clientName", async (req, res) => {
  
  const clientName = req.params.clientName; // Adjust based on your token payload
  logger.info(`Fetching event details for ${clientName}`)
  try {
    const projectParams = {
      TableName: projectsTable,
      FilterExpression: "client_name = :clientName",
      ExpressionAttributeValues: {
        ":clientName": clientName
      }

    };


    const result = await docClient.scan(projectParams).promise();

    if (result.Items) {
      logger.info(`Fetched project details for ${clientName}`)
      res.status(200).send(result.Items.map(item => item.project_name));
    }
 
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});


app.get("/getEventDetails/:projectName", async (req, res) => {
  
  const projectName = req.params.projectName; // Adjust based on your token payload
  logger.info(`Fetching event details for ${projectName}`)
  try {
    const projectParams = {
      TableName: projectsTable,
      FilterExpression: "project_name = :projectName",
      ExpressionAttributeValues: {
        ":projectName": projectName
      }

    };


    const result = await docClient.scan(projectParams).promise();

    if (result.Items && result.Items.length > 0) {
      logger.info(`Fetched project details for ${projectName}`)
      res.status(200).send(result.Items);
    } else {
      res.status(404).send({ message: "No events found for this project" });
    }
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});


const uploadStatus = new Map();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());



const imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: imagesBucketName,
    key: function (req, file, cb) {
      const folderName = req.params.folder_name;
      cb(null, `${folderName}/${file.originalname}`);
    }
  })
});

app.post('/uploadFiles/:eventName/:eventDate/:folder_name', upload.array('files', 2000), async (req, res) => {
  try {
    const { eventName, eventDate, folder_name } = req.params;
    const { chunkNumber, totalChunks } = req.body;
    
    const uploadPromises = req.files.map(async (file) => {
      const fileId = `${folder_name}/${file.originalname}`;
      const params = {
        Bucket: imagesBucketName,
        Key: fileId,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      try {
        const result = await s3.upload(params).promise();
        uploadStatus.set(fileId, {
          status: 'completed',
          chunkNumber,
          totalChunks
        });
        return result;
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        uploadStatus.set(fileId, {
          status: 'failed',
          chunkNumber,
          totalChunks,
          error: error.message
        });
        throw error;
      }
    });

    const results = await Promise.allSettled(uploadPromises);

    const successfulUploads = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failedUploads = results.filter(r => r.status === 'rejected').map(r => r.reason);

    res.status(200).json({
      message: 'Upload process completed',
      successfulUploads,
      failedUploads,
      totalFiles: req.files.length
    });
  } catch (error) {
    console.error('Error in upload process:', error);
    res.status(500).json({ error: 'Error in upload process' });
  }
});




app.post("/updateStatus", async (req, res) => {
  const { eventName, newStatus } = req.body;
  logger.info("Fetching User IDs for Event: " + eventName);

  try {
    // Step 1: Scan to get all user_ids with the given event_name and flashback_status = 'triggered'
    const scanParams = {
      TableName: userEventTableName,
      FilterExpression: "event_name = :eventName and flashback_status = :status",
      ExpressionAttributeValues: {
        ":eventName": eventName,
        ":status": "triggered"
      }
    };
    const scanResult = await docClient.scan(scanParams).promise();

    if (scanResult.Items.length === 0) {
      logger.info("No users with 'triggered' status found for Event: " + eventName);
      return res.status(404).send({"message": "No users with 'triggered' status found for the given event"});
    }
    logger.info("Users with 'triggered' status found for Event: " + scanResult.Items.length);
    // Step 2: Update flashback_status for each user_id
    const updatePromises = scanResult.Items.map(item => {
      const updateParams = {
        TableName: userEventTableName,
        Key: {
          event_name: item.event_name,
          user_phone_number: item.user_phone_number
        },
        UpdateExpression: "set flashback_status = :status",
        ExpressionAttributeValues: {
          ":status": newStatus
        },
        ReturnValues: "UPDATED_NEW"
      };
      return docClient.update(updateParams).promise();
    });

    // Execute all update promises
    await Promise.all(updatePromises);
    
    logger.info("Status Updated Successfully for Event: " + eventName);
    res.status(200).send({"message": "Status Updated Successfully for all users of the event"});
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});



app.post("/updateUserClientInteraction", async (req, res) => {
  const { userPhoneNumber, clientName,eventName ,rewardPoints} = req.body;
  let newRewardPoints;
  logger.info("Updating User Client Interaction -> " + userPhoneNumber + ":" + clientName);

  try {
    // Step 1: Check if there is an entry with the given userPhoneNumber and clientName
    // const getParams = {
    //   TableName: userClientInteractionTable,
    //   Key: {
    //     "user_phone_number": userPhoneNumber,
    //     "client_name": clientName
    //   }
    // };

    // const getResult = await docClient.get(getParams).promise();

    const newTimestampEntry = {
      event_name: eventName,
      visited_time: new Date().toISOString()
    };

    let updateParams;

    // if (getResult.Item) {
    //   // Entry exists, update the visited_time_stamp array
    //   updateParams = {
    //     TableName: userClientInteractionTable,
    //     Key: {
    //       "user_phone_number": userPhoneNumber,
    //       "client_name": clientName
    //     },
    //     UpdateExpression: "SET visited_time_obj = list_append(visited_time_obj, :newTimestampEntry)",
    //     ExpressionAttributeValues: {
    //       ":newTimestampEntry": [newTimestampEntry]
    //     },
    //     ReturnValues: "UPDATED_NEW"
    //   };

    //   await docClient.update(updateParams).promise();
    //   logger.info("updated the user client interaction table");
    // } else {
      updateParams = {
        TableName: userClientInteractionTable,
        Item: {
          "user_phone_number": userPhoneNumber,
          "client_name": clientName,
          "visited_time_obj": [newTimestampEntry]
        }
      };

      await docClient.put(updateParams).promise();
      logger.info("updated the user client interaction table");

      // Step 3: Update reward points in the users table
      newRewardPoints = rewardPoints+10;
      const rewardPointsUpdateParams = {
        TableName: userrecordstable,
        Key: { "user_phone_number": userPhoneNumber },
        UpdateExpression: "SET reward_points = :rewardPoints",
        ExpressionAttributeValues: {
          ":rewardPoints": newRewardPoints 
        },
        ReturnValues: "UPDATED_NEW"
      };

      await docClient.update(rewardPointsUpdateParams).promise();
      logger.info("updated the users table with updated reward points");
    

    res.status(200).send({"clientName":clientName,"rewardPoints":newRewardPoints});
  } catch (err) {
    logger.error(err.message);
    res.status(500).send(err.message);
  }
});


app.get("/fetchUserDetails/:userPhoneNumber",async (req,res)=>{

  try{
    const userPhoneNumber =req.params.userPhoneNumber;
    const result = await getUserObjectByUserPhoneNumber(userPhoneNumber);
    res.send({"message":"Successfully fetched user details","data":result});
  }
  catch(err){
    res.status(500).send(err.message);
  }
})

app.post("/updateUserDetails", async (req, res) => {
  const { user_phone_number, ...updateFields } = req.body;

  logger.info("Updating the user info for the user_name: ",user_phone_number)
  
  if (!user_phone_number) {
      return res.status(400).json({ error: "User phone number is required" });
  }

  if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "At least one field to update must be provided" });
  }

  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updateFields).forEach(key => {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updateFields[key];
  });

  const params = {
      TableName: userrecordstable,
      Key: {
          user_phone_number: user_phone_number
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
  };

  try {
      const result = await docClient.update(params).promise();
      res.status(200).json({ message: "User details updated successfully", data: result.Attributes });
  } catch (error) {
      console.error("Error updating user details:", error);
      res.status(500).json({ error: "Could not update user details" });
  }
});

app.post("/saveProShareDetails",async (req, res) =>{

  const user = req.body.user;
  const eventName = req.body.eventName;
  const sharedUser = req.body.sharedUser;
  try{
     const proParams ={
      TableName:proShareDataTable,
      Item: {
        "user": user,
        "event_name": eventName,
        "shared_user": sharedUser,
        "user-event_name":user+"-"+eventName,
      }
    };

    result = await docClient.put(proParams).promise();
    logger.info("insert the record of sharing link by user : "+user+" to user : "+sharedUser+" of the event : "+eventName);
    res.send({"message":"Successfully inserted record",data:result.Items})
     }
  catch(err){
    res.status(500).send(err.message);
  }

});

app.post("/getImageUserIdCount", async (req, res) => {
  const { user_id, eventName } = req.body;
  
  logger.info(`Received request to get images for user_id: ${user_id} with eventName: ${eventName}`);

  try {
    let imageIds = new Set();

    // Step 1: Query indexedDataTableName to get imageIds associated with the user_id and eventName
    let lastEvaluatedKey = null;
    do {
      const params = {
        TableName: indexedDataTableName,
        IndexName: 'user_id-folder_name-index',
        KeyConditionExpression: "user_id = :userId and folder_name = :eventName",
        ExpressionAttributeValues: {
          ":userId": user_id,
          ":eventName": eventName
        },
        ProjectionExpression: "image_id",
        ExclusiveStartKey: lastEvaluatedKey
      };

      logger.info(`Querying indexedDataTableName for user_id: ${user_id} and eventName: ${eventName}`);

      const data = await docClient.query(params).promise();
      data.Items.forEach(item => {
        imageIds.add(item.image_id);
      });

      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    if (imageIds.size === 0) {
      logger.info('No images found for the given user_id and eventName');
      return res.send([]);
    }

    logger.info(`Total unique imageIds found: ${imageIds.size}`);

    // Step 2: Fetch user_ids for each image_id from RecogImages table
    const imageDetailsPromises = Array.from(imageIds).map(imageId => {
      const params = {
        TableName: recokgImages,
        Key: { image_id: imageId },
        ProjectionExpression: 'user_ids'
      };
      return docClient.get(params).promise();
    });

    logger.info('Fetching image details from RecogImages table');

    const imageDetailsResults = await Promise.all(imageDetailsPromises);
    const userIdMap = {};

    imageDetailsResults.forEach(result => {
      if (result.Item && result.Item.user_ids) {
        result.Item.user_ids.forEach(id => {
          if (!userIdMap[id]) {
            userIdMap[id] = 0;
          }
          userIdMap[id]++;
        });
      }
    });

    // Step 3: Fetch userThumbnails from EventTable using scan
    const scanParams = {
      TableName: eventsTable,
      FilterExpression: 'event_name = :eventName',
      ExpressionAttributeValues: {
        ':eventName': eventName
      },
      ProjectionExpression: 'userThumbnails'
    };

    const scanResult = await docClient.scan(scanParams).promise();
    if (scanResult.Items.length === 0 || !scanResult.Items[0].userThumbnails) {
      logger.info('No userThumbnails found in EventTable for the given event');
      return res.send(userIdMap);
    }

    const userThumbnails = scanResult.Items[0].userThumbnails;

    // Step 4: Enrich userIdMap with avgAge and gender
    const enrichedUserIdMap = Object.entries(userIdMap).map(([userId, count]) => {
      const userThumbnail = userThumbnails.find(thumbnail => thumbnail.user_id === userId);
      return {
        user_id: userId,
        count: count,
        avgAge: userThumbnail ? userThumbnail.avgAge : null,
        gender: userThumbnail ? userThumbnail.gender : null
      };
    });

    // Step 5: Sort the enriched userIdMap by count
    enrichedUserIdMap.sort((a, b) => b.count - a.count);

    logger.info('Sorted and enriched user_id map successfully');

    res.send(enrichedUserIdMap);
  } catch (error) {
    logger.error(`Error fetching images: ${error.message}`);
    res.status(500).send("Error fetching images");
  }
});

app.get("/getFamilySuggestions/:user_id/:eventName", async (req, res) => {
  const { user_id, eventName } = req.params;
  
  logger.info(`Received request to get family suggestions for user_id: ${user_id} with eventName: ${eventName}`);

  try {
    let imageIds = new Set();

    // Step 1: Query indexedDataTableName to get imageIds associated with the user_id and eventName
    let lastEvaluatedKey = null;
    do {
      const params = {
        TableName: indexedDataTableName,
        IndexName: 'user_id-folder_name-index',
        KeyConditionExpression: "user_id = :userId and folder_name = :eventName",
        ExpressionAttributeValues: {
          ":userId": user_id,
          ":eventName": eventName
        },
        ProjectionExpression: "image_id",
        ExclusiveStartKey: lastEvaluatedKey
      };

      logger.info(`Querying indexedDataTableName for user_id: ${user_id} and eventName: ${eventName}`);

      const data = await docClient.query(params).promise();
      data.Items.forEach(item => {
        imageIds.add(item.image_id);
      });

      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    if (imageIds.size === 0) {
      logger.info('No images found for the given user_id and eventName');
      return res.send([]);
    }

    logger.info(`Total unique imageIds found: ${imageIds.size}`);

    // Step 2: Fetch user_ids for each image_id from RecogImages table
    const imageDetailsPromises = Array.from(imageIds).map(imageId => {
      const params = {
        TableName: recokgImages,
        Key: { image_id: imageId },
        ProjectionExpression: 'user_ids'
      };
      return docClient.get(params).promise();
    });

    logger.info('Fetching image details from RecogImages table');

    const imageDetailsResults = await Promise.all(imageDetailsPromises);
    const userIdMap = {};

    imageDetailsResults.forEach(result => {
      if (result.Item && result.Item.user_ids) {
        result.Item.user_ids.forEach(id => {
          if (!userIdMap[id]) {
            userIdMap[id] = 0;
          }
          userIdMap[id]++;
        });
      }
    });

    // Step 3: Fetch userThumbnails from EventTable using scan
    const scanParams = {
      TableName: eventsTable,
      FilterExpression: 'event_name = :eventName',
      ExpressionAttributeValues: {
        ':eventName': eventName
      },
      ProjectionExpression: 'userThumbnails'
    };

    const scanResult = await docClient.scan(scanParams).promise();
    if (scanResult.Items.length === 0 || !scanResult.Items[0].userThumbnails) {
      logger.info('No userThumbnails found in EventTable for the given event');
      return res.send(userIdMap);
    }

    const userThumbnails = scanResult.Items[0].userThumbnails;

    // Step 4: Enrich userIdMap with avgAge and gender
    const enrichedUserIdMap = Object.entries(userIdMap).map(([userId, count]) => {
      const userThumbnail = userThumbnails.find(thumbnail => thumbnail.user_id === userId);
      return {
        user_id: userId,
        count: count,
        avgAge: userThumbnail ? userThumbnail.avgAge : null,
        gender: userThumbnail ? userThumbnail.gender : null
      };
    });

    // Step 5: Sort the enriched userIdMap by count
    enrichedUserIdMap.sort((a, b) => b.count - a.count);

    logger.info('Sorted and enriched user_id map successfully');

    // Step 6: Generate Family Suggestions
    const user = enrichedUserIdMap.find(user => user.user_id === user_id);
    if (!user) {
      logger.info('No information found for the provided user_id');
      return res.status(404).send('User not found');
    }

    const userAge = user.avgAge;
    const userGender = user.gender;
    const familySuggestions = {
      father: [],
      mother: [],
      siblings: [],
      spouse: [],
      kids: []
    };

    enrichedUserIdMap.forEach(person => {
      if (person.user_id === user_id) return;

      if (person.gender === 'Male' && person.avgAge >= userAge + 10) {
        if (familySuggestions.father.length < 10) {
          familySuggestions.father.push(person);
        }
      } else if (person.gender === 'Female' && person.avgAge >= userAge + 10) {
        if (familySuggestions.mother.length < 10) {
          familySuggestions.mother.push(person);
        }
      } else if (Math.abs(person.avgAge - userAge) <= 10) {
        if (familySuggestions.siblings.length < 10) {
          familySuggestions.siblings.push(person);
        }
        if (familySuggestions.spouse.length < 10 && person.gender !== userGender) {
          familySuggestions.spouse.push(person);
        }
      } else if (person.avgAge <= userAge - 15) {
        if (familySuggestions.kids.length < 10) {
          familySuggestions.kids.push(person);
        }
      }
    });

    // Sorting the lists based on the count
    familySuggestions.father.sort((a, b) => b.count - a.count); // Higher count first
    familySuggestions.mother.sort((a, b) => b.count - a.count); // Higher count first
    familySuggestions.siblings.sort((a, b) => b.count - a.count); // Higher count first
    familySuggestions.spouse.sort((a, b) => b.count - a.count); // Higher count first
    familySuggestions.kids.sort((a, b) => b.count - a.count); // Higher count first

    res.send(familySuggestions);
  } catch (error) {
    logger.error(`Error fetching images: ${error.message}`);
    res.status(500).send("Error fetching images");
  }
});

  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(PORT, () => {
    logger.info(`Server is running on https://localhost:${PORT}`);
    httpsServer.keepAliveTimeout = 60000; // Increase keep-alive timeout
    httpsServer.headersTimeout = 65000; // Increase headers timeout
  });
  

// //**Uncomment for dev testing and comment when pushing the code to mainline**/ &&&& uncomment the above "https.createServer" code when pushing the code to prod.
//  const server = app.listen(PORT ,() => {
//  logger.info(`Server started on http://localhost:${PORT}`);
//  server.keepAliveTimeout = 60000; // Increase keep-alive timeout
//  server.headersTimeout = 65000; // Increase headers timeout
//  });