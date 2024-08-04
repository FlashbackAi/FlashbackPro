import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import {  useParams } from 'react-router-dom';
import API_UTIL from '../../../services/AuthIntereptor';
import './DatasetDetails.css';

const DataSetDetails = () => {
  // const location = useLocation();
  const { orgName, datasetName } = useParams();
  const [datasetDetails, setDatasetDetails] = useState({});
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await API_UTIL.get(`/getDatasetDetails/${orgName}/${datasetName}`);
        setDatasetDetails(response.data?.[0]);
      } catch (error) {
        console.error('Error fetching dataset details:', error);
      }
    };

    fetchEventData();
  }, [orgName, datasetName]);

  const openRequestsModal = async () => {
    try {
      setIsRequestsModalOpen(true);

      // Fetch requests data here when the modal is opened
      // const requestsResponse = await API_UTIL.get(`/getRequests/${datasetName}`);
      
      // setRequests(requestsResponse.data);
      const hardCodedRequests = [
        { id: 1, owner: 'Maha AI' },
        { id: 2, owner: 'Mid Journey' },
        { id: 3, owner: 'Chat GPT' }
      ];
  
      setRequests(hardCodedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const closeRequestsModal = () => {
    setIsRequestsModalOpen(false);
  };

  const handleAccept = (requestId) => {
    console.log(`Accepted request ${requestId}`);
    // Handle accept logic here
  };

  const handleReject = (requestId) => {
    console.log(`Rejected request ${requestId}`);
    // Handle reject logic here
  };

  return (
    <>
      {datasetDetails?.dataset_name && (
        <div className="event-details-container">
          <h1 className="event-details-title">{datasetDetails.dataset_name}</h1>
          <div className="event-details-content">
            <div className="ed-form-group">
              <p className="ed-form-value">Dataset Category: {datasetDetails.dataset_category}</p>
              <p className="ed-form-value">Dataset Url: {datasetDetails.dataset_url}</p>
            </div>
            <div className="ed-form-footer">
              <button className='footer-buttons' onClick={openRequestsModal}>Requests</button>
            </div>
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
