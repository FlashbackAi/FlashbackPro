import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import API_UTIL from '../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AppBar from '../../components/AppBar/AppBar';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import LabelAndInput from '../../components/molecules/LabelAndInput/LabelAndInput';
import ClaimRewardsPopup from '../../components/ClaimRewardsPopup/ClaimRewardsPopup';
import { X, Plus, Calendar, MapPin, Clock, Trash2, CheckCircle } from 'lucide-react';
import ProfilePanel from '../../components/ProfilePanel/ProfilePanel';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #121212;
  overflow: hidden;
  color: #ffffff;
  z-index: 0;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
  z-index: 0;
`;

const ContentWrapper = styled(motion.div)`
  flex: 1;
  padding: 2rem;
  margin-left: ${({ isPanelOpen }) => (isPanelOpen ? '320px' : '0')};
  transition: margin-left 0.3s ease;
  overflow-y: auto;
  height: calc(100vh - 60px); // Adjust based on your AppBar height

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const TabContent = styled(motion.div)`
  background: #1e1e1e;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
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
  color: ${props => props.active ? '#00ffff' : '#a0a0a0'};
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
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
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
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
  box-shadow: 0 0 2px rgba(0, 255, 255, 0.5);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
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

const DeleteButton = styled(Trash2)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: #ffffff;
  background: #2a2a2a;
  padding: 0.25rem;
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }
`;

const DeleteMessage = styled.p`
  text-align: center;
  margin: 1rem 0;
`;

const SuccessIcon = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;


const BaseModalContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 1rem;
  padding: 2rem;
  outline: none;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const UserDetailsModalContent = styled(BaseModalContent)`
  max-width: 400px;
  width: 90%;
`;

const DeleteModalContent = styled(BaseModalContent)`
  max-width: 300px;
  width: 90%;
`;

const CreateEventModalContent = styled(BaseModalContent)`
  max-width: 800px;
  width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #00ffff;
  margin: 0;
`;


const CloseButton = styled.button`
  background: #2a2a2a;
  border: 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ffffff;

    &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    transform: scale(1.03);
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  background-color: #ffffff;
  border: 1px solid #3a3a3a;
  color: #000000;
  padding: 0.5rem;
  border-radius: 4px;
`;

const Select = styled.select`
  background-color: #ffffff;
  border: 1px solid #3a3a3a;
  color: #000000;
  padding: 0.5rem;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  background-color: #ffffff;
  border: 1px solid #3a3a3a;
  color: #000000;
  padding: 0.5rem;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
`;

