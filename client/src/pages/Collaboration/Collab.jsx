import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';

const Collab = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userName, setUserName] = useState('');
  const [isUserNameEditable, setIsUserNameEditable] = useState(false);
  const navigate = useNavigate();

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
        const userPhoneNumber = sessionStorage.getItem('userphoneNumber');
        const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
        setUserDetails(response.data.data);

        // Check if the user_name equals user_phone_number
        if (response.data.data.user_name === userPhoneNumber) {
          setIsUserNameEditable(true); // Allow user to edit the user_name
        }
        setUserName(response.data.data.user_name);
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to fetch user details.');
      }
    };

    fetchUserDetails();
    fetchEventData();
  }, [eventId]);

  const handleAccept = async () => {
    try {
      if (isUserNameEditable && !userName) {
        toast.error('Please enter a valid user name.');
        return;
      }

      // Update user details before accepting the collaboration
      await updateUserDetails();

      // Accept the collaboration
      await API_UTIL.put(`/acceptCollab/${eventId}`, { userName, status: 'accept' });

      toast.success('Collaboration accepted successfully');
      navigate('/event');
    } catch (error) {
      console.error('Error accepting collaboration:', error);
      toast.error('Failed to accept collaboration. Please try again.');
    }
  };

  const updateUserDetails = async () => {
    try {
      const userPhoneNumber = sessionStorage.getItem('userphoneNumber');
      const org_name = userName; // Assume that userName is equivalent to org_name

      await API_UTIL.post('/updatePortfolioDetails', {
        user_phone_number: userPhoneNumber,
        org_name: org_name,
        social_media: userDetails.social_media, // Retain the existing social media details
      });

      toast.success('User details updated successfully');
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error('Failed to update user details.');
    }
  };

  const handleReject = async () => {
    try {
      await API_UTIL.put(`/acceptCollab/${eventId}`, { userName, status: 'reject' });
      toast.success('Collaboration rejected successfully');
      navigate('/event');
    } catch (error) {
      console.error('Error rejecting collaboration:', error);
      toast.error('Failed to reject collaboration. Please try again.');
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="collab-page-container">
      <h1>Collaboration Invitation</h1>
      <p>You have been invited to collaborate on the event: {event.event_name}</p>

      {isUserNameEditable && (
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
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleReject}>Reject</button>
      </div>
    </div>
  );
};

export default Collab;
