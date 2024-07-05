// import React, { useEffect, useState } from 'react';
// import API_UTIL from '../../services/AuthIntereptor';
// import { Link } from 'react-router-dom';
// import Modal from 'react-modal';
// import { toast } from 'react-toastify';

// const Event = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editData, setEditData] = useState(null);

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
//   }, [clientName]);

//   const deleteEvent = async (eventName, eventDate) => {
//     try {
//       await API_UTIL.delete(`/deleteEvent/${eventName}/${eventDate}`);
//       setEvents(events.filter(event => event.event_name !== eventName && event.event_date !== eventDate));
//     } catch (error) {
//       console.error("Error deleting event:", error);
//     }
//   };

//   const openModal = (event) => {
//     setSelectedEvent(event);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedEvent(null);
//   };

//   const handleEditClick = () => {
//     setEditData({
//       eventName: selectedEvent.event_name,
//       eventDate: selectedEvent.event_date,
//       invitationNote: selectedEvent.invitationNote,
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
//       const response = await API_UTIL.put(`/updateEvent/${selectedEvent.event_name}/${selectedEvent.event_date}`, editData);
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

//   if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//   if (error) return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>;

//   return (
//     <div className="font-code p-4 min-h-screen">
//       <h1 className="text-center my-8 text-4xl font-semibold text-gray-200">Events</h1>
//       {events.length > 0 ? (
//         <ul className="px-8 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
//           {events.map((event) => (
//             <li key={event.event_name}>
//               <div className="relative w-full h-56 rounded-md overflow-hidden hover:scale-95 cursor-pointer" onClick={() => openModal(event)}>
//                 <div className="absolute top-0 right-0 flex justify-end items-center w-full bg-gradient-to-b from-black text-white p-2">
//                   <img
//                     src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
//                     className="w-8 hover:scale-95 cursor-pointer"
//                     onClick={(e) => { e.stopPropagation(); deleteEvent(event.event_name, event.event_date); }}
//                     alt="Delete"
//                   />
//                 </div>
//                 <img src={event.event_image} alt="Image" className="object-cover w-full h-full" />
//                 <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black  text-white p-2">
//                   <h2 className="text-gray-200 font-semibold truncate">{event.event_name}</h2>
//                 </div>
//               </div>
//               {event.invitation_url && (
//                 <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline">
//                   View Invitation
//                 </a>
//               )}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="text-center text-gray-200 text-2xl ">No events found. Click on + to add events</p>
//       )}

//       <div className="fixed bottom-4 right-4 mr-8 mb-4">
//         <Link to="/CreateEvent" className="p-4 rounded-full shadow-lg text-2xl">
//           <img src="https://img.icons8.com/B48E75/stamp/2x/add.png" alt="add-button"/>
//         </Link>
//       </div>

