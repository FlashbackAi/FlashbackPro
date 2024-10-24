import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import AppBar from '../../components/AppBar/AppBar';
import './Invite.css';
import styled, { createGlobalStyle } from 'styled-components';
import {  Calendar, Clock, MapPin} from 'lucide-react';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';




const GlobalStyle = createGlobalStyle`
  @media (max-width: 30em) { /* 480px */
    .invite-page-container {
      padding: 0.9375em; /* 15px */
    }

    .invite-page-container h1 {
      font-size: 1.25em; /* 20px */
    }

    .invite-page-container p {
      font-size: 0.875em; /* 14px */
    }
  }
`;

const PageWrapper = styled.div`
  background-color: #121212;
  min-height: 100vh;
  color: #ffffff;
`;

const ContentWrapper = styled.div`
  display: flex;
  padding: 1rem;
  gap: 1rem;
  overflow-y: auto;
  max-width: 100%;
  margin-bottom:6em;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0.5rem;
  }
`;

const SidePanel = styled.div`
  background-color: #1e1e1e;
  border-radius: 1rem;
  padding: 0.5rem;
  height: fit-content;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const EventImage = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const EventTitle = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #66d3ff, #9a6aff 38%, #ee75cb 71%, #fd4d77);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
 
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: white;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  font-size: 2rem;
  color: #beb8b8;
  margin-top:1em;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }
`;





const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopSection = styled.div`

 text-align:center
`

// Styled Components
const InvitePageContainer = styled.div`
  height:5em;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 1.25rem; /* 20px */
  background-color: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 0.625rem rgba(0, 0, 0, 0.1); /* 10px */
  font-family: 'Arial', sans-serif;
  z-index: 10; /* Ensure it's above other content */
  margin-left: 1em;
  margin-right: 1em;
  text-align: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const InviteHeading = styled.h1`
  font-size: 1.5em; /* 24px */
  font-weight: bold;
  color: white;
  margin-bottom: 1.25em; /* 20px */
  text-align: center;
`;

const InviteText = styled.span`
  font-size: 2em; /* 16px */
  color: white;
  margin-bottom: 1em; 
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.5em; /* 4px */
`;

const InviteButton = styled.button`
  width: 35%;
  padding: 0.625em; /* 10px */
  font-size: 1em; /* 14px */
  font-weight: bold;
  color: #fff;
  margin-top:1em;
  background-color: #b57156;
  border: none;
  border-radius: 0.25em; /* 4px */
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;

  &:hover {
    background-color: #9f5b47;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: #d3d3d3;
    cursor: not-allowed;
  }
`;


const AttendeesInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 1em;
`;

const AttendeesButton = styled.button`
  background-color: #b57156;
  color: white;
  border: none;
  font-size: 1.5em;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 0.25em;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #9f5b47;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: #d3d3d3;
    cursor: not-allowed;
  }
`;

const AttendeesInput = styled.input`
  width: 100%;
  padding: 0.625em;
  font-size: 1em;
  text-align: center;
  border-radius: 0.25em;
  border: 1px solid #ccc;
  margin: 0 0.5em; /* Add margin to make space for buttons */
`;



const Label = styled.label`
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;


const Input = styled.input`
  background-color: #ffffff;
  border: 1px solid #3a3a3a;
  color: #000000;
  padding: 0.5rem;
  border-radius: 4px;
`;

const StyledModal = styled(Modal)`
  &.modal-content {
    background-color: transparent;
    border: none;
    padding: 0;
    max-width: 100%;
    width: auto;
    margin: 0;
    outline: none;
  }
`;

  const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 1.25rem;
  max-width: 31.25rem;
  width: 90%;
  color: #ffffff;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1rem;
  transition: color 0.3s ease;

  &:hover {
    color: #00ffff;
  }
`;


