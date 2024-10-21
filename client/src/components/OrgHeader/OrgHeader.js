

import React, { useState, useEffect} from "react";
// import logo from "../../media/images/logoCropped.png";
import "./OrgHeader.css";
// import API_UTIL from "../../services/AuthIntereptor";
// import { Link } from "react-router-dom";
// import { useParams, useNavigate } from "react-router";

const OrgHeader = ({ orgObj, modelName, showPoints =true }) => {
  // const [instaClick, setInstaClick] = useState(false);
  // const [youtubeClick, setYoutubeClick] = useState(false);
  const [points, setPoints] = useState(orgObj?.reward_points);
  const [showPopup, setShowPopup] = useState(false);
  // const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  // const [portfolioClick, setPortfolioClick] = useState(false)
  // const navigate = useNavigate();

  useEffect(() => {
    // Update redeem points when userObj prop changes
    setPoints(orgObj?.reward_points );
  }, [orgObj]);


  


  // useEffect(() => {
  //   const updateInteraction = async () => {

  //       try {
  //         const requestData = {
  //           user_phone_number: orgObj.user_phone_number,
  //           reward_points: points,
  //         };
  
  //         console.log('Sending request to server with data:', requestData);
  
  //         const response = await API_UTIL.post("/updateUserDetails", requestData);
  
  //         // Log the response to the console
  //         console.log('Server response:', response.data);
  //         if (response.data.rewardPoints ) {
  //           setPoints(response.data.rewardPoints);
  //           setShowPopup(true); // Show the popup
  //         }
  
  //       } catch (error) {
  //         console.error("Error in registering the model:", error);
  //         if (error.response) {
  //           console.error("Server responded with status code:", error.response.status);
  //           console.error("Response data:", error.response.data);
  //         }
  //       }
  //   };

  //   updateInteraction();
  // }, [ orgObj,points]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // const handleRedeemPointsClick = () => {
  //   setShowComingSoonPopup(true);
  // };

  // const handleCloseComingSoonPopup = () => {
  //   setShowComingSoonPopup(false);
  // };

  // const PortfolioClick = async ()=>{
  //   setPortfolioClick(true);
  // }

  return (
    <div className="orgHeader-root">

        {orgObj &&
            
        <>
          

              <div className="org-name">

                {/* <h3>Clicked by - <a href="/portfolio"  target = "_blank" onClick={PortfolioClick}>{clientObj.user_name}</a></h3>
                <a href={clientObj.social_media.instagram} target="_blank" rel="noopener noreferrer">
                  <img src="https://img.icons8.com/ffffff/fluent/2x/instagram-new.png" alt="Instagram" onClick={() => setInstaClick(true)} />
                </a>
                <a href={clientObj.social_media.youtube} target="_blank" rel="noopener noreferrer">
                  <img src="https://img.icons8.com/ffffff/color/2x/youtube-play.png" alt="YouTube" onClick={() => setYoutubeClick(true)} />
                </a> */}
                <span>{orgObj.org_name}</span>
              </div>

              {showPoints && <div className="prot-redeem-points" > <span>Points - {points} <img className='unityLogo' src='/unityLogo.png' alt=''></img></span></div>}
            
        </>
        }
      

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Congratulations!</h2>
            <p>You have Model got registered</p>
            <button onClick={handleClosePopup}>X</button>
          </div>
        </div>
      )}

      {/* {showComingSoonPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Coming Soon!</h2>
            <h2>Redeem the Points for Amazon Gift Cards</h2>
            <h4>Follow your Photographer Instagram & Youtube to Earn more Points</h4>
            <button onClick={handleCloseComingSoonPopup}>Close</button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default OrgHeader;
