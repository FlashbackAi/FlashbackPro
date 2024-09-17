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
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const qrRef = useRef();
  const userDetails = location.state?.userDetails;
  const navigate = useNavigate();
  const [fileCount, setFileCount] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);  
  const [isImageProcessingDone, setIsImageProcessingDone]  = useState(true);
  const [totalUploadedBytes, setTotalUploadedBytes] = useState(0);
  const userPhoneNumber = localStorage.userPhoneNumber;
  const [requiredCoins, setRequiredCoins] = useState(0);
  const [canUpload, setCanUpload] = useState(false); // To manage button state
  const [isCoinsDedcuted,setIsCoinsDeducted] = useState(false);

  // Fetch event data function
  const fetchEventData = async (eventName) => {
    try {
      const response = await API_UTIL.get(`/getEventDetails/${eventName}`);
      console.log(response.data);
      setEvent(response.data);
      let fileCount = 0;
      if (response.data.uploaded_files) {
        fileCount = response.data.uploaded_files;
        setUploadedFilesCount(fileCount);
      }
      setEditData({
        eventName: response.data.event_name,
        eventDate: response.data.event_date.split('T')[0],
        eventTime: response.data.event_date.split('T')[1].slice(0, 5),
        invitationNote: response.data.invitation_note,
        eventLocation: response.data.event_location
      });
      if( response.data.uploaded_files === response.data.files_indexed){
        if(isImageProcessingDone === false)
        setIsImageProcessingDone(true);
      }
      else{
          setIsImageProcessingDone(false);

      }
    } catch (error) {
      setError(error.message);
    }
  };
  useEffect(() => {
    setRequiredCoins(files.length);
    setCanUpload(userDetails.reward_points >= files.length); // Enable/disable upload based on user's coins
  }, [files, userDetails]);

  useEffect(() => {
  }, [isCoinsDedcuted]);
  useEffect(() => {
    // Fetch event data initially
    fetchEventData(eventName);

    // Set up polling
    const interval = setInterval(() => {
      fetchEventData(eventName);
    }, 10000); // 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [eventName]);

  const handleEditClick = () => {
    setEditData({
      eventName: event.event_name,
      eventDate: event.event_date.split('T')[0],
      eventTime: event.event_date.split('T')[1].slice(0, 5),
      invitationNote: event.invitation_note,
      eventLocation: event.event_location
    });
    setIsEditEnabled(true);
  };

  const handleCancel = () => {
    setEditData({
      eventName: event.event_name,
      eventDate: event.event_date.split('T')[0],
      eventTime: event.event_date.split('T')[1].slice(0, 5),
      invitationNote: event.invitation_note,
      eventLocation: event.event_location
    });
    setIsEditEnabled(false);
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
        uploadedFiles: uploadedFilesCount
      });

      if (response.status === 200) {
        setIsEditEnabled(false);
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
    setFileCount(0);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const totalFiles = acceptedFiles.length;
    if (totalFiles > 500) {
      setFileCount(totalFiles);
      setUploadStatus(`You have selected ${totalFiles} files. You can upload a maximum of 500 files at a time.`);
      setUploading(false);
    } else {
      setFiles(acceptedFiles);
      setFileCount(totalFiles);
      setUploadProgress({});
      setUploadStatus('');
      setUploading(false);
    }
  }, []);

  const deductCoins = async (numberOfImages) => {
    try {
      // Prepare the request payload
      const payload = {
        amount: numberOfImages.toString(), // The number of images is the amount to deduct
        senderMobileNumber: userPhoneNumber, // The current user's phone number
        recipientMobileNumber: "+919090401234" // The fixed recipient phone number
      };
  
      // Call the API to transfer Chewy coins
      const response = await API_UTIL.post('/transfer-chewy-coins', payload);
  
      if (response.status === 200) {
        setIsCoinsDeducted(true);
      } else {
        throw new Error('Failed to deduct coins.');
      }
    } catch (error) {
      console.error('Error deducting coins:', error);
      toast.error('Failed to deduct coins. Please try again.');
    }
  };
  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadFiles = async () => {
    if (files.length === 0) {
      setUploadStatus('Please select files to upload');
      return;
    }
  
    setUploading(true);
    setUploadFilesModalStatus('Uploading files...');
    setIsUploadFilesFailed(false);
    setOverallProgress(0); // Start at 0% progress
  
    const MAX_CONCURRENT_UPLOADS = 3; // Reduced to avoid 429 error
    const MAX_RETRIES = 3;
    let index = 0;
    const totalFiles = files.length;
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0); // Total size of all files
  
    // Use React state to safely track the total uploaded bytes

    const uploadFile = async (file) => {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('eventName', event.event_name);
      formData.append('eventDate', event.event_date);
      formData.append('folderName', event.folder_name);
  
      let attempts = 0;
      let delayTime = 1000; // Start with 1 second delay
  
      while (attempts < MAX_RETRIES) {
        try {
          const response = await API_UTIL.post(`/uploadFiles/${event.event_name}/${userPhoneNumber}/${event.folder_name}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              // Dynamically update the total uploaded bytes using state update function
              setTotalUploadedBytes((prevUploadedBytes) => {
                const updatedUploadedBytes = prevUploadedBytes + progressEvent.loaded;
                
                // Calculate and update overall progress based on total uploaded bytes
                const overallProgress = (updatedUploadedBytes / totalBytes) * 100;
                setOverallProgress(Math.ceil(overallProgress)); // Round to nearest integer
                
                return updatedUploadedBytes;
              });
            },
          });
  
          return response.data;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            console.error(`Error uploading file ${file.name}, attempt ${attempts}: Too many requests, retrying after ${delayTime / 1000} seconds`);
            await delay(delayTime);
            delayTime *= 2; // Double the delay time for exponential backoff
          } else {
            console.error(`Error uploading file ${file.name}, attempt ${attempts}:`, error);
          }
          attempts++;
          if (attempts === MAX_RETRIES) throw error;
        }
      }
    };
  
    const handleUploads = async () => {
      while (index < files.length) {
        const promises = [];
        for (let i = 0; i < MAX_CONCURRENT_UPLOADS && index < files.length; i++) {
          promises.push(uploadFile(files[index]));
          index++;
        }
        await Promise.allSettled(promises);
      }
    };
  
    try {
      await handleUploads();
  
      // After all files are uploaded successfully, update the uploaded files count
      const newUploadedFilesCount = uploadedFilesCount + files.length;
      setUploadedFilesCount(newUploadedFilesCount);
  
      try {
        const response = await API_UTIL.put(`/updateEvent/${event.event_id}`, {
          eventName: editData.eventName,
          eventDate: `${editData.eventDate}T${editData.eventTime}:00`,
          invitationNote: editData.invitationNote,
          eventLocation: editData.eventLocation,
          uploadedFiles: newUploadedFilesCount,
        });
  
        if (response.status === 200) {
          toast.success('Event updated successfully with new file count');
        }
      } catch (error) {
        console.error('Error updating event with new file count:', error);
        toast.error('Failed to update the event with new file count. Please try again.');
      }
      await deductCoins(files.length);
  
      setUploadStatus('Upload completed successfully');
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setOverallProgress(100); // Ensure progress bar is set to 100% on completion
      setFileCount(0);
    }
  };
  

  const sendInvite = async () => {
    const message = editData
      ? `Check out this event: ${formatEventName(event?.event_name)} on ${getFormattedDate(editData?.eventDate)} at ${getFormattedTime(editData?.eventDate)}. Location: ${editData?.eventLocation} , Url: https://flashback.inc/invite/${event?.event_id}`
      : `Check out this event: ${formatEventName(event?.event_name)} on ${getFormattedDate(event.event_date)} at ${getFormattedTime(event.event_date)}. Location: ${event.event_location} , Url: https://flashback.inc/invite/${event?.event_id}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    await transferChewyCoins(userDetails.user_phone_number,10);
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
    console.log("inside format" );
    console.log(datetime);
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
  const transferChewyCoins = async (recipientMobileNumber, amount) => {
    try {
      const senderMobileNumber = "+919090401234"; // The fixed sender phone number
  
      // Prepare the request payload
      const payload = {
        amount: amount,
        senderMobileNumber: senderMobileNumber,
        recipientMobileNumber: recipientMobileNumber,
      };
  
      // Call the API to transfer Chewy coins
      const response = await API_UTIL.post('/transfer-chewy-coins', payload);
  
      if (response.status === 200) {
        toast.success(' Rewards added  successfully!');
      } else {
        throw new Error('Failed to transfer Chewy Coins.');
      }
    } catch (error) {
      console.error('Error transferring Chewy Coins:', error);
      toast.error('Failed to transfer Chewy Coins. Please try again.');
    }
  };

  const sendCollab = async () => {
    try {
      const collabLink = `https://flashback.inc/collab/${event.event_id}`;
      const message = `Join the collaboration for the event: ${formatEventName(event?.event_name)}. Collaborate using the following link: ${collabLink}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

      window.open(url, '_blank');
      await transferChewyCoins(userDetails.user_phone_number,10);
    } catch (error) {
      console.error('Error generating collaboration link:', error);
      toast.error('Failed to generate collaboration link. Please try again.');
    }
  };

  const sendWhatsappMsg = async () => {
    try {
      
      const userIdMappingResponse = await API_UTIL.post('/generateUserIdsForExistingUsers', { eventName: event.folder_name });
      if(userIdMappingResponse.status === 200){
      const sendFlashbacksResponse = await API_UTIL.post('/send-flashbacks', { eventName: event.folder_name });

      if (sendFlashbacksResponse.status === 200) {
        toast.success('Flashbacks sent successfully!');
      } else {
        throw new Error('Failed to send flashbacks.');
      }
    }
    else{
      throw new Error('Failed to send flashbacks.');
    }
    } catch (error) {
      console.error('Error Publishing Images', error);
      toast.error('Failed to Publish Images');
    }
  };

  if (!event) {
    return <div>Loading Event Info</div>;
  }

  return (
    <div className="event-details-page-root">
      <AppBar showCoins={true}/>
      {event.event_name && (
        <div className="event-details-container">
          <h1 className="event-details-title">
            {formatEventName(event?.event_name)}
          </h1>
          <div className="invitation-image">
            <img src={event.event_image} alt="Event" className="modal-image" />
          </div>
          <div className="invitation-image-content">
            <div className="event-details-content">
              <div className="ed-form-group">
                <LabelAndInput
                  name={"eventName"}
                  label={"Event Name:"}
                  value={event.event_name}
                  type={"text"}
                  handleChange={handleInputChange}
                  isEditable={false}
                />
                <LabelAndInput
                  name={"eventDate"}
                  label={"Date:"}
                  defaultValue={getFormattedDate(event.event_date)}
                  value={editData.eventDate}
                  type={"date"}
                  handleChange={handleInputChange}
                  isEditable={isEditEnabled}
                />
                <LabelAndInput
                  name={"eventTime"}
                  label={"Time:"}
                  defaultValue={getFormattedDate(event.event_date)}
                  value={editData.eventTime}
                  type={"time"}
                  handleChange={handleInputChange}
                  isEditable={isEditEnabled}
                />
                <LabelAndInput
                  name={"invitationNote"}
                  label={"Invitation Note:"}
                  value={editData.invitationNote}
                  type={"text"}
                  handleChange={handleInputChange}
                  isEditable={isEditEnabled}
                />
                <LabelAndInput
                  name={"eventLocation"}
                  label={"Location:"}
                  value={editData.eventLocation}
                  type={"text"}
                  handleChange={handleInputChange}
                  isEditable={isEditEnabled}
                />
              </div>
              <div className='edit-actions'>
                {isEditEnabled ? <>
                  <button className="save-button cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className="save-button" onClick={handleFormSubmit}>
                    Save
                  </button>
                </> :
                <button className="save-button" onClick={handleEditClick}>
                    Edit
                  </button>
                }
              </div>
            </div>
            <div className="ed-form-footer">
              <button className="footer-buttons" onClick={openQrModal}>
                Invite / QR
              </button>
              <button className="footer-buttons" onClick={openUploadFilesModal}>
                Upload Files
              </button>
              <button className="footer-buttons" onClick={sendCollab}>
                Collab
              </button>
              <button
                className="footer-buttons"
                onClick={() => {
                  navigate(`/proV1/${event?.event_id}`, { state: { event } });
                }}
              >
                Attendees / Send Photos
              </button>
              {/* <button className="footer-buttons" onClick={sendWhatsappMsg}>
                Send Photos
              </button> */}
              {/* {event?.uploaded_files && ( */}
                <button className="footer-buttons" onClick={() => {
                  navigate(`/eventPhotos/${event?.folder_name}`);
                }}>
                Uploaded Photos
              </button>
              {/* )} */}
              
              {isImageProcessingDone &&(
                <button
                  className="footer-buttons"
                  onClick={() => {
                    navigate(`/relationsV1/${event?.event_id}`);
                  }}
                >
                  Relation Mapping
                </button>
              )}

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
          <Modal
            isOpen={isQrModalOpen}
            onRequestClose={closeQrModal}
            contentLabel="QR Code"
            className="qr-modal-content"
            overlayClassName="modal-overlay"
          >
            {event && (
              <div className='event-details-qr-modal'>
                <div className="modal-header">
                  <h2 className="modal-title">
                    QR Code
                  </h2>
                  <button className="close-button" onClick={closeQrModal}>
                    x
                  </button>
                </div>
                <div className="qr-modal-body">
                  <div ref={qrRef} style={{ marginBottom: "20px" }}>
                    <QRCode
                      value={`https://flashback.inc/login/${event?.event_name}`}
                      size={256}
                    />
                  </div>
                  <button className="qr-footer-buttons" onClick={downloadQRCode}>
                    Download QR
                  </button>
                </div>
                <hr className="modal-separator" />
                <div className="qr-modal-footer">
                  <p className="invite-text">Send an invitation for your event</p>
                  <button className="qr-footer-buttons" onClick={sendInvite}>
                    Invite
                  </button>
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
          <button className="close-button" onClick={closeUploadFilesModal}>
            x
          </button>
        </div>
        <div className="modal-body">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "active" : ""}`}
            style={dropzoneStyle}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag 'n' drop files here, or click to select files from your
                machine
              </p>
            )}
          </div>
          {fileCount > 0 && (
            <p>
              {fileCount} file(s) selected.{" "}
              {canUpload 
                ? `${requiredCoins} 🪙 will be deducted from your wallet.` 
                : "Insufficient balance."
              }
            </p>
          )}
          {uploadStatus && <p>{uploadStatus}</p>}
          <button 
            onClick={uploadFiles} 
            className="upload-button" 
            disabled={!canUpload || fileCount > 500}
          >
            {/* {canUpload 
              ? `Pay ${requiredCoins} coins to upload` 
              : 'Insufficient coins'} */}
              Upload
          </button>

          {uploading && (
            <div className="processing-bar-container">
              <div
                className="processing-bar-fill"
                style={{ width: `${overallProgress}%` }}
              ></div>
              <div className="processing-bar-text">
                {overallProgress < 100 ? `${overallProgress}% Processing...` : 'Finalizing...'}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
        </div>
      )}
    </div>
  );
};

const dropzoneStyle = {
  border: "2px dashed #cccccc",
  borderRadius: "4px",
  padding: "20px",
  textAlign: "center",
  cursor: "pointer",
};

export default EventDetails;
