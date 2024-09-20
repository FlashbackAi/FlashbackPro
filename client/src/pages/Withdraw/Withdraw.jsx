import React, { useState, useEffect } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import './Withdraw.css'
import AppBar from '../../components/AppBar/AppBar';
import { toast } from 'react-toastify'; // Import toast for notifications

function Withdraw() {
  const [transactions, setTransactions] = useState([]);
  const userPhoneNumber = localStorage.getItem('userPhoneNumber');
  const [accountAddress, setAccountAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false); // For send button loading state

  useEffect(() => {
    if (userPhoneNumber) {
      fetchTransactionsByPhoneNumber(userPhoneNumber);
    }
  }, [userPhoneNumber]);

  const fetchTransactionsByPhoneNumber = async (phone) => {
    try {
      const response = await API_UTIL.get(`/transactionsByUserPhoneNumber/${phone}`);
      // Sort the transactions by transaction_date in descending order (latest first)
      const sortedTransactions = response.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSend = async () => {
    setLoading(true); // Start loading
    try {
      // Prepare the request payload
      const payload = {
        amount: amount,
        senderMobileNumber: userPhoneNumber,
        recipientAddress: accountAddress,
      };

      // Call the API to transfer Chewy coins
      const response = await API_UTIL.post('/transfer-chewy-coins-by-wallet-address', payload);
      if (response.status === 200) {
        toast.success('Coins transferred successfully!');
        fetchTransactionsByPhoneNumber(userPhoneNumber); // Refresh transactions after transfer
      } else {
        throw new Error('Failed to transfer Chewy Coins.');
      }
    } catch (err) {
      console.error('Error during coin transfer:', err);
    }
    setTimeout(() => {
      setLoading(false); // Stop loading after a delay (simulating API response)
    }, 2000);
  };

  return (
    <div>
      <AppBar showCoins={true} />
      <span className='send-container-header'>Transfer Amount</span>
      <div className='send-container'>
        <input
          type="text"
          className='account-input'
          placeholder="Wallet Address"
          value={accountAddress}
          onChange={(e) => setAccountAddress(e.target.value)}
        />
        <input
          type="number"
          className='amount-input'
          placeholder="Coins"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      <hr className='modal-seperator' />
      <div className="withdraw-container">
        <span className="withdraw-title">User Transactions</span>

        {/* Transactions List */}
        <div className="transactions-list">
          {transactions.map((transaction) => {
            const isSender = transaction.from_mobile_number === userPhoneNumber;
            const isRecipient = transaction.to_mobile_number === userPhoneNumber;
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
  );
}

export default Withdraw;
