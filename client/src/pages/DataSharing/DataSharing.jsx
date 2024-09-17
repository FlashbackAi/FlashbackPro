import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import API_UTIL from '../../services/AuthIntereptor';
import '../Dataset/DatasetDetails/DatasetDetails.css';
import AppBar from '../../components/AppBar/AppBar';
import LabelAndInput from '../../components/molecules/LabelAndInput/LabelAndInput';
import SlideToAction from '../../components/SlideToAction/SlideToAction';
import { toast } from 'react-toastify'; // Import toast for notifications
import { useNavigate } from 'react-router-dom'; // Import navigate hook if you want to navigate after completion

function DataSharingPage() {
    const [photoCount, setPhotoCount] = useState(null);
    const [datasetDetails, setDatasetDetails] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const userPhoneNumber = localStorage.userPhoneNumber;
    const [label,setLabel] = useState("");

    // Form data to be sent for dataset creation
    const [formData, setFormData] = useState({
        org_name: 'Flashback', // Adjust as needed
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
            console.log('Requests:', requestsResponse.data); // Debugging line
            setRequests(requestsResponse.data);
        } catch (error) {
            console.error('Error fetching dataset requests:', error);
        }
    }, [datasetDetails]);

    useEffect(() => {
        // Fetch the count from the backend API
        API_UTIL.get(`/imagesForFederated/${userPhoneNumber}`)
            .then(response => {
                setPhotoCount(response.data.count);
                setLabel(`Enable Sharing and Earn ${response.data.count / 2}`)
            })
            .catch(error => {
                console.error('Error fetching photo count:', error);
            });
    }, [userPhoneNumber]);

    useEffect(() => {
        // Fetch dataset and user details
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

    const updateRequestStatus = async (requestId, newStatus) => {
        try {
            const requestToUpdate = requests.find((request) => request.id === requestId);

            if (!requestToUpdate) {
                console.error(`Request with ID ${requestId} not found`);
                return;
            }

            const payload = {
                model_name: requestToUpdate.model_name,
                model_org_name: requestToUpdate.model_org_name,
                dataset_name: datasetDetails.dataset_name,
                dataset_org_name: datasetDetails.dataset_org_name,
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
    
        // Prepare the request payload
        const payload = {
          amount: amount,
          senderMobileNumber: senderMobileNumber,
          recipientMobileNumber: recipientMobileNumber,
        };
    
        // Call the API to transfer Chewy coins
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
    
        // Prepare the request payload
        const payload = {
          userPhoneNumber:userPhoneNumber
        };
    
        // Call the API to transfer Chewy coins
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
          org_name: 'Flashback', // Adjust as needed
          dataset_name: `Memories-${userDetails.user_name}`, // Adjust as needed
          dataset_desc: 'Images of a people memories', // Add a suitable description
          dataset_category: 'Faces', // Set the appropriate category
          dataset_url: 'URL of the dataset', // Set the dataset URL
          dataset_acceskey: 'Access key of the dataset', // Set the access key
          dataset_size: datasetSize || 0, // Use the photo count as the dataset size
      };
            const response = await API_UTIL.post('/saveDatasetDetails', updatedFormData);
            if (response.status !== 200) {
                throw new Error('Failed to save the Dataset');
            }
            toast.success('Dataset created successfully');
            await updateImageStatus(userPhoneNumber);
            await transferChewyCoins(userPhoneNumber, photoCount/2); // Assuming you have a function to update reward points
        } catch (error) {
            console.error('Error saving dataset:', error);
            toast.error('Failed to save the dataset. Please try again.');
        }
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        if (tab === 'requests') {
            await fetchDatasetRequests();
        }
    };

    const handleAccept = (requestId) => {
        updateRequestStatus(requestId, 'Accepted');
    };

    const handleReject = (requestId) => {
        updateRequestStatus(requestId, 'Rejected');
    };

    const closeRequestsModal = () => {
        setIsRequestsModalOpen(false);
    };

    
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
          </div>

          <div className='dataseDetails-root'>
              <div className="dataset-details-container">
                  <h1 className="dataset-details-title">{datasetDetails.dataset_name}</h1>
                  <div className="model-tab-content">
                      {/* Details Tab */}
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
                                            <SlideToAction onSlideComplete={handleSlideComplete} label={label} />
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

                      {/* Requests Tab */}
                      {activeTab === 'requests' && (
                          <div className="requests-content">
                              <div className="dd-form-footer">
                                  {requests.length > 0 ? (
                                      <div>
                                          <div className="modal-header">
                                              <h2 className="modal-title">Requests for {datasetDetails.dataset_name} dataset</h2>
                                          </div>
                                          <div className="d-req-modal-body">
                                              {requests.map((request) => (
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
                                                          <button onClick={() => updateRequestStatus(request.id, 'Accepted')}>Accept</button>
                                                          <button onClick={() => updateRequestStatus(request.id, 'Rejected')}>Reject</button>
                                                      </div>
                                                      <hr className="modal-separator" />
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  ) : (
                                      <p>No requests found.</p>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Modal for Request Actions */}
              <Modal
                  isOpen={isRequestsModalOpen}
                  onRequestClose={closeRequestsModal}
                  contentLabel="Requests"
                  className="d-req-modal-content"
                  overlayClassName="modal-overlay"
              >
                  {requests.length > 0 ? (
                      <div>
                          <div className="modal-header">
                              <h2 className="modal-title">Requests for {datasetDetails.dataset_name} dataset</h2>
                              <button className="close-button" onClick={closeRequestsModal}>x</button>
                          </div>
                          <div className="d-req-modal-body">
                              {requests.map((request) => (
                                  <div key={request.id} className="request-item">
                                      <p>Owner: {request.owner}</p>
                                      <button onClick={() => updateRequestStatus(request.id, 'Accepted')}>Accept</button>
                                      <button onClick={() => updateRequestStatus(request.id, 'Rejected')}>Reject</button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <p>No requests found.</p>
                  )}
              </Modal>
          </div>
      </div>
  );
}

export default DataSharingPage;
