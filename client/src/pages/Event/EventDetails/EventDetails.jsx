import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from 'react-modal';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import API_UTIL from '../../../services/AuthIntereptor';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import './EventDetails.css';
import AppBar from '../../../components/AppBar/AppBar';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';
import ClaimRewardsPopup from '../../../components/ClaimRewardsPopup/ClaimRewardsPopup';
import { Edit2, Calendar, Clock, MapPin, Share2, Upload, Users, Image, Link, HandshakeIcon, X, Cable, QrCode, Handshake } from 'lucide-react';


const PageWrapper = styled.div`
  background-color: #121212;
  min-height: 100vh;
  color: #ffffff;
`;

const ContentWrapper = styled.div`
  max-width: 75rem;
  margin: 0 auto;
  padding: 2rem;
`;

const EventImage = styled.div`
  position: relative;
  width: 100%;
  height: 30rem;
  border-radius: 1.25rem;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 255, 255, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7));
  }
`;

const EventTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: white;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const EventInfo = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: white;
  margin: 0.5rem 1rem 0.5rem 0;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: #2a2a2a;
  color: #ffffff;
  border: none;
  border-radius: 1.875rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }

  &:hover {
    background-color: #3a3a3a;
    box-shadow: 0 0 0.5rem rgba(0, 255, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditForm = styled(motion.div)`
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 1.25rem;
  margin-top: 2rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 255, 255, 0.1);
`;

const StyledModal = styled(Modal)`
  &.qr-modal-content,
  &.uploadfiles-modal-content {
    background-color: transparent;
    border: none;
    padding: 0;
    max-width: 100%;
    width: auto;
    margin: 0;
    outline: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 1.25rem;
  max-width: 31.25rem;
  width: 90%;
  color: #ffffff;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1rem;
  transition: color 0.3s ease;

  &:hover {
    color: #00ffff;
  }
`;

const QRCodeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

const Dropzone = styled.div`
  border: 0.125rem dashed #3a3a3a;
  border-radius: 0.625rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ffff;
    background-color: rgba(0, 255, 255, 0.05);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.625rem;
  background-color: #2a2a2a;
  border-radius: 0.3125rem;
  margin-top: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #00ffff;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const UnityLogo = styled.img`
  width: 1rem;
  height: 1rem;
  vertical-align: middle;
  margin-left: 0.25rem;
`;

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
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(true);

    // Fetch event data function
    const fetchEventData = async (eventName) => {
      try {
        const response = await API_UTIL.get(`/getEventDetails/${eventName}`);
        setEvent(response.data);
        setUploadedFilesCount(response.data.uploaded_files || 0);
        setEditData({
          eventName: response.data.event_name,
          eventDate: response.data.event_date.split('T')[0],
          eventTime: response.data.event_date.split('T')[1].slice(0, 5),
          invitationNote: response.data.invitation_note,
          eventLocation: response.data.event_location
        });
        setIsImageProcessingDone(response.data.uploaded_files === response.data.files_indexed);
      } catch (error) {
        setError(error.message);
      }
    };

  useEffect(() => {
    fetchEventData(eventName);
    const interval = setInterval(() => {
      fetchEventData(eventName);
    }, 10000);
    return () => clearInterval(interval);
  }, [eventName]);

  useEffect(() => {
    setRequiredCoins(files.length);
    setCanUpload(userDetails && userDetails.reward_points >= files.length); // Enable/disable upload based on user's coins
  }, [files, userDetails]);

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

  const closeClaimPopup = () => {
    setIsClaimPopupOpen(false);
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
    if (!name) return '';
    let event = name.replace(/_/g, ' ');
    if (userDetails && userDetails.user_name) {
      event = event.replace(userDetails.user_name, '');
    }
    return event.trim();
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
      toast.error('Failed to transfer Unity Coins. Please try again.');
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

  const StyledLabel = styled.label`
  color: white;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #00ffff;
  }
`;

const LabelAndInput = ({ label, ...props }) => (
  <div>
    <StyledLabel>{label}</StyledLabel>
    <StyledInput {...props} />
  </div>
);

  return (
    <PageWrapper>
      <AppBar showCoins={true} />
      {/*<ClaimRewardsPopup isOpen={isClaimPopupOpen} onClose={closeClaimPopup} /> */}
      <ContentWrapper>
        <EventImage>
          <img src={event.event_image} alt="Event" />
        </EventImage>
        <EventTitle>{formatEventName(event?.event_name)}</EventTitle>
        <EventInfo>
          <InfoItem>
            <Calendar size={18} />
            {getFormattedDate(event.event_date)}
          </InfoItem>
          <InfoItem>
            <Clock size={18} />
            {getFormattedTime(event.event_date)}
          </InfoItem>
          <InfoItem>
            <MapPin size={18} />
            {event.event_location || 'Location not set'}
          </InfoItem>
        </EventInfo>
        <ActionButtons>
          <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleEditClick}>
            <Edit2 size={18} />
            Edit
          </ActionButton>
          <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openQrModal}>
            <QrCode size={18} />
            Invite / QR
          </ActionButton>
          <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openUploadFilesModal}>
            <Upload size={18} />
            Upload
          </ActionButton>
          <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sendCollab}>
            <HandshakeIcon size={18} />
            Collab
          </ActionButton>
          <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/proV1/${event?.event_id}`, { state: { event } })}>
            <Users size={18} />
            Attendees
          </ActionButton>
          <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/eventPhotos/${event?.folder_name}`)}>
            <Image size={18} />
            Photos
          </ActionButton>
          {isImageProcessingDone && (
            <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/relationsV1/${event?.event_id}`)}>
              <Cable size={18} />
              Relations
            </ActionButton>
          )}
        </ActionButtons>

        <AnimatePresence>
          {isEditEnabled && (
            <EditForm
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleFormSubmit}>
                <LabelAndInput
                  name="eventName"
                  label="Event Name:"
                  value={editData.eventName}
                  type="text"
                  handleChange={handleInputChange}
                  isEditable={true}
                />
                <LabelAndInput
                  name="eventDate"
                  label="Date:"
                  value={editData.eventDate}
                  type="date"
                  handleChange={handleInputChange}
                  isEditable={true}
                />
                <LabelAndInput
                  name="eventTime"
                  label="Time:"
                  value={editData.eventTime}
                  type="time"
                  handleChange={handleInputChange}
                  isEditable={true}
                />
                <LabelAndInput
                  name="invitationNote"
                  label="Invitation Note:"
                  value={editData.invitationNote}
                  type="text"
                  handleChange={handleInputChange}
                  isEditable={true}
                />
                <LabelAndInput
                  name="eventLocation"
                  label="Location:"
                  value={editData.eventLocation}
                  type="text"
                  handleChange={handleInputChange}
                  isEditable={true}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <ActionButton type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Save
                  </ActionButton>
                  <ActionButton type="button" onClick={handleCancel} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Cancel
                  </ActionButton>
                </div>
              </form>
            </EditForm>
          )}
        </AnimatePresence>

        <StyledModal
          isOpen={isQrModalOpen}
          onRequestClose={closeQrModal}
          contentLabel="QR Code"
          className="qr-modal-content"
          overlayClassName="modal-overlay"
        >
          <ModalOverlay>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CloseButton onClick={closeQrModal}><X size={24} /></CloseButton>
            <h2>QR Code</h2>
            <QRCodeWrapper ref={qrRef}>
              <QRCode
                value={`https://flashback.inc/login/${event?.event_name}`}
                size={256}
              />
            </QRCodeWrapper>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '2rem', 
              paddingTop: '1rem' 
            }}>
              <ActionButton onClick={downloadQRCode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Download QR
              </ActionButton>
              <ActionButton onClick={sendInvite} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Send Invite
              </ActionButton>
            </div>

          </ModalContent>
          </ModalOverlay>
        </StyledModal>

        <StyledModal
          isOpen={isUploadFilesModelOpen}
          onRequestClose={closeUploadFilesModal}
          contentLabel="Upload Files"
          className="uploadfiles-modal-content"
          overlayClassName="modal-overlay"
        >
          <ModalOverlay>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CloseButton onClick={closeUploadFilesModal}><X size={24} /></CloseButton>
            <h2>Upload Files</h2>
            <Dropzone {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop files here, or click to select files from your machine</p>
              )}
            </Dropzone>
            {fileCount > 0 && (
              <p>
                {fileCount} file(s) selected.{" "}
                {canUpload ? (
                  <>
                    {requiredCoins} <UnityLogo src='/unityLogo.png' alt='Coin' />
                    will be deducted from your wallet.
                  </>
                ) : (
                  "Insufficient balance."
                )}
              </p>
            )}
            {uploadStatus && <p>{uploadStatus}</p>}
            <div style={{              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '2rem', 
              paddingTop: '1rem' }}>
            <ActionButton 
              onClick={uploadFiles} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              disabled={!canUpload || fileCount > 500} 
            >
              Upload
            </ActionButton>
            </div>
            {uploading && (
              <ProgressBar>
                <ProgressFill progress={overallProgress} />
              </ProgressBar>
            )}
          </ModalContent>
          </ModalOverlay>
        </StyledModal>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default EventDetails;