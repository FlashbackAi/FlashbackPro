// Wallet.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { Copy, X } from 'lucide-react';
import API_UTIL from '../../services/AuthIntereptor';
import { useNavigate } from 'react-router-dom';
import CustomQRCode from '../CustomQRCode/CustomQRCode';
import SlideToAction from '../SlideToAction/SlideToAction';
import { toast } from 'react-toastify'; // Import toast for notifications
import LabelAndInput from '../molecules/LabelAndInput/LabelAndInput';


const StyledModal = styled(Modal)`
  &.wallet-modal-content {
    background-color: #1e1e1e;
    color: white;
    padding: 2em;
    margin: 2em auto;
    border-radius: 1em;
    min-height:40em;
    width:40em;
    outline: none;
    box-shadow: 0 0.5em 2em rgba(0, 0, 0, 0.3);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
`;

const ModalTitle = styled.h2`
  font-size: 1.5em;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
`;

const WalletDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Balance = styled.div`
  font-size: 2em;
  margin-bottom: 1em;
  display: flex;
  align-items: center;
  
  img {
    height: 1.5em;
    width: 1.5em;
    margin-left: 0.5em;
  }
`;

const HashCode = styled.div`
  display: flex;
  align-items: center;
  background: #2a2a2a;
  padding: 0.5em 1em;
  border-radius: 2em;
  margin-bottom: 1em;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #00ffff;
  cursor: pointer;
  margin-left: 0.5em;
  display: flex;
  align-items: center;
`;

const QRCodeWrapper = styled.div`
  background: white;
  // padding: 1em;
  border-radius: 0.5em;
  margin-bottom: 1em;
`;

const WithdrawButton = styled.button`
  background: linear-gradient(90deg, #66D3FF 0%, #9A6AFF 38%, #EE75CB 71%, #FD4D77 100%);
  border: none;
  color: white;
  padding: 0.75em 2em;
  border-radius: 2em;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-around;
  background: #2a2a2a;
  border-radius: 0.5em;
  overflow: hidden;
  margin-top: 1em; /* Space between content and tabs */

  button {
    flex: 1;
    padding: 0.75em;
    background: none;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.3s ease;

    &.active {
      background: #9A6AFF;
    }
  }
`;

const RequestTabs = styled.div`
  display: flex;
  margin-bottom: 1em;
`;

const RequestTabButton = styled.button`
  flex: 1;
  padding: 0.75em 1.5em;
  background: #2a2a2a;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: bold;

  &.active {
    background: #9A6AFF;
    color: #fff;
  }

  &:hover {
    background: #555;
  }
`;

const RequestCard = styled.div`
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1em;
  margin-bottom: 1em;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RequestDetails = styled.div`
  flex: 1;
  margin-left: 1em;
  color: #fff;
`;

const RequestButtonSection = styled.div`
  display: flex;
  gap: 0.5em;
   bottom: 0.0005em;
`;

const RequestButton = styled.button`
  background: #66D3FF;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.5em 1em;
  cursor: pointer;
  font-size: 0.9em;

  &:hover {
    background: #559ac8;
  }

  &.reject {
    background: #ff6666;

    &:hover {
      background: #cc5555;
    }
  }

  &:disabled {
    background: #777;
    cursor: not-allowed;
  }
`;

const HistoryRequestItem = styled.div`
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1em;
  margin-bottom: 1em;
`;

const HistoryText = styled.span`
  display: block;
  color: #fff;
  margin-bottom: 0.5em;

  .label-left {
    font-weight: bold;
    color: #ccc;
  }

  .label-right {
    color: #fff;
  }
`;

const UnityLogo = styled.img`
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-left: 0.25em;
`;

const ModalSeparator = styled.hr`
  border: 0;
  border-top: 1px solid #444;
  margin: 1em 0;
