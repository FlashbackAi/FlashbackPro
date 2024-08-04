import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import {  useParams } from 'react-router-dom';
import API_UTIL from '../../../services/AuthIntereptor';
import './ModelDetails.css';

const DataSetDetails = () => {
  // const location = useLocation();
  const { orgName, modelName } = useParams();
  const [modelDetails, setModelDetails] = useState({});
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [datasets, setDatasets] = useState([]);

  console.log(modelName)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        console.log(modelName)
        const response = await API_UTIL.get(`/getModelDetails/${orgName}/${modelName}`);
        setModelDetails(response.data?.[0]);
        // Fetch requests data here when the modal is opened
      const dataSetResponse = await API_UTIL.get(`/getDatasets`);
      
      // setRequests(requestsResponse.data);
      // const hardCodedDatasets = [
      //   { id: 1, org_name: 'FLashback', dataset_name:'Faces Data' },
      //   { id: 2, org_name: 'FLashback', },
      //   { id: 3, org_name: 'FLashback' }
      // ];
  
      setDatasets(dataSetResponse.data);
      } catch (error) {
        console.error('Error fetching dataset details:', error);
      }
    };

    fetchEventData();
  }, [orgName, modelName]);

  const openRequestsModal = async () => {
    try {
      setIsRequestsModalOpen(true);
      console.log(datasets)

      
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
      {modelDetails?.model_name && (
        <div className="event-details-container">
          <h1 className="event-details-title">{modelDetails.model_name}</h1>
          <div className="event-details-content">
            <div className="ed-form-group">
              <p className="ed-form-value">Dataset Category: {modelDetails.model_category}</p>
              <p className="ed-form-value">Dataset Url: {modelDetails.model_url}</p>
            </div>
            <div className="ed-form-footer">
              <button className='footer-buttons' onClick={openRequestsModal}>Datasets</button>
            </div>
          </div>

          <Modal
            isOpen={isRequestsModalOpen}
            onRequestClose={closeRequestsModal}
            contentLabel="Requests"
            className="qr-modal-content"
            overlayClassName="modal-overlay"
          >
            {datasets.length > 0 ? (
              <div>
                <div className="modal-header">
                  <h2 className="modal-title">Available datasets</h2>
                  <button className="close-button" onClick={closeRequestsModal}>x</button>
                </div>
                <div className="qr-modal-body">
                  {datasets.map((dataset) => (
                    <div key={dataset.dataset_name} className="request-item">
                      <p>Owner: {dataset.org_name}</p>
                      <p>Dataset Name:{dataset.dataset_name}</p>
                      <button onClick={() => handleAccept(dataset.dataset_name)}>Request</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No Datasets found.</p>
            )}
          </Modal>
        </div>
      )}
    </>
  );
};

export default DataSetDetails;
