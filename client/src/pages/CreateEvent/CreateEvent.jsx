// import React, { useState, useEffect } from 'react';
// import './CreateEvent.css';
// import API_UTIL from '../../services/AuthIntereptor';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// const CreateEventForm = () => {
//   const [formData, setFormData] = useState({
//     eventName: '',
//     eventDate: '',
//     eventLocation: '',
//     street: '',
//     city: '',
//     state: '',
//     pinCode: '',
//     invitationNote: '',
//     clientName: 'DummyClient',
//     invitation_url: '',
//   });

//   const [eventTime, setEventTime] = useState('');
//   const [imageFile, setImageFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const navigate = useNavigate();

//   //const isScriptLoaded = useScript(`https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`);

//   useEffect(() => {
//     // if (isScriptLoaded) {
//     //   const autocomplete = new window.google.maps.places.Autocomplete(document.getElementById('event-location'));
//     //   autocomplete.addListener('place_changed', () => {
//     //     const place = autocomplete.getPlace();
//     //     if (!place.geometry) {
//     //       window.alert("No details available for input: '" + place.name + "'");
//     //       return;
//     //     }

//     //     const addressComponents = place.address_components;
//     //     const addressData = {};
//     //     for (let component of addressComponents) {
//     //       const types = component.types;
//     //       if (types.includes('street_number')) {
//     //         addressData.street = component.long_name + ' ' + (addressData.street || '');
//     //       }
//     //       if (types.includes('route')) {
//     //         addressData.street = (addressData.street || '') + component.long_name;
//     //       }
//     //       if (types.includes('locality')) {
//     //         addressData.city = component.long_name;
//     //       }
//     //       if (types.includes('administrative_area_level_1')) {
//     //         addressData.state = component.short_name;
//     //       }
//     //       if (types.includes('postal_code')) {
//     //         addressData.pinCode = component.long_name;
//     //       }
//     //     }
//     //     setFormData((prevData) => ({ ...prevData, ...addressData }));
//     //   });

//       populateTimeDropdown();
//     //}
//   }, [/*isScriptLoaded*/]);

