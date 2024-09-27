import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import API_UTIL from '../../services/AuthIntereptor';
import '../Dataset/DatasetDetails/DatasetDetails.css';
import AppBar from '../../components/AppBar/AppBar';
import LabelAndInput from '../../components/molecules/LabelAndInput/LabelAndInput';
import SlideToAction from '../../components/SlideToAction/SlideToAction';
import { toast } from 'react-toastify'; // Import toast for notifications
import { useNavigate } from 'react-router-dom';
import './DataSharing.css';

function DataSharingPage() {
    const [photoCount, setPhotoCount] = useState(null);
    const [datasetDetails, setDatasetDetails] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [requests, setRequests] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const userPhoneNumber = localStorage.userPhoneNumber;
    const [label, setLabel] = useState('');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [acceptingRequests, setAcceptingRequests] = useState({});
    const [rejectingRequests, setRejectingRequests] = useState({});


    const navigate = useNavigate();


    // const [formData, setFormData] = useState({
    //     org_name: 'Flashback',
    //     dataset_name: '',
    //     dataset_desc: '',
    //     dataset_category: '',
    //     dataset_url: '',
    //     dataset_acceskey: '',
    //     dataset_size: ''
    // });
    const fetchModelData = async (request) => {
        try {
          const response = await API_UTIL.get(`/getModelDetails/${request.model_org_name}/${request.model_name}`);
          setSelectedModel(response.data?.[0]);
  
        } catch (error) {
          console.error('Error fetching data:', error);
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
    

    const fetchDatasetRequests = useCallback(async () => {
        try {
            const requestsResponse = await API_UTIL.get(`/getDatasetRequests/${datasetDetails.dataset_name}-${datasetDetails.org_name}`);
            console.log('Requests:', requestsResponse.data);
            setRequests(requestsResponse.data);
        } catch (error) {
            console.error('Error fetching dataset requests:', error);
        }
    }, [datasetDetails]);

    useEffect(() => {
        API_UTIL.get(`/imagesForFederated/${userPhoneNumber}`)
            .then(response => {
                setPhotoCount(response.data.count);
                setLabel(`Enable to Earn ${Math.floor(response.data.count / 2)} 🪙`);
            })
            .catch(error => {
                console.error('Error fetching photo count:', error);
            });
    }, [userPhoneNumber]);

    useEffect(() => {
        const fetchDataSetDetails = async (userName) => {
            API_UTIL.get(`/getDatasetDetails/Flashback/Memories-${userName}`)
                .then(response => {
                    setDatasetDetails(response.data[0]);
                })
                .catch(error => {
                    console.error('Error fetching dataset details:', error);
                });
        };

        const fetchUserDetails = async () => {
            try {
                const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
                setUserDetails(response.data.data);
                fetchDataSetDetails(response.data.data.user_name);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };
        fetchUserDetails();
    }, [userPhoneNumber]);

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
                await fetchDatasetRequests(); // Re-fetch the requests after updating the status
            } else {
                throw new Error('Failed to update request status');
            }
        } catch (error) {
            console.error(`Error updating request status: ${error.message}`);
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

            if (response.status === 200) {
                toast.success(' Rewards added  successfully!');
            } else {
                throw new Error('Failed to transfer Chewy Coins.');
            }
        } catch (error) {
            console.error('Error transferring Chewy Coins:', error);
            toast.error('Failed to transfer Chewy Coins. Please try again.');
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
            toast.error('Failed to transfer Chewy Coins. Please try again.');
        }
    };

    const handleSlideComplete = async () => {
        try {
            const datasetSize = (datasetDetails?.dataset_size || 0) + (photoCount || 0);

            const updatedFormData = {
                org_name: 'Flashback',
                dataset_name: `Memories-${userDetails.user_name}`,
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
            toast.success('Dataset created successfully');
            await updateImageStatus(userPhoneNumber);
            await transferChewyCoins(userPhoneNumber, Math.floor(photoCount / 2));
        } catch (error) {
            console.error('Error saving dataset:', error);
            toast.error('Failed to save the dataset. Please try again.');
        }
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        if (tab === 'requests' || tab === 'history') {
            await fetchDatasetRequests();
        }
    };

    // const handleAccept = async (request) => {
    //     try {
    //         setIsAccepting(true); // Set accepting state to true
    //         await updateRequestStatus(request, 'Accepted');
    //     } finally {
    //         setIsAccepting(false); // Reset accepting state to false after operation
    //     }
    // };
    
    // const handleReject = async (request) => {
    //     try {
    //         setIsRejecting(true); // Set rejecting state to true
    //         await updateRequestStatus(request, 'Rejected');
    //     } finally {
    //         setIsRejecting(false); // Reset rejecting state to false after operation
    //         setIsRequestModalOpen(false)
    //     }
    // };
    
    
        const handleAccept = async (request) => {
            setAcceptingRequests((prev) => ({ ...prev, [request.model]: true })); // Set accepting state for this request
            try {
                await updateRequestStatus(request, 'Accepted');
            } finally {
                setAcceptingRequests((prev) => ({ ...prev, [request.model]: false })); // Reset accepting state for this request
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

    // Separate pending and accepted/rejected requests
    const pendingRequests = requests.filter(request => request.status === 'pending');
    const completedRequests = requests.filter(request => request.status === 'Accepted' || request.status === 'Rejected');

    return (
        <div>
            <AppBar showCoins={true} />
            <h1 className="dataset-details-title">{datasetDetails?.dataset_name}</h1>
            <div className="tab-switcher">
                <button
                    className={`tab-switch-button ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => handleTabChange('details')}
                >
                    Dataset Details
                </button>
                <button
                    className={`tab-switch-button ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => handleTabChange('requests')}
                >
                    Requests
                </button>
                <button
                    className={`tab-switch-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => handleTabChange('history')}
                >
                    History
                </button>
            </div>

            <div className='dataseDetails-root'>
                
               
                   
                    <div className="model-tab-content">
                    {activeTab === 'details' && (
                    <div className="dataset-details-container">
                            {photoCount !== null && (
                                <>
                                    <span className='datasetDetails-text'>
                                        {photoCount > 0
                                            ? `Number of photos Eligible for Earning Rewards: ${photoCount}`
                                            : 'No photos eligible for earning rewards.'}
                                    </span>
                                    {photoCount > 0 && (
                                        <>
                                            <SlideToAction onSlideComplete={handleSlideComplete} label={label} />
                                            <span className='disclaimer-text'>* Enabling sharing will allow Flashback partners to gain permission to train on your data.</span>
                                        </>
                                    )}
                                </>
                            )}
                            <div className="dataset-details-content">
                                {datasetDetails?.dataset_name && (
                                    <div className="dd-form-group">
                                        <LabelAndInput
                                            name={'datasetCategory'}
                                            label={'Dataset Category:'}
                                            value={datasetDetails.dataset_category}
                                            type={'text'}
                                            isEditable={false}
                                        />
                                        <LabelAndInput
                                            name={'datasetUrl'}
                                            label={'Dataset URL:'}
                                            value={datasetDetails.dataset_url}
                                            type={'text'}
                                            isEditable={false}
                                        />
                                        <LabelAndInput
                                            name={'datasetSize'}
                                            label={'Dataset Size:'}
                                            value={datasetDetails.dataset_size}
                                            type={'text'}
                                            isEditable={false}
                                        />
                                    </div>
                                )}
                            </div>
                       
                    </div>
                    )}
                    {activeTab === 'requests' && (
                    <div className="dataset-req-container">
                      
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
                       
                    </div>
                     )}
                    {activeTab === 'history' && (
                    <div className="dataset-history-container">

                       
                            <div className="history-content">
                                <div className="dd-form-footer">
                                    {completedRequests.length > 0 ? (
                                        <div>
                                            {/* <h2 className="history-title">History for {datasetDetails.dataset_name} dataset</h2> */}
                                            <div className="d-history-modal-body">
                                                {completedRequests.map((request) => (
                                                    <div key={request.model} className="history-request-item">
                                                        <span className='history-text'><span className='label-left'>Model</span>: <span className='label-right'>{request.model_name}</span></span>
                                                        <span className='history-text'><span className='label-left'> Owner</span>:<span className='label-right'>{request.model_org_name}</span></span>
                                                        <span className='history-text'><span className='label-left'>Request Status</span>: <span className='label-right'>{request.status}</span></span>
                                                        {request?.status === 'Accepted' &&(
                                                            <span className='history-text'><span className='label-left'>Coins Credited</span>:<span className='label-right'>{Math.floor(request.dataset_size/2)}🪙</span></span>
                                                        )}
                                                        <span className='history-text'><span className='label-left'>Model URL</span>:<span className='label-right'>{request.model_url}</span></span>
                                                        {/* <LabelAndInput
                                                            name={'modelName'}
                                                            label={'Model:'}
                                                            value={request.model_name}
                                                            type={'text'}
                                                            isEditable={false}
                                                        />
                                                        <LabelAndInput
                                                            name={'modelOwner'}
                                                            label={'Owner:'}
                                                            value={request.model_org_name}
                                                            type={'text'}
                                                            isEditable={false}
                                                        /> 
                                                        <div>Status: {request.status}</div>
                                                        */}
                                                        <hr className="modal-separator" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p>No history found.</p>
                                    )}
                                </div>
                            </div>
                      
                    </div>
                      )}
                </div>
            </div>
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
                        <span className='req-accept-info'>* Accept the requst to earn {Math.floor(selectedRequest.dataset_size/2)} 🪙 </span>

                    </>
                    ) : (
                    <p>Loading request details...</p>
                    )}
                </div>
                </Modal>

        </div>
    );
}

export default DataSharingPage;
