const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');

const app = express();
const port = 5000; // Different port to avoid conflicts with React's default port

app.use(cors()); // Allow cross-origin requests
app.use(express.json());

// Set up AWS S3
const s3 = new AWS.S3({ 
    accessKeyId: 'AKIA3OGMYJDXPNSDBKNH', 
    secretAccessKey: '1MZSemBvuhVCJ11PSKatdvWi6s115qRKVzaLqqiI', 
    region: 'ap-south-1' // Update with your AWS region 
});

app.post('/createFolder', (req, res) => {
    const bucketName = 'flashback-v1-user-uploaded-media';
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

// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: 'flashback-v1-user-uploaded-media',
//         //acl: 'public-read',

//         metadata: (req, file, cb) => {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: (req, file, cb) => {
//             cb(null,folderName+Date.now().toString() + '-' + file.originalname)
//         }
//     })
// });

// app.post('/upload',upload.array('images', 10), (req, res) => {
//   console.log(req.body.folderName);
//     res.send('Uploaded successfully!');
// });

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post('/upload/:folderName', upload.array('images',10), async (req, res) => {
//   try {
//     const folder = req.params.folder;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).send('No file uploaded.');
//     }

//     const params = {
//       Bucket:'flashback-v1-user-uploaded-media',
//       Key: `${folderName}/${file.originalname}`,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//       //ACL: 'public-read' // or another ACL as per your requirements
//     };

//     const data = await s3.upload(params).promise();
//     res.send(`File uploaded successfully. ${data.Location}`);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('An error occurred');
//   }
// });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

app.post('/upload/:folderName', upload.array('images', 10), (req, res) => {
  const { folderName } = req.params;
  const files = req.files;

  console.log(req.files);
  if (!files || files.length === 0) {

    return res.status(400).json({ message: 'No files uploaded' });
  }

  const uploadPromises = files.map((file) => {
    const params = {
      Bucket: 'flashback-v1-user-uploaded-media',
      Key: `${folderName}/${file.originalname}`,
      Body: file.buffer,
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

// app.post('/createFolder', (req, res) => {
//     res.send('Uploaded successfully!');
// });

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
