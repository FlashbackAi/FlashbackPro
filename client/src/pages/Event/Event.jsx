// import React, { useEffect, useRef, useState } from 'react';
// import API_UTIL from '../../services/AuthIntereptor';
// import { Link } from 'react-router-dom';
// import Modal from 'react-modal';
// import { toast } from 'react-toastify';
// import QRCode from 'qrcode.react'
// import './Event.css'; // Import the new CSS file

// const Event = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editData, setEditData] = useState(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [eventToDelete, setEventToDelete] = useState(null);
//   const [isQrModalOpen, setIsQrModalOpen] = useState(false)
//   const qrRef = useRef();

//   const clientName = "DummyClient";

//   useEffect(() => {
//     const fetchEventData = async () => {
//       try {
//         const response = await API_UTIL.get(`/getClientEventDetails/${clientName}`);
//         console.log(response.data);
//         setEvents(response.data);
//         setLoading(false);
//       } catch (error) {
//         setError(error.message);
//         setLoading(false);
//       }
//     };

//     fetchEventData();
//   }, [clientName,editData]);

//   const openDeleteModal = (event) => {
//     setEventToDelete(event);
//     setIsDeleteModalOpen(true);
//   };

//   const closeDeleteModal = () => {
//     setIsDeleteModalOpen(false);
//     setEventToDelete(null);
//   };

//   const deleteEvent = async (eventName, eventDate) => {
//     try {
//       await API_UTIL.delete(`/deleteEvent/${eventName}/${eventDate}`);
//       setEvents(events.filter(event => !(event.event_name === eventName && event.event_date === eventDate)));
//       setIsDeleteModalOpen(false)
//       toast.success('Event deleted successfully');
//     } catch (error) {
//       console.error("Error deleting event:", error);
//       toast.error('Failed to delete the event. Please try again.');
//     }
//   };

//   const openModal = (event) => {
//     setSelectedEvent(event);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedEvent(null);
//     setEditData(null);
//   };

//   const openQrModal = () => {
//     setIsQrModalOpen(true);
//   };

//   const closeQrModal = () => {
//     setIsQrModalOpen(false);
//   };

