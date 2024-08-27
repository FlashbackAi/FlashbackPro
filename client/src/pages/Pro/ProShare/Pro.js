import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/Loader/LoadingSpinner";
import Modal from "../../../components/ImageModal/ImageModal";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PlaceholderImage from "../../../media/images/blurredLogo.png";
import Header from "../../../components/Header/Header";
import API_UTIL from "../../../services/AuthIntereptor";
import Footer from "../../../components/Footer/Footer";
import "../../../components/Footer/Footer.css"; // Import your CSS file
import MergeDuplicateUsers from "./MergeHandler/MergeDuplicateUsers";
import "./Pro.css";
import AppBar from "../../../components/AppBar/AppBar";

function Pro() {
  const { eventName } = useParams();
  const [userThumbnails, setUserThumbnails] = useState([]);
  const [clientDetails, setClientDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const username =localStorage.getItem("username");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const isDataFetched = useRef(false);
  const history = useNavigate();
  const [clickedImg, setClickedImg] = useState(null);
  const [showMergeDuplicateUsers, setShowMergeDuplicateUsers] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedMainUser, setSelectedMainUser] = useState(null);
  const [selectedDuplicateUsers, setSelectedDuplicateUsers] = useState([]);
  const [showRewardPointsPopUp, setShowRewardPointsPopUp] = useState(null);
  const [rewardPoints,setRewardPoints] = useState();
  const serverIp = process.env.REACT_APP_SERVER_IP;

  const handleClick = (item) => {
    if (mergeMode) {
      handleThumbnailClick(item);
    } else {
      
    saveShareDetails(item);
      shareOnWhatsApp(item);
      setClickedImg(true);
    }
    
  };

  const handleClosePopup = () => {
    setShowRewardPointsPopUp(false)
  };

  const handleMergeClick = () => {
    setShowMergeDuplicateUsers(true);
    setMergeMode(true);
    setSelectedMainUser(null);
    setSelectedDuplicateUsers([]);
  };

  const handleCloseMerge = () => {
    setShowMergeDuplicateUsers(false);
    setMergeMode(false);
    setSelectedMainUser(null);
    setSelectedDuplicateUsers([]);
  };

  const handleMerge = async (mainUser, duplicateUsers) => {
    try {
      console.log("Merging", mainUser, "with", duplicateUsers);
      
      updateRewardPoints(50);
      await fetchThumbnails();
      handleCloseMerge();
    
    } catch (error) {
      console.error("Error merging users:", error);
    }
  };


  const handleThumbnailClick = (item) => {
    if (!selectedMainUser) {
      setSelectedMainUser(item);
    } else if (selectedDuplicateUsers.length < 5 && !selectedDuplicateUsers.includes(item) && item !== selectedMainUser) {
      setSelectedDuplicateUsers([...selectedDuplicateUsers, item]);
    }
  };


  const shareOnWhatsApp = (item) => {
    const userId = item.user_id;
    const count = item.count;
    const text = `*Greetings*,\nWe have discovered your *${count}* images captured during the event *"${eventName}"*.\nKindly proceed to the provided URL to access and view your photographs:\n${serverIp}/share/${eventName}/${userId}\n\nCheers,\n*Flashback*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const saveShareDetails = async (item) => {

    try{
      const user =localStorage.userPhoneNumber;
      

      const response = await API_UTIL.post(`/saveProShareDetails`,{user:user,sharedUser:item.user_id,eventName:eventName});
      if (response.status === 200) {

        updateRewardPoints(10);
      } else {
        throw new Error("Failed to save share info");
      }

    }catch(error){
      console.error("Error fetching user thumbnails:", error);
    }

  };

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnails/${eventName}`);
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
      const response = await API_UTIL.get(`/getClientDetailsByEventname/${eventName}`);
      if (response.status === 200) {
        setClientDetails(response.data);
        console.log(response.data.user_name)        
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
      const response = await API_UTIL.get(`/getUserDetails/${localStorage.getItem('userphoneNumber')}`);
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

  const updateRewardPoints = async (points) =>{
    const updateData = {
      user_phone_number:localStorage.userPhoneNumber,
      reward_points : userDetails?.reward_points ? userDetails.reward_points + points : 50 + points
    };
  
    try {
      const response = await API_UTIL.post('/updateUserDetails', updateData);
      if (response.status === 200) {
        setRewardPoints(points)
        setShowRewardPointsPopUp(true);
        setUserDetails(response.data.data)
      } else {
        console.log("Failed to update user details. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  
  }

  useEffect(() => {
    if (isDataFetched.current) return;
    fetchThumbnails();
    
    isDataFetched.current = true;
  }, []);

  return (
    <div className="page-container">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <AppBar/>
         {/*{userDetails.user_phone_number && (*/}
         {/* <Header clientObj={clientDetails} userObj={userDetails} eventName={eventName} />*/}
         {/*)}*/}
          <div className="content-wrap">
            <div className="statsSections">
            <div className="toolbar">
              <button onClick={handleMergeClick}>Merge Duplicate Faces</button>
            </div>

            <div className="totalCount">
                <label>Total Attendees: {userThumbnails.length}</label>
              </div>
            </div>
            {showMergeDuplicateUsers && (
              <MergeDuplicateUsers
                onClose={handleCloseMerge}
                onMerge={handleMerge}
                thumbnails={userThumbnails}
                selectedMainUser={selectedMainUser}
                selectedDuplicateUsers={selectedDuplicateUsers}
                onMainUserSelect={setSelectedMainUser}
                onDuplicateUserSelect={setSelectedDuplicateUsers}
              />
            )}
            {userThumbnails.length > 0 ? (
            <>
              
              <div className="wrapper-pro">
                {userThumbnails.map((item, index) => (
                  <div 
                    key={index} 
                    className={`wrapper-images-pro ${
                      (mergeMode && selectedMainUser === item) ? 'selected-main' :
                      (mergeMode && selectedDuplicateUsers.includes(item)) ? 'selected-duplicate' : ''
                    }`}
                    onClick={() => handleClick(item)}
                  >
                    <LazyLoadImage
                      src={item.face_url}
                      alt={`User ${index + 1}`}
                    />
                    <p>{item.count}</p>
                  </div>
                ))}

                {/* {showRewardPointsPopUp && (
                <div className="popup">
                  <div className="popup-content">
                    <h2>Congratulations!</h2>
                    <p>You have received {rewardPoints} reward points!</p>
                    <button onClick={handleClosePopup}>X</button>
                  </div>
                </div>
              )} */}
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
    </div>
  );
}

export default Pro;
