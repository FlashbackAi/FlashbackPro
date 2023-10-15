// server/server.js
const express = require("express");
const multer = require("multer");
const app = express();


const cors = require('cors');
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads/"); // Images will be saved in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// API route to handle image upload
app.post("/upload", upload.single("image"), (req, res) => {

  
  const { file } = req;

  if (!file) {
    return res.status(400).send("No image provided");
  }
 console.log(file.path);
  res.status(201).json({ imageUrl: file.path });
});

// Serve uploaded images
app.use("/upload", express.static("uploads"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