//   const handleEditClick = () => {
//     setEditData({
//       eventName: selectedEvent.event_name,
//       eventDate: selectedEvent.event_date.split(' ')[0],
//       eventTime: selectedEvent.event_date.split(' ')[1],
//       invitationNote: selectedEvent.invitation_note,
//       eventLocation: selectedEvent.event_location,
//       street: selectedEvent.street,
//       city: selectedEvent.city,
//       state: selectedEvent.state,
//       pinCode: selectedEvent.pin_code,
//       invitation_url: selectedEvent.invitation_url,
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditData({ ...editData, [name]: value });
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await API_UTIL.put(`/updateEvent/${selectedEvent.event_name}/${selectedEvent.event_date}`, {
//         invitationNote: editData.invitationNote,
//         eventLocation: editData.eventLocation,
//         street: editData.street,
//         city: editData.city,
//         state: editData.state,
//         pinCode: editData.pinCode,
//         invitation_url: editData.invitation_url
//       });
//       if (response.status === 200) {
//         toast.success('Event updated successfully');
//         const updatedEvents = events.map(event =>
//           event.event_name === selectedEvent.event_name && event.event_date === selectedEvent.event_date
//             ? { ...event, ...editData }
//             : event
//         );
//         setEvents(updatedEvents);
//         closeModal();
//       }
//     } catch (error) {
//       console.error('Error updating event:', error);
//       toast.error('Failed to update the event. Please try again.');
//     }
//   };

//   const formatEventName = (name) => {
//     return name.replace(/_/g, ' ');
//   };

//   function getFormattedDate(datetime) {
//     const date = new Date(datetime);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
//   }

//   function getFormattedTime(datetime) {
//     const date = new Date(datetime);
//     let hours = date.getHours();
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     hours = hours % 12;
//     hours = hours ? String(hours).padStart(2, '0') : '12'; // the hour '0' should be '12'
//     return `${hours}:${minutes} ${ampm}`;
//   }

//   const sendWhatsAppMessage = () => {
//     const message = `Check out this event: ${selectedEvent.event_name} on ${getFormattedDate(selectedEvent.event_date)} at ${getFormattedTime(selectedEvent.event_date)}. Location: ${selectedEvent.event_location}, Url: https://flashback.inc/login/${selectedEvent.event_name}`;
//     const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
//     window.open(url, '_blank');
//   };

//   const downloadQRCode = () => {
//     const qrCanvas = qrRef.current.querySelector('canvas');
//     const qrImage = qrCanvas.toDataURL('image/png');
//     const downloadLink = document.createElement('a');
//     downloadLink.href = qrImage;
//     downloadLink.download = `${selectedEvent.event_name}_QR.png`;
//     downloadLink.click();
//   };
  
//   if (loading) return <div className="loading-screen">Loading...</div>;
//   if (error) return <div className="loading-screen">Error: {error}</div>;

//   return (
//     <div className="event-container">
//       <h1 className="event-title">Events</h1>
//       {events.length > 0 ? (
//         <ul className="event-list">
//           {events.map((event) => (
//             <li key={event.event_name} className="event-item">
//               <div className="event-card" onClick={() => openModal(event)}>
//                 <div className="event-card-header">
//                   <img
//                     src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
//                     className="delete-icon"
//                     onClick={(e) => { e.stopPropagation(); openDeleteModal(event) }}
//                     alt="Delete"
//                   />
//                 </div>
//                 <img src={event.event_image} alt="Image" className="event-image" />
//                 <div className="event-card-footer">
//                   <h2 className="event-name">{formatEventName(event?.event_name)}</h2>
//                 </div>
//               </div>
//               {event.invitation_url && (
//                 <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className="event-link">
//                   View Invitation
//                 </a>
//               )}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="no-events">No events found. Click on + to add events</p>
//       )}

//       <div className="add-button">
//         <Link to="/CreateEvent">
//           <img src="https://img.icons8.com/B48E75/stamp/2x/add.png" alt="add-button"/>
//         </Link>
//       </div>

//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={closeModal}
//         contentLabel="Event Details"
//         className="modal-content"
//         overlayClassName="modal-overlay"
//       >
//         {selectedEvent && (
//           <div>
//             <div className="modal-header">
//               <h2 className="modal-title">{formatEventName(selectedEvent?.event_name)}</h2>
//               <button className="close-button" onClick={closeModal}>x</button>
//             </div>
//             <div className="modal-body">
//               <img 
//                 src="https://img.icons8.com/ffffff/android/2x/edit.png" 
//                 alt="Edit" 
//                 className="edit-icon" 
//                 onClick={handleEditClick}
//               />
//               <img 
//                 src={selectedEvent.event_image} 
//                 alt="Event" 
//                 className="modal-image" 
//               />
//             </div>
//             {editData ? (
//               <form onSubmit={handleFormSubmit} className="edit-form">
//                 <div className="form-group">
//                   <p className="form-label">Event Name: {formatEventName(editData?.eventName)}</p>
//                   <div className="form-group">
//                     <label className="form-label">Date:</label>
//                     <p className="form-value">{getFormattedDate(editData.eventDate)}</p>
//                   </div>
//                   <label className="form-label">Invitation Note:</label>
//                   <textarea 
//                     name="invitationNote" 
//                     value={editData.invitationNote} 
//                     onChange={handleInputChange} 
//                     className="form-input"
//                   />
//                   <label className="form-label">Location:</label>
//                   <input 
//                     type="text" 
//                     name="eventLocation" 
//                     value={editData.eventLocation} 
//                     onChange={handleInputChange} 
//                     className="form-input"
//                   />
//                   <label className="form-label">Street:</label>
//                   <input 
//                     type="text" 
//                     name="street" 
//                     value={editData.street} 
//                     onChange={handleInputChange} 
//                     className="form-input"
//                   />
//                   <label className="form-label">City:</label>
//                   <input 
//                     type="text" 
//                     name="city" 
//                     value={editData.city} 
//                     onChange={handleInputChange} 
//                     className="form-input"
//                   />
//                   <label className="form-label">State:</label>
//                   <input 
//                     type="text" 
//                     name="state" 
//                     value={editData.state} 
//                     onChange={handleInputChange} 
//                     className="form-input"
//                   />
//                   <label className="form-label">Pin Code:</label>
//                   <input 
//                     type="text" 
//                     name="pinCode" 
//                     value={editData.pinCode} 
//                     onChange={handleInputChange} 
//                     className="form-input"
//                     pattern="^\d{6}$"
//                     title="Please enter a valid 6-digit PIN code"
//                     required
//                   />
//                   <label className="form-label">Invitation URL:</label>
//                   <input 
//                     type="text" 
//                     name="invitation_url" 
//                     value={editData.invitation_url} 
//                     onChange={handleInputChange} 
//                     className="form-input"
//                   />
//                 </div>
//                 <button type="submit" className="save-button">Save Changes</button>
//               </form>
//             ) : (
//               <div className="form-group">
//                 <div className="form-group">
//                 <p className="form-value">Date: {getFormattedDate(selectedEvent.event_date)}</p>
//                 <p className="form-value">Time: {getFormattedTime(selectedEvent.event_date)}</p>
//                 <p className="form-value">Invitation Note: {selectedEvent.invitation_note}</p>
//                 <p className="form-value">Location: {selectedEvent.event_location}</p>
//                   <p className="form-value">Street: {selectedEvent.street},</p>
//                   <p className="form-value">City: {selectedEvent.city},</p>
//                   <p className="form-value">State: {selectedEvent.state},</p>
//                   <p className="form-value">Pin Code: {selectedEvent.pin_code}</p>
//                 </div>
//                 <div className='form-footer'>
//                   <button className='footer-buttons' onclick={sendWhatsAppMessage(selectedEvent.event_name)}>WhatsApp</button>
//                   <button className='footer-buttons' onClick={openQrModal}>Download QR</button>
//                   <button className='footer-buttons'>UploadFiles</button>
//                 </div>
//               </div>
//             )}
//             {selectedEvent.invitation_url && (
//               <a href={selectedEvent.invitation_url} target="_blank" rel="noopener noreferrer" className="event-link">
//                 View Invitation
//               </a>
//             )}
//           </div>
//         )}
//       </Modal>

//       <Modal
//         isOpen={isQrModalOpen}
//         onRequestClose={closeQrModal}
//         contentLabel="QR Code"
//         className="modal-content"
//         overlayClassName="modal-overlay"
//       >
//         {selectedEvent && (
//           <div className='qr-modal-container'>
//             <div className="modal-header">
//               <h2 className="modal-title">QR Code for {formatEventName(selectedEvent?.event_name)}</h2>
//               <button className="close-button" onClick={closeQrModal}>x</button>
//             </div>
//             <div className="qr-modal-box">
//               <div ref={qrRef} style={{ marginBottom: '20px' }}>
//                 <QRCode value={`https://flashback.inc/login/${selectedEvent?.event_name}`} size={256} />
//               </div>
//               <button className='footer-buttons' onClick={downloadQRCode}>Download QR</button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       <Modal
//         isOpen={isDeleteModalOpen}
//         onRequestClose={closeDeleteModal}
//         contentLabel="Delete Confirmation"
//         className="delete-modal-content"
//         overlayClassName="modal-overlay"
//       >
//         <div className='delete-modal-bg'>
//           <h2 className="modal-title">Confirm Delete</h2>
//           <p className="modal-body">Do you want to delete this event?</p>
//           <div className="modal-footer">
//             <button className="delete-button" onClick={()=> deleteEvent(eventToDelete.event_name,eventToDelete.event_date)}>Confirm</button>
//             <button className="cancel-button" onClick={closeDeleteModal}>Cancel</button>
//           </div>
//         </div>
//       </Modal>

//     </div>
//   );
// };

// export default Event;

import React, { useEffect, useState, useRef } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import QRCode from 'qrcode.react';
import './Event.css'; // Import the new CSS file

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isUploadFilesModelOpen, setUploadFilesModeOpen] = useState(false);

  const qrRef = useRef();

  const clientName = "DummyClient";

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await API_UTIL.get(`/getClientEventDetails/${clientName}`);
        console.log(response.data);
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEventData();
  }, [clientName, editData]);

  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const deleteEvent = async (eventName, eventDate) => {
    try {
      await API_UTIL.delete(`/deleteEvent/${eventName}/${eventDate}`);
      setEvents(events.filter(event => !(event.event_name === eventName && event.event_date === eventDate)));
      setIsDeleteModalOpen(false);
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error('Failed to delete the event. Please try again.');
    }
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setEditData(null);
  };

  const openQrModal = () => {
    setIsQrModalOpen(true);
  };

  const closeQrModal = () => {
    setIsQrModalOpen(false);
  };

  const openUploadFilesModal = () => {
    setUploadFilesModeOpen(true);
  }

  const closeUploadFilesModal = () => {
    setUploadFilesModeOpen(false);
  }

  const handleEditClick = () => {
    setEditData({
      eventName: selectedEvent.event_name,
      eventDate: selectedEvent.event_date.split(' ')[0],
      eventTime: selectedEvent.event_date.split(' ')[1],
      invitationNote: selectedEvent.invitation_note,
      eventLocation: selectedEvent.event_location,
      street: selectedEvent.street,
      city: selectedEvent.city,
      state: selectedEvent.state,
      pinCode: selectedEvent.pin_code,
      invitation_url: selectedEvent.invitation_url,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API_UTIL.put(`/updateEvent/${selectedEvent.event_name}/${selectedEvent.event_date}`, {
        invitationNote: editData.invitationNote,
        eventLocation: editData.eventLocation,
        street: editData.street,
        city: editData.city,
        state: editData.state,
        pinCode: editData.pinCode,
        invitation_url: editData.invitation_url
      });
      if (response.status === 200) {
        toast.success('Event updated successfully');
        const updatedEvents = events.map(event =>
          event.event_name === selectedEvent.event_name && event.event_date === selectedEvent.event_date
            ? { ...event, ...editData }
            : event
        );
        setEvents(updatedEvents);
        closeModal();
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update the event. Please try again.');
    }
  };

  const formatEventName = (name) => {
    return name.replace(/_/g, ' ');
  };

  function getFormattedDate(datetime) {
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function getFormattedTime(datetime) {
    const date = new Date(datetime);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12'; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  }

  const sendWhatsAppMessage = () => {
    const message = `Check out this event: ${selectedEvent.event_name} on ${getFormattedDate(selectedEvent.event_date)} at ${getFormattedTime(selectedEvent.event_date)}. Location: ${selectedEvent.event_location} , Url: https://flashback.inc/login/${selectedEvent.event_name}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const downloadQRCode = () => {
    const qrCanvas = qrRef.current.querySelector('canvas');
    const qrImage = qrCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = qrImage;
    downloadLink.download = `${selectedEvent.event_name}_QR.png`;
    downloadLink.click();
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (error) return <div className="loading-screen">Error: {error}</div>;

  return (
    <div className="event-container">
      <h1 className="event-title">Events</h1>
      {events.length > 0 ? (
        <ul className="event-list">
          {events.map((event) => (
            <li key={event.event_name} className="event-item">
              <div className="event-card" onClick={() => openModal(event)}>
                <div className="event-card-header">
                  <img
                    src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
                    className="delete-icon"
                    onClick={(e) => { e.stopPropagation(); openDeleteModal(event); }}
                    alt="Delete"
                  />
                </div>
                <img src={event.event_image} alt="Image" className="event-image" />
                <div className="event-card-footer">
                  <h2 className="event-name">{formatEventName(event?.event_name)}</h2>
                </div>
              </div>
              {event.invitation_url && (
                <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className="event-link">
                  View Invitation
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-events">No events found. Click on + to add events</p>
      )}

      <div className="add-button">
        <Link to="/CreateEvent">
          <img src="https://img.icons8.com/B48E75/stamp/2x/add.png" alt="add-button"/>
        </Link>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Event Details"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedEvent && (
          <div>
            <div className="modal-header">
              <h2 className="modal-title">{formatEventName(selectedEvent?.event_name)}</h2>
              <button className="close-button" onClick={closeModal}>x</button>
            </div>
            <div className="modal-body">
              <img 
                src="https://img.icons8.com/ffffff/android/2x/edit.png" 
                alt="Edit" 
                className="edit-icon" 
                onClick={handleEditClick}
              />
              <img 
                src={selectedEvent.event_image} 
                alt="Event" 
                className="modal-image" 
              />
            </div>
            {editData ? (
              <form onSubmit={handleFormSubmit} className="edit-form">
                <div className="form-group">
                  <p className="form-label">Event Name: {formatEventName(editData?.eventName)}</p>
                  <div className="form-group">
                    <label className="form-label">Date:</label>
                    <p className="form-value">{getFormattedDate(editData.eventDate)}</p>
                  </div>
                  <label className="form-label">Invitation Note:</label>
                  <textarea 
                    name="invitationNote" 
                    value={editData.invitationNote} 
                    onChange={handleInputChange} 
                    className="form-input"
                  />
                  <label className="form-label">Location:</label>
                  <input 
                    type="text" 
                    name="eventLocation" 
                    value={editData.eventLocation} 
                    onChange={handleInputChange} 
                    className="form-input"
                  />
                  <label className="form-label">Street:</label>
                  <input 
                    type="text" 
                    name="street" 
                    value={editData.street} 
                    onChange={handleInputChange} 
                    className="form-input"
                  />
                  <label className="form-label">City:</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={editData.city} 
                    onChange={handleInputChange} 
                    className="form-input"
                  />
                  <label className="form-label">State:</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={editData.state} 
                    onChange={handleInputChange} 
                    className="form-input"
                  />
                  <label className="form-label">Pin Code:</label>
                  <input 
                    type="text" 
                    name="pinCode" 
                    value={editData.pinCode} 
                    onChange={handleInputChange} 
                    className="form-input"
                    pattern="^\d{6}$"
                    title="Please enter a valid 6-digit PIN code"
                    required
                  />
                  <label className="form-label">Invitation URL:</label>
                  <input 
                    type="text" 
                    name="invitation_url" 
                    value={editData.invitation_url} 
                    onChange={handleInputChange} 
                    className="form-input"
                  />
                </div>
                <button type="submit" className="save-button">Save Changes</button>
              </form>
            ) : (
              <div className="form-group">
                <div className="form-group">
                  <p className="form-value">Date: {getFormattedDate(selectedEvent.event_date)}</p>
                  <p className="form-value">Time: {getFormattedTime(selectedEvent.event_date)}</p>
                  <p className="form-value">Invitation Note: {selectedEvent.invitation_note}</p>
                  <p className="form-value">Location: {selectedEvent.event_location}</p>
                  <p className="form-value">Street: {selectedEvent.street},</p>
                  <p className="form-value">City: {selectedEvent.city},</p>
                  <p className="form-value">State: {selectedEvent.state},</p>
                  <p className="form-value">Pin Code: {selectedEvent.pin_code}</p>
                </div>
                <div className='form-footer'>
                  <button className='footer-buttons' onClick={sendWhatsAppMessage}>WhatsApp</button>
                  <button className='footer-buttons' onClick={openQrModal}>Generate QR</button>
                  <button className='footer-buttons' onClick={openUploadFilesModal}>Upload Files</button>
                </div>
              </div>
            )}
            {selectedEvent.invitation_url && (
              <a href={selectedEvent.invitation_url} target="_blank" rel="noopener noreferrer" className="event-link">
                View Invitation
              </a>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isQrModalOpen}
        onRequestClose={closeQrModal}
        contentLabel="QR Code"
        className="qr-modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedEvent && (
          <div>
            <div className="modal-header">
              <h2 className="modal-title">QR Code for {formatEventName(selectedEvent?.event_name)}</h2>
              <button className="close-button" onClick={closeQrModal}>x</button>
            </div>
            <div className="qr-modal-body">
              <div ref={qrRef} style={{ marginBottom: '20px' }}>
                <QRCode value={`https://flashback.inc/login/${selectedEvent?.event_name}`} size={256} />
              </div>
              <button className='qr-footer-buttons' onClick={downloadQRCode}>Download QR</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isUploadFilesModelOpen}
        onRequestClose={closeUploadFilesModal}
        contentLabel="Upload Files"
        className="uploadfiles-modal-content"
        overlayClassName="modal-overlay"
      >
        <div>
          <div className="uploadfiles-modal-header">
            <h2 className="uploadfiles-modal-title">Upload Files</h2>
            <button className="close-button" onClick={closeUploadFilesModal}>x</button>
          </div>
          <div className="modal-body">
            This feature is not available now.
          </div>
        </div>
      </Modal>


      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Confirmation"
        className="delete-modal-content"
        overlayClassName="modal-overlay"
      >
        <div className='delete-modal-bg'>
          <h2 className="modal-title">Confirm Delete</h2>
          <p className="modal-body">Do you want to delete this event?</p>
          <div className="modal-footer">
            <button className="delete-button" onClick={() => deleteEvent(eventToDelete.event_name, eventToDelete.event_date)}>Confirm</button>
            <button className="cancel-button" onClick={closeDeleteModal}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Event;



