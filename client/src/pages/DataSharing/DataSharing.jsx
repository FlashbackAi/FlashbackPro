import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import API_UTIL from '../../services/AuthIntereptor';
import '../Dataset/DatasetDetails/DatasetDetails.css';
import AppBar from '../../components/AppBar/AppBar';
import LabelAndInput from '../../components/molecules/LabelAndInput/LabelAndInput';
import SlideToAction from '../../components/SlideToAction/SlideToAction';
import { toast } from 'react-toastify'; // Import toast for notifications
import './DataSharing.css';

function DataSharingPage() {
    const [photoCount, setPhotoCount] = useState(null);
    const [datasetDetails, setDatasetDetails] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const userPhoneNumber = localStorage.userPhoneNumber;
    const [label, setLabel] = useState('');

    const [formData, setFormData] = useState({
        org_name: 'Flashback',
        dataset_name: '',
        dataset_desc: '',
        dataset_category: '',
        dataset_url: '',
        dataset_acceskey: '',
        dataset_size: ''
    });

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

    const handleAccept = (request) => {
        updateRequestStatus(request, 'Accepted');
    };

    const handleReject = (request) => {
        updateRequestStatus(request, 'Rejected');
    };

    const closeRequestsModal = () => {
        setIsRequestsModalOpen(false);
    };

    // Separate pending and accepted/rejected requests
    const pendingRequests = requests.filter(request => request.status === 'pending');
    const completedRequests = requests.filter(request => request.status === 'Accepted' || request.status === 'Rejected');

    return (
        <div>
            <AppBar showCoins={true} />
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
                <div className="dataset-details-container">
                    <h1 className="dataset-details-title">{datasetDetails?.dataset_name}</h1>
                    <div className="model-tab-content">
                        {activeTab === 'details' && (
                            <>
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
                            </>
                        )}

                        {activeTab === 'requests' && (
                            <div className="requests-content">
                                <div className="dd-form-footer">
                                    {pendingRequests.length > 0 ? (
                                        <div>
                                            <div className="modal-header">
                                                <h2 className="modal-title">Requests for {datasetDetails.dataset_name} dataset</h2>
                                            </div>
                                            <div className="d-req-modal-body">
                                                {pendingRequests.map((request) => (
                                                    <div key={request.id} className="request-item">
                                                        <LabelAndInput
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
                                                        <div className='d-req-bottom-section'>
                                                            <div className='accept-section'>
                                                                <button className='accept-button' onClick={() => handleAccept(request)}>Accept</button>
                                                                <span className='disclaimer-text'>* Accept to earn {Math.floor(datasetDetails.dataset_size / 2)} 🪙</span>
                                                            </div>
                                                            <button className='accept-button' onClick={() => handleReject(request)}>Reject</button>
                                                        </div>
                                                        <hr className="modal-separator" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p>No Active requests found.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="history-content">
                                <div className="dd-form-footer">
                                    {completedRequests.length > 0 ? (
                                        <div>
                                            {/* <h2 className="history-title">History for {datasetDetails.dataset_name} dataset</h2> */}
                                            <div className="d-history-modal-body">
                                                {completedRequests.map((request) => (
                                                    <div key={request.id} className="history-request-item">
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataSharingPage;
