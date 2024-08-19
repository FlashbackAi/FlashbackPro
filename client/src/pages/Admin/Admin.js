import React, { useState, useEffect, useCallback, useRef } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { Loader2, Send, Zap, ChevronDown } from 'lucide-react';
import './Admin.css';
import AppBar from '../../components/AppBar/AppBar';
import Footer from '../../components/Footer/Footer';

function Admin() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sentData, setSentData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('trigger'); // 'trigger' or 'send'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const eventSourceRef = useRef(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    fetchSentData();
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [activeTab]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  const fetchEvents = useCallback(async () => {
    try {
      const response = await API_UTIL.get(`/fetch-events?type=${activeTab}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    }
  }, [activeTab]);

  const fetchSentData = useCallback(async () => {
    try {
      const response = await API_UTIL.get('/fetch-sent-data');
      setSentData(response.data);
    } catch (error) {
      console.error('Error fetching sent data:', error);
      toast.error('Failed to fetch sent data');
    }
  }, []);

  const handleEventAction = useCallback(async () => {
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    if (activeTab === 'trigger') {
      try {
        const response = await API_UTIL.post('/trigger-flashback', { eventName: selectedEvent });
        toast.success('Flashback triggered successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error triggering flashback:', error);
        toast.error('Failed to trigger flashback');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Send Flashbacks with POST request and long polling
      try {
        const response = await API_UTIL.post('/send-flashbacks', { eventName: selectedEvent });
        const { taskId } = response.data;

        setIsPolling(true);
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const progressResponse = await API_UTIL.get(`/flashback-progress/${taskId}`);
            const { progress, status } = progressResponse.data;

            setProgress(progress);

            if (status === 'completed') {
              clearInterval(pollingIntervalRef.current);
              setIsPolling(false);
              setIsLoading(false);
              toast.success('Flashbacks sent successfully');
              fetchSentData();
              fetchEvents();
            } else if (status === 'failed') {
              clearInterval(pollingIntervalRef.current);
              setIsPolling(false);
              setIsLoading(false);
              toast.error('Failed to send flashbacks');
            }
          } catch (error) {
            console.error('Error fetching progress:', error);
            clearInterval(pollingIntervalRef.current);
            setIsPolling(false);
            setIsLoading(false);
            toast.error('Error fetching progress');
          }
        }, 2000); // Poll every 2 seconds
      } catch (error) {
        console.error('Error sending flashbacks:', error);
        toast.error('Failed to send flashbacks');
        setIsLoading(false);
      }
    }
  }, [activeTab, selectedEvent, fetchSentData, fetchEvents]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const getStatusFlag = (status) => {
    switch(status) {
      case 'Flashbacks_Partially_Delivered':
        return <span className="status-flag partial">Partially Delivered</span>;
      case 'triggered':
        return <span className="status-flag triggered">Triggered</span>;
      case '':
        return <span className="status-flag not-triggered">Not Triggered</span>;
      default:
        return null;
    }
  };

  return (
    
    <div className="admin-wrapper">
      <div className="admin-app-bar"><AppBar/></div>
      <div className="admin-container">
      <div className="admin-header">
        <h1>Flashback Admin Portal</h1>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'trigger' ? 'active' : ''}`} 
          onClick={() => setActiveTab('trigger')}
        >
          <Zap size={18} />
          Trigger Flashback
        </button>
        <button 
          className={`tab-button ${activeTab === 'send' ? 'active' : ''}`} 
          onClick={() => setActiveTab('send')}
        >
          <Send size={18} />
          Send Flashbacks
        </button>
      </div>

      <div className="admin-content">
        <div className="event-selection" ref={dropdownRef}>
          <div 
            className="custom-select" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{selectedEvent || "Select Event"}</span>
            <ChevronDown size={18} />
          </div>
          {isDropdownOpen && (
            <ul className="custom-options">
              {events.map((event, index) => (
                <li 
                  key={index} 
                  onClick={() => {
                    setSelectedEvent(event.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  {event.name}
                  {getStatusFlag(event.status)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button 
          className="action-button"
          onClick={handleEventAction}
          disabled={isLoading || !selectedEvent}
        >
          {isLoading ? (
            <>
              <Loader2 className="spin" size={18} />
              {isPolling ? 'Sending...' : 'Processing...'}
            </>
          ) : activeTab === 'trigger' ? (
            <>
              <Zap size={18} />
              Trigger Flashback
            </>
          ) : (
            <>
              <Send size={18} />
              Send Flashbacks
            </>
          )}
        </button>

        {isLoading && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className="sent-data-container">
        <h2>Recent Flashbacks (Last 3 Days)</h2>
        <table className="sent-data-table">
          <thead>
            <tr>
              <th>Phone Number</th>
              <th>Event Name</th>
              {/* <th>Sent Link</th> */}
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sentData.map((item, index) => (
              <tr key={index}>
                <td>{item.user_phone_number}</td>
                <td>{item.event_name}</td>
                {/* <td>{item.sent_link}</td> */}
                <td>{new Date(item.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default Admin;