const walletModel = require('../Model/WalletModel');
const userModel = require('../Model/UserModel')
const walletTransactionsModel = require('../Model/WalletTransactionsModel')
const logger = require('../../logger');
const { Account,AptosConfig, Aptos, AptosClient,Network, TxnBuilderTypes, BCS,Ed25519PrivateKey,AccountAddress } = require( '@aptos-labs/ts-sdk');
const {getConfig} = require('../../config');
const {updateUser} =  require('../Service/UserService');
const aptconfig = new AptosConfig({ network: Network.MAINNET});
const aptosClient = new Aptos(aptconfig);
const CHEWY_AMOUNT = 100
const config = getConfig()


const handleWalletCreation = async (mobileNumber) => {
    logger.info(`Received request to create wallet for mobile number: ${mobileNumber}`);

    try {
        const existingWallet = await walletModel.checkWalletExists(mobileNumber);

        if (existingWallet) {
            logger.info(`Wallet already exists for mobile number: ${mobileNumber}`);
            return {
                message: 'Wallet already exists',
                walletAddress: existingWallet.wallet_address,
                balance: existingWallet.balance,
                status: 200
            };
        }

        const aptosAccount = Account.generate();
        const encryptedPrivateKey = aptosAccount.privateKey.signingKey.toString('hex');

        const walletDetails = {
            walletAddress: aptosAccount.accountAddress.toString('hex'),
            publicKey: aptosAccount.publicKey.key.toString('hex'),
            balance: CHEWY_AMOUNT,
            encryptedPrivateKey
        };

        await walletModel.storeWalletInDynamoDB(mobileNumber, walletDetails);
        await registerCoinStore(aptosAccount);
        await transferCoins(walletDetails.walletAddress, CHEWY_AMOUNT, config.aptosConfig.senderMobileNumber, mobileNumber);
        await updateUser(mobileNumber, { reward_points: CHEWY_AMOUNT });

        return {
            message: 'Aptos Wallet created and coins transferred successfully',
            walletAddress: walletDetails.walletAddress,
            balance: CHEWY_AMOUNT,
            status: 201
        };
    } catch (error) {
        logger.error(`Error in handleWalletCreation: ${error.message}`);
        throw new Error(`Failed to create wallet: ${error.message}`);
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
      await walletTransactionsModel.updateWalletTransaction(
        executedTransaction.hash,
        senderMobileNumber,
        recipientMobileNumber,
        senderAccount.accountAddress.toString('hex'), // Sender's wallet address (from_address)
        recipientAddress, // Receiver's wallet address (to_address)
        amount,
        executedTransaction.success,
        "Chewy" // Type of coin being transferred
      );
  
      return executedTransaction.success;
  
    } catch (error) {
      console.error(`Error transferring Chewy coins: ${error.message}`);
      throw new Error(error.message);
    }
  };

  /** Register the receiver account to receive transfers for Chewy Coin, paid by feePayer. */
async function registerCoinStore(account) {
    try {
      const feePayerAccount =  await getAccountInfo(config.aptosConfig.senderMobileNumber)
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
  const transferCoinsByNumber = async (amount, senderMobileNumber, recipientMobileNumber) => {
    try {
      const recipientWalletDetails = await walletModel.getWalletDetails(recipientMobileNumber);
  
      if (!recipientWalletDetails) {
        throw new Error('Recipient wallet not found');
      }
  
      const status = await transferCoins(
        recipientWalletDetails.wallet_address,
        amount,
        senderMobileNumber,
        recipientMobileNumber
      );
  
      logger.info(`Chewy Coin transfer completed successfully: ${status}`);
      return status;
    } catch (error) {
      logger.error('Error in transactionService.transferChewyCoins:', error);
      throw error;
    }
  };

  const getAccountInfo = async(mobileNumber)=>{
    try{
  
      // Fetch wallet details for the sender
      const walletDetails = await walletModel.getWalletDetails(mobileNumber);
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

  const getWalletBalance = async (phoneNumber) => {
    try {
      // Fetch wallet details from the model
      const walletDetails = await walletModel.getWalletDetails(phoneNumber);
      if (!walletDetails) {
        return null;
      }
  
      // Fetch user details
      const userDetails = await userModel.getUser(phoneNumber);
  
      // Get the wallet balance
      const balance = await getWalletBalanceOnNet(walletDetails.wallet_address);
  
      // Update user reward points if out of sync
      if (balance !== userDetails.reward_points) {
        await userModel.updateUser(phoneNumber, { reward_points: balance });
      }
  
      return {
        walletAddress: walletDetails.wallet_address,
        balance: balance,
      };
    } catch (error) {
      logger.error('Error in walletService.getWalletBalance:', error);
      throw error;
    }
  };
  

  const getWalletBalanceOnNet = async (walletAddress) => {
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


  const fetchTransactionsByUserPhoneNumber = async (userPhoneNumber) => {
    try {
      const transactions = await walletModel.getTransactionsByUserPhoneNumber(userPhoneNumber);
      logger.info(`Fetched ${transactions.length} transactions for user phone number: ${userPhoneNumber}`);
      return transactions;
    } catch (error) {
      logger.error('Error in transactionService.fetchTransactionsByUserPhoneNumber:', error);
      throw error;
    }
  };
  
// Export the functions if needed for external use
module.exports = {
    transferCoins,
    handleWalletCreation,
    getWalletDetails,
    getWalletBalance,
    fetchTransactionsByUserPhoneNumber,
    transferCoinsByNumber
  };

