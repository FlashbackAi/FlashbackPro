import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from 'react-modal';
import { Copy, X, ChevronRight, CheckCircle } from 'lucide-react';
import API_UTIL from '../../services/AuthIntereptor';
import { useNavigate } from 'react-router-dom';
import CustomQRCode from '../CustomQRCode/CustomQRCode';
import SlideToAction from '../SlideToAction/SlideToAction';
import { toast } from 'react-toastify';
import LabelAndInput from '../molecules/LabelAndInput/LabelAndInput';

const StyledModal = styled(Modal)`
  &.wallet-modal-content {
    background-color: #1e1e1e;
    color: white;
    padding: 2em;
    margin: 2em auto;
    border-radius: 1em;
    width: 90%;
    max-width: 600px;
    height: 80vh;
    outline: none;
    box-shadow: 0 0.5em 2em rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    &.wallet-modal-content {
      width: 95%;
      padding: 1em;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
`;

const ModalTitle = styled.h2`
  font-size: 1.5em;
  margin: 0;
  color: #00ffff;
`;

const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-around;
  background: #2a2a2a;
  border-radius: 0.5em;
  overflow: hidden;
  margin-bottom: 1em;
  padding: 0.25em; // Added padding to allow glow to be visible

  button {
    flex: 1;
    padding: 0.75em;
    background: none;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 0.3em;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &.active::before,
    &:hover::before {
      opacity: 1;
    }

    &.active {
      background: #3a3a3a;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    &:hover {
      background: #3a3a3a;
    }
  }
`;

const TabContent = styled(motion.div)`
  flex: 1;
  overflow-y: auto;
  padding: 1em;
  background: #2a2a2a;
  border-radius: 0.5em;
`;

const TabHeading = styled.h3`
  color: #00ffff;
  margin-bottom: 1em;
`;

const WalletDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HashCode = styled.div`
  display: flex;
  align-items: center;
  background: #3a3a3a;
  padding: 0.5em 1em;
  border-radius: 2em;
  margin-bottom: 1em;
  font-size: 0.9em;
`;

const CopyButton = styled(motion.button)`
  background: none;
  border: none;
  color: #00ffff;
  cursor: pointer;
  margin-left: 0.5em;
  display: flex;
  align-items: center;
`;

const CopyMessage = styled(motion.span)`
  color: #00ffff;
  margin-left: 0.5em;
  font-size: 0.8em;
`;

const QRCodeWrapper = styled.div`
  background: white;
  border-radius: 0.5em;
  margin-bottom: 1em;
  padding: 1em;
`;

const DatasetInfo = styled.div`
  width: 100%;
  background: #2a2a2a;
  border-radius: 0.5em;
  // padding: 1em;
  margin-top: -1em;
`;

const DatasetInfoItem = styled.p`
  margin: 0.5em 0;
  display: flex;
  color: #ffffff;
  justify-content: center;
`;

const SendForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-bottom: 1em;
`;

const StyledInput = styled.input`
  background: #3a3a3a;
  border: none;
  padding: 0.75em;
  border-radius: 0.5em;
  color: white;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.8em;
  margin-top: 0.25em;
`;

const SendButton = styled(motion.button)`
  background: #2a2a2a;
  border: none;
  padding: 0.75em;
  border-radius: 0.5em;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 255, 1);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;


const DisclaimerText = styled.span`
  color: #a0a0a0;
  font-size: 0.8em;
  text-align: center;
  margin-top: 0.5em;
  max-width: 80%;
`;

const TransactionList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75em;
  background: #3a3a3a;
  margin-bottom: 0.5em;
  border-radius: 0.5em;
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TransactionAmount = styled.span`
  font-weight: bold;
  color: ${props => props.type === 'sent' ? '#ff6b6b' : '#4CAF50'};
`;

const RequestTabs = styled.div`
  display: flex;
  margin-bottom: 1em;
`;

const RequestTabButton = styled.button`
  flex: 1;
  padding: 0.75em 1.5em;
  background: #3a3a3a;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  position: relative;
  overflow: visible;
  margin: 0 1.2px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &.active {
    background: #3a3a3a;
    color: #fff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  &.active::before,
  &:hover::before {
    opacity: 1;
  }

  &:hover {
    background: #4a4a4a;
  }
`;

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const RequestItem = styled.div`
  background: #3a3a3a;
  padding: 1em;
  border-radius: 0.5em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const RequestInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const RequestActions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.accept ? '#4CAF50' : '#ff6b6b'};
  border: none;
  padding: 0.5em 1em;
  border-radius: 0.5em;
  color: white;
  cursor: pointer;
  font-weight: bold;
  margin-right:0.5em;
