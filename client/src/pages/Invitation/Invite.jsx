import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import AppBar from '../../components/AppBar/AppBar';
import './Invite.css';

const Invite = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();
  const userPhoneNumber = localStorage?.userPhoneNumber;

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

    fetchEventData();
  }, [eventId]);

  const handleResponse = async (response) => {
    if (response === 'no') {
      navigate('/event');
    } else {
      try {
        // Call the API to map the user to the event
        const apiResponse = await API_UTIL.post('/mapUserToEvent', {
          event_id: event.folder_name,
          user_phone_number: userPhoneNumber
        });

        if (apiResponse.status === 200) {
          toast.success('Event attendance confirmed.');
          navigate('/event');
        }
      } catch (error) {
        console.error('Error confirming event attendance:', error);
        toast.error('Failed to confirm attendance. Please try again.');
      }
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <>
      <AppBar />
      <div className="invite-page-container">
        <h1>Event Invitation</h1>
        <p>Are you attending the event: {event.event_name}?</p>

        <div>
          <button onClick={() => handleResponse('yes')}>Yes</button>
          <button onClick={() => handleResponse('no')}>No</button>
        </div>
      </div>
    </>
  );
};

export default Invite;