const SubmitButton = styled.button`
  background-color: #2a2a2a;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  grid-column: 1 / -1;

  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    transform: scale(1.03);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProjectButton = styled.button`
  background: #2a2a2a;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ffffff;
  font-weight: bold;
  margin-top: 12px; // Add margin-top to create space from the text box

  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    transform: scale(1.03);
  }
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
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(false);
  const userPhoneNumber = localStorage.userPhoneNumber;
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const navigate = useNavigate();

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
      setDeleteMessage("Deleting event...");
      await API_UTIL.delete(`/deleteEvent/${eventId}/${userPhoneNumber}`);
      setEvents(events.filter(event => event.event_id !== eventId));
      setDeleteMessage("Delete successful");
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setIsDeleteModalOpen(false);
        setDeleteMessage("");
        setShowSuccessAnimation(false);
      }, 2000);
    } catch (error) {
      console.error("Error deleting event:", error);
      setDeleteMessage("Failed to delete the event. Please try again.");
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
  if (error) return <div>Error: {error}</div>;

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <PageWrapper>
      <AppBar showCoins={true} />
      <ClaimRewardsPopup isOpen={isClaimPopupOpen} onClose={closeClaimPopup} />
      <MainContent>
      <ProfilePanel 
          userDetails={userDetails} 
          isOpen={isPanelOpen} 
          togglePanel={togglePanel}
        />
      <ContentWrapper
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        isPanelOpen={isPanelOpen}
      >
        <TabContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
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
              Tagged Flashbacks
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
        </TabContent>
      </ContentWrapper>
      </MainContent>

      {/* User Details Modal */}
      <Modal
        isOpen={isUserDetailsModalOpen}
        onRequestClose={() => setIsUserDetailsModalOpen(false)}
        contentLabel="User Details"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <UserDetailsModalContent>
        <ModalHeader>
          <ModalTitle>User Details</ModalTitle>
          <CloseButton onClick={() => setIsUserDetailsModalOpen(false)}>×</CloseButton>
        </ModalHeader>
        <Form onSubmit={handleUserDetailsSubmit}>
          <FormGroup>
            <LabelAndInput
              label="User Name:"
              type="text"
              id="userName"
              name="userName"
              value={userFormData.org_name}
              handleChange={(e) => setUserFormData({ ...userFormData, org_name: e.target.value, user_name: e.target.value })}
              placeholder="Enter your User name"
              isRequired={true}
              isEditable={true}
            />
          </FormGroup>
          {/* <FormGroup>
            <LabelAndInput
              label="Instagram URL:"
              type="text"
              id="instagram"
              name="instagram"
              value={userFormData.social_media.instagram}
              handleChange={(e) => setUserFormData({
                ...userFormData,
                social_media: {
                  ...userFormData.social_media,
                  instagram: e.target.value,
                },
              })}
              isEditable={true}
            />
          </FormGroup>
          <FormGroup>
            <LabelAndInput
              label="YouTube URL:"
              type="text"
              id="youtube"
              name="youtube"
              value={userFormData.social_media.youtube}
              handleChange={(e) => setUserFormData({
                ...userFormData,
                social_media: {
                  ...userFormData.social_media,
                  youtube: e.target.value,
                },
              })}
              isEditable={true}
            />
          </FormGroup> */}
          <SubmitButton type="submit">Save</SubmitButton>
        </Form>
        </UserDetailsModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Confirmation"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
<DeleteModalContent>
  <ModalHeader>
    <ModalTitle>Confirm Delete</ModalTitle>
    <CloseButton onClick={closeDeleteModal}>×</CloseButton>
  </ModalHeader>
  {deleteMessage ? (
    <>
      <DeleteMessage>{deleteMessage}</DeleteMessage>
      {showSuccessAnimation && (
        <SuccessIcon
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle size={48} color="#00ffff" />
        </SuccessIcon>
      )}
    </>
  ) : (
    <>
      <p>Are you sure you want to delete this event?</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <SubmitButton onClick={() => deleteEvent(eventToDelete.event_id)}>Delete</SubmitButton>
        <SubmitButton onClick={closeDeleteModal} style={{ backgroundColor: '#3a3a3a' }}>Cancel</SubmitButton>
      </div>
    </>
  )}
</DeleteModalContent>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onRequestClose={() => setIsCreateModalOpen(false)}
        contentLabel="Create Event"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <CreateEventModalContent>
        <ModalHeader>
          <ModalTitle>Create Event</ModalTitle>
          <CloseButton onClick={() => setIsCreateModalOpen(false)}>×</CloseButton>
        </ModalHeader>
        <Form onSubmit={handleCreateEvent}>
        <FormGroup>
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                type="text"
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="eventTime">Event Time</Label>
              <Input
                type="time"
                id="eventTime"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="eventLocation">Event Location</Label>
              <Input
                type="text"
                id="eventLocation"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="projectName">Project Name</Label>
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
            </FormGroup>
            <FormGroup>
              <Label>Create New Project</Label>
              <div>
                <Input
                  type="text"
                  placeholder="New Project Name"
                  value={newProjectName}
                  onChange={handleNewProjectChange}
                />
                <ProjectButton type="button" onClick={handleCreateProject}>
                  Add Project
                </ProjectButton>
              </div>
            </FormGroup>
            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <Label htmlFor="invitationNote">Invitation Note</Label>
              <TextArea
                id="invitationNote"
                name="invitationNote"
                value={formData.invitationNote}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="eventImage">Upload Image</Label>
              <Input
                type="file"
                id="eventImage"
                name="eventImage"
                accept="image/*"
                onChange={handleFileChange}
              />
            </FormGroup>
            <SubmitButton type="submit" disabled={uploading}>
              {uploading ? "Creating..." : "Create Event"}
            </SubmitButton>
          </Form>
        </CreateEventModalContent>
      </Modal>
      <Footer />
    </PageWrapper>
  );
}

export default Event;