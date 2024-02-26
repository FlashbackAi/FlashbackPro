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
const https = require('https');
const { fold } = require('prelude-ls');
const { func } = require('prop-types');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors()); // Allow cross-origin requests
app.use(express.json());

// Configuring winston application logger

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/application.log' })
   ]
 });

 // *** Comment these certificates while testing changes in local developer machine.***
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
// Setting up AWS DynamoDB
const dynamoDB = new AWS.DynamoDB({ region: 'ap-south-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'ap-south-1' });

// Below are the tables we are using currently
const userDataTableName = 'userData';
const userUploadsTableName = 'userUploads';
const userFoldersTableName = 'userFolders';

const ClientId = '6goctqurrumilpurvtnh6s4fl1'
const cognito = new AWS.CognitoIdentityServiceProvider({region: 'ap-south-1'});

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
  if (tableName === userDataTableName) {
    // Define GSI for the userDataTableName
    params.GlobalSecondaryIndexes = [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL', // or choose specific attributes
        },
      },
      // Add more GSIs as needed
    ];
    params.AttributeDefinitions.push({ AttributeName: 'email', AttributeType: 'S' }); // we're passing the GSI attributename to attributeDef
  } else if (tableName === userUploadsTableName) {
    // Define GSI for the userUploadsTableName
    params.GlobalSecondaryIndexes = [
      {
        IndexName: 'FolderNameIndex',
        KeySchema: [
          { AttributeName: 'folder_name', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL', // or choose specific attributes
        },
      },
      {
        IndexName: 'ImageStatusIndex',
        KeySchema: [
          { AttributeName: 'image_status', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL', // or choose specific attributes
        },
      }
      
      // Add more GSIs as needed
    ];
    params.AttributeDefinitions.push({ AttributeName: 'folder_name', AttributeType: 'S' });
    params.AttributeDefinitions.push({ AttributeName: 'image_status', AttributeType: 'S' });
  } else if (tableName === userFoldersTableName) {
    // Define GSI for the userFoldersTableName
    params.GlobalSecondaryIndexes = [
      {
        IndexName: 'UserNameIndex',
        KeySchema: [
          { AttributeName: 'user_name', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL', // or choose specific attributes
        },
      },
      {
        IndexName: 'FolderStatusIndex',
        KeySchema: [
          { AttributeName: 'folder_status', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL', // or choose specific attributes
        },
      }
     
      // Add more GSIs as needed
    ];
    params.AttributeDefinitions.push({ AttributeName: 'user_name', AttributeType: 'S' });
    params.AttributeDefinitions.push({ AttributeName: 'folder_status', AttributeType: 'S' });
  }
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
      {AttributeName: 'user_name', AttributeType: 'S', KeyType: 'HASH'},
    ]);

    await createTable(userUploadsTableName, [
      {AttributeName: 'image_id', AttributeType: 'S', KeyType: 'HASH'},
    ]);

    await createTable(userFoldersTableName, [
      {AttributeName: 'folder_id', AttributeType: 'S', KeyType: 'HASH'},
    ]);
  } catch (error){
    logger.error(`Error creating tables: ${error.message}`);
  }
  
};

// Calling createTables to create the tables at the start of the script, ignores if the tables already exists.
createTables();

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

app.get('/images/:folderName', async (req, res) => {
  try {
   
     const folderName = req.params.folderName;
  // console.log(folderName)
  // const params1 = {
  //   TableName: userUploadsTableName,
  //   IndexName: 'FolderNameIndex',
  //   ProjectionExpression: 'image_id',
  //   KeyConditionExpression: 'folder_name = :foldername',
  //   FilterExpression: 'image_status <> :imagestatus',
  //   ExpressionAttributeValues: {
  //     ':foldername': folderName,
  //     ':imagestatus': "deleted"
  //   }
  // };
  // logger.info(params1)
  const result = await folderImages(folderName);
  logger.info('total images fetched for the folder: '+result.Count);
 

     const imagesPromises = result.Items.map(async file => {
        try {
          const lowResImage=file.image_id.split("/")[0]+"/lowRes/"+file.image_id.split("/")[1];
          const imageData = await s3.getObject({
              Bucket: bucketName,
              Key: lowResImage
          }).promise();

          logger.info("Image fetched from cloud: " + file.image_id);

          // Convert image data to base64
          const base64Image =  {
            "url": `${file.image_id}`,
           "imageData":`data:${file.image_id};base64,${imageData.Body.toString('base64')}`
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

async function folderImages(folderName) {

  try {
   
  console.log(folderName)
  const params = {
    TableName: userUploadsTableName,
    IndexName: 'FolderNameIndex',
    ProjectionExpression: 'image_id',
    KeyConditionExpression: 'folder_name = :foldername',
    FilterExpression: 'image_status <> :imagestatus',
    ExpressionAttributeValues: {
      ':foldername': folderName,
      ':imagestatus': "deleted"
    }
  };
  logger.info(params)
  const result = await docClient.query(params).promise();
  logger.info('total images fetched for the folder: '+result.Count);
  return result;
}
catch (err) {
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
          const imageData = await s3.getObject({
              Bucket: bucketName,
              Key: imageUrl
          }).promise();

          logger.info("Image downloaded from cloud: " + imageUrl);
         // res.json(imageData.Body.toString('base64'));
          res.json(`data:${imageUrl};base64,${imageData.Body.toString('base64')}`);
      }  catch (err) {
          logger.error("Error downloading image: "+imageUrl, err);
          res.status(500).send('Error getting images from S3');
      }
     
});


//*** if you face any issue in testing changes in local dev machine, comment this and use the below listen port***

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  logger.info(`Server is running on https://localhost:${PORT}`);
});

// // const PORT = process.env.PORT || 5000;
// app.listen(PORT ,() => {
//   logger.info(`Server started on http://localhost:${PORT}`);
// });
