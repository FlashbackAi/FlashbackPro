import React, { useState, useRef, useEffect, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import Modal from 'react-modal';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import API_UTIL from '../../../services/AuthIntereptor';
import './EventDetails.css';

const EventDetails = () => {
  const location = useLocation();
  const { eventName } = useParams();
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [event,setEvent] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isUploadFilesModelOpen, setUploadFilesModeOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadFilesModalStatus, setUploadFilesModalStatus] = useState('');
  const [isUploadFilesFailed, setIsUploadFilesFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const qrRef = useRef();
  const navigate = useNavigate();

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

  }, []);

  const handleEditClick = () => {
    setEditData({
      eventName: event.event_name,
      eventDate: event.event_date.split(' ')[0],
      eventTime: event.event_date.split(' ')[1],
      invitationNote: event.invitation_note,
      eventLocation: event.event_location,
      street: event.street,
      city: event.city,
      state: event.state,
      pinCode: event.pin_code,
      invitation_url: event.invitation_url,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API_UTIL.put(`/updateEvent/${event.event_name}/${event.event_date}`, {
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
        navigate('/events');
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
  }

  const closeUploadFilesModal = () => {
    setUploadFilesModeOpen(false);
    setFiles([]);
    setUploadProgress({});
    setUploadStatus('');
    setUploading(false);
  }

  const CHUNK_SIZE = 5 * 1024 * 1024; //Chunks of 5MB for file upload  

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setUploadProgress({});
    setUploadStatus('');
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles) => {
      setFiles(acceptedFiles);
      setUploadProgress({});
      setUploadStatus('');
      setUploading(false); // Reset uploading state when files are dropped
    }, []),
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
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              [chunkIndex]: percentCompleted
            }
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
      //setIsUploadFilesFailed(true);
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
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${hours}:${minutes} ${ampm}`;
  }

  if (!event) {
    return <div>Loading Event Info</div>;
  }

  return (
    <>
    { event.event_name && (
    <div className="event-details-container">
      <h1 className="event-details-title">{formatEventName(event?.event_name)}</h1>
      <div className="event-details-content">
        <img 
          src="https://img.icons8.com/ffffff/android/2x/edit.png" 
          alt="Edit" 
          className="edit-icon" 
          onClick={handleEditClick}
        />
        <img 
          src={event.event_image} 
          alt="Event" 
          className="modal-image" 
        />
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
              <p className="form-value">Date: {getFormattedDate(event.event_date)}</p>
              <p className="form-value">Time: {getFormattedTime(event.event_date)}</p>
              <p className="form-value">Invitation Note: {event.invitation_note}</p>
              <p className="form-value">Location: {event.event_location}</p>
              <p className="form-value">Street: {event.street},</p>
              <p className="form-value">City: {event.city},</p>
              <p className="form-value">State: {event.state},</p>
              <p className="form-value">Pin Code: {event.pin_code}</p>
              <p className='form-value'>Folder: {event.folder_name}</p>
            </div>
            <div className='form-footer'>
            <button className='footer-buttons' onClick={openQrModal}>Generate QR</button>
            <button className='footer-buttons' onClick={openUploadFilesModal}>Upload Files</button>
            </div>
          </div>
        )}
        {event.invitation_url && (
          <a href={event.invitation_url} target="_blank" rel="noopener noreferrer" className="event-link">
            View Invitation
          </a>
        )}
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
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} style={dropzoneStyle}>
          <input {...getInputProps()} />
          {isDragActive ? (
              <p>Drop the files here ...</p> 
           ) : (
              <p>Drag 'n' drop files here, or click to select files from your machine</p>
          )}
        </div>
        {files.length > 0 && (
          <div className='file-status-table'>
            <table>
              <thread>
                <tr>
                  <th>File Name</th>
                  <th>Progress</th>
                </tr>
                </thread>
                <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>
                {uploadProgress[file.name] && (
                  <div className="progress-bar">
                                  <span style={{ width: `${Object.values(uploadProgress[file.name]).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress[file.name]).length}%` }}></span>
                </div>
                )}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
        <button onClick={uploadFiles} className="upload-button">Upload</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
    </div>
      </Modal>
    </div>
    )}
      {/* // ):(
      //   <div>Loading Event Info</div>
      // ) */}
      </>
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