`;


const Wallet = ({ isOpen, onClose,userPhoneNumber, datasetName, showCoins }) => {
  const [walletDetails, setWalletDetails] = useState(null);
  const [hashCode, setHashCode] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy');
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
    const fetchBalance = async (walletAddress) => {
    try {
      const response = await API_UTIL.get(`/wallet-balance/${walletAddress}`);
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };
    const userPhoneNumber = localStorage.getItem('userPhoneNumber');
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

  const copyHashCode = () => {
    navigator.clipboard.writeText(hashCode).then(() => {
      setCopyStatus('Copied');
      setTimeout(() => setCopyStatus('Copy Code'), 1000);
    }).catch((err) => {
      console.error('Failed to copy hash code:', err);
    });
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
          <WalletDetails>
            <Balance>
              {balance !== null ? (
                <>
                  {balance} <img className='unityLogo' src='/unityLogo.png' alt='' />
                </>
              ) : (
                'Loading...'
              )}
            </Balance>
            <HashCode>
              {formatHashCode(hashCode)}
              <CopyButton onClick={copyHashCode} title={copyStatus}>
                <Copy size={18} /> {copyStatus}
              </CopyButton>
            </HashCode>
            <QRCodeWrapper>
              <CustomQRCode value={hashCode} size={200} logoUrl={'unityLogo.png'} logoSize={50} />
            </QRCodeWrapper>
            <>
                <SlideToAction onSlideComplete={handleSlideComplete} label={label} />
                <span className='disclaimer-text'>* Enabling sharing will allow Flashback partners to gain permission to train on your data.</span>
            </>
            <div className="dataset-details-content">
              {datasetDetails?.dataset_name && (
                  <div className="dd-form-group">

                    <span>dataset name : {datasetDetails.dataset_name}</span>
                    <span>dataset category : {datasetDetails.dataset_category}</span>
                    <span>dataset size : {datasetDetails.dataset_size}</span>
                      
                  </div>
              )}
          </div>
          </WalletDetails>
        );
      case 'transactions':
        return (
          <div className="withdraw-page">
            <div className="withdraw-body">
              <div className="send-section">
                <div className="send-header">
                  <span className="send-title">Send Unity Coins</span>
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
                <span className="withdraw-title">Recent Activity</span>
      
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
        case 'requests':
          return (
            <>
            {activeTab === 'requests' && (
              <div className="dataset-req-container">
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
                    Completed
                  </RequestTabButton>
                </RequestTabs>

                {activeRequestTab === 'active' && (
                  <div className="requests-content">
                    {pendingRequests.length > 0 ? (
                      <>
                        {pendingRequests.map((request) => (
                          <div className="request-card" key={request.model}>
                          <span className="req-model-name">{request.model_name}</span>  
                          <img className="req-model-img" src="/modelIcon.jpg" alt="img" onClick={() => openRequestDetailsModal(request)} />
                          <div className="req-model-button-sec">
                              <button
                                  className="req-model-button"
                                  onClick={() => handleAccept(request)}
                                  disabled={acceptingRequests[request.model]} // Disable button only for the current request
                              >
                                  {acceptingRequests[request.model] ? 'Accepting...' : 'Accept'}
                              </button>
                              <button
                                  className="req-model-button"
                                  onClick={() => handleReject(request)}
                                  disabled={rejectingRequests[request.model]} // Disable button only for the current request
                              >
                                  {rejectingRequests[request.model] ? 'Rejecting...' : 'Reject'}
                              </button>
                          </div>
                      </div>
                        ))}
                      </>
                    ) : (
                      <p>No Active requests found.</p>
                    )}
                  </div>
                )}

                {activeRequestTab === 'completed' && (
                  <div className="requests-content">
                    {completedRequests.length > 0 ? (
                      <>
                        {completedRequests.map((request) => (
                          <HistoryRequestItem key={request.model}>
                            <HistoryText>
                              <span className="label-left">Model:</span>
                              <span className="label-right">{request.model_name}</span>
                            </HistoryText>
                            <HistoryText>
                              <span className="label-left">Owner:</span>
                              <span className="label-right">{request.model_org_name}</span>
                            </HistoryText>
                            <HistoryText>
                              <span className="label-left">Request Status:</span>
                              <span className="label-right">{request.status}</span>
                            </HistoryText>
                            {request?.status === 'Accepted' && (
                              <HistoryText>
                                <span className="label-left">Coins Credited:</span>
                                <span className="label-right">
                                  {Math.floor(request.dataset_size / 2)}
                                  <UnityLogo src="/unityLogo.png" alt="Coin" />
                                </span>
                              </HistoryText>
                            )}
                            <HistoryText>
                              <span className="label-left">Model URL:</span>
                              <span className="label-right">{request.model_url}</span>
                            </HistoryText>
                            <ModalSeparator />
                          </HistoryRequestItem>
                        ))}
                      </>
                    ) : (
                      <p>No completed requests found.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>

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
        <CloseButton onClick={onClose}><X size={25} /></CloseButton>
      </ModalHeader>
      
      {renderTabContent()}

      {/* {activeTab === 'overview' && (
        <WithdrawButton onClick={() => navigate('/withdraw')}>
          Withdraw
        </WithdrawButton>
      )} */}

      <Tabs>
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Details
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          Transfer
        </button>
        <button
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
        
      </Tabs>

      <Modal
                isOpen={isRequestModalOpen}
                contentLabel="Request Details"
                className="modal-content event-modal"
                overlayClassName="modal-overlay"
                onRequestClose={closeRequestDetailsModal}
                >
                <div className="modal-header">
                
                    <h2 className="modal-title">Request Details</h2>
                    <button className="close-button" onClick={closeRequestDetailsModal}>
                    x
                  </button>
                </div>
                <div className="modal-body">
                    {selectedRequest ? (

                      <>
                        
                    
                          <div className="form-group">
                          <LabelAndInput
                              label="Model Name:"
                              type="text"
                              value={selectedModel.model_name}
                              isEditable={false}
                          />
                          </div>
                          <div className="form-group">
                          <LabelAndInput
                              label="Model Category:"
                              type="text"
                              value={selectedModel.model_category}
                              isEditable={false}
                          />
                          </div>
                          <div className="model-org-section">
                          {/* <LabelAndInput
                              label="Organization Name:"
                              type="text"
                              value={selectedModel.org_name}
                              isEditable={false}
                          /> */}
                          <span className='model-org-label'>Organisation:</span>
                          <button className='model-org-button' onClick={()=>navigate(`/orgDetails/${selectedModel.org_name}`)}>{selectedModel.org_name}</button>
                          </div>
                          <div className="form-group">
                          <LabelAndInput
                              label="Model_url:"
                              type="text"
                              value={selectedModel.model_url}
                              isEditable={false}
                          />
                          </div>
                          <div className="form-group">
                          <LabelAndInput
                              label="Model desc"
                              type="text"
                              value={selectedModel.model_desc}
                              isEditable={false}
                          />
                          </div>
                          <div className="form-group">
                          <LabelAndInput
                              label="Model Audit Status"
                              type="text"
                              value={selectedModel.is_audited}
                              isEditable={false}
                          />
                          </div>
                          <div className="req-model-details-button-sec"> 
                              <button
                                  className="req-model-details-button"
                                  onClick={() => handleAccept(selectedRequest)}
                                  disabled={isAccepting} // Disable button while accepting
                                  >
                                  {isAccepting ? 'Accepting...' : 'Accept'}
                                  </button>

                              <button
                                  className='req-model-details-button'
                                  onClick={() => handleReject(selectedRequest)}
                                  disabled={isRejecting} // Disable button while rejecting
                              >
                                  {isRejecting ? 'Rejecting...' : 'Reject'}
                              </button>
                          </div>
                          <span className='req-accept-info'>* Accept the requst to earn {Math.floor(selectedRequest.dataset_size/2)} <img className='unityLogo' src='/unityLogo.png' alt='Coin' /> </span>

                      </>
                    ) : (
                    <p>Loading request details...</p>
                    )}
                </div>
                </Modal>
    </StyledModal>
    
  );
};

export default Wallet;
