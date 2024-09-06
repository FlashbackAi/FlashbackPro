import React, { useEffect, useState } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AppBar from '../../components/AppBar/AppBar';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import './Event.css';
import LabelAndInput from '../../components/molecules/LabelAndInput/LabelAndInput';
import { X } from 'lucide-react';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [attendedEvents, setAttendedEvents] = useState([]); // New state for attended flashbacks
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const [displayNone, setDisplayNone] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('myFlashbacks'); // New state for managing tab selection
  const userPhoneNumber = localStorage.userPhoneNumber;
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

  useEffect(() => {
    const loadDefaultImage = async () => {
      try {
        const response = await fetch('assets/Images/event-card.jpg');
        const blob = await response.blob();
        const defaultImageFile = new File([blob], 'event-card.jpg', { type: 'image/jpeg' });
        setSelectedFile(defaultImageFile);
      } catch (error) {
        console.error('Error loading default image:', error);
      }
    };

    loadDefaultImage();
  }, []);

  const [userFormData, setUserFormData] = useState({
    user_name: '',
    social_media: {
      instagram: '',
      youtube: ''
    },
    org_name: '',
    role: 'creator'
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

        // if (response.data.data.user_name === userPhoneNumber) {
        //   setIsUserDetailsModalOpen(true);
        // } else {
          fetchEventData(response.data.data.user_name);
          fetchProjects(response.data.data.user_name);
        // }
        setTimeout(() => {
          setLoading(false);
        }, 250);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setTimeout(() => {
          setLoading(false);
        }, 250);
      }
    };

    fetchUserDetails();
  }, [userPhoneNumber]);

  const fetchEventData = async (userName) => {
    try {
      const response = await API_UTIL.get(`/getClientEventDetails/${userName}`);
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

      // Fetch attended flashbacks (add your API call here)
      const attendedResponse = await API_UTIL.get(`/getUserAttendedEvents/${userPhoneNumber}`);
      setAttendedEvents(attendedResponse.data);


    } catch (error) {
      setError(error.message);
      throw Error("Error in fetching Events info");
    }
  };

  const onEventClick = (event_id) => {
    navigate(`/eventDetails/${event_id}`, { state: { userDetails } });
  };
  const onAttendEventClick = (event_id) => {
    navigate(`/photosV1/${event_id}/${userDetails.user_id}`, { state: { userDetails } });
  };
  
  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };
  
  const openCreateEventModal = () => {
    console.log("userEvent")
    if (userDetails.user_name === userPhoneNumber) {
        setIsUserDetailsModalOpen(true);
    }
    else{
      setIsCreateModalOpen(true); 
    }
   
  };

  const deleteEvent = async (eventId) => {
    try {
      await API_UTIL.delete(`/deleteEvent/${eventId}/${userPhoneNumber}`);
      setEvents(events.filter(event => !(event.event_id === eventId)));
      setIsDeleteModalOpen(false);
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
    setSelectedFile(e.target.files[0]);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

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
      setEvents([...events, response.data.data]);
      setIsCreateModalOpen(false);
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
        // fetchEventData(res.data.data.user_name);
        setIsCreateModalOpen(true); 
      }
    } catch (error) {
      console.error("Error in registering the model:", error);
      if (error.response) {
        toast.error("Error in creating Model");
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="loading-screen">Error: {error}</div>;

  return (
    <div className="events-page-root">
      <AppBar />
      <div className="events-page-event-container">
       
        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button onClick={() => setSelectedTab('myFlashbacks')} className={`tab-switch-button ${selectedTab === 'myFlashbacks' ? 'active' : ''}`}>
            My Flashbacks
          </button>
          <button onClick={() => setSelectedTab('attendedFlashbacks')} className={`tab-switch-button ${selectedTab === 'attendedFlashbacks' ? 'active' : ''}`}>
            Attended Flashbacks
          </button>
        </div>

        {/* Content based on selected tab */}
        <div className="events-page-event-list">
          {selectedTab === 'myFlashbacks' ? (
            <>
              <div
                className="events-page-create-event-card"
                // onClick={() => setIsCreateModalOpen(true)}
                onClick={ openCreateEventModal}
              >
                <div className="events-page-add-event-image-div">
                  <img src="assets/Images/icon-plus.svg" alt="img" />
                </div>
                <span>Click here to Add Project</span>
              </div>
              {events.map((event) => (
                <div
                  className="events-page-event-card"
                  key={event.event_id} // Add key to each event card
                  onClick={() => onEventClick(event.event_id)}
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
                  <img src={event.event_image} alt="img" />
                  <div className="event-name">
                    <span>{event?.event_name}</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {attendedEvents.length > 0 ? ( // Check if there are attended events
                  attendedEvents.map((event) => (
                    <div
                      className="events-page-event-card"
                      key={event.event_id} // Add key to each event card
                      onClick={() => onAttendEventClick(event.folder_name)}
                    >
                      <img src={event.event_image} alt="img" />
                      <div className="event-name">
                        <span>{event?.event_name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No Attended Events</p> // Display message if no attended events
                )}
            </>
          )}
        </div>

        {/* Modal to update user details */}
        <Modal
          isOpen={isUserDetailsModalOpen}
          contentLabel="User Details"
          className="modal-content event-modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-header">
            <h2 className="modal-title">User Details</h2>
          </div>
          <form className="modal-body" onSubmit={handleUserDetailsSubmit}>
            <div className="form-group">
              <LabelAndInput
                label="User Name:"
                type="text"
                htmlFor="userName"
                id="userName"
                name="userName"
                value={userFormData.org_name}
                handleChange={(e) =>
                  setUserFormData({ ...userFormData, org_name: e.target.value })
                }
                placeholder="Enter your photography name"
                isRequired={true}
                isEditable={true}
              ></LabelAndInput>
            </div>
            <div className="form-group">
              <LabelAndInput
                htmlFor="instagram"
                label="Instagram URL:"
                type="text"
                id="instagram"
                name="instagram"
                value={userFormData.social_media.instagram}
                handleChange={(e) =>
                  setUserFormData({
                    ...userFormData,
                    social_media: {
                      ...userFormData.social_media,
                      instagram: e.target.value,
                    },
                  })
                }
                isEditable={true}
              ></LabelAndInput>
            </div>
            <div className="form-group">
              <LabelAndInput
                htmlFor="youtube"
                label="YouTube URL:"
                type="text"
                id="youtube"
                name="youtube"
                value={userFormData.social_media.youtube}
                handleChange={(e) =>
                  setUserFormData({
                    ...userFormData,
                    social_media: {
                      ...userFormData.social_media,
                      youtube: e.target.value,
                    },
                  })
                }
                isEditable={true}
              ></LabelAndInput>
            </div>
            <div style={{ textAlign: "center", margin: "10px 0", display: "flex", flexDirection: 'column', color: "#000000", rowGap: "1rem" }}>
              <button type="submit" className="save-button">
                Save
              </button>
              or
              <button
                type="button"
                className="create-portfolio-button"
                onClick={() => navigate("/portfolioForm")}
              >
                Create Portfolio
              </button>
            </div>
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
                onClick={() => deleteEvent(eventToDelete.event_id)}
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
          className="modal-content event-modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-header">
            <h2 className="modal-title">Create Event</h2>
            <X
              className="close-button"
              onMouseEnter={(e) => {
                e.preventDefault();
              }}
              onClick={() => setIsCreateModalOpen(false)}
            >
            </X>
          </div>
          <div className="create-event-container">
            <form
              className="invitation-form"
              id="invitation-form"
              onSubmit={handleCreateEvent}
            >
              <div className="form-group">
                <LabelAndInput
                  label={"Event Name:"}
                  id="event-name"
                  type={"text"}
                  name={"eventName"}
                  placeholder={"Event Name"}
                  value={formData.eventName}
                  handleChange={handleInputChange}
                  isRequired={true}
                  isEditable={true}
                ></LabelAndInput>
              </div>
              <div className="form-group">
                <LabelAndInput
                  htmlFor="event-date"
                  label={"Event Date:"}
                  type={"date"}
                  name={"eventDate"}
                  id="event-date"
                  value={formData.eventDate}
                  handleChange={handleInputChange}
                  isRequired={false}
                  isEditable={true}
                ></LabelAndInput>
              </div>
              <div className="form-group">
                <LabelAndInput
                  label={"Event Time:"}
                  type={"time"}
                  name={"eventTime"}
                  value={formData.eventTime}
                  handleChange={handleInputChange}
                  isRequired={false}
                  isEditable={true}
                ></LabelAndInput>
              </div>
              <div className="form-group">
                <LabelAndInput
                  label={"Event Location:"}
                  type="text"
                  id="event-location"
                  name="eventLocation"
                  placeholder="Event Location"
                  value={formData.eventLocation}
                  handleChange={handleInputChange}
                  isRequired={false}
                  isEditable={true}
                ></LabelAndInput>
              </div>
              <div className="form-group">
                <label htmlFor="project-name">Project Name:</label>
                <select
                  id="project-name"
                  name="projectName"
                  className='select-project'
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
                  className={`add-project-button ${displayNone ? "hide" : ""}`}
                >
                  {!showNewProjectInput ? "+" : "x"}
                </button>
                {showNewProjectInput && (
                  <div className="new-project-input">
                    <input
                      type="text"
                      placeholder="New Project Name"
                      value={newProjectName}
                      onChange={handleNewProjectChange}
                    />
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      className="save-project-button"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <LabelAndInput
                  label={"Invitation Note:"}
                  name="invitationNote"
                  placeholder="Invitation Note"
                  value={formData.invitationNote}
                  handleChange={handleInputChange}
                  isRequired={false}
                  isEditable={true}
                ></LabelAndInput>
              </div>
              <div className="form-group">
                <LabelAndInput 
                  label={"Upload Image:"}
                  type="file"
                  id="event-image"
                  name="eventImage"
                  accept="image/*"
                  handleChange={handleFileChange}
                  isEditable={true}
                ></LabelAndInput>
              </div>
              <button
                className="submit-button create-event-button"
                type="submit"
                disabled={uploading}
              >
                {uploading ? "Creating..." : "Create"}
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
