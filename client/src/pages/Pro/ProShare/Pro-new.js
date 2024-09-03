import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/Loader/LoadingSpinner";
// import Modal from "../../../components/ImageModal/ImageModal";
import { useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

import API_UTIL from "../../../services/AuthIntereptor";
import Footer from "../../../components/Footer/Footer";
import "../../../components/Footer/Footer.css"; // Import your CSS file
import MergeDuplicateUsers from "./MergeHandler/MergeDuplicateUsers";
import "./Pro.css";
import AppBar from "../../../components/AppBar/AppBar";
import Modal from 'react-modal';
import { toast } from 'react-toastify';

function ProNew() {
  const { eventId } = useParams();
  const [userThumbnails, setUserThumbnails] = useState([]);
  const [clientDetails, setClientDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const username =localStorage.getItem("username");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const isDataFetched = useRef(false);
  const [showMergeDuplicateUsers, setShowMergeDuplicateUsers] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeMessage, setMergeMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showMergePopup, setShowMergePopup] = useState(false);
  const [selectedMainUser, setSelectedMainUser] = useState(null);
  const [selectedDuplicateUsers, setSelectedDuplicateUsers] = useState([]);
  const [showRewardPointsPopUp, setShowRewardPointsPopUp] = useState(null);
  const [rewardPoints,setRewardPoints] = useState();
  const [isSendModalOpen,setIsSendModalOpen] = useState(false);
  // const serverIp = process.env.REACT_APP_SERVER_IP;
  const location = useLocation();
  const [isSending, setIsSending] = useState(false);
  
  const event = location.state?.event; // Retrieve event from location state

  const handleClick = (item) => {
    if (mergeMode) {
      handleThumbnailClick(item);
    } else {
      saveShareDetails(item);
      shareOnWhatsApp(item);
      // setClickedImg(true);
    }
  };

  const handleManageUsers = () => {
    setMergeMode(true);
    setSelectedUsers([]);
  };

  const handleCancelManageUsers = () => {
    setMergeMode(false);
    setShowMergePopup(false);
    setSelectedUsers([]);
    setMergeMessage('');
  };

  const handleClosePopup = (fullReset = false) => {
    setShowMergePopup(false);
    if (fullReset) {
      setMergeMode(false);
      setSelectedUsers([]);
    } else {
      setSelectedUsers(prev => prev.slice(0, 1));
    }
  };

  const handleMergeClick = () => {
    setMergeMessage('Select 2 duplicate faces to merge');
    
    setShowMergeDuplicateUsers(true);
    setMergeMode(true);
    setSelectedMainUser(null);
    setSelectedDuplicateUsers([]);
  };

  // const handleCloseMerge = () => {
  //   setShowMergeDuplicateUsers(false);
  //   setMergeMode(false);
  //   setSelectedMainUser(null);
  //   setSelectedDuplicateUsers([]);
  // };

  const handleMerge = async (reason) => {
    try {
      const user_phone_number = localStorage.getItem("userPhoneNumber");
      const response = await API_UTIL.post('/mergeUsers', {
        userIds: selectedUsers.map(u => u.user_id),
        reason: reason,
        eventId: eventId,
        user_phone_number: user_phone_number
      });

      if (response.data.success) { 
        updateRewardPoints(50);
        await fetchThumbnails();
      }
      return response.data;
    } catch (error) {
      console.error("Error merging users:", error);
      return { success: false, message: "Error merging users. Please try again." };
    }
  };

  // const handleCloseMergePopup = () => {
  //   setMergeMode(false);
  //   setSelectedUsers([]);
  //   setShowMergePopup(false);
  // }


  const handleThumbnailClick = (user) => {
    if (!mergeMode) return;

    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.user_id === user.user_id);
      if (isSelected) {
        return prev.filter(u => u.user_id !== user.user_id);
      } else if (prev.length < 2) {
        const newSelected = [...prev, user];
        if (newSelected.length === 2) {
          setShowMergePopup(true);
        }
        return newSelected;
      }
      return prev;
    });
  };

  const shareOnWhatsApp = (item) => {
    const userId = item.user_id;
    const count = item.count;
    const text = `*Greetings*,\nWe have discovered your *${count}* images captured during the event *"${event.event_name}"*.\nKindly proceed to the provided URL to access and view your photographs:\nhttps://flashback.inc/photosV1/${event.folder_name}/${userId}\n\nCheers,\n*Flashback*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const saveShareDetails = async (item) => {
    try {
      const user = localStorage.userPhoneNumber;
      const response = await API_UTIL.post(`/saveProShareDetails`, { user: user, sharedUser: item.user_id, event_id: eventId });
      if (response.status === 200) {
        updateRewardPoints(10);
      } else {
        throw new Error("Failed to save share info");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    }
  };

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnailsByEventId/${eventId}`);
      if (response.status === 200) {
        setUserThumbnails(response.data);
        fetchClientDetails();
      } else {
        throw new Error("Failed to fetch user thumbnails");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientDetails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnailsByEventId/${eventId}`);
      if (response.status === 200) {
        setClientDetails(response.data);
        fetchuserDetails();
      } else {
        throw new Error("Failed to fetch client Details");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchuserDetails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/getUserDetails/${localStorage.userPhoneNumber}`);
      if (response.status === 200) {
        setUserDetails(response.data);
      } else {
        throw new Error("Failed to fetch client Details");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsLoading(false);
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
  const handleSendPhotos = async () => {
    setIsSending(true); // Set sending state to true
    setIsSendModalOpen(true);
    try {
      await sendWhatsappMsg();
    } finally {
      setIsSending(false); // Set sending state to false after process is complete
    }
  };
  

  const closeSendPhotos = () => {
    setIsSendModalOpen(false);
  };

  const updateRewardPoints = async (points) => {
    const updateData = {
      user_phone_number: localStorage.userPhoneNumber,
      reward_points: userDetails?.reward_points ? userDetails.reward_points + points : 50 + points
    };
  
    try {
      const response = await API_UTIL.post('/updateUserDetails', updateData);
      if (response.status === 200) {
        setRewardPoints(points);
        setShowRewardPointsPopUp(true);
        setUserDetails(response.data.data);
      } else {
        console.log("Failed to update user details. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  useEffect(() => {
    if (isDataFetched.current) return;
    fetchThumbnails();
    isDataFetched.current = true;
  }, []);

  // Separate registered and unregistered users
  const registeredUsers = userThumbnails.filter(thumbnail => thumbnail.is_registered);
  const unregisteredUsers = userThumbnails.filter(thumbnail => !thumbnail.is_registered);

  return (
    <div className="page-container">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <AppBar />
          <div className="content-wrap">
            <div className="statsSections">
             <div className="toolbar"> 
                {!mergeMode ? (
                <button onClick={handleMergeClick}>Manage Faces</button>
                ) : (
                  <button className ='p-button' onClick={handleCancelManageUsers}>Cancel</button>
                )}
                  <button
                  className='p-button'
                  onClick={handleSendPhotos}
                  disabled={isSending} // Disable button while sending
                >
                  {isSending ? 'Sending...' : 'Send Photos'} {/* Update button text */}
                </button>
                 
              </div>
              <div className="totalCount">
                <label>Total Attendees: {userThumbnails.length}</label>
              </div>
            </div>
            {mergeMessage && <div className="merge-message">{mergeMessage}</div>}
            {userThumbnails.length > 0 ? (
              <>
                <h2>Registered Users</h2>
                <div className="wrapper-pro">
                  {registeredUsers.map((item, index) => (
                    <div 
                      key={index} 
                      className={`wrapper-images-pro ${mergeMode ? 'selectable' : ''} ${selectedUsers.some(u => u.user_id === item.user_id) ? 'selected' : ''}`}
                      onClick={() => handleClick(item)}
                    >
                      <LazyLoadImage
                        src={item.face_url}
                        alt={`User ${index + 1}`}
                      />
                      <p>{item.count}</p>
                      {mergeMode && (
                        <div className={`tick-mark ${selectedUsers.some(u => u.user_id === item.user_id) ? 'selected' : ''}`}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <h2>Unregistered Users</h2>
                <div className="wrapper-pro">
                  {unregisteredUsers.map((item, index) => (
                    <div 
                    key={index} 
                    className={`wrapper-images-pro ${mergeMode ? 'selectable' : ''} ${selectedUsers.some(u => u.user_id === item.user_id) ? 'selected' : ''}`}
                    onClick={() => handleClick(item)}
                  >
                      <LazyLoadImage
                        src={item.face_url}
                        alt={`User ${index + 1}`}
                      />
                      <p>{item.count}</p>
                      {mergeMode && (
                        <div className={`tick-mark ${selectedUsers.some(u => u.user_id === item.user_id) ? 'selected' : ''}`}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : fetchTimeout ? (
              <p>No images to display</p>
            ) : (
              <p>Failed to load images</p>
            )}
          </div>
          <Footer />
        </>
      )}
      {showMergePopup && (
        <MergeDuplicateUsers
          users={selectedUsers}
          onClose={handleCancelManageUsers}
          onMerge={handleMerge}
        />
      )}
      {isSendModalOpen &&(
       <Modal
       key={isSendModalOpen ? 'open' : 'closed'} // Adding key to handle unique modal instances
       isOpen={isSendModalOpen}
       onRequestClose={closeSendPhotos}
       contentLabel="Send Photos"
       className="send-photos-content"
       overlayClassName="modal-overlay"
     >
      <div className='pro-send-modal'>
        <div className="send-modal-header">
          {/* <h2 className="send-modal-title">
            Send Photos
          </h2> */}
          <button className="close-button" onClick={closeSendPhotos}>
            x
          </button>
        </div>
        <div className="send-modal-body">
          <p>Only registered users will receive Photos.</p>
          <p>For unregistered users, you can click on their thumbnail and send photos through your WhatsApp.</p>
        </div>
      </div>
    </Modal>
    
      )}
    </div>
  );
}

export default ProNew;

