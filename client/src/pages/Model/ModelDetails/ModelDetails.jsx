import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import API_UTIL from '../../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';
import AppBar from '../../../components/AppBar/AppBar';
import { Plus, Trash2, User, ScrollText, X, CheckCircle, AlertCircle, Linkedin, Mail, Globe, MapPin } from 'lucide-react';
import { RiGithubFill } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import LoadingSpinner from '../../../components/Loader/LoadingSpinner';

const ModelDetailsPage = styled.div`
  background-color: #121212;
  min-height: 100vh;
  color: #ffffff;
  font-family: 'Arial', sans-serif;
`;


const TabContent = styled(motion.div)`
  background-color: #2a2a2a;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 0 4px rgba(0, 255, 255, 0.5);
`;


const AuditStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: ${props => props.isAudited ? '#4CAF50' : '#FFC107'};
  margin-bottom: 0.75rem;

  svg {
    margin-right: 0.5rem;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  padding: 1rem;
  gap: 1rem;
  max-width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0.5rem;
  }
`;

const SidePanel = styled.div`
  flex: 0 0 300px;
  background-color: #1e1e1e;
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  background-color: #1e1e1e;
  border-radius: 1rem;
  padding: 1.5rem;
`;

const ModelTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: white;
  margin-bottom: 0.75rem;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  background-color: ${props => props.active ? '#2a2a2a' : 'transparent'};
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  margin: 0 0.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 0.25rem;

  &:hover {
    background-color: #2a2a2a;
  }
  &.active {
    background-color: #3a3a3a;
    box-shadow: 0 0 15px rgb(0, 255, 255, 0.5);
  }
`;

const DatasetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DatasetCard = styled(motion.div)`
  background-color: #3a3a3a;
  border-radius: 0.75rem;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
`;
const DatasetName = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #00ffff;
`;

const DatasetInfo = styled.p`
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: #ffffff;
`;

const RequestButton = styled.button`
  background: #2a2a2a;
  color: #ffffff;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  box-shadow: 0 0 3px rgba(0, 255, 255, 0.5);

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #4a4a4a;
    cursor: not-allowed;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StyledModal = styled(Modal)`
  background-color: #1e1e1e;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  margin: 2rem auto;
  outline: none;
  color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #00ffff;
`;

const CloseButton = styled(X)`
  cursor: pointer;
  color: #ffffff;
`;

const AuditButton = styled(RequestButton)`
  background: #3a3a3a;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UnityLogo = styled.img`
  width: 1rem;
  height: 1rem;
  margin-left: 0.5rem;
