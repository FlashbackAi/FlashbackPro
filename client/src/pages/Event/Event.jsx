import React, { useEffect, useState } from 'react';
import './Event.css';
import useScript from './useScript';

const App = () => {
  const [formData, setFormData] = useState({
    invitationImage: '',
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventStreet: '',
    eventCity: '',
    eventState: '',
    eventZip: '',
    invitationNote: ''
  });

  const isScriptLoaded = useScript(`https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`);

  useEffect(() => {
    if (isScriptLoaded) {
      const autocomplete = new window.google.maps.places.Autocomplete(document.getElementById('event-location'));
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          window.alert("No details available for input: '" + place.name + "'");
          return;
        }

        const addressComponents = place.address_components;
        const addressData = {};
        for (let component of addressComponents) {
          const types = component.types;
          if (types.includes('street_number')) {
            addressData.street = component.long_name + ' ' + (addressData.street || '');
          }
          if (types.includes('route')) {
            addressData.street = (addressData.street || '') + component.long_name;
          }
          if (types.includes('locality')) {
            addressData.city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            addressData.state = component.short_name;
          }
          if (types.includes('postal_code')) {
            addressData.zip = component.long_name;
          }
        }
        setFormData((prevData) => ({ ...prevData, ...addressData }));
      });

      populateTimeDropdown();
    }
  }, [isScriptLoaded]);

  const populateTimeDropdown = () => {
    const timeInput = document.getElementById('event-time');
    const periods = ['AM', 'PM'];
    for (let period of periods) {
      for (let hour = 1; hour <= 12; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
          let option = document.createElement('option');
          option.value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
          option.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
          timeInput.appendChild(option);
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Invitation created successfully!');
    setFormData({
      invitationImage: '',
      eventTitle: '',
      eventDate: '',
      eventTime: '',
      eventLocation: '',
      eventStreet: '',
      eventCity: '',
      eventState: '',
      eventZip: '',
      invitationNote: ''
    });
  };

  return (
    <div className="container">
      <h1>Create Event Invitation</h1>
      <form id="invitation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="invitation-image">Upload Invitation Image/Video:</label>
          <input
            type="file"
            id="invitation-image"
            name="invitationImage"
            accept="image/*,video/*"
            onChange={(e) => setFormData({ ...formData, invitationImage: e.target.files[0] })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-title">Event Title:</label>
          <input
            type="text"
            id="event-title"
            name="eventTitle"
            value={formData.eventTitle}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-date">Event Date:</label>
          <input
            type="date"
            id="event-date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-time">Event Time:</label>
          <select id="event-time" name="eventTime" value={formData.eventTime} onChange={handleInputChange} required>
            <option value="">Select Time</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="event-location">Location:</label>
          <input
            type="text"
            id="event-location"
            name="eventLocation"
            placeholder="ex. Emma's House"
            value={formData.eventLocation}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-street">Street:</label>
          <input
            type="text"
            id="event-street"
            name="eventStreet"
            placeholder="Street address"
            value={formData.eventStreet}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-city">City:</label>
          <input
            type="text"
            id="event-city"
            name="eventCity"
            placeholder="City"
            value={formData.eventCity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-state">State:</label>
          <input
            type="text"
            id="event-state"
            name="eventState"
            placeholder="State"
            value={formData.eventState}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-zip">Zip:</label>
          <input
            type="text"
            id="event-zip"
            name="eventZip"
            placeholder="Zip"
            value={formData.eventZip}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="invitation-note">Invitation Note:</label>
          <textarea
            id="invitation-note"
            name="invitationNote"
            rows="4"
            value={formData.invitationNote}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>
        <button type="submit">Create Invitation</button>
      </form>
    </div>
  );
};

export default App;
