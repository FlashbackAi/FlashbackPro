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

export const LoginEvent = () => {
    const { eventName } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [eventData, setEventData] = useState([]);
    const [matchingEvent, setMatchingEvent] = useState(null);
    const [userPhoneNumber, setUserPhoneNumber] = useState(null);
    const [attendees, setAttendees] = useState(1); // Default to 1 attendee

    useEffect(() => {
        const phoneNumber = sessionStorage.getItem('userphoneNumber');
        if (phoneNumber) {
            setUserPhoneNumber(phoneNumber);
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

    if (error) return <div className="loading-screen">Error: {error}</div>;

    const handleAttendeesChange = (e) => {
        setAttendees(e.target.value);
    };

    const formatEventName = (name) => {
        let event = name.replace(/_/g, ' ');
        return event
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log(`Number of attendees: ${attendees}`);
    };

    if (!userPhoneNumber) {
        return <Login />;
    }

    // After successful login, show the form
    return (
        <div>
            {/* {matchingEvent && (
                <div>
                    <img src={matchingEvent.event_image} alt={matchingEvent.event_name} />
                </div>
            )} */}
            <Header />
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
};

export default LoginEvent;
