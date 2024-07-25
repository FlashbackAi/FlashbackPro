import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Header from "../../components/Header/Header";
import API_UTIL from "../../services/AuthIntereptor";
import Footer from "../../components/Footer/Footer";
import "../../components/Footer/Footer.css";
import MergeDuplicateUsers from "./MergeDuplicateUsers";
import "./Pro.css";

function Pro() {
  const { eventName } = useParams();
  const [userThumbnails, setUserThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const isDataFetched = useRef(false);
  const [clickedImg, setClickedImg] = useState(null);
  const serverIp = process.env.REACT_APP_SERVER_IP;
  const [showMergeDuplicateUsers, setShowMergeDuplicateUsers] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedMainUser, setSelectedMainUser] = useState(null);
  const [selectedDuplicateUsers, setSelectedDuplicateUsers] = useState([]);

  const handleClick = (item) => {
    if (mergeMode) {
      handleThumbnailClick(item);
    } else {
      shareOnWhatsApp(item);
      setClickedImg(true);
    }
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
      await fetchThumbnails();
      handleCloseMerge();
    } catch (error) {
      console.error("Error merging users:", error);
    }
  };

  const shareOnWhatsApp = (item) => {
    const userId = item.user_id;
    const count = item.count;
    const text = `*Greetings*,\nWe have discovered your *${count}* images captured during the event *"${eventName}"*.\nKindly proceed to the provided URL to access and view your photographs:\n${serverIp}/share/${eventName}/${userId}\n\nCheers,\n*Flashback*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleThumbnailClick = (item) => {
    if (!selectedMainUser) {
      setSelectedMainUser(item);
    } else if (selectedDuplicateUsers.length < 5 && !selectedDuplicateUsers.includes(item) && item !== selectedMainUser) {
      setSelectedDuplicateUsers([...selectedDuplicateUsers, item]);
    }
  };

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);
    try {
      const response = await API_UTIL.get(`/userThumbnails/${eventName}`);
      if (response.status === 200) {
        setUserThumbnails(response.data);
      } else {
        throw new Error("Failed to fetch user thumbnails");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <Header />
          <div className="content-wrap">
            <div className="toolbar">
              <button onClick={handleMergeClick}>Merge Duplicate Faces</button>
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
              </div>
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