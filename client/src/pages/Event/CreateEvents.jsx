// import React, { useState, useEffect } from 'react';
// import './CreateEvents.css';
// import API_UTIL from '../../services/AuthIntereptor';
// import { toast } from 'react-toastify';
// import { useNavigate, useLocation } from 'react-router-dom';

// const CreateEventForm = () => {
//   const location = useLocation();
//   const { selectedEvent,selectedSubEvents, userName} = location.state || {};

//   const [formData, setFormData] = useState({
//     bridesName: '',
//     groomsName: '',
//     eventDate: '',
//   });

//   const [eventTime, setEventTime] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     populateTimeDropdown();
//   }, []);

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

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Parse the time
//     let [time, modifier] = eventTime.split(' ');
//     let [hours, minutes] = time.split(':');

//     if (hours === '12') {
//       hours = '00';
//     }
//     if (modifier === 'PM') {
//       hours = parseInt(hours, 10) + 12;
//     }

//     // Ensure both hours and minutes are two digits
//     hours = String(hours).padStart(2, '0');
//     minutes = String(minutes).padStart(2, '0');

//     const combinedDateTime = `${formData.eventDate}T${hours}:${minutes}:00`;

//     setUploading(true);
    
//     const createEventRequests = selectedSubEvents.map(async (subEvent) => {
//       const eventTitle = `${formData.bridesName}_${formData.groomsName}_${subEvent}`.replace(/\s+/g, '_');

//       const formDataToSend = new FormData();
//       formDataToSend.append('eventName', eventTitle);
//       formDataToSend.append('eventDate', combinedDateTime);

//       try {
//         const response = await API_UTIL.post('/saveEventDetails', formDataToSend, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });

//         if (response.status !== 200) {
//           throw new Error('Failed to save the event');
//         }

//         return response;
//       } catch (error) {
//         console.error('Error saving form data to backend:', error);
//         throw error;
//       }
//     });

//     try {
//       await Promise.all(createEventRequests);
//       toast.success('Events created successfully');
//       setTimeout(() => {
//         navigate('/event');
//       }, 1000);
//     } catch (error) {
//       toast.error('Failed to save the events. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="create-event-container">
//       <h1 className="form-title">Create Event Invitation</h1>
//       <form className="invitation-form" id="invitation-form" onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="brides-name">Name:</label>
//           <input
//             type="text"
//             id="brides-name"
//             name="bridesName"
//             placeholder="Bride's Name"
//             value={formData.bridesName}
//             onChange={handleInputChange}
//             required
//           />
//         </div>
//         <button className="submit-button" type="submit" disabled={uploading}>
//           {uploading ? 'Creating...' : 'Create'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateEventForm;

import React, { useState } from 'react';
import './CreateEvents.css';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateEventForm = () => {
  const location = useLocation();
  const { selectedEvent, selectedSubEvents, userName } = location.state || {};

  const [formData, setFormData] = useState({
    bridesName: '',
    image: null,
  });

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploading(true);

    try {
      let imageUrl = '';
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        imageFormData.append('projectName', `${formData.bridesName}_${selectedEvent}`.replace(/\s+/g, '_'));
        imageFormData.append('clientName', userName);
        imageFormData.append('projectType', selectedEvent);
        
        const eventsArray = selectedSubEvents ? selectedSubEvents.map(subEvent => `${formData.bridesName}_${subEvent}`.replace(/\s+/g, '_')) : [`${formData.bridesName}_${selectedEvent}`.replace(/\s+/g, '_')];
        eventsArray.forEach((event, index) => {
          imageFormData.append(`events[${index}]`, event);
        });
        
        console.log(imageFormData)
        const response = await API_UTIL.post('/saveProjectDetails', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          imageUrl = response.data.projectName;
          setImageUrl(imageUrl);
          toast.success('Event created successfully');
          setTimeout(() => {
            navigate('/event');
          }, 1000);
        } else {
          throw new Error('Failed to save the event');
        }
      } else {
        throw new Error('Image file is required');
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
          <label htmlFor="brides-name">Name:</label>
          <input
            type="text"
            id="brides-name"
            name="bridesName"
            placeholder="Name"
            value={formData.bridesName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image-upload">Upload Photo:</label>
          <input
            type="file"
            id="image-upload"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
            required
          />
        </div>
        <button className="submit-button" type="submit" disabled={uploading}>
          {uploading ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default CreateEventForm;
