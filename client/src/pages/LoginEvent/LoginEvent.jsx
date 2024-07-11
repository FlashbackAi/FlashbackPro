import React, { useEffect, useState } from 'react';
import Login from "../Auth/Login/Login.js";
import { useParams } from 'react-router';
import API_UTIL from '../../services/AuthIntereptor.js';

export const LoginEvent = () => {
    const { eventName } = useParams();
    const clientName = "DummyClient";
    const [error, setError] = useState(null);
    const [eventData, setEventData] = useState([]);
    const [matchingEvent, setMatchingEvent] = useState(null);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const response = await API_UTIL.get(`/getClientEventDetails/${clientName}`);
                console.log(response.data);
                setEventData(response.data);
                const event = response.data.find(event => event.event_name === eventName);
                setMatchingEvent(event);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchEventData();
    }, [clientName, eventName]);

    if (error) return <div className="loading-screen">Error: {error}</div>;

    return (
        <div>
            <Login />
            <div>
                {matchingEvent && (
                    <div>
                        <img src={matchingEvent.event_image} alt={matchingEvent.event_name} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginEvent;
