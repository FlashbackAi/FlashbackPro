import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import AppBar from '../../components/AppBar/AppBar';
import './Collab.css';


const Collab = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userName, setUserName] = useState('');
  const [isUserNameExists, setIsUserNameExists] = useState(false);
  const navigate = useNavigate();
  const userPhoneNumber =localStorage?.userPhoneNumber;

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await API_UTIL.get(`/getEventDetails/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error('Failed to fetch event details.');
      }
    };

    const fetchUserDetails = async () => {
      try {
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
      navigate('/dashboard');
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

  if (!event) return <div>Loading...</div>;

  return (
    <>
    <AppBar/>
    <div className="collab-page-container">
      <h1>Collaboration Invitation</h1>
      <p>You have been invited to collaborate on the event: {event.event_name}</p>

      {!isUserNameExists && (
        <div className="form-group">
          <label htmlFor="userName">User Name:</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your user name"
            required
          />
        </div>
      )}

      <div>
        <button onClick={() => updateCollabStatus('Accept')}>Accept</button>
        <button onClick={() => updateCollabStatus('Reject')}>Reject</button>
      </div>
    </div>
    {/* <footer/> */}
    </>
  );
};

export default Collab;
