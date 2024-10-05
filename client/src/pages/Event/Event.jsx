import React, { useEffect, useState } from 'react';
import API_UTIL from '../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import AppBar from '../../components/AppBar/AppBar';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import LabelAndInput from '../../components/molecules/LabelAndInput/LabelAndInput';
import { X, Plus, Calendar, MapPin, Clock, Trash2 } from 'lucide-react';
import ClaimRewardsPopup from '../../components/ClaimRewardsPopup/ClaimRewardsPopup';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #121212;
  color: #ffffff;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 2rem;
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const TabSwitcher = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background-color: #1e1e1e;
  border-radius: 0.5rem;
  padding: 0.5rem;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.active ? '#ffffff' : '#a0a0a0'};
  padding: 0.5rem 1rem;
  position: relative;
  cursor: pointer;
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #00ffff;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.3s ease;
  }
`;

const EventGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const EventCard = styled(motion.div)`
  background-color: #1e1e1e;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const EventImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const EventInfo = styled.div`
  padding: 1rem;
`;

const EventName = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: #ffffff;
`;

const EventDetail = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #a0a0a0;
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }
`;

const CreateEventCard = styled(motion.div)`
  background-color: #1e1e1e;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 2rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const PlusIcon = styled(Plus)`
  width: 3rem;
  height: 3rem;
  color: #00ffff;
  margin-bottom: 1rem;
`;

const CreateEventText = styled.p`
  font-size: 1rem;
  color: #ffffff;
  text-align: center;
