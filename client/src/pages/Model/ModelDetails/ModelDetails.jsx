import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import API_UTIL from '../../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';
import AppBar from '../../../components/AppBar/AppBar';
import { Plus, Trash2, User, ScrollText, X, CheckCircle, AlertCircle, ChevronUp, ChevronDown, Globe, MapPin } from 'lucide-react';
import { RiGithubFill } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import LoadingSpinner from '../../../components/Loader/LoadingSpinner';
import OrganizationForm from '../ModelForm/OrgForm';
import { Range, getTrackBackground } from 'react-range';

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

const Button = styled.button`
  background: #2a2a2a;
  color: #ffffff;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  margin-right:2rem;
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

const HeadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 1rem 0;

`;

const Heading = styled.h2`
  color: #00ffff;
  font-size: 1.5rem;
`;
const Organization = styled.div`
  border-bottom: 1px solid #ccc;
`

const ToggleIcon = styled.span`
  font-size: 1rem;
  color: #ffffff;
`;
const OrgBidSection = styled.div`
display:flex;
`

const SliderContainer = styled.div`
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AmountDisplay = styled.div`
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 1rem;
`;
const ConfirmButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 1.5rem; /* Optional: Add margin if needed */
`
const ConfirmButton = styled.button`
 background: #2a2a2a;
  color: White;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 0.3s;
   &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #4a4a4a;
    cursor: not-allowed;
  }
`;

const SliderTrack = styled.div`
  width: 100%;
  height: 8px;
  background: ${(props) =>
    getTrackBackground({
      values: props.values,
      colors: ['#00ffff', '#3a3a3a'],
      min: props.min,
      max: props.max,
    })};
  border-radius: 4px;
  position: relative;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem;
`;

const Tag = styled.span`
  background-color: #646566;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAutoBidModalOpen, setIsAutoBidModalOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState([50000]);
  const navigate = useNavigate();

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
  const openAutoBidModal= (dataset) => {
    setIsAutoBidModalOpen(true);
  };

  const closeDatasetDetailsModal = () => {
    setIsDatasetDetailsModalOpen(false);
  };
  const closeAutoBidModal = () => {
    setIsAutoBidModalOpen(false);
  };



 const deductAuditCoins = async (coins) => {
  try {
    setIsRequesting(true);
    const payload = {
      amount: coins,
      senderMobileNumber: userPhoneNumber,
      recipientMobileNumber: "+919090401234"
    };
    const response = await API_UTIL.post('/transfer-chewy-coins', payload);
    if(response.status === 200){
      await API_UTIL.post('/transfer-chewy-coins', {
       amount: coins/5,
       senderMobileNumber: "+919090401234",
       recipientMobileNumber: userPhoneNumber
     });
      await API_UTIL.post('/transfer-chewy-coins',  {
       amount: coins/10,
       senderMobileNumber: "+919090401234",
       recipientMobileNumber: "+918978073062"
     });
     await API_UTIL.post('/transfer-chewy-coins',  {
       amount: coins/10,
       senderMobileNumber: "+919090401234",
       recipientMobileNumber: "+918871713331"
     });
   }
    
    return response;
  } catch (error) {
    console.error('Error deducting coins:', error);
    toast.error('Failed to deduct coins. Please try again.');
  }
  finally{
    closeAutoBidModal(true);
    setIsRequesting(false);
  }
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
    finally{
      closeAutoBidModal(true);
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
              <>
              <Organization>
                <HeadingContainer onClick={() => setIsCollapsed(!isCollapsed)}>
                  <Heading>Flashback.Inc</Heading>
                  <ToggleIcon>{isCollapsed ? <ChevronDown/> : <ChevronUp/>}</ToggleIcon>
                </HeadingContainer>
                <OrgBidSection>
                  <Button onClick={()=>navigate('/dataOrgProfile')}>Org Details</Button>
                  <Button onClick={openAutoBidModal}>Auto Bid <UnityLogo src='/unityLogo.png' alt='Coin' /></Button>
                  <Button>Match : 96.3%</Button>
                </OrgBidSection>
              </Organization>

             
            {!isCollapsed && (
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
                        <DatasetInfo>Owner: {dataset.dataset_name.split('-')[1]}</DatasetInfo>
                        <DatasetInfo>Match: {dataset.quality_index}%</DatasetInfo>
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

                <Organization>
                <HeadingContainer onClick={() => setIsCollapsed(!isCollapsed)}>
                  <Heading>Image Shield</Heading>
                  <ToggleIcon>{isCollapsed ? <ChevronDown/> : <ChevronUp/>}</ToggleIcon>
                </HeadingContainer>
                </Organization>

                <Organization>
                <HeadingContainer onClick={() => setIsCollapsed(!isCollapsed)}>
                  <Heading>Humane</Heading>
                  <ToggleIcon>{isCollapsed ? <ChevronDown/> : <ChevronUp/>}</ToggleIcon>
                </HeadingContainer>
                </Organization>
              </>
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
              Owner: {clickedDataset.dataset_name.split('-')[1]}
            </InfoItem>
            <InfoItem>
              <ScrollText size={18} />
              Description: {clickedDataset.dataset_desc}
            </InfoItem>
            <InfoItem>
              <CheckCircle size={18} />
              Size: {clickedDataset.dataset_size}
            </InfoItem>
            <TagsContainer>
              <Tag>People</Tag>
              <Tag>Objects</Tag>
              <Tag>Accesories</Tag>
              <Tag>Clothing</Tag>
              <Tag>Wedding</Tag>
              <Tag>Events</Tag>
            </TagsContainer>
          </ModalContent>
        )}
      </StyledModal>

      <StyledModal
        isOpen={isAutoBidModalOpen}
        onRequestClose={closeAutoBidModal}
        contentLabel="Auto Bid"
      >
        <ModalHeader>
        <ModalTitle>Select the Number of Images to Train Your Model</ModalTitle>
          <CloseButton onClick={closeAutoBidModal} />
        </ModalHeader>
        <SliderContainer>
        <AmountDisplay>Images: {bidAmount[0].toLocaleString()}</AmountDisplay>
        <Range
          values={bidAmount}
          step={10}
          min={1000}
          max={100000}
          onChange={(values) => setBidAmount(values)}
          renderTrack={({ props, children }) => (
            <SliderTrack {...props} min={1000} max={100000} values={bidAmount}>
              {children}
            </SliderTrack>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '20px',
                width: '20px',
                borderRadius: '50%',
                backgroundColor: '#00ffff',
              }}
            />
          )}
        />
      </SliderContainer>
      <ConfirmButtonContainer>
        <ConfirmButton onClick={() => deductAuditCoins(bidAmount * 15)}  disabled={(bidAmount * 15)>balance}>
        {isRequesting ? (
          'Requesting...'
        ) : (
          <>
            {`Request: ${bidAmount * 15}`} <UnityLogo src='/unityLogo.png' alt='Coin' />
          </>
        )}
        </ConfirmButton>
      </ConfirmButtonContainer>
      </StyledModal>
    </ModelDetailsPage>
  );
};

export default ModelDetails;