`;

const ModelDetails = () => {
  const { orgName, modelName } = useParams();
  const [modelDetails, setModelDetails] = useState({});
  const [activeTab, setActiveTab] = useState('datasets');
  const [datasets, setDatasets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isDatasetDetailsModalOpen, setIsDatasetDetailsModalOpen] = useState(false);
  const [clickedDataset, setClickedDataset] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [requestingStatus, setRequestingStatus] = useState({});
  const userPhoneNumber = localStorage.userPhoneNumber;

  useEffect(() => {
    fetchModelData();
    fetchUserDetails();
    fetchBalance();
  }, [orgName, modelName, userPhoneNumber]);

  const fetchModelData = async () => {
    try {
      const response = await API_UTIL.get(`/getModelDetails/${orgName}/${modelName}`);
      setModelDetails(response.data?.[0]);

      const dataSetResponse = await API_UTIL.get(`/getDatasets`);
      setDatasets(dataSetResponse.data);

      const requestsResponse = await API_UTIL.get(`/getDatasetRequestsbyModel/${modelName}-${orgName}`);
      setRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
      setUserDetails(response.data.data);
      setBalance(response.data.data.reward_points);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await API_UTIL.get(`/wallet-balance/${userPhoneNumber}`);
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const openDatasetDetailsModal = (dataset) => {
    setClickedDataset(dataset);
    setIsDatasetDetailsModalOpen(true);
  };

  const closeDatasetDetailsModal = () => {
    setIsDatasetDetailsModalOpen(false);
  };

  const deductCoins = async (coins) => {
    try {
      const payload = {
        amount: coins,
        senderMobileNumber: userPhoneNumber,
        recipientMobileNumber: "+919090401234"
      };
      const response = await API_UTIL.post('/transfer-chewy-coins', payload);
      return response;
    } catch (error) {
      console.error('Error deducting coins:', error);
      toast.error('Failed to deduct coins. Please try again.');
    }
  };

  const auditModel = async () => {
    try {
      setIsAuditing(true);
      await deductCoins('10000');
      const updatedModel = {
        ...modelDetails,
        is_audited: true
      };
      const response = await API_UTIL.post('/saveModelDetails', updatedModel);
      if (response.status === 200) {
        setModelDetails(updatedModel);
        toast.success('Model audited successfully');
      } else {
        throw Error("Error in auditing model");
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to audit model');
    } finally {
      setIsAuditing(false);
    }
  };

  const onClickRequest = async (dataset) => {
    try {
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

        const requestsResponse = await API_UTIL.get(`/getDatasetRequestsbyModel/${modelName}-${orgName}`);
        setRequests(requestsResponse.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send the request", { autoClose: 1500 });
    } finally {
      setRequestingStatus((prev) => ({ ...prev, [dataset.dataset_name]: false }));
    }
  };

  return (
    <ModelDetailsPage>
      <AppBar showCoins={true} />
      <ContentWrapper>
        <SidePanel>
          <ModelTitle>{modelDetails.model_name}</ModelTitle>
          <InfoItem>
            <TbCategory size={18}/>
            Category: {modelDetails.model_category}
          </InfoItem>
          <InfoItem>
            <RiGithubFill size={18} />
            {modelDetails.model_url}
          </InfoItem>
          <AuditStatus isAudited={modelDetails.is_audited}>
            {modelDetails.is_audited ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            Audit Status: {modelDetails.is_audited ? 'Audited' : 'Not Audited'}
          </AuditStatus>
          <InfoItem>
            Description: {modelDetails.model_desc}
          </InfoItem>
          {!modelDetails.is_audited && (
            <AuditButton onClick={auditModel} disabled={isAuditing}>
              {isAuditing ? 'Auditing...' : (
                <>
                  Audit now: 10000
                  <UnityLogo src='/unityLogo.png' alt='Coin' />
                </>
              )}
            </AuditButton>
          )}
        </SidePanel>
        <MainContent>
          <TabContainer>
            <Tab
              active={activeTab === 'datasets' ? 'active': ''}
              onClick={() => handleTabChange('datasets')}
            >
              Datasets
            </Tab>
            <Tab
              active={activeTab === 'requests'}
              onClick={() => handleTabChange('requests')}
            >
              Requests
            </Tab>
          </TabContainer>

          <AnimatePresence mode="wait">
            {activeTab === 'datasets' && (
              <TabContent
                key="datasets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3}}
              >
                {datasets.length > 0 ? (
                  <DatasetGrid>
                    {datasets.map((dataset) => (
                      <DatasetCard
                        key={dataset.dataset_name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDatasetDetailsModal(dataset)}
                      >
                        <DatasetName>{dataset.dataset_name}</DatasetName>
                        <DatasetInfo>Owner: {dataset.org_name}</DatasetInfo>
                        <DatasetInfo>Size: {dataset.dataset_size}</DatasetInfo>
                        <RequestButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onClickRequest(dataset);
                          }}
                          disabled={requestingStatus[dataset.dataset_name]}
                        >
                          {requestingStatus[dataset.dataset_name] ? 'Requesting...' : (
                            <>
                              Request: {dataset.dataset_size * 10}
                              <UnityLogo src='/unityLogo.png' alt='Coin' />
                            </>
                          )}
                        </RequestButton>
                      </DatasetCard>
                    ))}
                  </DatasetGrid>
                ) : (
                  <p>No datasets available at the moment.</p>
                )}
              </TabContent>
            )}

            {activeTab === 'requests' && (
              <TabContent
                key="requests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {requests.length > 0 ? (
                  <DatasetGrid>
                  {requests.map((request) => (
                    <DatasetCard key={request.dataset_name}>
                      <DatasetName>{request.dataset_name}</DatasetName>
                      <DatasetInfo>Owner: {request.dataset_org_name}</DatasetInfo>
                      <DatasetInfo>Status: {request.status}</DatasetInfo>
                    </DatasetCard>
                  ))}
                  </DatasetGrid>
                ) : (
                  <p>No requests made yet.</p>
                )}
              </TabContent>
            )}
          </AnimatePresence>
        </MainContent>
      </ContentWrapper>

      <StyledModal
        isOpen={isDatasetDetailsModalOpen}
        onRequestClose={closeDatasetDetailsModal}
        contentLabel="Dataset Details"
      >
        <ModalHeader>
          <ModalTitle>Details of {clickedDataset.dataset_name}</ModalTitle>
          <CloseButton onClick={closeDatasetDetailsModal} />
        </ModalHeader>
        {clickedDataset && (
          <ModalContent>
            <InfoItem>
              <TbCategory size={18} />
              Category: {clickedDataset.dataset_category}
            </InfoItem>
            <InfoItem>
              <User size={18} />
              Owner: {clickedDataset.org_name}
            </InfoItem>
            <InfoItem>
              <ScrollText size={18} />
              Description: {clickedDataset.dataset_desc}
            </InfoItem>
            <InfoItem>
              <CheckCircle size={18} />
              Size: {clickedDataset.dataset_size}
            </InfoItem>
          </ModalContent>
        )}
      </StyledModal>
    </ModelDetailsPage>
  );
};

export default ModelDetails;