`;

const StyledModal = styled(Modal)`
  &.modal-content {
    background-color: #1e1e1e;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    margin: 2rem auto;
    outline: none;
    color: #ffffff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-overlay {
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;


const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #ffffff;
`;

const CloseButton = styled(X)`
  cursor: pointer;
  color: #a0a0a0;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const SubmitButton = styled.button`
  background: linear-gradient(90deg, #66d3ff, #9a6aff 38%, #ee75cb 71%, #fd4d77);
  color: #ffffff;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(Trash2)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.25rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 10;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: #2a2a2a;
  color: #ffffff;
  border: 1px solid #3a3a3a;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: #2a2a2a;
  color: #ffffff;
  border: 1px solid #3a3a3a;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: #2a2a2a;
  color: #ffffff;
  border: 1px solid #3a3a3a;
  resize: vertical;
`;

const Label = styled.label`
  color: #ffffff;
  margin-bottom: 0.25rem;
`;

const Event = () => {
  const [events, setEvents] = useState([]);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const [displayNone, setDisplayNone] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('myFlashbacks');
  const userPhoneNumber = localStorage.userPhoneNumber;
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(true);
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
    org_name: '',
    role: 'creator'
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

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
        fetchEventData(response.data.data.user_name);
        fetchProjects(response.data.data.user_name);
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
    if (userDetails.user_name === userPhoneNumber) {
        setIsUserDetailsModalOpen(true);
    } else {
      setIsCreateModalOpen(true); 
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await API_UTIL.delete(`/deleteEvent/${eventId}/${userPhoneNumber}`);
      setEvents(events.filter(event => event.event_id !== eventId));
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

  const closeClaimPopup = () => {
    setIsClaimPopupOpen(false);
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

      const res = await API_UTIL.post("/updatePortfolioDetails", requestData);
      if (res.status === 200) {
        setUserDetails(res.data.data);
        setIsUserDetailsModalOpen(false);
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
    <PageWrapper>
      <AppBar showCoins={true} />
      <ClaimRewardsPopup isOpen={isClaimPopupOpen} onClose={closeClaimPopup} />
      <ContentWrapper>
        <TabSwitcher>
          <TabButton
            active={selectedTab === 'myFlashbacks'}
            onClick={() => setSelectedTab('myFlashbacks')}
          >
            My Flashbacks
          </TabButton>
          <TabButton
            active={selectedTab === 'attendedFlashbacks'}
            onClick={() => setSelectedTab('attendedFlashbacks')}
          >
            Attended Flashbacks
          </TabButton>
        </TabSwitcher>

        <AnimatePresence mode="wait">
          {selectedTab === 'myFlashbacks' && (
            <EventGrid
              key="myFlashbacks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CreateEventCard onClick={openCreateEventModal}>
                <PlusIcon />
                <CreateEventText>Create New Event</CreateEventText>
              </CreateEventCard>
              {events.map((event) => (
                <EventCard
                  key={event.event_id}
                  onClick={() => onEventClick(event.event_id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <EventImage src={event.event_image} alt={event.event_name} />
                  <EventInfo>
                    <EventName>{event.event_name}</EventName>
                    <EventDetail>
                    <Calendar size={16} />
                      {event.event_date && !isNaN(Date.parse(event.event_date)) 
                        ? new Date(event.event_date).toLocaleDateString() 
                        : 'Date not set'}
                    </EventDetail>
                    <EventDetail>
                    <Clock size={16} />
                      {event.event_date && !isNaN(Date.parse(event.event_date)) 
                        ? new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : 'Time not set'}
                    </EventDetail>
                    <EventDetail>
                      <MapPin size={16} />
                      {event.event_location || 'Location not set'}
                    </EventDetail>
                  </EventInfo>
                  <DeleteButton onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(event);
                  }} />
                </EventCard>
              ))}
            </EventGrid>
          )}

          {selectedTab === 'attendedFlashbacks' && (
            <EventGrid
              key="attendedFlashbacks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {attendedEvents.length > 0 ? (
                attendedEvents.map((event) => (
                  <EventCard
                    key={event.event_id}
                    onClick={() => onAttendEventClick(event.folder_name)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <EventImage src={event.event_image} alt={event.event_name} />
                    <EventInfo>
                      <EventName>{event.event_name}</EventName>
                    </EventInfo>
                  </EventCard>
                ))
              ) : (
                <p>No Attended Events</p>
              )}
            </EventGrid>
          )}
        </AnimatePresence>
      </ContentWrapper>

      {/* User Details Modal */}
      <StyledModal
        isOpen={isUserDetailsModalOpen}
        onRequestClose={() => setIsUserDetailsModalOpen(false)}
        contentLabel="User Details"
      >
        <ModalHeader>
          <ModalTitle>User Details</ModalTitle>
          <CloseButton onClick={() => setIsUserDetailsModalOpen(false)} />
        </ModalHeader>
        <Form onSubmit={handleUserDetailsSubmit}>
          <LabelAndInput
            label="User Name:"
            type="text"
            id="userName"
            name="userName"
            value={userFormData.org_name}
            handleChange={(e) =>
              setUserFormData({ ...userFormData, org_name: e.target.value })
            }
            placeholder="Enter your photography name"
            isRequired={true}
            isEditable={true}
          />
          <LabelAndInput
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
          />
          <LabelAndInput
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
          />
          <SubmitButton type="submit">Save</SubmitButton>
          <SubmitButton type="button" onClick={() => navigate("/portfolioForm")}>
            Create Portfolio
          </SubmitButton>
        </Form>
      </StyledModal>

      {/* Delete Confirmation Modal */}
      <StyledModal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Confirmation"
      >
        <ModalHeader>
          <ModalTitle>Confirm Delete</ModalTitle>
          <CloseButton onClick={closeDeleteModal} />
        </ModalHeader>
        <p>Do you want to delete this event?</p>
        <SubmitButton onClick={() => deleteEvent(eventToDelete.event_id)}>Confirm</SubmitButton>
        <SubmitButton onClick={closeDeleteModal}>Cancel</SubmitButton>
      </StyledModal>

      {/* Create Event Modal */}
      <StyledModal
        isOpen={isCreateModalOpen}
        onRequestClose={() => setIsCreateModalOpen(false)}
        contentLabel="Create Event"
      >
        <ModalHeader>
          <ModalTitle>Create Event</ModalTitle>
          <CloseButton onClick={() => setIsCreateModalOpen(false)} />
        </ModalHeader>
        <Form onSubmit={handleCreateEvent}>
          <div>
            <Label htmlFor="eventName">Event Name:</Label>
            <Input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
          <Label htmlFor="eventDate">Event Date:</Label>
            <Input
              type="date"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="eventTime">Event Time:</Label>
            <Input
              type="time"
              id="eventTime"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="eventLocation">Event Location:</Label>
            <Input
              type="text"
              id="eventLocation"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="projectName">Project Name:</Label>
            <Select
              id="projectName"
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
            </Select>
          </div>
          <div>
            <Label>Create New Project</Label>
            <SubmitButton
              type="button"
              onClick={() => {
                setShowNewProjectInput(!showNewProjectInput);
                setDisplayNone(!displayNone);
              }}
            >
              {!showNewProjectInput ? "+" : "x"}
            </SubmitButton>
            {showNewProjectInput && (
              <div>
                <Input
                  type="text"
                  placeholder="New Project Name"
                  value={newProjectName}
                  onChange={handleNewProjectChange}
                />
                <SubmitButton type="button" onClick={handleCreateProject}>
                  Save
                </SubmitButton>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="invitationNote">Invitation Note:</Label>
            <TextArea
              id="invitationNote"
              name="invitationNote"
              value={formData.invitationNote}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="eventImage">Upload Image:</Label>
            <Input
              type="file"
              id="eventImage"
              name="eventImage"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <SubmitButton type="submit" disabled={uploading}>
            {uploading ? "Creating..." : "Create"}
          </SubmitButton>
        </Form>
      </StyledModal>

      <Footer />
    </PageWrapper>
  );
}

export default Event;