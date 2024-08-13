// import React, { useEffect, useState } from 'react';
// import Login from "../Auth/Login/Login.js";
// import { useParams } from 'react-router';
// import API_UTIL from '../../services/AuthIntereptor.js';

// export const LoginEvent = () => {
//     const { eventName } = useParams();
//     const clientName = "DummyClient";
//     const [error, setError] = useState(null);
//     const [eventData, setEventData] = useState([]);
//     const [matchingEvent, setMatchingEvent] = useState(null);

//     useEffect(() => {
//         const fetchEventData = async () => {
//             try {
//                 const response = await API_UTIL.get(`/getClientEventDetails/${clientName}`);
//                 console.log(response.data);
//                 setEventData(response.data);
//                 const event = response.data.find(event => event.event_name === eventName);
//                 setMatchingEvent(event);
//             } catch (error) {
//                 setError(error.message);
//             }
//         };

//         fetchEventData();
//     }, [clientName, eventName]);

//     if (error) return <div className="loading-screen">Error: {error}</div>;

//     return (
//         <div>
//             <Login />
//             <div>
//                 {matchingEvent && (
//                     <div>
//                         <img src={matchingEvent.event_image} alt={matchingEvent.event_name} />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default LoginEvent;

import React, { useEffect, useState } from 'react';
import Login from "../Auth/Login/Login.js";
import { useParams, useNavigate } from 'react-router';
import API_UTIL from '../../services/AuthIntereptor.js';
import Header from '../../components/Header/Header.js';
import "./LoginEvent.css"
import { eventHandlers } from 'jsx-ast-utils';

export const LoginEvent = () => {
    const { eventName } = useParams();
    const navigate = useNavigate();
    // const [error, setError] = useState(null);
    // const [eventData, setEventData] = useState([]);
    // const [matchingEvent, setMatchingEvent] = useState(null);
    const [userPhoneNumber, setUserPhoneNumber] = useState(null);
    const [loading,setLoading] = useState(true);
    const [attendees, setAttendees] = useState(1); // Default to 1 attendee
    const [userDetails, setUserDetails] = useState();

    useEffect(() => {
        const phoneNumber = sessionStorage.getItem('userphoneNumber');
        if (phoneNumber) {
            setUserPhoneNumber(phoneNumber);
            fetchUserDetails(phoneNumber)
            setLoading(false)
        } else {
            setLoading(false);
        }

    }, []);

    // useEffect(() => {
    //     const fetchEventData = async () => {
    //         try {
    //             const response = await API_UTIL.get(`/getClientEventDetails/${eventName}`);
    //             setEventData(response.data);
    //             const event = response.data.find(event => event.event_name === eventName);
    //             setMatchingEvent(event);
    //         } catch (error) {
    //             setError(error.message);
    //         }
    //     };

    //     fetchEventData();
    // });

    //if (error) return <div className="loading-screen">Error: {error}</div>;

    const fetchUserDetails = async (phoneNumber) => {
        try {
          const response = await API_UTIL.get(`/fetchUserDetails/${phoneNumber}`);
          setUserDetails(response.data);
            console.log(response.data);
            setLoading(false);
        } catch (error) {
          console.error('Error fetching user details:', error);
          setLoading(false);
        }
      };

    const handleAttendeesChange = (e) => {
        setAttendees(e.target.value);
    };

    // const formatEventName = (name) => {
    //     let event = name.replace(/_/g, ' ');
    //     console.log(userDetails?.data.user_name)
    //     event.replace(userDetails?.data.user_name, '');
    //     console.log(event)
    //     return event;
    // }

    const formatEventName = (name) => {
        if (userDetails && userDetails.data.user_name) {
            let event = name.replace(/_/g, ' ');
            event = event.replace(userDetails.data.user_name, '');
            return event;
        }
        return name.replace(/_/g, ' ');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log(`Number of attendees: ${attendees}`);
    };

    if(loading){
        return <div className='loading-screen'>Loading....</div>
    }

    if (!userPhoneNumber && eventName) {
        return (
            <Login
                name = {eventName}
                onLoginSuccess={(phoneNumber) => {
                    sessionStorage.setItem('userphoneNumber', phoneNumber);
                    setUserPhoneNumber(phoneNumber);
                    navigate(`/login/${eventName}/rsvp`);
                }}
            />
        );
    }

    // if (!userPhoneNumber) {
    //     return (
    //     <Login />)
    // }

    // After successful login, show the form
    if(eventName && userPhoneNumber){
    return (
        <div>
            {/* {matchingEvent && (
                <div>
                    <img src={matchingEvent.event_image} alt={matchingEvent.event_name} />
                </div>
            )} */}
            {/* <Header /> */}
            <form className="rsvp-form" onSubmit={handleFormSubmit}>
                <div className='rsvp-heading'>You are Invited to {formatEventName(eventName)} </div>
                <div className='rsvp-container'>
                <label htmlFor="attendees" className='label-name'>Please Enter Number of Attendees:</label>
                <input
                    type="number"
                    id="attendees"
                    name="attendees"
                    value={attendees}
                    onChange={handleAttendeesChange}
                    min="1"
                    className='rsvp-input'
                    required
                />
                <button type="submit" className='rsvp-button'>Submit</button>
                </div>
            </form>
        </div>
    );
}
// If no eventName, just render the login component
return <Login />;
};



export default LoginEvent;