//   const populateTimeDropdown = () => {
//     const timeInput = document.getElementById('event-time');
//     const periods = ['AM', 'PM'];
//     for (let period of periods) {
//       for (let hour = 1; hour <= 12; hour++) {
//         for (let minute = 0; minute < 60; minute += 5) {
//           let option = document.createElement('option');
//           option.value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
//           option.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
//           timeInput.appendChild(option);
//         }
//       }
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleTimeChange = (e) => {
//     setEventTime(e.target.value);
//   };

//   const handleImageChange = (e) => {
//     setImageFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Parse the time
//     let [time, modifier] = eventTime.split(' ');
//     let [hours, minutes] = time.split(':');

//     if (hours === '12') {
//         hours = '00';
//     }
//     if (modifier === 'PM') {
//         hours = parseInt(hours, 10) + 12;
//     }
    
//     // Ensure both hours and minutes are two digits
//     hours = String(hours).padStart(2, '0');
//     minutes = String(minutes).padStart(2, '0');

//     console.log(hours);

//     if (!imageFile) {
//       toast.error('Please upload an image');
//       return;
//     }

//     const combinedDateTime = `${formData.eventDate}T${hours}:${minutes}:00`;
//     //const updatedFormData = { ...formData, eventDate: combinedDateTime };
//     formData.eventDate = combinedDateTime;

//     setUploading(true);
//     const formDataToSend = new FormData();
//     formDataToSend.append('image', imageFile);
//     formDataToSend.append('eventName', formData.eventName);
//     formDataToSend.append('eventDate', formData.eventDate);
//     formDataToSend.append('clientName', formData.clientName);
//     formDataToSend.append('eventLocation', formData.eventLocation);
//     formDataToSend.append('street', formData.street);
//     formDataToSend.append('city', formData.city);
//     formDataToSend.append('state', formData.state);
//     formDataToSend.append('pinCode', formData.pinCode);
//     formDataToSend.append('invitationNote', formData.invitationNote);
//     formDataToSend.append('invitation_url', formData.invitation_url);

//     try {
//       const response = await API_UTIL.post('/saveEventDetails', formDataToSend, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },

        
//       });

//       if (response.status === 200) {
//         toast.success('Event created successfully');
//         setTimeout(() => {
//           navigate('/event');
//         }, 1000); 
//       }
//     } catch (error) {
//       console.error('Error saving form data to backend:', error);
//       toast.error('Failed to save the event. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="mx-auto p-4 bg-[#1c1c1c] rounded-lg shadow-md text-black font-code">
//       <h1 className="text-2xl font-bold my-8 text-center mx-auto text-white">Create Event Invitation</h1>
//       <form className="invitation-form w-1/3 mx-auto p-4" id="invitation-form" onSubmit={handleSubmit}>
//         <div className="form-group mb-4 p-4">
//           <label className="block mb-2 text-gray-400" htmlFor="invitation-image">Upload Invitation Image/Video:</label>
//           <input
//             className="block w-full p-2 border border-gray-300 rounded text-gray-400"
//             type="file"
//             id="invitation-image"
//             name="invitationImage"
//             accept="image/*,video/*"
//             onChange={handleImageChange}
//             required
//           />
//         </div>
//         <div className="form-group mb-4">
//           <label className="block mb-2 text-gray-400" htmlFor="event-title">Event Title:</label>
//           <input
//             className="w-full block p-2 border bg-gray-200 border-gray-300 rounded text"
//             type="text"
//             id="event-title"
//             name="eventName"
//             placeholder="Emma's Marriage"
//             value={formData.eventName}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
//         <div className="flex space-x-4">
//           <div className="form-group mb-4 w-1/2">
//             <label className="block mb-2 text-gray-400" htmlFor="event-date">Event Date:</label>
//             <input
//               className="block w-full p-2 border border-gray-300 rounded"
//               type="date"
//               id="event-date"
//               name="eventDate"
//               value={formData.eventDate}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div className="form-group mb-4 w-1/2">
//             <label className="block mb-2 text-gray-400" htmlFor="event-time">Event Time:</label>
//             <select
//               className="block w-full p-3 border border-gray-300 rounded"
//               id="event-time"
//               name="eventTime"
//               value={eventTime}
//               onChange={handleTimeChange}
//               required
//             >
//               <option value="">Select Time</option>
//             </select>
//           </div>
//         </div>
//         <div className="form-group mb-4">
//           <label className="block mb-2 text-gray-400" htmlFor="event-location">Location:</label>
//           <input
//             className="block w-full p-2 border border-gray-300 rounded"
//             type="text"
//             id="event-location"
//             name="eventLocation"
//             placeholder="ex. Emma's House"
//             value={formData.eventLocation}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
//         <div className="flex space-x-4">
//           <div className="form-group mb-4 w-1/2">
//             <label className="block mb-2 text-gray-400" htmlFor="event-street">Street:</label>
//             <input
//               className="block w-full p-2 border border-gray-300 rounded"
//               type="text"
//               id="event-street"
//               name="street"
//               placeholder="Street address"
//               value={formData.street}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div className="form-group mb-4 w-1/2">
//             <label className="block mb-2 text-gray-400" htmlFor="event-city">City:</label>
//             <input
//               className="block w-full p-2 border border-gray-300 rounded"
//               type="text"
//               id="event-city"
//               name="city"
//               placeholder="City"
//               value={formData.city}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//         </div>
//         <div className="flex space-x-4">
//           <div className="form-group mb-4 w-1/2">
//             <label className="block mb-2 text-gray-400" htmlFor="event-state">State:</label>
//             <input
//               className="block w-full p-2 border border-gray-300 rounded"
//               type="text"
//               id="event-state"
//               name="state"
//               placeholder="State"
//               value={formData.state}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div className="form-group mb-4 w-1/2">
//             <label className="block mb-2 text-gray-400" htmlFor="event-zip">Zip:</label>
//             <input
//               className="block w-full p-2 border border-gray-300 rounded"
//               type="text"
//               id="event-zip"
//               name="pinCode"
//               placeholder="Zip"
//               value={formData.pinCode}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//         </div>
//         <div className="form-group mb-4">
//           <label className="block mb-2 text-gray-400" htmlFor="invitation-note">Invitation Note:</label>
//           <textarea
//             className="block w-full p-2 border border-gray-300 rounded"
//             id="invitation-note"
//             name="invitationNote"
//             rows="4"
//             value={formData.invitationNote}
//             onChange={handleInputChange}
//             required
//           ></textarea>
//         </div>
//         <button className="mx-20 w-2/3 p-3 bg-[#b48e75] text-white rounded hover:bg-[#956f55]" type="submit" disabled={uploading}>
//           {uploading ? 'Creating...' : 'Create Invitation'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateEventForm;

import React, { useState, useEffect } from 'react';
import './CreateEvent.css';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateEventForm = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    invitationNote: '',
    clientName: 'DummyClient',
    invitation_url: '',
  });

  const [eventTime, setEventTime] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEventTitleChanged, setIsEventTitleChanged] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    populateTimeDropdown();
  }, []);

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
    if(name === 'eventName' && value !== ''){
      setIsEventTitleChanged(true);
    }
    setFormData({ ...formData, [name]: value});
  };

  const handleTimeChange = (e) => {
    setEventTime(e.target.value);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse the time
    let [time, modifier] = eventTime.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    // Ensure both hours and minutes are two digits
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');

    if (!imageFile) {
      toast.error('Please upload an image');
      return;
    }

    const combinedDateTime = `${formData.eventDate}T${hours}:${minutes}:00`;
    const eventNameWithUnderscores = formData.eventName.replace(/\s+/g, '_');
    formData.eventDate = combinedDateTime;

    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('image', imageFile);
    formDataToSend.append('eventName', eventNameWithUnderscores);
    formDataToSend.append('eventDate', formData.eventDate);
    formDataToSend.append('clientName', formData.clientName);
    formDataToSend.append('eventLocation', formData.eventLocation);
    formDataToSend.append('street', formData.street);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('state', formData.state);
    formDataToSend.append('pinCode', formData.pinCode);
    formDataToSend.append('invitationNote', formData.invitationNote);
    formDataToSend.append('invitation_url', formData.invitation_url);

    try {
      const response = await API_UTIL.post('/saveEventDetails', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('Event created successfully');
        setTimeout(() => {
          navigate('/event');
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving form data to backend:', error);
      toast.error('Failed to save the event. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="create-event-container">
      <h1 className="form-title">Create Event Invitation</h1>
      <form className="invitation-form" id="invitation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="invitation-image">Upload Invitation Image/Video:</label>
          <input
            type="file"
            id="invitation-image"
            name="invitationImage"
            className='input-upload'
            accept="image/*,video/*"
            onChange={handleImageChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-title">Event Title:</label>
          <input
            type="text"
            id="event-title"
            name="eventName"
            placeholder="Emma's Marriage"
            value={formData.eventName}
            onChange={handleInputChange}
            required
          />
          {isEventTitleChanged && <p className='warning-text'>*Event Title cannot be updated further.</p>}
        </div>
        <div className="form-row">
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
            <select
              id="event-time"
              name="eventTime"
              value={eventTime}
              onChange={handleTimeChange}
              required
            >
              <option value="">Select Time</option>
            </select>
          </div>
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
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-street">Street:</label>
            <input
              type="text"
              id="event-street"
              name="street"
              placeholder="Street address"
              value={formData.street}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-city">City:</label>
            <input
              type="text"
              id="event-city"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-state">State:</label>
            <input
              type="text"
              id="event-state"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-zip">Pin Code:</label>
            <input
              type="text"
              id="event-zip"
              name="pinCode"
              placeholder="Pin code"
              value={formData.pinCode}
              onChange={handleInputChange}
              pattern="^\d{6}$"
              title="Please enter a valid 6-digit PIN code"
              required
            />
          </div>
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
        <button className="submit-button" type="submit" disabled={uploading}>
          {uploading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default CreateEventForm;
