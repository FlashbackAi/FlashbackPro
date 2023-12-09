const express = require('express');
const winston = require('winston');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { CognitoUserPool, CognitoUserAttribute } = require('amazon-cognito-identity-js');
const archiver = require('archiver');

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
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
        logger.info(res)
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

app.post('/upload/:folderName', upload.array('images', 100), (req, res) => {
  const { folderName } = req.params;
  const files = req.files;
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
    logger.info("images uploaded succesfully in "+folderName)
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
      logger.info("folderName "+folderName)
      const params = {
      Bucket: bucketName,
      Prefix: folderName,
      };

      
    
      const s3Response = await s3.listObjectsV2(params).promise();
      // const images = s3Response.Contents.map((item) => {
      //   return `https://${params.Bucket}.s3.amazonaws.com/${item.Key}`;
      // });
      const imagesPromises = s3Response.Contents.map(async (file) => {
        const imageData = await s3.getObject({
          Bucket: bucketName,
          Key: file.Key
        }).promise();

        const compressedImage = await sharp(imageData.Body) // Example: resize to width of 200 pixels
          .jpeg({ quality: 50 }) // Convert to JPEG with 80% quality
          .toBuffer();
  
        return `data:image/jpeg;base64,${compressedImage.toString('base64')}`;
      });
      const images = await Promise.all(imagesPromises);

      //downloadDirectory(folderName)
      res.json(images);
    } catch (err) {
      logger.error("Error in S3 get ",err)
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



const PORT = process.env.PORT || 5000;
app.listen(PORT ,() => {
  logger.info(`Server started on http://localhost:${PORT}`);
});
