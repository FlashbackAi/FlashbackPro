const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const xlsx = require("xlsx");
//const { AmazonCognitoIdentity, userPool } = require('./config', 'aws-sdk');
//const { CognitoUserPool, CognitoUserAttribute } = require('amazon-cognito-identity-js');
const archiver = require('archiver');
const http = require('http');
// const { fold, last } = require('prelude-ls');
const { func } = require('prop-types');
const app = express();
const PORT = process.env.PORT || 5000;
const { Readable } = require('stream');
//const { set } = require('lodash');
const ExcelJS = require('exceljs');
//const dotenv = require('dotenv');
const WhatsAppSender = require('./WhatsappSender');
const { v4: uuidv4 } = require('uuid');
const busboy = require('busboy');
//const { log } = require('console');
const { Account,AptosConfig, Aptos, AptosClient,Network, TxnBuilderTypes, BCS,Ed25519PrivateKey,AccountAddress } = require( '@aptos-labs/ts-sdk');
const { initializeConfig, getConfig } = require('./config');
const { ENV } = require('./config');
const crypto = require('crypto');
const aptconfig = new AptosConfig({ network: Network.MAINNET});
const aptosClient = new Aptos(aptconfig);
const schedule = require('node-schedule');
const bodyParser = require("body-parser");
const axios = require("axios");
const oldEvents = ["Aarthi_Vinay_19122021","Convocation_PrathimaCollege","KSL_25042024","Jahnavi_Vaishnavi_SC_28042024","KSL_22052024","KSL_16052024","V20_BootCamp_2024","Neha_ShivaTeja_18042024"];
const CHEWY_AMOUNT =500;
const https = require('https');
const HOST = '0.0.0.0';
// const { ethers } = require('ethers');
// const BSC_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545/";
// const provider = new ethers.JsonRpcProvider(BSC_RPC);

// Create an HTTPS agent with rejectUnauthorized set to false
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Ignore self-signed certificate issues
});

const logger = require('./logger');
const e = require('express');
const { userTableName } = require('./MobileApplication/tables');


initializeConfig()
  .then(() => {
const config = getConfig();
const { kms, KMS_KEY_ID } = getConfig();
app.use(cors()); 
app.use(express.json({ limit: '15mb' })); 


// SSR Start
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "SSR"));
app.use(express.static(path.join(__dirname, "SSR/public")));
if (ENV === 'production') {

  const privateKey = fs.readFileSync('/etc/letsencrypt/live/flashback.inc/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/flashback.inc/fullchain.pem', 'utf8');
  
  const credentials = {
    key: privateKey,
    cert: certificate
  }
  
    server = https.createServer(credentials, app);
  } else {
    server = http.createServer(app);
  }
  
  //***** - Uncomment for hitting your machineIPv4:5000 from your emulator/physical device ************* */
  // server.listen(PORT, HOST, () => {
  //   logger.info(`Server is running in ${ENV} mode on ${ENV === 'production' ? 'https' : 'http'}://${HOST}:${PORT}`);
  //   server.keepAliveTimeout = 60000;
  //   server.headersTimeout = 65000;
  // });


  server.listen(PORT, () => {
    logger.info(`Server is running in ${ENV} mode on ${ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}`);
    server.keepAliveTimeout = 60000;
    server.headersTimeout = 65000;
  });

const whatsappSender = new WhatsAppSender(
  config.whatsapp.WHATSAPP_ACCESS_TOKEN,
  config.whatsapp.WHATSAPP_PHONE_NUMBER_ID
);
const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: config.awsCredentials.accessKeyId,    // Fetched from Secrets Manager
  secretAccessKey: config.awsCredentials.secretAccessKey,  // Fetched from Secrets Manager
});

const taskProgress = new Map();
const COLLECTION_ID = 'FlashbackUserDataCollection';

app.get("/share/:eventName/:userId", async(req, res) => {
  try{
    const eventName=req.params.eventName
    const userId=req.params.userId
    const redirectTo=req.query.redirectTo
    let redirectUrl=""
    if(!!redirectTo?.length && redirectTo === "photos"){
      redirectUrl=`photosV1/${eventName}/${userId}`
    }
    else if(!!redirectTo?.length && redirectTo === "singleImage"){
      redirectUrl=`sharedImage/${eventName}/${userId}.jpg`
    }
    else{
      redirectUrl = `photosV1/${eventName}/${userId}`;
    } 
    const image = `https://rekognitionuserfaces.s3.amazonaws.com/thumbnails/${userId}.jpg`
    res.render("index",{eventName:req.params.eventName,userId:req.params.userId,image,redirectUrl}); // Assuming you have an "index.ejs" file in the "views" directory
  } catch (err) {
     logger.info("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
  }
});

// SSR ends

// Set up AWS S3
const s3 = new AWS.S3({ // accessKey and SecretKey is being fetched from config.js
    region: 'ap-south-1' // Update with your AWS region 
});

const sns = new AWS.SNS();

const MemoryCarrierARN = 'arn:aws:sns:ap-south-1:768699754860:MemoryShareNotifier.fifo';
const endpoint = 'wss://nh8j3qoqtb.execute-api.ap-south-1.amazonaws.com/production/';
const bucketName = 'flashbackuseruploads';
const userBucketName='flashbackuserthumbnails';
const indexBucketName = 'flashbackusercollection';
const thumbnailBucketName = 'flashbackimagesthumbnail';
const imagesBucketName = 'flashbackusercollection';
const flashbacksBucketname = 'flashbackuserflashbacks';
const MachineVisionCollectionBucketName = 'machinevisionuseruploadcollection';
// const indexBucketName = 'devtestdnd';
// const imagesBucketName = 'devtestdnd';
const portfolioBucketName = 'flashbackportfoliouploads';
const portfolioImagesTable = 'portfolio_images';

const rekognition = new AWS.Rekognition({ region: 'ap-south-1' });


// Setting up AWS DynamoDB
const dynamoDB = new AWS.DynamoDB({ region: 'ap-south-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'ap-south-1' });

const WebSocket = new AWS.ApiGatewayManagementApi({
  endpoint: endpoint
});

// Below are the tables we are using currently
const userrecordstable = 'users';
const userDataTableName = 'userData';
const userUploadsTableName = 'userUploads';
const userFoldersTableName = 'userFolders';
const userEventTableName='user_event_mapping';
const userFlashbackMapping = 'user_flashback_mapping';
const userOutputTable='user_outputs';
const userClientInteractionTable ='user_client_interaction';
const eventsTable = 'events';
const eventsDetailsTable = 'event_details';
const EventCollabs = 'event_collabs';
const deletedEventsTable = 'event_delete'
const deletedUserFlashbackTable = 'user_flashback_delete_details';
const projectsTable = 'projects_data';
const indexedDataTableName = 'indexed_data'
const formDataTableName = 'selectionFormData'; 
const recokgImages = 'RekognitionImageProperties';
const datasetTable = 'datasets';
const modelsTable = 'models';
const proShareDataTable = 'pro_share_data';
const modelToDatsetReqTable ='model_dataset_requests';
const userImageActivityTableName = 'user_image_activity';
const ImageUploadData  = 'image_upload_data';   
const FlashbackImageUploadData  = 'flashbacks_image_upload_data';  
const FlashbackDetailsTable  = 'flashback_details';  
const userFlashbackDetailsTable = 'user_flashbacks';
const walletTransactions = 'wallet_transactions';
const walletDetailsTable = 'wallet_details'
const UserFlashbackImageUploadData = 'user_flashback_upload_data';
const userFlashbackMappingTable = 'user_flashback_mapping';


const ClientId = '6goctqurrumilpurvtnh6s4fl1'
//const cognito = new AWS.CognitoIdentityServiceProvider({region: 'ap-south-1'});
const defaultEvent = 'defaultEvent'



// This function is used to generate the unique random folder_id
const generateRandomId = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

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
    const { type } = req.query; // 'trigger' or 'send'
    const params = {
      TableName: eventsTable,
    };
    
    // Scan the DynamoDB table to fetch all events
    const data = await dynamoDB.scan(params).promise();
    
    let filteredEvents = data.Items.map(item => ({
      name: item.event_name.S,
      status: item.status ? item.status.S : ''
    }));

    if (type === 'trigger') {
      filteredEvents = filteredEvents.filter(event => 
        !event.status
      );
    } else if (type === 'send') {
      filteredEvents = filteredEvents.filter(event => 
        event.status !== 'Flashbacks_Fully_Delivered' || event.status === 'triggered'
      );
    }

    // Return the filtered list of events
    res.json(filteredEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/trigger-flashback', async (req, res) => {
  try {
    const result ={};
    // 
    const  eventName  = req.body.eventName;
    const  folderName = req.body.folderName;
    
     logger.info("Images are being fetched for event : " +eventName);

     const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index', 
      ProjectionExpression: 'user_id, image_id,s3_url,folder_name,faces_in_image',
      KeyConditionExpression: 'folder_name = :folderName',
      ExpressionAttributeValues: {
        // ':folderName': eventName
        ':folderName': folderName
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
        const phoneNumbers = await queryUserEventMapping(folderName);
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

            const mappedUser = await mapUserIdAndPhoneNumber(phoneNumber,portraitS3Url,folderName,'',false);
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
      ':eventName': { S: eventName }, 
      ':flashbackStatus': { S: 'triggered' } 
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
async function indexFile(file) {
  try {
    // Decode the URL-encoded characters in the S3 URL
    if (file.startsWith('data:image')) {
      // Strip the metadata prefix if present
      base64Data = file.replace(/^data:image\/\w+;base64,/, '');
  } else {
      // Assume file is a raw base64 string without prefix
      base64Data = file;
  }
  
  const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const indexingParams = {
      CollectionId: COLLECTION_ID, //your-collection-id' with the ID of your Rekognition collection
      Image: {
        Bytes: imageBuffer
      },
      MaxFaces: 1,
      DetectionAttributes:["ALL"],
      QualityFilter:"AUTO"
    };

    // Call the searchUsersByImage operation
    const data = await rekognition.indexFaces(indexingParams).promise();
    return data;    

  } catch (error) {
    logger.error('Error searching faces by image:', error);
    throw error; // Rethrow the error for the caller to handle
  }
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
      UserMatchThreshold: 98
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
  async function mapUserIdAndPhoneNumber(phoneNumber, imageUrl, eventName, userId, deletePortrait = true) {
    try {
      // Call searchUsersByImage API with portraitS3Url
      const result = await searchUsersByImage(imageUrl, phoneNumber);
      if (!result) {
        logger.info("matched user not found: " + phoneNumber);
        if(deletePortrait) {
        logger.info("deleting the S3 url for unmacthed userId->" + userId);
        const userDeleteParams = {
          TableName: userrecordstable,
          Key: {
            'user_phone_number': phoneNumber
          },
          UpdateExpression: 'REMOVE potrait_s3_url',
          ReturnValues: 'UPDATED_NEW'
        };
  
        const deltResult = docClient.update(userDeleteParams).promise();
        logger.info("deleted the s3 url for userId ->" + userId);
      }
        return;
      }
      const matchedUserId = result.matchedUserId[0];
      if (userId && matchedUserId != userId) {
        logger.info("deleting the S3 url for unmacthed userId->" + matchedUserId);
        const userDeleteParams = {
          TableName: userrecordstable,
          Key: {
            'user_phone_number': phoneNumber
          },
          UpdateExpression: 'REMOVE potrait_s3_url',
          ReturnValues: 'UPDATED_NEW'
        };
  
        const deltResult = docClient.update(userDeleteParams).promise();
        logger.info("deleted the s3 url for userId ->" + matchedUserId);
        return;
      }
      logger.info('Matched userId for the phoneNumber: ' + phoneNumber + ' and imageUrl: ' + imageUrl + 'is :', matchedUserId);
      const userUpdateParams = {
        TableName: userrecordstable,
        Key: {
          'user_phone_number': phoneNumber
        },
        UpdateExpression: 'set user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': matchedUserId
        },
        ReturnValues: 'UPDATED_NEW'
      };
  
      try {
        const userResult = await docClient.update(userUpdateParams).promise();
        
        // Call the new function for updating event mapping
        // Commented to test thumbnails issue
        //await updateEventMappingWithUserId(phoneNumber, eventName, matchedUserId);
        
        logger.info('Updated userId and flashback status for :' + phoneNumber);
        return userResult;
      } catch (error) {
        logger.info("Failure in updating the userId in users table: " + error);
        throw error;
      }
  
    } catch (error) {
      logger.info("Error in marking the userId and phone number");
      throw error;
    }
  }

  async function updateEventMappingWithUserId(phoneNumber, eventName, matchedUserId) {
    const userEventUpdateParams = {
      TableName: userEventTableName, // Replace with your table name
      Key: {
        'event_name': eventName,
        'user_phone_number': phoneNumber // Replace with your partition key name
      },
      UpdateExpression: 'set flashback_status = :flashbackStatus, user_id = :userId',
      ExpressionAttributeValues: {
        ':flashbackStatus': "triggered",
        ':userId': matchedUserId
      },
      ReturnValues: 'UPDATED_NEW'
    };
  
    try {
      const eventResult = await docClient.update(userEventUpdateParams).promise();
      logger.info('Updated userId and flashback status for :' + phoneNumber);
      return eventResult;
    } catch (error) {
      logger.info("Failure in updating the userId in users table: " + error);
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

app.post('/send-flashbacks', async (req, res) => {
  const { eventName } = req.body;
  const taskId = uuidv4();

  // Initialize task progress
  taskProgress.set(taskId, { progress: 0, status: 'in_progress' });

  // Start the flashback sending process asynchronously
  await sendFlashbacksAsync(taskId, eventName);

  res.json({ taskId });
});

app.get('/flashback-progress/:taskId', (req, res) => {
  const { taskId } = req.params;
  const progress = taskProgress.get(taskId);

  if (!progress) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(progress);
});

async function getUserForEvent(evetName) {
  try{

    const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index',
      ProjectionExpression: 'user_id, image_id, Gender_Value, AgeRange_Low, AgeRange_High',
      KeyConditionExpression: 'folder_name = :folderName',
      ExpressionAttributeValues: {
        ':folderName': evetName
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
    
      if (!userCountMap.has(userId)) {
        userCountMap.set(userId, { userId, count: 0, });
      }
      const userInfo = userCountMap.get(userId);
      userInfo.count += 1;
      userCountMap.set(userId, userInfo);
    });

    logger.info("Total number of user userIds fetched: " + userCountMap.size);
    const userIds = Array.from(userCountMap.keys());
    return userIds
   
  }
  catch(error){
    return error;
  }
  
}
async function sendFlashbacksAsync(taskId, eventName) {
  try {
    const usersForEvent = await getUserForEvent(eventName);
    const userEventMappings = await getUserEventMappings(eventName);
    logger.info(`Started sending Whatsapp Messages for event: ${eventName}`); // Log the start of the process

    let status = 'Flashbacks_Fully_Delivered';
    let sentUsers = 0; // Initialize sentUsers to track the number of messages sent successfully

    // Create a map of userEventMappings with user_phone_number as key
    const userEventMappingMap = new Map();
    for (const mapping of userEventMappings) {
      if(mapping && mapping.user_phone_number)
      userEventMappingMap.set(mapping.user_phone_number, mapping);
    }
    logger.info(`Created user event mapping map with ${userEventMappingMap.size} entries`); // Log the size of the mapping map

    for (const userId of usersForEvent) {
      const userData = await getUserObjectByUserId(userId);
      if(!userData){
        logger.info("User id is not a registered user : ",userId);
        continue;
      }
      const user_phone_number = userData.user_phone_number;

      logger.info(`Processing user: ${user_phone_number}`); // Log the user being processed

      // Check if userEventMappings has an entry with user_phone_number
      const existingMapping = userEventMappingMap.get(user_phone_number);
      const isUserMapped = !!existingMapping;

      if (!isUserMapped) {
        logger.info(`User ${user_phone_number} is already mapped to event ${eventName}`); // Log if the user is already mapped
        await mapUserToEvent(eventName, user_phone_number);
        await updateEventMappingWithUserId(user_phone_number,eventName,userData.user_id);
        logger.info(`Mapped user ${user_phone_number} to event ${eventName}`); // Log the mapping action
      }

      if (userData && userData.user_id && userData.potrait_s3_url && 
          (!isUserMapped || (isUserMapped && existingMapping.flashback_status !== 'Flashback_Delivered'))) {
        try {
          await sendWhatsAppMessage(user_phone_number, eventName, userData.user_id);

          await updateUserDeliveryStatus(eventName, user_phone_number, 'Flashback_Delivered');

          await storeSentData(user_phone_number, eventName, `https://flashback.inc:5000/share/${eventName}/${userData.user_id}`);

          logger.info(`Successfully sent WhatsApp message to ${user_phone_number}`); 
        } catch (error) {
          logger.error(`Error sending message to ${user_phone_number}: ${error.message}`); // Log error in sending message
        }
      } else {
        logger.info(`Skipping user ${user_phone_number} as message is already delivered or user is not eligible`); // Log if the user is skipped
      }
    }

    await updateEventFlashbackStatus(eventName, 'triggered');
    logger.info(`Updated event flashback status for ${eventName} to 'triggered'`); // Log the event status update

    // Mark task as completed
    taskProgress.set(taskId, { progress: 100, status: 'completed' });
    logger.info(`Completed sending Whatsapp messages for event: ${eventName}, total users processed: ${sentUsers}`); // Log the completion of the process
  } catch (error) {
    logger.error(`Error sending flashbacks for event ${eventName}: ${error.message}`); // Log error in the entire process
    taskProgress.set(taskId, { progress: 0, status: 'failed' });
  }
}


async function sendWhatsAppMessage(phoneNumber, eventName, userId) {
  try {
    const eventDetails = await getEventDetailsByFolderName(eventName)
    await whatsappSender.sendMessage(phoneNumber,eventDetails.folder_name, eventDetails.event_name, userId);
    logger.info(`WhatsApp message sent successfully to ${phoneNumber} for the event: ${eventName}`);
  } catch (error) {
    console.error(`Error sending WhatsApp message to ${phoneNumber}:`, error);
    throw error;
  }
}

app.get('/fetch-sent-data', async (req, res) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const params = {
      TableName: 'FlashbackDeliveryHistory',
      FilterExpression: '#date >= :threeDaysAgo',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':threeDaysAgo': threeDaysAgo.toISOString()
      }
    };

    const data = await docClient.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    console.error('Error fetching sent data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function getUserEventMappings(eventName) {
  const params = {
    TableName: 'user_event_mapping',
    KeyConditionExpression: 'event_name = :eventName',
    ExpressionAttributeValues: {
      ':eventName': eventName,
    }
  };

  try {
    const result = await docClient.query(params).promise();
    return result.Items;
  } catch (error) {
    console.error('Error fetching user event mappings:', error);
    throw error;
  }
}

async function getEventsForUser(userPhoneNumber) {
  const params = {
    TableName: userEventTableName,
    IndexName:'user_event_mapping_GSI',
    KeyConditionExpression: 'user_phone_number = :userPhoneNumber',
    ExpressionAttributeValues: {
      ':userPhoneNumber': userPhoneNumber,
    }
  };

  try {
    const result = await docClient.query(params).promise();
    return result.Items;
  } catch (error) {
    console.error('Error fetching user event mappings:', error);
    throw error;
  }
}



async function getUsersForEvent(eventName) {
  logger.info("fetching users for event : ", eventName);
  const params = {
    TableName: userEventTableName,
    KeyConditionExpression: 'event_name = :eventName',
    ExpressionAttributeValues: {
      ':eventName': eventName
    }
  };

  try {
    const result = await docClient.query(params).promise();
    logger.info("Successfully fetched users for event : ", eventName)
    return result.Items;
  } catch (error) {
    console.error('Error fetching user event mappings:', error);
    throw error;
  }
}

async function getUserData(phoneNumber) {
  const params = {
    TableName: 'users',
    Key: {
      'user_phone_number': { S: phoneNumber }
    }
  };

  const data = await dynamoDB.getItem(params).promise();
  return data.Item ? AWS.DynamoDB.Converter.unmarshall(data.Item) : null;
}

async function updateUserDeliveryStatus(eventName, phoneNumber, flashback_status) {
  const params = {
    TableName: 'user_event_mapping',
    Key: {
      'event_name': { S: eventName },
      'user_phone_number': { S: phoneNumber }
    },
    UpdateExpression: 'SET flashback_status = :flashback_status',
    ExpressionAttributeValues: {
      ':flashback_status': { S: flashback_status }
    }
  };

  try {
    await dynamoDB.updateItem(params).promise();
    console.log(`Successfully updated status for event: ${eventName}, phone: ${phoneNumber}`);
  } catch (error) {
    console.error('Error updating user event mapping:', error);
    throw error;
  }
}

async function updateEventFlashbackStatus(eventName, status) {
  try {
    // First, query the events table to get the event_date
    logger.info(eventName)
    //const queryResult = await docClient.scan(queryParams).promise();
    const queryResult = await getEventDetailsByFolderName(eventName)

    if (!queryResult) {
      throw new Error(`Event not found: ${eventName}`);
    }

    const eventId = queryResult.event_id;
   
    // Now update the event with the flashback status
    const updateParams = {
      TableName: eventsDetailsTable,
      Key: {
        'event_id': { S: eventId },
      },
      UpdateExpression: 'SET #s = :status',
      ExpressionAttributeNames: {
        '#s': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: status }
      }
    };

    await dynamoDB.updateItem(updateParams).promise();
    console.log(`Successfully updated flashback status for event: ${eventId}`);
  } catch (error) {
    console.error('Error updating event flashback status:', error);
    throw error;
  }
}

async function storeSentData(phoneNumber, eventName, sentLink) {
  const params = {
    TableName: 'FlashbackDeliveryHistory',
    Item: {
      'user_phone_number': { S: phoneNumber },
      'event_name': { S: eventName },
      'url': { S: sentLink },
      'date': { S: new Date().toISOString() }
    }
  };

  await dynamoDB.putItem(params).promise();
}

module.exports = {
  updateUserEventMapping,
  getUserEventMappings,
  updateEventFlashbackStatus,
  sendFlashbacksAsync
};

app.post('/userIdPhoneNumberMapping',async (req,res) =>{

  try{
    const phoneNumber =req.body.phoneNumber;
    const eventName = req.body.eventName;
    const userId = req.body.userId;
    const imageUrl = "https://flashbackuserthumbnails.s3.ap-south-1.amazonaws.com/"+phoneNumber+".jpg";
    const result = await mapUserIdAndPhoneNumber(phoneNumber,imageUrl,eventName,userId,true);
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

// app.post('/login', function(req, res) {
  
//   const  username = req.body.username;
//   const password = req.body.password;

//   const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
//       Username: username,
//       Password: password
//   });
//   const userData = {
//       Username: username,
//       Pool: userPool
//   };
//   const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

//   cognitoUser.authenticateUser(authenticationDetails, {
//       onSuccess: (result) => {
//           const accessToken = result.getAccessToken().getJwtToken();
//           const decodedCAccessToken = result.getIdToken().decodePayload()
         
//           // You can also get idToken and refreshToken here
//           const data={
//             status:'Success',
//             message:'User LoggedIn successfully',
//             accessToken:accessToken,
//             username:decodedCAccessToken['cognito:username']

//           }
//           res.send(data);
//       },
//       onFailure: (err) => {
//         logger.info(err.message)
//           res.status(500).send(err.message);
//       },
//       mfaSetup: (challengeName, challengeParameters) => {
//         // MFA setup logic here
//         // You might want to send a response to the user indicating that MFA setup is required
//         logger.info("usr logged in")
//     },
//   });
// });


// app.post('/forgot-password', (req, res) => {
//   const { email } = req.body;

//   const params = {
//       ClientId: poolData.ClientId,
//       Username: email,
//   };

//   cognitoidentityserviceprovider.forgotPassword(params, (err, data) => {
//       if (err) {
//           console.error(err);
//           res.status(500).json({ message: 'Error initiating password reset' });
//       } else {
//           res.json({ message: 'Password reset initiated, check your email' });
//       }
//   });
// });

// app.post('/reset-password', (req, res) => {
//   const { email, code, newPassword } = req.body;

//   const params = {
//       ClientId: poolData.ClientId,
//       Username: email,
//       ConfirmationCode: code,
//       Password: newPassword,
//   };

//   cognitoidentityserviceprovider.confirmForgotPassword(params, (err, data) => {
//       if (err) {
//           console.error(err);
//           res.status(500).json({ message: 'Error resetting password' });
//       } else {
//           res.json({ message: 'Password reset successfully' });
//       }
//   });
// });

app.post('/sendOTP', async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save the OTP in your database with an expiration time (7 minutes)
    await saveOTP(phoneNumber, otp);
    try {
    // Send the OTP via WhatsApp
    await whatsappSender.sendOTP(phoneNumber, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (whatsappError) {
    logger.error('Error sending OTP via WhatsApp:', whatsappError);
    
    res.status(200).json({ message: 'OTP sent successfully' });
  }
  } catch (error) {
    logger.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Error sending OTP' });
  }
});



app.post('/verifyOTP', async (req, res) => {
  const { phoneNumber, otp, login_platform } = req.body;
  
  try {
    // Verify the OTP from DDB
    const isValid = await verifyOTP(phoneNumber, otp);
    
    if (isValid) {
      logger.info(`User ${phoneNumber} successfully authenticated`);

      await recordLoginHistory(phoneNumber, login_platform);
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(200).json({ success: false, error: 'Invalid OTP' });
    }
  } catch (error) {
    logger.error(`Error verifying OTP for ${phoneNumber}: ${error}`);
    res.status(500).json({ error: 'Error verifying OTP' });
  }
});

async function recordLoginHistory(phoneNumber, login_platform) {
  const params = {
    TableName: 'UserLoginHistory',
    Item: {
      user_phone_number: phoneNumber,
      login_timestamp: new Date().toISOString(),
      login_type: 'Whatsapp_OTP',
      login_status: 'success',
      login_platform: login_platform
    }
  };

  try {
    await docClient.put(params).promise();
    logger.info(`Login history recorded for user ${phoneNumber}`);
  } catch (error) {
    logger.error(`Error recording login history for user ${phoneNumber}: ${error}`);
  }
}

async function saveOTP(phoneNumber, otp) {
  const expirationTime = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now
  
  const params = {
    TableName: 'UserAuthentication',
    Item: {
      phoneNumber: phoneNumber,
      otp: otp,
      expirationTime: expirationTime.toISOString()
    }
  };

  await docClient.put(params).promise();
}

async function verifyOTP(phoneNumber, otp) {
  const params = {
    TableName: 'UserAuthentication', // Replace with your actual table name
    Key: {
      phoneNumber: phoneNumber
    }
  };

  const result = await docClient.get(params).promise();
  
  if (result.Item && result.Item.otp === otp) {
    const currentTime = new Date();
    const expirationTime = new Date(result.Item.expirationTime);
    
    if (currentTime <= expirationTime) {
      // OTP is valid and not expired
      await deleteOTP(phoneNumber); // Remove the OTP after successful verification
      return true;
    }
  }
  
  return false;
}

async function deleteOTP(phoneNumber) {
  const params = {
    TableName: 'UserAuthentication', // Replace with your actual table name
    Key: {
      phoneNumber: phoneNumber
    }
  };

  await docClient.delete(params).promise();
}

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

app.post('/sendRegistrationMessage', async (req, res) => {
  const { user_phone_number,eventId,orgName, portfolioLink} = req.body;

   
    try {
    // Send the OTP via WhatsApp
    const eventDetails = await getEventDetailsById(eventId);
    const event = eventDetails.event_name.split('_').join(' ');

    await whatsappSender.sendRegistrationMessage(user_phone_number,event,orgName,portfolioLink)
    
    await scheduleEventReminder(user_phone_number,eventDetails,portfolioLink);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (whatsappError) {
    logger.error('Error sending Message via WhatsApp:', whatsappError);
    
    res.status(500).json({ message: 'Message sent unsuccessfully' });
  }
});


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



app.post('/images-new/:eventName/:userId', async (req, res) => {
  try {
   
    
     const eventName = req.params.eventName;
     const userId = req.params.userId;
     const isFavourites = req.body.isFavourites;
     const lastEvaluatedKey = req.body.lastEvaluatedKey;

     const eventDetails = await getEventDetailsByFolderName(eventName);
     let isUserRegistered ;
     let clientName;
     let clientObject;
     let userObject;
     if(!oldEvents.includes(eventDetails.event_name))
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
     logger.info("Image are being fetched for event  -> "+eventDetails.event_name+"; userId -> "+userId +"; isFavourites -> "+isFavourites);

     const folder = eventDetails.folder_name;
    const result = await userEventImagesNew(folder,userId,lastEvaluatedKey,isFavourites);
    logger.info("total"+result.Items.length)
    if(!lastEvaluatedKey && isFavourites){
      clientObject = await getClientObjectNew(eventDetails.event_id);
      userObject = await getUserObjectByUserId(userId);
    }
       
    
    result.Items.sort((a, b) => a.faces_in_image - b.faces_in_image);
      const imagesPromises = result.Items.map(async file => {
        const base64ImageData =  {
          "facesCount":file.faces_in_image,
          "thumbnailUrl":"https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/"+file.s3_url.split("amazonaws.com/")[1]
        }
         if(eventDetails.event_name === 'Convocation_PrathimaCollege'){
           base64ImageData.url = "https://flashbackprathimacollection.s3.ap-south-1.amazonaws.com/"+file.s3_url.split("amazonaws.com/")[1];
         }
         else{
           base64ImageData.url = file.s3_url;
         }
          return base64ImageData;
      
    });
      const images = await Promise.all(imagesPromises);
      logger.info('total images fetched for the user -> '+userId+'  in event -> '+eventDetails.event_name +"isFavourites -> "+isFavourites+' : '+result.Count);
      res.json({"images":images, 'totalImages':result.Count,'lastEvaluatedKey':result.LastEvaluatedKey,'clientObj':clientObject,'userObj':userObject});
  }
  } catch (err) {
     logger.info("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
  }
});

app.get('/getEventImages/:eventName', async (req, res) => {
  const { eventName } = req.params;
  const { continuationToken } = req.query;
  const bucketName = thumbnailBucketName; // Replace with your actual bucket name

  if (!eventName) {
    return res.status(400).json({ error: 'eventName parameter is required' });
  }

  try {
    let clientObject = null;

    // Fetch client details only if continuationToken is not provided (first request)
    if (!continuationToken) {
      const eventDetails = await getEventDetailsByFolderName(eventName);
      clientObject = await getClientObjectNew(eventDetails.event_id);
    }

    // Configure S3 list parameters
    const listParams = {
      Bucket: bucketName,
      Prefix: `${eventName}/`,
      MaxKeys: 500 // Fetch 100 images at a time
    };

    // Validate and add ContinuationToken if it's provided
    if (continuationToken) {
      console.log("Received continuationToken:", continuationToken); // Log the token
      listParams.ContinuationToken = continuationToken;
    }

    // Fetch S3 objects
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    const objectUrls = listedObjects.Contents.map(obj => `https://${bucketName}.s3.amazonaws.com/${obj.Key}`);

    // Log the next continuation token
    console.log("Next continuationToken:", listedObjects.NextContinuationToken);

    // Return the response with images, total images, and client details (if fetched)
    res.json({
      images: objectUrls,
      totalImages: listedObjects.KeyCount || listedObjects.Contents.length,
      lastEvaluatedKey: listedObjects.NextContinuationToken,
      clientObj: clientObject
    });
  } catch (error) {
    console.error('Error fetching S3 URLs or client details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get ('/getOwnerFavImages/:folder/:username', async (req, res) => {
  try {
     const folder = req.
     params.folder;
     const username = req.params.username;
     logger.info("fetching images for username ", username)

    const userDetails = await getUserObjectByUserName(username);
    if(!userDetails[0]?.user_id){
      return res.send([]);
    }
    
    const result = await userEventImagesNew(folder,userDetails[0].user_id,'',true);
    logger.info("total images for username ", username," : ",result.Items.length)
    const updatedItems = result.Items.map(item => ({
      ...item,
      thumbnailUrl: `https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/${item.s3_url.split("amazonaws.com/")[1]}`
    }));
    res.json(updatedItems);
  } catch (err) {
     logger.info("Error in S3 get", err);
     res.status(500).json({ error: 'Error getting images from S3' });
  }
});



app.get('/getFlashbackImages/:flashbackName/:eventId', async (req, res) => {
  const { flashbackName, eventId } = req.params;
  const continuationToken = req.query.continuationToken ? JSON.parse(req.query.continuationToken) : undefined;

  // Validate eventId and flashbackName
  if (!flashbackName || !eventId) {
    return res.status(400).json({ error: 'flashbackName and eventId parameters are required' });
  }
  
  logger.info("Fetching Flashback Images for : ", flashbackName);
  
  // DynamoDB query parameters
  const dynamoDbParams = {
    TableName: FlashbackImageUploadData, // Replace with your actual table name
    IndexName:'event_id-flashback_name-index',
    KeyConditionExpression: 'flashback_name = :flashbackName AND event_id = :eventId',
    ExpressionAttributeValues: {
      ':flashbackName': flashbackName,
      ':eventId': eventId
    },
    Limit: 100, // Fetch 100 items per call
    ExclusiveStartKey: continuationToken // Continue from the last token if provided
  };

  try {
    // Query DynamoDB to get s3_url entries
    const result = await docClient.query(dynamoDbParams).promise();

    // Prepare response
    const response = {
      images: result.Items.map(item => item.s3_url), // Extract s3_url from each item
      continuationToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null // Include a continuation token if more results are available
    };
    logger.info("Successfully Fetched Flashback Images for : ", flashbackName);

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching S3 URLs or client details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// async function userEventImages(eventName,userId,lastEvaluatedKey){

//       try {
//       const params = {
//         TableName: userOutputTable,
//         IndexName: 'unique_uid-event_name-index', // Specify the GSI name
//         KeyConditionExpression: 'unique_uid = :partitionKey AND event_name = :sortKey',
//         FilterExpression: "is_favourite <> :isFav",
//         ExpressionAttributeValues: {
//           ':partitionKey': userId, // Specify the value for the partition key
//           ':sortKey': eventName,
//           ':isFav':  true// Specify the value for the sort key
//         },
//         Limit:20
//       };
//       if(lastEvaluatedKey){
//         params.ExclusiveStartKey = lastEvaluatedKey;
//       }
//       const result = await docClient.query(params).promise();
//       logger.info('total images fetched for the user -> '+userId+'  in event -> '+eventName +' : '+result.Count);
//       return result;
//     }
//     catch (err) {
//       logger.info(err)
//       return err;
//     }
  
// }


app.post('/images/:eventName/:userId', async (req, res) => {
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

    const result = await userEventImages(eventName,userId,lastEvaluatedKey,isFavourites);
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
    const clientName = res.Items[0]?.client_name;
    logger.info("fetched clientName"+clientName)
    params = {
      TableName: userrecordstable,
      FilterExpression: "org_name = :clientName",
      ExpressionAttributeValues: {
        ":clientName":clientName
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


async function getClientObjectNew(eventId) {

  try {
    logger.info("fetching client info for eventId -> "+eventId);
    let params = {
      TableName: eventsDetailsTable,
      KeyConditionExpression: 'event_id = :eventId',
      ExpressionAttributeValues: {
        ':eventId': eventId
      },    
    };
    const res = await docClient.query(params).promise();
    const clientName = res.Items[0]?.client_name;
    logger.info("fetched clientName"+clientName)
    params = {
      TableName: userrecordstable,
      FilterExpression: "user_name = :clientName",
      ExpressionAttributeValues: {
        ":clientName":clientName
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
      logger.info("user details not found for userId: ",userId);
      // throw new Error("userId not found");
      return;
    }
    logger.info("user details fetched successfully");
    return result.Items[0];
  } catch (error) {
    console.error("Error getting user object:", error);
    throw error;
  }
}

async function getUserObjectByUserName(userName){
  try{
    logger.info("getting user info for userName : "+userName);
    params = {
      TableName: userrecordstable,
      FilterExpression: "user_name = :userName",
      ExpressionAttributeValues: {
        ":userName": userName
      }
    };
    const result = await docClient.scan(params).promise();

    
    logger.info("user details fetched successfully");
    return result.Items;
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
      logger.error("User Phone number not found : ",userPhoneNumber)
      //throw new Error("userPhoneNumber not found");
    }
    logger.info("Returning user info for userPhoneNumber : "+userPhoneNumber);
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
   
    
    const updateParams = {
      TableName: eventsTable,
      Key: {
        event_name: eventName,
        event_date: scanResult.Items[0].event_date
      },
      UpdateExpression: 'set userThumbnails = :thumbnails',
      ExpressionAttributeValues: {
          ':thumbnails': thumbnailObject
      },
      ReturnValues: 'UPDATED_NEW'
  };


    await docClient.update(updateParams).promise();
    logger.info("User thumbnails saved for event: " + eventName);
    logger.info(scanResult.Items[0].client_name,);

    res.json(thumbnailObject);
  } catch (err) {
    logger.error("Error in fetching thumbnails", err);
    res.status(500).send('Error getting thumbnails for the event: ' + eventName);
  }
});

app.get('/userThumbnailsByEventId/:eventId', async (req, res) => {
  const eventId = req.params.eventId;

  try {
    logger.info("Thumbnails are being fetched for event ID: " + eventId);

    // Commented out the logic that checks for existing thumbnails in the eventsDetailsTable
    /*
    const eventDetailsParams = {
      TableName: eventsDetailsTable,
      Key: {
        event_id: eventId
      },
      ProjectionExpression: 'event_name, client_name, userThumbnails'
    };

    const eventDetailsResult = await docClient.get(eventDetailsParams).promise();

    if (!eventDetailsResult.Item) {
      logger.info("No event details found for event ID: " + eventId);
      return res.status(404).send('Event not found');
    }

    if (eventDetailsResult.Item.userThumbnails) {
      logger.info("User thumbnails found in db for event ID: " + eventId);
      return res.json(eventDetailsResult.Item.userThumbnails);
    }
    */

    // Fetch event details from the database without checking for existing thumbnails
    const eventDetailsParams = {
      TableName: eventsDetailsTable,
      Key: {
        event_id: eventId
      },
      ProjectionExpression: 'event_name, client_name,folder_name'
    };

    const eventDetailsResult = await docClient.get(eventDetailsParams).promise();

    if (!eventDetailsResult.Item) {
      logger.info("No event details found for event ID: " + eventId);
      return res.status(404).send('Event not found');
    }

    const eventName = eventDetailsResult.Item.event_name;
    const clientName = eventDetailsResult.Item.client_name;

    // Create folder name using event_name + client_name + event_id
    const folderName = eventDetailsResult.Item.folder_name;
    logger.info("Constructed folder name: " + folderName);

    // Step 2: Query indexedDataTableName to get imageIds associated with the constructed folder name
    const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index',
      ProjectionExpression: 'user_id, image_id, Gender_Value, AgeRange_Low, AgeRange_High',
      KeyConditionExpression: 'folder_name = :folderName',
      ExpressionAttributeValues: {
        ':folderName': folderName
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
        userCountMap.set(userId, { userId, count: 0, gender, age: 0 });
      }

      const userInfo = userCountMap.get(userId);
      userInfo.count += 1;
      if (ageLow && ageHigh) {
        userInfo.age = (userInfo.age + ((ageLow + ageHigh) / 2)) / 2;
      }
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

    // Step 3: Fetch users for the event
    const usersForEvent = await getUsersForEvent(folderName);

    // Step 4: Check if user_id exists and map if necessary
    for (const user of usersForEvent) {
      if (!user.user_id) {
        const userObj = await getUserObjectByUserPhoneNumber(user.user_phone_number)
        const phoneNumber = user.user_phone_number; // Adjust according to your user data structure
        const imageUrl = userObj.potrait_s3_url; // Adjust according to your user data structure
        console.log("mapping user_id with phone Number : ",phoneNumber)
        try {
          const result = await mapUserIdAndPhoneNumber(phoneNumber, imageUrl, eventName, user.user_id,false);
          if (result && result.Attributes && result.Attributes.user_id) {
            user.user_id = result.Attributes.user_id; // Update the user with the mapped user_id
            logger.info(`Mapped user_id ${user.user_id} for phone number ${phoneNumber}`);
          } else {
            logger.info(`No user_id found for phone number ${phoneNumber} using imageUrl ${imageUrl}`);
          }
        } catch (error) {
          logger.error(`Error mapping user_id for phone number ${phoneNumber}: ${error.message}`);
        }
      }
    }

    // Create a Set of user_ids from usersForEvent for quick lookup
    const userIdsSet = new Set(usersForEvent.map(user => user.user_id));

    // Step 5: Check if user_id from thumbnailObject exists in usersForEvent and modify thumbnailObject
    for (const thumbnail of thumbnailObject) {
      if (userIdsSet.has(thumbnail.user_id)) {
        thumbnail.is_registered = true;
        logger.info(`Thumbnail with image_id ${thumbnail.user_id} is registered.`);
      } else {
        const userObj = await getUserObjectByUserId(thumbnail.user_id);
        if(userObj){
          thumbnail.is_registered = true;
          logger.info(`Thumbnail with image_id ${thumbnail.user_id} is registered.`);
        }else{
          thumbnail.is_registered = false;
          logger.info(`Thumbnail with image_id ${thumbnail.user_id} is unregistered.`);
        }
      }
    }

    // Step 6: Store the modified thumbnailObject in eventsDetailsTable using eventId
    const updateParams = {
      TableName: eventsDetailsTable,
      Key: {
        event_id: eventId,
        event_date: eventDetailsResult.Item.event_date // Ensure you fetch event_date in the ProjectionExpression if needed
      },
      UpdateExpression: 'set userThumbnails = :thumbnails',
      ExpressionAttributeValues: {
        ':thumbnails': thumbnailObject
      },
      ReturnValues: 'UPDATED_NEW'
    };

    await docClient.update(updateParams).promise();
    logger.info("User thumbnails updated with registration status and saved for event ID: " + eventId);

    // Respond with the modified thumbnailObject
    res.json(thumbnailObject);

  } catch (err) {
    logger.error("Error in fetching thumbnails for event ID: " + eventId, err);
    res.status(500).send('Error getting thumbnails for the event ID: ' + eventId);
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
      const responses = data.Responses[TABLE_NAME]
      thumbnailObject.push(...responses);
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  }

 return thumbnailObject;
}

async function userEventImages(eventName,userId,lastEvaluatedKey,isFavourites){
    
  logger.info(eventName+"--------"+userId);
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


async function userEventImagesNew(eventName, userId, lastEvaluatedKey, isFavourites) {
  logger.info(eventName + "--------" + userId);
  logger.info(isFavourites);
  try {
    let params = {};
    if (isFavourites) {
      // Fetch favorite images directly from user_image_activity
      params = {
        TableName: userImageActivityTableName, // Assuming this is the table where favorite images are stored
        KeyConditionExpression: 'user_id = :userId',
        FilterExpression: "is_favourite = :isFav and folder_name = :folder_name",
        ExpressionAttributeValues: {
          ':userId': userId,
          ':isFav': true,
          ':folder_name':eventName
        }
      };
    } else {
      // Fetch non-favorite images from indexedDataTableName
      params = {
        TableName: indexedDataTableName,
        IndexName: 'folder_name-user_id-index',
        KeyConditionExpression: 'folder_name = :partitionKey AND user_id = :sortKey',
        FilterExpression: "attribute_not_exists(is_favourite) OR is_favourite <> :isFav",
        ExpressionAttributeValues: {
          ':partitionKey': eventName,
          ':sortKey': userId,
          ':isFav': true // We want images that are either not favorite or not flagged as favorite
        },
        Limit: 100,
      };

      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
    }

    const result = await docClient.query(params).promise();
    return result;
  } catch (err) {
    logger.info(err);
    return err;
  }
}

// Helper function to extract folder_name from s3_url
const extractFolderName = (s3_url) => {
  const urlParts = s3_url.split('/');
  const folderName = urlParts[urlParts.length - 2];
  logger.info(`Extracted folder_name: ${folderName} from s3_url: ${s3_url}`);
  return folderName;
};

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

app.post('/setFavouritesNew', async (req, res) => {
  try {
    
    const userId = req.body.userId;
    const imageUrl = req.body.imageUrl;
    const isFav = req.body.isFav;
    const folderName = extractFolderName(imageUrl);
    logger.info("Selecting Image:"+imageUrl);
    const params = {
      TableName: userImageActivityTableName,
      Item: {
        user_id: userId,
        s3_url: imageUrl,
        is_favourite: isFav,
        folder_name:folderName
      }
    };

    const result = await docClient.put(params).promise();
    logger.info("Put operation succeeded:", result);
    res.send(result);
  } catch (err) {
    logger.error("Unable to update item. Error JSON:", err);
    res.status(500).send('Unable to mark the photo as favourite');
  }
});

app.post('/setPortfolioFavourites', async (req, res) => {
  try {
    
    const username = req.body.username;
    const imageUrl = req.body.imageUrl;
    const isFav = req.body.isFav;
    const folderName = extractFolderName(imageUrl);
    logger.info("Selecting Image:"+imageUrl);
    const params = {
      TableName: portfolioImagesTable,
      Item: {
        username: username,
        s3_url: imageUrl,
        is_favourite: isFav,
        folder_name:folderName
      }
    };

    const result = await docClient.put(params).promise();
    logger.info("Put operation succeeded:", result);
    res.send(result);
  } catch (err) {
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


app.get('/downloadFlashbacks/:eventId/:flashbackName', async (req, res) => {
  try {
      const { eventId, flashbackName } = req.params;
      const eventDetails = await getEventDetailsById(eventId);
    const folderName = `${eventDetails.folder_name}/${flashbackName}`;

    logger.info(`Downloading ZIP folder: ${folderName}`);

    // List objects with the specified prefix (folder path)
    const data = await s3.listObjectsV2({ Bucket: flashbacksBucketname, Prefix: folderName }).promise();

    if (!data.Contents || data.Contents.length === 0) {
      // Handle empty folder (no files to download)
      return res.status(404).send({ error: 'No files found to download.' });
    }

    const zip = archiver('zip', { zlib: { level: 9 } });

    // Handle archive errors
    zip.on('error', err => {
      logger.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).send({ error: 'Failed to create archive.' });
      } else {
        res.end();
      }
    });

    // Set the archive name
    res.attachment(`${flashbackName}_${eventId}.zip`);

    // Pipe archive data to the response
    zip.pipe(res);

    // Process each item
    for (const item of data.Contents) {
      const fileKey = item.Key;
    
      try {
        if(fileKey.includes('/thumbnails'))
          continue;
        // Retrieve the metadata of the object to get the file size
        const headObject = await s3.headObject({ Bucket: flashbacksBucketname, Key: fileKey }).promise();
        const fileSizeInBytes = headObject.ContentLength; // File size in bytes
        const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2); // Convert to MB and format to 2 decimal places

        logger.info(`Downloading Image: ${fileKey} | Size: ${fileSizeInMB} MB`);
    
    
        // Stream files directly from S3 to the ZIP file
        const s3Stream = s3.getObject({ Bucket: flashbacksBucketname, Key: fileKey }).createReadStream();
    
        // Handle S3 stream errors
        s3Stream.on('error', err => {
          logger.error(`Error reading S3 object ${fileKey}:`, err);
          // Optionally handle the error (e.g., skip the file or append an error message to the ZIP)
        });
    
        // Append the file to the archive, preserving the folder structure after the specified prefix
        const relativePath = path.relative(folderName, fileKey);
        logger.info(`Image downloaded from cloud: ${fileKey}`);
        zip.append(s3Stream, { name: relativePath });
    
      } catch (err) {
        logger.error(`Failed to retrieve metadata or download image for ${fileKey}:`, err);
      }
    }
    

    // Finalize the archive
    zip.finalize();

    // Optional: Handle when the response is finished
    res.on('finish', () => {
      logger.info('Download completed successfully.');
    });
  } catch (err) {
    logger.error('Error:', err);
    if (!res.headersSent) {
      res.status(500).send({ error: 'An error occurred while processing your request.' });
    } else {
      res.end();
    }
  }
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

const decodeURIComponentSafely = (uri) => {
  try {
    return decodeURIComponent(uri);
  } catch (err) {
    logger.error("Error decoding URI component: ", err);
    return uri; // Return the original URI if decoding fails
  }
};

app.post('/downloadImage', async (req, res) => {
  const imageUrl = req.body.imageUrl;

  try {
    // Extract bucket name and key from the image URL
    const urlParts = imageUrl.split('/');
    const bucketName = urlParts[2].split('.')[0]; // Extracts the bucket name from the URL
    let key = urlParts.slice(3).join('/'); // Constructs the key from the remaining parts of the URL

    // Decode the key to handle any encoded characters (like %20)
    key = decodeURIComponentSafely(key.replace(/\+/g, '%20'));
    let fileName = key.split('/').pop();
    if (!fileName.toLowerCase().endsWith('.jpg')) {
      fileName += '.jpg';
    }

    logger.info("Image downloading started from cloud: " + bucketName + " -> " + imageUrl);

    // Check for specific bucket logic if needed
    let bucket = bucketName;
    const eventName = key.split('/')[0]; // Gets the event name from the key

    if (eventName === 'Convocation_PrathimaCollege') {
      bucket = 'flashbackprathimacollection';
      logger.info(bucket);
    }

    const imageData = await s3.getObject({
      Bucket: bucket,
      Key: key
    }).promise();
    logger.info(key)
    logger.info("Image downloaded from cloud: " + imageUrl);
    res.set('Content-Disposition', `attachment; filename="${fileName}"`);
    res.json(`data:image/jpeg;base64,${imageData.Body.toString('base64')}`);
  } catch (err) {
    logger.error("Error downloading image: " + imageUrl, err);
    res.status(500).send('Error getting images from S3');
  }
});

app.get('/download-images', async (req, res) => {
  const imageUrls = req.query.urls;

  if (!imageUrls) {
    return res.status(400).json({ error: 'No image URLs provided.' });
  }

  // Convert imageUrls to an array if it's a single string
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

  // Set headers for ZIP download
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename=images.zip',
  });

  const archive = archiver('zip', { zlib: { level: 9 } });

  // Handle archive errors
  archive.on('error', (err) => {
    logger.error('Archive error:', err);
    // Abort the archive and end the response
    res.end();
  });

  // Pipe the archive data to the response
  archive.pipe(res);

  // Function to process each URL
  async function processUrl(url) {
    try {
      const { Bucket, Key } = parseS3Url(url);
      logger.info(`Fetching from S3 - Bucket: ${Bucket}, Key: ${Key}`);

      // Get the image from S3
      const s3Stream = s3.getObject({ Bucket, Key }).createReadStream();

      // Handle S3 stream errors
      s3Stream.on('error', (err) => {
        logger.error(`S3 Stream error for ${Key}:`, err);
        // Optionally append an error message file
        archive.append(`Error fetching file: ${err.message}`, { name: `error_${Key.split('/').pop()}.txt` });
      });

      // Append the image stream to the archive
      archive.append(s3Stream, { name: Key.split('/').pop() });
    } catch (error) {
      logger.error(`Error processing URL ${url}:`, error);
      // Optionally append an error message file
      archive.append(`Error processing URL: ${error.message}`, { name: `error_${Key.split('/').pop()}.txt` });
    }
  }

  // Process all URLs
  const processingPromises = urls.map((url) => processUrl(url));

  // Wait for all URLs to be processed
  Promise.all(processingPromises)
    .then(() => {
      // Finalize the archive after all files have been appended
      archive.finalize();
    })
    .catch((err) => {
      console.error('Error during processing URLs:', err);
      // Abort the archive and end the response
      res.end();
    });
});

// Helper function to parse S3 URL
function parseS3Url(s3Url) {
  try {
    const url = new URL(s3Url);

    let Bucket;
    let Key;

    if (url.hostname.endsWith('.amazonaws.com')) {
      const hostnameParts = url.hostname.split('.');
      if (hostnameParts[0] === 's3') {
        // Path-style URL: https://s3.amazonaws.com/bucket-name/key
        Bucket = url.pathname.split('/')[1];
        Key = url.pathname.split('/').slice(2).join('/');
      } else {
        // Virtual-hosted–style URL: https://bucket-name.s3.amazonaws.com/key
        Bucket = hostnameParts[0];
        Key = url.pathname.substring(1);
      }
    } else {
      throw new Error('Invalid S3 URL format');
    }

    // Decode the Key in case it was URL-encoded
    Key = decodeURIComponent(Key);

    return { Bucket, Key };
  } catch (error) {
    console.error('Error parsing S3 URL:', error);
    throw error;
  }
}







app.post('/uploadUserPotrait', upload.single('image'), async (req, res) => {
  const file = req.body.image;
  const username = req.body.username;
  const event = req.body.event;
  const params = {
      Bucket: userBucketName,
      Key: `${username}.jpg`,
      Body: Buffer.from(file, 'base64'),
  };

  try {
      // Step 1: Upload image to S3
      logger.info(`Uploading image for username: ${username} to S3`);
      const data = await s3.upload(params).promise();
      logger.info(`Upload successful. S3 URL: ${data.Location}`);

      

      // Step 3: Search for existing user in Rekognition
      logger.info(`Searching for existing user by image in Rekognition for username: ${username}`);
      const isUserExists = await searchUsersByImage(data.Location, username);
      let matchedUserId;

      if (!isUserExists) {
          // Step 4: Index the image in Rekognition
          logger.info(`No existing user found. Indexing new image for username: ${username}`);
          const indexResult = await indexFile(file);
          const faceId = indexResult.FaceRecords?.[0]?.Face?.FaceId;

          if (!faceId) {
              logger.error(`No face detected in the image for username: ${username}`);
              return res.status(700).json({ message: 'No faces detected in the image.' });
          }

          // Step 5: Create new user and associate the face
          const userId = crypto.randomBytes(4).toString('hex');
          logger.info(`Creating new Rekognition user with userId: ${userId}`);
          await rekognition.createUser({ CollectionId: COLLECTION_ID, UserId: userId }).promise();

          logger.info(`Associating faceId: ${faceId} with userId: ${userId}`);
          await rekognition.associateFaces({
              CollectionId: COLLECTION_ID,
              FaceIds: [faceId],
              UserId: userId,
          }).promise();

          matchedUserId = userId;
      } else {
          matchedUserId = isUserExists.matchedUserId[0];
          logger.info(`Existing user matched with userId: ${matchedUserId}`);
      }

      // Step 6: Update user details with the matched userId
      logger.info(`Updating user details for username: ${username} with userId: ${matchedUserId}`);
      await updateUserDetails(username, { user_id: matchedUserId });
      // Step 7: Update DynamoDB with the S3 URL
      const updateParams = {
        TableName: userrecordstable,
        Key: { user_phone_number: username }, // Assuming primary key 'user_phone_number'
        UpdateExpression: 'set potrait_s3_url = :url',
        ExpressionAttributeValues: { ':url': data.Location },
        ReturnValues: 'UPDATED_NEW',
    };
    const updateResult = await docClient.update(updateParams).promise();
    logger.info(`DynamoDB update successful for user ${username}:`, updateResult);

      // Step 8: Event-related actions
      // Step 2: Event logic
      if(event && event !== 'undefined'){

      
      logger.info(`Using event: ${event}`);
      const eventDetails = await getEventDetailsByFolderName(event);
      logger.info(`Event details fetched successfully for event: ${event}`);
      if (eventDetails.status) {
          logger.info(`Event status is active. Processing notifications for event: ${event}`);
          try {
            await sendWhatsAppMessage(username, event, matchedUserId);
            await updateUserDeliveryStatus(event, username, 'Flashback_Delivered');
            await storeSentData(username, event, `https://flashback.inc/photosV1/${event}/${userData.user_id}`)


            logger.info(`Successfully sent message to ${username}`); 
          } catch (error) {
            logger.error(`Error sending message to ${username}: ${error.message}`); // Log error in sending message
          }
      }
    }

      // Final response
      logger.info(`Successfully processed portrait upload for username: ${username}`);
      res.json({ potrait_s3_url: data.Location });

  } catch (error) {
      // Enhanced error handling and logging
      logger.error(`Error during portrait upload for username: ${username}`, {
          message: error.message,
          stack: error.stack,
      });

      if (error.code === 'ProvisionedThroughputExceededException') {
          res.status(429).json({ error: 'DynamoDB request limit exceeded. Please try again later.' });
      } else if (error.code === 'NoSuchKey') {
          res.status(404).json({ error: 'S3 bucket or key not found.' });
      } else {
          res.status(500).json({ error: 'An error occurred while uploading the image.' });
      }
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
        const reward_points  = 0;
        logger.info("creating user "+username);
      
        try {
          // Check if the user already exists
          if(!eventName)
            {
              eventName = 'default_user'

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
          if(!existingUser){
          await createUser(username,userSource,role,reward_points);
          console.log("created sucessfulyy ->"+username)
          logger.info('Successfully created new user: ', username);
          }
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
      
      app.post('/mapUserToEvent', async (req, res) => {
        const eventName = req.body.event_id;
        const username = req.body.user_phone_number;
      
        if (!eventName || !username) {
          return res.status(400).json({ error: 'Event name and user phone number are required' });
        }
      
        try {
          const mappingResult = await mapUserToEvent(eventName, username);
          if (!mappingResult.success) {
            return res.status(500).json({ error: mappingResult.message });
          }
      
          res.status(200).json({ message: 'User-event mapping successful' });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'Error in user-event mapping' });
        }
      });
      

      const mapUserToEvent = async (eventName, username) => {
        const updateParamsUserEvent = {
          TableName: userEventTableName,
          Item: {
            event_name: eventName,
            user_phone_number: username,
            created_date: new Date().toISOString()
          }
        };
      
        try {
          const putResult = await docClient.put(updateParamsUserEvent).promise();
          logger.info('Insert in user-event mapping is successful:', eventName);
          return { success: true, message: 'User-event mapping successful' };
        } catch (error) {
          logger.error('Error in user-event mapping:', error);
          return { success: false, message: 'Error in user-event mapping' };
        }
      };
      
      
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
      async function createUser(username,userSource,role,reward_points) {
        const unique_uid = `${username}_Flash_${Math.floor(Math.random() * 1000)}`;
        const params = {
          TableName: userrecordstable,
          Item: {
            user_phone_number: username,
            user_name: username,
            unique_uid: unique_uid,
            created_date: new Date().toISOString(),
            user_source:userSource,
            role:role,
            reward_points:reward_points
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
            const mappedUser = await mapUserIdAndPhoneNumber(item.user_phone_number,userData.Items[0].potrait_s3_url,eventName,'',false);
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

    app.post("/getImagesWithUserIds-new", async (req, res) => {
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

    app.post("/getImagesWithUserIds", async (req, res) => {
      const { userIds, operation, mode, eventName, sort } = req.body;
      
      logger.info(`Received request to get images with userIds: ${userIds}, operation: ${operation}, mode: ${mode}, eventName: ${eventName}`);
    
      try {
        let imageIds = new Set();
    
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
              ProjectionExpression: "image_id",
              ExclusiveStartKey: lastEvaluatedKey
            };
    
            logger.info(`Querying indexedDataTableName for userId: ${userId} and eventName: ${eventName}`);
    
            const data = await docClient.query(params).promise();
            data.Items.forEach(item => {
              imageIds.add(item.image_id);
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
            ProjectionExpression: 's3_url, user_ids, image_id, selected,DateTimeOriginal'
          };
          return docClient.get(params).promise();
        });
    
        logger.info('Fetching image details from RecogImages table');
    
        const imageDetailsResults = await Promise.all(imageDetailsPromises);
        const imageDetails = imageDetailsResults.map(result => {
          // logger.info(`Fetched user_ids for image_id ${result.Item.image_id}: ${result.Item.user_ids}`);
          return result.Item;
        });
    
        logger.info('Fetched image details successfully');
    
        // Step 3: Filter imageIds based on operation and mode
        let filteredImages;
        if (operation === 'AND' && mode !== 'Loose') {
          // AND + Strict: Images that have exactly the specified user IDs
          logger.info(userIds)
          filteredImages = imageDetails.filter(item =>
            userIds.length === item.user_ids.length && userIds.every(userId => item.user_ids.includes(userId))
          );
          //logger.info(`Filtered images with AND + Strict. Count: ${filteredImages.length}`);
          // filteredImages = imageDetails.filter(item =>
           
          // );
          logger.info(`Filtered images with AND + Strict. Count: ${filteredImages.length}`);
        } else if (operation === 'AND' && mode === 'Loose') {
          // AND + Loose: Images that have all the specified user IDs but may also have other user IDs
          filteredImages = imageDetails.filter(item =>
            userIds.every(userId => item.user_ids.includes(userId))
          );
          logger.info(`Filtered images with AND + Loose. Count: ${filteredImages.length}`);
        } else if (operation === 'OR' && mode === 'Loose') {
          // OR + Loose: Images that have at least one of the specified user IDs but may also have other user IDs
          filteredImages = imageDetails.filter(item =>
            userIds.some(userId => item.user_ids.includes(userId))
          );
          logger.info(`Filtered images with OR + Loose. Count: ${filteredImages.length}`);
        } else {
          logger.error('Invalid operation or mode specified');
          throw new Error('Invalid operation or mode specified');
        }
    
        const items = filteredImages.map(item => ({
          ...item,
          thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + item.s3_url.split("amazonaws.com/")[1]
        }));
    
        if(sort === 'desc'){
          logger.info('sorting reverse')
          items.sort((a, b) => b.user_ids.length - a.user_ids.length);
        }
        else{
        items.sort((a, b) => a.user_ids.length - b.user_ids.length);
        }
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

    app.post("/getCombinationImagesWithUserIds-new", async (req, res) => {
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
    
    app.post("/getCombinationImagesWithUserIds", async (req, res) => {
      const { userIds, eventName } = req.body;
      const minUserCount = 1; // Minimum number of user IDs that must be present in each image
      
      logger.info(`Received request to get images with userIds: ${userIds}, eventName: ${eventName}`);
    
      try {
        let imageIds = new Set();
    
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
              ProjectionExpression: "image_id",
              ExclusiveStartKey: lastEvaluatedKey
            };
    
            logger.info(`Querying indexedDataTableName for userId: ${userId} and eventName: ${eventName}`);
    
            const data = await docClient.query(params).promise();
            data.Items.forEach(item => {
              imageIds.add(item.image_id);
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
            ProjectionExpression: 's3_url, user_ids, image_id, selected,DateTimeOriginal'
          };
          return docClient.get(params).promise();
        });
    
        logger.info('Fetching image details from RecogImages table');
    
        const imageDetailsResults = await Promise.all(imageDetailsPromises);
        const imageDetails = imageDetailsResults.map(result => {
          // logger.info(`Fetched user_ids for image_id ${result.Item.image_id}: ${result.Item.user_ids}`);
          return result.Item;
        });
    
        logger.info('Fetched image details successfully');
    
        // Step 3: Filter imageIds based on the criteria
        const filteredImages = imageDetails.filter(item => {
          const matchingUserIds = item.user_ids.filter(userId => userIds.includes(userId));
          return matchingUserIds.length >= minUserCount && matchingUserIds.length === item.user_ids.length;
        });
    
        logger.info(`Filtered images based on user IDs and event name. Count: ${filteredImages.length}`);
    
        const items = filteredImages.map(item => ({
          ...item,
          thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + item.s3_url.split("amazonaws.com/")[1]
        }));
        items.sort((a, b) => a.user_ids.length - b.user_ids.length);
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
  const {
    eventName,
    eventDate,
    projectName,
    clientName,
    eventLocation,
    invitationNote,
    invitation_url,
  } = req.body;

  // Generate a unique eventId
  const eventId = crypto.randomBytes(4).toString('hex');
  logger.info("EventId created "+eventId);
  const eventNameWithoutSpaces = eventName.replace(/\s+/g, '_');
  const clientNameWithoutSpaces = clientName.replace(/\s+/g, '_');
  //const CreateUploadFolderName = `${eventNameWithoutSpaces}_${clientNameWithoutSpaces}_${eventId}`;
  const fileKey = `${eventId}.jpg`;

  try {
    // Create the folder in S3
    await createS3Folder(indexBucketName, eventId);

    // Upload the image to S3
    const imageUrl = await uploadImageToS3('flashbackeventthumbnail', fileKey, file.buffer, file.mimetype);

    // Save event details to DynamoDB
    const eventParams = {
      TableName: eventsDetailsTable,
      Item: {
        event_id: eventId,
        event_name: eventNameWithoutSpaces,
        project_name: projectName,
        client_name: clientName,
        event_date: eventDate,
        event_location: eventLocation,
        invitation_note: invitationNote,
        invitation_url: invitation_url,
        event_image: imageUrl,
        folder_name: eventId,
      },
    };

    await docClient.put(eventParams).promise();
    logger.info('Event Created Successfully: ' + eventName);
    res.status(200).send({ message: 'Event Created Successfully', data: eventParams.Item });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
});

const createS3Folder = async (bucketName, folderName) => {
  const createFolderParams = {
    Bucket: bucketName,
    Key: `${folderName}/`,
    Body: '',
  };

  try {
    await s3.putObject(createFolderParams).promise();
    logger.info('Folder created successfully:', folderName);
  } catch (error) {
    logger.error('S3 Error Creating Folder:', error);
    throw new Error(`Failed to create S3 folder: ${error.message}`);
  }
};

const uploadImageToS3 = async (bucketName, fileKey, fileBuffer, contentType) => {
  try {
    const compressedBuffer = await sharp(fileBuffer).resize(600, 600).toBuffer();

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: compressedBuffer,
      ContentType: contentType,
    };

    const data = await s3.upload(uploadParams).promise();
    return data.Location;
  } catch (error) {
    console.error('S3 Error Uploading Image:', error);
    throw new Error(`Failed to upload image to S3: ${error.message}`);
  }
};


app.post('/updateEventImage', upload.single('eventImage'), async (req, res) => {
  const { eventId, eventName, clientName } = req.body;
  const file = req.file;

  if (!eventId || !eventName || !clientName) {
    return res.status(400).json({ error: 'Missing required fields: eventId, eventName, or clientName' });
  }

  // // Remove spaces to match the existing naming convention
  // const eventNameWithoutSpaces = eventName.replace(/\s+/g, '_');
  // const clientNameWithoutSpaces = clientName.replace(/\s+/g, '_');
  // const CreateUploadFolderName = `${eventNameWithoutSpaces}_${clientNameWithoutSpaces}_${eventId}`;
  
  const fileKey = `${eventId}-${file.originalname }.jpg`;

  try {
    // Upload the new image to S3
    const imageUrl = await uploadImageToS3('flashbackeventthumbnail', fileKey, file.buffer, file.mimetype);

    // Update event details in DynamoDB with the new image URL
    const updateFields = { event_image: imageUrl };
    await updateEventDetails(eventId, updateFields);

    res.status(200).send({ message: 'Event image updated successfully', imageUrl });
  } catch (error) {
    console.error('Error updating event image:', error);
    res.status(500).json({ error: 'Error updating event image' });
  }
});


app.get("/getClientEventDetails/:clientName", async (req, res) => {
  const clientName = req.params.clientName; // Adjust based on your token payload
  logger.info(`Fetching event details for ${clientName}`);
  
  try {
    const eventParams = {
      TableName: eventsDetailsTable,
      IndexName: 'client_name-index', // Replace with your actual GSI name
      KeyConditionExpression: "client_name = :clientName",
      ExpressionAttributeValues: {
        ":clientName": clientName
      }
    };

    let items = [];
    let lastEvaluatedKey = null;

    do {
      const params = { ...eventParams };
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const result = await docClient.query(params).promise();

      items = items.concat(result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    if (items && items.length >= 0) {
      logger.info(`Fetched ${items.length} event details for ${clientName}`);
      res.status(200).send(items);
    } else {
      logger.info(`No event details found for ${clientName}`);
      res.status(404).send({ message: 'No event details found' });
    }
  } catch (err) {
    logger.error(err.message);
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


app.get("/getClientDetailsByEventId/:eventId", async (req, res) => {
  
  const eventId = req.params.eventId; // Adjust based on your token payload
  logger.info(`Fetching event details for ${eventId}`)
  try {
   const clientObj = await getClientObjectNew(eventId);
   res.send(clientObj);
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});

app.get("/getUserAttendedEvents/:user_phone_number", async (req, res) => {
  const userPhoneNumber = req.params.user_phone_number;

  try {
    // Fetch event IDs for the user
    const events = await getEventsForUser(userPhoneNumber);
    // // Extract event IDs from event names
    // const eventIds = events.map(eventName => {
    //   const parts = eventName.split('-');
    //   return parts[parts.length - 2]; // Extract the last second part as event ID
    // });
    // Fetch event details for each event ID
    const eventDetailsPromises = events.map(event => getEventDetailsByFolderName(event.event_name));
    const eventDetails = await Promise.all(eventDetailsPromises);

    // Filter out any null results
    const validEventDetails = eventDetails.filter(event => event !== null);

    // Send the valid event details as the response
    res.json(validEventDetails);
  } catch (error) {
    console.error(`Error fetching user attended events: ${error.message}`);
    res.status(500).send('Error fetching user attended events');
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

app.put('/acceptCollab/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const  userName  = req.body.userName;
  const status = req.body.status

  logger.info(status)

  const updateParams = {
    TableName: EventCollabs,
    Key: {
      event_id: eventId,
      user_name: userName,
    },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: {
      '#status': 'collab_status',
    },
    ExpressionAttributeValues: {
      ':status': status,
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await docClient.update(updateParams).promise();
    res.status(200).send(result.Attributes);
  } catch (err) {
    console.error('Error updating collaboration status:', err);
    res.status(500).send({ error: 'Failed to update collaboration status' });
  }
});

app.get('/getCollabEvents/:userName', async (req, res) => {
  const { userName } = req.params;

  logger.info("fetching collab of events for user:"+userName);
  const params = {
    TableName: EventCollabs,
    IndexName: 'user_name-collab_status-index',  // Assuming you have an index on user_name
    KeyConditionExpression: 'user_name = :userName AND collab_status = :status',
    ExpressionAttributeValues: {
      ':userName': userName,
      ':status': 'Accept',
    },
  };

  logger.info(params)
  try {
    const data = await docClient.query(params).promise();
    const eventIds = data.Items.map(item => item.event_id);

    // Now fetch the events based on the event IDs
    const events = await Promise.all(eventIds.map(async eventId => {
      const eventParams = {
        TableName: eventsDetailsTable,
        Key: {
          event_id: eventId,
        },
      };
      const eventData = await docClient.get(eventParams).promise();
      return eventData.Item;
    }));

    res.status(200).send(events);
  } catch (error) {
    console.error('Error fetching collaboration events:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration events' });
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

const updateEventDetails = async (eventId, updateFields) => {
  // Build Update Parameters
  let updateExpression = "set";
  let expressionAttributeValues = {};

  Object.keys(updateFields).forEach((key, index) => {
    const attributeKey = `:${key}`;

    if (index > 0) {
      updateExpression += ",";
    }

    updateExpression += ` ${key} = ${attributeKey}`;
    expressionAttributeValues[attributeKey] = updateFields[key];
  });

  // Return null if no fields are provided
  if (Object.keys(expressionAttributeValues).length === 0) {
    throw new Error('No fields provided to update');
  }

  const updateParams = {
    TableName: eventsDetailsTable,
    Key: { event_id: eventId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  // Perform the update operation
  try {
    const result = await docClient.update(updateParams).promise();
    return result.Attributes;
  } catch (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }
};

app.put('/updateEvent/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const updateFields = req.body;

  try {
    const updatedEvent = await updateEventDetails(eventId, updateFields);
    logger.info(`Updated event: ${eventId}`);
    res.status(200).send(updatedEvent);
  } catch (error) {
    logger.error(`Failed to update event ${eventId}: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});



app.get("/getEventDetails/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  logger.info(`Fetching event details for ${eventId}`);
  
  try {
    const eventDetails = await getEventDetailsById(eventId);

    if (eventDetails) {
      logger.info(`Fetched event details for ${eventId}`);
      res.status(200).send(eventDetails);
    } else {
      logger.info("Event not found ",eventId);
      res.status(404).send({ message: "Event not found" });
    }
  } catch (err) {
    logger.info(err.message);
    res.status(500).send({ message: err.message });
  }
});
const getEventDetailsById = async (eventId) => {
  const eventParams = {
    TableName: eventsDetailsTable,
    KeyConditionExpression: "event_id = :eventId",
    ExpressionAttributeValues: {
      ":eventId": eventId
    }
  };

  try {
    const result = await docClient.query(eventParams).promise();
    if (result.Items && result.Items.length > 0) {
      return result.Items[0]; // Return the first item found
    } else {
      return null; // Return null if no event is found
    }
  } catch (err) {
    throw new Error(`Error fetching event details: ${err.message}`);
  }
};

app.get("/getEventDetailsByFolderName/:folderName", async (req, res) => {
  const folderName = req.params.folderName;
  logger.info(`Fetching event details for ${folderName}`);
  
  try {
    const eventDetails = await getEventDetailsByFolderName(folderName);

    if (eventDetails) {
      logger.info(`Fetched event details for ${folderName}`);
      res.status(200).send(eventDetails);
    } else {
      res.status(404).send({ message: "Event not found" });
    }
  } catch (err) {
    logger.info(err.message);
    res.status(500).send({ message: err.message });
  }
});

const getEventDetailsByFolderName = async (folderName) => {
  const eventParams = {
    TableName: eventsDetailsTable,
    IndexName: "folder_name-index",
    KeyConditionExpression: "folder_name = :folderName",
    ExpressionAttributeValues: {
      ":folderName": folderName
    }
  };

  try {
    const result = await docClient.query(eventParams).promise();
    if (result.Items && result.Items.length > 0) {
      return result.Items[0]; // Return the first item found
    } else {
      logger.info("No Event Details found with folder name : ",folderName);
      return null; // Return null if no event is found
    }
  } catch (err) {
    throw new Error(`Error fetching event details: ${err.message}`);
  }
};





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
app.delete('/deleteEvent/:eventId/:userPhoneNumber', async (req, res) => {
  const { eventId, userPhoneNumber } = req.params;

  const getParams = {
    TableName: eventsDetailsTable,
    Key: {
      event_id: eventId
    }
  };

  logger.info(`Deletion Process Started for eventId: ${eventId}, userPhoneNumber: ${userPhoneNumber}`);

  try {
    // Step 1: Fetch event details to get the folder name
    logger.info('Step 1: Fetching event details from DynamoDB');
    const eventDetails = await docClient.get(getParams).promise();
    logger.info('Step 1 Completed: Event details fetched successfully');

    if (!eventDetails.Item) {
      logger.error('Event not found in DynamoDB');
      return res.status(404).json({ message: 'Event not found' });
    }

    const folderName = eventDetails.Item.folder_name;

    // Step 2: List and delete all objects within the folder in S3 (indexBucketName)
    logger.info(`Step 2: Listing and deleting all objects in S3 folder: ${folderName} in bucket: ${indexBucketName}`);
    let isTruncated = true;
    let continuationToken = null;
    let totalObjectsDeleted = 0;

    while (isTruncated) {
      const listParams = {
        Bucket: indexBucketName,
        Prefix: `${folderName}/`,
        ContinuationToken: continuationToken
      };

      const listedObjects = await s3.listObjectsV2(listParams).promise();
      logger.info(`Step 2: Fetched ${listedObjects.Contents.length} objects from S3 folder: ${folderName} in bucket: ${indexBucketName}`);

      if (listedObjects.Contents.length > 0) {
        const deleteParamsIndex = {
          Bucket: indexBucketName,
          Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
        };

        const deleteParamsThumbnail = {
          Bucket: thumbnailBucketName,
          Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
        };

        try {
          // Step 1: Delete image records from DynamoDB (ImageUploadData table) using s3_url
          logger.info(`Step 1: Deleting image records from DynamoDB (ImageUploadData table) using s3_url values`);

          for (const object of listedObjects.Contents) {
            const s3Url = `https://${indexBucketName}.s3.ap-south-1.amazonaws.com/${object.Key}`; // Construct the s3_url

            const deleteImageDataParams = {
              TableName: ImageUploadData,
              Key: {
                s3_url: s3Url
              }
            };

            try {
              const res = await docClient.delete(deleteImageDataParams).promise();
              //logger.info(`Deleted image record from ImageUploadData table for s3_url: ${s3Url}`);
            } catch (deleteError) {
              logger.error(`Failed to delete image record from ImageUploadData table for s3_url: ${s3Url} - Error: ${deleteError.message}`);
              return res.status(500).json({ message: 'Error deleting image records from ImageUploadData table', error: deleteError.message });
            }
          }

          logger.info(`Step 1a Completed: Deleted image records from DynamoDB (ImageUploadData table)`);

          // Step 2: Delete the objects from indexBucketName
  
          // Delete the objects from indexBucketName
          const deleteResultIndex = await s3.deleteObjects(deleteParamsIndex).promise();
          if (deleteResultIndex.Errors && deleteResultIndex.Errors.length > 0) {
            logger.error(`Error deleting some objects from ${indexBucketName}: ${JSON.stringify(deleteResultIndex.Errors)}`);
            return res.status(500).json({ message: 'Error deleting some objects from S3', errors: deleteResultIndex.Errors });
          }
          totalObjectsDeleted += deleteParamsIndex.Delete.Objects.length;
          logger.info(`Step 2: Deleted ${deleteParamsIndex.Delete.Objects.length} objects from S3 folder: ${folderName} in bucket: ${indexBucketName}`);

          // Delete the objects from thumbnailBucketName
          const deleteResultThumbnail = await s3.deleteObjects(deleteParamsThumbnail).promise();
          if (deleteResultThumbnail.Errors && deleteResultThumbnail.Errors.length > 0) {
            logger.error(`Error deleting some objects from ${thumbnailBucketName}: ${JSON.stringify(deleteResultThumbnail.Errors)}`);
            return res.status(500).json({ message: 'Error deleting some objects from S3', errors: deleteResultThumbnail.Errors });
          }
          logger.info(`Step 2: Deleted ${deleteParamsThumbnail.Delete.Objects.length} objects from S3 folder: ${folderName} in bucket: ${thumbnailBucketName}`);
        } catch (deleteError) {
          logger.error(`Failed to delete objects in S3: ${deleteError.message}`);
          return res.status(500).json({ message: 'Error deleting objects from S3', error: deleteError.message });
        }
      } else {
        logger.info(`Step 2: No objects found in S3 folder: ${folderName} in bucket: ${indexBucketName}`);
        break; // Skip further steps if no objects are found
      }

      isTruncated = listedObjects.IsTruncated;
      continuationToken = listedObjects.NextContinuationToken;
    }

    logger.info(`Step 2 Completed: Total objects deleted from S3 folder: ${totalObjectsDeleted} in bucket: ${indexBucketName} and ${thumbnailBucketName}`);

    // Step 3: Query the table using the existing partition key (event_name)
    logger.info(`Step 3: Fetching items from userEventTableName using event_name`);
    let lastEvaluatedKey = null;
    let queryResult = { Items: [] };

    do {
      const queryParams = {
        TableName: userEventTableName,
        KeyConditionExpression: 'event_name = :eventName',
        ExpressionAttributeValues: {
          ':eventName': folderName
        },
        ExclusiveStartKey: lastEvaluatedKey
      };

      const result = await docClient.query(queryParams).promise();
      queryResult.Items = queryResult.Items.concat(result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;

    } while (lastEvaluatedKey);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      logger.info('No entries found for event_name in userEventTableName');
      logger.info(`Step 3: Total items fetched: ${queryResult.Items.length}`);
      logger.info(`No entries to update in userEventTableName for eventId: ${eventId}`);
    } else {
      // Step 4: Update event status in the event mapping table for all fetched items
      logger.info(`Step 4: Updating event status to "deleted" in event mapping table for eventId: ${eventId}`);
      for (const item of queryResult.Items) {
        const updateParams = {
          TableName: userEventTableName,
          Key: {
            event_name: item.event_name,
            user_phone_number: item.user_phone_number
          },
          UpdateExpression: "SET event_status = :deleted",
          ExpressionAttributeValues: {
            ":deleted": "deleted"
          }
        };

        try {
          await docClient.update(updateParams).promise();
          logger.info(`Event status updated to "deleted" for event_name: ${item.event_name}, user_phone: ${item.user_phone_number}`);
        } catch (updateError) {
          logger.error(`Failed to update event status for event_name: ${item.event_name}, user_phone: ${item.user_phone_number} - Error: ${updateError.message}`);
          return res.status(500).json({ message: 'Error updating event status', error: updateError.message });
        }
      }
      logger.info(`Step 4 Completed: Event status updated for all fetched items`);
    }

    // Step 4a: Fetch and delete entries from event_collabs table using event_id
    logger.info(`Step 4a: Fetching and deleting entries from event_collabs table for eventId: ${eventId}`);
    lastEvaluatedKey = null;
    let collabsQueryResult = { Items: [] };

    do {
      const collabsQueryParams = {
        TableName: 'event_collabs',
        KeyConditionExpression: 'event_id = :eventId',
        ExpressionAttributeValues: {
          ':eventId': eventId
        },
        ExclusiveStartKey: lastEvaluatedKey
      };

      const collabsResult = await docClient.query(collabsQueryParams).promise();
      collabsQueryResult.Items = collabsQueryResult.Items.concat(collabsResult.Items);
      lastEvaluatedKey = collabsResult.LastEvaluatedKey;

    } while (lastEvaluatedKey);

    if (collabsQueryResult.Items.length > 0) {
      for (const collab of collabsQueryResult.Items) {
        const deleteCollabParams = {
          TableName: 'event_collabs',
          Key: {
            event_id: collab.event_id,
            user_name: collab.user_name
          }
        };

        try {
          await docClient.delete(deleteCollabParams).promise();
          logger.info(`Deleted entry from event_collabs table for event_id: ${collab.event_id}, user_name: ${collab.user_name}`);
        } catch (deleteError) {
          logger.error(`Failed to delete entry from event_collabs table for event_id: ${collab.event_id}, user_name: ${collab.user_name} - Error: ${deleteError.message}`);
          return res.status(500).json({ message: 'Error deleting entry from event_collabs table', error: deleteError.message });
        }
      }
      logger.info(`Step 4a Completed: Deleted all fetched entries from event_collabs table`);
    } else {
      logger.info('No entries found in event_collabs table for eventId');
    }

    // Step 5a: Delete the event-related thumbnail image from flashbackeventthumbnail bucket
    logger.info(`Step 5a: Deleting event-related thumbnail from flashbackeventthumbnail bucket`);
    const thumbnailKey = `${folderName}.jpg`; // Construct the key for the thumbnail image
    const deleteThumbnailParams = {
      Bucket: 'flashbackeventthumbnail',
      Key: thumbnailKey
    };

    try {
      const deleteThumbnailResult = await s3.deleteObject(deleteThumbnailParams).promise();
      logger.info(`Step 5a Completed: Deleted thumbnail image ${thumbnailKey} from flashbackeventthumbnail bucket`);
    } catch (thumbnailDeleteError) {
      logger.error(`Failed to delete thumbnail image from flashbackeventthumbnail bucket: ${thumbnailDeleteError.message}`);
      return res.status(500).json({ message: 'Error deleting thumbnail image from S3', error: thumbnailDeleteError.message });
    }

    // Step 5: Delete the event from the primary event details table
    logger.info(`Step 5: Deleting event from primary table for eventId: ${eventId}`);
    await docClient.delete(getParams).promise();
    logger.info(`Step 5 Completed: Event deleted from primary table for eventId: ${eventId}`);

    // Step 6: Insert entry into event_delete table with event_id, user_phone_number, and deleted date
    logger.info(`Step 6: Inserting entry into event_delete table for eventId: ${eventId}, userPhoneNumber: ${userPhoneNumber}`);
    const deleteDate = new Date().toISOString(); // Get the current date in ISO format
    const eventDeleteParams = {
      TableName: deletedEventsTable,
      Item: {
        event_id: eventId,
        user_phone_number: userPhoneNumber,
        deleted_date: deleteDate
      }
    };

    try {
      await docClient.put(eventDeleteParams).promise();
      logger.info(`Step 6 Completed: Inserted entry into event_delete table for eventId: ${eventId}, userPhoneNumber: ${userPhoneNumber}`);
    } catch (eventDeleteError) {
      logger.error(`Failed to insert entry into event_delete table for eventId: ${eventId}, userPhoneNumber: ${userPhoneNumber} - Error: ${eventDeleteError.message}`);
      return res.status(500).json({ message: 'Error inserting entry into event_delete table', error: eventDeleteError.message });
    }

    logger.info(`Deletion Process Completed successfully for eventId: ${eventId}`);
    res.status(200).json({ message: 'Event deleted successfully and marked as deleted in event mapping table' });
  } catch (error) {
    logger.error(`Error during deletion process for eventId: ${eventId}:`, error);
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


app.get("/getEventDetailsByProjectName/:projectName", async (req, res) => {
  
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
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });

// app.use(limiter);
// app.use(express.json());



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


// app.post('/uploadFiles/:eventName/:eventDate/:folder_name', upload.array('files', 2000), async (req, res) => {
//   try {
//     const { eventName, eventDate, folder_name } = req.params;
//     const { chunkNumber, totalChunks } = req.body;
    
//     const uploadPromises = req.files.map(async (file) => {
//       const fileId = `${folder_name}/${file.originalname}`;
//       const params = {
//         Bucket: imagesBucketName,
//         Key: fileId,
//         Body: file.buffer,
//         ContentType: file.mimetype
//       };

//       try {
//         const result = await s3.upload(params).promise();
//         uploadStatus.set(fileId, {
//           status: 'completed',
//           chunkNumber,
//           totalChunks
//         });
//         return result;
//       } catch (error) {
//         console.error(`Error uploading file ${file.originalname}:`, error);
//         uploadStatus.set(fileId, {
//           status: 'failed',
//           chunkNumber,
//           totalChunks,
//           error: error.message
//         });
//         throw error;
//       }
//     });

//     const results = await Promise.allSettled(uploadPromises);

//     const successfulUploads = results.filter(r => r.status === 'fulfilled').map(r => r.value);
//     const failedUploads = results.filter(r => r.status === 'rejected').map(r => r.reason);

//     res.status(200).json({
//       message: 'Upload process completed',
//       successfulUploads,
//       failedUploads,
//       totalFiles: req.files.length
//     });
//   } catch (error) {
//     console.error('Error in upload process:', error);
//     res.status(500).json({ error: 'Error in upload process' });
//   }
// });


app.get("/getEventOwners/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  const collabStatus = "Accept"; // You should specify or pass this somehow
  logger.info(`Fetching event details for ${eventId}`);
  
  try {
    const eventDetails = await getEventDetailsById(eventId);

    if (eventDetails) {
      logger.info(`Fetched event details for ${eventId}`);
      const params = {
        TableName: EventCollabs, // Assuming your DynamoDB table name is EventCollabs
        KeyConditionExpression: 'event_id = :eventId',
        FilterExpression: 'collab_status = :collabStatus',
        ExpressionAttributeValues: {
          ':eventId': eventId,
          ':collabStatus': collabStatus
        },
      };

      const result = await docClient.query(params).promise();
      if(result){
        const owners = [eventDetails.client_name, ...result.Items.map(item => item.user_name)];
        logger.info('Fetched Collab details for event', eventId);
        res.status(200).send({'folder_name': eventDetails.folder_name, 'owners': owners});
      }
      else
        throw new Error('Error in fetching event owners');
    } else {
      res.status(404).send({ message: "Event not found" });
    }
  } catch (err) {
    logger.error(err.message); // Using logger.error for error logging
    res.status(500).send({ message: err.message });
  }
});

// Function to fetch images by user phone number and return the count
async function fetchImageCountByUserPhoneNumber(userPhoneNumber) {
  let totalCount = 0;
  let lastEvaluatedKey = null;

  do {
      const params = {
          TableName: ImageUploadData, // Ensure this is the correct table name
          IndexName: 'user_phone_number-index',
          KeyConditionExpression: 'user_phone_number = :userPhoneNumber',
          FilterExpression: 'attribute_not_exists(enable_sharing) OR enable_sharing <> :true',
          ExpressionAttributeValues: {
              ':userPhoneNumber': userPhoneNumber,
              ':true': true
          },
          ExclusiveStartKey: lastEvaluatedKey // For pagination
      };

      try {
          const data = await docClient.query(params).promise();
          totalCount += data.Count; // Add the count of the current batch
          lastEvaluatedKey = data.LastEvaluatedKey; // For pagination

      } catch (error) {
          console.error('Error fetching images count:', error);
          throw new Error('Error fetching images count');
      }
  } while (lastEvaluatedKey); // Continue querying until all items are fetched

  return totalCount;
}

// API Endpoint to fetch image count
app.get('/imagesForFederated/:userPhoneNumber', async (req, res) => {
  const userPhoneNumber = req.params.userPhoneNumber;

  try {
      const imageCount = await fetchImageCountByUserPhoneNumber(userPhoneNumber);
      res.json({ count: imageCount });
  } catch (error) {
      res.status(500).json({ error: 'Error fetching images count' });
  }
});

const { savePermissionsOnChain } = require('./MobileApplication/Controller/BSCWalletController');
async function updateEnableSharingForUserPhoneNumber(userPhoneNumber) {
  let lastEvaluatedKey = null;
  logger.info("Updating Enable sharing for userPhoneNumber: " + userPhoneNumber);

  const getParams = {
    TableName: "smart_contract_hash_details", // Ensure this is the correct table name
    Key: { "user_phone_number": userPhoneNumber}
  };
  const scResult = await docClient.get(getParams).promise();
  if(!scResult.Item){
      await savePermissionsOnChain(userPhoneNumber)
  }

  do {
    // Step 1: Fetch records in batches
    const params = {
      TableName: ImageUploadData,
      IndexName: 'user_phone_number-index',
      KeyConditionExpression: 'user_phone_number = :userPhoneNumber',
      FilterExpression: 'attribute_not_exists(enable_sharing) OR enable_sharing <> :true',
      ExpressionAttributeValues: {
        ':userPhoneNumber': userPhoneNumber,
        ':true': true
      },
      ExclusiveStartKey: lastEvaluatedKey, // Start key for pagination
    };

    try {
      const data = await docClient.query(params).promise();
      const itemsToUpdate = data.Items;

      // Step 2: Update each item one by one synchronously
      for (let item of itemsToUpdate) {
        const updateParams = {
          TableName: ImageUploadData,
          Key: {
            s3_url: item.s3_url
          },
          UpdateExpression: 'set enable_sharing = :true',
          ExpressionAttributeValues: {
            ':true': true
          }
        };

     

        // Wait for each item to be updated sequentially
        const res=await docClient.update(updateParams).promise();
        logger.info(res);
      }
      logger.info(`Fetched ${itemsToUpdate.length} items in this batch.`);
      // Step 3: Prepare for the next batch
      lastEvaluatedKey = data.LastEvaluatedKey;

    } catch (error) {
      console.error('Error fetching or updating images:', error);
      throw new Error('Error fetching or updating images');
    }

  } while (lastEvaluatedKey); // Continue until no more items to fetch

  // Step 4: Return success after all batches are processed
  logger.info("Updating Enable sharing for userPhoneNumber completed: " + userPhoneNumber);
  return { message: 'All records updated successfully' };
}



// Example usage (Node.js Express route handler)
app.post("/updateImageEnableSharing",async(req, res) =>{
  const { userPhoneNumber } = req.body;

  if (!userPhoneNumber) {
      return res.status(400).json({ error: 'userPhoneNumber is required' });
  }

  try {
      const result = await updateEnableSharingForUserPhoneNumber(userPhoneNumber);
      res.json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Function to update DynamoDB
async function updateImageUploadData(s3Result, userPhoneNumber, originalName, eventName, folderName) {
  const now = new Date();
  const dynamoDbParams = {
    TableName: ImageUploadData,
    Item: {
      s3_url: s3Result.Location,
      user_phone_number: userPhoneNumber,
      file_name: originalName,
      event_name: eventName,
      folder_name: folderName,
      uploaded_date: now.toISOString(),
      enable_sharing:false,

    }
  };

  try {
    await docClient.put(dynamoDbParams).promise();
    logger.info("Updated Image data in ImageUploadData table");
  } catch (error) {
    logger.error(`Error updating DynamoDB for file ${originalName}:`, error);
    throw error;
  }
}

// app.post('/uploadFiles/:eventName/:userPhoneNumber/:folder_name', upload.array('files', 50), async (req, res) => {
//   const { eventName, userPhoneNumber, folder_name } = req.params;

//   logger.info("Started uploading files for the event : "+folder_name);
//   const uploadPromises = req.files.map(async (file) => {
//     const fileId = `${folder_name}/${file.originalname}`;
//     const s3Params = {
//       Bucket: imagesBucketName,
//       Key: fileId,
//       Body: file.buffer,
//       ContentType: file.mimetype
//     };

//     try {
//       const s3Result = await s3.upload(s3Params).promise();
//       // Update DynamoDB with the new entry
//       await updateImageUploadData(s3Result, userPhoneNumber, file.originalname, eventName, folder_name);
    
//       return s3Result;
//     } catch (error) {
//       console.error(`Error uploading file ${file.originalname}:`, error);
//       throw error;
//     }
//   });

//   try {
//     const results = await Promise.allSettled(uploadPromises);
//     const successfulUploads = results.filter(r => r.status === 'fulfilled').map(r => r.value);
//     const failedUploads = results.filter(r => r.status === 'rejected').map(r => r.reason);

//     logger.info("Upload process completed for the event : "+folder_name)
//     res.status(200).json({
//       message: 'Upload process completed',
//       successfulUploads,
//       failedUploads,
//       totalFiles: req.files.length
//     });
//   } catch (error) {
//     console.error('Error in upload process:', error);
//     res.status(500).json({ error: 'Error in upload process' });
//   }
// });

// Function to update DynamoDB

app.post('/uploadFiles/:eventName/:userPhoneNumber/:folder_name', (req, res) => {
  const { eventName, userPhoneNumber, folder_name } = req.params;
  logger.info("Started uploading files for the event: " + folder_name);

  const bb = busboy({ headers: req.headers });
  const uploadPromises = [];

  bb.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
    const fileId = `${folder_name}/${filename.filename}`;
    const s3Params = {
      Bucket: imagesBucketName,
      Key: fileId,
      Body: fileStream, // Stream the file directly
      ContentType: mimetype,
    };

    // Create a promise for each upload
    const uploadPromise = s3.upload(s3Params).promise()
      .then(async (s3Result) => {
        // Update DynamoDB with the new entry
        await updateImageUploadData(s3Result, userPhoneNumber, filename, eventName, folder_name);
        return s3Result;
      })
      .catch((error) => {
        console.error(`Error uploading file ${filename}:`, error);
        throw error;
      });

    uploadPromises.push(uploadPromise);
  });

  bb.on('field', (fieldname, val) => {
    // Handle any form fields if necessary
  });

  bb.on('finish', async () => {
    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failedUploads = results.filter(r => r.status === 'rejected').map(r => r.reason);

      logger.info("Upload process completed for the event: " + folder_name);
      res.status(200).json({
        message: 'Upload process completed',
        successfulUploads,
        failedUploads,
        totalFiles: successfulUploads.length + failedUploads.length,
      });
    } catch (error) {
      console.error('Error in upload process:', error);
      res.status(500).json({ error: 'Error in upload process' });
    }
  });

  bb.on('error', (err) => {
    console.error('Error parsing form:', err);
    res.status(500).json({ error: 'Error parsing form' });
  });

  req.pipe(bb);
});


async function updateFlashbackImageUploadData(s3Result, userPhoneNumber, originalName, flashbackName, eventId, folderName) {
  const now = new Date();
  const dynamoDbParams = {
    TableName: FlashbackImageUploadData,
    Item: {
      s3_url: s3Result.Location,
      user_phone_number: userPhoneNumber,
      file_name: originalName,
      flashback_name:flashbackName,
      event_id: eventId,
      folder_name: folderName,
      flashback_type:'uploaded',
      uploaded_date: now.toISOString(),
      enable_sharing:false,

    }
  };

  try {
    await docClient.put(dynamoDbParams).promise();
    logger.info("Updated Image data in ImageUploadData table");
  } catch (error) {
    logger.error(`Error updating DynamoDB for file ${originalName}:`, error);
    throw error;
  }
}

const sharp = require('sharp'); // Import sharp for image resizing

app.post('/uploadFlashbackFiles/:flashbackName/:eventId/:userPhoneNumber/:folder_name', upload.array('files', 50), async (req, res) => {
  const { eventId, flashbackName, userPhoneNumber, folder_name } = req.params;

  logger.info("Started uploading files for the event: " + folder_name);
  
  const uploadPromises = req.files.map(async (file) => {
    const fileId = `${folder_name}/${flashbackName}/${file.originalname}`;
    const s3Params = {
      Bucket: flashbacksBucketname,
      Key: fileId,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    try {
      // Upload original image to S3
      const s3Result = await s3.upload(s3Params).promise();

      // Resize the image to 1024x1024 using sharp
      const resizedImageBuffer = await sharp(file.buffer)
        .resize(1024, 1024, { fit: sharp.fit.inside, withoutEnlargement: true })
        .toBuffer();

      // Create a key for the thumbnail (you can modify this path as needed)
      const thumbnailKey = `${folder_name}/${flashbackName}/thumbnails/${file.originalname}`;

      const thumbnailParams = {
        Bucket: flashbacksBucketname,
        Key: thumbnailKey,
        Body: resizedImageBuffer,
        ContentType: file.mimetype
      };

      // Upload the thumbnail to S3
      await s3.upload(thumbnailParams).promise();

      // Update DynamoDB with the new entry for the original file
      await updateFlashbackImageUploadData(s3Result, userPhoneNumber, file.originalname, flashbackName, eventId, folder_name);
      
      // Return the result for the original image upload
      return s3Result;
    } catch (error) {
      console.error(`Error uploading file ${file.originalname}:`, error);
      throw error;
    }
  });

  try {
    const results = await Promise.allSettled(uploadPromises);
    const successfulUploads = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failedUploads = results.filter(r => r.status === 'rejected').map(r => r.reason);

    logger.info("Upload process completed for the event: " + folder_name);
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


// Function to update DynamoDB
async function saveOrUpdateFlashback(flashbackName, eventId, eventName, userPhoneNumber) {
  const now = new Date();
  const dynamoDbParams = {
    TableName: FlashbackDetailsTable, // Ensure this is properly defined elsewhere in your code
    Key: {
      "flashback_name": flashbackName,
      "event_id": eventId // Assuming `user_phone_number` and `event_id` together form a unique key
    },
    UpdateExpression: "SET user_phone_number = :user_phone_number, event_name = :eventName, flashback_type = :flashbackType, created_date = :createdDate",
    ExpressionAttributeValues: {
      ":user_phone_number": userPhoneNumber,
      ":eventName": eventName,
      ":flashbackType": 'uploaded',
      ":createdDate": now.toISOString()
    },
    ReturnValues: "ALL_NEW" // This returns the updated item
  };

  try {
    const res = await docClient.update(dynamoDbParams).promise();
    logger.info(`Successfully added or updated Flashback in ${FlashbackDetailsTable} table: ${flashbackName}`);
    return res;
  } catch (error) {
    logger.error(`Error Adding or Updating Flashback in ${FlashbackDetailsTable} table ${flashbackName}:`, error);
    throw error;
  }
}

app.post('/saveFlashbackDetails', async (req, res) => {
  const { flashbackName, eventId, eventName, userPhoneNumber } = req.body; // Changed req.data to req.body
  try {
    logger.info("Saving or Updating Flashback details: ", flashbackName);
    const result = await saveOrUpdateFlashback(flashbackName, eventId, eventName, userPhoneNumber);
    logger.info("Successfully Saved or Updated Flashback details: ", flashbackName);
    res.status(200).send({ message: 'Flashback saved or updated successfully', data: result.Attributes });
  } catch (err) {
    logger.error("Error in saving or updating Flashbacks:", err);
    res.status(500).send({ message: "Error in saving or updating Flashbacks", error: err.message });
  }
});

// Function to fetch flashbacks based on event_id
async function getFlashbacksByEventId(eventId) {
  const dynamoDbParams = {
    TableName: FlashbackDetailsTable, // Make sure the table name is correctly defined
    FilterExpression: "event_id = :eventId",
    ExpressionAttributeValues: {
      ":eventId": eventId,
    },
  };

  try {
    const result = await docClient.scan(dynamoDbParams).promise();
    logger.info(`Fetched flashbacks for event_id: ${eventId}`);
    return result.Items;
  } catch (error) {
    logger.error(`Error fetching flashbacks for event_id ${eventId}:`, error);
    throw error;
  }
}

// Define the GET endpoint in Express
app.get("/getFlashbacks/:eventId", async (req, res) => {
  const { eventId } = req.params;
  try {
    logger.info("Fetching flashbacks for event_id: ", eventId);
    const flashbacks = await getFlashbacksByEventId(eventId);
    logger.info("Successfully fetched flashbacks for event_id: ", eventId);
    res.status(200).send(flashbacks);
  } catch (err) {
    logger.error(`Error fetching flashbacks for event_id ${eventId}:`, err);
    res.status(500).send({ message: "Error fetching flashbacks", error: err.message });
  }
});



// app.post('/uploadFiles/:eventName/:eventDate/:folder_name', upload.array('files', 50), async (req, res) => {
//   try {
//     const { eventName, eventDate, folder_name } = req.params;

//     const uploadPromises = req.files.map(async (file) => {
//       const fileId = `${folder_name}/${file.originalname}`;
//       const params = {
//         Bucket: imagesBucketName,
//         Key: fileId,
//         Body: file.buffer, // Consider using a stream if the file size is very large
//         ContentType: file.mimetype
//       };

//       try {
//         const result = await s3.upload(params).promise();
//         return result;
//       } catch (error) {
//         console.error(`Error uploading file ${file.originalname}:`, error);
//         throw error;
//       }
//     });

//     const results = await Promise.allSettled(uploadPromises);

//     const successfulUploads = results.filter(r => r.status === 'fulfilled').map(r => r.value);
//     const failedUploads = results.filter(r => r.status === 'rejected').map(r => r.reason);

//     res.status(200).json({
//       message: 'Upload process completed',
//       successfulUploads,
//       failedUploads,
//       totalFiles: req.files.length
//     });
//   } catch (error) {
//     console.error('Error in upload process:', error);
//     res.status(500).json({ error: 'Error in upload process' });
//   }
// });



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



app.post("/updateUserDetails", async (req, res) => {
  const { user_phone_number, ...updateFields } = req.body;

  logger.info("Updating the user info for the user_phone_number: ", user_phone_number);

  try {
    // Call the function to update user details
    const updatedUser = await updateUserDetails(user_phone_number, updateFields);
    res.status(200).json({ message: "User details updated successfully", data: updatedUser });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: error.message || "Could not update user details" });
  }
});


const updateUserDetails = async (user_phone_number, updateFields) => {
  if (!user_phone_number) {
    throw new Error("User phone number is required");
  }

  if (Object.keys(updateFields).length === 0) {
    throw new Error("At least one field to update must be provided");
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

  // Perform the update operation
  const result = await docClient.update(params).promise();
  return result.Attributes;
};



app.get("/fetchUserDetails/:userPhoneNumber",async (req,res)=>{

  try{
    const userPhoneNumber =req.params.userPhoneNumber;
    const result = await getUserObjectByUserPhoneNumber(userPhoneNumber);
    logger.info("Successfully fetched user info for userPhoneNumber : "+userPhoneNumber);
    res.send({"message":"Successfully fetched user details","data":result});
  }
  catch(err){
    res.status(500).send(err.message);
  }
})

app.get("/fetchUserDetailsByUserName/:userName", async (req, res) => {
  try {
    const userName = req.params.userName;
    const result = await getUserObjectByUserName(userName); // Updated function call
    if (result.length === 0) {
      throw new Error("userName not found");
    }
    res.send({ "message": "Successfully fetched user details", "data": result[0] });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// app.post("/updateUserDetails", async (req, res) => {
//   const { user_phone_number, ...updateFields } = req.body;

//   logger.info("Updating the user info for the user_name: ",user_phone_number)
  
//   if (!user_phone_number) {
//       return res.status(400).json({ error: "User phone number is required" });
//   }

//   if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({ error: "At least one field to update must be provided" });
//   }

//   const updateExpressions = [];
//   const expressionAttributeNames = {};
//   const expressionAttributeValues = {};

//   Object.keys(updateFields).forEach(key => {
//       updateExpressions.push(`#${key} = :${key}`);
//       expressionAttributeNames[`#${key}`] = key;
//       expressionAttributeValues[`:${key}`] = updateFields[key];
//   });

//   const params = {
//       TableName: userrecordstable,
//       Key: {
//           user_phone_number: user_phone_number
//       },
//       UpdateExpression: `SET ${updateExpressions.join(', ')}`,
//       ExpressionAttributeNames: expressionAttributeNames,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ReturnValues: 'ALL_NEW'
//   };

//   try {
//       const result = await docClient.update(params).promise();
//       res.status(200).json({ message: "User details updated successfully", data: result.Attributes });
//   } catch (error) {
//       console.error("Error updating user details:", error);
//       res.status(500).json({ error: "Could not update user details" });
//   }
// });

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

const calculateScore = async (person, userCount,userAge, expectedAgeDifference) => {
  const actualAgeDifference = Math.abs(person.avgAge - userAge);
  const deviation = Math.abs(actualAgeDifference - expectedAgeDifference);

  // Calculate the age factor based on the deviation
  const maxDeviation = 50; // Deviation at which the score becomes 0
  const ageFactor = Math.max(0, 100 - (deviation / maxDeviation) * 100); // Linear decrease from 100 to 0

  const countFactor = Math.max(0, (person.count / userCount) * 100);

  // Final score is the count multiplied by the age factor
  return countFactor*0.8 + ageFactor*0.2;
};


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
        gender: userThumbnail ? userThumbnail.gender : null,
        face_url: `https://rekognitionuserfaces.s3.amazonaws.com/thumbnails/${userId}.jpg`
      };
    });

    // Step 5: Generate Family Suggestions
    const user = enrichedUserIdMap.find(user => user.user_id === user_id);
    if (!user) {
      logger.info('No information found for the provided user_id');
      return res.status(404).send('User not found');
    }

    const userAge = user.avgAge;
    const userGender = user.gender;
    const userCount = user.count;

    logger.info(`userAge: ${userAge}, userGender: ${userGender}`);
    const userObject = {
      user_id: user_id,
      avgAge: userAge,
      gender: userGender
    };
    const familySuggestions = {
      father: [],
      mother: [],
      siblings: [],
      spouse: [],
      kids: [],
      user: userObject
    };

    for (const person of enrichedUserIdMap) {
      if (person.user_id === user_id || person.avgAge === null) continue;
      
      const clonedPerson = {...person};
      
      // Calculate scores for father suggestions
      if (clonedPerson.gender === 'Male' && clonedPerson.avgAge >= userAge) {
        clonedPerson.score = await calculateScore(clonedPerson,userCount, userAge, 15);
        familySuggestions.father.push(clonedPerson);
      }

      // Clone the person object again for mother section
      const clonedPersonMother = {...person};
      
      // Calculate scores for mother suggestions
      if (clonedPersonMother.gender === 'Female' && clonedPersonMother.avgAge >= userAge) {
        clonedPersonMother.score = await calculateScore(clonedPersonMother,userCount, userAge, 15);
        familySuggestions.mother.push(clonedPersonMother);
      }

      // Clone the person object again for siblings section
      const clonedPersonSibling = {...person};
      
      // Calculate scores for siblings suggestions
      if (Math.abs(clonedPersonSibling.avgAge - userAge) <= 20) {
        clonedPersonSibling.score = await calculateScore(clonedPersonSibling, userCount, userAge, 3);
        familySuggestions.siblings.push(clonedPersonSibling);
        
        const clonedPersonSpouse = {...clonedPersonSibling};
        if (clonedPersonSpouse.gender !== userGender) {
          clonedPersonSpouse.score = await calculateScore(clonedPersonSpouse, userCount, userAge, 5);
          familySuggestions.spouse.push(clonedPersonSpouse);
        }
      }

      // Clone the person object again for kids section
      const clonedPersonKid = {...person};
      
      // Calculate scores for kids suggestions
      if (clonedPersonKid.avgAge <= userAge - 10) {
        clonedPersonKid.score = await calculateScore(clonedPersonKid, userCount, userAge, 20);
        familySuggestions.kids.push(clonedPersonKid);
      }
    }

    // Sorting the lists based on the score
    familySuggestions.father = familySuggestions.father.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge }) => ({ face_url, avgAge }));
    familySuggestions.mother = familySuggestions.mother.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge }) => ({ face_url, avgAge }));
    familySuggestions.siblings = familySuggestions.siblings.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge, gender }) => ({ face_url, avgAge, gender }));
    familySuggestions.spouse = familySuggestions.spouse.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge }) => ({ face_url, avgAge }));
    familySuggestions.kids = familySuggestions.kids.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge }) => ({ face_url, avgAge }));


    // enrichedUserIdMap.forEach(person => {
    //   if(person.avgAge!==null){
    //   if (person.user_id === user_id) return;

    //   if (person.gender === 'Male' && person.avgAge >= userAge) {
       
    //       familySuggestions.father.push(person);
        
    //   } if (person.gender === 'Female' && person.avgAge >= userAge) {
       
    //       familySuggestions.mother.push(person);
        
    //   }
    //       familySuggestions.siblings.push(person);
    //   if ( person.gender !== userGender) {
    //     familySuggestions.spouse.push(person);
    //   }
    //    if (person.avgAge <= userAge - 10) {
    //       familySuggestions.kids.push(person);
    //     }
    //   }
    // });

    // // Sorting the lists based on the count
    // familySuggestions.father =  familySuggestions.father.sort((a, b) => b.count - a.count).slice(0, 10).map(({ face_url, avgAge, gender }) => ({ face_url, avgAge, gender })); // Higher count first
    // familySuggestions.mother = familySuggestions.mother.sort((a, b) => b.count - a.count).slice(0, 10).map(({ face_url, avgAge, gender }) => ({ face_url, avgAge, gender })); // Higher count first
    // familySuggestions.siblings = familySuggestions.siblings.sort((a, b) => b.count - a.count).slice(0, 20).map(({ face_url, avgAge, gender }) => ({ face_url, avgAge, gender })); // Higher count first
    // familySuggestions.spouse = familySuggestions.spouse.sort((a, b) => b.count - a.count).slice(0, 10).map(({ face_url, avgAge, gender }) => ({ face_url, avgAge, gender })); // Higher count first
    // familySuggestions.kids = familySuggestions.kids.sort((a, b) => b.count - a.count).slice(0, 10).map(({ face_url, avgAge, gender }) => ({ face_url, avgAge, gender })); // Higher count first


    res.send(familySuggestions);
  } catch (error) {
    logger.error(`Error fetching images: ${error.message}`);
    res.status(500).send("Error fetching images");
  }
});


app.get("/getFamilySuggestionsV1/:user_id/:eventName", async (req, res) => {
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
      TableName: eventsDetailsTable,
      FilterExpression: 'folder_name = :eventName',
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
        gender: userThumbnail ? userThumbnail.gender : null,
        face_url: `https://rekognitionuserfaces.s3.amazonaws.com/thumbnails/${userId}.jpg`
      };
    });

    // Step 5: Generate Family Suggestions
    const user = enrichedUserIdMap.find(user => user.user_id === user_id);
    if (!user) {
      logger.info('No information found for the provided user_id');
      return res.status(404).send('User not found');
    }

    const userAge = user.avgAge;
    const userGender = user.gender;
    const userCount = user.count;

    logger.info(`userAge: ${userAge}, userGender: ${userGender}`);
    const userObject = {
      user_id: user_id,
      avgAge: userAge,
      gender: userGender
    };
    const familySuggestions = {
      father: [],
      mother: [],
      siblings: [],
      spouse: [],
      kids: [],
      user: userObject
    };

    for (const person of enrichedUserIdMap) {
      if (person.user_id === user_id || person.avgAge === null) continue;
      
      const clonedPerson = {...person};
      
      // Calculate scores for father suggestions
      if (clonedPerson.gender === 'Male' && clonedPerson.avgAge >= userAge) {
        clonedPerson.score = await calculateScore(clonedPerson,userCount, userAge, 15);
        familySuggestions.father.push(clonedPerson);
      }

      // Clone the person object again for mother section
      const clonedPersonMother = {...person};
      
      // Calculate scores for mother suggestions
      if (clonedPersonMother.gender === 'Female' && clonedPersonMother.avgAge >= userAge) {
        clonedPersonMother.score = await calculateScore(clonedPersonMother,userCount, userAge, 15);
        familySuggestions.mother.push(clonedPersonMother);
      }

      // Clone the person object again for siblings section
      const clonedPersonSibling = {...person};
      
      // Calculate scores for siblings suggestions
      if (Math.abs(clonedPersonSibling.avgAge - userAge) <= 20) {
        clonedPersonSibling.score = await calculateScore(clonedPersonSibling, userCount, userAge, 3);
        familySuggestions.siblings.push(clonedPersonSibling);
        
        const clonedPersonSpouse = {...clonedPersonSibling};
        if (clonedPersonSpouse.gender !== userGender) {
          clonedPersonSpouse.score = await calculateScore(clonedPersonSpouse, userCount, userAge, 5);
          familySuggestions.spouse.push(clonedPersonSpouse);
        }
      }

      // Clone the person object again for kids section
      const clonedPersonKid = {...person};
      
      // Calculate scores for kids suggestions
      if (clonedPersonKid.avgAge <= userAge - 10) {
        clonedPersonKid.score = await calculateScore(clonedPersonKid, userCount, userAge, 20);
        familySuggestions.kids.push(clonedPersonKid);
      }
    }

    // Sorting the lists based on the score
    familySuggestions.father = familySuggestions.father.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge }) => ({ face_url, avgAge }));
    familySuggestions.mother = familySuggestions.mother.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge }) => ({ face_url, avgAge }));
    familySuggestions.siblings = familySuggestions.siblings.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge, gender }) => ({ face_url, avgAge, gender }));
    familySuggestions.spouse = familySuggestions.spouse.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge }) => ({ face_url, avgAge }));
    familySuggestions.kids = familySuggestions.kids.sort((a, b) => b.score - a.score).slice(0, 15).map(({ face_url, avgAge }) => ({ face_url, avgAge }));

    res.send(familySuggestions);
  } catch (error) {
    logger.error(`Error fetching images: ${error.message}`);
    res.status(500).send("Error fetching images");
  }
});



app.put("/setFolderName/:eventName", async(req,res) =>{
  const eventName = req.params.eventName;
  try {
    logger.info("fetching images for event : " + eventName)
    const params = {
        TableName: recokgImages,
        FilterExpression: 'contains(#attr, :val)',
        ExpressionAttributeNames: {
            '#attr': 's3_url',
        },
        ExpressionAttributeValues: {
            ':val': eventName, 
        },
        ProjectionExpression: 's3_url, image_id, selected'
    };

    let items = [];
    let lastEvaluatedKey = null;

    do {
        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }

        const data = await docClient.scan(params).promise();
        for (let item of data.Items) {
            // Extract folder_name from s3_url
            const s3UrlParts = item.s3_url.split('/');
            const folder_name = s3UrlParts[s3UrlParts.length - 2]; // Assuming folder name is the second last part of the URL

            // Add folder_name to item
            item.folder_name = folder_name;

            // Update the record in DynamoDB with the new folder_name
            const updateParams = {
                TableName: recokgImages,
                Key: { image_id: item.image_id }, // Assuming image_id is the primary key
                UpdateExpression: 'set folder_name = :folder_name',
                ExpressionAttributeValues: {
                    ':folder_name': folder_name
                }
            };
            await docClient.update(updateParams).promise();
        }

        items = items.concat(data.Items);
        logger.info("Fetched and updated Images -> " + items.length);
        lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    logger.info("Total images fetched and updated: " + items.length);
    res.send(items);
} catch (error) {
    logger.error("Error fetching or updating images: ", error);
    res.status(500).send("Error fetching or updating images");
}

});

app.get("/getOtherImages/:eventName", async(req,res) =>{
 
  const eventName = req.params.eventName;
  try {
    logger.info("fetching images for event : "+eventName)
    const params = {
      TableName: recokgImages,
      IndexName: 'folder_name-index', 
      ProjectionExpression: 'image_id,s3_url,folder_name',
      KeyConditionExpression: 'folder_name = :folderName',
      FilterExpression: 'attribute_not_exists(user_ids)',
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
      const result = items.map(item => ({
        ...item,
        thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + item.s3_url.split("amazonaws.com/")[1]
      }));
    logger.info("Total images fetched" + " : " + result.length);
    res.send(result);
} catch(err){
  logger.info(err.message);
  res.status(500).send(err.message)
}

});

app.get("/getAllImages/:eventName", async(req,res) =>{
 
  const eventName = req.params.eventName;
  try {
    logger.info("fetching images for event : "+eventName)
    const params = {
      TableName: recokgImages,
      IndexName: 'folder_name-index', 
      ProjectionExpression: 'user_ids, image_id,s3_url,folder_name',
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
      const result = items.map(item => ({
        ...item,
        thumbnailUrl: "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/" + item.s3_url.split("amazonaws.com/")[1]
      }));
    logger.info("Total images fetched" + " : " + result.length);
    res.send(result);
} catch(err){
  logger.info(err.message);
  res.status(500).send(err.message)
}

});



// This code is for Portfolio 
// app.post('/uploadPortfolioImages', upload.array('images', 100), async (req, res) => {
//   try {
//     const { org_name, user_name } = req.body;
//     const files = req.files;

//     logger.info("Uploading Portfolio Images of orgName: "+org_name+" userName: "+user_name);

//     if (!files || files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded' });
//     }

//     const folderName = `${org_name}-${user_name}`;

//     const uploadPromises = files.map((file) => {
//       const uniqueFileName = `${folderName}/${Date.now()}-${path.basename(file.originalname)}`;
//       const params = {
//         Bucket: portfolioBucketName,
//         Key: uniqueFileName,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//       };

//       return s3.upload(params).promise();
//     });

//     const uploadResults = await Promise.all(uploadPromises);

//     res.status(200).json({
//       message: 'Files uploaded successfully',
//       files: uploadResults.map(result => ({
//         fileName: result.Key,
//         location: result.Location,
//       }))
//     });
//   } catch (error) {
//     console.error('Error uploading files to S3:', error);
//     res.status(500).json({ message: 'Error uploading files to S3', error: error.message });
//   }
// });

// app.post("/updatePortfolioDetails", async (req, res) => {
//   const { user_phone_number, org_name, social_media,role } = req.body;

//   logger.info("Updating portfolio details for the user_phone_number: ", user_phone_number);

//   if (!user_phone_number) {
//     return res.status(400).json({ error: "User phone number is required" });
//   }

//   // Initialize the update fields object
//   let updateFields = {};

//   // Convert org_name to lowercase, remove spaces, and handle the username generation
//   if (org_name) {
//     let username = org_name.toLowerCase().replace(/\s+/g, '');
//     logger.info(username)

//     // Check if the generated username already exists and create a unique one if necessary
//     let isUsernameTaken = true;
//     let counter = 1;
//     let baseUsername = username;

//     while (isUsernameTaken) {
//       const existingUser = await getUserObjectByUserName(username);
//       logger.info(existingUser)
//       if (existingUser.length!==0) {
//         username = `${baseUsername}${counter}`;
//         counter++;
//       } else {
//         isUsernameTaken = false;
//       }
//     }

//     updateFields.user_name = username; // Add the generated username to update fields
//   }

//   // Add other fields to the updateFields object
//   if (social_media) {
//     updateFields.social_media = social_media;
//   }
//   if (org_name) {
//     updateFields.org_name = org_name;
//   }
//   if(role){
//     updateFields.role = role;
//   }

//   const updateExpressions = [];
//   const expressionAttributeNames = {};
//   const expressionAttributeValues = {};

//   Object.keys(updateFields).forEach(key => {
//     updateExpressions.push(`#${key} = :${key}`);
//     expressionAttributeNames[`#${key}`] = key;
//     expressionAttributeValues[`:${key}`] = updateFields[key];
//   });

//   const params = {
//     TableName: userrecordstable,
//     Key: {
//       user_phone_number: user_phone_number
//     },
//     UpdateExpression: `SET ${updateExpressions.join(', ')}`,
//     ExpressionAttributeNames: expressionAttributeNames,
//     ExpressionAttributeValues: expressionAttributeValues,
//     ReturnValues: 'ALL_NEW'
//   };

//   try {
//     const result = await docClient.update(params).promise();
//     res.status(200).json({ message: "Portfolio details updated successfully", data: result.Attributes });
//   } catch (error) {
//     console.error("Error updating portfolio details:", error);
//     res.status(500).json({ error: "Could not update portfolio details" });
//   }
// });


app.post("/updatePortfolioDetails", async (req, res) => {
  const { user_phone_number } = req.body;

  logger.info("Updating portfolio details for the user_phone_number: ", user_phone_number);

  if (!user_phone_number) {
    return res.status(400).json({ error: "User phone number is required" });
  }

  // Initialize the update fields object
  let updateFields = {};

  // Check if org_name is provided and handle username generation
  if (req.body.user_name) {
    const org_name = req.body.user_name;
    let username = org_name.toLowerCase().replace(/\s+/g, '');
    logger.info(`Generated username: ${username}`);

    // Check if the generated username already exists and create a unique one if necessary
    let isUsernameTaken = true;
    let counter = 1;
    let baseUsername = username;

    while (isUsernameTaken) {
      const existingUser = await getUserObjectByUserName(username);
      logger.info(`Existing user : ${user_phone_number}`);
      if (existingUser.length !== 0) {
        username = `${baseUsername}${counter}`;
        counter++;
      } else {
        isUsernameTaken = false;
      }
    }

    // Add the generated username and org_name to update fields
    updateFields.user_name = username;
    updateFields.org_name = org_name;
  }

  // Conditionally add other fields to the updateFields object if they exist in the request
  if (req.body.social_media) {
    updateFields.social_media = req.body.social_media;
  }
  if (req.body.role) {
    updateFields.role = req.body.role;
  }
  if (req.body.org_name) {
    updateFields.org_name = req.body.org_name;
  }


  // If no fields are present to update, return a 400 error
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update" });
  }

  try {
    // Use the generic update function to update the user details
    const updatedUser = await updateUserDetails(user_phone_number, updateFields);

    res.status(200).json({ message: "Portfolio details updated successfully", data: updatedUser });
  } catch (error) {
    console.error("Error updating portfolio details:", error);
    res.status(500).json({ error: "Could not update portfolio details" });
  }
});

app.post('/uploadPortfolioImages', upload.any(), async (req, res) => {
  try {
    const {user_name } = req.body;
    const files = req.files;

    logger.info(`Uploading Portfolio Images of userName: ${user_name}`);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = [];
    const dynamoDBPromises = [];

    // Group files by folder names based on the field names in the request
    const folders = files.reduce((acc, file) => {
      const folderName = file.fieldname.replace('_images', ''); // Strip '_images' from the folder name
      if (!acc[folderName]) acc[folderName] = [];
      acc[folderName].push(file);
      return acc;
    }, {});

    // Loop through each folder and upload the files
    for (const [folderName, folderFiles] of Object.entries(folders)) {
      for (const file of folderFiles) {
        // Define unique file names for original and thumbnail versions
        const uniqueFileName = `${user_name}/${folderName}/${path.basename(file.originalname)}`;
        const thumbnailFileName = `${user_name}/thumbnails/${folderName}/${path.basename(file.originalname)}`;

        // Upload original image
        const originalParams = {
          Bucket: portfolioBucketName,
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        // Push S3 upload promise to uploadPromises array
        uploadPromises.push(s3.upload(originalParams).promise());
        // .then(uploadResult => {
        //   // Prepare DynamoDB entry for the thumbnail image
        //   const dynamoDBParams = {
        //     TableName: portfolioImagesTable,
        //     Item: {
        //       username: user_name,
        //       folder_name: folderName,
        //       s3_url: uploadResult.Location,
        //       uploadDate: Date.now(), // Timestamp
        //       is_favourite:false
        //     }
        //   };
        //   dynamoDBPromises.push(docClient.put(dynamoDBParams).promise());
        // }));

        // Compress and upload the thumbnail image
        const compressedBuffer = await sharp(file.buffer)
          .resize(1024, 1024) // Adjust the size as needed for your thumbnails
          .toBuffer();

        const thumbnailParams = {
          Bucket: portfolioBucketName,
          Key: thumbnailFileName,
          Body: compressedBuffer,
          ContentType: file.mimetype,
        };

        // Push S3 upload promise for thumbnail to uploadPromises array
        uploadPromises.push(s3.upload(thumbnailParams).promise()
        .then(uploadResult => {
          // Prepare DynamoDB entry for the thumbnail image
          const dynamoDBParams = {
            TableName: portfolioImagesTable,
            Item: {
              username: user_name,
              folder_name: folderName,
              s3_url: uploadResult.Location,
              uploadDate: Date.now(), // Timestamp
              is_favourite:false
            }
          };
          dynamoDBPromises.push(docClient.put(dynamoDBParams).promise());
        }));
      }
    }
    // Wait for all S3 uploads and DynamoDB inserts to complete
    const uploadResults = await Promise.all(uploadPromises);
    await Promise.all(dynamoDBPromises);

    // Filter out only the valid S3 upload results
    const validUploadResults = uploadResults.filter(result => result && result.Key && result.Location);

    res.status(200).json({
      message: 'Files uploaded successfully and entries added to DynamoDB',
      files: validUploadResults.map(result => ({
        fileName: result.Key,
        location: result.Location,
      }))
    });
  } catch (error) {
    console.error('Error uploading files to S3 or inserting into DynamoDB:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});


// app.get('/getPortfolioImages/:org_name/:user_name', async (req, res) => {
//   try {
//     const { org_name, user_name } = req.params;

//     if (!org_name || !user_name) {
//       return res.status(400).json({ message: 'org_name and user_name are required' });
//     }

//     const folderName = `${org_name}-${user_name}`;
//     const params = {
//       Bucket: portfolioBucketName,
//       Prefix: folderName,
//     };

//     const s3Data = await s3.listObjectsV2(params).promise();

//     if (!s3Data.Contents || s3Data.Contents.length === 0) {
//       return res.status(404).json({ message: 'No images found' });
//     }

//     const images = s3Data.Contents.map(item => ({
//       fileName: item.Key,
//       url: `https://${portfolioBucketName}.s3.amazonaws.com/${item.Key}`,
//     }));

//     res.status(200).json({
//       message: 'Images retrieved successfully',
//       images,
//     });
//   } catch (error) {
//     console.error('Error retrieving images from S3:', error);
//     res.status(500).json({ message: 'Error retrieving images from S3', error: error.message });
//   }
// });




// This is the code for the protocol backend 
app.get('/getPortfolioImages/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const sanitizedUserName = String(username);

    const params = {
      TableName: portfolioImagesTable,
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": sanitizedUserName,
      }
    };

    // Query DynamoDB for images of the specified user
    const data = await docClient.query(params).promise();

    if (!data.Items || data.Items.length === 0) {
      return res.status(200).json([]);
    }

    // Format the response data
    const folderMap = data.Items.reduce((acc, item) => {
      const folderName = item.folder_name || 'default_folder';

      if (!acc[folderName]) {
        acc[folderName] = [];
      }

      acc[folderName].push({
        s3_url: item.s3_url,
        uploadDate: item.uploadDate,
        file_name: item.file_name,
        is_favourite: item.is_favourite || false
      });

      return acc;
    }, {});

    // Transform the folderMap into the desired array format
    const images = Object.entries(folderMap).map(([folderName, images]) => ({
      folderName,
      images: images.sort((a, b) => b.is_favourite - a.is_favourite)  // Sort by is_favourite
    }));
    

    // Return the formatted response
    res.status(200).json(images);

  } catch (error) {
    console.error('Error retrieving images from DynamoDB:', error);
    res.status(500).json({ message: 'Error retrieving images from DynamoDB', error: error.message });
  }
});



// Utility function to clear S3 folder
const clearS3Folder = async (bucketName, folderPath) => {
  try {
    // List all objects in the folder
    const s3Objects = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: folderPath,
    }).promise();

    // Check if there are objects to delete
    if (s3Objects.Contents.length > 0) {
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: s3Objects.Contents.map((obj) => ({ Key: obj.Key })),
        },
      };
      await s3.deleteObjects(deleteParams).promise();
      logger.info(`Deleted all existing objects in folder: ${folderPath}`);
    }
  } catch (error) {
    logger.error(`Error clearing S3 folder ${folderPath}:`, error);
    throw error;
  }
};

app.post('/updateBannerImage', upload.single('bannerImage'), async (req, res) => {
  const { userName } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const folderPath = `${userName}/Banner/`;
  logger.info(`Updating banner for: ${userName}`);

  try {
    // Step 1: Clear existing objects in the S3 folder
    await clearS3Folder(portfolioBucketName, folderPath);

    // Step 2: Prepare the file name and compress the image
    const fileName = path.basename(file.originalname);
    const compressedBuffer = await sharp(file.buffer)
      .resize(600, 600) // Adjust the size as needed for your thumbnails
      .toBuffer();

    // Step 3: Upload the new banner image
    const uploadParams = {
      Bucket: portfolioBucketName,
      Key: `${folderPath}${fileName}`,
      Body: compressedBuffer,
      ContentType: file.mimetype,
    };

    await s3.upload(uploadParams).promise();

    const imageUrl = `https://${portfolioBucketName}.s3.amazonaws.com/${folderPath}${fileName}`;
    logger.info(`Uploaded and updated banner: ${imageUrl}`);

    // Step 4: Send response back with the new image URL
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error processing banner update:', error);
    res.status(500).send('Error updating banner image');
  }
});


// In your backend API
app.get('/getBannerImage/:userName', async (req, res) => {
  const {userName } = req.params;

  const folderPath = `${userName}/Banner/`;

  try {
    const s3Objects = await s3.listObjectsV2({
      Bucket: portfolioBucketName,
      Prefix: folderPath
    }).promise();

    if (s3Objects.Contents.length > 0) {
      const bannerObject = s3Objects.Contents[0];
      const imageUrl = `https://${portfolioBucketName}.s3.amazonaws.com/${bannerObject.Key}`;
      logger.info(`fetched banner: ${imageUrl}`);
      res.json({ imageUrl });
    } else {
      res.json({ });
    }
  } catch (error) {
    console.error('Error fetching banner image:', error);
    res.status(500).json({ message: 'Error fetching banner image' });
  }
});

app.get("/getDatasets/:orgName", async (req, res) => {
  
  const orgName = req.params.orgName; // Adjust based on your token payload
  logger.info(`Fetching Dataset details for ${orgName}`)
  try {
    const eventParams = {
      TableName: datasetTable,
      FilterExpression: "org_name = :orgName",
      ExpressionAttributeValues: {
        ":orgName": orgName
      }

    };


    const result = await docClient.scan(eventParams).promise();

    if (result.Items && result.Items.length > 0) {
      logger.info(`Fetched event details for ${orgName}`)
      res.status(200).send(result.Items);
    } 
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});

app.get("/getDatasets", async (req, res) => {
  logger.info(`Fetching all dataset entries`);
  
  try {
    const eventParams = {
      TableName: datasetTable,
    };

    const result = await docClient.scan(eventParams).promise();

    if (result.Items && result.Items.length >= 0) {
      logger.info(`Fetched ${result.Items.length} dataset entries`);
      res.status(200).send(result.Items);
    } 
  } catch (err) {
    logger.error(`Error fetching datasets: ${err.message}`);
    res.status(500).send(err.message);
  }
});

app.get("/getDatasetDetails/:orgName/:datasetName", async (req, res) => {
  
  const orgName = req.params.orgName.trim(); // Adjust based on your token payload
  const datasetName = req.params.datasetName.trim();
  logger.info(`Fetching Dataset details for ${orgName} and ${datasetName}`)
  try {
    const eventParams = {
      TableName: datasetTable,
      KeyConditionExpression: "org_name = :orgName and dataset_name = :datasetName",
      ExpressionAttributeValues: {
        ":orgName": orgName,
        ":datasetName": datasetName
      }
    };

    logger.info(eventParams)

    const result = await docClient.query(eventParams).promise();

    if (result.Items && result.Items.length > 0) {
      logger.info(`Fetched event details for ${orgName} and ${datasetName}`);
      res.status(200).send(result.Items);
    } else {
      logger.info(`No dataset details found for ${orgName} and ${datasetName}`);
      res.status(200).send({ message: "Dataset details not found" });
    }

  } catch (err) {
    logger.error(err.message);
    res.status(500).send(err.message);
  }
});


app.post("/saveDatasetDetails", async (req, res) => {
  const item = req.body;
  try {
    // Initialize item with necessary attributes
    const newItem = {
      'dataset_name': item.dataset_name,
      'org_name': item.org_name,
      // Add any other necessary fields here
    };
    
    logger.info(`Saving item with dataset_name: ${item.dataset_name} and org_name: ${item.org_name}`);

    // Iterate over the keys of the item to add them to the newItem object
    for (const key in item) {
      if (key !== 'dataset_name' && key !== 'org_name') {
        newItem[key] = item[key];
      }
    }

    const params = {
      TableName: datasetTable,
      Item: newItem
    };

    // Save the new item
    const data = await docClient.put(params).promise();
    logger.info(`Successfully saved item with dataset_name: ${item.dataset_name} and org_name: ${item.org_name}`);
    res.send(data);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send(error.message);
  }
});

app.get("/getModels/:orgName", async (req, res) => {
  
  const orgName = req.params.orgName; // Adjust based on your token payload
  logger.info(`Fetching Dataset details for ${orgName}`)
  try {
    const eventParams = {
      TableName: modelsTable,
      FilterExpression: "org_name = :orgName",
      ExpressionAttributeValues: {
        ":orgName": orgName
      }

    };


    const result = await docClient.scan(eventParams).promise();

    if (result.Items && result.Items.length > 0) {
      logger.info(`Fetched event details for ${orgName}`)
      res.status(200).send(result.Items);
    } 
  } catch (err) {
    logger.info(err.message);
    res.status(500).send(err.message);
  }
});

app.get("/getModelDetails/:orgName/:modelName", async (req, res) => {
  
  const orgName = req.params.orgName.trim(); // Adjust based on your token payload
  const modelName = req.params.modelName.trim();
  logger.info(`Fetching Dataset details for ${orgName} and ${modelName}`)
  try {
    const modelParams = {
      TableName: modelsTable,
      KeyConditionExpression: "org_name = :orgName and model_name = :modelName",
      ExpressionAttributeValues: {
        ":orgName": orgName,
        ":modelName": modelName
      }
    };

    logger.info(modelParams)

    const result = await docClient.query(modelParams).promise();

    if (result.Items && result.Items.length > 0) {
      logger.info(`Fetched model details for ${orgName} and ${modelName}`);
      res.status(200).send(result.Items);
    } else {
      logger.info(`No model details found for ${orgName} and ${modelName}`);
      res.status(404).send({ message: "Model details not found" });
    }

  } catch (err) {
    logger.error(err.message);
    res.status(500).send(err.message);
  }
});


app.post("/saveModelDetails", async (req, res) => {
  const item = req.body;
  try {
    // Initialize item with necessary attributes
    const newItem = {
      'model_name': item.model_name,
      'org_name': item.org_name,
      // Add any other necessary fields here
    };
    
   logger.info(`Saving item with dataset_name: ${item.dataset_name} and org_name: ${item.org_name}`);

    // Iterate over the keys of the item to add them to the newItem object
    for (const key in item) {
      if (key !== 'model_name' && key !== 'org_name') {
        newItem[key] = item[key];
      }
    }

    const params = {
      TableName: modelsTable,
      Item: newItem
    };

    // Save the new item
    const data = await docClient.put(params).promise();
    logger.info(`Successfully saved item with dataset_name: ${item.dataset_name} and org_name: ${item.org_name}`);
    res.send(data);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send(error.message);
  }
});

  app.post("/requestDatasetAccess", async (req, res) => {
    const item = req.body;
      // Initialize item with necessary attributes
      const newItem = {
        'model': item.model_name+'-'+item.model_org_name,
        'dataset': item.dataset_name+'-'+item.dataset_org_name,
        'created_date':new Date().toISOString()
        // Add any other necessary fields here
      };
      
    logger.info(`Saving Request from model_name: ${item.model_name} and org_name: ${item.model_org_name} for the dataset_name: ${item.dataset_name} and org_name: ${item.dataset_org_name}`);

      // Iterate over the keys of the item to add them to the newItem object
      for (const key in item) {
          newItem[key] = item[key];
        
      }

      const params = {
        TableName: modelToDatsetReqTable,
        Item: newItem,
        // ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
        // ExpressionAttributeNames: {
        //   '#pk': 'model', // Replace with your primary key attribute name
        //   '#sk': 'dataset' // Replace with your sort key attribute name (if applicable)
        // }
      };
      
      try {
        const data = await docClient.put(params).promise();
        logger.info(data);
        logger.info(`Successfully Saved Request from model_name: ${item.model_name} and org_name: ${item.model_org_name} for the dataset_name: ${item.dataset_name} and org_name: ${item.dataset_org_name}`);
        res.send(data);
      } catch (error) {
        logger.info(error.message)
        if (error.code === 'ConditionalCheckFailedException') {
          res.status(400).send('Item with the same primary and sort key already exists.');
        } else {
          logger.error(error.message);
          res.status(500).send(error.message);
        }
      }
      
  });

  app.get("/getDatasetRequests/:dataset", async (req, res) => {
    const { dataset } = req.params;
    logger.info("Fetching dataset requests for dataset:", dataset);
    const params = {
      TableName: modelToDatsetReqTable,
      FilterExpression: "#datasetKey = :datasetValue",
      ExpressionAttributeNames: {
        "#datasetKey": "dataset"
      },
      ExpressionAttributeValues: {
        ":datasetValue": dataset
      }
    };
  
    try {
      const data = await docClient.scan(params).promise();
      if (data.Items && data.Items.length > 0) {
        res.json(data.Items);
      } else {
        res.json([]); // Return empty array instead of throwing error
        logger.info('No requests found for the specified dataset:', dataset);
      }
    } catch (error) {
      logger.error('Error retrieving dataset requests:', error.message);
      res.status(500).send('Error retrieving dataset requests.');
    }
  });

app.get("/getDatasetRequestsbyModel/:model", async (req, res) => {
  const { model } = req.params;
  logger.info("Fetching dataset requests by model:",model)
  const params = {
    TableName: modelToDatsetReqTable,
    FilterExpression: "#modelKey = :modelValue and #status = :status",
    ExpressionAttributeNames: {
      "#modelKey": "model",
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":modelValue": model,
      ":status":"pending"
    }
  };

  try {
    const data = await docClient.scan(params).promise();
    if (data.Items.length >= 0) {
      res.json(data.Items);
    } else {
     throw new Error('No requests found for the specified dataset.');
    }
  } catch (error) {
    logger.error(error.message);
    res.status(500).send('Error retrieving dataset requests.');
  }
});


app.post("/updateRequestStatus", async (req, res) => {
  const { model_name, model_org_name, dataset_name, dataset_org_name, status, dataset_size } = req.body;

  const key = {
    'model': model_name + '-' + model_org_name,
    'dataset': dataset_name + '-' + dataset_org_name
  };

  const params = {
    TableName: modelToDatsetReqTable,
    Key: key,
    UpdateExpression: "set #status = :status, #updated_date = :updated_date",
    ExpressionAttributeNames: {
      "#status": "status",
      "#updated_date": "updated_date"
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":updated_date": new Date().toISOString()
    },
    ReturnValues: "ALL_NEW" // Return the entire updated item, not just updated attributes
  };

  try {
    const data = await docClient.update(params).promise();
    logger.info(`Successfully updated status for model: ${model_name}, dataset: ${dataset_name}`);
    res.json(data.Attributes); // Send the full updated item as JSON
  } catch (error) {
    logger.error(`Failed to update status for model: ${model_name}, dataset: ${dataset_name}, Error: ${error.message}`);
    res.status(500).send(error.message);
  }
});

app.delete('/deleteModel/:model_name/:org_name', async (req, res) => {
  const { model_name, org_name } = req.params;

  const params = {
    TableName: modelsTable,
    Key: {
      model_name: model_name,
      org_name: org_name,
    }
  };
  logger.info("Deletion Started",model_name);
  try {
    const result = await docClient.delete(params).promise();
    res.status(200).json({ message: 'Model deleted successfully', result });
    logger.info("Model deletion done model_name :",model_name);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Model', error: error.message });
  }
});

// const visionUpload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'flashbackvisionanalysis',
//     key: function (req, file, cb) {
//       const  folder_name = 'VisionAnalysisData'
//       cb(null, `${folder_name}/${file.originalname}`);
//     }
//   })
// });

const visionUpload = multer({storage: multer.memoryStorage() });
app.post('/vision', visionUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = 'ComparedData/' + Date.now().toString() + '-' + req.file.originalname;
    console.log(imagePath);

    const visionparams = {
      Bucket: 'flashbackvisionanalysis',
      Key: imagePath,         // Include the folder name if needed
      Body: req.file.buffer,  // The file's buffer
      ContentType: req.file.mimetype // Optional: Set the correct MIME type
    };

    await s3.putObject(visionparams).promise();
    
    // Call Rekognition APIs
    const indexFacesParams = {
      Image: {
        S3Object: {
          Bucket: 'flashbackvisionanalysis',
          Name: imagePath
        }
      },
      CollectionId: 'FlashbackBetaCollection',
      DetectionAttributes: ['ALL']
    };
    
    const detectLabelsParams = {
      Image: {
        S3Object: {
          Bucket: 'flashbackvisionanalysis',
          Name: imagePath
        }
      },
      MaxLabels: 25    
    };

    const [indexFacesResponse, detectLabelsResponse] = await Promise.all([
      rekognition.indexFaces(indexFacesParams).promise(),
      rekognition.detectLabels(detectLabelsParams).promise()
    ]);

    // Store results in DynamoDB
    const dynamoParams = {
      TableName: 'VisionAnalysis',
      Item: {
        id: Date.now().toString(),
        imagePath,
        imageurl: `https://flashbackvisionanalysis.s3.amazonaws.com/${imagePath}`,
        indexFaces: indexFacesResponse,
        detectLabels: detectLabelsResponse
      }
    };

    await docClient.put(dynamoParams).promise();

    // Send response back to frontend
    res.json({
      indexFaces: indexFacesResponse,
      detectLabels: detectLabelsResponse
    });
  } catch (error) {
    console.error('Error in /vision endpoint:', error);
    res.status(500).json({ error: 'An error occurred during processing', details: error.message });
  }
});

app.delete('/deleteDataset/:dataset_name/:org_name', async (req, res) => {
  const { dataset_name, org_name } = req.params;

  const params = {
    TableName: datasetTable,
    Key: {
      dataset_name: dataset_name,
      org_name: org_name,
    }
  };
  logger.info("Deletion Started");
  try {
    const result = await docClient.delete(params).promise();
    res.status(200).json({ message: 'Dataset deleted successfully', result });
    logger.info("Dataset deletion done :",dataset_name);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Dataset', error: error.message });
  }
});

app.post('/mergeUsers', async (req, res) => {
  logger.info('Received payload:', JSON.stringify(req.body, null, 2));
  const { userIds, reason, eventId, user_phone_number } = req.body;

  if (!Array.isArray(userIds) || userIds.length !== 2) {
    return res.status(400).json({ success: false, message: 'Exactly two user IDs are required.' });
  }
  try {
    // Determine the main user (the one with more records)

    const userCounts = await Promise.all(userIds.map(async (userId) => {
      const count = await getUserRecordCount(userId);
      logger.info(`User ${userId} has ${count} records`);
      return { userId: String(userId), count };
    }));

    userCounts.sort((a, b) => b.count - a.count);
    const [mainUser, duplicateUser] = userCounts;

    logger.info(`Attempting to merge user: ${duplicateUser.userId} into user: ${mainUser.userId}`);

    // Perform the merge
    const mergeResult = await mergeUsers(duplicateUser.userId, mainUser.userId, reason, eventId, user_phone_number);

    if (mergeResult.success) {
      res.json({ success: true, message: mergeResult.message });
    } else {
      res.json({ success: false, message: mergeResult.message });
    }
  } catch (error) {
    logger.error('Error in merge users API:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

async function getUserRecordCount(userId) {
  let totalCount = 0;
  let lastEvaluatedKey = null;

  const sanitizedUserId = String(userId).trim();
  logger.info('Sanitized userId:', sanitizedUserId);

  do {
    const params = {
      TableName: 'indexed_data',
      IndexName: 'user_id-index',
      KeyConditionExpression: 'user_id = :userid',
      ExpressionAttributeValues: { ':userid': { S: sanitizedUserId } },
      Select: 'COUNT'
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    try {
      const response = await dynamoDB.query(params).promise();
      totalCount += response.Count;
      lastEvaluatedKey = response.LastEvaluatedKey;
    } catch (error) {
      logger.error(`Error querying user record count for user ${userId}:`, error);
      throw error;
    }
  } while (lastEvaluatedKey);

  return totalCount;
}

async function mergeUsers(fromUserId, toUserId, reason, eventId, user_phone_number) {
  logger.info(`Merging user ${fromUserId} into ${toUserId}`);
  try {
    // Step 1: Compare faces
    const similarityThreshold = reason === 'very_similar' ? 99 : 95;
    
    const comparisonResult = await rekognition.compareFaces({
      SourceImage: {
        S3Object: {
          Bucket: 'rekognitionuserfaces',
          Name: `thumbnails/${fromUserId}.jpg`
        }
      },
      TargetImage: {
        S3Object: {
          Bucket: 'rekognitionuserfaces',
          Name: `thumbnails/${toUserId}.jpg`
        }
      },
      SimilarityThreshold: similarityThreshold
    }).promise();

    if (!comparisonResult.FaceMatches || comparisonResult.FaceMatches.length === 0) {
      return { 
        success: false, 
        message: "We can see that these faces doesn't match"
      };
    }

    const highestSimilarity = Math.max(...comparisonResult.FaceMatches.map(match => match.Similarity));

    if (highestSimilarity < similarityThreshold) {
      return { 
        success: false, 
        message: "We can see that these faces doesn't match"
      };
    }

    logger.info(`Face similarity: ${highestSimilarity.toFixed(2)}%`);

    // Step 2: Core merge operations
    try {
      await disassociateFaces(fromUserId);
      await transferRecordsAndAssociateFaces(fromUserId, toUserId);
      
      // Step 3: Additional operations - don't let these fail the merge
      try {
        await Promise.allSettled([
          updateUserImageActivity(fromUserId, toUserId),
          updateUserOutputs(fromUserId, toUserId),
          updateRekognitionImageProperties(fromUserId, toUserId),
          updateUsersTable(fromUserId, toUserId),
          updateUserEventMapping(fromUserId, toUserId),
          deleteUser(fromUserId),
          logMergeActivity(fromUserId, toUserId, reason, eventId, highestSimilarity, user_phone_number)
        ]);
      } catch (cleanupError) {
        logger.error(`Non-critical error during cleanup: ${cleanupError}`);
        // Don't fail the merge for cleanup errors
      }

      logger.info(`Successfully merged user ${fromUserId} into ${toUserId}`);
      return { success: true, message: "Users merged successfully." };
      
    } catch (coreError) {
      logger.error(`Critical error during core merge operations: ${coreError}`);
      throw coreError;
    }
    
  } catch (e) {
    logger.error(`Error merging users: ${e}`);
    return { success: false, message: "An error occurred while merging users." };
  }
}

async function logMergeActivity(fromUserId, toUserId, reason, eventId, similarity, user_phone_number) {
  const params = {
      TableName: 'DuplicateUserMergeLogger',
      Item: {
          Merge_id: { S: `${fromUserId}-${toUserId}-${Date.now()}` },
          event_id: { S: eventId },
          merge_executor: { S: user_phone_number },
          timestamp: { S: new Date().toISOString() },
          source_user: { S: fromUserId },
          source_user_s3_url: { S: `https://rekognitionuserfaces.s3.amazonaws.com/thumbnails/${fromUserId}.jpg` },
          target_user: { S: toUserId },
          target_user_s3_url: { S: `https://rekognitionuserfaces.s3.amazonaws.com/thumbnails/${toUserId}.jpg` },
          reason: { S: reason },
          similarity: { N: similarity.toString() }
      }
  };

  try {
      await dynamoDB.putItem(params).promise();
      logger.info('Merge activity logged successfully');
  } catch (error) {
      logger.error('Error logging merge activity:', error);
      // Don't throw here, as we want to continue with the merge process even if logging fails
  }
}


async function disassociateFaces(userId) {
  logger.info(`Disassociating faces for user ${userId}`);
  try {
      const faceIds = [];
      let lastEvaluatedKey = null;

      do {
          const queryParams = {
              TableName: 'indexed_data',
              IndexName: 'user_id-index',
              KeyConditionExpression: 'user_id = :uid',
              ExpressionAttributeValues: {':uid': {S: userId}},
              ProjectionExpression: 'face_id',
              ExclusiveStartKey: lastEvaluatedKey
          };

          const response = await dynamoDB.query(queryParams).promise();

          response.Items.forEach(item => faceIds.push(item.face_id.S));

          lastEvaluatedKey = response.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      if (faceIds.length > 0) {
          // Disassociate faces in batches of 100 (Rekognition API limit)
          for (let i = 0; i < faceIds.length; i += 100) {
              const batch = faceIds.slice(i, i + 100);
              await rekognition.disassociateFaces({
                  CollectionId: COLLECTION_ID,
                  UserId: userId,
                  FaceIds: batch
              }).promise();
          }
      }

      logger.info(`Disassociated ${faceIds.length} faces for user ${userId}`);
  } catch (e) {
      logger.error(`Error disassociating faces: ${e}`);
  }
}


async function transferRecordsAndAssociateFaces(fromUserId, toUserId) {
  logger.info(`Transferring records from user ${fromUserId} to ${toUserId}`);
  try {
      const toUserFaceCount = await getUserFaceCount(toUserId);
      logger.info(`No. of faces for the Main User: ${toUserId} are ${toUserFaceCount}`);
      const faceIdsToAssociate = [];
      let recordsTransferred = 0;
      let lastEvaluatedKey = null;

      do {
          const queryParams = {
              TableName: 'indexed_data',
              IndexName: 'user_id-index',
              KeyConditionExpression: 'user_id = :uid',
              ExpressionAttributeValues: {':uid': {S: fromUserId}},
              ExclusiveStartKey: lastEvaluatedKey
          };

          const response = await dynamoDB.query(queryParams).promise();

          for (const item of response.Items) {
              const newItem = {...item, user_id: {S: toUserId}};

              // Put new item
              await dynamoDB.putItem({TableName: 'indexed_data', Item: newItem}).promise();

              // Delete old item
              await dynamoDB.deleteItem({
                  TableName: 'indexed_data',
                  Key: {
                      image_id: item.image_id,
                      user_id: {S: fromUserId}
                  }
              }).promise();

              recordsTransferred++;

              if (toUserFaceCount + faceIdsToAssociate.length < 99) {
                  faceIdsToAssociate.push(item.face_id.S);
              }
          }

          lastEvaluatedKey = response.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      logger.info(`Transferred ${recordsTransferred} records from ${fromUserId} to ${toUserId}`);
      logger.info(`Collected ${faceIdsToAssociate.length} face IDs to associate`);

      if (faceIdsToAssociate.length > 0) {
          try {
              await rekognition.associateFaces({
                  CollectionId: COLLECTION_ID,
                  UserId: toUserId,
                  FaceIds: faceIdsToAssociate
              }).promise();
              logger.info(`Associated ${faceIdsToAssociate.length} faces to user ${toUserId}`);
          } catch (e) {
              if (e.code === 'ServiceQuotaExceededException') {
                  logger.warning(`Reached maximum face association limit for user ${toUserId}. Some faces were not associated.`);
              } else {
                  throw e;
              }
          }
      } else {
          logger.info(`No faces associated to user ${toUserId} as the limit was reached`);
      }
  } catch (e) {
      logger.error(`Error transferring records and associating faces: ${e}`);
  }
}

async function getUserFaceCount(userId) {
  try {
      const params = {
          TableName: 'indexed_data',
          IndexName: 'user_id-index',
          KeyConditionExpression: 'user_id = :uid',
          Select: 'COUNT',
          ExpressionAttributeValues: { ':uid': { S: userId } }
      };

      const response = await dynamoDB.query(params).promise();
      return response.Count;
  } catch (e) {
      logger.error(`Error getting user face count from DynamoDB: ${e}`);
      return 0;
  }
}

async function deleteUser(userId) {
  logger.info(`Deleting user ${userId}`);
  try {
      await rekognition.deleteUser({
          CollectionId: COLLECTION_ID,
          UserId: userId
      }).promise();
      logger.info(`Successfully deleted user ${userId} from Rekognition`);
  } catch (e) {
      logger.error(`Error deleting user from Rekognition: ${e}`);
  }
}

async function updateUserOutputs(userId, primaryUserId) {
  logger.info(`Updating user outputs from ${userId} to ${primaryUserId}`);
  let lastEvaluatedKey = null;

  do {
      const queryParams = {
          TableName: 'user_outputs',
          KeyConditionExpression: 'unique_uid = :userid',
          ExpressionAttributeValues: { ':userid': {S: userId } },
          ExclusiveStartKey: lastEvaluatedKey
      };

      const response = await dynamoDB.query(queryParams).promise();

      for (const item of response.Items) {
          const newItem = { ...item, unique_uid: primaryUserId };

          await dynamoDB.putItem({
              TableName: 'user_outputs',
              Item: newItem
          }).promise();

          await dynamoDB.delete({
              TableName: 'user_outputs',
              Key: {
                  unique_uid: userId,
                  s3_url: item.s3_url
              }
          }).promise();

          logger.info(`Updated user: ${userId} to primary user: ${primaryUserId} in user_outputs table for s3_url: ${item.s3_url}`);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  lastEvaluatedKey = null;

  do {
      const queryParams = {
          TableName: 'user_outputs',
          IndexName: 'unique_uid-event_name-index',
          KeyConditionExpression: 'unique_uid = :userid',
          ExpressionAttributeValues: { ':userid': {S: userId } },
          ExclusiveStartKey: lastEvaluatedKey
      };

      const response = await dynamoDB.query(queryParams).promise();

      for (const item of response.Items) {
          await dynamoDB.update({
              TableName: 'user_outputs',
              Key: {
                  unique_uid: item.unique_uid,
                  s3_url: item.s3_url
              },
              UpdateExpression: 'SET unique_uid = :primary_uid',
              ExpressionAttributeValues: { ':primary_uid': {S: primaryUserId } }
          }).promise();

          logger.info(`Updated user: ${userId} to primary user: ${primaryUserId} in user_outputs table (unique_uid-event_name-index) for event: ${item.event_name || 'Unknown'}`);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);
}

async function updateRekognitionImageProperties(userId, primaryUserId) {
  logger.info(`Updating Rekognition image properties for user ${userId} to ${primaryUserId}`);
  let lastEvaluatedKey = null;

  try {
    do {
      const scanParams = {
        TableName: 'RekognitionImageProperties',
        FilterExpression: 'contains(user_ids, :userid)',
        ExpressionAttributeValues: { ':userid': {S: userId} },
        ExclusiveStartKey: lastEvaluatedKey
      };

      const response = await dynamoDB.scan(scanParams).promise();

      for (const item of response.Items) {
        if (item.user_ids && item.user_ids.S) { // Check if user_ids exists and has S property
          let userIdsArray = [];
          try {
            // Handle both string and array formats
            userIdsArray = typeof item.user_ids.S === 'string' 
              ? item.user_ids.S.split(',') 
              : Array.isArray(item.user_ids.S) 
                ? item.user_ids.S 
                : [item.user_ids.S];

            // Replace old userId with primaryUserId
            const newUserIds = [...new Set(userIdsArray.map(uid => 
              uid.trim() === userId ? primaryUserId : uid
            ))];

            await dynamoDB.update({
              TableName: 'RekognitionImageProperties',
              Key: { image_id: item.image_id },
              UpdateExpression: 'SET user_ids = :new_user_ids',
              ExpressionAttributeValues: { 
                ':new_user_ids': { S: newUserIds.join(',') }
              }
            }).promise();

            logger.info(`Updated user_ids from ${userId} to ${primaryUserId} for image_id ${item.image_id}`);
          } catch (err) {
            logger.error(`Error processing user_ids for image_id ${item.image_id}: ${err}`);
            // Continue with next item instead of failing entire operation
            continue;
          }
        }
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return true; // Indicate successful completion
  } catch (error) {
    logger.error(`Error updating Rekognition image properties: ${error}`);
    // Don't throw error, just log it and continue
    return false;
  }
}

async function updateUsersTable(userId, primaryUserId) {
  logger.info(`Updating users table from ${userId} to ${primaryUserId}`);
  let lastEvaluatedKey = null;

  do {
      const queryParams = {
          TableName: 'users',
          IndexName: 'user_id-index',
          KeyConditionExpression: 'user_id = :userid',
          ExpressionAttributeValues: { ':userid': {S: userId } },
          ExclusiveStartKey: lastEvaluatedKey
      };

      const response = await dynamoDB.query(queryParams).promise();

      for (const item of response.Items) {
          const updateParams = {
              TableName: 'users',
              Key: { user_phone_number: item.user_phone_number },
              UpdateExpression: 'SET user_id = :primary_uid',
              ExpressionAttributeValues: { ':primary_uid':  {S: primaryUserId } }
          };

          await dynamoDB.update(updateParams).promise();

          logger.info(`Updated user_id from ${userId} to ${primaryUserId} for user_phone_number ${item.user_phone_number}`);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);
}

async function updateUserEventMapping(userId, primaryUserId) {
  logger.info(`Updating user_event_mapping table from ${userId} to ${primaryUserId}`);
  let lastEvaluatedKey = null;

  do {
      const queryParams = {
          TableName: 'user_event_mapping',
          IndexName: 'user_id-index',
          KeyConditionExpression: 'user_id = :userid',
          ExpressionAttributeValues: { ':userid': {S: userId } },
          ExclusiveStartKey: lastEvaluatedKey
      };

      const response = await dynamoDB.query(queryParams).promise();

      for (const item of response.Items) {
          const updateParams = {
              TableName: 'user_event_mapping',
              Key: {
                  event_name: item.event_name,
                  user_phone_number: item.user_phone_number
              },
              UpdateExpression: 'SET user_id = :primary_uid',
              ExpressionAttributeValues: { ':primary_uid': {S: primaryUserId } }
          };

          await dynamoDB.update(updateParams).promise();

          logger.info(`Updated user_id from ${userId} to ${primaryUserId} for event ${item.event_name} and user_phone_number ${item.user_phone_number}`);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);
}

async function updateUserImageActivity(fromUserId, toUserId) {
  logger.info(`Updating user_image_activity table for user ${fromUserId} to ${toUserId}`);
  try {
      let lastEvaluatedKey = null;

      do {
          const queryParams = {
              TableName: 'user_image_activity',
              KeyConditionExpression: 'user_id = :userid',
              ExpressionAttributeValues: {
                  ':userid': { S: fromUserId }
              },
              ExclusiveStartKey: lastEvaluatedKey
          };

          const response = await dynamoDB.query(queryParams).promise();

          for (const item of response.Items) {
              // Create a new item with the new user_id
              const newItem = { ...item, user_id: { S: toUserId } };

              // Put the new item
              await dynamoDB.putItem({
                  TableName: 'user_image_activity',
                  Item: newItem
              }).promise();

              // Delete the old item
              await dynamoDB.deleteItem({
                  TableName: 'user_image_activity',
                  Key: {
                      user_id: { S: fromUserId },
                      activity_timestamp: item.activity_timestamp
                  }
              }).promise();
          }

          lastEvaluatedKey = response.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      logger.info(`Updated user_image_activity table for user ${fromUserId} to ${toUserId}`);
  } catch (error) {
      logger.error(`Error updating user_image_activity table: ${error}`);
  }
}



// Fetch all records from DynamoDB
const fetchAllRecords = async () => {
  let params = {
    TableName: userImageActivityTableName
  };

  let items = [];
  let data;

  logger.info("Starting scan operation to fetch all records from DynamoDB...");

  do {
    data = await docClient.scan(params).promise();
    items = items.concat(data.Items);

    logger.info(`Fetched ${data.Items.length} records in this scan operation.`);
    params.ExclusiveStartKey = data.LastEvaluatedKey;
  } while (typeof data.LastEvaluatedKey !== "undefined");

  logger.info(`Completed fetching all records. Total records: ${items.length}`);
  return items;
};

// Update record with folder_name
const updateRecordWithFolderName = async (userId, imageUrl, folderName) => {
  const params = {
    TableName: userImageActivityTableName,
    Key: {
      user_id: userId,
      s3_url: imageUrl
    },
    UpdateExpression: "set folder_name = :folderName",
    ExpressionAttributeValues: {
      ":folderName": folderName
    },
    ReturnValues: "UPDATED_NEW"
  };

  logger.info(`Updating record for user_id: ${userId} with folder_name: ${folderName}`);

  try {
    const result = await docClient.update(params).promise();
    logger.info(`Successfully updated record for user_id: ${userId}`);
    return result;
  } catch (error) {
    logger.error(`Error updating record for user_id: ${userId}. Error: ${error.message}`);
    throw error;
  }
};

// API to backfill folder_name for all records
app.post('/backfillFolderNames', async (req, res) => {
  try {
    logger.info("Starting backfilling process for folder_name...");

    const allRecords = await fetchAllRecords();
    logger.info(`Total records fetched: ${allRecords.length}`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Iterate through all records and update each with folder_name
    for (let record of allRecords) {
      const { user_id, s3_url } = record;
      if (s3_url) {
        try {
          const folderName = extractFolderName(s3_url);
          await updateRecordWithFolderName(user_id, s3_url, folderName);
          updatedCount++;
        } catch (error) {
          logger.error(`Failed to update record for user_id: ${user_id}. Error: ${error.message}`);
        }
      } else {
        logger.warn(`Skipped record for user_id: ${user_id} due to missing s3_url`);
        skippedCount++;
      }
    }

    logger.info(`Backfilling process completed. Total updated records: ${updatedCount}. Skipped records: ${skippedCount}`);
    res.status(200).send(`Backfilled folder_name for ${updatedCount} records. Skipped ${skippedCount} records.`);
  } catch (err) {
    logger.error("Error occurred during backfilling:", err);
    res.status(500).send('Error occurred during backfilling folder_name');
  }
});

app.post('/transfer-chewy-coins-by-wallet-address', async (req, res) => {
  try {
      const { amount, senderMobileNumber,recipientAddress} = req.body;

      // Log incoming request
      logger.info(`Transfer request received: amount = ${amount}`);

      // Read sender's private key and recipient address from config
        
      //const recipientAddress = aptosConfig.RECIPIENT_ADDRESS;
      const transferAmount = amount ;  // Use provided amount or default
      //const recipientWalletDetails = await fetchWalletDetails(recipientMobileNumber)

      // const status = await transferAptosCoins(recipientAddress, transferAmount);
      const status = await transferCoins(recipientAddress, transferAmount,senderMobileNumber, '');

      res.status(200).json({
          message: 'Chewy Coin transfer successful',
          status: status
      });
  } catch (error) {
      logger.error(`Transfer failed: ${error}`);
      res.status(500).json({ error: 'Chewy Coin transfer failed', details: error.message });
  }
});

app.post('/transfer-chewy-coins', async (req, res) => {
  try {
      const { amount, senderMobileNumber,recipientMobileNumber} = req.body;

      // Log incoming request
      logger.info(`Transfer request received: amount = ${amount}`);

      // Read sender's private key and recipient address from config
        
      //const recipientAddress = aptosConfig.RECIPIENT_ADDRESS;
      const transferAmount = amount ;  // Use provided amount or default
      const recipientWalletDetails = await fetchWalletDetails(recipientMobileNumber)

      // const status = await transferAptosCoins(recipientAddress, transferAmount);
      const status = await transferCoins(recipientWalletDetails.wallet_address, transferAmount,senderMobileNumber, recipientMobileNumber);

      res.status(200).json({
          message: 'Chewy Coin transfer successful',
          status: status
      });
  } catch (error) {
      logger.error(`Transfer failed: ${error}`);
      res.status(500).json({ error: 'Chewy Coin transfer failed', details: error.message });
  }
});




app.post('/transfer-aptos-coins', async (req, res) => {
  try {
     // const { amount, recipientAddress, mobileNumber } = req.body;
     const { amount, senderMobileNumber,recipientMobileNumber} = req.body;
      // Log incoming request
      logger.info(`Transfer request received: amount = ${amount}`);
      const recipientWalletDetails = await fetchWalletDetails(recipientMobileNumber)
      // Read sender's private key and recipient address from config
        
      //const recipientAddress = aptosConfig.RECIPIENT_ADDRESS;
      const transferAmount = amount ;  // Use provided amount or default

      // const status = await transferAptosCoins(recipientAddress, transferAmount);
      const status = await transferAptosCoins(recipientWalletDetails.wallet_address, transferAmount,senderMobileNumber,recipientMobileNumber);

      res.status(200).json({
          message: 'Chewy Coin transfer successful',
          status: status
      });
  } catch (error) {
      logger.error(`Transfer failed: ${error}`);
      res.status(500).json({ error: 'Chewy Coin transfer failed', details: error.message });
  }
});

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Encryption function for private keys (for secure storage)
const encrypt = (text, secret) => {
  const iv = crypto.randomBytes(16);  // Generate a random initialization vector
  
  // Hash the secret to ensure it's 32 bytes (256 bits)
  const key = crypto.createHash('sha256').update(secret).digest('base64').substr(0, 32);

  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
};


// Function to update wallet transaction in DynamoDB
async function updateWalletTransaction(transactionId, senderMobileNumber,recipientMobileNumber, fromAddress, toAddress, amount, transactionStatus, coinType) {
  const params = {
    TableName: walletTransactions,  // DynamoDB table name
    Item: {
      transaction_id: transactionId,  // Primary key: transaction ID provided by the SDK
      from_mobile_number: senderMobileNumber,
      to_mobile_number:recipientMobileNumber,
      from_address: fromAddress,      // From address (sender's wallet address)
      to_address: toAddress,          // To address (receiver's wallet address)
      amount: amount,                 // Amount of coins transferred
      coin_type: coinType,            // Type of coin being transferred (e.g., Aptos, ChewyCoin)
      status: transactionStatus,      // Status of the transaction (e.g., COMPLETED, FAILED)
      transaction_date: new Date().toISOString()  // Storing the transaction date
    }
  };

  try {
    // Insert the transaction details into the DynamoDB table
    await docClient.put(params).promise();
    logger.info(`Transaction with ID ${transactionId} successfully logged in wallet_transactions table`);
    return true;
  } catch (error) {
    logger.error(`Error updating transaction with ID ${transactionId}: ${error.message}`);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }
}
async function fetchTransactionForUserPhoneNumber(userPhoneNumber) {
  try {
    const params = {
      TableName: walletTransactions,
      FilterExpression: '(from_mobile_number = :phone OR to_mobile_number = :phone) AND coin_type = :coinType',
      ExpressionAttributeValues: {
        ':phone': userPhoneNumber,
        ':coinType': 'Chewy', // Assuming 'Chewy' is a fixed coin type
      },
    };

    let items = [];
    let lastEvaluatedKey = null;

    // Fetching paginated data
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const data = await docClient.scan(params).promise();
      items = items.concat(data.Items);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    logger.info("Total number of transactions fetched: " + items.length); // Correcting size to length for array
    return items;
    
  } catch (error) {
    logger.error('Error fetching transactions: ', error);
    throw error; // Rethrow error to be caught in the route handler
  }
}

// Route handler to fetch transactions by user phone number
app.get('/transactionsByUserPhoneNumber/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;

  if (!userPhoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const allTransactions = await fetchTransactionForUserPhoneNumber(userPhoneNumber);
    res.status(200).json(allTransactions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


app.get('/transactionsByUserPhoneNumber/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;

  if (!userPhoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    // Fetch all transactions by phone number with pagination
    const allTransactions = await fetchTransactionForUserPhoneNumber(userPhoneNumber);
    res.status(200).send(allTransactions);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


/** Register the receiver account to receive transfers for Chewy Coin, paid by feePayer. */
async function registerCoinStore(account) {
  try {
    // const privateKeyHex = feePayer.encrypted_private_key.startsWith('0X')
    // ? feePayer.encrypted_private_key.slice(2) // Remove the '0x' prefix
    // : feePayer.encrypted_private_key;
  
    // // Derive an account with a private key and account address
    // const privateKey = new Ed25519PrivateKey(privateKeyHex);
    // const address = AccountAddress.from(feePayer.wallet_address);
    // const feePayerAccount = Account.fromPrivateKey({ privateKey, address });
    const feePayerAccount =  await getAccountInfo(config.aptosConfig.senderMobileNumber)
    // Build the transaction for registering the CoinStore
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.accountAddress,  // Primary account (Receiver in your case)
      withFeePayer: true,
      data: {
        function: "0x1::managed_coin::register",  // Managed coin register function
        typeArguments: ["0x7cc1f48fc513e64cf759190a8425591a2949394af8139e98d96e861d4973aa9e::coin_factory::Emojicoin"],  // Chewy coin type
        functionArguments: [],  // No arguments needed for registration
      },
    });

    // Simulate the transaction with both signer (receiver) and fee payer
    const [simulationResult] = await aptosClient.transaction.simulate.simple({
      signerPublicKey: account.publicKey,
      feePayerPublicKey: feePayerAccount.publicKey, // Fee payer as secondary signer
      transaction,
    });
    logger.info("Transaction simulation result: ", simulationResult);

    // Sign the transaction with both the receiver and fee payer accounts
    const senderAuthenticator = aptosClient.transaction.sign({ signer: account, transaction });
    const feePayerAuthenticator = aptosClient.transaction.signAsFeePayer({
      signer: feePayerAccount,
      transaction
  })

    // Submit the multi-agent transaction to the blockchain
    const pendingTxn = await aptosClient.transaction.submit.simple({
      transaction,
      senderAuthenticator:senderAuthenticator,
      feePayerAuthenticator: feePayerAuthenticator, // Include fee payer's authenticator
    });

    logger.info(`Transaction submitted. Hash: ${pendingTxn.hash}`);

    // Wait for the transaction to be confirmed
    const transRes = await aptosClient.waitForTransaction({ transactionHash: pendingTxn.hash });
    logger.info(`Transaction confirmed. Hash: ${pendingTxn.hash}`);
    logger.info('User Registration Status : '+transRes);

    return pendingTxn.hash;
  } catch (error) {
    console.error(`Error registering Chewy Coin with fee payer: ${error.message}`);
    return new Error(error.message);
  }
}

// Function to fund the account
const transferAptosCoins = async ( recipientAddress, amount, senderMobileNumber,recipientMobileNumber) => {
  try {
    // to derive an account with a private key and account address
    const senderWalletDetails = await fetchWalletDetails(senderMobileNumber);
    const privateKeyHex = senderWalletDetails.encrypted_private_key.startsWith('0X')
    ? senderWalletDetails.encrypted_private_key.slice(2) // Remove the '0x' prefix
    : senderWalletDetails.encrypted_private_key;
  
    // Derive an account with a private key and account address
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const address = AccountAddress.from(senderWalletDetails.wallet_address);
    const senderAccount = Account.fromPrivateKey({ privateKey, address });

    // Generate and sign the transaction
    //Generate
    const transaction = await aptosClient.transaction.build.simple({
      sender: senderAccount.accountAddress,
      data: {
        // All transactions on Aptos are implemented via smart contracts.
        type: 'entry_function_payload',
        function: "0x1::aptos_account::transfer",
       functionArguments: [recipientAddress, amount],
      },
    });

    //Sign
    const senderAuthenticator = aptosClient.transaction.sign({
      signer: senderAccount,
      transaction,
    });

    logger.info("Transaction generated and Signed Successfully");
    // If the fee looks ok, continue to signing!

    // Submit the transaction    
    const committedTransaction = await aptosClient.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });
    logger.info(`Transaction submitted: ${committedTransaction.hash}`);

    // Wait for confirmation
    const executedTransaction = await aptosClient.waitForTransaction({ transactionHash: committedTransaction.hash });
    logger.info(`Transaction confirmed: ${executedTransaction.success}`);
    
    await updateWalletTransaction(
      executedTransaction.hash, 
      senderMobileNumber,
      recipientMobileNumber, 
      senderWalletDetails.wallet_address,         // Sender's wallet address (from_address)
      recipientAddress,      // Receiver's wallet address (to_address)
      amount, 
      executedTransaction.success, 
      "Aptos"                           // Type of coin being transferred
    );
    return executedTransaction.success;
    
  } catch (error) {
    logger.error(`Error funding account: ${error.message}`);
    throw new Error(error.message);
  }
};

const transferCoins = async (recipientAddress, amount, senderMobileNumber, recipientMobileNumber) => {
  try {
    
    const senderAccount = await getAccountInfo(senderMobileNumber);
    const parentAccount = await getAccountInfo(config.aptosConfig.senderMobileNumber);

    // Generate and sign the transaction
    const transaction = await aptosClient.transaction.build.simple({
      sender: senderAccount.accountAddress,
      withFeePayer:true,
      data: {
        type: 'entry_function_payload',
        function: '0x1::aptos_account::transfer_coins',
        typeArguments: ['0x7cc1f48fc513e64cf759190a8425591a2949394af8139e98d96e861d4973aa9e::coin_factory::Emojicoin'],  // Chewy Coin type
        functionArguments: [recipientAddress, amount],
      },
    });

    // Sign the transaction
    const senderAuthenticator = aptosClient.transaction.sign({
      signer: senderAccount,
      transaction,
    });
    const parentAccountAuthenticator = aptosClient.transaction.signAsFeePayer({
      signer: parentAccount,
      transaction
    })

    logger.info("Transaction generated and Signed Successfully");
    const [userTransactionResponse] = await aptosClient.transaction.simulate.simple({
      signerPublicKey: senderAccount.publicKey,
      feePayerPublicKey: parentAccount.publicKey,
      transaction,
  });
  logger.info(userTransactionResponse.max_gas_amount)

    // Submit the transaction    
    const committedTransaction = await aptosClient.transaction.submit.simple({
      transaction,
      senderAuthenticator : senderAuthenticator,
      feePayerAuthenticator : parentAccountAuthenticator,
    });
    logger.info(`Transaction submitted: ${committedTransaction.hash}`);

    // Wait for confirmation
    const executedTransaction = await aptosClient.waitForTransaction({ transactionHash: committedTransaction.hash });
    logger.info(`Transaction confirmed: ${executedTransaction.success}`);

    // Update the wallet transaction details
    await updateWalletTransaction(
      executedTransaction.hash,
      senderMobileNumber,
      recipientMobileNumber,
      senderAccount.accountAddress.toString('hex'), // Sender's wallet address (from_address)
      recipientAddress, // Receiver's wallet address (to_address)
      amount,
      executedTransaction.success,
      "Chewy" // Type of coin being transferred
    );

    // If the transaction is successful, update reward points for sender and receiver
    // if (executedTransaction.success) {
    //   await updateRewards(senderMobileNumber, recipientMobileNumber, amount);
    // }

    return executedTransaction.success;

  } catch (error) {
    console.error(`Error transferring Chewy coins: ${error.message}`);
    throw new Error(error.message);
  }
};


const getAccountInfo = async(mobileNumber)=>{
  try{

    // Fetch wallet details for the sender
    const walletDetails = await fetchWalletDetails(mobileNumber);
    const privateKeyHex = walletDetails.encrypted_private_key.startsWith('0X')
  ? walletDetails.encrypted_private_key.slice(2) // Remove the '0x' prefix
  : walletDetails.encrypted_private_key;

    // Derive an account with a private key and account address
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const address = AccountAddress.from(walletDetails.wallet_address);
    const account = Account.fromPrivateKey({ privateKey, address });
    return account;
  }
  catch(err){
    return new Error(err.message);
  }
}

app.post("/updateRewards", async (req, res) => {
  const { senderMobileNumber, amount } = req.body;
  try {
    logger.info("Updating balance for user: ", senderMobileNumber);
    const result = await updateRewards(senderMobileNumber, amount);
    if (result) {
      res.send("Successfully updated balance");
    } else {
      throw new Error("Error in updating rewards");
    }
  } catch (err) {
    res.status(500).send('Error in updating rewards');
  }
});

const updateRewards = async (senderMobileNumber, amount) => {
  try {
    // Fetch sender user details
    const senderUserDetails = await getUserObjectByUserPhoneNumber(senderMobileNumber);

    // Calculate new reward points by adding the amount (which can be positive or negative)
    const updatedSenderRewardPoints = senderUserDetails.reward_points
      ? Number(senderUserDetails.reward_points) + Number(amount)
      : Math.max(0, Number(amount));


    // Ensure reward points do not go below 0
    const finalRewardPoints = Math.max(updatedSenderRewardPoints, 0);

    // Prepare the update payload for the sender
    const updateSenderData = {
      reward_points: finalRewardPoints,
    };

    // Update the sender reward points
    await updateUserDetails(senderMobileNumber, updateSenderData);

    logger.info("Sender reward points updated successfully");
    return true;
  } catch (error) {
    console.error(`Error updating rewards: ${error.message}`);
    throw new Error("Failed to update reward points");
  }
};

// Function to check if wallet exists in DynamoDB
const checkWalletExists = async (mobileNumber) => {
  const params = {
    TableName: 'wallet_details',
    Key: {
      user_phone_number: mobileNumber
    }
  };

  try {
    const result = await docClient.get(params).promise();  // Use docClient
    return result.Item ? result.Item : null;
  } catch (error) {
    logger.error(`Error checking wallet for mobile number: ${mobileNumber}: ${error.message}`);
    throw error;
  }
};

// Function to store wallet info in DynamoDB
const storeWalletInDynamoDB = async (mobileNumber, walletDetails) => {
  const params = {
    TableName: walletDetailsTable,
    Item: {
      user_phone_number: mobileNumber,
      wallet_address: walletDetails.walletAddress,
      public_key: walletDetails.publicKey,
      encrypted_private_key: walletDetails.encryptedPrivateKey,
      balance: walletDetails.balance,
      created_date:new Date().toISOString(),
    }
  };

  try {
    await docClient.put(params).promise();  // Use docClient
    logger.info(`Wallet info stored in DynamoDB for mobile number: ${mobileNumber}`);
  } catch (error) {
    logger.error(`Error storing wallet info in DynamoDB for mobile number: ${mobileNumber}: ${error.message}`);
    throw error;
  }
};

// Define the function to handle wallet creation and transaction
async function handleWalletCreation(mobileNumber) {
  logger.info(`Received request to create wallet for mobile number: ${mobileNumber}`);
  
  try {
    // Check if the wallet already exists for the given mobile number
    const existingWallet = await checkWalletExists(mobileNumber);

    if (existingWallet) {
      // If the wallet exists, return the existing wallet details
      logger.info(`Wallet already exists for mobile number: ${mobileNumber}`);
      return {
        message: 'Wallet already exists',
        walletAddress: existingWallet.wallet_address,
        balance: existingWallet.balance,
        status: 200
      };
    }

    // If no wallet exists, create a new Aptos wallet
    const aptosAccount = Account.generate();
    logger.info("Account created Successfully");

    // Encrypt the private key and prepare wallet details
    const encryptedPrivateKey = aptosAccount.privateKey.signingKey.toString('hex');  // Encryption can be added as per your logic

    const walletDetails = {
      walletAddress: aptosAccount.accountAddress.toString('hex'),  // Hex representation of the wallet address
      publicKey: aptosAccount.publicKey.key.toString('hex'),  // Hex representation of the public key
      balance: CHEWY_AMOUNT,
      encryptedPrivateKey,  // The encrypted private key
    };

    // Store the wallet info in DynamoDB
    await storeWalletInDynamoDB(mobileNumber, walletDetails);

    // Log successful wallet creation
    logger.info(`Aptos Wallet created for mobile number: ${mobileNumber} with wallet address: ${walletDetails.walletAddress}`);

    // Transfer Aptos coins to the newly created wallet
   // const transactionStatus = await transferAptosCoins(walletDetails.walletAddress, APTOS_AMOUNT || aptosConfig.DEFAULT_TRANSFER_AMOUNT,aptosConfig.SENDER_MOBILE_NUMBER, mobileNumber);

    // if (transactionStatus !== true) {
    //   throw new Error("Transaction failed");
    // }

    //const parentWallet = await fetchWalletDetails(aptosConfig.SENDER_MOBILE_NUMBER);
    // Register the wallet with ChewyCoin store and transfer coins
    await registerCoinStore(aptosAccount);
    await transferCoins(walletDetails.walletAddress, CHEWY_AMOUNT, config.aptosConfig.senderMobileNumber, mobileNumber);
    await updateUserDetails(mobileNumber,{reward_points:CHEWY_AMOUNT})
    // Return wallet details and transaction status
    return {
      message: 'Aptos Wallet created and coins transferred successfully',
      walletAddress: walletDetails.walletAddress,
      balance: CHEWY_AMOUNT || aptosConfig.DEFAULT_TRANSFER_AMOUNT,
      status: 201
    };
  } catch (error) {
    // Log any error that occurs during the process
    logger.error(`Error creating Aptos wallet for mobile number: ${mobileNumber}: ${error.message}`);
    throw new Error(`Failed to create Aptos wallet: ${error.message}`);
  }
}




// Express route
app.post('/createWallet', async (req, res) => {
  const { mobileNumber } = req.body;  // Accept the mobileNumber from the request

  try {
    const response = await handleWalletCreation(mobileNumber);
    logger.info("Successfully created wallet for mobile number : ",mobileNumber);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Aptos wallet', error: error.message });
  }
});


app.get('/fetchWallet/:mobileNumber', async (req, res) => {
  const { mobileNumber } = req.params; // Accept the mobileNumber from the route parameters

  try {
    logger.info(`Received request to fetch wallet for mobile number: ${mobileNumber}`);
    
    // Call the function to fetch wallet details
    const walletDetails = await fetchWalletDetails(mobileNumber);
    
    // Return the wallet details if found
    res.status(200).json({
      message: 'Wallet found',
      walletDetails,
      status: 200
    });

  } catch (error) {
    // Handle known errors
    if (error.message === "Mobile number is required" || error.message === "Wallet not found") {
      return res.status(400).json({
        message: error.message,
        status: 400
      });
    }

    // Log and handle other errors
    logger.error(`Error in fetching wallet for mobile number ${mobileNumber}: ${error.message}`);
    res.status(500).json({
      message: 'Failed to fetch wallet',
      error: error.message,
      status: 500
    });
  }
});


const fetchWalletDetails = async (mobileNumber) => {
  if (!mobileNumber) {
    throw new Error("Mobile number is required");
  }

  // Define the DynamoDB query parameters
  const params = {
    TableName: walletDetailsTable,
    Key: {
      user_phone_number: mobileNumber
    }
  };

  try {
    logger.info(`Fetching wallet for mobile number: ${mobileNumber}`);

    // Fetch wallet from DynamoDB
    const result = await docClient.get(params).promise();

    logger.info("Fetched wallet for mobile number:", mobileNumber);

    // If no wallet found, throw an error
    if (!result || !result.Item) {
      return;
    }

    // Return the wallet details
    return result.Item;

  } catch (error) {
    // Log the error and rethrow it
    logger.error(`Error fetching wallet for mobile number ${mobileNumber}: ${error.message}`);
    throw error;
  }
};



//Function to get balance using Aptos SDK
const getWalletBalance = async (walletAddress) => {
  try {
    const resources = await aptosClient.getAccountResource({ accountAddress: walletAddress,
      resourceType: "0x1::coin::CoinStore<0x7cc1f48fc513e64cf759190a8425591a2949394af8139e98d96e861d4973aa9e::coin_factory::Emojicoin>"})
      

    // Find the specific CoinStore resource for AptosCoin
    // const aptosCoinResource = resources.find(
    //   (resource) => resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    // );

    if (resources) {
      // Get the coin balance from the resource data
      return resources.coin.value;
    } else {
      return 0; // No balance found
    }
  } catch (error) {
    throw new Error(`Error fetching wallet balance: ${error.message}`);
  }
};

//API endpoint to get wallet details and balance
app.get('/wallet-balance/:phoneNumber', async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    // Get wallet details from DynamoDB
    const walletDetails = await fetchWalletDetails(phoneNumber);
    if(!walletDetails){
      return res.status(200).json({});
    }
    const userDetails = await getUserObjectByUserPhoneNumber(phoneNumber);

    if (!walletDetails) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Get the balance of the wallet
    const balance = await getWalletBalance(walletDetails.wallet_address);

    if(balance!=userDetails.reward_points){
      updateUserDetails(phoneNumber,{reward_points:balance})
    }
    logger.info(`Successfully fetched wallet details for the user: ${phoneNumber}`);
    // Return the wallet details and balance
    res.status(200).json({
      walletAddress: walletDetails.wallet_address,
      balance: balance,
    });
  } catch (error) {
    logger.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Error fetching wallet balance', error: error.message });
  }
});

app.get("/getAccountInfo/:walletAddress", async (req, res) => {
  const walletAddress = req.params.walletAddress;

  try {
    const fund = await aptosClient.getAccountInfo({ accountAddress: walletAddress });
    
    // If account info is found, return success response with status 200
    if (fund) {
      return res.status(200).json({
        message: "Account Details found",
        accountInfo: fund // Optional: you can include the account information in the response
      });
    }
    
  } catch (err) {
    // If account is not found or any error occurs, return a 404 response
    return res.status(404).json({
      message: "No account found with wallet address"
    });
  }
});

app.post("/saveInvitationDetails", async (req, res) => {
  const { user_phone_number, event_id, ...otherDetails } = req.body;

  // Automatically set responded_date using the server's current timestamp
  const responded_date = new Date().toISOString();

  // Build the update expression and attribute values
  let updateExpression = "SET";
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  // Add responded_date explicitly
  updateExpression += " #responded_date = :responded_date,";
  ExpressionAttributeNames["#responded_date"] = "responded_date";
  ExpressionAttributeValues[":responded_date"] = responded_date;

  // Add other details dynamically
  Object.keys(otherDetails).forEach((key, index) => {
    const attributeKey = `#attr${index}`;
    const attributeValue = `:val${index}`;
    updateExpression += ` ${attributeKey} = ${attributeValue},`;
    ExpressionAttributeNames[attributeKey] = key;
    ExpressionAttributeValues[attributeValue] = otherDetails[key];
  });

  // Remove the last comma
  updateExpression = updateExpression.slice(0, -1);

  try {
    const params = {
      TableName: "invitation_details",
      Key: {
        user_phone_number: user_phone_number,
        event_id: event_id,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: ExpressionAttributeNames,
      ExpressionAttributeValues: ExpressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const result = await docClient.update(params).promise();
    logger.info(
      `Invitation has been upserted for: ${user_phone_number} for event: ${event_id}`
    );
    res.send({
      message: "Successfully upserted record",
      data: result.Attributes,
    });
  } catch (err) {
    logger.error("Error upserting invitation details: " + err.message);
    res.status(500).send(err.message);
  }
});


app.get("/getInvitationDetails/:eventId/:userPhoneNumber", async (req, res) => {
  const { eventId, userPhoneNumber} = req.params;
  logger.info(
    `Fetching Invitation details for: ${userPhoneNumber} for event: ${eventId}`
  );
  try {
    const params = {
      TableName: "invitation_details",
      Key: {
        user_phone_number: userPhoneNumber,
        event_id: eventId,
      },
    };

    const result = await docClient.get(params).promise();
    logger.info(
      `Invitation has been fetched for: ${userPhoneNumber} for event: ${eventId}`
    );
    res.send(result.Item);
  } catch (err) {
    logger.error("Error upserting invitation details: " + err.message);
    res.status(500).send(err.message);
  }
});

app.get("/getEventInvitationDetails/:event_id", async (req, res) => {
  const { event_id } = req.params;

  try {
    const params = {
      TableName: "invitation_details",
      KeyConditionExpression: "event_id = :event_id",
      ExpressionAttributeValues: {
        ":event_id": event_id,
      },
    };

    const result = await docClient.query(params).promise();

    if (result.Items.length >= 0) {
      res.send({
        message: "Successfully fetched invitation details",
        data: result.Items,
      });
    } 
  } catch (err) {
    logger.error("Error fetching invitation details: " + err.message);
    res.status(500).send(err.message);
  }
});

(async function() {
  try {
       await rescheduleJobs();
      logger.info('Missed jobs recovered successfully');
  } catch (error) {
      console.error('Error recovering missed jobs:', error);
  }
})();

// API to schedule job with multiple notifications
app.post('/schedule', async (req, res) => {
  const { userPhoneNumber, eventId, orgName } = req.body;

  if (!userPhoneNumber || !eventId ||  !orgName) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const event = await getEventDetailsById(eventId);
      const jobs = await scheduleEventReminder(userPhoneNumber, event, orgName);
      res.status(200).json({ jobs, message: 'Jobs scheduled successfully' });
  } catch (error) {
      console.error('Error scheduling job:', error);
      res.status(500).json({ error: 'Failed to schedule jobs' });
  }
});

function formatDateForScheduling(date) {
  const pad = (n) => (n < 10 ? '0' + n : n);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function scheduleEventReminder(userPhoneNumber, event, portfolioLink) {
  const jobs = [];
  try {
    const now = new Date();
    const eventDateObj = new Date(event.event_date);

    // Check if the event date has already passed
    if (now > eventDateObj) {
      logger.info(`Event ${event.event_id} has already passed, no reminders will be sent.`);
      return jobs; // Skip reminder scheduling if the event has passed
    }

    const notifications = [];

    // Notification 1: One day before at 08:00 AM
    const notification1 = new Date(eventDateObj);
    notification1.setDate(eventDateObj.getDate() - 1); // Set to one day before
    notification1.setHours(2, 30, 0, 0); // Set time to 08:00 AM

    // Notification 2: On the day of the event at 08:00 AM
    const notification2 = new Date(eventDateObj);
    //notification2.setDate(eventDateObj.getDate() - 1);
    notification2.setHours(2, 30, 0, 0); // Set time to 08:00 AM

    // Add both notifications to the array if they are in the future
    if (notification1 > now) {
      notifications.push({'time':notification1,'day':'Tomorrow'}); // One day before reminder
    }
    if (notification2 > now) {
      notifications.push({'time':notification2,'day':'Today'}); // Event day reminder
    }

    for (let notification of notifications) {
      const jobId = uuidv4();
    const formattedDate = formatDateForScheduling(notification.time);
      const jobData = {
        job_id: jobId,
        user_phone_number: userPhoneNumber,
        event_id: event.event_id,
        event_date: event.event_date,
        event_location: event.event_location,
        job_day:notification.day,
        notification_time: formattedDate,
        portfolio_link: portfolioLink,
        status: 'pending',
      };

      // Save job in DynamoDB
      const params = {
        TableName: 'scheduled_jobs',
        Item: jobData,
      };
      await docClient.put(params).promise();

      // Schedule the job
      const job = schedule.scheduleJob(notification.time, function () {
        logger.info(`Reminder: Your event ${event.event_id} is scheduled for ${event.event_time}`);
        completeJob(jobId, notification.day, userPhoneNumber, event,portfolioLink); // Mark job as completed in DynamoDB
      }); 
      jobs.push(jobId);
      logger.info(job);
    }
  } catch (err) {
    logger.info(err.message);
    throw new Error(err.message);
  }
  return jobs;
}


// Mark job as completed
async function completeJob(jobId, day, userPhoneNumber, event, portfolioLink) {
  try{
  const params = {
      TableName: 'scheduled_jobs',
      Key: { job_id: jobId },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': 'completed' }
  };
  const eventName  = event.event_name.split('_').join(' ');
  const eventTime = event.event_date.split('T')[1];
  
  await docClient.update(params).promise();
  await whatsappSender.sendEventReminder(
    userPhoneNumber || "Not Defined",
    day || "Not Defined",
    eventName || "Not Defined",
    eventTime || "Not Defined",
    event.event_location || "Not Defined",
    portfolioLink || "Not Defined"
  );
  
  logger.info("Scheduled Job executed successfully");
  }catch(err){
    logger.error(err.message);
    throw new Error("Error in running scheduled job");
  }
}

// Fetch jobs from DynamoDB
async function fetchPendingJobs() {
  const params = {
      TableName: 'scheduled_jobs',
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
          "#status": "status"
      },
      ExpressionAttributeValues: {
          ":status": "pending"
      }
  };
  const result = await docClient.scan(params).promise();
  return result.Items;
}

// New function to handle job execution or scheduling
async function handleJobExecution(jobId, time,jobDay, userPhoneNumber,event, portfolioLink) {
  const executionTime = new Date(time);
  const now = new Date();
  logger.info(executionTime);
  // Check if the execution time is in the past
  if (executionTime < now) {
      logger.info(`The notification time for event ${event.event_id} has passed.`);
      
      // Trigger the job immediately if the time has passed
      completeJob(jobId, jobDay, userPhoneNumber, event, portfolioLink);
      logger.info("Succesfully rescheduled job with JobId: ",jobId," executionTime: ",executionTime);
  } else {
      // Schedule the job at the correct time if it's in the future
      const scheduledJob = schedule.scheduleJob(executionTime, function () {
          logger.info(`Reminder: Your event ${event.event_id} is scheduled for ${event.event_time}`);
          completeJob(jobId, jobDay, userPhoneNumber, event, portfolioLink); // Mark job as completed in DynamoDB
      });
      
      logger.info(`Scheduled job for event ${event.event_id} at ${executionTime}`);
  }
}

// Main function to reschedule jobs
async function rescheduleJobs() {
  const jobs = await fetchPendingJobs();

  for (const job of jobs) {
      const event = await getEventDetailsById(job.event_id); // Fetch event details by ID
      await handleJobExecution(job.job_id,job.notification_time,job.job_day,job.user_phone_number, event,job.portfolio_link); // Call the new function for handling each job
  }
}


app.post("/process-images", async (req, res) => {
  const { folder_name } = req.body;

  if (!folder_name) {
      return res.status(400).json({ error: "folder_name is required." });
  }

  let lastEvaluatedKey = null;
  let totalProcessed = 0;

  try {
      do {
          // Fetch 1000 records at a time
          const { items, lastEvaluatedKey: nextKey } = await fetchRecords(folder_name, lastEvaluatedKey);

          // Process each record
          for (const record of items) {
            
            const Quality = JSON.parse(record.Quality);
            const facesDir = path.join(__dirname, 'output');       
            const userFacesDir = path.join(facesDir, record.user_id);
            const userExists = checkDirectoryExistence(userFacesDir);
              
            if(Quality.Sharpness>10 && userExists)
              await processRecord(record);
          }

          totalProcessed += items.length;
          logger.info(`Processed ${totalProcessed} records so far.`);

          // Update the last evaluated key
          lastEvaluatedKey = nextKey;

      } while (lastEvaluatedKey);

      res.status(200).json({
          message: "All records processed successfully.",
          totalProcessed,
      });
  } catch (error) {
      console.error("Error processing images:", error);
      res.status(500).json({ error: "Internal server error." });
  }
});

async function processRecord(record) {
  const { user_id, image_id, s3_url, bounding_box,face_id } = record;

  try {
      // Download the image
      const imageBuffer = await downloadImage(s3_url);

          // Crop face from the image
          const croppedFace = await cropFaceFromImage(imageBuffer, bounding_box);

          // Save the cropped face to the user folder
          const res = await saveCroppedFace(user_id, face_id, croppedFace);
          logger.info("Processing done for the image : "+ s3_url);
  } catch (error) {
      console.error(`Error processing record with image_id ${image_id}:`, error);
  }
}


// Fetch Entries from DynamoDB
async function fetchRecords(folderName, lastEvaluatedKey) {
  const params = {
      TableName: indexedDataTableName,
      IndexName: "folder_name-user_id-index",
      ProjectionExpression: "user_id, image_id, s3_url, folder_name, face_id, bounding_box,Quality",
      KeyConditionExpression: "folder_name = :folderName",
      ExpressionAttributeValues: {
          ":folderName": folderName,
      },
      Limit: 1000, // Fetch 1000 records at a time
  };

  if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
  }

  const result = await docClient.query(params).promise();
  return {
      items: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey || null,
  };
}

async function downloadImage(s3_url) {
  // Extract bucket name and key from URL
  const urlParts = s3_url.split('/');
  const bucketName = urlParts[2].split('.')[0];
  let key = urlParts.slice(3).join('/');
  key = decodeURIComponentSafely(key.replace(/\+/g, '%20'));

  logger.info(`Downloading image from bucket: ${bucketName}, key: ${key}`);
  const imageData = await s3.getObject({
      Bucket: bucketName,
      Key: key
  }).promise();

  return Buffer.from(imageData.Body);
}


// Crop Face from Image using Bounding Box
async function cropFaceFromImage(imageBuffer, boundingBox) {
  const { Top, Left, Width, Height } = boundingBox;
  const image = sharp(imageBuffer);

  // Get image metadata
  const metadata = await image.metadata();
  const cropArea = {
      left: Math.round(metadata.width * parseFloat(Left)),
      top: Math.round(metadata.height * parseFloat(Top)),
      width: Math.round(metadata.width * parseFloat(Width)),
      height: Math.round(metadata.height * parseFloat(Height))
  };

  return image.extract(cropArea).toBuffer();
}

// Save Cropped Face to User Folder
async function saveCroppedFace(user_id, face_id, croppedFaceBuffer) {
  const userFolder = path.join(__dirname, "output", user_id);

  // Create user folder if it doesn't exist
  if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
  }

  // Save the cropped image
  const filePath = path.join(userFolder, `${face_id}.jpg`);
  fs.writeFileSync(filePath, croppedFaceBuffer);
  console.log(`Saved cropped face to: ${filePath}`);
}

// Helper function to fetch data from DynamoDB
async function fetchDataFromDynamoDB(folderName, lastEvaluatedKey = null) {
  const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index', // Adjust based on your table's index
      KeyConditionExpression: 'folder_name = :folderName',
      ExpressionAttributeValues: {
          ':folderName': folderName,
      },
      ProjectionExpression: 'face_id, AgeRange_High, AgeRange_Low, Gender_Value, Gender_Confidence, Emotions',
      ExclusiveStartKey: lastEvaluatedKey,
  };

  const data = await docClient.query(params).promise();
  return data;
}

// Helper function to generate Excel
async function generateExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Faces Data');

  // Add headers
  worksheet.columns = [
      { header: 'Face ID', key: 'face_id', width: 30 },
      { header: 'Age Range High', key: 'AgeRange_High', width: 15 },
      { header: 'Age Range Low', key: 'AgeRange_Low', width: 15 },
      { header: 'Gender', key: 'Gender_Value', width: 15 },
      { header: 'Gender Confidence', key: 'Gender_Confidence', width: 20 },
      { header: 'Emotions', key: 'Emotions', width: 50 },
  ];

  // Add rows
  data.forEach((item) => {
      worksheet.addRow({
          face_id: item.face_id,
          AgeRange_High: item.AgeRange_High,
          AgeRange_Low: item.AgeRange_Low,
          Gender_Value: item.Gender_Value,
          Gender_Confidence: item.Gender_Confidence,
          Emotions: item.Emotions,
      });
  });

  // Return the buffer
  return await workbook.xlsx.writeBuffer();
}

// API Endpoint
app.post('/fetch_and_save_excel', async (req, res) => {
  const { folder_name } = req.body;

  if (!folder_name) {
      return res.status(400).send({ message: 'folder_name is required' });
  }

  try {
      let lastEvaluatedKey = null;
      let allData = [];

      // Fetch data in batches
      do {
          const { Items, LastEvaluatedKey } = await fetchDataFromDynamoDB(folder_name, lastEvaluatedKey);
          allData = allData.concat(Items);
          lastEvaluatedKey = LastEvaluatedKey;
      } while (lastEvaluatedKey);

      if (allData.length === 0) {
          return res.status(404).send({ message: 'No records found for the specified folder name.' });
      }

      // Generate Excel file
      const excelBuffer = await generateExcel(allData);

      // Send the Excel file
      res.setHeader(
          'Content-Disposition',
          `attachment; filename="${folder_name}_data.xlsx"`
      );
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);
  } catch (error) {
      console.error('Error fetching data or generating Excel:', error);
      res.status(500).send({ message: 'An error occurred', error: error.message });
  }
});

// Function to fetch user IDs in batches
async function getUserIds(limit) {
  let userIds = []; // Array to store the fetched user IDs
  let params = {
      TableName: 'RekognitionUsersData',
      ProjectionExpression: 'user_id',
      Limit: Math.min(limit, 1000), // DynamoDB maximum scan limit per request is 1000
  };
  let lastEvaluatedKey = null;

  do {
      if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
      }

      // Fetch a batch of records from DynamoDB
      const result = await docClient.scan(params).promise();

      // Add user IDs to the array
      const batchUserIds = result.Items.map(item => item.user_id);
      userIds.push(...batchUserIds);

      // Update the last evaluated key for the next request
      lastEvaluatedKey = result.LastEvaluatedKey;

      // If we have reached the desired limit, break the loop
      if (userIds.length >= limit) {
          userIds = userIds.slice(0, limit); // Trim the array to the exact limit
          break;
      }
  } while (lastEvaluatedKey);

  return userIds;
}


// Function to fetch face data for a user
async function getFaceData(userId) {
  const params = {
      TableName: indexedDataTableName,
      IndexName: 'user_id-index',
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
          ':userId': { S: userId },
      },
      ProjectionExpression: 'face_id, AgeRange_High, AgeRange_Low, Gender_Value, Gender_Confidence, Emotions, Quality, bounding_box, s3_url',
      Limit: 15,
  };

  const result = await dynamoDB.query(params).promise();

  return result.Items.map(item => {
      // Calculate age average
      const ageHigh = item.AgeRange_High?.N ? parseFloat(item.AgeRange_High.N) : null;
      const ageLow = item.AgeRange_Low?.N ? parseFloat(item.AgeRange_Low.N) : null;
      const ageAverage = ageHigh !== null && ageLow !== null ? (ageHigh + ageLow) / 2 : null;

      // Process gender and confidence
      const genderValue = item.Gender_Value?.S;
      const genderConfidence = item.Gender_Confidence?.N ? parseFloat(item.Gender_Confidence.N) : null;
      let genderDetails = null;

      if (genderValue === 'Male' && genderConfidence !== null) {
          genderDetails = {
              Gender: 'Male',
              Male_Confidence: genderConfidence,
              Female_Confidence: 100 - genderConfidence
          };
      } else if (genderValue === 'Female' && genderConfidence !== null) {
          genderDetails = {
              Gender: 'Female',
              Male_Confidence: 100 - genderConfidence,
              Female_Confidence: genderConfidence
          };
      }

      return {
          face_id: item.face_id.S,
          age_average: ageAverage, // Include the age average
          gender_details: genderDetails, // Include detailed gender info
          emotions: item.Emotions?.S,
          bounding_box: item.bounding_box?.M,
          s3_url: item.s3_url.S,
          Quality: item.Quality?.S,
      };
  });
}



// Function to fetch face data for a user
async function getFaceIdsata(faceId) {
  const params = {
      TableName: indexedDataTableName,
      IndexName: 'face_id-index',
      KeyConditionExpression: 'face_id = :faceId',
      ExpressionAttributeValues: {
          ':faceId': { S: faceId },
      },
      ProjectionExpression: 'user_id, face_id, AgeRange_High, AgeRange_Low, Gender_Value, Gender_Confidence, Emotions, Quality, bounding_box, s3_url',

  };

  const result = await dynamoDB.query(params).promise();

  return result.Items.map(item => {
      // Calculate age average
      const ageHigh = item.AgeRange_High?.N ? parseFloat(item.AgeRange_High.N) : null;
      const ageLow = item.AgeRange_Low?.N ? parseFloat(item.AgeRange_Low.N) : null;
      const ageAverage = ageHigh !== null && ageLow !== null ? (ageHigh + ageLow) / 2 : null;

      // Process gender and confidence
      const genderValue = item.Gender_Value?.S;
      const genderConfidence = item.Gender_Confidence?.N ? parseFloat(item.Gender_Confidence.N) : null;
      let genderDetails = null;

      if (genderValue === 'Male' && genderConfidence !== null) {
          genderDetails = {
              Gender: 'Male',
              Male_Confidence: genderConfidence,
              Female_Confidence: 100 - genderConfidence
          };
      } else if (genderValue === 'Female' && genderConfidence !== null) {
          genderDetails = {
              Gender: 'Female',
              Male_Confidence: 100 - genderConfidence,
              Female_Confidence: genderConfidence
          };
      }

      return {
          face_id: item.face_id.S,
          age_average: ageAverage, // Include the age average
          gender_details: genderDetails, // Include detailed gender info
          emotions: item.Emotions?.S,
          bounding_box: item.bounding_box?.M,
          s3_url: item.s3_url.S,
          Quality: item.Quality?.S,
      };
  });
}

// Function to download an image from S3
// async function downloadImage(s3_url) {
//     const response = await axios.get(s3_url, { responseType: 'arraybuffer' });
//     return Buffer.from(response.data);
// }

// Function to crop a face from an image
async function cropFaceFromImage(imageBuffer, boundingBox) {
    const { Top, Left, Width, Height } = boundingBox;
    const image = sharp(imageBuffer);

    const metadata = await image.metadata();
    const top = Math.round(Top * metadata.height);
    const left = Math.round(Left * metadata.width);
    const width = Math.round(Width * metadata.width);
    const height = Math.round(Height * metadata.height);

    return image.extract({ top, left, width, height }).toBuffer();
}

function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
  }
}
function checkDirectoryExistence(dirPath) {
  if (fs.existsSync(dirPath)) {
     logger.info("userId already exists ",dirPath);
     return true;
  }
  return false;
}


async function processUserData(userId, worksheet) {
  try {
      // Fetch face data for the given user ID
      const faceData = await getFaceData(userId);

      // Check if the user has less than 7 faces
      if (faceData.length < 7) {
          console.warn(`User ${userId} has ${faceData.length} faces. Skipping processing.`);
          return; // Exit the function
      }

      // Ensure the base 'faces' directory exists
      const facesDir = path.join(__dirname, 'faces');
      const userFacesDir = path.join(facesDir, userId);
      const userExists = checkDirectoryExistence(userFacesDir);

      for (const face of faceData) {
          try {
              const { face_id, emotions, bounding_box, s3_url, Quality } = face;

              if (!userExists) {
                  // Parse and validate Quality data
                  const qualityData = Quality ? JSON.parse(Quality) : {};
                  if (qualityData.Sharpness <= 10) {
                      console.warn(`Skipping face_id ${face_id} due to low sharpness.`);
                      continue;
                  }

                  // Download and crop the face
                  const imageBuffer = await downloadImage(s3_url);
                  const croppedFace = await cropFaceFromImage(imageBuffer, {
                      Top: parseFloat(bounding_box.Top.N),
                      Left: parseFloat(bounding_box.Left.N),
                      Width: parseFloat(bounding_box.Width.N),
                      Height: parseFloat(bounding_box.Height.N),
                  });

                  // Create a user-specific directory
                  ensureDirectoryExistence(userFacesDir);

                  // Save the cropped face locally in the user-specific folder
                  const filePath = path.join(userFacesDir, `${face_id}.jpg`);
                  fs.writeFileSync(filePath, croppedFace);
              }

              // Parse emotions
              const parsedEmotions = JSON.parse(emotions || '[]');
              const emotionData = parsedEmotions.reduce((acc, emotion) => {
                  acc[emotion.Type] = emotion.Confidence;
                  return acc;
              }, {});

              const highestEmotion = parsedEmotions.reduce((max, current) => {
                  return current.Confidence > max.Confidence ? current : max;
              }, parsedEmotions[0]);

              // Add row to the worksheet
              worksheet.addRow({
                  UserID: userId,
                  FaceID: face_id,
                  S3Url: s3_url,
                  Age: face.age_average,
                  GenderFemale: face.gender_details.Male_Confidence,
                  GenderMale: face.gender_details.Female_Confidence,
                  Happy: emotionData.HAPPY || 0,
                  Sad: emotionData.SAD || 0,
                  Angry: emotionData.ANGRY || 0,
                  Surprised: emotionData.SURPRISED || 0,
                  Calm: emotionData.CALM || 0,
                  Confused: emotionData.CONFUSED || 0,
                  Disgusted: emotionData.DISGUSTED || 0,
                  Fear: emotionData.FEAR || 0,
                  DominantEmotion: highestEmotion.Type,
              });
              logger.info(`Processed face_id: ${face_id}`);
          } catch (faceError) {
              console.error(`Error processing face_id ${face.s3_url}:`, faceError);
          }
      }
  } catch (error) {
      console.error(`Error processing user_id: ${userId}`, error);
  }
}


// Main API
app.post('/process-and-save', async (req, res) => {
    const { limit = 100 } = req.body;

    try {
        // Create Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Face Records');
        worksheet.columns = [
            { header: 'UserID', key: 'UserID', width: 30 },
            { header: 'FaceID', key: 'FaceID', width: 40 },
            { header: 'S3 URL', key: 'S3Url', width: 50 },
            { header: 'Age', key: 'Age', width: 20 },
            { header: 'Gender (Woman)', key: 'GenderMale', width: 15 },
            { header: 'Gender (Man)', key: 'GenderFemale', width: 15 },
            { header: 'Happy (%)', key: 'Happy', width: 15 },
            { header: 'Sad (%)', key: 'Sad', width: 15 },
            { header: 'Angry (%)', key: 'Angry', width: 15 },
            { header: 'Surprised (%)', key: 'Surprised', width: 15 },
            { header: 'Calm (%)', key: 'Calm', width: 15 },
            { header: 'Disgusted (%)', key: 'Disgusted', width: 15 },
            { header: 'Fear (%)', key: 'Fear', width: 15 },
            { header: 'Dominant Emotion', key: 'DominantEmotion', width: 15 }
        ];

        // Fetch user IDs
        const userIds = await getUserIds(limit);

        // Process each user's face data
        for (const userId of userIds) {
         
            await processUserData(userId, worksheet);
        }

        // Save the Excel file locally
        const filePath = path.join(__dirname, 'FaceRecords.xlsx');
        await workbook.xlsx.writeFile(filePath);

        // Return success response
        res.json({ message: 'Processing complete, Excel file saved.', filePath });
    } catch (error) {
        console.error('Error processing and saving data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Paths to files and folder
const inputExcelPath = "C:/Users/AnirudhThadem/FLASHBACK/Dataset/Facial Features Dataset/FaceRecords.xlsx"; // Path to the Excel file
const outputExcelPath = "./filtered_FaceRecords.xlsx"; // Path for the filtered output
const datasetPath = "C:/Users/AnirudhThadem/FLASHBACK/Dataset/Facial Features Dataset/Training"; // Path to the directory with UserID-named folders


app.post("/filter-matching-user-ids", async (req, res) => {
  try {
    logger.info("Loading the Excel file...");

    // Step 1: Read the input Excel file
    const workbook = xlsx.readFile(inputExcelPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info(`Total entries in Excel: ${data.length}`);

    // Step 2: Get a list of valid user IDs (from Excel)
    const excelUserIds = new Set(data.map((row) => row.UserID.trim().toLowerCase()));
    logger.info(`Unique UserIDs found in Excel: ${excelUserIds.size}`);

    // Step 3: Get a list of folder names in the dataset
    const folderNames = fs.readdirSync(datasetPath).map((folder) => folder.trim().toLowerCase());
    logger.info(`Total folders found in dataset: ${folderNames.length}`);

    // Step 4: Identify matching UserIDs
    const matchingUserIds = new Set(folderNames.filter((folder) => excelUserIds.has(folder)));
    logger.info(`Matching UserIDs between Excel and dataset: ${matchingUserIds.size}`);

    // Step 5: Filter the Excel data to keep only matching UserIDs
    const filteredData = data.filter((row) => matchingUserIds.has(row.UserID.trim().toLowerCase()));
    logger.info(`Filtered data entries: ${filteredData.length}`);

    // Step 6: Write the filtered data to a new Excel file
    const newWorkbook = xlsx.utils.book_new();
    const filteredDataSheet = xlsx.utils.json_to_sheet(filteredData);
    xlsx.utils.book_append_sheet(newWorkbook, filteredDataSheet, "MatchingData");
    xlsx.writeFile(newWorkbook, outputExcelPath);

    logger.info("Filtered Excel file with matching UserIDs created successfully!");

    // Step 7: Respond with success
    res.send({
      message: "Matching UserIDs filtering completed. Check the output file.",
      outputPath: outputExcelPath,
    });
  } catch (error) {
    logger.error(`Error during processing: ${error.message}`);
    res.status(500).send({ error: "An error occurred during filtering." });
  }
});


app.post("/compare-user-ids", async (req, res) => {
  try {
    console.log("Loading the Excel file...");

    // Step 1: Read the Excel file
    const workbook = xlsx.readFile(inputExcelPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(`Total entries in Excel: ${data.length}`);

    // Step 2: Extract unique UserIDs from the Excel file
    const userIdsFromExcel = [...new Set(data.map((row) => row.UserID))].sort();
    console.log(`Unique UserIDs from Excel: ${userIdsFromExcel.length}`);

    // Step 3: Get folder names from the dataset directory
    const folderNames = fs.readdirSync(datasetPath).sort();
    console.log(`Folder names in dataset: ${folderNames.length}`);

    // Step 4: Create a comparison sheet
    const maxLength = Math.max(userIdsFromExcel.length, folderNames.length);
    const comparisonData = [];
    for (let i = 0; i < maxLength; i++) {
      comparisonData.push({
        "Excel UserIDs": userIdsFromExcel[i] || "", // Leave blank if no value
        "Folder Names": folderNames[i] || "", // Leave blank if no value
      });
    }

    // Step 5: Write the comparison data to a new sheet in the Excel file
    const newSheet = xlsx.utils.json_to_sheet(comparisonData);

    // Append a new sheet with the comparison data
    xlsx.utils.book_append_sheet(workbook, newSheet, "Comparison");
    xlsx.writeFile(workbook, outputExcelPath);

    console.log("Comparison Excel file created successfully!");

    res.send({
      message: "Comparison of UserIDs and folder names has been written to the updated Excel file.",
      outputPath: outputExcelPath,
    });
  } catch (error) {
    console.error("Error during processing:", error.message);
    res.status(500).send({ error: "An error occurred while processing the data." });
  }
});

async function getFaceIdsData(faceId) {
  const params = {
      TableName: indexedDataTableName, // Replace with your table name
      IndexName: 'face_id-index',
      KeyConditionExpression: 'face_id = :faceId',
      ExpressionAttributeValues: {
          ':faceId': { S: faceId },
      },
      ProjectionExpression: 'user_id, face_id, AgeRange_High, AgeRange_Low, Gender_Value, Gender_Confidence, Emotions, Quality, bounding_box, s3_url',
  };

  const result = await dynamoDB.query(params).promise();

  return result.Items.map(item => {
      // Calculate age average
      const ageHigh = item.AgeRange_High?.N ? parseFloat(item.AgeRange_High.N) : null;
      const ageLow = item.AgeRange_Low?.N ? parseFloat(item.AgeRange_Low.N) : null;
      const ageAverage = ageHigh !== null && ageLow !== null ? (ageHigh + ageLow) / 2 : null;

      // Process gender and confidence
      const genderValue = item.Gender_Value?.S;
      const genderConfidence = item.Gender_Confidence?.N ? parseFloat(item.Gender_Confidence.N) : null;
      let genderDetails = null;

      if (genderValue === 'Male' && genderConfidence !== null) {
          genderDetails = {
              Gender: 'Male',
              Male_Confidence: genderConfidence,
              Female_Confidence: 100 - genderConfidence
          };
      } else if (genderValue === 'Female' && genderConfidence !== null) {
          genderDetails = {
              Gender: 'Female',
              Male_Confidence: 100 - genderConfidence,
              Female_Confidence: genderConfidence
          };
      }

      return {
          user_id: item.user_id?.S,
          face_id: item.face_id?.S,
          age_average: ageAverage,
          gender_details: genderDetails,
          emotions: item.Emotions?.S,
          bounding_box: item.bounding_box?.M,
          s3_url: item.s3_url?.S,
          quality: item.Quality?.S,
      };
  });
}

// API Endpoint
app.post('/process-face-records', async (req, res) => {
  try {
      // Load the input Excel file
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(inputExcelPath);

      const worksheet = workbook.getWorksheet(1); // Assume first sheet
      const faceIds = [];

      // Extract face IDs from the input Excel file
      worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) { // Skip header
              faceIds.push(row.getCell(2).value); // Assume face ID is in the first column
          }
      });

      console.log(`Extracted ${faceIds.length} face IDs from the input file.`);

      // Process each face ID and fetch data from DynamoDB
      const outputWorkbook = new ExcelJS.Workbook();
      const outputWorksheet = outputWorkbook.addWorksheet('Face Records');
      outputWorksheet.columns = [
          { header: 'UserID', key: 'UserID', width: 30 },
          { header: 'FaceID', key: 'FaceID', width: 40 },
          { header: 'S3 URL', key: 'S3Url', width: 50 },
          { header: 'Age', key: 'Age', width: 20 },
          { header: 'Gender (Woman)', key: 'GenderFemale', width: 15 },
          { header: 'Gender (Man)', key: 'GenderMale', width: 15 },
          { header: 'Happy (%)', key: 'Happy', width: 15 },
          { header: 'Sad (%)', key: 'Sad', width: 15 },
          { header: 'Angry (%)', key: 'Angry', width: 15 },
          { header: 'Surprised (%)', key: 'Surprised', width: 15 },
          { header: 'Calm (%)', key: 'Calm', width: 15 },
          { header: 'Disgusted (%)', key: 'Disgusted', width: 15 },
          { header: 'Fear (%)', key: 'Fear', width: 15 },
          { header: 'Dominant Emotion', key: 'DominantEmotion', width: 15 },
      ];

      for (const faceId of faceIds) {
          const faceData = await getFaceIdsData(faceId);

          faceData.forEach(face => {
              const emotions = face.emotions ? JSON.parse(face.emotions) : [];
              const emotionData = emotions.reduce((acc, emotion) => {
                  acc[emotion.Type] = emotion.Confidence;
                  return acc;
              }, {});

              const highestEmotion = emotions.reduce((max, current) => {
                  return current.Confidence > max.Confidence ? current : max;
              }, emotions[0]);

              outputWorksheet.addRow({
                  UserID: face.user_id,
                  FaceID: face.face_id,
                  S3Url: face.s3_url,
                  Age: face.age_average,
                  GenderFemale: face.gender_details?.Male_Confidence || 0,
                  GenderMale: face.gender_details?.Female_Confidence || 0,
                  Happy: emotionData.HAPPY || 0,
                  Sad: emotionData.SAD || 0,
                  Angry: emotionData.ANGRY || 0,
                  Surprised: emotionData.SURPRISED || 0,
                  Calm: emotionData.CALM || 0,
                  Disgusted: emotionData.DISGUSTED || 0,
                  Fear: emotionData.FEAR || 0,
                  DominantEmotion: highestEmotion?.Type || 'N/A',
              });
          });
      }

      // Save the output Excel file
      const outputExcelPath = './ProcessedFaceRecords.xlsx';
      await outputWorkbook.xlsx.writeFile(outputExcelPath);

      console.log('Face records processed and saved to Excel.');
      res.send({ message: 'Face records processed successfully.', outputExcelPath });
  } catch (error) {
      console.error('Error processing face records:', error);
      res.status(500).send({ error: 'Failed to process face records.' });
  }
});



// API to compare Excel and folder file counts
app.post("/compare-user-id-counts", async (req, res) => {
  try {
    logger.info("Loading the Excel file...");

    // Step 1: Read the input Excel file
    const workbook = xlsx.readFile(inputExcelPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info(`Total entries in Excel: ${data.length}`);

    // Step 2: Group Excel entries by UserID
    const userIdCounts = {};
    data.forEach((row) => {
      const userId = row.UserID.trim().toLowerCase();
      userIdCounts[userId] = (userIdCounts[userId] || 0) + 1;
    });
    logger.info(`Unique UserIDs found in Excel: ${Object.keys(userIdCounts).length}`);

    // Step 3: Get folder file counts for each UserID
    const comparisonData = [];
    const folderNames = fs.readdirSync(datasetPath).map((folder) => folder.trim().toLowerCase());
    folderNames.forEach((folder) => {
      const folderPath = path.join(datasetPath, folder);
      const fileCount = fs.readdirSync(folderPath).length;

      // Compare Excel count with folder file count
      const excelCount = userIdCounts[folder] || 0;
      comparisonData.push({
        UserID: folder,
        ExcelCount: excelCount,
        FolderFileCount: fileCount,
        Status: excelCount === fileCount ? "Match" : "Mismatch",
      });

      if (excelCount !== fileCount) {
        logger.warn(`Mismatch for UserID: ${folder} (Excel: ${excelCount}, Folder: ${fileCount})`);
      }
    });

    // Step 4: Write comparison data to a new Excel file
    const newWorkbook = xlsx.utils.book_new();
    const comparisonSheet = xlsx.utils.json_to_sheet(comparisonData);
    xlsx.utils.book_append_sheet(newWorkbook, comparisonSheet, "Comparison");
    xlsx.writeFile(newWorkbook, outputExcelPath);

    logger.info("Comparison report created successfully!");

    // Step 5: Respond with success
    res.send({
      message: "Comparison completed. Check the report for details.",
      outputPath: outputExcelPath,
    });
  } catch (error) {
    logger.error(`Error during processing: ${error.message}`);
    res.status(500).send({ error: "An error occurred during comparison." });
  }
});

// API to clean mismatched entries
app.post("/clean-extra-entries", async (req, res) => {
  try {
    logger.info("Loading the Excel file...");

    // Step 1: Read the input Excel file
    const workbook = xlsx.readFile(inputExcelPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info(`Total entries in Excel: ${data.length}`);

    // Step 2: Group Excel entries by UserID
    const userIdToFaceIds = {};
    data.forEach((row) => {
      const userId = row.UserID.trim().toLowerCase();
      if (!userIdToFaceIds[userId]) {
        userIdToFaceIds[userId] = [];
      }
      userIdToFaceIds[userId].push(row.FaceID.trim());
    });
    logger.info(`Unique UserIDs found in Excel: ${Object.keys(userIdToFaceIds).length}`);

    // Step 3: Compare UserIDs with dataset folders and filter mismatched entries
    const cleanedData = [];
    const folderNames = fs.readdirSync(datasetPath).map((folder) => folder.trim().toLowerCase());
    folderNames.forEach((folder) => {
      const folderPath = path.join(datasetPath, folder);
      const filesInFolder = fs.readdirSync(folderPath).map((file) => file.split('.')[0]); // Remove extensions

      // Get Excel FaceIDs for this UserID
      const excelFaceIds = userIdToFaceIds[folder] || [];

      // Keep only matching FaceIDs
      const matchingFaceIds = excelFaceIds.filter((faceId) => filesInFolder.includes(faceId));
      const removedFaceIds = excelFaceIds.filter((faceId) => !filesInFolder.includes(faceId));

      logger.info(
        `UserID: ${folder}, Matching FaceIDs: ${matchingFaceIds.length}, Removed FaceIDs: ${removedFaceIds.length}`
      );

      // Keep rows only for matching FaceIDs
      matchingFaceIds.forEach((faceId) => {
        cleanedData.push(...data.filter((row) => row.UserID.trim().toLowerCase() === folder && row.FaceID.trim() === faceId));
      });
    });

    logger.info(`Total cleaned entries: ${cleanedData.length}`);

    // Step 4: Write the cleaned data to a new Excel file
    const newWorkbook = xlsx.utils.book_new();
    const cleanedDataSheet = xlsx.utils.json_to_sheet(cleanedData);
    xlsx.utils.book_append_sheet(newWorkbook, cleanedDataSheet, "CleanedData");
    xlsx.writeFile(newWorkbook, outputExcelPath);

    logger.info("Cleaned Excel file created successfully!");

    // Step 5: Respond with success
    res.send({
      message: "Extra entries cleaned. Check the output file.",
      outputPath: outputExcelPath,
    });
  } catch (error) {
    logger.error(`Error during processing: ${error.message}`);
    res.status(500).send({ error: "An error occurred during cleaning." });
  }
});

// API to remove duplicate FaceIDs
app.post("/remove-duplicate-faceids", async (req, res) => {
  try {
    logger.info("Loading the Excel file...");

    // Step 1: Read the input Excel file
    const workbook = xlsx.readFile(inputExcelPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info(`Total entries in Excel: ${data.length}`);

    // Step 2: Remove duplicate FaceIDs
    const seenFaceIds = new Set();
    const deduplicatedData = data.filter((row) => {
      const faceId = row.FaceID?.trim();
      if (!faceId || seenFaceIds.has(faceId)) {
        return false; // Skip duplicates
      }
      seenFaceIds.add(faceId); // Add unique FaceID to the set
      return true; // Retain unique entry
    });
    logger.info(`Total deduplicated entries: ${deduplicatedData.length}`);

    // Step 3: Write the deduplicated data to a new Excel file
    const newWorkbook = xlsx.utils.book_new();
    const deduplicatedDataSheet = xlsx.utils.json_to_sheet(deduplicatedData);
    xlsx.utils.book_append_sheet(newWorkbook, deduplicatedDataSheet, "DeduplicatedData");
    xlsx.writeFile(newWorkbook, outputExcelPath);

    logger.info("Deduplicated Excel file created successfully!");

    // Step 4: Respond with success
    res.send({
      message: "Duplicate FaceIDs removed. Check the output file.",
      outputPath: outputExcelPath,
    });
  } catch (error) {
    logger.error(`Error during processing: ${error.message}`);
    res.status(500).send({ error: "An error occurred while removing duplicates." });
  }
});

// API to remove extra folders
app.post("/remove-extra-folders", async (req, res) => {
  try {
    logger.info("Loading the Excel file...");

    // Step 1: Read the input Excel file
    const workbook = xlsx.readFile(inputExcelPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info(`Total entries in Excel: ${data.length}`);

    // Step 2: Get unique UserIDs from the Excel file
    const excelUserIds = new Set(data.map((row) => row.UserID.trim().toLowerCase()));
    logger.info(`Unique UserIDs found in Excel: ${excelUserIds.size}`);

    // Step 3: Get a list of folder names in the dataset
    const folderNames = fs.readdirSync(datasetPath).map((folder) => folder.trim().toLowerCase());
    logger.info(`Total folders found in dataset: ${folderNames.length}`);

    // Step 4: Identify folders not listed in the Excel file
    const foldersNotInExcel = folderNames.filter((folder) => !excelUserIds.has(folder));
    logger.info(`Folders not listed in Excel: ${foldersNotInExcel.length}`);

    // Step 5: Remove unmatched folders
    foldersNotInExcel.forEach((folder) => {
      const folderPath = path.join(datasetPath, folder);
      try {
        fs.rmdirSync(folderPath, { recursive: true }); // Delete the folder
        logger.info(`Deleted folder: ${folderPath}`);
      } catch (err) {
        logger.error(`Failed to delete folder ${folderPath}: ${err.message}`);
      }
    });

    // Step 6: Respond with success
    res.send({
      message: "Extra folders removed. Check logs for details.",
      removedFolders: foldersNotInExcel,
    });
  } catch (error) {
    logger.error(`Error during processing: ${error.message}`);
    res.status(500).send({ error: "An error occurred while removing extra folders." });
  }
});

const S3_BUCKET_NAME = 'flashbackuserthumbnails';
const S3_BASE_URL = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/`;

// Helper function to check if an object exists in S3
const checkObjectExists = async (bucket, key) => {
  try {
    await s3.headObject({ Bucket: bucket, Key: key }).promise();
    return key;
  } catch (error) {
    // Try with the plus prefix if the first attempt fails
    try {
      const keyWithPlus = key.startsWith('+') ? key : `+${key}`;
      await s3.headObject({ Bucket: bucket, Key: keyWithPlus }).promise();
      return keyWithPlus;
    } catch (err) {
      return false;
    }
  }
};

// Helper function to construct an S3 URL
const constructS3Url = (phoneNumber) => {
  const urlSafePhone = encodeURIComponent(phoneNumber);
  return `${S3_BASE_URL}${urlSafePhone}.jpg`;
};

// API Endpoint
app.get('/process-users', async (req, res) => {
  let totalUsers = 0;
  let missingPortraitCount = 0;
  let refilledCount = 0;
  let failedCount = 0;

  try {
    let items = [];
    let params = {
      TableName: userrecordstable,
      ProjectionExpression: 'user_phone_number, reward_points',
    };

    // Scan the DynamoDB table (handle pagination)
    do {
      const data = await docClient.scan(params).promise();
      items = items.concat(data.Items);
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (params.ExclusiveStartKey);

    totalUsers = items.length;
    logger.info(`Total users found: ${totalUsers}`);

    // Process each user
    for (const item of items) {
      const phoneNumber = item.user_phone_number;

      // Check if portrait_s3_url is missing
      if (item.reward_points<=100) {
        
          try {
            // Construct the URL
            const rewards = 0;

            // Update DynamoDB record
            await docClient
              .update({
                TableName: userrecordstable,
                Key: { user_phone_number: phoneNumber },
                UpdateExpression: 'SET reward_points = :rewards',
                ExpressionAttributeValues: { ':rewards': rewards },
              })
              .promise();

            logger.info(`Successfully updated for ${phoneNumber}`);
          } catch (error) {
            failedCount++;
            logger.error(`Failed to update DynamoDB for ${phoneNumber}: ${error.message}`);
          }
        } 
      }
    

    // Log final statistics
    logger.info(`
      Processing completed:
      - Total users processed: ${totalUsers}
      - Users missing portrait URL: ${missingPortraitCount}
      - Successfully refilled: ${refilledCount}
      - Failed to refill: ${failedCount}
    `);

    res.status(200).json({
      total_users: totalUsers,
      missing_portrait_count: missingPortraitCount,
      refilled_count: refilledCount,
      failed_count: failedCount,
    });
  } catch (error) {
    const errorMsg = `Error processing users: ${error.message}`;
    logger.error(errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});


app.post('/send-anouncement', async (req, res) => {
  let totalUsers = 0;
  let missingUserIds = 0;
  let failedCount = 0;
  let oldUserCount = 0;

  try {
    let items = [];
    let params = {
      TableName: userrecordstable,
    };

    // Scan the DynamoDB table (handle pagination)
    do {
      const data = await docClient.scan(params).promise();
      items = items.concat(data.Items);
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (params.ExclusiveStartKey);

    totalUsers = items.length;
    logger.info(`Total users found: ${totalUsers}`);
    const oldEventUsersObj = await getUsersForEvent("KSL_Event1");
    const oldEventUsersList = oldEventUsersObj.map(user => user.user_phone_number);
    const sentParams = {
      TableName: 'FlashbackDeliveryHistory',
      FilterExpression: 'event_name = :event_name',
      ExpressionAttributeValues: {
        ':event_name': "announcement"
      }
    };

    const sentUsersData = await docClient.scan(sentParams).promise();
    const sentUsers = sentUsersData.Items.map(item => item.user_phone_number);
    // Process each user
    for (const item of items) {
      const phoneNumber = item.user_phone_number;
      if(sentUsers.includes(item.user_phone_number))
        continue;
      // Check if userId is missing
      if (item.user_id && !oldEventUsersList.includes(item.user_phone_number)) {
        
          try {
             await whatsappSender.sendAnnouncementMessage(phoneNumber);
             await storeSentData(phoneNumber,'announcement', 'announcement');
            logger.info(`Successfully Sent for ${phoneNumber}`);
          } catch (error) {
            failedCount++;
            logger.error(`Failed to Send for ${phoneNumber}: ${error.message}`);
          }
        } 
        else{
          if(oldEventUsersList.includes(item.user_phone_number))
            oldUserCount++;
          missingUserIds++;
        }
      }
    

    // Log final statistics
    logger.info(`
      Processing completed:
      - Total users processed: ${totalUsers}
      - Users missing portrait URL: ${missingUserIds}
      - Successfully refilled: ${oldUserCount}
      - Failed to refill: ${failedCount}
    `);

    res.status(200).json({
      total_users: totalUsers,
      missing_portrait_count: missingUserIds,
      refilled_count: oldUserCount,
      failed_count: failedCount,
    });
  } catch (error) {
    const errorMsg = `Error processing users: ${error.message}`;
    logger.error(errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

app.post('/send-anouncement-test', async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
        
          try {
             await whatsappSender.sendAnnouncementMessage(phoneNumber);
             await storeSentData(phoneNumber,'announcement', 'announcement');
            logger.info(`Successfully Sent for ${phoneNumber}`);
          
    

  

    res.status(200).json({
    });
  } catch (error) {
    const errorMsg = `Error processing users: ${error.message}`;
    logger.error(errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});



async function saveUserFlashbackDetails(flashDetails){
  const {
    file,
    flashbackName,
    user_phone_number,
  } = flashDetails;

  const flashbackId = crypto.randomBytes(4).toString('hex');
  logger.info('flashbackId created ' + flashbackId);
  const fileKey = `${flashbackId}.jpg`;

  try {
    // Create folder in S3
    await createS3Folder(indexBucketName, flashbackId);

    // Upload image to S3
    const imageUrl = await uploadImageToS3('flashbackuserflashbackthumbnails', fileKey, file.buffer, file.mimetype);

    // Save event details to DynamoDB
    const flashbackParams = {
      TableName: userFlashbackDetailsTable,
      Item: {
        flashback_id: flashbackId,
        flashback_name: flashbackName,
        created_date: new Date().toISOString(),
        flashback_image: imageUrl,
        folder_name: flashbackId,
        is_favourite:false,
        user_phone_number:user_phone_number,
        access_level:'creator'
      },
    };

    const result = await docClient.put(flashbackParams).promise();
    logger.info('Flashback Created Successfully: ' ,flashbackName," created by : ",user_phone_number);

     return flashbackParams.Item;
  } catch (error) {
    logger.error('Error creating flashback:', error);
    throw new Error('Error creating flashback',error);
  }
};

app.post('/saveUserFlashbackDetails', upload.single('flashbackImage'), async (req, res) => {
  const file = req.file;
  const {
    flashbackName,
    user_phone_number
  } = req.body;

  try {
    const result = await saveUserFlashbackDetails({
      file,
      flashbackName,
      user_phone_number
    });
    await mapUserToFlashback(result.flashback_id,user_phone_number,'');

    res.status(200).send({"message":"Flashback Created Successfully","data":result});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


async function updateUserFlashbackUploadData(s3Result, userPhoneNumber, originalName, flashbackId) {
  const now = new Date();
  const dynamoDbParams = {
    TableName: UserFlashbackImageUploadData,
    Item: {
      s3_url: s3Result.Location,
      user_phone_number: userPhoneNumber,
      file_name: originalName,
      flashback_id: flashbackId,
      uploaded_date: now.toISOString(),
      enable_sharing:false,

    }
  };

  try {
    await docClient.put(dynamoDbParams).promise();
    logger.info("Updated Image data in ImageUploadData table");
  } catch (error) {
    logger.error(`Error updating DynamoDB for file ${originalName}:`, error);
    throw error;
  }
}

app.post('/uploadUserFlashback/:flashbackId/:userPhoneNumber', (req, res) => {
  
  const { flashbackId, userPhoneNumber } = req.params;
  logger.info("Started uploading files for the flashback: " + flashbackId);

  const bb = busboy({ headers: req.headers });
  const uploadPromises = [];

  bb.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
    console.log(`Received file: ${filename}, fieldname: ${fieldname}, mimetype: ${mimetype}`);
    const fileId = `${flashbackId}/${filename.filename}`;
    const s3Params = {
      Bucket: indexBucketName,
      Key: fileId,
      Body: fileStream, // Stream the file directly
      ContentType: mimetype,
    };

    // Create a promise for each upload
    const uploadPromise = s3.upload(s3Params).promise()
      .then(async (s3Result) => {
        // Update DynamoDB with the new entry
        await updateUserFlashbackUploadData(s3Result, userPhoneNumber, filename, flashbackId);
        return s3Result;
      })
      .catch((error) => {
        console.error(`Error uploading file ${filename}:`, error);
        throw error;
      });

    uploadPromises.push(uploadPromise);
  });

  bb.on('field', (fieldname, val) => {

    console.log(`Received field: ${fieldname}, value: ${val}`);
    // Handle any form fields if necessary
  });

  bb.on('finish', async () => {
    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failedUploads = results.filter(r => r.status === 'rejected').map(r => r.reason);

      logger.info("Upload process completed for the event: " + flashbackId);
      res.status(200).json({
        message: 'Upload process completed',
        successfulUploads,
        failedUploads,
        totalFiles: successfulUploads.length + failedUploads.length,
      });
    } catch (error) {
      console.error('Error in upload process:', error);
      res.status(500).json({ error: 'Error in upload process' });
    }
  });

  bb.on('error', (err) => {
    console.error('Error parsing form:', err);
    res.status(500).json({ error: 'Error parsing form' });
  });

  req.pipe(bb);
});

async function getUserFlashbacks(userPhoneNumber) {
  logger.info("Fetching user flashbacks for userPhoneNumber : ", userPhoneNumber);
  const userPhoneNumberIndex = 'user_phone_number-index'; // Replace with your actual GSI name
  const params = {
    TableName: userFlashbackDetailsTable, // Replace with your table name
    IndexName: userPhoneNumberIndex,
    KeyConditionExpression: 'user_phone_number = :phoneNumber',
    ExpressionAttributeValues: {
      ':phoneNumber': userPhoneNumber,
    },
  };

  let flashbacks = [];
  let lastEvaluatedKey = null;

  try {
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const result = await docClient.query(params).promise();

      if (result.Items) {
        flashbacks = flashbacks.concat(result.Items);
      }

      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    // Sort the flashbacks by is_favourite (true values first)
    flashbacks.sort((a, b) => {
      if (a.is_favourite === b.is_favourite) return 0;
      return a.is_favourite ? -1 : 1; // Move `true` values to the beginning
    });
    
    logger.info("Successfully fetched user flashbacks for userPhoneNumber : ", userPhoneNumber);
    return flashbacks;
  } catch (error) {
    logger.error('Error fetching flashbacks:', error);
    throw new Error('Error fetching flashbacks');
  }
}

app.get('/getUserFlashbacks/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;

  try {
    const flashbacks = await getUserFlashbacks(userPhoneNumber);
    res.status(200).json({ message: 'Flashbacks retrieved successfully', flashbacks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/setFlashbackFavourite', async (req, res) => {
  try {
    
    const userPhoneNumber = req.body.userPhoneNumber;
    const flashbackId = req.body.flashbackId;
    const isFavourite = req.body.isFavourite;
    logger.info(`Updating favourite status for Flashback ID: ${flashbackId}`);
    const params = {
      TableName: userFlashbackDetailsTable,
      Key: {
        flashback_id: flashbackId,
        user_phone_number:userPhoneNumber
      },
      UpdateExpression: 'set is_favourite = :isFavourite',
      ExpressionAttributeValues: {
        ':isFavourite': isFavourite
      },
      ReturnValues: 'UPDATED_NEW'
    };

    const result =  await docClient.update(params).promise();
    logger.info("Put operation succeeded:", result);
    res.send({"message":"Flashback Favourites status updated successfully","data":result});
  } catch (err) {
    logger.error("Unable to update item. Error JSON:", err);
    res.status(500).send({ error: 'Unable to mark the flashback as favourite', details: err.message });

  }
});

app.get('/getUserFlashbackImages/:flashbackId', async (req, res) => {
  const { flashbackId } = req.params;
  const { continuationToken } = req.query;
  const bucketName = thumbnailBucketName; // Replace with your actual bucket name

  if (!flashbackId) {
    return res.status(400).json({ error: 'eventName parameter is required' });
  }

  try {
    let clientObject = null;

    // Fetch client details only if continuationToken is not provided (first request)
    if (!continuationToken) {
      const flashbackDetails = await getUserFlashbackDetailsById_Creator(flashbackId);
      clientObject = await getUserObjectByUserPhoneNumber(flashbackDetails.user_phone_number);
    }

    // Configure S3 list parameters
    const listParams = {
      Bucket: bucketName,
      Prefix: `${flashbackId}/`,
      MaxKeys: 500 // Fetch 100 images at a time
    };

    // Validate and add ContinuationToken if it's provided
    if (continuationToken) {
      console.log("Received continuationToken:", continuationToken); // Log the token
      listParams.ContinuationToken = continuationToken;
    }

    // Fetch S3 objects
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    const objectUrls = listedObjects.Contents.map(obj => `https://${bucketName}.s3.amazonaws.com/${obj.Key}`);

    // Log the next continuation token
    console.log("Next continuationToken:", listedObjects.NextContinuationToken);

    // Return the response with images, total images, and client details (if fetched)
    res.json({
      images: objectUrls,
      totalImages: listedObjects.KeyCount || listedObjects.Contents.length,
      lastEvaluatedKey: listedObjects.NextContinuationToken,
      clientObj: clientObject
    });
  } catch (error) {
    console.error('Error fetching S3 URLs or client details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get("/getUserFlashbackDetailsById/:flashbackId/:userPhoneNumber", async (req, res) => {
  const flashbackId = req.params.flashbackId;
  const userPhoneNumber = req.params.userPhoneNumber;

  // Validate input
  if (!flashbackId || typeof flashbackId !== "string") {
    logger.info("Invalid flashbackId provided");
    return res.status(400).send({ message: "Invalid flashbackId" });
  }

  logger.info(`Fetching flashback details for ${flashbackId}`);

  try {
    const flashbackDetails = await getUserFlashbackDetailsById_UserPhoneNumber(flashbackId,userPhoneNumber);

    if (flashbackDetails) {
      logger.info(`Fetched flashback details for ${flashbackId}`);
      res.status(200).json({ data: flashbackDetails });
    } else {
      logger.info("Flashback not found:", flashbackId);
      res.status(404).send({ message: "Flashback not found" });
    }
  } catch (err) {
    logger.error(`Error fetching flashback details for ${flashbackId}: ${err.message}`);
    res.status(500).send({ message: "Internal Server Error", details: err.message });
  }
});

const getUserFlashbackDetailsById_UserPhoneNumber = async (flashbackId,userPhoneNumber) => {
  const eventParams = {
    TableName: userFlashbackDetailsTable,
    Key: {
       flashback_id: flashbackId,
       user_phone_number:userPhoneNumber
      },
  };

  try {
    const result = await docClient.get(eventParams).promise();
    return result.Item || null; // Return the item or null if not found
  } catch (err) {
    throw new Error(`Error fetching flashback details: ${err.message}`);
  }
};

const getUserFlashbackDetailsById_Creator = async (flashbackId) => {
  const eventParams = {
    TableName: userFlashbackDetailsTable,
    KeyConditionExpression: "flashback_id = :flashbackId",
    FilterExpression: "access_level = :accessLevel",
    ExpressionAttributeValues: {
      ":flashbackId": flashbackId,
      ":accessLevel": "creator",
    },
  };

  try {
    const result = await docClient.query(eventParams).promise();

    // Return the first item that matches or null if not found
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  } catch (err) {
    throw new Error(`Error fetching flashback details: ${err.message}`);
  }
};

const getUserFlashbackOwners = async (flashbackId) => {
  const eventParams = {
    TableName: userFlashbackDetailsTable,
    KeyConditionExpression: "flashback_id = :flashbackId",
    ExpressionAttributeValues: {
      ":flashbackId": flashbackId
    }
  };

  try {
    const result = await docClient.query(eventParams).promise();

   
    return result.Items;
  } catch (err) {
    throw new Error(`Error fetching flashback details: ${err.message}`);
  }
};


app.get('/getPeopleFromFlashbacks/:userPhoneNumber/:userId', async (req, res) => {
  const { userPhoneNumber, userId } = req.params;
  
  try {
    // First, get the user's own face URL using userId
    const userParams = {
      TableName: 'RekognitionUsersData',
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    const userResult = await docClient.query(userParams).promise();
    const userData = userResult.Items && userResult.Items.length > 0 ? userResult.Items[0] : null;

    // Then proceed with getting related people
    const flashbackParams = {
      TableName: userFlashbackDetailsTable,
      IndexName: 'user_phone_number-index',
      KeyConditionExpression: 'user_phone_number = :phoneNumber',
      FilterExpression: 'access_level = :accessLevel',
      ExpressionAttributeValues: {
        ':phoneNumber': userPhoneNumber,
        ':accessLevel': 'creator'
      }
    };

    const flashbackResult = await docClient.query(flashbackParams).promise();
    const folderNames = [...new Set(flashbackResult.Items.map(item => item.folder_name))];
    
    const userIdsPromises = folderNames.map(async folderName => {
      const params = {
        TableName: indexedDataTableName,
        IndexName: 'folder_name-user_id-index',
        KeyConditionExpression: 'folder_name = :folderName',
        ProjectionExpression: 'user_id',
        ExpressionAttributeValues: {
          ':folderName': folderName
        }
      };
      
      const result = await docClient.query(params).promise();
      return result.Items.map(item => item.user_id);
    });
    
    const userIdsNestedArray = await Promise.all(userIdsPromises);
    const uniqueUserIds = [...new Set(userIdsNestedArray.flat())];
    
    // Filter out the user's own ID
    const filteredUserIds = uniqueUserIds.filter(id => id !== userId);
    
    const faceUrlsPromises = filteredUserIds.map(async userId => {
      const params = {
        TableName: 'RekognitionUsersData',
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      };
      
      const result = await docClient.query(params).promise();
      if (result.Items && result.Items.length > 0) {
        return {
          userId: userId,
          faceUrl: result.Items[0].face_url,
          name: result.Items[0].name || result.Items[0].user_name || 'Unknown'
        };
      }
      return null;
    });
    
    const relatedFaceUrls = (await Promise.all(faceUrlsPromises)).filter(Boolean);
    
    res.json({
      success: true,
      data: {
        mainUser: userData ? {
          userId: userData.user_id,
          faceUrl: userData.face_url,
          name: userData.name || userData.user_name || 'You'
        } : null,
        relations: relatedFaceUrls
      }
    });
    
  } catch (error) {
    logger.error('Error in getPeopleFromFlashbacks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch people relations'
    });
  }
});

app.delete('/deleteFlashbackImages/:flashbackId', async (req, res) => {
  const { flashbackId } = req.params;
  const { imageUrls, userPhoneNumber } = req.body;

  if (!flashbackId || !imageUrls || !Array.isArray(imageUrls) || !userPhoneNumber) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters. Required: flashbackId and array of imageUrls' 
    });
  }

  try {
    // Check if user has creator access
    const flashbackDetails = await getUserFlashbackDetailsById_Creator(flashbackId);
    
    if (!flashbackDetails || flashbackDetails.user_phone_number !== userPhoneNumber) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete images from this flashback'
      });
    }

    // Extract S3 keys from image URLs
    const s3Keys = imageUrls.map(url => {
      const urlParts = url.split('.s3.amazonaws.com/');
      return urlParts[1];
    });

    // Prepare delete parameters for both buckets
    const deleteParams = {
      original: {
        Bucket: indexBucketName,
        Delete: {
          Objects: s3Keys.map(key => ({ Key: key })),
          Quiet: false
        }
      },
      thumbnail: {
        Bucket: thumbnailBucketName,
        Delete: {
          Objects: s3Keys.map(key => ({ Key: key })),
          Quiet: false
        }
      }
    };

    // Delete objects from both buckets concurrently
    const [originalResult, thumbnailResult] = await Promise.all([
      s3.deleteObjects(deleteParams.original).promise(),
      s3.deleteObjects(deleteParams.thumbnail).promise()
    ]);

    // Combine errors from both operations
    const allErrors = [
      ...(originalResult.Errors || []).map(error => ({
        ...error,
        bucket: 'original'
      })),
      ...(thumbnailResult.Errors || []).map(error => ({
        ...error,
        bucket: 'thumbnail'
      }))
    ];

    // Calculate total successfully deleted items
    const totalDeleted = (originalResult.Deleted?.length || 0) + 
                        (thumbnailResult.Deleted?.length || 0);

    if (allErrors.length > 0) {
      // Some deletions failed
      console.error('Some images failed to delete:', allErrors);
      return res.status(207).json({
        success: true,
        message: 'Some images failed to delete',
        errors: allErrors,
        deleted: {
          original: originalResult.Deleted || [],
          thumbnail: thumbnailResult.Deleted || [],
          totalCount: totalDeleted
        }
      });
    }

    // All deletions successful
    res.json({
      success: true,
      message: `Successfully deleted ${totalDeleted} images`,
      deleted: {
        original: originalResult.Deleted || [],
        thumbnail: thumbnailResult.Deleted || [],
        totalCount: totalDeleted
      }
    });

  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: error.message
    });
  }
});

app.get('/get-relations/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;

  try {
    const params = {
      TableName: 'Relations',
      KeyConditionExpression: 'user_phone_number = :phone',
      ExpressionAttributeValues: {
        ':phone': userPhoneNumber
      }
    };

    const result = await docClient.query(params).promise();

    res.json({
      success: true,
      relations: result.Items || []
    });
  } catch (error) {
    logger.error('Error fetching relations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch relations'
    });
  }
});

// Update or create a relation
app.post('/update-relation', async (req, res) => {
  const { 
    user_phone_number, 
    related_user_id,
    name,
    relation_type,
    is_starred = false,
    gender = null,
    related_user_phone = null
  } = req.body;

  if (!user_phone_number || !related_user_id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  try {
    // First check if the relationship already exists
    const getParams = {
      TableName: 'Relations',
      Key: {
        user_phone_number,
        related_user_id
      }
    };

    const existingRelation = await docClient.get(getParams).promise();

    // Prepare the new or updated relation item
    const relationItem = {
      user_phone_number,
      related_user_id,
      name: name || (existingRelation.Item?.name || null),
      relation_type: relation_type || (existingRelation.Item?.relation_type || null),
      is_starred: is_starred || (existingRelation.Item?.is_starred || false),
      gender: gender || (existingRelation.Item?.gender || null),
      last_updated: new Date().toISOString()
    };

    if (related_user_phone) {
      relationItem.related_user_phone = related_user_phone;
    } else if (existingRelation.Item?.related_user_phone) {
      // Keep existing related_user_phone if it exists
      relationItem.related_user_phone = existingRelation.Item.related_user_phone;
    }
    // Save to DynamoDB
    const putParams = {
      TableName: 'Relations',
      Item: relationItem
    };

    await docClient.put(putParams).promise();

    // If successful, return the updated relation
    res.json({
      success: true,
      relation: relationItem
    });

  } catch (error) {
    logger.error('Error updating relation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update relation'
    });
  }
});

// Toggle star status for a relation
app.post('/toggle-star', async (req, res) => {
  const { user_phone_number, related_user_id } = req.body;

  if (!user_phone_number || !related_user_id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  try {
    // Get existing relation first
    const getParams = {
      TableName: 'Relations',
      Key: {
        user_phone_number,
        related_user_id
      }
    };

    const existingRelation = await docClient.get(getParams).promise();
    
    if (!existingRelation.Item) {
      // Create new relation if it doesn't exist
      const newRelation = {
        user_phone_number,
        related_user_id,
        is_starred: true,
        last_updated: new Date().toISOString()
      };

      const putParams = {
        TableName: 'Relations',
        Item: newRelation
      };

      await docClient.put(putParams).promise();

      return res.json({
        success: true,
        relation: newRelation
      });
    }

    // Toggle existing relation's star status
    const updateParams = {
      TableName: 'Relations',
      Key: {
        user_phone_number,
        related_user_id
      },
      UpdateExpression: 'SET is_starred = :star, last_updated = :updated',
      ExpressionAttributeValues: {
        ':star': !existingRelation.Item.is_starred,
        ':updated': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await docClient.update(updateParams).promise();

    res.json({
      success: true,
      relation: result.Attributes
    });

  } catch (error) {
    logger.error('Error toggling star status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle star status'
    });
  }
});


async function getUserDetailsByUserId(userId) {
  const params = {
    TableName: 'flashback_mobile_users',
    IndexName: 'user_id-index',
    KeyConditionExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId':userId
    }
  };
  const result = await docClient.query(params).promise();
  return result.Items?.[0];
}
const GLOBAL_TO_LOCAL_MAPPING_TABLE = 'global_to_local_user_mapping';

async function getMappingByUserAndCollection(localUserId) {
  // If localUserId is the partition key and collectionName is the sort key:
  const params = {
    TableName: GLOBAL_TO_LOCAL_MAPPING_TABLE,
    IndexName:'local_user_id-index',
    KeyConditionExpression: 'local_user_id = :u',
    ExpressionAttributeValues: {
      ':u': localUserId
    },
    Limit: 1
  };

  const result = await docClient.query(params).promise();
  if(result.Items.length>0){
    logger.info("Found and existing user")
  }
  
  // If any Items returned, we have a match
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

async function mapGlobalToLocalUser( user_id, face_id, collection_name ) {
  try {
    // 0. Check if (user_id, collection_name) already exists
    const existingMapping = await getMappingByUserAndCollection(user_id, collection_name);
    if (existingMapping) {
      logger.info(`Mapping already exists for user_id=${user_id}, collection_name=${collection_name}`);
      return {
        success: false,
        message: 'This user_id and collection_name combination is already mapped.'
      };
    }

    // 1. Make the external API call
    const response = await axios.post('http://localhost:8000/compare_with_global', {
      user_id,
      face_id,
      collection_name:'test_prod'
      //collection_name: "User"+collection_name,
    });

    // 2. Check for 'matched_user_id' in the response
    const { matched_user_id } = response.data;
    if (!matched_user_id) {
      logger.info('No matched_user_id in external API response...');
      return ;
    }
    logger.info('matched_user_id found in external API response. Exiting...');
    // 3. We have matched_user_id, so let's get more user details from local method
    const userDetails = await getUserDetailsByUserId(user_id);
    if (!userDetails) {
      logger.warn(`No user details found for user_id: ${user_id}`);
    }

    const userPhoneNumber = userDetails?.user_phone_number ; // or however you structure user details

    // 4. Store the mapping details in 'global_to_local_user_mapping' table
    const now = new Date().toISOString();
    const itemToStore = {
      local_user_id: user_id,             // your internal user ID
      folder_name: collection_name,  // used as the sort key
      global_user_id: matched_user_id,    // the ID from external
      face_id: face_id,
      user_phone_number: userPhoneNumber,
      created_at: now
    };

    // Put the record
    const params = {
      TableName: GLOBAL_TO_LOCAL_MAPPING_TABLE,
      Item: itemToStore
    };
    await docClient.put(params).promise();

    logger.info('Successfully stored mapping in global_to_local_user_mapping');

    return {
      success: true,
      data: itemToStore
    };
  } catch (error) {
    logger.error('Error in mapGlobalToLocalUser:', error);
    throw error;
  }
}

async function getAllRegisteredUsers() {
  let allUsers = [];
  let lastEvaluatedKey = null;

  do {
    const params = {
      TableName: 'flashback_mobile_users',
      // If you only want certain attributes, specify ProjectionExpression
      ExclusiveStartKey: lastEvaluatedKey
    };

    const result = await docClient.scan(params).promise();
    allUsers.push(...(result.Items || []));
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return allUsers;
}

async function getMappingByGlobalUserAndCollection(user_id, collection_name) {
  const params = {
    TableName: 'global_to_local_user_mapping',
    Key: {
      global_user_id: user_id,
      folder_name: collection_name
    }
  };
  const result = await docClient.get(params).promise();
  return result.Item; // undefined if not found
}

async function mapAllRegisteredUsersToGlobal(collection_name) {
  try {
    // 1) Fetch all users
    const registeredUsers = await getAllRegisteredUsers();
    logger.info(`Found ${registeredUsers.length} users in flashback_users`);

    // We'll store local->global mapping in an object or Map
    const userMap = {};

    // 2) Loop over each user
    for (const user of registeredUsers) {
      const user_id = user.user_id;
      if (!user_id) {
        // Skip entries without a user_id
        continue;
      }

      // 2a) Check if (user_id, collection_name) mapping already exists
      const existingMapping = await getMappingByGlobalUserAndCollection(user_id, collection_name);
      if (existingMapping) {
        logger.info(`Mapping already exists for user_id=${user_id}, collection_name=${collection_name}`);
        userMap[existingMapping.local_user_id] = existingMapping;
        continue;
      }

      // 3) If no existing mapping, call external API
      //    (Adjust the endpoint & payload as needed.)
      const response = await axios.post("https://52.66.187.182:3000/compare_with_local/", {
        user_id:user_id,
        // If the external API needs a face_id, you must retrieve it or adapt accordingly.
        // For now, we demonstrate only passing user_id + collection_name.
        collection_name: "User"+collection_name
      },
      {
        httpsAgent: httpsAgent, // Pass the custom HTTPS agent
      });

      const { matched_user_id } = response.data;
      if (!matched_user_id) {
        logger.info(`No matched_user_id returned for user_id=${user_id}. Skipping save.`);
        continue;
      }

      const usersParams = {
        TableName: 'flashback_mobile_users',
        IndexName: 'user_id-index',
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': user_id
        }
      };
      const userResult = await docClient.query(usersParams).promise();
      const userData = userResult.Items && userResult.Items.length > 0 ? userResult.Items[0] : null;

      logger.info(`matched_user_id = ${matched_user_id} for user_id = ${user_id}`);

      // 4) Save the mapping
      const now = new Date().toISOString();
      const itemToStore = {
        local_user_id: matched_user_id,
        folder_name: collection_name,
        global_user_id: user_id,
        created_at: now,
        user_phone_number:userData ? userData.user_phone_number : null
      };

      // If the external API needs user details, you could fetch them from your local DB:
      // e.g., const userDetails = await getUserDetailsByUserId(user_id);

      const putParams = {
        TableName: 'global_to_local_user_mapping',
        Item: itemToStore
      };
      await docClient.put(putParams).promise();

      logger.info(`Stored mapping for global_user_id=${user_id}, local_user_id=${matched_user_id}`);
      userMap[matched_user_id] = itemToStore;
    }

    // 5) Return a map of local -> global user IDs
    return userMap;
  } catch (error) {
    logger.error('Error in mapAllRegisteredUsersToGlobal:', error);
    throw error;
  }
}

app.get('/getPeopleFromDevice/:userPhoneNumber/:userId', async (req, res) => {
  const { userPhoneNumber, userId } = req.params;

  try {
    // --- 1) Get the main user's data ---
    const userParams = {
      TableName: 'machinevision_recognition_users_data',
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    const userResult = await docClient.query(userParams).promise();
    const userData = userResult.Items && userResult.Items.length > 0 ? userResult.Items[0] : null;

    // --- 2) Get relation info (e.g., isStarred, name, etc.) ---
    const fullPhoneNumber = '+'+userPhoneNumber
    const relationsParams = {
      TableName: 'Relations',
      KeyConditionExpression: 'user_phone_number = :phone',
      ExpressionAttributeValues: {
        ':phone': fullPhoneNumber
      }
    };

    const relationsResult = await docClient.query(relationsParams).promise();
    const relationsMap = new Map(
      relationsResult.Items.map(item => [item.related_user_id, item])
    );

    // --- 3) Query indexed data (with pagination) ---
    const indexedDataParams = {
      TableName: 'machinevision_indexed_data',
      IndexName: 'folder_name-index',
      KeyConditionExpression: 'folder_name = :folderName',
      ProjectionExpression: 'user_id, face_id, user_id_original',
      ExpressionAttributeValues: {
        ':folderName': userPhoneNumber
      }
    };

    let allItems = [];
    let lastEvaluatedKey = null;

    do {
      if (lastEvaluatedKey) {
        indexedDataParams.ExclusiveStartKey = lastEvaluatedKey;
      }

      const indexedDataResult = await docClient.query(indexedDataParams).promise();
      const items = indexedDataResult.Items || [];

      allItems.push(...items);
      lastEvaluatedKey = indexedDataResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // --- 4) Build a map of user_id -> number of photos ---
    const userPhotoCountMap = new Map();

    for (const item of allItems) {
      // Only count items if user_id_original is NOT present
      if (!item.user_id_original) {
        const currentCount = userPhotoCountMap.get(item.user_id) || 0;
        userPhotoCountMap.set(item.user_id, currentCount + 1);
      }
    }

    // --- 5) Create an array of other user IDs, excluding the main user's ID ---
    const uniqueUserIds = [...userPhotoCountMap.keys()].filter((id) => id !== userId);

    // --- 6) If needed, map all registered users to get userPhoneNumber, etc. ---
    let globalUserMap = {};
    if (uniqueUserIds.length > 0) {
      globalUserMap = await mapAllRegisteredUsersToGlobal(userPhoneNumber);
    }

    // --- 7) Get hidden users for this phone number ---
    let hiddenUserIds = [];
    try {
      const hiddenUsersParams = {
        TableName: 'hidden_users',
        KeyConditionExpression: 'user_phone_number = :phone',
        ExpressionAttributeValues: {
          ':phone': userPhoneNumber
        }
      };

      const hiddenUsersResult = await docClient.query(hiddenUsersParams).promise();
      hiddenUserIds = hiddenUsersResult.Items.map(item => item.hidden_user_id);

      logger.info(`Found ${hiddenUserIds.length} hidden users for ${userPhoneNumber}`);
    } catch (error) {
      logger.error('Error fetching hidden users:', error);
      // Continue execution even if this fails
    }

    // --- 8) Fetch streak data from UserRelationships ---
    let streakMap = new Map();
    if (uniqueUserIds.length > 0) {
      const streakParams = {
        TableName: 'UserRelationships',
        KeyConditionExpression: 'user_phone_number = :phone',
        ExpressionAttributeValues: { ':phone': fullPhoneNumber }
      };
      const streakResult = await docClient.query(streakParams).promise();
      streakMap = new Map(
        streakResult.Items.map(item => [
          item.related_user_id,
          {
            streak: item.currentStreak,
            highestStreak: item.highestStreak,
            lastInteractionDate: item.lastInteractionDate,
            totalDaysInteracted: item.totalDaysInteracted,
            totalMemoriesCreated: item.totalMemoriesCreated,
            totalMemoriesShared: item.totalMemoriesShared
          }
        ])
      );
    }

    // --- 9) Build the 'people' array ---
    const peoplePromises = uniqueUserIds.map(async otherUserId => {
      // Get user data from recognition table
      const recognitionParams = {
        TableName: 'machinevision_recognition_users_data',
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': otherUserId
        }
      };

      const recognitionResult = await docClient.query(recognitionParams).promise();
      if (!recognitionResult.Items || recognitionResult.Items.length === 0) {
        return null;
      }

      const recognitionData = recognitionResult.Items[0];
      const userMappingData = globalUserMap[otherUserId] || null;
      const streakData = streakMap.get(otherUserId) || {
        streak: null,
        highestStreak: null,
        lastInteractionDate: null,
        totalDaysInteracted: null,
        totalMemoriesCreated: null,
        totalMemoriesShared: null
      };

      try {
        let faceUrl = recognitionData.face_url;
        if (faceUrl && faceUrl.startsWith('s3://')) {
          const bucketAndKey = faceUrl.replace('s3://', '');
          const [bucket, ...keyParts] = bucketAndKey.split('/');
          faceUrl = `https://${bucket}.s3.ap-south-1.amazonaws.com/${keyParts.join('/')}`;
        }

        const relationData = relationsMap.get(otherUserId) || {};
        const photoCount = userPhotoCountMap.get(otherUserId) || 0;

        return {
          userId: otherUserId,
          faceUrl,
          name: relationData.name || userData?.org_name || userData?.user_name,
          relationName: relationData.name || null,
          relationshipType: relationData.relation_type || null,
          gender: relationData.gender || null,
          isStarred: relationData.is_starred || false,
          userPhoneNumber: userMappingData?.user_phone_number || null,
          isHidden: hiddenUserIds.includes(otherUserId),
          photoCount,
          streak: streakData.streak,
          highestStreak: streakData.highestStreak,
          lastInteractionDate: streakData.lastInteractionDate,
          totalDaysInteracted: streakData.totalDaysInteracted,
          totalMemoriesCreated: streakData.totalMemoriesCreated,
          totalMemoriesShared: streakData.totalMemoriesShared
        };
      } catch (error) {
        logger.error(`Error fetching user data for ${otherUserId}:`, error);

        // Return minimal data if something fails
        let faceUrl = recognitionData.face_url;
        if (faceUrl && faceUrl.startsWith('s3://')) {
          const bucketAndKey = faceUrl.replace('s3://', '');
          const [bucket, ...keyParts] = bucketAndKey.split('/');
          faceUrl = `https://${bucket}.s3.ap-south-1.amazonaws.com/${keyParts.join('/')}`;
        }

        const relationData = relationsMap.get(otherUserId) || {};
        const photoCount = userPhotoCountMap.get(otherUserId) || 0;

        return {
          userId: otherUserId,
          faceUrl,
          name: relationData.name || userData?.org_name || userData?.user_name,
          relationName: relationData.name || null,
          relationshipType: relationData.relation_type || null,
          gender: relationData.gender || null,
          isStarred: relationData.is_starred || false,
          userPhoneNumber: null,
          isHidden: hiddenUserIds.includes(otherUserId),
          photoCount,
          streak: streakData.streak,
          highestStreak: streakData.highestStreak,
          lastInteractionDate: streakData.lastInteractionDate,
          totalDaysInteracted: streakData.totalDaysInteracted,
          totalMemoriesCreated: streakData.totalMemoriesCreated,
          totalMemoriesShared: streakData.totalMemoriesShared
        };
      }
    });

    // Resolve all promises in parallel
    let people = (await Promise.all(peoplePromises)).filter(Boolean);

    // --- 10) Sort by Fav > Reg > Others > Hidden, then by photoCount desc ---
    // If isHidden, that user goes to the Hidden category.
    const getCategory = (person) => {
      if (person.isHidden) return 3;         // Hidden
      if (person.isStarred) return 0;        // Favourites
      if (person.userPhoneNumber) return 1;  // Registered
      return 2;                              // Others
    };

    people.sort((a, b) => {
      // Compare categories
      const catA = getCategory(a);
      const catB = getCategory(b);
      if (catA !== catB) {
        return catA - catB;
      }
      // If same category, sort by photoCount descending
      return b.photoCount - a.photoCount;
    });

    // --- 11) Determine mainUser's photoCount (if any) ---
    // We *did* filter out mainUser from uniqueUserIds, but mainUser might still appear in userPhotoCountMap
    const mainUserCount = userPhotoCountMap.get(userId) || 0;

    // --- 12) Prepare mainUser's response with a proper faceUrl ---
    let faceUrl = userData?.face_url;
    if (faceUrl && faceUrl.startsWith('s3://')) {
      const bucketAndKey = faceUrl.replace('s3://', '');
      const [bucket, ...keyParts] = bucketAndKey.split('/');
      faceUrl = `https://${bucket}.s3.ap-south-1.amazonaws.com/${keyParts.join('/')}`;
    }

    // --- 13) Return the final response ---
    res.json({
      success: true,
      data: {
        mainUser: userData
          ? {
              userId: userData.user_id,
              faceUrl: faceUrl,
              name: 'You',
              photoCount: mainUserCount // pass the main user's photo count too
            }
          : null,
        relations: people // each person already has photoCount
      }
    });
  } catch (error) {
    logger.error('Error in getPeopleFromDevice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch people from device'
    });
  }
});


app.post('/hide-users', async (req, res) => {
  const { user_phone_number, user_ids_to_hide } = req.body;
  
  if (!user_phone_number || !user_ids_to_hide || !Array.isArray(user_ids_to_hide) || user_ids_to_hide.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request parameters'
    });
  }
  
  try {
    // Create a batch of PutRequest items for the hidden_users table
    const timestamp = new Date().toISOString();
    const putRequests = user_ids_to_hide.map(userId => ({
      PutRequest: {
        Item: {
          user_phone_number: user_phone_number,
          hidden_user_id: userId,
          hidden_at: timestamp
        }
      }
    }));
    
    // Use BatchWriteItem for efficiency
    const params = {
      RequestItems: {
        'hidden_users': putRequests
      }
    };
    
    await docClient.batchWrite(params).promise();
    
    res.json({
      success: true,
      message: 'Users hidden successfully'
    });
  } catch (error) {
    logger.error('Error hiding users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to hide users'
    });
  }
});

// 2. Endpoint to unhide users
app.post('/unhide-users', async (req, res) => {
  const { user_phone_number, user_ids_to_unhide } = req.body;
  
  if (!user_phone_number || !user_ids_to_unhide || !Array.isArray(user_ids_to_unhide) || user_ids_to_unhide.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request parameters'
    });
  }
  
  try {
    // Create a batch of DeleteRequest items for the hidden_users table
    const deleteRequests = user_ids_to_unhide.map(userId => ({
      DeleteRequest: {
        Key: {
          user_phone_number: user_phone_number,
          hidden_user_id: userId
        }
      }
    }));
    
    // Use BatchWriteItem for efficiency
    const params = {
      RequestItems: {
        'hidden_users': deleteRequests
      }
    };
    
    await docClient.batchWrite(params).promise();
    
    res.json({
      success: true,
      message: 'Users unhidden successfully'
    });
  } catch (error) {
    logger.error('Error unhiding users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unhide users'
    });
  }
});



app.get('/userThumbnailsByFlashbackId/:flashbackId', async (req, res) => {
  const flashbackId = req.params.flashbackId;

  try {
    logger.info("Thumbnails are being fetched for flashback ID: " + flashbackId);


    // Fetch event details from the database without checking for existing thumbnails
    

    const flashbackDetailsResult = await getUserFlashbackDetailsById_Creator(flashbackId);

    if (!flashbackDetailsResult) {
      logger.info("No flashback details found for event ID: " + flashbackId);
      return res.status(404).send('flashback not found');
    }

  

    // Create folder name using event_name + client_name + event_id
    const folderName = flashbackDetailsResult.folder_name;
    logger.info("Constructed folder name: " + folderName);

    // Step 2: Query indexedDataTableName to get imageIds associated with the constructed folder name
    const params = {
      TableName: indexedDataTableName,
      IndexName: 'folder_name-user_id-index',
      ProjectionExpression: 'user_id, image_id, Gender_Value, AgeRange_Low, AgeRange_High',
      KeyConditionExpression: 'folder_name = :folderName',
      ExpressionAttributeValues: {
        ':folderName': folderName
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
        userCountMap.set(userId, { userId, count: 0, gender, age: 0 });
      }

      const userInfo = userCountMap.get(userId);
      userInfo.count += 1;
      if (ageLow && ageHigh) {
        userInfo.age = (userInfo.age + ((ageLow + ageHigh) / 2)) / 2;
      }
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

    // Step 5: Check if user_id from thumbnailObject exists in usersForEvent and modify thumbnailObject
    for (const thumbnail of thumbnailObject) {
  
        const userObj = await getUserObjectByUserId(thumbnail.user_id);
        if(userObj){
          thumbnail.is_registered = true;
          mapUserToFlashback(flashbackId,userObj.user_phone_number,thumbnail.user_id);
          logger.info(`Thumbnail with image_id ${thumbnail.user_id} is registered.`);
        }else{
          thumbnail.is_registered = false;
          logger.info(`Thumbnail with image_id ${thumbnail.user_id} is unregistered.`);
        }
       
      
    }

    // Step 3: Fetch users for the event
   // const usersForEvent = await getUsersForEvent(folderName);

    // Step 4: Check if user_id exists and map if necessary
    // for (const user of usersForEvent) {
    //   if (!user.user_id) {
    //     const userObj = await getUserObjectByUserPhoneNumber(user.user_phone_number)
    //     const phoneNumber = user.user_phone_number; // Adjust according to your user data structure
    //     const imageUrl = userObj.potrait_s3_url; // Adjust according to your user data structure
    //     console.log("mapping user_id with phone Number : ",phoneNumber)
    //     try {
    //       const result = await mapUserIdAndPhoneNumber(phoneNumber, imageUrl, eventName, user.user_id,false);
    //       if (result && result.Attributes && result.Attributes.user_id) {
    //         user.user_id = result.Attributes.user_id; // Update the user with the mapped user_id
    //         logger.info(`Mapped user_id ${user.user_id} for phone number ${phoneNumber}`);
    //       } else {
    //         logger.info(`No user_id found for phone number ${phoneNumber} using imageUrl ${imageUrl}`);
    //       }
    //     } catch (error) {
    //       logger.error(`Error mapping user_id for phone number ${phoneNumber}: ${error.message}`);
    //     }
    //   }
    // }

    // Create a Set of user_ids from usersForEvent for quick lookup
    // const userIdsSet = new Set(usersForEvent.map(user => user.user_id));

    
    


    // // Step 6: Store the modified thumbnailObject in eventsDetailsTable using eventId
    // const updateParams = {
    //   TableName: eventsDetailsTable,
    //   Key: {
    //     event_id: eventId,
    //     event_date: eventDetailsResult.Item.event_date // Ensure you fetch event_date in the ProjectionExpression if needed
    //   },
    //   UpdateExpression: 'set userThumbnails = :thumbnails',
    //   ExpressionAttributeValues: {
    //     ':thumbnails': thumbnailObject
    //   },
    //   ReturnValues: 'UPDATED_NEW'
    // };

   // await docClient.update(updateParams).promise();
   // logger.info("User thumbnails updated with registration status and saved for event ID: " + eventId);

    // Respond with the modified thumbnailObject
    res.json(thumbnailObject);

  } catch (err) {
    logger.error("Error in fetching thumbnails for event ID: " + eventId, err);
    res.status(500).send('Error getting thumbnails for the event ID: ' + eventId);
  }
});

const mapUserToFlashback = async (flashbackId, userPhoneNumber, userId) => {
  const updateParamsUserEvent = {
    TableName: userFlashbackMapping,
    Item: {
      flashback_id: flashbackId,
      user_phone_number: userPhoneNumber,
      created_date: new Date().toISOString(),
      user_id: userId
    }
  };

  try {
    const putResult = await docClient.put(updateParamsUserEvent).promise();
    logger.info('Insert in user-flashback mapping is successful:', flashbackId);
    return { success: true, message: 'User-flashback mapping successful' };
  } catch (error) {
    logger.error('Error in user-flashback mapping:', error);
    throw new Error(error);
  }
};

app.post('/send-user-flashbacks', async (req, res) => {
  const { flashbackId } = req.body;

  // Start the flashback sending process asynchronously
  await sendUserFlashbacksAsync(flashbackId);
  res.json({ taskId });
});

async function getUserFlashbackMappings(flashbackId) {
  const params = {
    TableName: userFlashbackMappingTable,
    KeyConditionExpression: 'flashback_id = :flashbackId',
    ExpressionAttributeValues: {
      ':flashbackId': flashbackId,
    }
  };

  try {
    const result = await docClient.query(params).promise();
    return result.Items;
  } catch (error) {
    console.error('Error fetching user event mappings:', error);
    throw error;
  }
}
async function updateUserFlashbackDeliveryStatus(flashbackId, phoneNumber, flashback_status) {
  const params = {
    TableName: userFlashbackMappingTable,
    Key: {
      'flashback_id': { S: flashbackId },
      'user_phone_number': { S: phoneNumber }
    },
    UpdateExpression: 'SET flashback_status = :flashback_status',
    ExpressionAttributeValues: {
      ':flashback_status': { S: flashback_status }
    }
  };

  try {
    await dynamoDB.updateItem(params).promise();
    logger.info(`Successfully updated status for flashback: ${flashbackId}, phone: ${phoneNumber}`);
  } catch (error) {
    console.error('Error updating user event mapping:', error);
    throw error;
  }
}


async function sendUserFlashbacksAsync(flashbackId) {
  try {
    const usersForFlashback = await getUserForEvent(flashbackId);
    const userFlashbackMappings = await getUserFlashbackMappings(flashbackId);
    const flashbackDetails = await getUserFlashbackDetailsById_Creator(flashbackId);
    logger.info(`Started sending Whatsapp Messages for event: ${flashbackId}`); // Log the start of the process

    let status = 'Flashbacks_Fully_Delivered';
    let sentUsers = 0; // Initialize sentUsers to track the number of messages sent successfully

    // Create a map of userEventMappings with user_phone_number as key
    const userFlashbackMappingMap = new Map();
    for (const mapping of userFlashbackMappings) {
      if(mapping && mapping.user_phone_number)
        userFlashbackMappingMap.set(mapping.user_phone_number, mapping);
    }
    logger.info(`Created user flashback mapping map with ${userFlashbackMappingMap.size} entries`); // Log the size of the mapping map

    for (const userId of usersForFlashback) {
      const userData = await getUserObjectByUserId(userId);
      if(!userData){
        logger.info("User id is not a registered user : ",userId);
        continue;
      }
      const user_phone_number = userData.user_phone_number;

      logger.info(`Processing user: ${user_phone_number}`); // Log the user being processed

      // Check if userEventMappings has an entry with user_phone_number
      const existingMapping = userFlashbackMappingMap.get(user_phone_number);
      const isUserMapped = !!existingMapping;

      if (!isUserMapped) {
        //logger.info(`User ${user_phone_number} is already mapped to flashback ${eventName}`); // Log if the user is already mapped
        await mapUserToFlashback(flashbackId, user_phone_number, userData.user_id);
        logger.info(`Mapped user ${user_phone_number} to flashback ${flashbackId}`); // Log the mapping action
      }

      if (userData && userData.user_id && userData.potrait_s3_url && 
          (!isUserMapped || (isUserMapped && existingMapping.flashback_status !== 'Flashback_Delivered'))) {
        try {
          //await sendWhatsAppMessage(user_phone_number, eventName, userData.user_id);

          await whatsappSender.sendMessage(user_phone_number,flashbackId, flashbackDetails.flashback_name, userData.user_id);

          await updateUserFlashbackDeliveryStatus(flashbackId, user_phone_number, 'Flashback_Delivered');

          await storeSentData(user_phone_number, flashbackId, `https://flashback.inc/photosV1/${flashbackId}/${userData.user_id}`);

          logger.info(`Successfully sent WhatsApp message to ${user_phone_number}`); 
        } catch (error) {
          logger.error(`Error sending message to ${user_phone_number}: ${error.message}`); // Log error in sending message
        }
      } else {
        logger.info(`Skipping user ${user_phone_number} as message is already delivered or user is not eligible`); // Log if the user is skipped
      }
    }

    await updateEventFlashbackStatus(eventName, 'triggered');
    logger.info(`Updated event flashback status for ${eventName} to 'triggered'`); // Log the event status update

    // Mark task as completed
    taskProgress.set(taskId, { progress: 100, status: 'completed' });
    logger.info(`Completed sending Whatsapp messages for event: ${eventName}, total users processed: ${sentUsers}`); // Log the completion of the process
  } catch (error) {
    logger.error(`Error sending flashbacks for event ${eventName}: ${error.message}`); // Log error in the entire process
    taskProgress.set(taskId, { progress: 0, status: 'failed' });
  }
}

app.post('/flashbackImages/:flashbackId/:userId', async (req, res) => {
  try {
   
    
     const flashbackId = req.params.flashbackId;
     const userId = req.params.userId;
     const isFavourites = req.body.isFavourites;
     const lastEvaluatedKey = req.body.lastEvaluatedKey;

    
     let isUserRegistered ;
     let clientName;
     let clientObject;
     let userObject;
        isUserRegistered = await checkIsUserRegistered(userId);
      
     // isUserRegistered = await checkIsUserRegistered(userId);
     logger.info("isUserRegistered: "+ isUserRegistered);
     if(!isUserRegistered)
      {
        logger.info("user doesnot exists... navigate to login page");
          res.status(700).send({"message":"Oh! You are not registered, please register to view photographs"})
      }else{
      logger.info("user exists:"+userId);
     logger.info("Image are being fetched for flashback  -> "+flashbackId+"; userId -> "+userId +"; isFavourites -> "+isFavourites);

    const result = await userEventImagesNew(flashbackId,userId,lastEvaluatedKey,isFavourites);
    logger.info("total"+result.Items.length)
    if(!lastEvaluatedKey && isFavourites){
      const flashbackDetails = await getUserFlashbackDetailsById_Creator(flashbackId);
      clientObject = await getUserObjectByUserPhoneNumber(flashbackDetails.user_phone_number);
    }
       
    
    result.Items.sort((a, b) => a.faces_in_image - b.faces_in_image);
      const imagesPromises = result.Items.map(async file => {
        const base64ImageData =  {
          "facesCount":file.faces_in_image,
          "thumbnailUrl":"https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/"+file.s3_url.split("amazonaws.com/")[1]
        }
           base64ImageData.url = file.s3_url;
         
          return base64ImageData;
      
    });
      const images = await Promise.all(imagesPromises);
      logger.info('total images fetched for the user -> '+userId+'  in flashbackId -> '+flashbackId +"isFavourites -> "+isFavourites+' : '+result.Count);
      res.json({"images":images, 'totalImages':result.Count,'lastEvaluatedKey':result.LastEvaluatedKey,'clientObj':clientObject,'userObj':userObject});
  }
  } catch (err) {
     logger.info("Error in S3 get", err);
      res.status(500).send('Error getting images from S3');
  }
});


const getUserIdFromPhone = async (userPhoneNumber) => {
  try {
    // Query your users table to get the user_id for this phone number
    const userParams = {
      TableName: 'users',
      KeyConditionExpression: 'user_phone_number = :phone',
      ExpressionAttributeValues: {
        ':phone': userPhoneNumber
      },
      ProjectionExpression: 'user_id'
    };

    const userResult = await docClient.query(userParams).promise();
    return userResult.Items[0]?.user_id;
  } catch (error) {
    console.error('Error getting user_id:', error);
    return null;
  }
};


app.get('/getUserMemoriesFeed/:userPhoneNumber', async (req, res) => {
  try {
    const userPhoneNumber = req.params.userPhoneNumber;
    const userId = await getUserIdFromPhone(userPhoneNumber);
    const limit = parseInt(req.query.limit) || 5;
    const lastEvaluatedKey = req.query.lastEvaluatedKey ? JSON.parse(req.query.lastEvaluatedKey) : undefined;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }

    // 1. Get user's flashbacks
    const flashbackParams = {
      TableName: 'user_flashbacks',
      IndexName: 'user_phone_number-index',
      KeyConditionExpression: 'user_phone_number = :phone',
      ExpressionAttributeValues: {
        ':phone': userPhoneNumber
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey
    };

    const flashbacksResult = await docClient.query(flashbackParams).promise();
    const flashbackIds = flashbacksResult.Items.map(item => item.flashback_id);

    // console.log('Flashbacks found:', {
    //   count: flashbacksResult.Items.length,
    //   flashbackIds
    // });

    // 2. Process each flashback to get memories
    const feedData = await Promise.all(flashbackIds.map(async (flashbackId) => {
      try {
        // console.log(`Processing flashback: ${flashbackId}`);

        // Get face images
        const facesParams = {
          TableName: indexedDataTableName,
          IndexName: 'folder_name-user_id-index',
          KeyConditionExpression: 'folder_name = :foldername',
          ExpressionAttributeValues: {
            ':foldername': flashbackId
          },
          ProjectionExpression: 's3_url, user_id, bounding_box, image_width, image_height'
        };

        // console.log('Querying faces with params:', facesParams);

        const facesResult = await docClient.query(facesParams).promise();

        const hiddenParams = {
          TableName: 'hidden_memories',
          IndexName: 'user_phone_number-index', // Use the GSI
          KeyConditionExpression: 'user_phone_number = :phone',
          ExpressionAttributeValues: {
            ':phone': userPhoneNumber,
          },
          ProjectionExpression: 'image_name',
        };
        
        const hiddenResult = await docClient.query(hiddenParams).promise();
        if (!hiddenResult || !hiddenResult.Items) {
          console.warn(`No hidden memories found for user ${userPhoneNumber}`);
          return [];
      }
      
        const hiddenImages = new Set((hiddenResult.Items || []).map((item) => item.image_name));        

        const visibleFaces = facesResult.Items.filter(
          (item) => !hiddenImages.has(item.s3_url.split('/').pop())
        );
        
        // console.log(`Faces found for flashback ${flashbackId}:`, {
        //   count: facesResult.Items.length,
        //   sample: facesResult.Items.slice(0, 2)
        // });

        // Get location/scenery images
        const locationParams = {
          TableName: 'RekognitionImageProperties',
          FilterExpression: 'begins_with(object_key, :prefix) AND attribute_not_exists(user_ids)',
          ExpressionAttributeValues: {
            ':prefix': `${flashbackId}/`
          },
          ProjectionExpression: 'object_key, width, height'
        };

        // console.log('Querying locations with params:', locationParams);

        const locationResult = await docClient.scan(locationParams).promise();

        // console.log(`Locations found for flashback ${flashbackId}:`, {
        //   count: locationResult.Items.length
        // });

        // Create map of images to their users
        const imageUsersMap = new Map();
        facesResult.Items.forEach(item => {
          if (!imageUsersMap.has(item.s3_url)) {
            imageUsersMap.set(item.s3_url, new Set());
          }
          imageUsersMap.get(item.s3_url).add(item.user_id);
        });

        // console.log('Image Users Map created:', {
        //   totalImages: imageUsersMap.size,
        //   sampleEntry: Array.from(imageUsersMap.entries())[0]
        // });

        // Process face images with other users
        const faceImages = visibleFaces.map(item => ({
          type: 'face',
          imageUrl: item.s3_url,
          thumbnailUrl: `https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/${item.s3_url.split("amazonaws.com/")[1]}`,
          userId: item.user_id,
          dimensions: {
            width: item.image_width,
            height: item.image_height
          },
          boundingBox: item.bounding_box,
          // Add all other users who have this image
          otherUsers: Array.from(imageUsersMap.get(item.s3_url) || [])
            .filter(uid => uid !== item.user_id) // Exclude the current image's user
        }));

        // console.log('Processed face images:', {
        //   count: faceImages.length,
        //   sample: faceImages.slice(0, 2)
        // });

        // Process location images
        const locationImages = locationResult.Items.map(item => ({
          type: 'location',
          imageUrl: `https://flashbackimages.s3.ap-south-1.amazonaws.com/${item.object_key}`,
          thumbnailUrl: `https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/${item.object_key}`,
          dimensions: {
            width: item.width,
            height: item.height
          }
        }));
        // Group images by users
        const userImagesMap = new Map();
    
        faceImages.forEach(image => {
          if (!userImagesMap.has(image.userId)) {
            userImagesMap.set(image.userId, []);
          }
          userImagesMap.get(image.userId).push(image);
        });
    
        const userImages = Array.from(userImagesMap.entries()).map(([userId, images]) => ({
          userId,
          images
        }));
    
        // Add location images as before
        if (locationImages.length > 0) {
          userImages.push({
            userId: 'locations',
            images: locationImages
          });
        }
    
        return {
          flashbackId,
          userImages,
          totalImages: faceImages.length + locationImages.length,
          totalUsers: userImagesMap.size + (locationImages.length > 0 ? 1 : 0),
          currentUserId: userPhoneNumber // Add this to help frontend identify current user
        };

        // return {
        //   flashbackId,
        //   userImages,
        //   totalImages: faceImages.length + locationImages.length,
        //   totalUsers: userImagesMap.size + (locationImages.length > 0 ? 1 : 0)
        // };

      } catch (error) {
        console.error(`Error processing flashback ${flashbackId}:`, error);
        return {
          flashbackId,
          userImages: [],
          totalImages: 0,
          totalUsers: 0,
          error: error.message
        };
      }
    }));

    // Filter out empty flashbacks
    const validFeedData = feedData.filter(item => item.totalImages > 0);

    // console.log('Final response data:', {
    //   totalFlashbacks: feedData.length,
    //   validFlashbacks: validFeedData.length
    // });

    res.json({
      success: true,
      feedData: validFeedData,
      pagination: {
        lastEvaluatedKey: flashbacksResult.LastEvaluatedKey ? 
          JSON.stringify(flashbacksResult.LastEvaluatedKey) : null,
        hasMore: !!flashbacksResult.LastEvaluatedKey
      }
    });

  } catch (error) {
    console.error('Error fetching memories feed:', error);
    res.status(error.code === 'ValidationException' ? 400 : 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});


app.post('/saveMemoryReaction', async (req, res) => {
  try {
    const { flashbackId, userId, reaction, userPhoneNumber, imageName, imageUrl } = req.body;

    const params = {
      TableName: 'memory_reactions',
      Item: {
        flashback_id: flashbackId,
        user_id: userId,
        reaction: reaction,
        user_phone_number: userPhoneNumber,
        image_name: imageName,
        imageUrl: imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    await docClient.put(params).promise();

    res.json({
      success: true,
      message: 'Reaction saved successfully'
    });

  } catch (error) {
    console.error('Error saving reaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save reaction'
    });
  }
});

app.get('/getMemoryReaction/:flashbackId/:imageName/:userPhoneNumber', async (req, res) => {
  try {
    const { flashbackId, imageName, userPhoneNumber } = req.params;

    const params = {
      TableName: 'memory_reactions',
      IndexName: 'flashback_image_user-index',  // Add this GSI
      KeyConditionExpression: 'flashback_id = :fid AND image_name = :iname',
      FilterExpression: 'user_phone_number = :phone',
      ExpressionAttributeValues: {
        ':fid': flashbackId,
        ':iname': imageName,
        ':phone': userPhoneNumber
      },
      ScanIndexForward: false, // Get most recent first
      Limit: 1
    };

    const result = await docClient.query(params).promise();

    res.json({
      success: true,
      reaction: result.Items?.[0] || null
    });

  } catch (error) {
    console.error('Error fetching reaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reaction'
    });
  }
});

app.post('/saveDeviceMemoryReaction', async (req, res) => {
  try {
    const { userPhoneNumber, image_id, userId, imageName, reaction } = req.body;

    const params = {
      TableName: 'device_memory_reactions',
      Item: {
        image_id: image_id,
        user_id: userId,
        image_name: imageName,
        user_phone_number: userPhoneNumber,
        reaction: reaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    await docClient.put(params).promise();

    res.json({
      success: true,
      message: 'Reaction saved successfully'
    });

  } catch (error) {
    console.error('Error saving reaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save reaction'
    });
  }
});

app.get('/getDeviceMemoryReaction/:imageId/:imageName/:userPhoneNumber', async (req, res) => {
  try {
    const {  imageId, imageName, userPhoneNumber } = req.params;

    const params = {
      TableName: 'device_memory_reactions',
      IndexName: 'image_id-image_name-index',
      KeyConditionExpression: 'image_id = :iId AND image_name = :iname',
      FilterExpression: 'user_phone_number = :upn',
      ExpressionAttributeValues: {
        ':iId': imageId,
        ':iname': imageName,
        ':upn': userPhoneNumber
      },
      ScanIndexForward: false, // Get most recent first
      Limit: 1
    };

    const result = await docClient.query(params).promise();

    res.json({
      success: true,
      reaction: result.Items?.[0] || null
    });

  } catch (error) {
    console.error('Error fetching reaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reaction'
    });
  }
});

app.get('/getDeviceMemories/:userPhoneNumber', async (req, res) => {
  try {
    const { userPhoneNumber } = req.params;

    // Input validation
    if (!userPhoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: userPhoneNumber'
      });
    }

    // Standardize phone number format (remove + if present)
    const cleanPhoneNumber = userPhoneNumber.replace('+', '');
    
    // Validation counters
    let totalIndexedDataCount = 0;
    let totalHiddenUsers = 0;
    let totalRelations = 0;
    let finalMemoriesCount = 0;

    // 1. Get all hidden users for this user
    const hiddenUsersParams = {
      TableName: 'hidden_users',
      KeyConditionExpression: 'user_phone_number = :phone',
      ExpressionAttributeValues: {
        ':phone': cleanPhoneNumber
      }
    };

    const hiddenUsersResult = await docClient.query(hiddenUsersParams).promise();
    // Create a Set of hidden user IDs for efficient lookup
    const hiddenUserIds = new Set(hiddenUsersResult.Items.map(item => item.hidden_user_id));
    totalHiddenUsers = hiddenUserIds.size;

    // 2. Get all relations for this user
    const relationsParams = {
      TableName: 'Relations',
      KeyConditionExpression: 'user_phone_number = :phone',
      ExpressionAttributeValues: {
        ':phone': `+${cleanPhoneNumber}`
      }
    };

    const relationsResult = await docClient.query(relationsParams).promise();
    totalRelations = relationsResult.Items.length;
    
    // Create a Map of relation details by user ID for efficient lookup
    const relationsMap = new Map();
    relationsResult.Items.forEach(relation => {
      relationsMap.set(relation.related_user_id, {
        gender: relation.gender || null,
        is_starred: relation.is_starred || false,
        name: relation.name || null,
        related_user_phone: relation.related_user_phone || null,
        relation_type: relation.relation_type || null
      });
    });

    // 2.5. Get streak information from UserRelationships table
    const streaksMap = new Map();
    try {
      const userRelationshipsParams = {
        TableName: 'UserRelationships',
        KeyConditionExpression: 'user_phone_number = :phone',
        ExpressionAttributeValues: {
          ':phone': `+${cleanPhoneNumber}` // Make sure format matches what's in the DB
        }
      };
      
      const userRelationshipsResult = await docClient.query(userRelationshipsParams).promise();
      
      // Create a map of streak data by related_user_id for efficient lookup
      userRelationshipsResult.Items.forEach(item => {
        streaksMap.set(item.related_user_id, {
          currentStreak: item.currentStreak || null,
          highestStreak: item.highestStreak || null,
          lastInteractionDate: item.lastInteractionDate || null
        });
      });
      
      console.log(`Retrieved ${userRelationshipsResult.Items.length} streak records`);
    } catch (error) {
      console.error('Error fetching user relationships streak data:', error);
      // Continue processing even if streak data fetch fails
    }    

    // Function to convert S3 URL to HTTPS URL
    const convertS3UrlToHttps = (s3Url) => {
      if (s3Url && s3Url.startsWith('s3://')) {
        const bucketAndKey = s3Url.replace('s3://', '');
        const [bucket, ...keyParts] = bucketAndKey.split('/');
        return `https://${bucket}.s3.ap-south-1.amazonaws.com/${keyParts.join('/')}`;
      }
      return s3Url;
    };

    // Create a Map to store face URLs by user ID
    const faceUrlsMap = new Map();
    const allUserIds = new Set();

    // 3. Query all indexed data for this user
    // Using folder_name-index since folder_name contains the user's phone number
    const indexedDataParams = {
      TableName: 'machinevision_indexed_data',
      IndexName: 'folder_name-index',
      KeyConditionExpression: 'folder_name = :phoneNumber',
      ExpressionAttributeValues: {
        ':phoneNumber': userPhoneNumber
      },
      ProjectionExpression: 'image_id, user_id, bounding_box, confidence, faces_in_image, face_id, image_name, indexed_date'
    };

    // Query the machinevision_indexed_data table with pagination to get all items
    const allIndexedData = [];
    let lastEvaluatedKey = null;
    let paginationCount = 0;
    
    do {
      if (lastEvaluatedKey) {
        indexedDataParams.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const result = await docClient.query(indexedDataParams).promise();
      allIndexedData.push(...result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;
      paginationCount++;
      
      console.log(`Pagination ${paginationCount}: Retrieved ${result.Items.length} items. Has more: ${!!lastEvaluatedKey}`);
      
    } while (lastEvaluatedKey);
    
    totalIndexedDataCount = allIndexedData.length;

    // Collect all unique user IDs from the indexed data
    allIndexedData.forEach(item => {
      if (!hiddenUserIds.has(item.user_id)) {
        allUserIds.add(item.user_id);
      }
    });

    // Batch get face URLs in chunks to avoid DynamoDB limits
    const batchSize = 100; // DynamoDB allows up to 100 items in a BatchGetItem
    const userIdArray = Array.from(allUserIds);
    let processedUsers = 0;

    for (let i = 0; i < userIdArray.length; i += batchSize) {
      const batch = userIdArray.slice(i, i + batchSize);
      
      const batchParams = {
        RequestItems: {
          'machinevision_recognition_users_data': {
            Keys: batch.map(userId => ({ 'user_id': userId }))
          }
        }
      };
      
      try {
        const batchResult = await docClient.batchGet(batchParams).promise();
        
        if (batchResult.Responses && batchResult.Responses.machinevision_recognition_users_data) {
          batchResult.Responses.machinevision_recognition_users_data.forEach(item => {
            if (item.user_id && item.face_url) {
              faceUrlsMap.set(item.user_id, convertS3UrlToHttps(item.face_url));
            }
          });
        }
        
        processedUsers += batch.length;
        
      } catch (error) {
        console.error('Error fetching face URLs batch:', error);
      }
    }

    // 4. Process the indexed data to group by user_id and create memories
    const userMemoriesMap = new Map(); // Map to store memories by user_id
    let hiddenUsersFiltered = 0;
    
    // Filter out hidden users and group the rest by user_id
    allIndexedData.forEach(item => {
      // Skip if this item belongs to a hidden user
      if (hiddenUserIds.has(item.user_id)) {
        hiddenUsersFiltered++;
        return;
      }

      const userId = item.user_id;
      const imageName = item.image_name;
      
      // Get relation information for this user
      const relationInfo = relationsMap.get(userId) || {
        gender: null,
        is_starred: false,
        name: null,
        related_user_phone: null,
        relation_type: null
      };


      const streakInfo = streaksMap.get(userId) || {
        currentStreak: null,
        highestStreak: null,
        lastInteractionDate: null
      };
      
      // Create user entry if it doesn't exist
      if (!userMemoriesMap.has(userId)) {
        userMemoriesMap.set(userId, {
          user_id: userId,
          face_url: faceUrlsMap.get(userId) || null,
          relation: relationInfo,
          streak: streakInfo,
          memories: new Map() // Use a Map to avoid duplicates
        });
      }
      
      const userMemories = userMemoriesMap.get(userId);
      
      // Add this memory if not already added for this user
      if (!userMemories.memories.has(imageName)) {
        userMemories.memories.set(imageName, {
          image_id: item.image_id,
          image_name: imageName,
          bounding_box: item.bounding_box,
          confidence: item.confidence,
          faces_in_image: item.faces_in_image,
          face_id: item.face_id,
          indexed_date: item.indexed_date,
          other_users: [] // Initialize other_users array for this image
        });
      }
      
      // Find out which other users are in this image
      const sameImageEntries = allIndexedData.filter(
        entry => entry.image_name === imageName && entry.user_id !== userId && !hiddenUserIds.has(entry.user_id)
      );
      
      // Add other users to this memory
      sameImageEntries.forEach(otherUserEntry => {
        const otherUserId = otherUserEntry.user_id;
        const otherUserRelation = relationsMap.get(otherUserId) || {
          gender: null,
          is_starred: false,
          name: null,
          related_user_phone: null,
          relation_type: null
        };     
        
        // Only add if not already in the other_users array
        const memory = userMemories.memories.get(imageName);
        const exists = memory.other_users.some(user => user.user_id === otherUserId);
        
        if (!exists) {
          memory.other_users.push({
            user_id: otherUserId,
            face_url: faceUrlsMap.get(otherUserId) || null,
            relation: otherUserRelation
          });
        }
      });
    });
    
    // Convert the nested Maps to arrays for the response
    const userMemories = Array.from(userMemoriesMap.entries()).map(([userId, userData]) => {
      return {
        user_id: userId,
        face_url: userData.face_url,
        relation: userData.relation,
        streak: streaksMap.get(userId) || {
          currentStreak: null,
          highestStreak: null,
          lastInteractionDate: null
        },
        memories: Array.from(userData.memories.values())
      };
    });
    
    finalMemoriesCount = userMemories.reduce((count, user) => count + user.memories.length, 0);

    // Return success response
    res.json({
      success: true,
      userMemoriesCount: userMemories.length,
      totalMemories: finalMemoriesCount,
      userMemories,
      validation: {
        totalIndexedData: totalIndexedDataCount,
        hiddenUsers: totalHiddenUsers,
        hiddenUsersFiltered,
        relations: totalRelations,
        finalMemories: finalMemoriesCount
      }
    });

  } catch (error) {
    console.error('Error fetching device memories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device memories',
      details: error.message
    });
  }
});

app.get('/getGeneratedMemories/:userPhoneNumber', async (req, res) => {
  try {
    const { userPhoneNumber } = req.params;

    // Input validation
    if (!userPhoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: userPhoneNumber',
      });
    }

    // Query params for image_generations table
    const params = {
      TableName: 'image_generations',
      IndexName: 'user_phone_number-index',
      KeyConditionExpression: 'user_phone_number = :phoneNumber',
      FilterExpression: 'generation_status = :status',
      ExpressionAttributeValues: {
        ':phoneNumber': userPhoneNumber,
        ':status': 'completed',
      },
      ProjectionExpression: 'generation_id, created_at, generated_images, prompt, prompt_id, related_user_id, related_user_phone',
      ScanIndexForward: false, // Sort by the index's sort key (latest first)
    };

    // Query all generated memories with pagination (similar to getDeviceMemories)
    const allGeneratedMemories = [];
    let lastEvaluatedKey = null;
    let paginationCount = 0;
    
    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const result = await docClient.query(params).promise();
      allGeneratedMemories.push(...result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;
      paginationCount++;
      
    } while (lastEvaluatedKey);

    // Process the data to add the isGenerated flag and sort by created_at (latest to oldest)
    const generatedMemories = allGeneratedMemories.map(item => ({
      generation_id: item.generation_id,
      created_at: item.created_at,
      generated_images: item.generated_images,
      prompt: item.prompt || null,
      prompt_id: item.prompt_id,
      related_user_id: item.related_user_id || null,
      related_user_phone: item.related_user_phone || null,
      isGenerated: true,
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      count: generatedMemories.length,
      generatedMemories,
    });
  } catch (error) {
    console.error('Error fetching generated memories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch generated memories',
      details: error.message
    });
  }
});

app.post('/hideMemory', async (req, res) => {
  try {
    const { flashbackId, userId, userPhoneNumber, imageName } = req.body;

    const params = {
      TableName: 'hidden_memories',
      Item: {
        flashback_id: flashbackId,
        user_id: userId,
        user_phone_number: userPhoneNumber,
        image_name: imageName,
        hidden_at: new Date().toISOString()
      }
    };

    await docClient.put(params).promise();

    res.json({
      success: true,
      message: 'Memory hidden successfully'
    });

  } catch (error) {
    console.error('Error hiding memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to hide memory'
    });
  }
});


app.put('/updateUserFlashback/:flashbackId', async (req, res) => {
  const { flashbackId } = req.params;
  const updateFields = req.body;

  try {
    const updatedFlashback = await updateUserFlashbackDetails(flashbackId, updateFields);
    logger.info(`Updated flashback: ${flashbackId}`);
    res.status(200).send(updatedFlashback);
  } catch (error) {
    logger.error(`Failed to update event ${flashbackId}: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});

const updateUserFlashbackDetails = async (flashbackId, updateFields) => {
  // Build Update Parameters
  try{
  const flashbackOwners = await getUserFlashbackOwners(flashbackId);
  let updateExpression = "set";
  let expressionAttributeValues = {};

  Object.keys(updateFields).forEach((key, index) => {
    const attributeKey = `:${key}`;

    if (index > 0) {
      updateExpression += ",";
    }

    updateExpression += ` ${key} = ${attributeKey}`;
    expressionAttributeValues[attributeKey] = updateFields[key];
  });

  // Return null if no fields are provided
  if (Object.keys(expressionAttributeValues).length === 0) {
    throw new Error('No fields provided to update');
  }
  const results = [];
  for (const owner of flashbackOwners) {
    const updateParams = {
      TableName: userFlashbackDetailsTable,
      Key: {
        flashback_id: flashbackId,
        user_phone_number: owner.user_phone_number
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    // Perform the update operation

      const result = await docClient.update(updateParams).promise();
      results.push(result.Attributes);
   
  }
  return results;
} catch (error) {
  throw new Error(`Failed to update event for user ${owner.user_phone_number}: ${error.message}`);
}
};

app.post('/updateUserFlashbackImage', upload.single('flashbackImage'), async (req, res) => {
  const { flashbackId } = req.body;
  const file = req.file;

  if (!flashbackId) {
    return res.status(400).json({ error: 'Missing required fields: flashbackId' });
  }
  
  const fileKey = `${flashbackId}.jpg`;

  try {
    // Upload the new image to S3
    const imageUrl = await uploadImageToS3('flashbackuserflashbackthumbnails', fileKey, file.buffer, file.mimetype);

    // Update event details in DynamoDB with the new image URL
    //const updateFields = { flashback_image: imageUrl };
    //await updateUserFlashbackDetails(flashbackId, updateFields);

    res.status(200).send({ message: 'Flashback image updated successfully', imageUrl });
  } catch (error) {
    console.error('Error updating flashback image:', error);
    res.status(500).json({ error: 'Error updating flashback image' });
  }
});

// API endpoint to delete an event
app.delete('/deleteUserFlashback/:flashbackId/:userPhoneNumber', async (req, res) => {
  const { flashbackId, userPhoneNumber } = req.params;

  logger.info(`Deletion Process Started for flashbackId: ${flashbackId}, userPhoneNumber: ${userPhoneNumber}`);

  try {
    // Step 1: Fetch flashback details to get the folder name
    logger.info('Step 1: Fetching flashback details from DynamoDB');
    const flashbackDetails = await getUserFlashbackDetailsById_Creator(flashbackId);
    logger.info('Step 1 Completed: flashback details fetched successfully');

    if (!flashbackDetails) {
      logger.error('flashback not found in DynamoDB');
      return res.status(404).json({ message: 'flashback not found' });
    }

    const folderName = flashbackDetails.folder_name;

    // Step 2: List and delete all objects within the folder in S3 (indexBucketName)
    logger.info(`Step 2: Listing and deleting all objects in S3 folder: ${folderName} in bucket: ${indexBucketName}`);
    let isTruncated = true;
    let continuationToken = null;
    let totalObjectsDeleted = 0;

    while (isTruncated) {
      const listParams = {
        Bucket: indexBucketName,
        Prefix: `${folderName}/`,
        ContinuationToken: continuationToken
      };

      const listedObjects = await s3.listObjectsV2(listParams).promise();
      logger.info(`Step 2: Fetched ${listedObjects.Contents.length} objects from S3 folder: ${folderName} in bucket: ${indexBucketName}`);

      if (listedObjects.Contents.length > 0) {
        const deleteParamsIndex = {
          Bucket: indexBucketName,
          Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
        };

        const deleteParamsThumbnail = {
          Bucket: thumbnailBucketName,
          Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
        };

        try {
          // Step 1: Delete image records from DynamoDB (ImageUploadData table) using s3_url
          logger.info(`Step 1: Deleting image records from DynamoDB (UserFlashbackImageUploadData table) using s3_url values`);

          for (const object of listedObjects.Contents) {
            const s3Url = `https://${indexBucketName}.s3.ap-south-1.amazonaws.com/${object.Key}`; // Construct the s3_url

            const deleteImageDataParams = {
              TableName: UserFlashbackImageUploadData,
              Key: {
                s3_url: s3Url
              }
            };

            try {
              const res = await docClient.delete(deleteImageDataParams).promise();
              //logger.info(`Deleted image record from UserFlashbackImageUploadData table for s3_url: ${s3Url}`);
            } catch (deleteError) {
              logger.error(`Failed to delete image record from ImageUploadData table for s3_url: ${s3Url} - Error: ${deleteError.message}`);
              return res.status(500).json({ message: 'Error deleting image records from UserFlashbackImageUploadData table', error: deleteError.message });
            }
          }

          logger.info(`Step 1a Completed: Deleted image records from DynamoDB (UserFlashbackImageUploadData table)`);

          // Step 2: Delete the objects from indexBucketName
  
          // Delete the objects from indexBucketName
          const deleteResultIndex = await s3.deleteObjects(deleteParamsIndex).promise();
          if (deleteResultIndex.Errors && deleteResultIndex.Errors.length > 0) {
            logger.error(`Error deleting some objects from ${indexBucketName}: ${JSON.stringify(deleteResultIndex.Errors)}`);
            return res.status(500).json({ message: 'Error deleting some objects from S3', errors: deleteResultIndex.Errors });
          }
          totalObjectsDeleted += deleteParamsIndex.Delete.Objects.length;
          logger.info(`Step 2: Deleted ${deleteParamsIndex.Delete.Objects.length} objects from S3 folder: ${folderName} in bucket: ${indexBucketName}`);

          // Delete the objects from thumbnailBucketName
          const deleteResultThumbnail = await s3.deleteObjects(deleteParamsThumbnail).promise();
          if (deleteResultThumbnail.Errors && deleteResultThumbnail.Errors.length > 0) {
            logger.error(`Error deleting some objects from ${thumbnailBucketName}: ${JSON.stringify(deleteResultThumbnail.Errors)}`);
            return res.status(500).json({ message: 'Error deleting some objects from S3', errors: deleteResultThumbnail.Errors });
          }
          logger.info(`Step 2: Deleted ${deleteParamsThumbnail.Delete.Objects.length} objects from S3 folder: ${folderName} in bucket: ${thumbnailBucketName}`);
        } catch (deleteError) {
          logger.error(`Failed to delete objects in S3: ${deleteError.message}`);
          return res.status(500).json({ message: 'Error deleting objects from S3', error: deleteError.message });
        }
      } else {
        logger.info(`Step 2: No objects found in S3 folder: ${folderName} in bucket: ${indexBucketName}`);
        break; // Skip further steps if no objects are found
      }

      isTruncated = listedObjects.IsTruncated;
      continuationToken = listedObjects.NextContinuationToken;
    }

    logger.info(`Step 2 Completed: Total objects deleted from S3 folder: ${totalObjectsDeleted} in bucket: ${indexBucketName} and ${thumbnailBucketName}`);

    // Step 3: Query the table using the existing partition key (event_name)
    logger.info(`Step 3: Fetching items from userFlashbackMapping using flashbackId`);
    let lastEvaluatedKey = null;
    let queryResult = { Items: [] };

    do {
      const queryParams = {
        TableName: userFlashbackMapping,
        KeyConditionExpression: 'flashback_id = :flashbackId',
        ExpressionAttributeValues: {
          ':flashbackId': flashbackId
        },
        ExclusiveStartKey: lastEvaluatedKey
      };

      const result = await docClient.query(queryParams).promise();
      queryResult.Items = queryResult.Items.concat(result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;

    } while (lastEvaluatedKey);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      logger.info('No entries found for event_name in userEventTableName');
      logger.info(`Step 3: Total items fetched: ${queryResult.Items.length}`);
      logger.info(`No entries to update in userEventTableName for flashbackId: ${flashbackId}`);
    } else {
      // Step 4: Update event status in the event mapping table for all fetched items
      logger.info(`Step 4: Updating flashback status to "deleted" in event mapping table for flashbackId: ${flashbackId}`);
      for (const item of queryResult.Items) {
        const updateParams = {
          TableName: userFlashbackMapping,
          Key: {
            flashback_id: item.flashback_id,
            user_phone_number: item.user_phone_number
          },
          UpdateExpression: "SET flashback_status = :deleted",
          ExpressionAttributeValues: {
            ":deleted": "deleted"
          }
        };

        try {
          await docClient.update(updateParams).promise();
          logger.info(`flashback status updated to "deleted" for flashback_id: ${item.flashback_id}, user_phone: ${item.user_phone_number}`);
        } catch (updateError) {
          logger.error(`Failed to update flashback status for flashback_id: ${item.flashback_id}, user_phone: ${item.user_phone_number} - Error: ${updateError.message}`);
          return res.status(500).json({ message: 'Error updating flashback status', error: updateError.message });
        }
      }
      logger.info(`Step 4 Completed: flashback status updated for all fetched items`);
    }

    // Step 4a: Fetch and delete entries from event_collabs table using event_id
    // logger.info(`Step 4a: Fetching and deleting entries from event_collabs table for eventId: ${eventId}`);
    // lastEvaluatedKey = null;
    // let collabsQueryResult = { Items: [] };

    // do {
    //   const collabsQueryParams = {
    //     TableName: 'event_collabs',
    //     KeyConditionExpression: 'event_id = :eventId',
    //     ExpressionAttributeValues: {
    //       ':eventId': eventId
    //     },
    //     ExclusiveStartKey: lastEvaluatedKey
    //   };

    //   const collabsResult = await docClient.query(collabsQueryParams).promise();
    //   collabsQueryResult.Items = collabsQueryResult.Items.concat(collabsResult.Items);
    //   lastEvaluatedKey = collabsResult.LastEvaluatedKey;

    // } while (lastEvaluatedKey);

    // if (collabsQueryResult.Items.length > 0) {
    //   for (const collab of collabsQueryResult.Items) {
    //     const deleteCollabParams = {
    //       TableName: 'event_collabs',
    //       Key: {
    //         event_id: collab.event_id,
    //         user_name: collab.user_name
    //       }
    //     };

    //     try {
    //       await docClient.delete(deleteCollabParams).promise();
    //       logger.info(`Deleted entry from event_collabs table for event_id: ${collab.event_id}, user_name: ${collab.user_name}`);
    //     } catch (deleteError) {
    //       logger.error(`Failed to delete entry from event_collabs table for event_id: ${collab.event_id}, user_name: ${collab.user_name} - Error: ${deleteError.message}`);
    //       return res.status(500).json({ message: 'Error deleting entry from event_collabs table', error: deleteError.message });
    //     }
    //   }
    //   logger.info(`Step 4a Completed: Deleted all fetched entries from event_collabs table`);
    // } else {
    //   logger.info('No entries found in event_collabs table for eventId');
    // }

    // Step 5a: Delete the event-related thumbnail image from flashbackuserflashbackthumbnails bucket
    logger.info(`Step 5a: Deleting event-related thumbnail from flashbackuserflashbackthumbnails bucket`);
    const thumbnailKey = `${folderName}.jpg`; // Construct the key for the thumbnail image
    const deleteThumbnailParams = {
      Bucket: 'flashbackuserflashbackthumbnails',
      Key: thumbnailKey
    };

    try {
      const deleteThumbnailResult = await s3.deleteObject(deleteThumbnailParams).promise();
      logger.info(`Step 5a Completed: Deleted thumbnail image ${thumbnailKey} from flashbackuserflashbackthumbnails bucket`);
    } catch (thumbnailDeleteError) {
      logger.error(`Failed to delete thumbnail image from flashbackuserflashbackthumbnails bucket: ${thumbnailDeleteError.message}`);
      return res.status(500).json({ message: 'Error deleting thumbnail image from S3', error: thumbnailDeleteError.message });
    }
    
    // Step 5: Delete the event from the primary event details table
    logger.info(`Step 5: Deleting flashback from primary table for flashbackId: ${flashbackId}`);
    const flashbackOwners = await getUserFlashbackOwners(flashbackId);
    for (const owner of flashbackOwners) {
      const deleteParams = {
        TableName: userFlashbackDetailsTable,
        Key: {
          flashback_id: flashbackId,
          user_phone_number: owner.user_phone_number
        }
      };
      await docClient.delete(deleteParams).promise();
    }
    logger.info(`Step 5 Completed: flashback deleted from primary table for flashbackId: ${flashbackId}`);

    // Step 6: Insert entry into event_delete table with event_id, user_phone_number, and deleted date
    logger.info(`Step 6: Inserting entry into flashback_delete table for flashbackId: ${flashbackId}, userPhoneNumber: ${userPhoneNumber}`);
    const deleteDate = new Date().toISOString(); // Get the current date in ISO format
    const userFlashbackDeleteParams = {
      TableName: deletedUserFlashbackTable,
      Item: {
        flashback_id: flashbackId,
        user_phone_number: userPhoneNumber,
        deleted_date: deleteDate
      }
    };

    try {
      await docClient.put(userFlashbackDeleteParams).promise();
      logger.info(`Step 6 Completed: Inserted entry into event_delete table for flashbackId: ${flashbackId}, userPhoneNumber: ${userPhoneNumber}`);
    } catch (deleteError) {
      logger.error(`Failed to insert entry into event_delete table for flashbackId: ${flashbackId}, userPhoneNumber: ${userPhoneNumber} - Error: ${deleteError.message}`);
      return res.status(500).json({ message: 'Error inserting entry into event_delete table', error: deleteError.message });
    }

    logger.info(`Deletion Process Completed successfully for flashbackId: ${flashbackId}`);
    res.status(200).json({ message: 'flashback deleted successfully and marked as deleted in flashback mapping table' });
  } catch (error) {
    logger.error(`Error during deletion process for flashbackId: ${flashbackId}:`, error);
    res.status(500).json({ message: 'Error deleting flashback', error: error.message });
  }
});

async function getFlashbacksForUser(userPhoneNumber) {
  const params = {
    TableName: userFlashbackMappingTable,
    IndexName:'user_phone_number-index',
    KeyConditionExpression: 'user_phone_number = :userPhoneNumber',
    ExpressionAttributeValues: {
      ':userPhoneNumber': userPhoneNumber,
    }
  };

  try {
    const result = await docClient.query(params).promise();
    return result.Items;
  } catch (error) {
    console.error('Error fetching user event mappings:', error);
    throw error;
  }
}

app.get("/getUserTaggedFlashbacks/:user_phone_number", async (req, res) => {
  const userPhoneNumber = req.params.user_phone_number;

  try {
    // Fetch event IDs for the user
    logger.info("Fetching Tagged Flashbacks for the userPhoneNumber : ", userPhoneNumber);
    const flashbacks = await getFlashbacksForUser(userPhoneNumber);

    const flashbackDetailsPromises = flashbacks.map(flashback => getUserFlashbackDetailsById_Creator(flashback.flashback_id));
    const flashbackDetails = await Promise.all(flashbackDetailsPromises);

    // Filter out any null results
    const validflashbackDetails = flashbackDetails.filter(flashback => flashback !== null);
    logger.info("Successfully Fetched Tagged Flashbacks for the userPhoneNumber : ", userPhoneNumber);
    // Send the valid event details as the response
    res.json(validflashbackDetails);
  } catch (error) {
    logger.error(`Error fetching user attended flashbacks: ${error.message}`);
    res.status(500).send('Error fetching user attended events');
  }
});

// app.get('/getUserFaceBubbles/:userId/:User', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const userType = req.params.User;

//     let Recognitiontablename;
//     if (userType === 'sender') {
//       Recognitiontablename = 'machinevision_recognition_users_data';
//     } else {
//       Recognitiontablename = 'RekognitionUsersData';
//     }
//     const params = {
//       TableName: Recognitiontablename,
//       KeyConditionExpression: 'user_id = :userId',
//       ExpressionAttributeValues: {
//         ':userId': { S: userId }  // Need to specify the type as String
//       }
//     };

//     const result = await dynamoDB.query(params).promise();
    
//     if (result.Items?.length > 0) {
//       res.status(200).send({
//         success: true,
//         face_url: result.Items[0].face_url
//       });
//     } else {
//       res.status(404).send({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     res.status(500).send({ error: error.message });
//   }
// });


app.get('/getUserFaceBubbles/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Step 1: Query flashback_mobile_users
    const userParams = {
      TableName: 'flashback_mobile_users',
      IndexName: 'user_id-index', // Using GSI
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    const userResult = await docClient.query(userParams).promise();

    if (userResult.Items.length > 0) {
      // User is registered, return the first result
      res.status(200).json({ success: true, user: userResult.Items });
    } else {
      // Step 2: No registered user found, query machinevision_recognition_users_data
      const faceParams = {
        TableName: 'machinevision_recognition_users_data',
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      };

      const faceResult = await docClient.query(faceParams).promise();

      if (faceResult.Items?.length > 0) {
        let faceUrl = faceResult.Items[0]?.face_url;
        if (typeof faceUrl === 'string' && faceUrl.startsWith('s3://')) {
          const bucketAndKey = faceUrl.replace('s3://', '');
          const [bucket, ...keyParts] = bucketAndKey.split('/');
          faceUrl = `https://${bucket}.s3.ap-south-1.amazonaws.com/${keyParts.join('/')}`;
        }

        // Return a mock user object with face_url for unregistered users
        res.status(200).json({
          success: true,
          user: [{
            user_id: userId,
            user_name: 'unregistered',
            user_phone_number: 'unregistered',
            displaypictureurl: faceUrl || null, // Use face_url if available
          }]
        });
      } else {
        // No data in either table
        res.status(200).json({
          success: true,
          user: [{
            user_id: userId,
            user_name: 'unregistered',
            user_phone_number: 'unregistered',
            displaypictureurl: null
          }]
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});



app.post('/initializeChat', async (req, res) => {
  const { senderId, recipientId } = req.body;
  try {
    // Check if chat already exists
    const existingChat = await dynamoDB.query({
      TableName: 'Chats',
      IndexName: 'ParticipantsIndex',
      KeyConditionExpression: 'participants = :participants',
      ExpressionAttributeValues: {
        ':participants': [senderId, recipientId].sort().join('#')
      }
    }).promise();

    if (existingChat.Items.length > 0) {
      return res.status(200).send({ 
        chatId: existingChat.Items[0].chatId,
        isExisting: true 
      });
    }

    // Create new chat
    const chatId = uuidv4();
    const timestamp = new Date().toISOString();

    await dynamoDB.putItem({
      TableName: 'Chats',
      Item: {
        chatId,
        participants: [senderId, recipientId].sort().join('#'),
        createdAt: timestamp,
        lastMessageAt: timestamp,
        lastMessage: null
      }
    }).promise();

    res.status(200).send({ chatId, isExisting: false });
  } catch (err) {
    logger.error('Error initializing chat:', err);
    res.status(500).send({ error: err.message });
  }
});

// Send a memory share message
app.post('/sendMemory', async (req, res) => {
  const { senderId, recipientId, chatId } = req.body;
  try {
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    // Save message to DynamoDB
    await dynamoDB.putItem({
      TableName: 'Messages',
      Item: {
        messageId,
        chatId,
        senderId,
        recipientId,
        type: 'memory',
        timestamp,
        status: 'sent'
      }
    }).promise();

    // Update chat's last message
    await dynamoDB.update({
      TableName: 'Chats',
      Key: { chatId },
      UpdateExpression: 'SET lastMessageAt = :timestamp, lastMessage = :messageId',
      ExpressionAttributeValues: {
        ':timestamp': timestamp,
        ':messageId': messageId
      }
    }).promise();

    // Send real-time notification via WebSocket
    const connections = await getActiveConnections(recipientId);
    await Promise.all(connections.map(connection => 
      sendWebSocketMessage(connection.connectionId, {
        type: 'new_message',
        chatId,
        messageId
      })
    ));

    res.status(200).send({ messageId });
  } catch (err) {
    logger.error('Error sending memory:', err);
    res.status(500).send({ error: err.message });
  }
});

// Get chat messages
app.get('/getChatMessages/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const { lastMessageId } = req.query;
  
  try {
    const params = {
      TableName: 'Messages',
      IndexName: 'chatId-index',
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': { S: chatId }
      },
      ScanIndexForward: false,
      Limit: 50
    };

    if (lastMessageId) {
      params.ExclusiveStartKey = { 
        messageId: { S: lastMessageId },
        chatId: { S: chatId }
      };
    }

    const result = await dynamoDB.query(params).promise();

    // Transform DynamoDB items to regular objects with safe field access
    const messages = result.Items.map(item => ({
      messageId: item.messageId?.S,
      chatId: item.chatId?.S,
      senderId: item.senderId?.S,
      senderName: item.senderName?.S,
      senderPhone: item.senderPhone?.S,
      // Only include recipientId if it exists
      ...(item.recipientId && { recipientId: item.recipientId.S }),
      type: item.messageType?.S,
      content: item.content?.S,
      timestamp: item.timestamp?.S,
      status: item.status?.S || 'sent',
      flashbackId: item.flashbackId?.S,
      // Safely handle reactions if they exist
      reactions: item.reactions?.M || {},
      // Only include replyTo if it exists
      ...(item.replyTo?.M && {
        replyTo: {
          messageId: item.replyTo.M.messageId?.S,
          content: item.replyTo.M.content?.S,
          type: item.replyTo.M.type?.S
        }
      })
    }))
    .filter(message => message.messageId && message.content) // Filter out any malformed messages
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).send({
      success: true,
      messages,
      lastEvaluatedKey: result.LastEvaluatedKey
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});



app.get('/getChats/:userId', async (req, res) => {
  const { userId } = req.params;
  const { userPhoneNumber } = req.query;

  if (!userId || !userPhoneNumber) {
    return res.status(400).send({ success: false, error: 'Both userId and userPhoneNumber are required' });
  }

  // Normalize userPhoneNumber: trim whitespace and ensure '+'
  const normalizedPhoneNumber = userPhoneNumber.trim();
  const formattedPhoneNumber = normalizedPhoneNumber.startsWith('+') 
    ? normalizedPhoneNumber 
    : `+${normalizedPhoneNumber}`;

  try {
    // Step 1: Scan bubbleChats to check if userId or userPhoneNumber is part of participants
    const chatParams = {
      TableName: 'bubbleChats',
      FilterExpression: 'contains(participants, :userId) OR contains(participants, :phone)',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
        ':phone': { S: formattedPhoneNumber }
      }
    };

    // console.log('Scanning bubbleChats with params:', JSON.stringify(chatParams, null, 2));
    const chatResult = await dynamoDB.scan(chatParams).promise();
    // console.log('Scan result:', JSON.stringify(chatResult.Items, null, 2));

    const chats = chatResult.Items || [];

    if (chats.length === 0) {
      return res.status(200).send({ success: true, chats: [] });
    }

    // Step 2: Process each chat to get unique chat IDs
    const uniqueChatIds = [...new Set(chats.map(chat => chat.chat_id.S))];

    // Step 3: Process each unique chat to get latest message and receiver details
    const chatDetails = await Promise.all(uniqueChatIds.map(async chatId => {
      const chatParams = {
        TableName: 'bubbleChats',
        Key: { 'chat_id': { S: chatId } }
      };
      const chatResult = await dynamoDB.getItem(chatParams).promise();
      const chat = chatResult.Item;

      if (!chat) return null;

      const participants = chat.participants.S.split('#');
      const otherParticipant = participants.find(p => p !== userId && p !== formattedPhoneNumber);
      const isGroup = chat.isGroup?.BOOL || false;

      // Get latest message
      const messageParams = {
        TableName: 'Messages',
        IndexName: 'chatId-index',
        KeyConditionExpression: 'chatId = :chatId',
        ExpressionAttributeValues: {
          ':chatId': { S: chatId }
        },
        ScanIndexForward: false,
        Limit: 1
      };

      const messageResult = await dynamoDB.query(messageParams).promise();
      const lastMessage = messageResult.Items[0];

      if (isGroup) {
        // Handle group chats (minimal implementation, expand as needed)
        return {
          chatId,
          isGroup: true,
          groupName: chat.groupName?.S,
          memberIds: chat.memberIds?.SS,
          lastMessage: formatLastMessage(lastMessage)
        };
      } else {
        // Individual chat - Get receiver details
        let receiverDetails = {};
        let faceUrl;

        if (lastMessage?.receiverPhone?.S && lastMessage.receiverPhone.S !== 'unregistered') {
          receiverDetails = await getUserDetailsByPhone(lastMessage.receiverPhone.S) || 
                           { user_phone_number: { S: lastMessage.receiverPhone.S } };
        } else if (otherParticipant.startsWith('+')) {
          receiverDetails = await getUserDetailsByPhone(otherParticipant) || 
                           { user_phone_number: { S: otherParticipant } };
        } else {
          const [userResult, faceResult] = await Promise.all([
            getUserDetails(otherParticipant),
            getFaceDetails(otherParticipant)
          ]);
          receiverDetails = userResult || { user_id: { S: otherParticipant } };
          faceUrl = faceResult?.face_url?.S;
        }

        return {
          chatId,
          isGroup: false,
          otherUser: {
            userId: otherParticipant,
            faceUrl: formatFaceUrl(faceUrl)
          },
          otherUserDet: {
            user_name: receiverDetails.user_name?.S || receiverDetails.user_phone_number?.S || 'unregistered',
            display_picture: receiverDetails.displaypictureurl?.S
          },
          lastMessage: formatLastMessage(lastMessage)
        };
      }
    }));

    const validChats = chatDetails
      .filter(chat => chat !== null)
      .sort((a, b) => 
        new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0)
      );

    res.status(200).send({
      success: true,
      chats: validChats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// Helper Functions
async function getUserDetails(userId) {
  const params = {
    TableName: 'flashback_mobile_users',
    IndexName: 'user_id-index',
    KeyConditionExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: userId }
    }
  };
  const result = await docClient.query(params).promise();
  return result.Items?.[0];
}

async function getUserDetailsByPhone(phoneNumber) {
  const params = {
    TableName: 'flashback_mobile_users',
    KeyConditionExpression: 'user_phone_number = :phone',
    ExpressionAttributeValues: {
      ':phone': { S: phoneNumber }
    }
  };
  const result = await dynamoDB.query(params).promise();
  return result.Items?.[0];
}



async function getFaceDetails(userId) {
  const params = {
    TableName: 'machinevision_recognition_users_data',
    KeyConditionExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: userId }
    }
  };
  const result = await dynamoDB.query(params).promise();
  return result.Items?.[0];
}

function formatFaceUrl(faceUrl) {
  if (typeof faceUrl === 'string' && faceUrl.startsWith('s3://')) {
    const bucketAndKey = faceUrl.replace('s3://', '');
    const [bucket, ...keyParts] = bucketAndKey.split('/');
    return `https://${bucket}.s3.ap-south-1.amazonaws.com/${keyParts.join('/')}`;
  }
  return faceUrl;
}

function formatLastMessage(message) {
  return message ? {
    messageId: message.messageId.S,
    type: message.messageType.S,
    content: message.content.S,
    timestamp: message.timestamp.S,
    senderId: message.senderId.S
  } : null;
}

app.get('/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;
  
  try {
    const params = {
      TableName: 'Messages',
      IndexName: 'chatId-index',
      KeyConditionExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': { S: chatId }
      },
      ScanIndexForward: false, // Get newest messages first
      Limit: 50 // Limit to last 50 messages
    };

    const result = await dynamoDB.query(params).promise();
    
    const messages = result.Items.map(item => ({
      messageId: item.messageId.S,
      chatId: item.chatId.S,
      senderId: item.senderId.S,
      type: item.messageType.S,
      content: item.content.S,
      timestamp: item.timestamp.S,
      status: item.status?.S || 'sent',
      reactions: item.reactions?.M || {},
      replyTo: item.replyTo?.M
    }));

    res.status(200).send({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});

app.post('/sendMessage', async (req, res) => {
  const { chatId, senderId, recipientId, content, type, replyTo } = req.body;
  
  try {
    const timestamp = new Date().toISOString();
    const messageId = require('crypto').randomBytes(16).toString('hex');

    const messageItem = {
      messageId: { S: messageId },
      chatId: { S: chatId },
      senderId: { S: senderId },
      recipientId: { S: recipientId },
      messageType: { S: type },
      content: { S: content },
      timestamp: { S: timestamp },
      status: { S: 'sent' }
    };

    if (replyTo) {
      messageItem.replyTo = { 
        M: {
          messageId: { S: replyTo.messageId },
          content: { S: replyTo.content },
          type: { S: replyTo.type }
        }
      };
    }

    // Add the message
    await dynamoDB.putItem({
      TableName: 'Messages',
      Item: messageItem
    }).promise();

    // Update chat's last message info
    await dynamoDB.updateItem({
      TableName: 'Chats',
      Key: { chatId: { S: chatId } },
      UpdateExpression: 'SET lastMessageAt = :timestamp, lastMessageId = :messageId',
      ExpressionAttributeValues: {
        ':timestamp': { S: timestamp },
        ':messageId': { S: messageId }
      }
    }).promise();

    res.status(200).send({
      success: true,
      message: messageItem
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});

// Add reaction to message
app.post('/addReaction', async (req, res) => {
  const { messageId, user_id, emoji } = req.body;
  try {
    await dynamoDB.update({
      TableName: 'Messages',
      Key: { messageId },
      UpdateExpression: 'SET reactions.#user_id = :emoji',
      ExpressionAttributeNames: {
        '#user_id': user_id
      },
      ExpressionAttributeValues: {
        ':emoji': emoji
      }
    }).promise();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error('Error adding reaction:', err);
    res.status(500).send({ error: err.message });
  }
});

app.post('/markAsRead', async (req, res) => {
  const { chatId, user_id, messageId } = req.body;
  
  if (!chatId || !user_id || !messageId) {
    return res.status(400).send({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }

  try {
    // First check if the record exists
    const existingItem = await dynamoDB.getItem({
      TableName: 'ChatMembers',
      Key: {
        chatId: { S: chatId },
        user_id: { S: user_id }
      }
    }).promise();

    // If record doesn't exist, create it
    if (!existingItem.Item) {
      await dynamoDB.putItem({
        TableName: 'ChatMembers',
        Item: {
          chatId: { S: chatId },
          user_id: { S: user_id },
          lastReadMessageId: { S: messageId },
          updatedAt: { S: new Date().toISOString() }
        }
      }).promise();
    } else {
      // Update existing record
      await dynamoDB.updateItem({
        TableName: 'ChatMembers',
        Key: {
          chatId: { S: chatId },
          user_id: { S: user_id }
        },
        UpdateExpression: 'SET lastReadMessageId = :messageId, updatedAt = :timestamp',
        ExpressionAttributeValues: {
          ':messageId': { S: messageId },
          ':timestamp': { S: new Date().toISOString() }
        }
      }).promise();
    }

    res.status(200).send({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).send({ error: err.message });
  }
});

// WebSocket helper functions
async function getActiveConnections(user_id) {
  const connections = await dynamoDB.query({
    TableName: 'WebSocketConnections',
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': user_id
    }
  }).promise();
  return connections.Items;
}

async function sendWebSocketMessage(connectionId, message) {
  try {
    await WebSocket.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message)
    }).promise();
  } catch (err) {
    if (err.statusCode === 410) {
      // Connection is stale, remove it
      await dynamoDB.delete({
        TableName: 'WebSocketConnections',
        Key: { connectionId }
      }).promise();
    }
  }
}


// app.post('/shareMemory', async (req, res) => {
//   const { senderId, recipientId, memoryUrl, senderName, senderPhone, receiverName, receiverPhone } = req.body;
  
//   console.log('received sharememory request for the details', senderId, recipientId, memoryUrl, flashbackId);
//   try {
//     // Input validation
//     if (!senderId || !recipientId || !memoryUrl) {
//       return res.status(400).send({ success: false, error: 'Missing required fields' });
//     }

//     const timestamp = new Date().toISOString();
//     const messageId = require('crypto').randomBytes(16).toString('hex');
//     const participants = [senderId, recipientId].sort().join('#');

//     // Check for existing chat
//     const existingChatResponse = await dynamoDB.query({
//       TableName: 'Chats',
//       IndexName: 'ParticipantsIndex',
//       KeyConditionExpression: 'participants = :participants',
//       ExpressionAttributeValues: {
//         ':participants': { S: participants }
//       }
//     }).promise();

//     let chatId;
//     if (existingChatResponse.Items && existingChatResponse.Items.length > 0) {
//       chatId = existingChatResponse.Items[0].chatId.S;
      
//       // Update existing chat
//       await dynamoDB.updateItem({
//         TableName: 'Chats',
//         Key: {
//           chatId: { S: chatId }
//         },
//         UpdateExpression: 'SET lastMessageAt = :timestamp, lastMessageId = :messageId',
//         ExpressionAttributeValues: {
//           ':timestamp': { S: timestamp },
//           ':messageId': { S: messageId }
//         }
//       }).promise();
//     } else {
//       // Create new chat
//       chatId = require('crypto').randomBytes(16).toString('hex');
      
//       const chatItem = {
//         chatId: { S: chatId },
//         participants: { S: participants },
//         isGroup: { BOOL: false },
//         createdAt: { S: timestamp },
//         lastMessageAt: { S: timestamp },
//         lastMessageId: { S: messageId },
//         senderPhone: { S: senderPhone },
//         senderName: { S: senderName },
//       };

//       await dynamoDB.putItem({
//         TableName: 'Chats',
//         Item: chatItem
//       }).promise();
//     }

//     // Create message
//     const messageItem = {
//       messageId: { S: messageId },
//       chatId: { S: chatId },
//       senderId: { S: senderId },
//       recipientId: { S: recipientId },
//       messageType: { S: 'memory' },
//       content: { S: memoryUrl },
//       flashbackId: { S: flashbackId },
//       timestamp: { S: timestamp },
//       status: { S: 'sent' },
//       senderPhone: { S: senderPhone },
//       senderName: { S: senderName },
//     };

//     await dynamoDB.putItem({
//       TableName: 'Messages',
//       Item: messageItem
//     }).promise();



//     // await sns.publish({
//     //   TopicArn: MemoryCarrierARN,
//     //   Message: JSON.stringify({
//     //     type: 'memory_share',
//     //     senderId,
//     //     recipientId,
//     //     chatId,
//     //     messageId,
//     //     memoryUrl
//     //   }),
//     //   MessageGroupId: chatId, // Using chatId as the group ID to maintain order per chat
//     //   MessageDeduplicationId: messageId,
//     //   MessageAttributes: {
//     //     'type': {
//     //       DataType: 'String',
//     //       StringValue: 'memory_share'
//     //     }
//     //   }
//     // }).promise();


//     await sendPushNotification(recipientId, senderName, {
//       title: 'New Memory Incoming',
//       body: `${senderName} shared a memory with you`,
//       data: {
//         type: 'memory_share',
//         chatId,
//         messageId,
//         senderId,
//         memoryUrl
//       }
//     });

//     res.status(200).send({
//       success: true,
//       data: {
//         chatId,
//         messageId
//       }
//     });

//   } catch (error) {
//     console.error('Error sharing memory:', error);
//     res.status(500).send({
//       success: false,
//       error: error.message
//     });
//   }
// });


// app.post('/shareMemory', async (req, res) => {
//   const { senderId, recipientId, memoryUrl, senderName, senderPhone, receiverName, receiverPhone, faceUrl } = req.body;

//   console.log('Received shareMemory request:', { senderId, recipientId, memoryUrl });

//   try {
//     if (!senderId || !recipientId || !memoryUrl) {
//       return res.status(400).send({ success: false, error: 'Missing required fields' });
//     }

//     const timestamp = new Date().toISOString();
//     const messageId = require('crypto').randomBytes(16).toString('hex');
//     const participants = [senderId, recipientId].sort().join('#');

//     const existingChatResponse = await docClient.query({
//       TableName: 'Chats',
//       IndexName: 'ParticipantsIndex',
//       KeyConditionExpression: 'participants = :participants',
//       ExpressionAttributeValues: { ':participants': participants },
//     }).promise();

//     let chatId;
//     if (existingChatResponse.Items?.length > 0) {
//       chatId = existingChatResponse.Items[0].chatId.S; // Extract string from query result
//       await docClient.update({
//         TableName: 'Chats',
//         Key: { chatId: chatId }, // Use raw string value, not { S: chatId }
//         UpdateExpression: 'SET lastMessageAt = :timestamp, lastMessageId = :messageId',
//         ExpressionAttributeValues: {
//           ':timestamp': { S: timestamp },
//           ':messageId': { S: messageId },
//         },
//       }).promise();
//     } else {
//       chatId = require('crypto').randomBytes(16).toString('hex');
//       const chatItem = {
//         chatId: { S: chatId },
//         participants: { S: participants },
//         isGroup: { BOOL: false },
//         createdAt: { S: timestamp },
//         lastMessageAt: { S: timestamp },
//         lastMessageId: { S: messageId },
//         senderPhone: { S: senderPhone },
//         senderName: { S: senderName },
//       };
//       await docClient.put({ TableName: 'Chats', Item: chatItem }).promise();
//     }

//     const messageItem = {
//       messageId: { S: messageId },
//       chatId: { S: chatId },
//       senderId: { S: senderId },
//       recipientId: { S: recipientId },
//       messageType: { S: 'memory' },
//       content: { S: memoryUrl },
//       flashbackId: { S: req.body.flashbackId || '' },
//       timestamp: { S: timestamp },
//       status: { S: 'sent' },
//       senderPhone: { S: senderPhone },
//       senderName: { S: senderName },
//       receiverName: { S: receiverName },
//       receiverPhone: { S: receiverPhone },
//       faceUrl: faceUrl ? { S: faceUrl } : null,
//     };

//     await docClient.put({ TableName: 'Messages', Item: messageItem }).promise();

//     res.status(200).send({ success: true, data: { chatId, messageId } });
//   } catch (error) {
//     console.error('Error sharing memory:', error);
//     res.status(500).send({ success: false, error: error.message });
//   }
// });


app.post('/shareMemory', async (req, res) => {
  const { senderId, recipientId, memoryUrl, senderName, senderPhone, receiverName, receiverPhone, faceUrl } = req.body;

  console.log('Received shareMemory request:', { senderId, recipientId, memoryUrl });

  try {
    // Validate required fields
    if (!senderId || !recipientId || !memoryUrl) {
      return res.status(400).send({ success: false, error: 'Missing required fields' });
    }

    const timestamp = new Date().toISOString();
    const messageId = require('crypto').randomBytes(16).toString('hex');

    // Use phone numbers if available, otherwise fall back to IDs
    const senderIdentifier = senderPhone || senderId;
    const recipientIdentifier = receiverPhone && receiverPhone !== 'unregistered' ? receiverPhone : recipientId;
    const participants = [senderIdentifier, recipientIdentifier].sort().join('#');

    // Query existing chat by participants
    const existingChatResponse = await dynamoDB.query({
      TableName: 'bubbleChats',
      IndexName: 'participants-index', // Ensure this GSI exists
      KeyConditionExpression: 'participants = :participants',
      ExpressionAttributeValues: {
        ':participants': { S: participants },
      },
    }).promise();

    let chatId;
    if (existingChatResponse.Items?.length > 0) {
      // Existing chat found
      chatId = existingChatResponse.Items[0].chat_id.S;
      
      // Update lastMessageAt and lastMessageId
      await dynamoDB.updateItem({
        TableName: 'bubbleChats',
        Key: { chat_id: { S: chatId } },
        UpdateExpression: 'SET lastMessageAt = :timestamp, lastMessageId = :messageId',
        ExpressionAttributeValues: {
          ':timestamp': { S: timestamp },
          ':messageId': { S: messageId },
        },
      }).promise();
    } else {
      // Create new chat
      chatId = require('crypto').randomBytes(16).toString('hex');
      const chatItem = {
        chat_id: { S: chatId },
        participants: { S: participants },
        isGroup: { BOOL: false }, // One-on-one chat
        createdAt: { S: timestamp },
        lastMessageAt: { S: timestamp },
        lastMessageId: { S: messageId },
        senderName: senderName ? { S: senderName } : { S: senderIdentifier },
        senderPhone: senderPhone ? { S: senderPhone } : { S: senderIdentifier},
      };

      await dynamoDB.putItem({
        TableName: 'bubbleChats',
        Item: chatItem,
      }).promise();
    }

    // Store message in Messages table
    const messageItem = {
      messageId: { S: messageId },
      chatId: { S: chatId },
      senderId: { S: senderId },
      recipientId: { S: recipientId },
      messageType: { S: 'memory' },
      content: { S: memoryUrl },
      timestamp: { S: timestamp },
      status: { S: 'sent' },
      senderPhone: senderPhone ? { S: senderPhone } : null,
      senderName: senderName ? { S: senderName } : { S: 'Unknown' },
      receiverName: receiverName ? { S: receiverName } : { S: 'Unknown' },
      receiverPhone: receiverPhone ? { S: receiverPhone } : null,
      faceUrl: faceUrl ? { S: faceUrl } : null,
    };

    await dynamoDB.putItem({
      TableName: 'Messages',
      Item: messageItem,
    }).promise();

    res.status(200).send({ success: true, data: { chatId, messageId } });
  } catch (error) {
    console.error('Error sharing memory:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.post('/shareMemoryToGroup', async (req, res) => {
  const { senderId, memberIds, memoryUrl, flashbackId, senderName, senderPhone } = req.body;
  
  console.log('Received share memory to group request:', { senderId, memberIds, memoryUrl, flashbackId });
  
  try {
    // Input validation
    if (!senderId || !memberIds || !Array.isArray(memberIds) || !memoryUrl || !flashbackId) {
      return res.status(400).send({
        success: false,
        error: 'Missing required fields'
      });
    }

    const timestamp = new Date().toISOString();
    const messageId = require('crypto').randomBytes(16).toString('hex');
    
    // Include sender in members and sort for consistency
    const allMembers = [...new Set([senderId, ...memberIds])];
    const participants = allMembers.sort().join('#');

    // Check for existing group chat
    const existingChatResponse = await dynamoDB.query({
      TableName: 'Chats',
      IndexName: 'ParticipantsIndex',
      KeyConditionExpression: 'participants = :participants',
      ExpressionAttributeValues: {
        ':participants': { S: participants }
      }
    }).promise();

    let chatId;
    if (existingChatResponse.Items && existingChatResponse.Items.length > 0) {
      chatId = existingChatResponse.Items[0].chatId.S;
      
      // Update existing chat
      await dynamoDB.updateItem({
        TableName: 'Chats',
        Key: {
          chatId: { S: chatId }
        },
        UpdateExpression: 'SET lastMessageAt = :timestamp, lastMessageId = :messageId',
        ExpressionAttributeValues: {
          ':timestamp': { S: timestamp },
          ':messageId': { S: messageId }
        }
      }).promise();
    } else {
      // Create new group chat
      chatId = require('crypto').randomBytes(16).toString('hex');
      
      const chatItem = {
        chatId: { S: chatId },
        participants: { S: participants },
        isGroup: { BOOL: true },
        createdAt: { S: timestamp },
        lastMessageAt: { S: timestamp },
        lastMessageId: { S: messageId },
        senderPhone: { S: senderPhone },
        senderName: { S: senderName },
        memberIds: { SS: allMembers }
      };

      await dynamoDB.putItem({
        TableName: 'Chats',
        Item: chatItem
      }).promise();
    }

    // Create message
    const messageItem = {
      messageId: { S: messageId },
      chatId: { S: chatId },
      senderId: { S: senderId },
      messageType: { S: 'memory' },
      content: { S: memoryUrl },
      flashbackId: { S: flashbackId },
      timestamp: { S: timestamp },
      status: { S: 'sent' },
      senderPhone: { S: senderPhone },
      senderName: { S: senderName },
    };

    await dynamoDB.putItem({
      TableName: 'Messages',
      Item: messageItem
    }).promise();

    // Send notifications to all members except sender
    const notificationPromises = memberIds
      .filter(memberId => memberId !== senderId)
      .map(memberId => 
        sendPushNotification(memberId, senderName, {
          title: 'New Memory in Group',
          body: `${senderName} shared a memory in the group`,
          data: {
            type: 'memory_share',
            chatId,
            messageId,
            senderId,
            memoryUrl,
            isGroup: true
          }
        })
      );

    await Promise.all(notificationPromises);

    res.status(200).send({
      success: true,
      data: {
        chatId,
        messageId
      }
    });

  } catch (error) {
    console.error('Error sharing memory to group:', error);
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});

// Add endpoint to fetch shared memories in a chat
app.get('/getChatMemories/:chatId', async (req, res) => {
  const { chatId } = req.params;

  try {
    const params = {
      TableName: 'Messages',
      KeyConditionExpression: 'chatId = :chatId',
      FilterExpression: 'message_type = :type',
      ExpressionAttributeValues: {
        ':chatId': { S: chatId },
        ':type': { S: 'memory' }
      }
    };

    const result = await dynamoDB.query(params).promise();
    
    res.status(200).send({
      success: true,
      memories: result.Items
    });
  } catch (error) {
    console.error('Error fetching chat memories:', error);
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});


const updateUserProfile = async (userPhoneNumber, updates) => {

  const params = {
    TableName: 'flashback_mobile_users',
    Key: {
      user_phone_number: userPhoneNumber
    },
    UpdateExpression: 'set',
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: 'ALL_NEW'
  };


  const updateParts = [];
  
  if (updates.displayName) {
    updateParts.push('#on = :name');
    params.ExpressionAttributeNames['#on'] = 'user_name';
    params.ExpressionAttributeValues[':name'] = updates.displayName;
  }

  if (updates.displaypictureurl) {
    updateParts.push('#dp = :url');
    params.ExpressionAttributeNames['#dp'] = 'displaypictureurl';
    params.ExpressionAttributeValues[':url'] = updates.displaypictureurl;
  }

  if (updates.coverpictureurl) {
    updateParts.push('#cp = :url');
    params.ExpressionAttributeNames['#cp'] = 'coverpictureurl';
    params.ExpressionAttributeValues[':url'] = updates.coverpictureurl;
  }

  if (updateParts.length === 0) {
    throw new Error('No updates provided');
  }

  params.UpdateExpression += ' ' + updateParts.join(', ');

  try {
    const result = await docClient.update(params).promise();
    console.log('Update result:', result);
    return result.Attributes;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user profile');
  }
};


app.post('/updateCoverPicture/:userPhoneNumber', upload.single('image'), async (req, res) => {
  const { userPhoneNumber } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const MAX_SIZE = 15 * 1024 * 1024; // 15MB
  const COVER_TARGET_WIDTH = 800;
  const COVER_TARGET_HEIGHT = 300;

  
  if (req.file.size > MAX_SIZE) {
    return res.status(400).json({ error: 'Image too large. Maximum size is 15MB' });
  }
  
  try {
    // Get original metadata
    const metadata = await sharp(req.file.buffer).metadata();

    // Process image
    const compressedImageBuffer = await sharp(req.file.buffer)
      // Resize while maintaining aspect ratio
      .resize({
        width: COVER_TARGET_WIDTH,
        height: COVER_TARGET_HEIGHT,
        fit: 'cover',
        position: 'centre'
      })
      // Optimize for profile pictures
      .jpeg({ 
        quality: 85,            // Good balance between quality and size
        progressive: true,      // Better loading experience
        chromaSubsampling: '4:4:4',  // Better quality for faces
        force: false           // Preserve original format if it's better
      })
      .toBuffer();
      
      
    const key = `${userPhoneNumber}_cover.jpg`;
    const formattedkey = encodeURIComponent(userPhoneNumber) + '_cover.jpg';
    
    // Upload to S3 with optimized settings
    await s3.putObject({
      Bucket: 'flashbackuserdisplaypicture',
      Key: key,
      Body: compressedImageBuffer,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
      Metadata: {
        'original-size': req.file.size.toString(),
        'original-width': metadata.width.toString(),
        'original-height': metadata.height.toString(),
        'compressed-size': compressedImageBuffer.length.toString(),
        'final-width': COVER_TARGET_WIDTH.toString(),
        'final-height': COVER_TARGET_HEIGHT.toString()
      }
    }).promise();

    const s3Url = `https://flashbackuserdisplaypicture.s3.ap-south-1.amazonaws.com/${formattedkey}`;
    const updatedUser = await updateUserProfile(userPhoneNumber, {
      coverpictureurl: s3Url
    });

    res.status(200).json({
      message: 'Cover picture updated successfully',
      user: updatedUser,
      imageStats: {
        originalSize: req.file.size,
        originalDimensions: `${metadata.width}x${metadata.height}`,
        compressedSize: compressedImageBuffer.length,
        finalDimensions: `${COVER_TARGET_WIDTH}x${COVER_TARGET_HEIGHT}`,
        compressionRatio: ((1 - (compressedImageBuffer.length / req.file.size)) * 100).toFixed(2) + '%'
      }
    });
  } catch (error) {
    logger.error('Error updating cover picture:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/updateProfilePicture/:userPhoneNumber', upload.single('image'), async (req, res) => {
  const { userPhoneNumber } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const MAX_SIZE = 15 * 1024 * 1024; // 15MB
  const TARGET_SIZE = 200; // 200x200px is a good size for profile pictures
  
  if (req.file.size > MAX_SIZE) {
    return res.status(400).json({ error: 'Image too large. Maximum size is 15MB' });
  }

  logger.info(`Updating profile display picture for : ${userPhoneNumber}`);
  
  try {
    // Get original metadata
    const metadata = await sharp(req.file.buffer).metadata();

    // Process image
    const compressedImageBuffer = await sharp(req.file.buffer)
      // Resize while maintaining aspect ratio
      .resize({
        width: TARGET_SIZE,
        height: TARGET_SIZE,
        fit: 'cover',
        position: 'centre'
      })
      // Optimize for profile pictures
      .jpeg({ 
        quality: 85,            // Good balance between quality and size
        progressive: true,      // Better loading experience
        chromaSubsampling: '4:4:4',  // Better quality for faces
        force: false           // Preserve original format if it's better
      })
      .toBuffer();
      
      
    const key = `${userPhoneNumber}.jpg`;
    const formattedkey = encodeURIComponent(userPhoneNumber) + '.jpg';
    
    // Upload to S3 with optimized settings
    await s3.putObject({
      Bucket: 'flashbackuserdisplaypicture',
      Key: key,
      Body: compressedImageBuffer,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
      Metadata: {
        'original-size': req.file.size.toString(),
        'original-width': metadata.width.toString(),
        'original-height': metadata.height.toString(),
        'compressed-size': compressedImageBuffer.length.toString(),
        'final-width': TARGET_SIZE.toString(),
        'final-height': TARGET_SIZE.toString()
      }
    }).promise();

    const s3Url = `https://flashbackuserdisplaypicture.s3.ap-south-1.amazonaws.com/${formattedkey}`;
    const updatedUser = await updateUserProfile(userPhoneNumber, {
      displaypictureurl: s3Url
    });

    logger.info(`Successfully updated profile picture for : ${userPhoneNumber}`, {
      originalSize: req.file.size,
      compressedSize: compressedImageBuffer.length,
      compressionRatio: ((1 - (compressedImageBuffer.length / req.file.size)) * 100).toFixed(2) + '%'
    });

    res.status(200).json({
      message: 'Profile picture updated successfully',
      user: updatedUser,
      imageStats: {
        originalSize: req.file.size,
        originalDimensions: `${metadata.width}x${metadata.height}`,
        compressedSize: compressedImageBuffer.length,
        finalDimensions: `${TARGET_SIZE}x${TARGET_SIZE}`,
        compressionRatio: ((1 - (compressedImageBuffer.length / req.file.size)) * 100).toFixed(2) + '%'
      }
    });
  } catch (error) {
    logger.error('Error updating profile picture:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/updateProfile/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;
  const { displayName } = req.body;  // Changed from req.body.body

  logger.info(`Updating profile name for : ${userPhoneNumber}`);
  
  try {
    if (!displayName || displayName.trim().length === 0) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const updatedUser = await updateUserProfile(userPhoneNumber, {
      displayName: displayName.trim()
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/getUserProfile/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;

  const params = {
    TableName: 'flashback_mobile_users',
    Key: {
      user_phone_number: userPhoneNumber
    }
  };

  try {

    const result = await docClient.get(params).promise();
    logger.info('getUserProfile result:', result);
    
    if (!result.Item) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: result.Item });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/registerDevice', async (req, res) => {
  const { userId, deviceToken } = req.body;
  
  try {
    // Create an endpoint for the device
    const createEndpointResponse = await sns.createPlatformEndpoint({
      PlatformApplicationArn: MemoryCarrierARN,
      Token: deviceToken,
      CustomUserData: userId
    }).promise();

    // Store the endpoint ARN in DynamoDB
    await dynamoDB.putItem({
      TableName: 'UserDevices',
      Item: {
        user_id: userId,
        endpoint_arn: createEndpointResponse.EndpointArn,
        updated_at: new Date().toISOString()
      }
    }).promise();

    res.status(200).send({
      success: true,
      message: 'Device registered successfully'
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).send({ 
      success: false, 
      error: error.message 
    });
  }
});


async function sendPushNotification(userId, notification) {
  try {
    // Get endpoint ARN for the user
    const userDevice = await dynamoDB.getItem({
      TableName: 'UserDevices',
      Key: {
        user_id: userId
      }
    }).promise();

    if (!userDevice.Item?.endpoint_arn) {
      console.log('No device endpoint found for user:', userId);
      return;
    }

    // Prepare message
    const message = {
      default: notification.body,
      APNS: JSON.stringify({
        aps: {
          alert: {
            title: notification.title,
            body: notification.body
          },
          sound: 'default',
          badge: 1
        },
        data: notification.data
      }),
      GCM: JSON.stringify({
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      })
    };

    // Send notification
    await sns.publish({
      Message: JSON.stringify(message),
      MessageStructure: 'json',
      TargetArn: userDevice.Item.endpoint_arn
    }).promise();

    console.log('Push notification sent successfully to user:', userId);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}


app.post('/createGroupChat', async (req, res) => {
  const { creatorId, memberIds, initialMessage } = req.body;
  
  try {
    // Input validation
    if (!creatorId || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).send({
        success: false,
        error: 'Invalid input parameters'
      });
    }

    const timestamp = new Date().toISOString();
    const chatId = require('crypto').randomBytes(16).toString('hex');
    const messageId = require('crypto').randomBytes(16).toString('hex');

    // Include creator in members if not already included
    const allMembers = new Set([creatorId, ...memberIds]);
    const participants = Array.from(allMembers).sort().join('#');

    // Create group chat
    const chatItem = {
      chatId: { S: chatId },
      participants: { S: participants },
      isGroup: { BOOL: true },
      createdAt: { S: timestamp },
      lastMessageAt: { S: timestamp },
      lastMessageId: { S: messageId },
      creatorId: { S: creatorId },
      memberIds: { SS: Array.from(allMembers) }
    };

    await dynamoDB.putItem({
      TableName: 'Chats',
      Item: chatItem
    }).promise();

    // Create initial message if provided
    if (initialMessage) {
      const messageItem = {
        messageId: { S: messageId },
        chatId: { S: chatId },
        senderId: { S: creatorId },
        messageType: { S: initialMessage.type },
        content: { S: initialMessage.content },
        timestamp: { S: timestamp },
        status: { S: 'sent' }
      };

      if (initialMessage.flashbackId) {
        messageItem.flashbackId = { S: initialMessage.flashbackId };
      }

      await dynamoDB.putItem({
        TableName: 'Messages',
        Item: messageItem
      }).promise();
    }

    // Send notifications to all members except creator
    const notificationPromises = Array.from(allMembers)
      .filter(memberId => memberId !== creatorId)
      .map(memberId => 
        sendPushNotification(memberId, {
          title: 'New Group Chat',
          body: 'You have been added to a new group chat',
          data: {
            type: 'new_group_chat',
            chatId,
            messageId
          }
        })
      );

    await Promise.all(notificationPromises);

    res.status(200).send({
      success: true,
      data: {
        chatId,
        messageId
      }
    });

  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).send({
      success: false,
      error: error.message
    });
  }
});


// Set typing status
app.post('/setTypingStatus', async (req, res) => {
  const { chatId, userId, status } = req.body;
  
  try {
    // Store typing status in a separate DynamoDB table with TTL
    const params = {
      TableName: 'TypingStatus',
      Item: {
        chatId: { S: chatId },
        userId: { S: userId },
        status: { S: status },
        timestamp: { N: Math.floor(Date.now() / 1000).toString() },
        // TTL after 10 seconds
        ttl: { N: (Math.floor(Date.now() / 1000) + 10).toString() }
      }
    };

    await dynamoDB.putItem(params).promise();

    // Get chat members to notify
    const chatDetails = await dynamoDB.getItem({
      TableName: 'bubbleChats',
      Key: { chatId: { S: chatId } }
    }).promise();

    const members = chatDetails.Item.isGroup.BOOL 
      ? chatDetails.Item.memberIds.SS 
      : chatDetails.Item.participants.S.split('#');

    // Notify other members
    const notificationPromises = members
      .filter(memberId => memberId !== userId)
      .map(memberId =>
        sendPushNotification(memberId, 'Typing Status', {
          type: 'typing_status',
          chatId,
          userId,
          status
        })
      );

    await Promise.all(notificationPromises);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error setting typing status:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});


// Update group name
app.post('/updateGroupName', async (req, res) => {
  const { chatId, newName } = req.body;
  
  try {
    const params = {
      TableName: 'Chats',
      Key: {
        chatId: { S: chatId }
      },
      UpdateExpression: 'SET groupName = :name',
      ExpressionAttributeValues: {
        ':name': { S: newName }
      }
    };

    await dynamoDB.updateItem(params).promise();
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error updating group name:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});


// Update message status
app.post('/updateMessageStatus', async (req, res) => {
  const { messageId, status, userId } = req.body;
  
  try {
    const messageParams = {
      TableName: 'Messages',
      Key: {
        messageId: { S: messageId }
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: status }
      }
    };

    await dynamoDB.updateItem(messageParams).promise();

    // Send push notification for 'delivered' status
    if (status === 'delivered') {
      const message = await dynamoDB.getItem({
        TableName: 'Messages',
        Key: { messageId: { S: messageId } }
      }).promise();

      if (message.Item.senderId.S !== userId) {
        await sendPushNotification(message.Item.senderId.S, 'Message Status', {
          title: 'Message Delivered',
          body: 'Your message was delivered',
          data: {
            type: 'message_status',
            messageId,
            status
          }
        });
      }
    }

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});


// Add/update message reaction
app.post('/messageReaction', async (req, res) => {
  const { messageId, userId, emoji } = req.body;
  
  try {
    const params = {
      TableName: 'Messages',
      Key: {
        messageId: { S: messageId }
      },
      UpdateExpression: 'SET reactions.#userId = :emoji',
      ExpressionAttributeNames: {
        '#userId': userId
      },
      ExpressionAttributeValues: {
        ':emoji': { S: emoji }
      }
    };

    await dynamoDB.updateItem(params).promise();

    // Get message details for notification
    const message = await dynamoDB.getItem({
      TableName: 'Messages',
      Key: { messageId: { S: messageId } }
    }).promise();

    // Notify original sender if it's not their own reaction
    if (message.Item.senderId.S !== userId) {
      await sendPushNotification(message.Item.senderId.S, 'New Reaction', {
        title: 'New Reaction',
        body: `Someone reacted to your message with ${emoji}`,
        data: {
          type: 'message_reaction',
          messageId,
          emoji,
          userId
        }
      });
    }

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// Remove message reaction
app.delete('/messageReaction', async (req, res) => {
  const { messageId, userId } = req.body;
  
  try {
    const params = {
      TableName: 'Messages',
      Key: {
        messageId: { S: messageId }
      },
      UpdateExpression: 'REMOVE reactions.#userId',
      ExpressionAttributeNames: {
        '#userId': userId
      }
    };

    await dynamoDB.updateItem(params).promise();
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});


app.post('/startDeviceAnalysis', async (req, res) => {
  const { userPhoneNumber, totalImages = 0 } = req.body;

  try {
    const normalizedPhoneNumber = userPhoneNumber.startsWith('+') ? userPhoneNumber : `+${userPhoneNumber}`;
    const formattedPhoneNumber = normalizedPhoneNumber.replace('+', '');

    // Check for any existing analysis (not just analyzing)
    const queryParams = {
      TableName: 'DeviceAnalysis',
      KeyConditionExpression: 'userPhoneNumber = :phone',
      ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall({
        ':phone': normalizedPhoneNumber
      }),
      ScanIndexForward: false,
      Limit: 1
    };

    const existingAnalysis = await dynamoDB.query(queryParams).promise();
    let analysisId;

    if (existingAnalysis.Items && existingAnalysis.Items.length > 0) {
      const analysis = AWS.DynamoDB.Converter.unmarshall(existingAnalysis.Items[0]);
      analysisId = analysis.analysisId;

      // Update existing record
      const updateParams = {
        TableName: 'DeviceAnalysis',
        Key: AWS.DynamoDB.Converter.marshall({
          userPhoneNumber: normalizedPhoneNumber,
          analysisId: analysisId
        }),
        UpdateExpression: 'SET #status = :status, totalImages = :total, analyzedImages = :analyzed, lastUpdated = :timestamp',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall({
          ':status': 'analyzing',
          ':total': totalImages,
          ':analyzed': 0,
          ':timestamp': Date.now()
        })
      };

      await dynamoDB.updateItem(updateParams).promise();
      return res.json({ success: true, analysisId, resumed: true });
    }

    // Create new analysis if none exists
    analysisId = Date.now().toString();
    const params = {
      TableName: 'DeviceAnalysis',
      Item: AWS.DynamoDB.Converter.marshall({
        userPhoneNumber: normalizedPhoneNumber,
        analysisId: analysisId,
        status: 'analyzing',
        totalImages: totalImages,
        analyzedImages: 0,
        startTime: Date.now(),
        lastUpdated: Date.now()
      })
    };

    await dynamoDB.putItem(params).promise();
    res.json({ success: true, analysisId, resumed: false });
  } catch (error) {
    console.error('Error starting/resuming analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/updateAnalysisStatus/:userPhoneNumber/:analysisId', async (req, res) => {
  const { userPhoneNumber, analysisId } = req.params;
  const { status, totalImages, analyzedImages } = req.body;

  try {
    if (!analysisId || analysisId === 'undefined') {
      return res.status(400).json({ error: 'Invalid analysisId' });
    }

    const params = {
      TableName: 'DeviceAnalysis',
      Key: AWS.DynamoDB.Converter.marshall({
        userPhoneNumber: userPhoneNumber.toString(),
        analysisId: analysisId
      }),
      UpdateExpression: 'SET #status = :status, #analyzed = :analyzed, lastUpdated = :timestamp',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#analyzed': 'analyzedImages'
      },
      ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall({
        ':status': status,
        ':analyzed': analyzedImages,
        ':timestamp': Date.now()
      })
    };

    if (totalImages !== undefined) {
      params.UpdateExpression += ', totalImages = :total';
      params.ExpressionAttributeValues = AWS.DynamoDB.Converter.marshall({
        ...AWS.DynamoDB.Converter.unmarshall(params.ExpressionAttributeValues),
        ':total': totalImages
      });
    }

    await dynamoDB.updateItem(params).promise();
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/uploadDeviceImages-old', upload.array('images'), async (req, res) => {
  const { userPhoneNumber, analysisId } = req.body;
  const files = req.files;

  try {
    // Format phone numbers
    const normalizedPhoneNumber = userPhoneNumber.startsWith('+') ? 
      userPhoneNumber : `+${userPhoneNumber}`;
    const formattedPhoneNumber = normalizedPhoneNumber.replace('+', '');
    
    const uploadResults = [];

    // Upload files to S3
    for (const file of files) {
      const s3Key = `${formattedPhoneNumber}/${file.originalname}`;
      await s3.putObject({
        Bucket: MachineVisionCollectionBucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadTime: new Date().toISOString()
        }
      }).promise();

      uploadResults.push({
        originalName: file.originalname,
        s3Key: s3Key
      });
    }

    // Get latest analysis record
    // const queryParams = {
    //   TableName: 'DeviceAnalysis',
    //   KeyConditionExpression: 'userPhoneNumber = :phone',
    //   ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall({
    //     ':phone': userPhoneNumber
    //   }),
    //   ScanIndexForward: false,
    //   Limit: 1
    // };

    // const result = await dynamoDB.query(queryParams).promise();
    
    // if (result.Items && result.Items.length > 0) {
    //   const analysis = AWS.DynamoDB.Converter.unmarshall(result.Items[0]);

      // Update analysis progress
      const updateParams = {
        TableName: 'DeviceAnalysis',
        Key: AWS.DynamoDB.Converter.marshall({
          userPhoneNumber: normalizedPhoneNumber,
          analysisId: analysisId
        }),
        UpdateExpression: 'SET analyzedImages = analyzedImages + :inc, lastUpdated = :now',
        ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall({
          ':inc': files.length,
          ':now': Date.now()
        })
      };

      await dynamoDB.updateItem(updateParams).promise();

    res.json({ 
      success: true, 
      uploadedFiles: uploadResults 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: error.message });
  }
});
// Generate a Data Encryption Key (DEK) using AWS KMS
async function generateKmsKey() {
  const response = await kms.generateDataKey({
      KeyId: KMS_KEY_ID,
      KeySpec: "AES_256",
  }).promise();

  return { encryptedKey: response.CiphertextBlob, plainKey: response.Plaintext };
}

// Encrypt Image Using AES-256-CBC
async function encryptImage(buffer) {
  const { encryptedKey, plainKey } = await generateKmsKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", plainKey, iv);

  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { encryptedData: encrypted, iv, encryptedKey };
}

app.post('/uploadGenMemoryRefImageToS3', async (req, res) => {
  try {
    const { image, filename, userPhoneNumber } = req.body;
    logger.info(`Memory Share: Uploading image ${filename} for user ${userPhoneNumber}`);

    if (!image || !filename || !userPhoneNumber) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Remove '+' from userPhoneNumber
    const cleanPhoneNumber = userPhoneNumber.replace('+', '');

    // Decode base64 image
    const imageBuffer = Buffer.from(image, 'base64');

    // Construct the S3 key with userPhoneNumber folder
    const s3Key = `${cleanPhoneNumber}/${filename}`;

    // S3 upload parameters
    const params = {
      Bucket: 'flashbackgenai',
      Key: s3Key,
      Body: imageBuffer,
      ContentType: 'image/jpeg', // Adjust based on actual image type if needed
    };

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();

    res.status(200).json({
      success: true,
      url: uploadResult.Location, // The URL of the uploaded file
    });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image to S3',
    });
  }
});


app.post('/uploadmemoriesToS3', async (req, res) => {
  try {
    const { image, filename, userPhoneNumber } = req.body;
    logger.info(`Memory Share: Uploading image ${filename} for user ${userPhoneNumber}`);

    if (!image || !filename || !userPhoneNumber) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Remove '+' from userPhoneNumber
    const cleanPhoneNumber = userPhoneNumber.replace('+', '');

    // Decode base64 image
    const imageBuffer = Buffer.from(image, 'base64');

    // Construct the S3 key with userPhoneNumber folder
    const s3Key = `${cleanPhoneNumber}/${filename}`;

    // S3 upload parameters
    const params = {
      Bucket: 'flashbacksharedmemories',
      Key: s3Key,
      Body: imageBuffer,
      ContentType: 'image/jpeg', // Adjust based on actual image type if needed
    };

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();

    res.status(200).json({
      success: true,
      url: uploadResult.Location, // The URL of the uploaded file
    });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image to S3',
    });
  }
});

// Upload API: Encrypts Image Before Uploading to S3
app.post("/uploadDeviceImages", upload.array("images"), async (req, res) => {
  const { userPhoneNumber,analysisId } = req.body;
  const files = req.files;

  try {
      // Format phone numbers
      const normalizedPhoneNumber = userPhoneNumber.startsWith("+")
          ? userPhoneNumber
          : `+${userPhoneNumber}`;
      const formattedPhoneNumber = normalizedPhoneNumber.replace("+", "");

      const uploadResults = [];

      // Encrypt & Upload images to S3
      for (const file of files) {
          const { encryptedData, iv, encryptedKey } = await encryptImage(file.buffer);
          const s3Key = `${formattedPhoneNumber}/${file.originalname}`;

          await s3.putObject({
              Bucket: MachineVisionCollectionBucketName,
              Key: s3Key,
              Body: encryptedData,
              Metadata: {
                  iv: iv.toString("base64"),
                  encryptedKey: encryptedKey.toString("base64"),
                  encryption: "AES-256-CBC"
              }
          }).promise();

          uploadResults.push({
              originalName: file.originalname,
              s3Key: s3Key
          });
      }
      // Update analysis progress
      const updateParams = {
        TableName: 'DeviceAnalysis',
        Key: AWS.DynamoDB.Converter.marshall({
          userPhoneNumber: normalizedPhoneNumber,
          analysisId: analysisId
        }),
        UpdateExpression: 'SET analyzedImages = analyzedImages + :inc, lastUpdated = :now',
        ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall({
          ':inc': files.length,
          ':now': Date.now()
        })
      };

      await dynamoDB.updateItem(updateParams).promise();


      res.json({
          success: true,
          uploadedFiles: uploadResults,
      });
  } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ error: error.message });
  }
});

// Function to extract bucket and key from an S3 URL
function extractS3Details(imageUrl) {
  const urlParts = new URL(imageUrl);
  const bucketName = urlParts.hostname.split(".")[0]; // Extract bucket name
  const key = decodeURIComponent(urlParts.pathname.substring(1)); // Extract key
  return { bucketName, key };
}

// Decrypt Image Function
async function decryptImage(encryptedBuffer, ivBase64, encryptedKeyBase64) {
  const decryptedKeyResponse = await kms.decrypt({
      CiphertextBlob: Buffer.from(encryptedKeyBase64, "base64"),
  }).promise();

  const decryptedKey = decryptedKeyResponse.Plaintext;
  const iv = Buffer.from(ivBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", decryptedKey, iv);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

// API to Download & Decrypt Image using Image URL
app.post("/downloadImageEnc", async (req, res) => {
  const { imageUrl } = req.body; // Example: "https://your-bucket.s3.amazonaws.com/user123/image.enc"

  try {
      const { bucketName, key } = extractS3Details(imageUrl);

      logger.info(`Extracted Bucket: ${bucketName}, Key: ${key}`);

      // Fetch encrypted image from S3
      const response = await s3.getObject({
          Bucket: bucketName,
          Key: key,
      }).promise();

      const encryptedImage = response.Body;
      const iv = response.Metadata.iv;
      const encryptedKey = response.Metadata.encryptedkey;

      if (!iv || !encryptedKey) {
          return res.status(400).json({ error: "Missing encryption metadata" });
      }

      // Decrypt the image
      const decryptedImage = await decryptImage(encryptedImage, iv, encryptedKey);
       logger.info(`Extracted Image for S3Url: `,imageUrl);
      // Set response headers and serve the decrypted image
      res.setHeader("Content-Type", "image/jpeg");
      res.send(decryptedImage);
  } catch (error) {
      console.error("Error fetching/decrypting image:", error);
      res.status(500).json({ error: "Failed to retrieve image" });
  }
});

// Add this to your backend API endpoints
app.get('/getAnalysisProgress/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;

  try {
    const normalizedPhoneNumber = userPhoneNumber.startsWith('+') ? 
      userPhoneNumber : `+${userPhoneNumber}`;

    const params = {
      TableName: 'DeviceAnalysis',
      KeyConditionExpression: 'userPhoneNumber = :phone',
      ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall({
        ':phone': normalizedPhoneNumber
      }),
      ScanIndexForward: false,
      Limit: 1
    };

    const result = await dynamoDB.query(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return res.json({
        success: true,
        progress: {
          totalImages: 0,
          analyzedImages: 0,
          status: 'idle'
        }
      });
    }

    const analysis = AWS.DynamoDB.Converter.unmarshall(result.Items[0]);
    
    res.json({
      success: true,
      progress: {
        totalImages: analysis.totalImages,
        analyzedImages: analysis.analyzedImages,
        status: analysis.status,
        analysisId: analysis.analysisId
      }
    });
  } catch (error) {
    console.error('Error fetching analysis progress:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/getCurrentAnalysis/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;
  
  try {
    const normalizedPhoneNumber = userPhoneNumber.startsWith('+') ? 
      userPhoneNumber : `+${userPhoneNumber}`;

    const params = {
      TableName: 'DeviceAnalysis',
      KeyConditionExpression: 'userPhoneNumber = :phone',
      ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall({
        ':phone': normalizedPhoneNumber
      }),
      ScanIndexForward: false,
      Limit: 1
    };

    const result = await dynamoDB.query(params).promise();
    
    if (result.Items && result.Items.length > 0) {
      const analysis = AWS.DynamoDB.Converter.unmarshall(result.Items[0]);
      res.json({ success: true, analysis });
    } else {
      res.json({ success: true, analysis: null });
    }
  } catch (error) {
    console.error('Error fetching current analysis:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/getAnalyzedImages/:userPhoneNumber', async (req, res) => {
  const { userPhoneNumber } = req.params;
  const { lastEvaluatedKey } = req.query;

  try {
    const params = {
      TableName: 'DeviceImages',
      KeyConditionExpression: 'userPhoneNumber = :phone',
      ExpressionAttributeValues: {
        ':phone': userPhoneNumber
      },
      Limit: 20
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
    }

    const result = await dynamoDB.query(params).promise();

    res.status(200).json({
      success: true,
      images: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey
    });
  } catch (error) {
    console.error('Error fetching analyzed images:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/checkNewImages', async (req, res) => {
  const { userPhoneNumber, lastAnalysisTimestamp } = req.body;

  try {
    const params = {
      TableName: 'DeviceAnalysis',
      Key: {
        userPhoneNumber: userPhoneNumber
      }
    };

    const result = await dynamoDB.getItem(params).promise();
    const currentAnalysis = result.Item;

    const s3Objects = await s3.listObjectsV2({
      Bucket: MachineVisionCollectionBucketName,
      Prefix: `${userPhoneNumber}/`
    }).promise();

    const hasNewImages = s3Objects.Contents.some(obj => 
      new Date(obj.LastModified).getTime() > lastAnalysisTimestamp
    );

    res.json({ 
      success: true, 
      hasNewImages,
      currentAnalysis 
    });
  } catch (error) {
    console.error('Error checking new images:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/processNewImages', async (req, res) => {
  const { userPhoneNumber } = req.body;
  const images = JSON.parse(req.body.images);

  try {
    for (const image of images) {
      const s3Key = `${userPhoneNumber}/${image.fileName}`;
      
      await s3.putObject({
        Bucket: MachineVisionCollectionBucketName,
        Key: s3Key,
        Body: image.data,
        ContentType: image.type
      }).promise();

      const params = {
        TableName: 'DeviceAnalysis',
        Key: {
          userPhoneNumber: userPhoneNumber
        },
        UpdateExpression: 'SET analyzedImages = analyzedImages + :inc, lastUpdated = :now',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':now': Date.now()
        }
      };

      await dynamoDB.update(params).promise();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing new images:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/identify-folders', async (req, res) => {
  const userId = req.query.user_id;

  logger.info(`Received request to fetch identified images for user_id: ${userId}`);

  // Validate user_id
  if (!userId) {
      logger.info("Validation failed: user_id is missing in the request");
      return res.status(400).json({ message: "user_id is required" });
  }

  try {
      let uniqueFolderNames = new Set(); // Using a Set to automatically handle duplicates
      let lastEvaluatedKey = null;

      do {
          // Ensure userId matches the DynamoDB expected type (String in this case)
          const params = {
              TableName: 'machinevision_indexed_data', // Replace with your DynamoDB table name
              IndexName: 'user_id-folder_name-index', // Replace with your GSI/Index name
              KeyConditionExpression: 'user_id = :user_id',
              ExpressionAttributeValues: {
                  ':user_id': { S: userId } // Match the DynamoDB String type (S)
              },
              ProjectionExpression: 'folder_name', // Fetch only the folder_name attribute
              ExclusiveStartKey: lastEvaluatedKey // Set the LastEvaluatedKey for paginated queries
          };


          // Execute the query
          const result = await docClient.query(params).promise();

          logger.info(`Fetched ${result.Items.length} items from DynamoDB`);

          // Add folder names to the set
          result.Items.forEach(item => uniqueFolderNames.add(item.folder_name.S));

          // Update the last evaluated key
          lastEvaluatedKey = result.LastEvaluatedKey;

          if (lastEvaluatedKey) {
              logger.info(`LastEvaluatedKey found, continuing query: ${JSON.stringify(lastEvaluatedKey)}`);
          }
      } while (lastEvaluatedKey); // Continue querying until LastEvaluatedKey is null

      // Convert the set to an array for the response
      const folderNamesArray = Array.from(uniqueFolderNames);

      logger.info(`Unique folder names fetched for user_id ${userId}: ${folderNamesArray}`);

      res.status(200).json({ folder_names: folderNamesArray });
  } catch (err) {
      logger.error(`Error fetching folder names for user_id ${userId}: ${err.message}`, { error: err });
      res.status(500).json({ message: "Error fetching folder names", error: err.message });
  }
});

async function getRequestByOwnerAndRequestor(owner_number, requester_number) {
  try {
    const params = {
      TableName: 'user_flashback_image_requests',
      IndexName: 'owner_number-requester_number-index',
      KeyConditionExpression: 'owner_number = :owner AND requester_number = :requester',
      ExpressionAttributeValues: {
        ':owner': owner_number,
        ':requester': requester_number
      }
    };

    const result = await docClient.query(params).promise();
    
    // If at least one item is found, return the first; otherwise, return null.
    return (result.Items && result.Items.length > 0) ? result.Items[0] : null;

  } catch (err) {
    // Log the error and rethrow or handle as needed
    logger.error(`Error retrieving request for owner_number: ${owner_number}, requester_number: ${requester_number}`, err);
    throw err; 
  }
}

app.post('/user-images/request', async (req, res) => {
    const { request_id, requester_number, owner_number, status } = req.body;

    // Determine if it's a create or update operation
    if (!status && !request_id) {
        // **CREATE REQUEST**
        logger.info(`Received request creation from requester_number: ${requester_number} to owner_number: ${owner_number}`);

        // Validate input for request creation
        if (!requester_number || !owner_number) {
            logger.info("Validation failed: Invalid request data");
            return res.status(400).json({ message: "Invalid request data" });
        }

        try {
            existingRequest = await getRequestByOwnerAndRequestor(owner_number,requester_number)
            console.log(existingRequest)
            if(existingRequest && existingRequest.status === 'pending'){
              return res.status(200).json({ message: "Request existing", request_id: existingRequest.request_id });
            }
            // Generate a shorter request ID
            const requestId = crypto.randomBytes(4).toString('hex'); // Generates an 8-character ID

            // Prepare the request data
            const requestItem = {
                TableName: 'user_flashback_image_requests', // Replace with your DynamoDB table name
                Item: {
                    request_id: requestId,
                    requester_number: requester_number,
                    owner_number: owner_number,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            };

            logger.info(`Storing request in DynamoDB: ${JSON.stringify(requestItem)}`);

            // Save the request in DynamoDB
            await docClient.put(requestItem).promise();

            return res.status(200).json({ message: "Request created successfully", request_id: requestId });
        } catch (err) {
            logger.error(`Error creating request: ${err.message}`, { error: err });
            return res.status(500).json({ message: "Error creating request", error: err.message });
        }
    } else if (status && request_id) {
        // **UPDATE REQUEST**
        logger.info(`Received request update for request_id: ${request_id} with new status: ${status}`);

        // Validate input for request update
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            logger.info("Validation failed: Invalid status value");
            return res.status(400).json({ message: "Invalid status value" });
        }

        try {
            // Update the request status in DynamoDB
            const params = {
                TableName: 'user_flashback_image_requests', // Replace with your DynamoDB table name
                Key: {
                    request_id: request_id // Primary Key of the table
                },
                UpdateExpression: 'SET #status = :status, updated_at = :updated_at',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: {
                    ':status': status,
                    ':updated_at': new Date().toISOString()
                },
                ReturnValues: 'UPDATED_NEW'
            };

            logger.info(`Updating request in DynamoDB with params: ${JSON.stringify(params)}`);

            const result = await docClient.update(params).promise();

            return res.status(200).json({ message: "Request updated successfully", updated_fields: result.Attributes });
        } catch (err) {
            logger.error(`Error updating request: ${err.message}`, { error: err });
            return res.status(500).json({ message: "Error updating request", error: err.message });
        }
    } else {
        // Invalid request
        logger.info("Validation failed: Insufficient data for operation");
        return res.status(400).json({ message: "Insufficient data for operation" });
    }
});

app.get('/user-images/request', async (req, res) => {
  const { user_phone_number } = req.query;

  logger.info(`Received request to fetch all requests for user_id: ${user_phone_number}`);

  // Validate input
  if (!user_phone_number) {
      logger.info("Validation failed: user_phone_number is required");
      return res.status(400).json({ message: "user_phone_number is required" });
  }

  try {
      // Define query parameters for both types of requests
      const requestedByMeParams = {
          TableName: 'user_flashback_image_requests',
          IndexName: 'requester_number-index', // Assuming a GSI exists for requester_id
          KeyConditionExpression: 'requester_number = :user_phone_number',
          ExpressionAttributeValues: {
              ':user_phone_number': user_phone_number
          }
      };

      const toMeParams = {
          TableName: 'user_flashback_image_requests',
          IndexName: 'owner_number-index', // Assuming a GSI exists for owner_id
          KeyConditionExpression: 'owner_number = :user_phone_number',
          ExpressionAttributeValues: {
              ':user_phone_number': user_phone_number
          }
      };

      logger.info(`Querying DynamoDB for requested_by_me with params: ${JSON.stringify(requestedByMeParams)}`);
      const requestedByMeResult = await docClient.query(requestedByMeParams).promise();

      logger.info(`Querying DynamoDB for to_me with params: ${JSON.stringify(toMeParams)}`);
      const toMeResult = await docClient.query(toMeParams).promise();

      // Combine results
      const response = {
          requested_by_me: requestedByMeResult.Items,
          to_me: toMeResult.Items
      };

      logger.info(`Fetched ${requestedByMeResult.Items.length} requested_by_me requests and ${toMeResult.Items.length} to_me requests`);

      res.status(200).json(response);
  } catch (err) {
      logger.error(`Error fetching requests for user_id ${user_phone_number}: ${err.message}`, { error: err });
      res.status(500).json({ message: "Error fetching requests", error: err.message });
  }
});

app.get('/user-images/folder', async (req, res) => {
  const { user_id, folder_name } = req.query;

  logger.info(`Received request to fetch images for user_id: ${user_id} in folder: ${folder_name}`);

  // Validate input
  if (!user_id || !folder_name) {
      logger.info("Validation failed: user_id and folder_name are required");
      return res.status(400).json({ message: "user_id and folder_name are required" });
  }

  try {
      let records = [];
      let lastEvaluatedKey = null;

      do {
          // Define query parameters
          const params = {
              TableName: 'machinevision_indexed_data', // Replace with your DynamoDB table name
              IndexName: 'user_id-folder_name-index', // Replace with your GSI name
              KeyConditionExpression: 'folder_name = :folder_name AND user_id = :user_id',
              ExpressionAttributeValues: {
                  ':folder_name': folder_name,
                  ':user_id': user_id
              },
              ExclusiveStartKey: lastEvaluatedKey // Continue from the last evaluated key
          };

          logger.info(`Querying DynamoDB with params: ${JSON.stringify(params)}`);

          // Query DynamoDB
          const result = await docClient.query(params).promise();

          logger.info(`Fetched ${result.Items.length} records for this page`);

          // Append the complete records to the array
          records = records.concat(result.Items);

          // Update LastEvaluatedKey
          lastEvaluatedKey = result.LastEvaluatedKey;

          if (lastEvaluatedKey) {
              logger.info(`LastEvaluatedKey found, continuing to the next page: ${JSON.stringify(lastEvaluatedKey)}`);
          }
      } while (lastEvaluatedKey); // Continue querying until LastEvaluatedKey is null

      logger.info(`Fetched a total of ${records.length} records for user_id: ${user_id} in folder: ${folder_name}`);

      // Respond with the complete records
      res.status(200).json({ records });
  } catch (err) {
      logger.error(`Error fetching images for user_id ${user_id} in folder ${folder_name}: ${err.message}`, { error: err });
      res.status(500).json({ message: "Error fetching images", error: err.message });
  }
});

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

app.post('/transfer/user-images', async (req, res) => {
    const { requests } = req.body;

    logger.info(`Received request to process ${requests?.length || 0} image requests`);

    // Validate input
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
        logger.info("Validation failed: requests must be a non-empty array");
        return res.status(400).json({ message: "Invalid input. 'requests' must be a non-empty array" });
    }

    try {
        // Validate and process each request
        const putRequests = requests.map((request, index) => {
            if (
                !request.s3_url ||
                !request.owner_number ||
                !request.requester_number ||
                !request.request_status ||
                !request.image_id
            ) {
                throw new Error(`Missing required fields in request at index ${index}`);
            }

            return {
                PutRequest: {
                    Item: {
                        request_id: crypto.randomBytes(4).toString('hex'), // Generate unique request_id
                        image_id: request.image_id,
                        s3_url: request.s3_url,
                        owner_number: request.owner_number,
                        requester_number: request.requester_number,
                        request_status: request.request_status,
                        updated_date: new Date().toISOString() // Add updated_date dynamically
                    }
                }
            };
        });

        // Split requests into batches of 25
        const batches = chunkArray(putRequests, 25);
        logger.info(`Processing ${batches.length} batches of requests`);

        // Write each batch sequentially and handle retries for unprocessed items
        for (const batch of batches) {
            let unprocessedItems = batch;

            for (let retry = 0; retry < 5 && unprocessedItems.length > 0; retry++) {
                const params = {
                    RequestItems: {
                      user_images_transfer_data : unprocessedItems
                    }
                };

                logger.info(`Writing batch of ${unprocessedItems.length} items to DynamoDB (Retry ${retry + 1})`);
                const result = await docClient.batchWrite(params).promise();

                // Check for unprocessed items
                unprocessedItems = result.UnprocessedItems?.image_requests || [];
                if (unprocessedItems.length > 0) {
                    logger.warn(`Retrying ${unprocessedItems.length} unprocessed items`);
                }
            }

            if (unprocessedItems.length > 0) {
                logger.error(`Failed to process some items after 5 retries: ${JSON.stringify(unprocessedItems)}`);
                throw new Error(`Unprocessed items remaining: ${JSON.stringify(unprocessedItems)}`);
            }
        }

        res.status(200).json({ message: "Requests processed successfully" });
    } catch (err) {
        logger.error(`Error processing requests: ${err.message}`, { error: err });
        res.status(500).json({ message: "Error processing requests", error: err.message });
    }
});

app.get('/fetch/user-transfer-images', async (req, res) => {
  const { requester_number, owner_number } = req.query;

  logger.info(`Received request to fetch records for requester_number: ${requester_number} and owner_number: ${owner_number}`);

  // Validate input
  if (!requester_number || !owner_number) {
      logger.info("Validation failed: requester_number and owner_number are required");
      return res.status(400).json({ message: "requester_number and owner_number are required" });
  }
  try {
      let s3Urls = [];
      let lastEvaluatedKey = null;

      do {
          const params = {
              TableName: 'user_images_transfer_data', // Replace with your DynamoDB table name
              IndexName: 'requester_number-owner_number-index', // Replace with your GSI name
              KeyConditionExpression: 'requester_number = :requester_number AND owner_number = :owner_number',
              FilterExpression: 'request_status = :status',
              ExpressionAttributeValues: {
                  ':requester_number': requester_number,
                  ':owner_number': owner_number,
                  ':status': 'approved'
              },
              ExclusiveStartKey: lastEvaluatedKey // Continue from the last evaluated key
          };

          logger.info(`Querying DynamoDB with params: ${JSON.stringify(params)}`);

          // Query DynamoDB
          const result = await docClient.query(params).promise();

          logger.info(`Fetched ${result.Items.length} records in this batch`);

          // Extract s3_url values and append to the s3Urls array
          s3Urls = s3Urls.concat(result.Items.map(item => item.s3_url));

          // Update LastEvaluatedKey
          lastEvaluatedKey = result.LastEvaluatedKey;

          if (lastEvaluatedKey) {
              logger.info(`LastEvaluatedKey found, continuing to next batch: ${JSON.stringify(lastEvaluatedKey)}`);
          }
      } while (lastEvaluatedKey); // Continue querying until LastEvaluatedKey is null

      logger.info(`Fetched a total of ${s3Urls.length} s3 URLs with status "approved"`);

      res.status(200).json({ s3_urls: s3Urls });
  } catch (err) {
      logger.error(`Error fetching records: ${err.message}`, { error: err });
      res.status(500).json({ message: "Error fetching records", error: err.message });
  }
});


async function getUserObjectByUserIdMobile(userId){
  try{
    logger.info("getting user info for userId : "+userId);
    params = {
      TableName: userTableName,
      FilterExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };
    const result = await docClient.scan(params).promise();

    if (result.Items.length === 0) {
      logger.info("user details not found for userId: ",userId);
      // throw new Error("userId not found");
      return;
    }
    logger.info("user details fetched successfully");
    return result.Items[0];
  } catch (error) {
    console.error("Error getting user object:", error);
    throw error;
  }
}

//API for merging Users
app.post("/merge-users", async (req, res) => {
  const { user_id_1, user_id_2 } = req.body;

  // Validate input
  if (!user_id_1 || !user_id_2) {
    return res.status(400).json({ error: "Both user_id_1 and user_id_2 are required" });
  }

  const merge_req_id = crypto.randomBytes(4).toString("hex"); // Unique ID for this merge operation
  const merge_status_table = "flashback_user_merge_data";

  try {
    // Initialize merge request status
    logger.info("Initializing merge request status...");
    const mergeStatusInit = {
      TableName: merge_status_table,
      Item: {
        merge_req_id,
        merging_user_id: null, // Placeholder for now
        target_user_id: null,  // Placeholder for now
        merge_status: "IN_PROGRESS",
        failed_step: null,
        timestamp: new Date().toISOString(),
      },
    };
    await docClient.put(mergeStatusInit).promise();

    // Fetch user details
    const user1Details = await getUserObjectByUserId(user_id_1);
    const user2Details = await getUserObjectByUserId(user_id_2);

    let merging_user_id;
    let target_user_id;

    // Determine merging and target user IDs
    if (user1Details && user2Details) {
      logger.info("Both users have phone numbers mapped, cannot merge.");
      return res.status(400).json({
        error: "Cannot merge users as both user_id_1 and user_id_2 have mapped phone numbers.",
      });
    } else if (user1Details && !user2Details) {
      target_user_id = user_id_1;
      merging_user_id = user_id_2;
    } else if (user2Details && !user1Details) {
      target_user_id = user_id_2;
      merging_user_id = user_id_1;
    } else {
      target_user_id = user_id_1;
      merging_user_id = user_id_2;
    }

    // Update merge request status with determined user IDs
    const updateMergeRequestInit = {
      TableName: merge_status_table,
      Key: { merge_req_id },
      UpdateExpression: "SET merging_user_id = :merging, target_user_id = :target",
      ExpressionAttributeValues: {
        ":merging": merging_user_id,
        ":target": target_user_id,
      },
    };
    await docClient.update(updateMergeRequestInit).promise();

    logger.info(`Merging user_id: ${merging_user_id} into target user_id: ${target_user_id}`);

    //External API for `/merge-users` endpoint
    const response = await axios.post("https://52.66.187.182:3000/merge-users/", {
      merging_user_id,
      target_user_id,
    },
    {
      httpsAgent: httpsAgent, // Pass the custom HTTPS agent
    });

    if (response.status === 200) {
      logger.info("FastAPI merge-users call succeeded. Starting data updates.");

      // Call the update method and handle any errors explicitly
      try {
        await updateDataAfterMerge(merge_req_id, merging_user_id, target_user_id);
        return res.status(200).json(response.data);
      } catch (updateError) {
        logger.error("Error during data update after merge:", updateError.message);

        // Update merge request status to FAILED
        const updateMergeStatus = {
          TableName: merge_status_table,
          Key: { merge_req_id },
          UpdateExpression: "SET merge_status = :failed, failed_step = :failedStep",
          ExpressionAttributeValues: {
            ":failed": "FAILED",
            ":failedStep": updateError.message,
          },
        };
        await docClient.update(updateMergeStatus).promise();

        // Send error back to the client
        return res.status(500).json({ error: "Error during data update after merge." });
      }
    }
  } catch (error) {
    logger.error("Error during merge process:", error.message);

    // Update merge request status to FAILED
    const updateMergeStatus = {
      TableName: merge_status_table,
      Key: { merge_req_id },
      UpdateExpression: "SET merge_status = :failed, failed_step = :failedStep",
      ExpressionAttributeValues: {
        ":failed": "FAILED",
        ":failedStep": error.message,
      },
    };
    await docClient.update(updateMergeStatus).promise();

    // Forward error to the client
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const updateDataAfterMerge = async (merge_req_id, merging_user_id, target_user_id, folder_name = null) => {
  try {
    const merge_status_table = "flashback_user_merge_data";

    logger.info(`Starting merge process for request ID: ${merge_req_id}`);

    // 1. Fetch records from `machinevision_indexed_data`
    logger.info("Fetching records from machinevision_indexed_data table...");
    let records = [];
    let lastEvaluatedKey = null;

    do {
      const indexedDataQuery = {
        TableName: "machinevision_indexed_data",
        IndexName: "user_id-folder_name-index", // Use the secondary index
        KeyConditionExpression: folder_name
          ? "user_id = :mergingUserId AND folder_name = :folderName"
          : "user_id = :mergingUserId",
        ExpressionAttributeValues: folder_name
          ? {
              ":mergingUserId": merging_user_id,
              ":folderName": folder_name,
            }
          : {
              ":mergingUserId": merging_user_id,
            },
        ExclusiveStartKey: lastEvaluatedKey,
      };

      const indexedDataResult = await docClient.query(indexedDataQuery).promise();
      records = records.concat(indexedDataResult.Items); // Collect full records
      lastEvaluatedKey = indexedDataResult.LastEvaluatedKey;

      logger.info(`Fetched ${indexedDataResult.Items.length} records. LastEvaluatedKey: ${lastEvaluatedKey}`);
    } while (lastEvaluatedKey);

    logger.info(`Collected ${records.length} records for merging_user_id: ${merging_user_id}.`);

    // Extract face_ids and image_ids for future use
    const faceIds = records.map(record => record.face_id);
    const imageIds = records.map(record => record.image_id);

    logger.info(`Extracted ${faceIds.length} face_ids and ${imageIds.length} image_ids.`);

    // 2. Delete and re-insert records with updated `user_id`
    logger.info("Updating user_id in machinevision_indexed_data table...");
    for (const record of records) {
      // Delete the old record
      const deleteParams = {
        TableName: "machinevision_indexed_data",
        Key: { image_id: record.image_id, user_id: merging_user_id }, // Composite key
      };
      await docClient.delete(deleteParams).promise();

      // Re-insert the record with the new `user_id`
      const updatedRecord = { ...record,user_id_original: record.user_id_original || merging_user_id, user_id: target_user_id };
      const putParams = {
        TableName: "machinevision_indexed_data",
        Item: updatedRecord,
      };
      await docClient.put(putParams).promise();
    }

    logger.info(`Updated ${records.length} records in machinevision_indexed_data table.`);

    // 3. Update `image_recognition` table using collected `image_ids`
    logger.info("Updating user_ids in machinevision_recognition_image_properties table...");
    for (const imageId of imageIds) {
      const getImageParams = {
        TableName: "machinevision_recognition_image_properties",
        Key: { image_id: imageId },
      };

      // Fetch the current record for the image
      const imageResult = await docClient.get(getImageParams).promise();

      if (imageResult.Item) {
        try {
          // Parse `user_ids` from JSON string to an array
          const userIdsArray = JSON.parse(imageResult.Item.user_ids); // Convert JSON string to array

          if (Array.isArray(userIdsArray)) {
            // Replace `merging_user_id` with `target_user_id` in the array
            const updatedUserIds = userIdsArray.map(userId =>
              userId === merging_user_id ? target_user_id : userId
            );

            // Update `user_ids` back to DynamoDB as a JSON string
            const updateParams = {
              TableName: "machinevision_recognition_image_properties",
              Key: { image_id: imageId },
              UpdateExpression: "SET user_ids = :updatedUserIds",
              ExpressionAttributeValues: {
                ":updatedUserIds": JSON.stringify(updatedUserIds), // Convert back to JSON string
              },
            };

            await docClient.update(updateParams).promise();
            logger.info(`Updated user_ids for image_id: ${imageId}`);
          } else {
            logger.warn(`Invalid user_ids format for image_id: ${imageId}. Skipping update.`);
          }
        } catch (parseError) {
          logger.error(`Error parsing user_ids for image_id: ${imageId}: ${parseError.message}`);
        }
      } else {
        logger.warn(`No record found for image_id: ${imageId}.`);
      }
    }
    logger.info(`Completed updates for ${imageIds.length} records in machinevision_recognition_image_properties table.`);

    // 4. Store merge details in `merged_user_details`
    logger.info("Storing merge details...");
    // First update: create merged_details if it doesn't exist
    const initMapParams = {
      TableName: "flashback_user_merge_data",
      Key: { merge_req_id },
      UpdateExpression: "SET #md = if_not_exists(#md, :emptyMap)",
      ExpressionAttributeNames: {
        "#md": "merged_details"
      },
      ExpressionAttributeValues: {
        ":emptyMap": {}
      }
    };
    await docClient.update(initMapParams).promise();

    // Second update: now that merged_details is guaranteed to exist,
    // we can create or modify merged_details.#mId safely
    const initSubMapParams = {
      TableName: "flashback_user_merge_data",
      Key: { merge_req_id },
      UpdateExpression: `
        SET #md.#mId = if_not_exists(#md.#mId, :initObj)
      `,
      ExpressionAttributeNames: {
        "#md": "merged_details",
        "#mId": merging_user_id
      },
      ExpressionAttributeValues: {
        ":initObj": { face_ids: [], image_ids: [] }
      }
    };
    await docClient.update(initSubMapParams).promise();

  
    const appendParams = {
      TableName: "flashback_user_merge_data",
      Key: { merge_req_id },
      UpdateExpression: `
        SET
          #md.#mId.face_ids  = list_append(#md.#mId.face_ids, :newFaces),
          #md.#mId.image_ids = list_append(#md.#mId.image_ids, :newImages)
      `,
      ExpressionAttributeNames: {
        "#md": "merged_details",
        "#mId": merging_user_id
      },
      ExpressionAttributeValues: {
        ":newFaces": faceIds || [],
        ":newImages": imageIds || []
      }
    };
    await docClient.update(appendParams).promise();
  
    logger.info(`Updated merged_details map in flashback_user_merge_data for ${merging_user_id}.`);

  } catch (error) {
    logger.error("Error updating data after merging:", error.message);

    // Update merge request status to FAILED
    const updateMergeStatus = {
      TableName: 'flashback_user_merge_data',
      Key: { merge_req_id },
      UpdateExpression: "SET merge_status = :failed, failed_step = :failedStep",
      ExpressionAttributeValues: {
        ":failed": "FAILED",
        ":failedStep": error.message,
      },
    };
    await docClient.update(updateMergeStatus).promise();

    throw new Error("Data update after merging failed.");
  }
};

app.post("/merge-users-in-phone", async (req, res) => {
  const merge_status_table = "flashback_user_merge_data";
  
  try {
    const { user_ids,phone_number  } = req.body;
    
    // 1. Basic validation
    if (!Array.isArray(user_ids) || user_ids.length < 2) {
      return res
        .status(400)
        .json({ error: "Provide an array of at least 2 user IDs." });
    }
    if (user_ids.length > 10) {
      return res
        .status(400)
        .json({ error: "Merging more than 10 users is not allowed." });
    }

    // 2. Generate a unique ID for this merge request
    const merge_req_id = crypto.randomBytes(4).toString("hex");
    
     // 3. Fetch mappings & user details for all user_ids
    //    This helps figure out which ones have userDetails (non-null).
    let allUserDetails = [];
    for (let localUserId of user_ids) {
      const userMapping = await getMappingByLocalUserAndCollection(localUserId);
      const userDetails = await getUserObjectByUserIdMobile(
        userMapping?.global_user_id ?? localUserId
      );
      allUserDetails.push({
        localUserId,
        globalUserId: userMapping?.global_user_id,
        details: userDetails, // if null => not recognized
      });
    }

    // 4. Determine which user will be the target.
    //    - If exactly one user has non-null userDetails => that user is target
    //    - If more than one user has userDetails => disallow (or handle differently)
    //    - If none => pick the first user in the list as the target
    const recognizedUsers = allUserDetails.filter((u) => u.details != null);

    if (recognizedUsers.length > 1) {
      return res.status(400).json({
        error: "Cannot merge: multiple users already have userDetails (mapped).",
      });
    }

    let targetUser;
    if (recognizedUsers.length === 1) {
      // Exactly one recognized user => target
      targetUser = recognizedUsers[0];
    } else {
      // recognizedUsers is empty => pick first in the array as target
      targetUser = allUserDetails[0];
    }

    const target_user_id = targetUser.localUserId;
    // (Or use targetUser.globalUserId if your external merges require the global ID)

    // Separate merging users (everything except the target)
    const mergingUsers = allUserDetails
    .filter((u) => u.localUserId !== target_user_id)
    .map((u) => u.localUserId);

    // 4. Create the initial merge status record in DynamoDB
    await docClient
      .put({
        TableName: merge_status_table,
        Item: {
          merge_req_id,
          target_user_id,
          user_phone_number:phone_number,
          merged_user_ids: [],       // we'll append merging IDs as we go
          merge_status: "IN_PROGRESS",
          failed_step: null,
          timestamp: new Date().toISOString(),
        },
      })
      .promise();

    const collection = phone_number.replace('+', '');
    const collection_name = 'User' + collection;
    // 5. Merge each user in turn
    for (const merging_user_id of mergingUsers) {
      try {
        // 5a. Call the external "merge-users" API
        console.log(target_user_id)
        console.log()
        const response = await axios.post("https://52.66.187.182:3000/merge-users/",
          {
            merging_user_id,
            target_user_id,
            collection_name,
          },
          { httpsAgent: httpsAgent }
        );

        // 5b. Check success
        if (response.status !== 200) {
          throw new Error(
            `Merging user ${merging_user_id} -> target ${target_user_id} failed with status ${response.status}.`
          );
        }

        // 5c. Update local data if needed
        await updateDataAfterMerge(merge_req_id, merging_user_id, target_user_id);

        // 5d. Append this merging_user_id to the merged_user_ids list in DynamoDB
        await docClient
          .update({
            TableName: merge_status_table,
            Key: { merge_req_id },
            UpdateExpression:
              "SET merged_user_ids = list_append( if_not_exists(merged_user_ids, :emptyList), :newId )",
            ExpressionAttributeValues: {
              ":emptyList": [],
              ":newId": [merging_user_id], // must be wrapped in an array
            },
          })
          .promise();
      } catch (userMergeError) {
        // If merging one user fails, we mark entire operation as FAILED
        console.error("Error merging user:", userMergeError.message);

        await docClient
          .update({
            TableName: merge_status_table,
            Key: { merge_req_id },
            UpdateExpression: "SET merge_status = :failed, failed_step = :step",
            ExpressionAttributeValues: {
              ":failed": "FAILED",
              ":step": userMergeError.message,
            },
          })
          .promise();

        return res
          .status(500)
          .json({ error: "Failed merging a user.", details: userMergeError.message });
      }
    }

    // 6. If we got here, all merges succeeded
    // Mark the entire request as SUCCESS
    await docClient
      .update({
        TableName: merge_status_table,
        Key: { merge_req_id },
        UpdateExpression: "SET merge_status = :success, failed_step = :none",
        ExpressionAttributeValues: {
          ":success": "SUCCESS",
          ":none": null,
        },
      })
      .promise();

    return res.status(200).json({
      message: "All merges completed successfully.",
      merge_req_id,
      target_user_id,
    });
  } catch (error) {
    console.error("Error in merge-multiple-users:", error.message);

    // If we fail before the merge_req_id was created or something else
    // For safety, handle the scenario where 'merge_req_id' might be undefined
    // But in practice, it should exist after "2. Generate a unique ID..."

    // Mark the merge request as FAILED
    await docClient
      .update({
        TableName: merge_status_table,
        Key: { merge_req_id },
        UpdateExpression: "SET merge_status = :failed, failed_step = :step",
        ExpressionAttributeValues: {
          ":failed": "FAILED",
          ":step": error.message,
        },
      })
      .promise()
      .catch((err) => {
        console.error("Error updating merge status to FAILED:", err.message);
      });

    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

const getMappingByLocalUserAndCollection = async (localUserId) => {
  try {
    logger.info(`Fetching mapping for global_user_id=${localUserId}`);

    const params = {
      TableName: GLOBAL_TO_LOCAL_MAPPING_TABLE,
      IndexName: 'local_user_id-index',
      KeyConditionExpression: 'local_user_id = :localUserId',
      ExpressionAttributeValues: {
        ':localUserId': localUserId
      }
    };

    const result = await docClient.query(params).promise();
    return (result.Items && result.Items.length > 0) ? result.Items[0] : undefined; // undefined if not found
  } catch (error) {
    logger.error('Error in getMappingByGlobalUserAndCollection:', error);
    throw error;
  }
};

app.delete('/delete-by-folder/:folderName', async (req, res) => {
  try {
    const folderName = req.params.folderName;
    
    let itemsDeleted = 0;
    let lastEvaluatedKey = null;

    // Query parameters for the index
    const queryParams = {
      TableName: 'machinevision_indexed_data', // Replace with your table name
      IndexName: 'folder_name-index',
      KeyConditionExpression: 'folder_name = :folder',
      ExpressionAttributeValues: {
        ':folder': folderName
      }
    };
    do {
      // If we have a LastEvaluatedKey from previous iteration, add it to params
      if (lastEvaluatedKey) {
        queryParams.ExclusiveStartKey = lastEvaluatedKey;
      }

      // Query items using the index
      const queryResult = await docClient.query(queryParams).promise();
      
      // If no items found in this batch, break the loop
      if (!queryResult.Items || queryResult.Items.length === 0) {
        break;
      }

      logger.info(queryParams)
      // Delete each item found in the batch
      for (const item of queryResult.Items) {
        const deleteImageDataParams = {
          TableName: 'machinevision_indexed_data', // Replace with your table name
          Key: {
            image_id: item.image_id,
            user_id:item.user_id
          }
        };

        await docClient.delete(deleteImageDataParams).promise();
        itemsDeleted++;
        
      }
      logger.info(`deleted items from machinevision_recognition_image_properties : ${itemsDeleted}`)
      // Update LastEvaluatedKey for next iteration
      lastEvaluatedKey = queryResult.LastEvaluatedKey;

    } while (lastEvaluatedKey);

    res.status(200).json({
      message: 'Deletion completed successfully',
      totalItemsDeleted: itemsDeleted
    });

  } catch (error) {
    console.error('Error deleting items:', error);
    res.status(500).json({
      message: 'Error deleting items',
      error: error.message
    });
  }
});

app.delete('/delete-by-folder-images/:folderName', async (req, res) => {
  try {
    const folderName = req.params.folderName;
    
    let itemsDeleted = 0;
    let lastEvaluatedKey = null;

    // Query parameters for the index
    const queryParams = {
      TableName: 'machinevision_recognition_image_properties', // Replace with your table name
      IndexName: 'folder_name-index',
      KeyConditionExpression: 'folder_name = :folder',
      ExpressionAttributeValues: {
        ':folder': folderName
      }
    };
    do {
      // If we have a LastEvaluatedKey from previous iteration, add it to params
      if (lastEvaluatedKey) {
        queryParams.ExclusiveStartKey = lastEvaluatedKey;
      }

      // Query items using the index
      const queryResult = await docClient.query(queryParams).promise();
      
      // If no items found in this batch, break the loop
      if (!queryResult.Items || queryResult.Items.length === 0) {
        break;
      }

      logger.info(queryParams)
      // Delete each item found in the batch
      for (const item of queryResult.Items) {
        const deleteImageDataParams = {
          TableName: 'machinevision_recognition_image_properties', // Replace with your table name
          Key: {
            image_id: item.image_id
          }
        };

        await docClient.delete(deleteImageDataParams).promise();
        itemsDeleted++;
      }
      logger.info(`deleted items from machinevision_recognition_image_properties : ${itemsDeleted}`)
      // Update LastEvaluatedKey for next iteration
      lastEvaluatedKey = queryResult.LastEvaluatedKey;

    } while (lastEvaluatedKey);

    res.status(200).json({
      message: 'Deletion completed successfully',
      totalItemsDeleted: itemsDeleted
    });

  } catch (error) {
    console.error('Error deleting items:', error);
    res.status(500).json({
      message: 'Error deleting items',
      error: error.message
    });
  }
});

const mobileApp = require('./MobileApplication/app');
app.use('/api/mobile', mobileApp); // Prefix for mobile backend


})
.catch((error) => {
  logger.error('Failed to initialize app due to config error:', error);
  process.exit(1);  // Stop the server if config loading fails
});