`;

const RequestStatus = styled.div`
  display: flex;
  align-items: center;
`;

const SlideActionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1em;
`;
const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;

  input[type='checkbox'] {
    width: 18px; /* Double the default size */
    height: 18px; /* Double the default size */
  }

  label {
    margin-left: 0.75rem; /* Adjust the spacing */
    font-size: 1rem; /* Double the font size */
    color: #666;
  }
`;

const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
  background-color: ${props => props.status === 'Accepted' ? '#4CAF50' : '#ff6b6b'};
  color: white;
`;
// const RequestStatus = styled.span`
//   padding: 5px 10px;
//   border-radius: 15px;
//   font-size: 0.8em;
//   font-weight: bold;
//   background-color: ${props => props.status === 'Accepted' ? '#4CAF50' : '#ff6b6b'};
//   color: white;
// `;

// const BalanceDisplay = styled.div`
//   font-size: 1.5em;
//   font-weight: bold;
//   text-align: center;
//   margin-bottom: 1em;
//   color: #00ffff;
// `;

const Balance = styled(motion.div)`
  font-size: 1.5em;
  margin-bottom: 1em;
  display: flex;
  align-items: center;
  font-weight: bold;
  
  img {
    height: 1.5em;
    width: 1.5em;
    margin-left: 0.5em;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem;
`;

const Tag = styled.span`
  background-color: #646566;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
`;

