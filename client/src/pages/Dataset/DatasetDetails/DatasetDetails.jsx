import React, { useState, useEffect , useCallback} from 'react';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import API_UTIL from '../../../services/AuthIntereptor';
import './DatasetDetails.css';

const DataSetDetails = () => {
  const { orgName, datasetName } = useParams();
  const [datasetDetails, setDatasetDetails] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);


  const fetchDatasetRequests = useCallback(async () => {
    try {
      const requestsResponse = await API_UTIL.get(`/getDatasetRequests/${datasetName}-${orgName}`);
      console.log('Requests:', requestsResponse.data); // Debugging line
      setRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error fetching dataset requests:', error);
    }
  }, [datasetName, orgName]);

  // Fetch dataset details and requests when component mounts or when dataset/orgName changes
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await API_UTIL.get(`/getDatasetDetails/${orgName}/${datasetName}`);
        if (response.status === 200) {
          setDatasetDetails(response.data?.[0]);
          await fetchDatasetRequests(); // Fetch the requests after fetching dataset details
        }
      } catch (error) {
        console.error('Error fetching dataset details:', error);
      }
    };

    fetchEventData();
  }, [orgName, datasetName, fetchDatasetRequests]);

  // Update request status and re-fetch the updated requests
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      // Find the request by ID
      const requestToUpdate = requests.find(request => request.id === requestId);
      
      if (!requestToUpdate) {
        console.error(`Request with ID ${requestId} not found`);
        return;
      }

      // Prepare the payload for the update
      const payload = {
        model_name: requestToUpdate.model_name,
        model_org_name: requestToUpdate.model_org_name,
        dataset_name: datasetName,
        dataset_org_name: orgName,
        status: newStatus
      };

      // Call the API to update the request status
      const response = await API_UTIL.post('/updateRequestStatus', payload);
      
      if (response.status === 200) {
        await fetchDatasetRequests(); // Re-fetch the requests after updating the status
      } else {
        throw new Error("Failed to update request status");
      }
    } catch (error) {
      console.error(`Error updating request status: ${error.message}`);
    }
  };
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if(tab === 'requests'){
      await fetchDatasetRequests();
    }

  };
  
  const handleAccept = (requestId) => {
    updateRequestStatus(requestId, "Accepted");
  };

  const handleReject = (requestId) => {
    updateRequestStatus(requestId, "Rejected");
  };
  const closeRequestsModal = () => {
    setIsRequestsModalOpen(false);
  };

  return (
    <>
      {datasetDetails?.dataset_name && (
        <div className="event-details-container">
          <h1 className="event-details-title">{datasetDetails.dataset_name}</h1>

          <div className="model-tab-content">
            {activeTab === 'details' && (
              <div className="event-details-content">
                <div className="ed-form-group">
                  <p className="ed-form-value">Dataset Category: {datasetDetails.dataset_category}</p>
                  <p className="ed-form-value">Dataset Url: {datasetDetails.dataset_url}</p>
                  <p className="ed-form-value">Dataset size: {datasetDetails.dataset_size}</p>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="requests-content">
                <div className="ed-form-footer">
                {requests.length > 0 ? (
                  <div>
                    <div className="modal-header">
                      <h2 className="modal-title">Requests for {datasetDetails.dataset_name} dataset</h2>
                    </div>
                    <div className="qr-modal-body">
                      {requests.map((request) => (
                        <div key={request.id} className="request-item">
                          <p>Model: {request.model_name}</p>
                          <p>Owner: {request.model_org_name}</p>
                          <div>
                           <button onClick={() => handleAccept(request.id)}>Accept</button>
                          <button onClick={() => handleReject(request.id)}>Reject</button>
                          </div>
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

          <div className="tab-container">
            <span 
              className={`tab-link ${activeTab === 'details' ? 'active' : ''}`} 
              onClick={() => handleTabChange('details')}
            >
              Dataset Details
            </span>
            <span 
              className={`tab-link ${activeTab === 'requests' ? 'active' : ''}`} 
              onClick={() => handleTabChange('requests')}
            >
              Requests
            </span>
          </div>

          <Modal
            isOpen={isRequestsModalOpen}
            onRequestClose={closeRequestsModal}
            contentLabel="Requests"
            className="qr-modal-content"
            overlayClassName="modal-overlay"
          >
            {requests.length > 0 ? (
              <div>
                <div className="modal-header">
                  <h2 className="modal-title">Requests for {datasetDetails.dataset_name} dataset</h2>
                  <button className="close-button" onClick={closeRequestsModal}>x</button>
                </div>
                <div className="qr-modal-body">
                  {requests.map((request) => (
                    <div key={request.id} className="request-item">
                      <p>Owner: {request.owner}</p>
                      <button onClick={() => handleAccept(request.id)}>Accept</button>
                      <button onClick={() => handleReject(request.id)}>Reject</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No requests found.</p>
            )}
          </Modal>
        </div>
      )}
    </>
  );
};

export default DataSetDetails;
