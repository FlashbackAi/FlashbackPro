const walletModel = require('../Model/BSCWallet');
const logger = require('../../logger');
const {getConfig} = require('../../config');
const config = getConfig()
const { ethers } = require('ethers');
const BSC_RPC = "https://bsc-dataseed.binance.org/";
const provider = new ethers.JsonRpcProvider(BSC_RPC);
const SMART_CONTRACT_ADDRESS ="0xd51E20AF0946793032d4F06eAf4C29605CD9aB46";


async function transferBSCToUser(userAddress, amountInBNB) {

  const mainUserNumber = config.aptosConfig.senderMobileNumber
  logger.info(mainUserNumber)
  const mainWalletDetails = await walletModel.getWalletDetails(mainUserNumber);
  logger.info(mainWalletDetails)
  const mainWallet = new ethers.Wallet(mainWalletDetails.encrypted_private_key, provider);

  // Convert BNB to wei
  const amountInWei = ethers.parseEther(amountInBNB.toString());
  
  // Create transaction
  const tx = await mainWallet.sendTransaction({
    to: userAddress,
    value: amountInWei
  });

  console.log("Transaction submitted. Hash:", tx.hash);

  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("Transaction mined in block:", receipt.blockNumber);

  return receipt;
}





// Define the function to handle wallet creation and transaction
const handleBSCWalletCreation = async(mobileNumber) => {
  logger.info(`Received request to create wallet for mobile number: ${mobileNumber}`);
  
  try {
    // Check if the wallet already exists for the given mobile number
    const existingWallet = await walletModel.checkWalletExists(mobileNumber);

    if (existingWallet) {
      // If the wallet exists, return the existing wallet details
      logger.info(`Wallet already exists for mobile number: ${mobileNumber}`);
      return {
        message: 'Wallet already exists',
        walletAddress: existingWallet.wallet_address,
        balance: existingWallet?.balance,
        status: 200
      };
    }

    // If no wallet exists, create a new Aptos wallet
    const wallet = ethers.Wallet.createRandom();

    logger.info("Wallet created Successfully");

    // // Encrypt the private key and prepare wallet details
    const encryptedPrivateKey = wallet.privateKey

    const walletDetails = {
      walletAddress: wallet.address,  // Hex representation of the wallet address
      publicKey: wallet.publicKey,  // Hex representation of the public key
      balance: 0,
      encryptedPrivateKey,  // The encrypted private key
    };

    
    await walletModel.storeWalletInDynamoDB(mobileNumber, walletDetails);

    await transferBSCToUser(walletDetails.walletAddress,0.001);
    // Log successful wallet creation
    logger.info(`BSC Wallet created for mobile number: ${mobileNumber} with wallet address: ${walletDetails.walletAddress}`);

    return {
      message: 'BSC Wallet created and coins transferred successfully',
      walletAddress: walletDetails.walletAddress,
      balance: 0,
      status: 201
    };
  } catch (error) {
    // Log any error that occurs during the process
    logger.error(`Error creating Aptos wallet for mobile number: ${mobileNumber}: ${error.message}`);
    throw new Error(`Failed to create Aptos wallet: ${error.message}`);
  }
}

  const getWalletDetails = async (mobileNumber) => {
    if (!mobileNumber) {
      throw new Error("Mobile number is required");
    }
  
    try {
        logger.info(`Fetching wallet for mobile number: ${mobileNumber}`);
    
        // Call the model to fetch wallet details
        const walletDetails = await walletModel.getWalletDetails(mobileNumber);
    
        // If no wallet found, throw an error
      if (!walletDetails) {
        throw new Error("Wallet not found")
      }
    
        return walletDetails;
  
    } catch (error) {
      // Log the error and rethrow it
      logger.error(`Error fetching wallet for mobile number ${mobileNumber}: ${error.message}`);
      throw error;
    }
  };
  const savePermissionsOnChain = async (userPhoneNumber) => {
    try {
      // 1. Connect to BSC Testnet
      //const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
      const walletDetails = await walletModel.getWalletDetails(userPhoneNumber)

      // 2. Create a signer using your private key
      //    (In production, move this key to .env or a secure secrets manager)
      const wallet = new ethers.Wallet(
        walletDetails.encrypted_private_key, // e.g., process.env.PRIVATE_KEY
        provider
      );
  
      // 3. Construct the JSON object you want to store
      //    We'll include a UTC timestamp using JavaScript's Date methods.
      const jsonObject = {
        dataSharingPermission: "Enabled",
        timestamp: new Date().toISOString() // e.g. "2025-03-14T20:55:32.832Z"
      };
  
      // Convert it to a string (since Solidity expects a string)
      const jsonString = JSON.stringify(jsonObject);
  
      // 4. Minimal contract ABI for StorePermissions
      const storePermissionsAbi = [
        "function setUserData(address _user, string _jsonString) external",
        "function getUserData(address _user) external view returns (string memory)",
        "event UserJSONSet(address indexed user, string jsonData)"
      ];
      // 6. Create a contract instance with the signer
      const storePermissionsContract = new ethers.Contract(
        SMART_CONTRACT_ADDRESS,
        storePermissionsAbi,
        wallet
      );
  
      // 7. Call setUserData(userAddress, jsonString)
      console.log(`Storing JSON data for user: ${walletDetails.wallet_address}`);
      const tx = await storePermissionsContract.setUserData(walletDetails.wallet_address, jsonString);
      console.log("Transaction hash:", tx.hash);
  
      // 8. Wait for confirmation
      await tx.wait();
      console.log("User JSON data stored successfully!");
      return {"transaction":tx}
  
    } catch (error) {
      console.error("Error storing user JSON data:", error);
    }
  }

  
// Export the functions if needed for external use
module.exports = {
    handleBSCWalletCreation,
    getWalletDetails,
    savePermissionsOnChain
  };

