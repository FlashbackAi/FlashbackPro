// import React, { useState, useEffect } from "react";
// import logo from "../../media/images/logoCropped.png";
// import "./Header.css";
// import axios from 'axios';
// import API_UTIL from "../../services/AuthIntereptor";

// const Header = ({ clientObj, userObj, eventName, dontshowredeem }) => {
//   const [instaClick, setInstaClick] = useState(false);
//   const [youtubeClick, setYoutubeClick] = useState(false);
//   const [redeemPoints, setRedeemPoints] = useState(userObj.reward_points ? userObj.reward_points : 50);

//   useEffect(() => {
//     const updateInteraction = async () => {
//       if (instaClick || youtubeClick) {
//         try {
//           const requestData = {
//             userPhoneNumber: userObj.user_phone_number,
//             clientName: clientObj.user_name,
//             eventName: eventName, // replace with actual event name if available
//             rewardPoints: userObj.reward_points
//           };

//           console.log('Sending request to server with data:', requestData);

//           const response = await API_UTIL.post("/updateUserClientInteraction", requestData);

//           // Log the response to the console
//           console.log('Server response:', response.data);
//           if(response.data.rewardPoints){
//             setRedeemPoints(response.data.rewardPoints);
//           }

//         } catch (error) {
//           console.error("Error updating user-client interaction:", error);
//           if (error.response) {
//             console.error("Server responded with status code:", error.response.status);
//             console.error("Response data:", error.response.data);
//           }
//         } finally {
//           // Reset the click states to avoid repeated updates
//           setInstaClick(false);
//           setYoutubeClick(false);
//         }
//       }
//     };

//     updateInteraction();
//   }, [instaClick, youtubeClick, clientObj, userObj]);

//   return (
//     <>
//       <header className="stickToTop">
//         <h2>FlashBack</h2>
//         <div className="second-header-container">
//           {!dontshowredeem && <div className="redeem-points">Redeem Points - {redeemPoints}</div>}
//           {clientObj &&
//             <>
//               <h3>An Event By {clientObj.user_name}</h3>
//               <div>
//                 <a href={clientObj.social_media.instagram} target="_blank" rel="noopener noreferrer">
//                   <img src="https://img.icons8.com/ffffff/fluent/2x/instagram-new.png" alt="Instagram" onClick={() => setInstaClick(true)} />
//                 </a>
//                 <a href={clientObj.social_media.youtube} target="_blank" rel="noopener noreferrer">
//                   <img src="https://img.icons8.com/ffffff/color/2x/youtube-play.png" alt="YouTube" onClick={() => setYoutubeClick(true)} />
//                 </a>
//               </div>
//             </>}
//         </div>
//       </header>
//     </>
//   );
// };

// export default Header;

import React, { useState, useEffect} from "react";
import logo from "../../media/images/logoCropped.png";
import "./Header.css";
import API_UTIL from "../../services/AuthIntereptor";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router";

const Header = ({ clientObj, userObj, eventName, dontshowredeem }) => {
  const [instaClick, setInstaClick] = useState(false);
  const [youtubeClick, setYoutubeClick] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(userObj?.reward_points ? userObj?.reward_points : 50);
  const [showPopup, setShowPopup] = useState(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const [portfolioClick, setPortfolioClick] = useState(false)
  const navigate = useNavigate();

  console.log(userObj?.reward_points)

  useEffect(() => {
    // Update redeem points when userObj prop changes
    setRedeemPoints(userObj?.reward_points ? userObj.reward_points : 50);
  }, [userObj]);


  const updateInteraction = async () => {
    console.log("logged");
    console.log(portfolioClick)
    if (instaClick || youtubeClick || portfolioClick) {
      try {
        const requestData = {
          userPhoneNumber: userObj.user_phone_number,
          clientName: clientObj.user_name,
          eventName: eventName, // replace with actual event name if available
          rewardPoints: redeemPoints,
        };

        console.log('Sending request to server with data:', requestData);

        const response = await API_UTIL.post("/updateUserClientInteraction", requestData);

        // Log the response to the console
        console.log('Server response:', response.data);
        if (response.data.rewardPoints ) {
          setRedeemPoints(response.data.rewardPoints);
          setShowPopup(true); // Show the popup
        }

      } catch (error) {
        console.error("Error updating user-client interaction:", error);
        if (error.response) {
          console.error("Server responded with status code:", error.response.status);
          console.error("Response data:", error.response.data);
        }
      } finally {
        // Reset the click states to avoid repeated updates
        setInstaClick(false);
        setYoutubeClick(false);       
        setPortfolioClick(false)
      }
    }
  };


  useEffect(() => {
    
    updateInteraction();
  }, [instaClick, youtubeClick, portfolioClick, clientObj, userObj, eventName]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleRedeemPointsClick = () => {
    setShowComingSoonPopup(true);
  };

  const handleCloseComingSoonPopup = () => {
    setShowComingSoonPopup(false);
  };

  const PortfolioClick = async ()=>{
    setPortfolioClick(true);
  }

  return (
    <>
      <header className="stickToTop">
        <h2>FlashBack</h2>
        {clientObj &&
            
        <div className="second-header-container">
          

              <div>

                <h3>Clicked by - <a href="/portfolio"  target = "_blank" onClick={PortfolioClick}>{clientObj.user_name}</a></h3>
                <a href={clientObj.social_media.instagram} target="_blank" rel="noopener noreferrer">
                  <img src="https://img.icons8.com/ffffff/fluent/2x/instagram-new.png" alt="Instagram" onClick={() => setInstaClick(true)} />
                </a>
                <a href={clientObj.social_media.youtube} target="_blank" rel="noopener noreferrer">
                  <img src="https://img.icons8.com/ffffff/color/2x/youtube-play.png" alt="YouTube" onClick={() => setYoutubeClick(true)} />
                </a>
              </div>

              {!dontshowredeem && <div className="redeem-points" onClick={handleRedeemPointsClick}>Redeem Points - {redeemPoints} 🪙</div>}
            
        </div>
        }
      </header>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Congratulations!</h2>
            <p>You have received 10 reward points!</p>
            <button onClick={handleClosePopup}>X</button>
          </div>
        </div>
      )}

      {showComingSoonPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Coming Soon!</h2>
            <h2>Redeem the Points for Amazon Gift Cards</h2>
            <h4>Follow your Photographer Instagram & Youtube to Earn more Points</h4>
            <button onClick={handleCloseComingSoonPopup}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
