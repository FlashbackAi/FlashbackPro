import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import AppBar from '../../components/AppBar/AppBar';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import styled, { createGlobalStyle } from 'styled-components';

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

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopSection = styled.div`

 text-align:center
`

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
  display:flex;
  justify-content: center;
  align-items: center;

  img {
    width: 80%;
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
const CollabPageHeader = styled.h1`
  font-size:2em;
  text-align:center
`

const CollabPageContainer = styled.div`

  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 1rem; /* 20px */
   background-color: rgba(0, 0, 0, 0.5);
  // box-shadow: 0 0 0.625rem rgba(0, 0, 0, 0.1); /* 10px */
  // font-family: 'Arial', sans-serif;
   z-index: 10; /* Ensure it's above other content */
  // margin-left: 1em;
  margin-bottom: 0.5em;
  text-align: center;
  display:flex;
  flex-direction:column;

  @media (max-width: 768px) {
    padding: 1rem;
     background-color: rgba(0, 0, 0, 0.5);
      position: fixed;
  }
`;
const CollabText = styled.span`
  font-size: 2em; /* 16px */
  color: white;
  margin-bottom: .3em; 
  text-align: center;
  @media (max-width: 768px) {
    font-size: 1em;
  }

`;
const Label = styled.label`
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size:1em;
  
`;


const Input = styled.input`
  background-color: #ffffff;
  border: 1px solid #3a3a3a;
  color: #000000;
  padding: 0.5rem;
  border-radius: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content:space-around;
`;

const InviteButton = styled.button`
  width:30%;
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
    @media (max-width: 768px) {
    width:8em;
  }
    
`;
const ConfirmButton = styled.button`
  width: 25%;
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
    @media (max-width: 768px) {
    width:8em;
  }
`;

const Collab = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userName, setUserName] = useState('');
  const [isUserNameExists, setIsUserNameExists] = useState(false);
  const navigate = useNavigate();
  const userPhoneNumber =localStorage?.userPhoneNumber;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const response = await API_UTIL.get(`/getEventDetails/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error('Failed to fetch event details.');
      }finally{
        setIsLoading(false);
      }
    };

    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
        setUserDetails(response.data.data);

        // Check if the user_name equals user_phone_number
        if (response.data.data.user_name !== userPhoneNumber) {
          setIsUserNameExists(true); // User name already exists
        }
        setUserName(response.data.data.user_name);
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to fetch user details.');
      }finally{
        setIsLoading(false);
      }
    };

    fetchUserDetails();
    fetchEventData();
  }, [eventId, userPhoneNumber]);

  const updateCollabStatus = async (status) => {
    try {
      if ((!isUserNameExists && !userName) || userName === userPhoneNumber) {
        toast.error('Please enter a valid user name.');
        return;
      }

      // Update user details before accepting the collaboration
      let user_name = userName;
      if (!isUserNameExists) {
         const response = await updateUserDetails();
         user_name = response.data.data.user_name
      }

      // Accept or reject the collaboration
      const apiResponse = await API_UTIL.post('/mapUserToEvent', {
        event_id: event.folder_name,
        user_phone_number: userPhoneNumber
      });

      if (apiResponse.status === 200) {
      await API_UTIL.put(`/acceptCollab/${eventId}`, { userName:user_name, status });

      toast.success(`Collaboration ${status.toLowerCase()}ed successfully`);
      if(status === 'Accept')
      navigate(`/eventDetails/${event.event_id}`);
      else
      navigate('/dashboard')
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing collaboration:`, error);
      toast.error(`Failed to ${status.toLowerCase()} collaboration. Please try again.`);
    }
  };

  const updateUserDetails = async () => {
    try {

      const response = await API_UTIL.post('/updatePortfolioDetails', {
        user_phone_number: userPhoneNumber,
        user_name: userName,
        social_media: userDetails.social_media,
        role:'creator' // Retain the existing social media details
      });

      // toast.success('User details updated successfully');
      return response;
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error('Failed to update user details.');
    }
  };
  const formatEventName = (name) => {
    if (!name) return '';
    let event = name.replace(/_/g, ' ');
    return event.trim();
  };

  if (!event) return <div>Loading...</div>;

  return (
    <>
    {isLoading ? (
      <LoadingSpinner/>
    ) : (
    <PageWrapper>
      
      <GlobalStyle />
      <AppBar showCoins={true} />
      <ContentWrapper>
        <MainContent>
          <CollabPageHeader>Collaboration Invitation</CollabPageHeader>
          <EventImage>
            <img src={event.event_image} alt="Event" />
          </EventImage>
        </MainContent>
      </ContentWrapper>
      <CollabPageContainer>
            <CollabText>{formatEventName(event?.event_name)}</CollabText>
            {!isUserNameExists &&(
              <div>
            <Label>Enter your user name : </Label>
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div> 
              )}
            <ButtonContainer>
              <InviteButton onClick={() => updateCollabStatus('Accept')}>Accept</InviteButton>
              <InviteButton onClick={() => updateCollabStatus('Reject')}>Reject</InviteButton>
            </ButtonContainer>
             
      </CollabPageContainer>
    </PageWrapper>
    )}
    </>
  );
};

export default Collab;
