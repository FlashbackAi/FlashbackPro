import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import '../ShareEvents.css';

const ShareEvents = () => {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('highToLow');
  const [events, setEvents] = useState([]);
  const [currentEventName, setCurrentEventName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1); // Initialize page number
  const pageSize = 10; // Number of records per page
  const location = useLocation();

  useEffect(() => {
    fetchEvents();
  }, [pageNumber]); // Fetch events whenever the page number changes

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = async (eventName, newPageNumber) => {
    setPageNumber(newPageNumber);
    try {
      setLoading(true);
      const response = await axios.post(`${serverIP}/getPeopleThumbnails`, { eventName, pageNumber: newPageNumber });
      setThumbnails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching thumbnails:', error);
      setLoading(false);
    }
  };
  
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${serverIP}/fetch-events`);
      setEvents(response.data);
      setLoading(false); // Set loading to false after events are loaded
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  const handleFolderClick = async (eventName, pageNumber, pageSize) => {
    setCurrentEventName(eventName);
    try {
      setLoading(true); // Set loading to true when fetching thumbnails
      const response = await axios.post(`${serverIP}/getPeopleThumbnails`, { eventName, pageNumber, pageSize });
      setThumbnails(response.data);
      setLoading(false); // Set loading to false after thumbnails are loaded
    } catch (error) {
      console.error('Error fetching thumbnails:', error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  const filteredEvents = events.filter(event =>
    event.S.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="events-container">
      {location.pathname.includes('/people') ? (
        <div className="thumbnails-container">
          <h1>Thumbnails</h1>
          <div className="sort-filter">
            Sort By:{' '}
            <select value={sortBy} onChange={handleSortChange}>
              <option value="highToLow">High to Low</option>
              <option value="lowToHigh">Low to High</option>
            </select>
          </div>
          {loading ? ( // Render loading spinner when loading is true
            <p>Loading thumbnails...</p>
          ) : (
            <div className="thumbnails-grid">
              {thumbnails.map((thumbnail, index) => (
                <div key={index} className="thumbnail-item">
                  <img src={`data:image/jpeg;base64,${thumbnail.thumbnailUrl}`} alt={`Thumbnail ${index}`} />
                  <p>User ID: {thumbnail.userId}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => handlePageChange(currentEventName, pageNumber - 1, pageSize)} disabled={pageNumber === 1}>Previous</button>
            <span>{pageNumber}</span>
            <button onClick={() => handlePageChange(currentEventName, pageNumber + 1, pageSize)}>Next</button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Events</h1>
          <input
            type="text"
            className="search-bar"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <ul className="events-list">
              {filteredEvents.length === 0 ? (
                <p>No events found</p>
              ) : (
                filteredEvents.map((event, index) => (
                  <li key={index}>
                    <Link to={`${event.S}/people`} className="event-link" onClick={() => handleFolderClick(event.S)}>
                      <div className="event-folder">
                        <span className="folder-icon">📁</span>
                        <span className="folder-name">{event.S}</span>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareEvents;
