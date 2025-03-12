const express = require('express');
const userController = require('./Controller/UserController');
const walletController = require('./Controller/WalletController');
const datasetController = require('./Controller/DatasetController');
const bubbleChatController = require('./Controller/BubbleChatController')
const relationsController = require('./Controller/RelationsController')
const generativeAIController = require('./Controller/GenerativeAIController')
const machineVisionController = require('./Controller/MachineVisionController')
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

// Send OTP
app.post('/sendOTP', userController.sendOTP);

// Verify OTP
app.post('/verifyOTP', userController.verifyOTP);

//API for getting the profile stats of a user
app.get('/getUserProfileStats/:userPhoneNumber', userController.getUserProfileStats);


//APIs for BUbble chats
//API to create bubble chat
app.post('/createBubbleChat', bubbleChatController.createBubbleChat);
//API to create Group bubble chat
app.post('/createGroupBubbleChat', bubbleChatController.createGroupBubbleChat);
//API to Add members to Group bubble chat
app.post('/addGroupMembers', bubbleChatController.addGroupMembers);
//API to Remove users from Group bubble chat
app.post('/removeGroupMembers', bubbleChatController.removeGroupMembers);
//API to delete Group bubble chat
app.post('/deleteGroupChat', bubbleChatController.deleteGroupChat);
//API to get chats by user
app.get('/chats-by-user/:user_phone_number', bubbleChatController.getChatsByUser);
//API to get chat messages
app.get('/getChatMessages/:chatId', bubbleChatController.getChatMessages);
//API to send message
app.post('/sendMessage', bubbleChatController.sendMessage);
//API to mark message as Read
app.post('/markAsRead', bubbleChatController.markAsRead);
//API to Add Admin to Group bubble chat
app.post('/addAdmin', bubbleChatController.addAdminGroupMembers);
//API to get user specific memories
app.get('/getInChatMemories', bubbleChatController.getInChatMemories);
//API to Remove Admin from Group bubble chat
app.post('/removeAdmin', bubbleChatController.removeAdminGroupMembers);
//API to update the chat name to custom name
app.post('/updateChatCustomName', bubbleChatController.updateChatCustomName);




//APIs for User Relations

//API to create a relation request
app.post('/createRelationRequest', relationsController.createRelationRequest);
//API to update the relation request status
app.post('/updateRelationRequest', relationsController.updateRelationRequestStatus);



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


// APIs for calling generative AI models

//API to generate image using comfyUI
app.post("/process-images-progress", upload.fields([{ name: "image1" }, { name: "image2" }]), generativeAIController.processImagesProgress);
//API to get the generated Images
app.get("/getGeneratedImages", generativeAIController.getGeneratedImages);


//APIs related to Machine Vision Service 
//transfer coins by wallet address
app.post('/unMergeUserFace', machineVisionController.unMergeUser);