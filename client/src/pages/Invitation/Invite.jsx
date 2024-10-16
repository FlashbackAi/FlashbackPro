import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import AppBar from '../../components/AppBar/AppBar';
import './Invite.css';
import styled, { createGlobalStyle } from 'styled-components';
import {  Calendar, Clock, MapPin} from 'lucide-react';
import Portfolio from '../Portfolio/Portfolio/Portfolio';



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

const EventImage = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const EventTitle = styled.h1`
  font-size: 1.5rem;
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
  font-size: 0.9rem;
  color: white;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }
`;





const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

// Styled Components
const InvitePageContainer = styled.div`
  max-width: 37.5em; /* 600px */
  margin: 3.125em auto; /* 50px */
  padding: 1.25em; /* 20px */
  border-radius: 0.5em; /* 8px */
  box-shadow: 0 0 0.625em rgba(0, 0, 0, 0.1); /* 10px */
  font-family: 'Arial', sans-serif;
`;

const InviteHeading = styled.h1`
  font-size: 1.5em; /* 24px */
  font-weight: bold;
  color: white;
  margin-bottom: 1.25em; /* 20px */
  text-align: center;
`;

const InviteText = styled.p`
  font-size: 1em; /* 16px */
  color: white;
  margin-bottom: 1.875em; /* 30px */
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.25em; /* 4px */
`;

const InviteButton = styled.button`
  width: 48%;
  padding: 0.625em; /* 10px */
  font-size: 0.875em; /* 14px */
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

const AttendeesInput = styled.input`
  width: 100%;
  padding: 0.625em;
  margin-top: 1em;
  font-size: 1em;
  border-radius: 0.25em;
  border: 1px solid #ccc;
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
      }
    };
    const fetchInvitationDetails = async () => {
  
      try {
        const response = await API_UTIL.get(`/getInvitationDetails/${eventId}/${userPhoneNumber}`);
        if (response.status === 200 && response.data?.invitation_status!=="no") {
              navigate(`/photosV1/${event.folder_name}/${userDetails.user_id}`)          
        } 
      } catch (error) {
        console.error("Error fetching user invitation:", error);
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
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchEventData();
    fetchUserDetails();
  }, [event, eventId, navigate, userDetails, userPhoneNumber]);



  const handleResponse = async (userResponse) => {
    setResponse(userResponse);

    try {
      const apiResponse = await API_UTIL.post('/saveInvitationDetails', {
        event_id: event.event_id,
        user_phone_number: userPhoneNumber,
        invitation_status: userResponse,
      });

      if (apiResponse.status === 200) {
        setResponse(userResponse);
        if(userName){
          await API_UTIL.post('/updatePortfolioDetails', {
            user_phone_number: userPhoneNumber,
            user_name: userName,
          });
        }
       
        // await API_UTIL.post('/sendRegistrationMessage',{
        //   user_phone_number:userPhoneNumber,
        //   eventName:event.event_name,
        //   orgName:clientObj.org_name,
        //   portfolioLink:`https://flashback.wtf/portfolio/${clientObj.user_name}`
        // })
        toast.success('Event attendance confirmed.');
      }

    } catch (error) {
      console.error('Error confirming event attendance:', error);
      toast.error('Failed to confirm attendance. Please try again.');
    }
    if (userResponse === 'no') {
      navigate('/dashboard');
    }
  };

  const confirmAttendance = async () => {
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
        });
  
        toast.success('Event attendance confirmed.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error confirming event attendance:', error);
      toast.error('Failed to confirm attendance. Please try again.');
    }
  };
  const formatEventName = (name) => {
    if (!name) return '';
    let event = name.replace(/_/g, ' ');
    return event.trim();
  };

  if (!event) return <div>Loading...</div>;

  return (
    <PageWrapper>
      <GlobalStyle />
      <AppBar showCoins={true} />
      <ContentWrapper>
        <SidePanel>
          <EventImage>
            <img src={event.event_image} alt="Event" />
          </EventImage>
          <EventTitle>{formatEventName(event?.event_name)}</EventTitle>
          <EventInfo>
            <InfoItem>
              <Calendar size={18} />
              {event.event_date && !isNaN(Date.parse(event.event_date)) 
                ? new Date(event.event_date).toLocaleDateString() 
                : 'Date not set'}
            </InfoItem>
            <InfoItem>
              <Clock size={18} />
              {event.event_date && !isNaN(new Date(event.event_date).getTime()) 
              ? new Date(event.event_date).toLocaleTimeString() 
              : 'Time not set'}

            </InfoItem>
            <InfoItem>
              <MapPin size={18} />
              {event.event_location || 'Location not set'}
            </InfoItem>
          </EventInfo>

        </SidePanel>
        <MainContent>
        <InvitePageContainer>
            <InviteHeading>Event Invitation</InviteHeading>
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
            {(response === 'yes' || response === 'maybe') && (
              <>
                <InviteText>How many are you attending with?</InviteText>
                <AttendeesInput
                  type="number"
                  value={attendees}
                  min="1"
                  onChange={(e) => setAttendees(e.target.value)}
                />
                <InviteButton onClick={confirmAttendance}>
                  Confirm Attendance
                </InviteButton>
              </>
            )}
          </InvitePageContainer>
        </MainContent>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default Invite;
