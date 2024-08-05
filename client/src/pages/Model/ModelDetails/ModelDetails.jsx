import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API_UTIL from '../../../services/AuthIntereptor';
import './ModelDetails.css';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const DataSetDetails = () => {
  const { orgName, modelName } = useParams();
  const [modelDetails, setModelDetails] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [datasets, setDatasets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isdatasetDetailsModalOpen, setIsdatasetDetailsModalOpen] = useState(false);
  const [clickedDataset, setClickedDataset] = useState('');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await API_UTIL.get(`/getModelDetails/${orgName}/${modelName}`);
        setModelDetails(response.data?.[0]);

        const dataSetResponse = await API_UTIL.get(`/getDatasets`);
        setDatasets(dataSetResponse.data);

        // Fetch requests made by the model
        const requestsResponse = await API_UTIL.get(`/getDatasetRequestsbyModel/${modelName}-${orgName}`);
        setRequests(requestsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchEventData();
  }, [orgName, modelName]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const openDatasetDetailsModal = async (dataset) => {
    try {
      setIsdatasetDetailsModalOpen(true);
      setClickedDataset(dataset);
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  };

  const closeDatasetDetailsModal = () => {
    setIsdatasetDetailsModalOpen(false);
  };

  const onClickRequest = async (dataset) => {
    console.log("Request clicked");
    try {
      let formDataToSend = {
        model_name: modelDetails.model_name,
        model_org_name: modelDetails.org_name,
        dataset_name: dataset.dataset_name,
        dataset_org_name: dataset.org_name,
        status: 'pending'
      };

      const response = await API_UTIL.post('/requestDatasetAccess', formDataToSend);

      if (response.status === 200) {
        toast.success("Successfully sent the request");

        // Refresh the requests list after a new request is made
        const requestsResponse = await API_UTIL.get(`/getDatasetRequests/${modelName}-${orgName}`);
        setRequests(requestsResponse.data);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send the request");
    }
  };

  return (
    <div className="event-details-container">
      <h1 className="event-details-title">{modelDetails?.model_name || 'Loading...'}</h1>
      
      <div className="model-tab-content">
        {activeTab === 'details' && (
          <div className="model-details-content">
            <div className="ed-form-group">
              <p className="ed-form-value">Model Category: {modelDetails.model_category || 'Not available'}</p>
              <p className="ed-form-value">Model Url: {modelDetails.model_url || 'Not available'}</p>
              <p className="ed-form-value">Model Description: {modelDetails.model_desc || 'Not available'}</p>
            </div>
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="datasets-content">
            {datasets.length > 0 ? (
              datasets.map((dataset) => (
                <div key={dataset.dataset_name} className="dataset-item">
                  <p>Owner: {dataset.org_name}</p>
                  <p>Dataset Name: {dataset.dataset_name}</p>
                  <button onClick={() => onClickRequest(dataset)}>Request</button> 
                  <button onClick={() => openDatasetDetailsModal(dataset)}>Details</button>
                </div>
              ))
            ) : (
              <p>No Datasets found.</p>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-content">
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <div key={index} className="request-item">
                  <p>Dataset: {request.dataset_name}</p>
                  <p>Owner: {request.dataset_org_name}</p>
                  <p>Status: {request.status}</p>
                </div>
              ))
            ) : (
              <p>No requests found.</p>
            )}
          </div>
        )}
      </div>

      <div className="tab-container">
        <span 
          className={`tab-link ${activeTab === 'details' ? 'active' : ''}`} 
          onClick={() => handleTabChange('details')}
        >
          Model Details
        </span>
        <span 
          className={`tab-link ${activeTab === 'datasets' ? 'active' : ''}`} 
          onClick={() => handleTabChange('datasets')}
        >
          Datasets
        </span>
        <span 
          className={`tab-link ${activeTab === 'requests' ? 'active' : ''}`} 
          onClick={() => handleTabChange('requests')}
        >
          Requests
        </span>
      </div>

      <Modal
        isOpen={isdatasetDetailsModalOpen}
        onRequestClose={closeDatasetDetailsModal}
        contentLabel="Requests"
        className="qr-modal-content"
        overlayClassName="modal-overlay"
      >
        {clickedDataset && (
          <div>
            <div className="modal-header">
              <h2 className="modal-title">Details of {clickedDataset.dataset_name} dataset</h2>
              <button className="close-button" onClick={closeDatasetDetailsModal}>x</button>
            </div>
            <div className="qr-modal-body">
              <div className="ed-form-group">
                <p className="ed-form-value">Dataset Category: {clickedDataset.dataset_category}</p>
                <p className="ed-form-value">Dataset Url: {clickedDataset.dataset_url}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataSetDetails;
