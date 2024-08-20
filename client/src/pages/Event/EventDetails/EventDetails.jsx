import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from 'react-modal';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import API_UTIL from '../../../services/AuthIntereptor';
import './EventDetails.css';
import AppBar from '../../../components/AppBar/AppBar';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';

const EventDetails = () => {
  const location = useLocation();
  const { eventName } = useParams();
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [event, setEvent] = useState([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isUploadFilesModelOpen, setUploadFilesModeOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadFilesModalStatus, setUploadFilesModalStatus] = useState('');
  const [isUploadFilesFailed, setIsUploadFilesFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toggleEdit, setToggleEdit] = useState(false);
  const qrRef = useRef();
  const userDetails = location.state?.userDetails; // Retrieve userDetails from location state
  const navigate = useNavigate();
  const [fileCount, setFileCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  console.log(userDetails);

  useEffect(() => {
    const fetchEventData = async (eventName) => {
      try {
        const response = await API_UTIL.get(`/getEventDetails/${eventName}`);
        console.log(response.data);
        setEvent(response.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchEventData(eventName);
  }, [eventName]);

  const handleEditClick = () => {
    if (!toggleEdit) {
      setEditData({
        eventName: event.event_name,
        eventDate: event.event_date.split('T')[0], // Assuming event_date is in ISO 8601 format
        eventTime: event.event_date.split('T')[1].slice(0, 5), // Extract time portion, assuming format HH:MM:SS
        invitationNote: event.invitation_note,
        eventLocation: event.event_location,
      });
    }
    setToggleEdit(!toggleEdit);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const combinedDateTime = `${editData.eventDate}T${editData.eventTime}:00`;

    try {
      const response = await API_UTIL.put(`/updateEvent/${event.event_id}`, {
        eventName: editData.eventName,
        eventDate: combinedDateTime,
        invitationNote: editData.invitationNote,
        eventLocation: editData.eventLocation,
      });

      if (response.status === 200) {
        toast.success('Event updated successfully');
        navigate('/event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update the event. Please try again.');
    }
  };

  const openQrModal = () => {
    setIsQrModalOpen(true);
  };

  const closeQrModal = () => {
    setIsQrModalOpen(false);
  };

  const downloadQRCode = () => {
    const qrCanvas = qrRef.current.querySelector('canvas');
    const qrImage = qrCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = qrImage;
    downloadLink.download = `${event.event_name}_QR.png`;
    downloadLink.click();
  };

  const openUploadFilesModal = () => {
    setUploadFilesModeOpen(true);
  };

  const closeUploadFilesModal = () => {
    setUploadFilesModeOpen(false);
    setFiles([]);
    setUploadProgress({});
    setUploadStatus('');
    setUploading(false);
  };

  const CHUNK_SIZE = 5 * 1024 * 1024; // Chunks of 5MB for file upload

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setFileCount(acceptedFiles.length); // Set the file count
    setUploadProgress({});
    setUploadStatus('');
    setUploading(false); // Reset uploading state when files are dropped
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const uploadChunk = async (file, chunk, chunkIndex, totalChunks) => {
    const formData = new FormData();
    formData.append('files', chunk, file.name);
    formData.append('eventName', event.event_name);
    formData.append('eventDate', event.event_date);
    formData.append('folderName', event.folder_name);
    formData.append('chunkNumber', chunkIndex);
    formData.append('totalChunks', totalChunks);

    try {
      const response = await API_UTIL.post(`/uploadFiles/${event.event_name}/${event.event_date}/${event.folder_name}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              [chunkIndex]: percentCompleted,
            },
          }));
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error uploading chunk ${chunkIndex} of ${file.name}:`, error);
      throw error;
    }
  };

  const uploadFile = async (file) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = `${file.name}`;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      try {
        await uploadChunk(file, chunk, chunkIndex, totalChunks);
      } catch (error) {
        // If chunk upload fails, we could implement retry logic here
        console.error(`Failed to upload chunk ${chunkIndex} of ${file.name}`);
        throw error;
      }
    }

    // Check if all chunks are uploaded
    // const status = await API_UTIL.get(`/upload-status/${fileId}`);
    // if (status.data.status !== 'completed') {
    //   throw new Error(`Failed to upload ${file.name}`);
    // }
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setUploadStatus('Please select files to upload');
      return;
    }
    setUploading(true);
    setUploadStatus('Uploading...');
    setUploadFilesModalStatus('Uploading...');
    setIsUploadFilesFailed(false);

    try {
      await Promise.all(files.map(uploadFile));
      setUploadStatus('Upload completed successfully');
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
      // setUploadFilesModalStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
    // setIsUploadFilesFailed(true);
  };

  const sendInvite = () => {
    const message = editData
      ? `Check out this event: ${formatEventName(event?.event_name)} on ${getFormattedDate(editData?.eventDate)} at ${getFormattedTime(editData?.eventDate)}. Location: ${editData?.eventLocation} , Url: https://flashback.inc/login/${event?.event_name}`
      : `Check out this event: ${formatEventName(event?.event_name)} on ${getFormattedDate(event.event_date)} at ${getFormattedTime(event.event_date)}. Location: ${event.event_location} , Url: https://flashback.inc/login/${event?.event_name}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const formatEventName = (name) => {
    let event = name.replace(/_/g, ' ');
    console.log(userDetails.user_name);
    console.log(event);
    event = event.replace(userDetails.user_name, '');
    console.log(event);
    return event;
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
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${hours}:${minutes} ${ampm}`;
  }

  const sendCollab = async () => {
    try {
      const collabLink = `https://flashback.inc/collab/${event.event_id}`;
      const message = `Join the collaboration for the event: ${formatEventName(event?.event_name)}. Collaborate using the following link: ${collabLink}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  
      // Open WhatsApp with the message pre-filled
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating collaboration link:', error);
      toast.error('Failed to generate collaboration link. Please try again.');
    }
  };

  const publishImages = async () => {
    try {
      setIsPublishing(true); // Start publishing
  
      const eventName = event.event_name;
      const folderName = event.folder_name;
  
      // Trigger both flashback and image resize in parallel
      const triggerFlashbackPromise = API_UTIL.post('/trigger-flashback', { eventName, folderName });
      const resizeImagesPromise = API_UTIL.post('/api/resize-copy-images', { sourceFolder: folderName });
  
      // Wait for both promises to complete
      const [triggerFlashbackResponse, resizeImagesResponse] = await Promise.all([
        triggerFlashbackPromise,
        resizeImagesPromise
      ]);
  
      // After both operations are complete, send flashbacks
      if (triggerFlashbackResponse.status === 200 && resizeImagesResponse.status === 200) {
        const sendFlashbacksResponse = await API_UTIL.post('/send-flashbacks', { eventName });
  
        if (sendFlashbacksResponse.status === 200) {
          toast.success('Images published and flashbacks sent successfully!');
        } else {
          throw new Error('Failed to send flashbacks.');
        }
      } else {
        throw new Error('Failed to trigger flashback or resize images.');
      }
    } catch (error) {
      console.error('Error Publishing Images', error);
      toast.error('Failed to Publish Images');
    } finally {
      setIsPublishing(false); // End publishing
    }
  };
  

  if (!event) {
    return <div>Loading Event Info</div>;
  }

  return (
    <div className="event-details-page-root">
      <AppBar></AppBar>
      {event.event_name && (
        <div className="event-details-container">
          <h1 className="event-details-title">
            {formatEventName(event?.event_name)}
          </h1>
            <div className="invitation-image">
              <img
                src={event.event_image}
                alt="Event"
                className="modal-image"
              />
            </div>
          <div className="invitation-image-content">

            <div className="event-details-content">
              {/* <div className="edit-option" onClick={handleEditClick}>
                {toggleEdit ? "Disable Edit" : "Enable Edit"}
              </div> */}

              {toggleEdit ? (
                <form onSubmit={handleFormSubmit} className="edit-form">
                  <div className="eo-form-group">
                  <label className="ed-form-label">Event Name:</label>
                  <input
                    type="text"
                    name="eventName"
                    value={editData.eventName}
                    onChange={handleInputChange}
                    className="ed-form-input"
                    required
                  />
                </div>
                    <div className="eo-form-group">
                      <label className="ed-form-label">Date:</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={editData.eventDate}
                    onChange={handleInputChange}
                    className="ed-form-input"
                    required
                  />
                </div>
                <div className="eo-form-group">
                  <label className="ed-form-label">Time:</label>
                  <input
                    type="time"
                    name="eventTime"
                    value={editData.eventTime}
                    onChange={handleInputChange}
                    className="ed-form-input"
                    required
                  />
                    </div>
                <div className="eo-form-group">
                    <label className="ed-form-label">Invitation Note:</label>
                    <textarea
                      name="invitationNote"
                      value={editData.invitationNote}
                      onChange={handleInputChange}
                      className="ed-form-input"
                    />
                </div>
                <div className="eo-form-group">
                    <label className="ed-form-label">Location:</label>
                    <input
                      type="text"
                      name="eventLocation"
                      value={editData.eventLocation}
                      onChange={handleInputChange}
                      className="ed-form-input"
                    />
                  </div>
                <button type="submit" className="save-button">Save Changes</button>
                </form>
              ) : (
                <div className="ed-form-group">
                <LabelAndInput name={"eventName"} label={"Event Name:"} value={event.event_name} type={"text"} handleChange={handleInputChange} isEditable={toggleEdit} ></LabelAndInput>
                <LabelAndInput name={"eventDate"} label={"Date:"} value={getFormattedDate(event.event_date)} type={"date"} handleChange={handleInputChange} isEditable={toggleEdit} ></LabelAndInput>
                <LabelAndInput name={"eventTime"} label={"Time:"} value={getFormattedTime(event.event_date)} type={"time"} handleChange={handleInputChange} isEditable={toggleEdit} ></LabelAndInput>
                <LabelAndInput name={"invitationNote"} label={"Invitation Note:"} value={event.invitation_note} type={"text"} handleChange={handleInputChange} isEditable={toggleEdit} ></LabelAndInput>
                <LabelAndInput name={"eventLocation"} label={"Location:"} value={event.event_location} type={"text"} handleChange={handleInputChange} isEditable={toggleEdit} ></LabelAndInput>
                {/* <p className="ed-form-value">Event Name: {event.event_name}</p> */}
                {/* <p className="ed-form-value">Date: {getFormattedDate(event.event_date)}</p> */}
                {/* <p className="ed-form-value">Time: {getFormattedTime(event.event_date)}</p> */}
                {/* <p className="ed-form-value">Invitation Note: {event.invitation_note}</p> */}
                {/* <p className="ed-form-value">Location: {event.event_location}</p> */}
                </div>
              )}
              
            </div>
            <div className="ed-form-footer">
              <button className="footer-buttons" onClick={openQrModal}>Generate QR</button>
              <button className="footer-buttons" onClick={openUploadFilesModal}>Upload Files</button>
              <button className="footer-buttons" onClick={sendInvite}>Invite</button>
              <button className="footer-buttons" onClick={sendCollab}>Collab</button>
              <button className="footer-buttons" onClick={()=>{navigate(`/pro-new/${event?.event_id}`, { state: { event } })}}>Attendees</button>
              <button className="footer-buttons" onClick={publishImages} disabled={isPublishing}>
                
                {isPublishing ? 'Publishing...' : 'Publish'}
                {/* {isPublishing && <div className="spinner"></div>} */}
              </button>
              <button className="footer-buttons" onClick={()=>{navigate(`/relations/${event?.event_name}`)}} disabled = {true}>Relation Mapping</button>

            </div>
            {event.invitation_url && (
              <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className="event-link">
                  View Invitation
                </a>
              )}
          </div>
          <div>
            
          </div>

          <Modal
            isOpen={isQrModalOpen}
            onRequestClose={closeQrModal}
            contentLabel="QR Code"
            className="qr-modal-content"
            overlayClassName="modal-overlay"
          >
            {event && (
              <div>
                <div className="modal-header">
                  <h2 className="modal-title">QR Code for {formatEventName(event?.event_name)}</h2>
                  <button className="close-button" onClick={closeQrModal}>x</button>
                </div>
                <div className="qr-modal-body">
                  <div ref={qrRef} style={{ marginBottom: '20px' }}>
                    <QRCode value={`https://flashback.inc/login/${event?.event_name}`} size={256} />
                  </div>
                  <button className="qr-footer-buttons" onClick={downloadQRCode}>Download QR</button>
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
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} style={dropzoneStyle}>
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop the files here ...</p>
                  ) : (
                    <p>Drag 'n' drop files here, or click to select files from your machine</p>
                  )}
                </div>
                {fileCount > 0 && <p>{fileCount} file(s) selected</p>} {/* Display file count */}
                <button onClick={uploadFiles} className="upload-button">Upload</button>
                {uploadStatus && <p>{uploadStatus}</p>}
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

const dropzoneStyle = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default EventDetails;
