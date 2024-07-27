import React, { useState, useEffect } from 'react';
import './CreateEvents.css';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const CreateEventForm = () => {

  const { clientName } = useParams();
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    projectName: '',
    clientName: clientName || '',
    invitationNote: '',
  });

  const [eventTime, setEventTime] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [displayNone,setDisplayNone] = useState(false);

  useEffect(() => {
    populateTimeDropdown();
    fetchProjects();
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

  const fetchProjects = async () => {
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

  const handleNewProjectChange = (e) => {
    setNewProjectName(e.target.value);
  };

  const handleCreateProject = async () => {
    if (!newProjectName) {
      toast.error('Please enter a project name.');
      return;
    }

    try {
      const response = await API_UTIL.post('/saveProjectDetails', { projectName: newProjectName ,clientName:clientName});
      setProjects([response.data.data,...projects,]);
      setFormData({ ...formData, projectName: response.data.data.project});
      setNewProjectName('');
      setShowNewProjectInput(false);
      console.log(projects)
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    }
    finally{
      setDisplayNone(!displayNone);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTimeChange = (e) => {
    setEventTime(e.target.value);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
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

    const combinedDateTime = `${formData.eventDate}T${hours}:${minutes}:00`;

    setUploading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('eventName', formData.eventName);
    formDataToSend.append('eventDate', combinedDateTime);
    formDataToSend.append('eventLocation', formData.eventLocation);
    formDataToSend.append('projectName', formData.projectName);
    formDataToSend.append('clientName', formData.clientName);
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
      toast.success('Events created successfully');
      setTimeout(() => {
        navigate('/event');
      }, 1000);
      return response;
    } catch (error) {
      console.error('Error saving form data to backend:', error);
      toast.error('Failed to save the events. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="create-event-container">
      <h1 className="form-title">Create Event Invitation</h1>
      <form className="invitation-form" id="invitation-form" onSubmit={handleSubmit}>
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
          {/* <div className="project-dropdown"> */}
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
              setShowNewProjectInput(!showNewProjectInput)
              setDisplayNone(!displayNone)
            }} 
            className={`add-project-button${displayNone?"hide":""}`}
          >
            + 
          </button>
          {/* </div> */}
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
  );
};

export default CreateEventForm;
