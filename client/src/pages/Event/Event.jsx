import React, { useEffect, useState } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AppBar from '../../components/AppBar/AppBar';
import Footer from '../../components/Footer/Footer';
import './Event.css'; // Import the new CSS file

const Event = () => {
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const [displayNone, setDisplayNone] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const userPhoneNumber = sessionStorage.getItem('userphoneNumber');
  const [eventToDelete, setEventToDelete] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    projectName: '',
    invitationNote: '',
    eventImage: null
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [userFormData, setUserFormData] = useState({
    user_name: '',
    social_media: {
      instagram: '',
      youtube: ''
    },
    org_name: ''
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    
    const fetchProjects = async (clientName) => {
      try {
        const response = await API_UTIL.get(`/getProjectDetails/${clientName}`);
        if (response.status === 200) {
          setProjects(response.data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      }
    };
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
        setUserDetails(response.data.data);
  
        if (response.data.data.user_name === userPhoneNumber) {
          setIsUserDetailsModalOpen(true); // Open the modal to collect user details
        } else {
          fetchEventData(response.data.data.user_name);
          fetchProjects(response.data.data.user_name);
        }
  
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setLoading(false);
      }
    };
  
    fetchUserDetails();
  }, [userPhoneNumber]);
  
  const fetchEventData = async (userName) => {
    try {
      const response = await API_UTIL.get(`/getClientEventDetails/${userName}`);
      

      // Fetch collaboration-accepted events
      const collabResponse = await API_UTIL.get(`/getCollabEvents/${userName}`);
      const allEvents = [...response.data, ...collabResponse.data];
      const uniqueEvents = allEvents.reduce((acc, current) => {
        const x = acc.find(item => item.event_id === current.event_id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      setEvents(uniqueEvents);

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  const onEventClick = (event_id) => {
    navigate(`/eventDetails/${event_id}`, { state: { userDetails } })
  };
  
  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const deleteEvent = async (eventId) => {
    try {
      await API_UTIL.delete(`/deleteEvent/${eventId}`);
      setEvents(events.filter(event => !(event.event_id === eventId)));
      setIsDeleteModalOpen(false);
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error('Failed to delete the event. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    // // Parse the time
    // let [time, modifier] = formData.eventTime.split(' ');
    // let [hours, minutes] = time.split(':');

    // if (hours === '12') {
    //   hours = '00';
    // }
    // if (modifier === 'PM') {
    //   hours = parseInt(hours, 10) + 12;
    // }

    // // Ensure both hours and minutes are two digits
    // hours = String(hours).padStart(2, '0');
    // minutes = String(minutes).padStart(2, '0');

    const combinedDateTime = `${formData.eventDate}T${formData.eventTime}:00`;

    setUploading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('eventName', formData.eventName);
    formDataToSend.append('eventDate', combinedDateTime);
    formDataToSend.append('eventLocation', formData.eventLocation);
    formDataToSend.append('projectName', formData.projectName);
    formDataToSend.append('clientName', userDetails.user_name);
    formDataToSend.append('invitationNote', formData.invitationNote);
    if (selectedFile) {
      formDataToSend.append('eventImage', selectedFile);
    }

    console.log(formDataToSend);

    try {
      const response = await API_UTIL.post('/saveEventDetails', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to save the event');
      }
      toast.success('Events created successfully');
      setEvents([...events, response.data.data]);
      setTimeout(() => {
       setIsCreateModalOpen(false);
      }, 1000);
      return response;
    } catch (error) {
      console.error('Error saving form data to backend:', error);
      toast.error('Failed to save the events. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  const handleNewProjectChange = (e) => {
    setNewProjectName(e.target.value);
  };

  const handleCreateProject = async () => {
    if (!newProjectName) {
      toast.error('Please enter a project name.');
      return;
    }

    try {
      const response = await API_UTIL.post('/saveProjectDetails', { projectName: newProjectName, clientName: userDetails.user_name });
      setProjects([response.data.data, ...projects]);
      setFormData({ ...formData, projectName: response.data.data.project });
      setNewProjectName('');
      setShowNewProjectInput(false);
      console.log(projects);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setDisplayNone(!displayNone);
    }
  };

  const handleUserDetailsSubmit = async (e) => {
      e.preventDefault();
      try {
        
        const requestData = {
          user_phone_number: userPhoneNumber,
          ...userFormData
        };
  
        console.log('Sending request to server with data:', requestData);
  
        const res = await API_UTIL.post("/updatePortfolioDetails", requestData);
        if (res.status === 200) {
          setIsUserDetailsModalOpen(false);
          fetchEventData(res.data.data.user_name)

        }
      } catch (error) {
        console.error("Error in registering the model:", error);
        if (error.response) {
          toast.error("Error in creating Model");
        }
      }
    };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (error) return <div className="loading-screen">Error: {error}</div>;

  return (
    <div className='events-page-root'>
      <AppBar />
      <div className="events-page-event-container">
        <h1 className="events-page-event-title">My Events</h1>
        <div className="events-page-event-list">
          <div className="events-page-create-event-card" onClick={() => setIsCreateModalOpen(true)}>
            <div className="events-page-add-event-image-div">
              <img
                src="assets\Images\icon-plus.svg"
                alt="img"
              />
            </div>
              <span >Click here to Add Project</span>
          </div>
          {events.map((event) => (
            <div className='events-page-event-card' onClick={() => onEventClick(event.event_id)}>
               <div className="event-card-header">
                  <img
                    src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(event);
                    }}
                    alt="Delete"
                  />
                </div>
                <img src={event.event_image} alt="img"></img>
                <div className='event-name'>
                  <span>
                  {event?.event_name}
                  </span>
                </div>
            </div>
          ))}



          {/* {events.map((event) => (
            <div key={event.event_name} className="event-item">
              <div
                className="event-card"
                onClick={() => onEventClick(event.event_name)}
              >
                <div className="event-card-header">
                  <img
                    src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(event);
                    }}
                    alt="Delete"
                  />
                </div>
                <img
                  src={event.event_image}
                  alt="img"
                  className="event-image"
                />
                <div className="event-card-footer">
                  <h2 className="event-name">
                    {formatEventName(event?.event_name)}
                  </h2>
                </div>
              </div>
              {event.invitation_url && (
                <a
                  href={event.invitation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-link"
                >
                  View Invitation
                </a>
              )}
            </div>
          ))} */}
        </div>

        {/* Modal to update user details */}
        <Modal
            isOpen={isUserDetailsModalOpen}
            onRequestClose={() => setIsUserDetailsModalOpen(false)}
            contentLabel="User Details"
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            <div className="modal-header">
              <h2 className="modal-title">User Details</h2>
              <button className="close-button" onClick={() => setIsUserDetailsModalOpen(false)}>x</button>
            </div>
            <form className="modal-body" onSubmit={handleUserDetailsSubmit}>
              <div className="form-group">
                <label htmlFor="userName">User Name:</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={userFormData.org_name}
                  onChange={(e) => setUserFormData({ ...userFormData, org_name: e.target.value })}
                  placeholder="Enter your photography name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="instagram">Instagram URL:</label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={userFormData.social_media.instagram}
                  onChange={(e) => setUserFormData({ ...userFormData, social_media: { ...userFormData.social_media, instagram: e.target.value } })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="youtube">YouTube URL:</label>
                <input
                  type="text"
                  id="youtube"
                  name="youtube"
                  value={userFormData.social_media.youtube}
                  onChange={(e) => setUserFormData({ ...userFormData, social_media: { ...userFormData.social_media, youtube: e.target.value } })}
                />
              </div>
              <button type="submit" className="save-button">Save</button>
              
              <div style={{ textAlign: 'center', margin: '10px 0' }}>or</div>
              
              <button 
                type="button" 
                className="create-portfolio-button" 
                onClick={() => navigate('/portfolioForm')}
              >
                Create Portfolio
              </button>
            </form>
          </Modal>
           {/* Modal to delete event*/}
          <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeDeleteModal}
          contentLabel="Delete Confirmation"
          className="delete-modal-content"
          overlayClassName="modal-overlay"
        >
          <div className="delete-modal-bg">
            <h2 className="modal-title">Confirm Delete</h2>
            <p className="modal-body">Do you want to delete this event?</p>
            <div className="modal-footer">
              <button
                className="delete-button"
                onClick={() =>
                  deleteEvent(
                    eventToDelete.event_id
                  )
                }
              >
                Confirm
              </button>
              <button className="cancel-button" onClick={closeDeleteModal}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      

        {/* Create Event Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onRequestClose={() => setIsCreateModalOpen(false)}
          contentLabel="Create Event"
          className="modal-content"
          overlayClassName="modal-overlay"
        >
          <div className="modal-header">
            <h2 className="modal-title">Create Event</h2>
            <button className="close-button" onClick={() => setIsCreateModalOpen(false)}>x</button>
          </div>
          <div className="create-event-container">
            <form className="invitation-form" id="invitation-form" onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label htmlFor="event-name">Event Name:</label>
                <input
                  type="text"
                  id="event-name"
                  name="eventName"
                  placeholder="Event Name"
                  value={formData.eventName}
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
                <input
                  type="time"
                  id="event-time"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event-location">Event Location:</label>
                <input
                  type="text"
                  id="event-location"
                  name="eventLocation"
                  placeholder="Event Location"
                  value={formData.eventLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="project-name">Project Name:</label>
                <select
                  id="project-name"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((project, index) => (
                    <option key={index} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Create New Project</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProjectInput(!showNewProjectInput);
                    setDisplayNone(!displayNone);
                  }}
                  className={`add-project-button${displayNone ? "hide" : ""}`}
                >
                  +
                </button>
                {showNewProjectInput && (
                  <div className="new-project-input">
                    <input
                      type="text"
                      placeholder="New Project Name"
                      value={newProjectName}
                      onChange={handleNewProjectChange}
                    />
                    <button type="button" onClick={handleCreateProject} className="save-project-button">
                      Save
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="invitation-note">Invitation Note:</label>
                <textarea
                  id="invitation-note"
                  name="invitationNote"
                  placeholder="Invitation Note"
                  value={formData.invitationNote}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="event-image">Upload Image:</label>
                <input
                  type="file"
                  id="event-image"
                  name="eventImage"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <button className="submit-button" type="submit" disabled={uploading}>
                {uploading ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        </Modal>
      </div>
      <Footer />
    </div>
  );
}

export default Event;
