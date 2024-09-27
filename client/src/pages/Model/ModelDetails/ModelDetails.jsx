import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API_UTIL from '../../../services/AuthIntereptor';
import './ModelDetails.css';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';
import OrgHeader from '../../../components/OrgHeader/OrgHeader';

const ModelDetails = () => {
  const { orgName, modelName } = useParams();
  const [modelDetails, setModelDetails] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [datasets, setDatasets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isDatasetDetailsModalOpen, setIsDatasetDetailsModalOpen] = useState(false);
  const [clickedDataset, setClickedDataset] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const userPhoneNumber =localStorage.userPhoneNumber;
  const [balance, setBalance] = useState();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [requestingStatus, setRequestingStatus] = useState({});


  useEffect(() => {
    const fetchModelData = async () => {
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

    fetchModelData();
   

  }, [orgName, modelName, userPhoneNumber]);

  useEffect(() => {
    // Define the polling interval in milliseconds (e.g., 5000ms = 5 seconds)
    const pollingInterval = 5000;
  
    const fetchUserDetails = async () => {
      try {
        const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
        setUserDetails(response.data.data);
        setBalance(response.data.data.reward_points)
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
  
    // Poll the fetchUserDetails method at the specified interval
    const intervalId = setInterval(fetchUserDetails, pollingInterval);
  
    // Fetch immediately on component mount
    fetchUserDetails();
  
    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [userPhoneNumber]); // Add any dependencies here, like userPhoneNumber
  
  useEffect(() => {
    // Define the polling interval in milliseconds (e.g., 5000ms = 5 seconds)
    const pollingInterval = 5000;
  
    const fetchBalance = async () => {
      try {
        const response = await API_UTIL.get(`/wallet-balance/${userPhoneNumber}`); // Use your API endpoint
        setBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };
  
    // Poll the fetchUserDetails method at the specified interval
    const intervalId = setInterval(fetchBalance, pollingInterval);
  
    // Fetch immediately on component mount
    fetchBalance();
  
    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [userPhoneNumber]);
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'requests') {
      // Fetch requests made by the model
      const requestsResponse = await API_UTIL.get(`/getDatasetRequestsbyModel/${modelName}-${orgName}`);
      setRequests(requestsResponse.data);
    }
  };

  const openDatasetDetailsModal = (dataset) => {
    setIsDatasetDetailsModalOpen(true);
    setClickedDataset(dataset);
  };

  const closeDatasetDetailsModal = () => {
    setIsDatasetDetailsModalOpen(false);
  };

  const deductCoins = async (coins) => {
    try {
      // Prepare the request payload
      const payload = {
        amount: coins, // The number of images is the amount to deduct
        senderMobileNumber: userPhoneNumber, // The current user's phone number
        recipientMobileNumber: "+919090401234" // The fixed recipient phone number
      };
  
      // Call the API to transfer Chewy coins
      const response = await API_UTIL.post('/transfer-chewy-coins', payload);
      return response;
      // if (response.status === 200) {
      // } else {
      //   throw new Error('Failed to deduct coins.');
      // }
    } catch (error) {
      console.error('Error deducting coins:', error);
      toast.error('Failed to deduct coins. Please try again.');
    }
  };

  const auditModel = async () => {
    try{
      setIsAuditing(true);
      await deductCoins('10000');
      const updatedModel = {
        org_name: modelDetails.org_name,
        model_name:modelDetails.model_name,
        model_category: modelDetails.model_category,
        model_url: modelDetails.model_url,
        model_desc: modelDetails.model_desc,
        is_audited:true
      }
      const response = await API_UTIL.post('/saveModelDetails', updatedModel);
      if(response.status!==200){
        throw Error("Error in auditing model")
      }else{
        setModelDetails(updatedModel);
      }
    }catch(err){
      console.log(err);
    }
    finally{
      setIsAuditing(false);
    }
  };

  const onClickRequest = async (dataset) => {
    try {
        // Set the requesting state to true for the clicked dataset
        setRequestingStatus((prev) => ({ ...prev, [dataset.dataset_name]: true }));
        
        let formDataToSend = {
            model_name: modelDetails.model_name,
            model_org_name: modelDetails.org_name,
            dataset_name: dataset.dataset_name,
            dataset_org_name: dataset.org_name,
            status: 'pending',
            dataset_size: dataset.dataset_size,
            model_url: modelDetails.model_url,
        };
        
        const resp = await deductCoins((dataset.dataset_size * 10).toString());

        if (resp.status === 200) {
            const response = await API_UTIL.post('/requestDatasetAccess', formDataToSend);

            if (response.status === 200) {
                toast.success("Successfully sent the request", { autoClose: 2000 });
            } else if (response.status === 400) {
                toast.success("Request Already Exists", { autoClose: 1500 });
            }

            // Refresh the requests list after a new request is made
            const requestsResponse = await API_UTIL.get(`/getDatasetRequests/${modelName}-${orgName}`);
            setRequests(requestsResponse.data);
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to send the request", { autoClose: 1500 });
    } finally {
        // Reset the requesting state for the clicked dataset
        setRequestingStatus((prev) => ({ ...prev, [dataset.dataset_name]: false }));
    }
};


  return (
    <>
    {userDetails && userDetails.org_name && <OrgHeader orgObj={userDetails}/>}
        <div className="tab-switcher">
            <button
              className={`tab-switch-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => handleTabChange('details')}
            >
              Model Details
            </button>
            <button
              className={`tab-switch-button ${activeTab === 'datasets' ? 'active' : ''}`}
              onClick={() => handleTabChange('datasets')}
            >
              Datasets
            </button>
            <button
              className={`tab-switch-button ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => handleTabChange('requests')}
            >
              My Requests
            </button>
          </div>
      {modelDetails?.model_name && (
        <div className="model-details-container">
          <h1 className="model-details-title">{modelDetails.model_name}</h1>

          <div className="model-tab-content">
            {activeTab === 'details' && (
              <div className="model-details-content">
                <div className="md-form-group">
                  <LabelAndInput
                    name={'modelCategory'}
                    label={'Model Category:'}
                    value={modelDetails.model_category}
                    type={'text'}
                    handleChange={() => {}} // Not editable
                    isEditable={false}
                  />
                  <LabelAndInput
                    name={'modelUrl'}
                    label={'Model URL:'}
                    value={modelDetails.model_url}
                    type={'text'}
                    handleChange={() => {}} // Not editable
                    isEditable={false}
                  />
                  <LabelAndInput
                    name={'modelDesc'}
                    label={'Model Description:'}
                    value={modelDetails.model_desc}
                    type={'text'}
                    handleChange={() => {}} // Not editable
                    isEditable={false}
                  />
                  {/* <LabelAndInput
                    name={'datasetSize'}
                    label={'Required Dataset Size:'}
                    value={modelDetails.dataset_size}
                    type={'text'}
                    handleChange={() => {}} // Not editable
                    isEditable={false}
                  /> */}
                  {!modelDetails?.is_audited ? (
                      <div className="audit-section">
                        <div>
                          <button onClick={() => auditModel()} disabled={isAuditing}>
                            {isAuditing ? 'Auditing...' : 'Audit : 10000🪙'} 
                          </button>
                          <span className="audit-info"> * Request your model for Auditing</span>
                        </div>
                      </div>
                    ) : (
                      <LabelAndInput
                        name={'isAudited'}
                        label={'Model Audit Status:'}
                        value={modelDetails.is_audited}
                        type={'text'}
                        handleChange={() => {}} // Not editable
                        isEditable={false}
                      />
)}

                 
                </div>
              </div>
            )}

            {activeTab === 'datasets' && (
              <div className="datasets-content">
               {datasets.length > 0 ? (
                    datasets.map((dataset) => (
                        <div className="dataset-card" key={dataset.dataset_name}>
                            <span className='req-dataset-name'>{dataset.dataset_name}</span>  
                            <img className='req-dataset-img' src='/datasetIcon.jpg' alt="img" onClick={() => openDatasetDetailsModal(dataset)} />
                            <div className='req-dataset-button-sec'> 
                                <button
                                    className='req-dataset-button'
                                    onClick={() => onClickRequest(dataset)}
                                    disabled={requestingStatus[dataset.dataset_name]} // Disable button while requesting
                                >
                                    {requestingStatus[dataset.dataset_name] ? 'Requesting...' : `Request : ${dataset.dataset_size * 10}🪙`}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No Datasets found.</p>
                )}

              </div>
            )}

            {activeTab === 'requests' && (
              <div className="dataset-history-container">

                       
              <div className="history-content">
                  <div className="dd-form-footer">
                      {requests.length > 0 ? (
                          <div>
                              {/* <h2 className="history-title">History for {datasetDetails.dataset_name} dataset</h2> */}
                              <div className="d-history-modal-body">
                                  {requests.map((request) => (
                                      <div key={request.model} className="model-request-item">
                                          <span className='model-req-text'><span className='label-left'>Dataset</span>: <span className='label-right'>{request.dataset_name}</span></span>
                                          <span className='model-req-text'><span className='label-left'> Owner</span>:<span className='label-right'>{request.dataset_org_name}</span></span>
                                          <span className='model-req-text'><span className='label-left'>Request Status</span>: <span className='label-right'>{request.status}</span></span>
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

      

          <Modal
            isOpen={isDatasetDetailsModalOpen}
            onRequestClose={closeDatasetDetailsModal}
            contentLabel="Dataset Details"
            className="modal-content dataset-details-modal"
            overlayClassName="modal-overlay"
          >
            {clickedDataset && (
              <div>
                <div className="modal-header">
                  <h2 className="modal-title">Details of {clickedDataset.dataset_name}</h2>
                  <button className="close-button" onClick={closeDatasetDetailsModal}>x</button>
                </div>
                <div className="m-modal-body">
                  <div className="md-form-group">
                    <LabelAndInput
                      name={'datasetCategory'}
                      label={'Dataset Category:'}
                      value={clickedDataset.dataset_category}
                      type={'text'}
                      handleChange={() => {}} // Not editable
                      isEditable={false}
                    />
                    <LabelAndInput
                      name={'datasetOwner'}
                      label={'Dataset Owner:'}
                      value={clickedDataset.org_name}
                      type={'text'}
                      handleChange={() => {}} // Not editable
                      isEditable={false}
                    />
                    <LabelAndInput
                      name={'datasetDesc'}
                      label={'Dataset Description:'}
                      value={clickedDataset.dataset_desc}
                      type={'text'}
                      handleChange={() => {}} // Not editable
                      isEditable={false}
                    />
                    <LabelAndInput
                      name={'datasetSize'}
                      label={'Dataset Size:'}
                      value={clickedDataset.dataset_size}
                      type={'text'}
                      handleChange={() => {}} // Not editable
                      isEditable={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}
    </>
  );
};

export default ModelDetails;