//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={closeModal}
//         contentLabel="Event Details"
//         className="bg-slate-900 opacity-90 p-4 rounded-lg shadow-lg mx-auto my-8 max-w-2xl w-1/2 h-[90%] overflow-y-auto"
//         overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
//       >
//         {selectedEvent && (
//           <div>
//             <h2 className="text-2xl font-semibold mb-4 text-white">{selectedEvent.event_name}</h2>
//             <div className='relative'>
//               <img 
//                 src="https://img.icons8.com/ffffff/android/2x/edit.png" 
//                 alt="Edit" 
//                 className='absolute top-2 right-2 w-6 h-6 hover:scale-110' 
//                 onClick={handleEditClick}
//               />
//               <img 
//                 src={selectedEvent.event_image} 
//                 alt="Event" 
//                 className="mb-4 w-full h-72 object-cover" 
//               />
//             </div>
//             {editData ? (
//               <form onSubmit={handleFormSubmit}>
//                 <div className='text-white'>
//                   <p className="mb-2 text-gray-400">Event Name: {editData.eventName}</p>
//                   <label className="block mb-2 text-gray-400">Date:</label>
//                   <input 
//                     type="text" 
//                     name="eventDate" 
//                     value={editData.eventDate} 
//                     onChange={handleInputChange} 
//                     className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"
//                   />
//                   <label className="block mb-2 text-gray-400">Invitation Note:</label>
//                   <textarea 
//                     name="invitationNote" 
//                     value={editData.invitationNote} 
//                     onChange={handleInputChange} 
//                     className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"
//                   />
//                   <label className="block mb-2 text-gray-400">Location:</label>
//                   <input 
//                     type="text" 
//                     name="eventLocation" 
//                     value={editData.eventLocation} 
//                     onChange={handleInputChange} 
//                     className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"
//                   />
//                   <label className="block mb-2 text-gray-400">Street:</label>
//                   <input 
//                     type="text" 
//                     name="street" 
//                     value={editData.street} 
//                     onChange={handleInputChange} 
//                     className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"
//                   />
//                   <label className="block mb-2 text-gray-400">City:</label>
//                   <input 
//                     type="text" 
//                     name="city" 
//                     value={editData.city} 
//                     onChange={handleInputChange} 
//                     className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"
//                   />
//                   <label className="block mb-2 text-gray-400">State:</label>
//                   <input 
//                     type="text" 
//                     name="state" 
//                     value={editData.state} 
//                     onChange={handleInputChange} 
//                     className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"
//                   />
//                   <label className="block mb-2 text-gray-400">Pin Code:</label>
//                   <input 
//                     type="text" 
//                     name="pinCode" 
//                     value={editData.pinCode} 
//                     onChange={handleInputChange} 
//                     className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"
//                   />
//                   <label className="block mb-2 text-gray-400">Invitation URL:</label>
//                   <input 
//                     type="text" 
//                     name="invitation_url" 
//                     value={editData.invitation_url} 
//                     onChange={handleInputChange} 
//                     className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"
//                   />
//                 </div>
//                 <button type="submit" className="mt-4 p-2 bg-gray-800 text-white rounded">Save Changes</button>
//               </form>
//             ) : (
//               <div className='text-white'>
//                 <p className="mb-2 text-start text-white">Date: {selectedEvent.event_date}</p>
//                 <p className="mb-2 text-start text-white">: {selectedEvent.invitationNote}</p>
//                 <p className="mb-2 text-start text-white">Location: {selectedEvent.event_location}</p>
//                 <div className='flex text-white space-x-1'>
//                   <p className="mb-2 text-white">Street: {selectedEvent.street},</p>
//                   <p className="mb-2 text-white">City: {selectedEvent.city},</p>
//                   <p className="mb-2 text-white">State: {selectedEvent.state},</p>
//                   <p className="mb-2 text-white">Pin Code: {selectedEvent.pin_code}</p>
//                 </div>
//               </div>
//             )}
//             {selectedEvent.invitation_url && (
//               <a href={selectedEvent.invitation_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
//                 View Invitation
//               </a>
//             )}
//             <button onClick={closeModal} className="mt-4 p-2 bg-gray-800 text-white rounded">Close</button>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default Event;


