const express = require('express');
const userController = require('./Controller/UserController');
const walletController = require('./Controller/WalletController');
const datasetController = require('./Controller/DatasetController');
const multer = require('multer'); // For handling file uploads
const upload = multer(); // Memory storage for processing files
const app = express();

app.use(express.json());


//----APIs for User-----
// create user
app.post('/createUser', userController.createUser);

// Update user details
app.put('/updateUser', userController.updateUser);

// Get user details by phone number
app.get('/getUserDetails/:user_phone_number', userController.getUserDetails);

// Verify user activation code
app.post('/verifyUserActivation', userController.verifyUserActivation);

// Upload user portrait
app.post('/uploadUserPortrait', upload.single('image'), userController.uploadUserPortrait);



//APIs for wallet-----
//create wallet
app.post('/createWalet', walletController.createWallet);

//get wallet
app.get('/getWaletDetails/:mobileNumber', walletController.getWalletDetails);

//get user balance
app.get('/wallet-balance/:phoneNumber', walletController.getWalletBalance);

//get wallet transactions of the user
app.get('/transactionsByUserPhoneNumber/:userPhoneNumber', walletController.getTransactionsByUserPhoneNumber);
module.exports = app;

//transfer coins
app.post('/transfer-coins-by-number', walletController.transferCoinsByNumber);

//transfer coins by wallet address
app.post('/transfer-coins-by-wallet-address', walletController.transferCoinsByWalletAddress);



//APIs for dataset

//API for create or save dataset details 
app.post('/saveDatasetDetails', datasetController.saveDatasetDetails);
//API to get the dataset details
app.get('/getDatasetDetails/:orgName/:datasetName', datasetController.getDatasetDetails);
//API to update the request status for the dataset
app.post("/updateRequestStatus", datasetController.updateRequestStatus);
//API to get the requests of the dataset
app.get('/getDatasetRequests/:dataset', datasetController.getDatasetRequests);
