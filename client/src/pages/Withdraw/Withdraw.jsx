import React, { useState, useEffect } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import './Withdraw.css';
import AppBar from '../../components/AppBar/AppBar';
import { toast } from 'react-toastify'; // Import toast for notifications

function Withdraw() {
  const [transactions, setTransactions] = useState([]);
  const userPhoneNumber = localStorage.getItem('userPhoneNumber');
  const [accountAddress, setAccountAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false); // For send button loading state
  const [balance, setBalance] = useState(null); // Balance state
  const [walletError, setWalletError] = useState(''); // Error state for wallet address validation

  useEffect(() => {
    if (userPhoneNumber) {
      fetchTransactionsByPhoneNumber(userPhoneNumber);
    }
  }, [userPhoneNumber]);

  useEffect(() => {
      fetchBalance(accountAddress); // Fetch balance when the account address changes

  });

  const fetchTransactionsByPhoneNumber = async (phone) => {
    try {
      const response = await API_UTIL.get(`/transactionsByUserPhoneNumber/${phone}`);
      const sortedTransactions = response.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Function to fetch the wallet balance based on account address
  const fetchBalance = async (walletAddress) => {
    try {
      const response = await API_UTIL.get(`/wallet-balance/${userPhoneNumber}`); // Use your API endpoint
      setBalance(response.data.balance); // Set the fetched balance
      console.log(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  // Function to check if the wallet address is valid
  const checkWalletAddress = async (walletAddress) => {
    try {
      const response = await API_UTIL.get(`/getAccountInfo/${walletAddress}`);
      if (response.status === 200 && response.data.message === "Account Details found") {
        setWalletError(''); // Clear any previous errors
        return true; // Account exists
      } else {
        setWalletError('Account not found'); // Set the error message
        return false; // Account doesn't exist
      }
    } catch (error) {
      setWalletError('Account not found'); // Set the error message
      return false;
    }
  };
  

  const handleSend = async () => {
    // Start loading
    setLoading(true);

    // Validate the wallet address before proceeding
    const isWalletValid = await checkWalletAddress(accountAddress);
    if (!isWalletValid) {
      setLoading(false); // Stop loading if the address is invalid
      return;
    }

    // Proceed with sending if the wallet address is valid
    try {
      const payload = {
        amount: amount,
        senderMobileNumber: userPhoneNumber,
        recipientAddress: accountAddress,
      };
      const response = await API_UTIL.post('/transfer-chewy-coins-by-wallet-address', payload);
      if (response.status === 200) {
        toast.success('Coins transferred successfully!');
        fetchTransactionsByPhoneNumber(userPhoneNumber); // Refresh transactions after transfer
        // Clear the input fields after successful transfer
        setAccountAddress('');
        setAmount('');
      } else {
        throw new Error('Failed to transfer Chewy Coins.');
      }
    } catch (err) {
      console.error('Error during coin transfer:', err);
      toast.error('Error during coin transfer.');
    }

    // Stop loading after the operation
    setLoading(false);
  };

  // Disable the send button if either amount or address is not entered
  const isSendDisabled = !amount || !accountAddress || loading;

  return (
    <div className="withdraw-page">
      <AppBar showCoins={true} />
      <div className="withdraw-body">
        <div className="send-section">
          <div className="send-header">
            <span className="send-title">Send Flash Coins</span>
          </div>

          <div className="send-container">
            <input
              type="text"
              className="input-address"
              placeholder="Recipient's Wallet Address"
              value={accountAddress}
              onChange={(e) => setAccountAddress(e.target.value)}
            />
            {walletError && <div className="wallet-error">{walletError}</div>} {/* Show wallet error if present */}
            
            <input
              type="number"
              className="input-amount"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="balance-info">
            <span className="available-balance">
              Available: {balance !== null ? `${balance} ` : 'Fetching...'}
            </span>
          </div>

          <button
            onClick={handleSend}
            className={`send-button ${loading ? 'loading' : ''}`}
            disabled={isSendDisabled}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Transactions Section */}
        <hr className="modal-separator" />
        <div className="withdraw-container">
          <span className="withdraw-title">User Transactions</span>

          <div className="transactions-list">
            {transactions.map((transaction) => {
              const isSender = transaction.from_mobile_number === userPhoneNumber;
              const displayName = isSender ? transaction.to_address : transaction.from_address;
              const displayAmount = isSender ? `-${transaction.amount}` : `+${transaction.amount}`;
              const displayColor = isSender ? 'red' : 'green'; // Set color based on whether it's sent or received

              return (
                <div className="transaction-item" key={transaction.transaction_id}>
                  <div className="transaction-info">
                    <span>{displayName}</span>
                    <div className="transaction-date">{new Date(transaction.transaction_date).toLocaleString()}</div>
                  </div>
                  <div className="transaction-amount" style={{ color: displayColor }}>
                    {displayAmount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Withdraw;