import React, { useEffect, useState } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

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
  }, [clientName]);

  const deleteEvent = async (eventName, eventDate) => {
    try {
      await API_UTIL.delete(`/deleteEvent/${eventName}/${eventDate}`);
      setEvents(events.filter(event => !(event.event_name === eventName && event.event_date === eventDate)));
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
      const response = await API_UTIL.put(`/updateEvent/${selectedEvent.event_name}/${selectedEvent.event_date}`, editData);
      if (response.status === 200) {
        toast.success('Event updated successfully');
        const updatedEvents = events.map(event => 
          event.event_name === selectedEvent.event_name && event.event_date === selectedEvent.event_date 
            ? { ...event, ...editData, event_date: `${editData.eventDate} ${editData.eventTime}` } 
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

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>;

  return (
    <div className="font-code p-4 min-h-screen">
      <h1 className="text-center my-8 text-4xl font-semibold text-gray-200">Events</h1>
      {events.length > 0 ? (
        <ul className="px-8 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {events.map((event) => (
            <li key={event.event_name}>
              <div className="relative w-full h-56 rounded-md overflow-hidden hover:scale-95 cursor-pointer" onClick={() => openModal(event)}>
                <div className="absolute top-0 right-0 flex justify-end items-center w-full bg-gradient-to-b from-black text-white p-2">
                  <img
                    src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
                    className="w-8 hover:scale-95 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); deleteEvent(event.event_name, event.event_date); }}
                    alt="Delete"
                  />
                </div>
                <img src={event.event_image} alt="Image" className="object-cover w-full h-full" />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black  text-white p-2">
                  <h2 className="text-gray-200 font-semibold truncate">{event.event_name}</h2>
                </div>
              </div>
              {event.invitation_url && (
                <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline">
                  View Invitation
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-200 text-2xl ">No events found. Click on + to add events</p>
      )}

      <div className="fixed bottom-4 right-4 mr-8 mb-4">
        <Link to="/CreateEvent" className="p-4 rounded-full shadow-lg text-2xl">
          <img src="https://img.icons8.com/B48E75/stamp/2x/add.png" alt="add-button"/>
        </Link>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Event Details"
        className="bg-slate-900 opacity-90 p-4 rounded-lg shadow-lg mx-auto my-8 max-w-2xl w-1/2 h-[90%] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        {selectedEvent && (
          <div>
            <div className='flex justify-between'>
            <h2 className="text-2xl font-semibold mb-4 text-white">{selectedEvent.event_name}</h2>
            <button className='mb-4' onClick={closeModal}>Close</button>
            </div>
            <div className='relative'>
              <img 
                src="https://img.icons8.com/ffffff/android/2x/edit.png" 
                alt="Edit" 
                className='absolute top-2 right-2 w-6 h-6 hover:scale-110 hover:bg-slate-700 rounded-md' 
                onClick={handleEditClick}
              />
              <img 
                src={selectedEvent.event_image} 
                alt="Event" 
                className="mb-4 w-full h-72 object-cover" 
              />
            </div>
            {editData ? (
              <form onSubmit={handleFormSubmit}>
                <div className='text-white'>
                  <p className="mb-2 text-gray-400">Event Name: {editData.eventName}</p>
                  <div className='flex space-x-1'>
                  <label className="mb-2 text-gray-400 py-2">Date:</label>
                  <p className='className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-900"'>{editData.eventDate}</p>
                  </div>
                  
                  <label className="block mb-2 text-gray-400">Invitation Note:</label>
                  <textarea 
                    name="invitationNote" 
                    value={editData.invitationNote} 
                    onChange={handleInputChange} 
                    className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-700"
                  />
                  <label className="block mb-2 text-gray-400">Location:</label>
                  <input 
                    type="text" 
                    name="eventLocation" 
                    value={editData.eventLocation} 
                    onChange={handleInputChange} 
                    className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-700"
                  />
                  <label className="block mb-2 text-gray-400">Street:</label>
                  <input 
                    type="text" 
                    name="street" 
                    value={editData.street} 
                    onChange={handleInputChange} 
                    className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-700"
                  />
                  <label className="block mb-2 text-gray-400">City:</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={editData.city} 
                    onChange={handleInputChange} 
                    className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-700"
                  />
                  <label className="block mb-2 text-gray-400">State:</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={editData.state} 
                    onChange={handleInputChange} 
                    className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-700"
                  />
                  <label className="block mb-2 text-gray-400">Pin Code:</label>
                  <input 
                    type="text" 
                    name="pinCode" 
                    value={editData.pinCode} 
                    onChange={handleInputChange} 
                    className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-700"
                  />
                  <label className="block mb-2 text-gray-400">Invitation URL:</label>
                  <input 
                    type="text" 
                    name="invitation_url" 
                    value={editData.invitation_url} 
                    onChange={handleInputChange} 
                    className="mb-4 p-2 w-full rounded text-gray-200 bg-slate-700"
                  />
                </div>
                <button type="submit" className="p-2 bg-gray-800 text-white rounded mx-[40%]">Save Changes</button>
              </form>
            ) : (
              <div className='text-white'>
                <p className="mb-2 text-start text-white">Date: {selectedEvent.event_date.split(' ')[0]}</p>
                <p className="mb-2 text-start text-white">Time: {selectedEvent.event_date.split(' ')[1]}</p>
                <p className="mb-2 text-start text-white">Invitation Note: {selectedEvent.invitation_note}</p>
                <p className="mb-2 text-start text-white">Location: {selectedEvent.event_location}</p>
                <div className='flex text-white space-x-1'>
                  <p className="mb-2 text-white">Street: {selectedEvent.street},</p>
                  <p className="mb-2 text-white">City: {selectedEvent.city},</p>
                  <p className="mb-2 text-white">State: {selectedEvent.state},</p>
                  <p className="mb-2 text-white">Pin Code: {selectedEvent.pin_code}</p>
                </div>
              </div>
            )}
            {selectedEvent.invitation_url && (
              <a href={selectedEvent.invitation_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                View Invitation
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Event;
