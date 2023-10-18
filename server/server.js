const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');

const app = express();
const port = 5000; // Different port to avoid conflicts with React's default port

app.use(cors()); // Allow cross-origin requests

// Set up AWS S3
const s3 = new AWS.S3({
    accessKeyId: 'acessKey',
    secretAccessKey: 'secretKey',
    region: 'region' // Update with your AWS region
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'flashback-v1-user-uploaded-media',
        //acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname)
        }
    })
});

app.post('/upload', upload.array('images', 10), (req, res) => {
    res.send('Uploaded successfully!');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