const Invite = ({ eventId: propEventId }) => {
  const { eventId: paramEventId } = useParams();
  const eventId = propEventId || paramEventId; // Use the prop if provided, otherwise fallback to the URL parameter.

  const [event, setEvent] = useState(null);
  const navigate = useNavigate();
  const userPhoneNumber = localStorage?.userPhoneNumber;
  const [response, setResponse] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [showUserName, setShowUserName] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const [userName, setUserName] = useState('');
  const [clientObj,setClientObj] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isAttendaceModalOpen,setIsAttendaceModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
 
  useEffect(() => {
    const fetchClientDetails = async (event) => {
  
      try {
        const response = await API_UTIL.get(`/getClientDetailsByEventId/${event.event_id}`);
        if (response.status === 200) {
          setClientObj(response.data);
        } else {
          throw new Error("Failed to fetch client Details");
        }
      } catch (error) {
        console.error("Error fetching user thumbnails:", error);
        setIsLoading(false);
      } 
    };
    const fetchEventData = async () => {
      try {
        const response = await API_UTIL.get(`/getEventDetails/${eventId}`);
        if(response.status ===200){
          setEvent(response.data);
          fetchClientDetails(response.data);
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error('Failed to fetch event details.');
        setIsLoading(false);
      }
    };
 
    fetchEventData();
  }, [eventId]);

  useEffect(() =>{
    if(event){
      const fetchInvitationDetails = async () => {
  
        setIsLoading(true);
        try {
          const response = await API_UTIL.get(`/getInvitationDetails/${eventId}/${userPhoneNumber}`);
          if (response.status === 200 && (response.data?.invitation_status ==="yes" || response.data?.invitation_status ==="maybe")) {
                navigate(`/photosV1/${event.folder_name}/${userDetails.user_id}`)          
          } 
          else{
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user invitation:", error);
          setIsLoading(false);
        } 
      };
      const fetchUserDetails = async () => {
        try {
          
          const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
          
          if(response.status === 200){
            setUserDetails(response.data.data);
            fetchInvitationDetails();
            if(response.data.data.user_name === userPhoneNumber){
              setShowUserName(true);
            }
            else{
              setUserName(response.data.data.user_name);
            }
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          setIsLoading(false);
        }
        finally{
          setIsLoading(false)
        }
      };
      fetchUserDetails();
    }

  },[event])

  



  const handleResponse = async (userResponse) => {
    setResponse(userResponse);
    if(userResponse === "no"){
      try {
        const apiResponse = await API_UTIL.post('/saveInvitationDetails', {
          event_id: event.event_id,
          user_phone_number: userPhoneNumber,
          invitation_status: userResponse,
          user_name: userName
        });
  
        if (apiResponse.status === 200) {
          setResponse(userResponse);
      
        }
  
      } catch (error) {
        console.error('Error confirming event attendance:', error);
        toast.error('Failed to confirm attendance. Please try again.');
      }
        navigate('/dashboard');
    }
    else{
      setIsAttendaceModalOpen(true);
    }

  
  };

  const confirmAttendance = async () => {
    setIsConfirming(true)
    try {
      const apiResponse = await API_UTIL.post('/mapUserToEvent', {
        event_id: event.folder_name,
        user_phone_number: userPhoneNumber,
        
      });

      if (apiResponse.status === 200) {
        await API_UTIL.post('/saveInvitationDetails', {
          event_id: event.event_id,
          user_phone_number: userPhoneNumber,
          attendees_count: attendees,
          invitation_status:response,
          user_name:userName,
          responded_date:Date.now()

        });
        if(showUserName){
          await API_UTIL.post('/updatePortfolioDetails', {
            user_phone_number: userPhoneNumber,
            user_name: userName,
          });
        }
       
        await API_UTIL.post('/sendRegistrationMessage',{
          user_phone_number:userPhoneNumber,
          eventId:event.event_id,
          orgName:clientObj.org_name,
          portfolioLink:`/portfolio/${clientObj.user_name}`
        })
        toast.success('Event attendance confirmed.');
  
        toast.success('Event attendance confirmed.');
        navigate(`/photosV1/${event.folder_name}/${userDetails.user_id}`) ;
      }
    } catch (error) {
      console.error('Error confirming event attendance:', error);
      toast.error('Failed to confirm attendance. Please try again.');
    }finally {
      setIsConfirming(false); // Set confirming state back to false
    }
  };
  const formatEventName = (name) => {
    if (!name) return '';
    let event = name.replace(/_/g, ' ');
    return event.trim();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
    {isLoading ? (
      <LoadingSpinner/>
    ) : (
    <PageWrapper>
      
      <GlobalStyle />
      <AppBar showCoins={true} />
      <ContentWrapper>
        <SidePanel>
          <EventImage>
            <img src={event.event_image} alt="Event" />
          </EventImage>
          
        </SidePanel>
        <MainContent>
          <TopSection>
          <EventTitle>{formatEventName(event?.event_name)}</EventTitle>
            <EventInfo>
              <InfoHeader>WHEN</InfoHeader>
              <InfoItem>
                <Calendar size={18} />
                {event.event_date && !isNaN(Date.parse(event.event_date)) 
                  ? new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    }) 
                  : 'Date not set'}
              </InfoItem>
              <InfoItem>
                <Clock size={18} />
                {event.event_date && !isNaN(new Date(event.event_date).getTime()) 
                ? new Date(event.event_date).toLocaleTimeString() 
                : 'Time not set'}

              </InfoItem>
              <InfoHeader>WHERE</InfoHeader>
              <InfoItem>
                <MapPin size={18} />
                {event.event_location || 'Location not set'}
              </InfoItem>
            </EventInfo>
          </TopSection>
        </MainContent>
      </ContentWrapper>
      <InvitePageContainer>
            <InviteText>Are you attending the event ?</InviteText>
            {showUserName &&(
              <>
            <Label>Enter your user name : </Label>
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </> 
              )}
            <ButtonContainer>
              <InviteButton onClick={() => handleResponse('yes')}>Yes</InviteButton>
              <InviteButton onClick={() => handleResponse('no')}>No</InviteButton>
              <InviteButton onClick={() => handleResponse('maybe')}>May Be</InviteButton>
            </ButtonContainer>
             
      </InvitePageContainer>

      <StyledModal
        isOpen={isAttendaceModalOpen}
        onRequestClose={() => setIsAttendaceModalOpen(false)}
        contentLabel="Send Photos"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <ModalOverlay>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CloseButton onClick={() => setIsAttendaceModalOpen(false)}><X size={24} /></CloseButton>
                <InviteText>How many are you attending with?</InviteText>
                <AttendeesInputContainer>
                  <AttendeesButton onClick={() => setAttendees(Math.max(0, attendees - 1))} disabled={attendees <= 0}>
                    -
                  </AttendeesButton>
                  <AttendeesInput
                    type="number"
                    value={attendees}
                    min="1"
                    onChange={(e) => setAttendees(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <AttendeesButton onClick={() => setAttendees(attendees + 1)}>
                    +
                  </AttendeesButton>
                </AttendeesInputContainer>
                <InviteButton onClick={confirmAttendance} disabled={isConfirming}>
                  {isConfirming ? 'Confirming...' : 'Confirm Attendance'}
                </InviteButton>
          </ModalContent>
        </ModalOverlay>
      </StyledModal>
    </PageWrapper>
    )}
    </>
  );
};

export default Invite;