const Wallet = ({ isOpen, onClose, userPhoneNumber, datasetName, showCoins }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [hashCode, setHashCode] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [balance, setBalance] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [photoCount, setPhotoCount] = useState(null);
  const [label, setLabel] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [accountAddress, setAccountAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false); // For send button loading state
  const [walletError, setWalletError] = useState(''); // Error state for wallet address validation
  const [pendingRequests, setPendingRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [acceptingRequests, setAcceptingRequests] = useState({});
  const [rejectingRequests, setRejectingRequests] = useState({});
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [activeRequestTab, setActiveRequestTab] = useState('active');

  useEffect(() => {
    if (isOpen) {
      fetchWalletDetails(userPhoneNumber);
      fetchTransactionsByPhoneNumber(userPhoneNumber);
      fetchDataSetDetails(datasetName);
    }
  }, [isOpen, userPhoneNumber, datasetName]);

  useEffect(() => {
    const fetchBalance = async (walletAddress) => {
    try {
      const response = await API_UTIL.get(`/wallet-balance/${walletAddress}`);
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };
    const userPhoneNumber = localStorage.getItem('userPhoneNumber');
     fetchBalance(userPhoneNumber);
    const interval = setInterval(() => {
      if (userPhoneNumber) {
        fetchBalance(userPhoneNumber);
      }
    }, 5000);

     return () => clearInterval(interval);
  });

  useEffect(() => {
    if(!datasetDetails){
    const fetchDataSetDetails = async (datasetName) => {
      API_UTIL.get(`/getDatasetDetails/Flashback/${datasetName}`)
          .then(response => {
              setDatasetDetails(response.data[0]);
              fetchDatasetRequests(response.data[0]);
          })
          .catch(error => {
              console.error('Error fetching dataset details:', error);
          });
  };

  fetchDataSetDetails(datasetName);
  }
  });
  useEffect(() => {
    if (userPhoneNumber) {
      fetchTransactionsByPhoneNumber(userPhoneNumber);
    }
  }, [userPhoneNumber]);

  const fetchTransactionsByPhoneNumber = async (phone) => {
    try {
      const response = await API_UTIL.get(`/transactionsByUserPhoneNumber/${phone}`);
      const sortedTransactions = response.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchWalletDetails = async (userPhoneNumber) => {
    try {
      const response = await API_UTIL.get(`/fetchWallet/${userPhoneNumber}`);
      setWalletDetails(response.data.walletDetails);
      setHashCode(response.data.walletDetails.wallet_address);
    } catch (error) {
      console.error('Error fetching wallet details:', error);
    }
  };

  const formatHashCode = (code) => {
    if (!code || code.length <= 8) return code;
    return `${code.slice(0, 4)}...${code.slice(-4)}`;
  };

  useEffect(() => {
    if (showCoins && userPhoneNumber) {
      fetchWalletDetails(userPhoneNumber);
    }
  }, [userPhoneNumber, showCoins]);

  useEffect(() => {
    API_UTIL.get(`/imagesForFederated/${userPhoneNumber}`)
        .then(response => {
            setPhotoCount(response.data.count);
            setLabel(
                <>
                  Enable to Earn {Math.floor(response.data.count / 2)} 
                  <img className='unityLogo' src='/unityLogo.png' alt='Coin' />
                </>
              );
              
        })
        .catch(error => {
            console.error('Error fetching photo count:', error);
        });
  }, [userPhoneNumber]);

  const handleSlideComplete = async () => {
    try {
        const datasetSize = (datasetDetails?.dataset_size || 0) + (photoCount || 0);

        const updatedFormData = {
            org_name: 'Flashback',
            dataset_name: datasetName,
            dataset_desc: 'Images of a people memories',
            dataset_category: 'Faces',
            dataset_url: 'URL of the dataset',
            dataset_acceskey: 'Access key of the dataset',
            dataset_size: datasetSize || 0,
        };

        const response = await API_UTIL.post('/saveDatasetDetails', updatedFormData);
        if (response.status !== 200) {
            throw new Error('Failed to save the Dataset');
        }
        await updateImageStatus(userPhoneNumber);
        await transferChewyCoins(userPhoneNumber, Math.floor(photoCount / 2));
    } catch (error) {
        console.error('Error saving dataset:', error);
    }
};

const updateImageStatus = async (userPhoneNumber) => {
  try {
      const payload = { userPhoneNumber: userPhoneNumber };
      const response = await API_UTIL.post('/updateImageEnableSharing', payload);

      if (response.status === 200) {
          setLabel('');
          setPhotoCount(0);
      } else {
          throw new Error('Failed to transfer Chewy Coins.');
      }
  } catch (error) {
      console.error('Error transferring Chewy Coins:', error);
  }
};

const transferChewyCoins = async (recipientMobileNumber, amount) => {
  try {
      const senderMobileNumber = "+919090401234"; // The fixed sender phone number
      const payload = {
          amount: amount,
          senderMobileNumber: senderMobileNumber,
          recipientMobileNumber: recipientMobileNumber,
      };

      const response = await API_UTIL.post('/transfer-chewy-coins', payload);

      if (response.status !== 200) {
        throw new Error('Failed to transfer Chewy Coins.');
      }
  } catch (error) {
      console.error('Error transferring Chewy Coins:', error);
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


const handleSend = async (e) => {
  e.preventDefault();
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

const handleAccept = async (request) => {
  setAcceptingRequests((prev) => ({ ...prev, [request.model]: true })); // Set accepting state for this request
  try {
      await updateRequestStatus(request, 'Accepted');
  } finally {
      setAcceptingRequests((prev) => ({ ...prev, [request.model]: false })); // Reset accepting state for this request
      setIsRequestModalOpen(false);
  }
};

const handleReject = async (request) => {
  setRejectingRequests((prev) => ({ ...prev, [request.model]: true })); // Set rejecting state for this request
  try {
      await updateRequestStatus(request, 'Rejected');
  } finally {
      setRejectingRequests((prev) => ({ ...prev, [request.model]: false })); // Reset rejecting state for this request
  }
};

const updateRequestStatus = async (requestToUpdate, newStatus) => {
  try {
      if (newStatus === 'Accepted') {
          await transferChewyCoins(userPhoneNumber, Math.floor(datasetDetails.dataset_size / 2));
      }

      //const requestToUpdate = requests.find((request) => request.id === requestId);

      const payload = {
          model_name: requestToUpdate.model_name,
          model_org_name: requestToUpdate.model_org_name,
          dataset_name: datasetDetails.dataset_name,
          dataset_org_name: datasetDetails.org_name,
          status: newStatus,
      };

      const response = await API_UTIL.post('/updateRequestStatus', payload);

      if (response.status === 200) {
          await fetchDatasetRequests(datasetDetails); // Re-fetch the requests after updating the status
      } else {
          throw new Error('Failed to update request status');
      }
  } catch (error) {
      console.error(`Error updating request status: ${error.message}`);
  }
};

const handleCopyHashCode = () => {
  navigator.clipboard.writeText(hashCode).then(() => {
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus(''), 2000);
  }).catch((err) => {
    console.error('Failed to copy hash code:', err);
  });
};

const fetchDatasetRequests = async (dataset) => {
  try {
    console.log('Requests: called'+dataset);
      const requestsResponse = await API_UTIL.get(`/getDatasetRequests/${dataset.dataset_name}-${dataset.org_name}`);
      console.log('Requests:', requestsResponse.data);
      setRequests(requestsResponse.data);
          // Separate pending and accepted/rejected requests
   setPendingRequests(requestsResponse.data.filter(request => request.status === 'pending'));
    setCompletedRequests(requestsResponse.data.filter(request => request.status === 'Accepted' || request.status === 'Rejected'));
  } catch (error) {
      console.error('Error fetching dataset requests:', error);
  }
};


const fetchDataSetDetails = async (datasetName) => {
  try {
    const response = await API_UTIL.get(`/getDatasetDetails/Flashback/${datasetName}`);
    setDatasetDetails(response.data[0]);
    fetchDatasetRequests(response.data[0]);
  } catch (error) {
    console.error('Error fetching dataset details:', error);
  }
};

const openRequestDetailsModal = async (request) => {
        
  await fetchModelData(request)
  setSelectedRequest(request);
  setIsRequestModalOpen(true);
};

const closeRequestDetailsModal = () => {
  setIsRequestModalOpen(false);
  setSelectedRequest(null);
};
const fetchModelData = async (request) => {
  try {
    const response = await API_UTIL.get(`/getModelDetails/${request.model_org_name}/${request.model_name}`);
    setSelectedModel(response.data?.[0]);

  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

  // Disable the send button if either amount or address is not entered
  const isSendDisabled = !amount || !accountAddress || loading;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <TabContent>
            <TabHeading>Wallet Details</TabHeading>
            <WalletDetails>
              <HashCode>
                {formatHashCode(hashCode)}
                <CopyButton onClick={handleCopyHashCode}>
                  <Copy size={18} />
                </CopyButton>
                {copyStatus && <CopyMessage>{copyStatus}</CopyMessage>}
              </HashCode>
              <QRCodeWrapper>
                <CustomQRCode value={hashCode} size={150} logoUrl={'unityLogo.png'} logoSize={40} />
              </QRCodeWrapper>
             
              {photoCount &&(
              <SlideActionWrapper>
              <SlideToAction onSlideComplete={handleSlideComplete} label={label} />
              <DisclaimerText>
                * Enabling sharing will allow Flashback partners to gain permission to train on your data.
                </DisclaimerText>
                <CheckboxWrapper>
                  <input 
                    type="checkbox" 
                    id="autoBid" 
                    name="autoBid" 
                    defaultChecked 
                  />
                  <label htmlFor="autoBid">Enable Auto Train for Audited Models</label>
                </CheckboxWrapper>
              </SlideActionWrapper>
              )}
              <DatasetInfo>
          <DatasetInfoItem>
            <strong>Dataset Name:</strong> <span>{datasetDetails?.dataset_name}</span>
          </DatasetInfoItem>
          <DatasetInfoItem>
            <strong>Dataset Category:</strong> <span>{datasetDetails?.dataset_category}</span>
          </DatasetInfoItem>
          <DatasetInfoItem>
            <strong>Dataset Size:</strong> <span>{datasetDetails?.dataset_size}</span>
          </DatasetInfoItem>
        </DatasetInfo>
        <TagsContainer>
              <Tag>People</Tag>
              <Tag>Objects</Tag>
              <Tag>Accesories</Tag>
              <Tag>Clothing</Tag>
              <Tag>Wedding</Tag>
              <Tag>Events</Tag>
            </TagsContainer>
            </WalletDetails>
          </TabContent>
        );
      case 'transactions':
        return (
          <TabContent>
            <TabHeading>Transfer Unity Coins</TabHeading>
            <SendForm onSubmit={handleSend}>
              <StyledInput
                type="text"
                placeholder="Recipient's Wallet Address"
                value={accountAddress}
                onChange={(e) => setAccountAddress(e.target.value)}
              />
              {walletError && <ErrorMessage>{walletError}</ErrorMessage>}
              <StyledInput
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <SendButton
                type="submit"
                disabled={isSendDisabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Sending...' : 'Send'}
              </SendButton>
            </SendForm>
            <TabHeading>Recent Transactions</TabHeading>
            <TransactionList>
              { transactions. length > 0 ? (
              transactions.map((transaction) => (
                <TransactionItem key={transaction.transaction_id}>
                  <TransactionInfo>
                    <span>{transaction.from_address}</span>
                    <small>{new Date(transaction.transaction_date).toLocaleString()}</small>
                  </TransactionInfo>
                  <TransactionAmount type={transaction.from_mobile_number === userPhoneNumber ? 'sent' : 'received'}>
                    {transaction.from_mobile_number === userPhoneNumber ? '-' : '+'}
                    {transaction.amount}
                  </TransactionAmount>
                </TransactionItem>
              ))
            ) : (
              <NoDataMessage>No recent transactions to display.</NoDataMessage>
            )}
            </TransactionList>
          </TabContent>
        );
      case 'requests':
        return (
          <TabContent>
            <TabHeading>Dataset Requests</TabHeading>
            <RequestTabs>
              <RequestTabButton
                className={activeRequestTab === 'active' ? 'active' : ''}
                onClick={() => setActiveRequestTab('active')}
              >
                Active
              </RequestTabButton>
              <RequestTabButton
                className={activeRequestTab === 'completed' ? 'active' : ''}
                onClick={() => setActiveRequestTab('completed')}
              >
                Past Activity
              </RequestTabButton>
            </RequestTabs>
            <RequestList>
              {activeRequestTab === 'active' ? (
                pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <RequestItem key={request.model} onClick={() => openRequestDetailsModal(request)}>
                      <RequestInfo>
                        <span>{request.model_name}</span>
                        <small>{request.model_org_name}</small>
                      </RequestInfo>
                      <RequestActions>
                        <ActionButton
                          accept
                          onClick={(e) => { e.stopPropagation(); handleAccept(request); }}
                          disabled={acceptingRequests[request.model]}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {acceptingRequests[request.model] ? 'Accepting...' : 'Accept'}
                        </ActionButton>
                        <ActionButton
                          onClick={(e) => { e.stopPropagation(); handleReject(request); }}
                          disabled={rejectingRequests[request.model]}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {rejectingRequests[request.model] ? 'Rejecting...' : 'Reject'}
                        </ActionButton>
                      </RequestActions>
                    </RequestItem>
                  ))
                ) : (
                  <NoDataMessage>No active requests at the moment.</NoDataMessage>
                )
              ) : (
                completedRequests.length > 0 ? (
                  completedRequests.map((request) => (
                    <RequestItem key={request.model} onClick={() => openRequestDetailsModal(request)}>
                      <RequestInfo>
                        <span>{request.model_name}</span>
                        <small>{request.model_org_name}</small>
                      </RequestInfo>
                      <RequestStatus>
                        <StatusBadge status={request.status}>{request.status}</StatusBadge>
                        {request.status === 'Accepted' && (
                          <CoinsEarned>
                            {Math.floor(request.dataset_size / 2)} <img src='/unityLogo.png' alt='Coin' />
                          </CoinsEarned>
                        )}
                      </RequestStatus>
                    </RequestItem>
                  ))
                ) : (
                  <NoDataMessage>No completed requests to display.</NoDataMessage>
                )
              )}
            </RequestList>
          </TabContent>
        );
      default:
        return null;
    }
  };

  return (
    <StyledModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Wallet Details"
      className="wallet-modal-content"
      overlayClassName="modal-overlay"
    >
      <ModalHeader>
        <ModalTitle>Wallet</ModalTitle>
        <CloseButton
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={25} />
        </CloseButton>
      </ModalHeader>

      {/* <BalanceDisplay>
        Balance: {balance !== null ? `${balance} ` : 'Loading...'}
        {balance !== null && <img className='unityLogo' src='/unityLogo.png' alt='Unity Coin' />}
      </BalanceDisplay>
       */}
      <Balance
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        Balance: {balance !== null ? (
          <>
            {balance} <img className='unityLogo' src='/unityLogo.png' alt='Unity Coin' />
          </>
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            ⟳
          </motion.div>
        )}
      </Balance>


      <Tabs>
        <motion.button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Overview
        </motion.button>
        <motion.button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Transfer
        </motion.button>
        <motion.button
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Requests
        </motion.button>
      </Tabs>

      <AnimatePresence mode="wait">
        {renderTabContent()}
      </AnimatePresence>

      <RequestDetailsModal
        isOpen={isRequestModalOpen}
        onClose={closeRequestDetailsModal}
        request={selectedRequest}
        model={selectedModel}
        onAccept={handleAccept}
        onReject={handleReject}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
      />
    </StyledModal>
  );
};

const RequestDetailsModal = ({ isOpen, onClose, request, model, onAccept, onReject, isAccepting, isRejecting }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Request Details"
      className="modal-content request-modal"
      overlayClassName="modal-overlay"
    >
      <RequestModalContent>
        <RequestModalHeader>
          <RequestModalTitle>Request Details</RequestModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </RequestModalHeader>
        <RequestModalBody>
          {request && model ? (
            <>
              <RequestDetailItem>
                <Label>Model Name:</Label>
                <Value>{model.model_name}</Value>
              </RequestDetailItem>
              <RequestDetailItem>
                <Label>Model Category:</Label>
                <Value>{model.model_category}</Value>
              </RequestDetailItem>
              <RequestDetailItem>
                <Label>Organization:</Label>
                <OrganizationButton onClick={() => window.open(`/orgProfile`, '_blank')}>
                  {model.org_name}
                </OrganizationButton>
              </RequestDetailItem>
              <RequestDetailItem>
                <Label>Model URL:</Label>
                <Value>{model.model_url}</Value>
              </RequestDetailItem>
              <RequestDetailItem>
                <Label>Model Description:</Label>
                <Value>{model.model_desc}</Value>
              </RequestDetailItem>
              <RequestDetailItem>
                <Label>Model Audit Status:</Label>
                <Value>Audited</Value>
              </RequestDetailItem>
              {request.status === 'pending' && (
                <RequestActionButtons>
                  <ActionButton
                    accept
                    onClick={() => onAccept(request)}
                    disabled={isAccepting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isAccepting ? 'Accepting...' : 'Accept'}
                  </ActionButton>
                  <ActionButton
                    onClick={() => onReject(request)}
                    disabled={isRejecting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isRejecting ? 'Rejecting...' : 'Reject'}
                  </ActionButton>
                </RequestActionButtons>
              )}
              {request.status === 'Accepted' && (
                <RequestAcceptInfo>
                  Coins Credited: {Math.floor(request.dataset_size / 2)}
                  <UnityLogo src='/unityLogo.png' alt='Coin' />
                </RequestAcceptInfo>
              )}
            </>
          ) : (
            <LoadingMessage>Loading request details...</LoadingMessage>
          )}
        </RequestModalBody>
      </RequestModalContent>
    </Modal>
  );
};

// Additional styled components for the RequestDetailsModal
const RequestModalContent = styled.div`
  background-color: #1e1e1e;
  color: white;
  padding: 2em;
  border-radius: 1em;
  max-width: 500px;
  width: 90%;
  margin: 2em auto;
`;

const CoinsEarned = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
  font-weight: bold;
  margin-left: 1em;

  img {
    width: 16px;
    height: 16px;
    margin-left: 0.5em;
  }
`;


// const CoinsEarned = styled.span`
//   display: flex;
//   align-items: center;
//   color: #4CAF50;
//   font-weight: bold;
//   margin-top: 0.5em;

//   img {
//     width: 16px;
//     height: 16px;
//     margin-left: 0.5em;
//   }
// `;

const RequestModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
`;

const RequestModalTitle = styled.h3`
  font-size: 1.5em;
  margin: 0;
  color: #00ffff;
`;

const RequestModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const RequestDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;

const Label = styled.span`
  font-weight: bold;
  color: #a0a0a0;
`;

const Value = styled.span`
  color: #ffffff;
`;

const OrganizationButton = styled.button`
  background: #2a2a2a;
  border: none;
  padding: 0.5em 1em;
  border-radius: 0.5em;
  color: #00ffff;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: #3a3a3a;
  }
`;

const RequestActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1em;
`;

const RequestAcceptInfo = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1em;
  font-size: 0.9em;
  color: #ffffff;
`;

const UnityLogo = styled.img`
  width: 16px;
  height: 16px;
  margin-left: 0.5em;
`;

const NoDataMessage = styled.p`
  text-align: center;
  color: #a0a0a0;
  padding: 1em;
  background: #2a2a2a;
  border-radius: 0.5em;
  margin: 1em 0;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #a0a0a0;
`;

export default Wallet;