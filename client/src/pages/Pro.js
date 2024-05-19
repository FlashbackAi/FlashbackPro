import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "../components/ImageModal";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Helmet } from "react-helmet";
import PlaceholderImage from "../Media/blurredLogo.png";
import Header from "../components/Header";
import { set } from "internal-slot";

function Pro() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const { eventName} = useParams();
  const [userThumbnails, setUserThumbnails] = useState([]);
  const username = sessionStorage.getItem("username");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const isDataFetched = useRef(false);
  const history = useNavigate();
  const [clickedImg, setClickedImg] = useState(null);


  const handleClick = (item) => {
    shareOnWhatsApp(item);
    setClickedImg(true);
  };

  const shareOnWhatsApp = (item) => {
    const userId = item.user_id;
    const text = `Hey we have found images of you please follow the url to view images ${serverIP}/pictures/${eventName}/${userId}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await axios.get(
        `${serverIP}/userThumbnails/${eventName}`
      );
      if (response.status === 200) {
        
        setUserThumbnails(response.data)

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
    <div>
      {isLoading ? (
        <LoadingSpinner /> // You can replace this with a spinner or loader component
      ) : (
        <>
          <Header />
          {userThumbnails.length > 0 ? (
            <div className="wrapper">
              {userThumbnails.map((item, index) => (
                <div key={index} className="wrapper-images">
                  <LazyLoadImage
                    src={item.face_url}
                    onClick={() => handleClick(item)}
                  />
                </div>
              ))}
              <div>
                {clickedImg && (
                  <></>
                )}
              </div>
            </div>
          ) : fetchTimeout ? (
            <p>No images to display</p> // Message shown if fetch timeout is reached
          ) : (
            <p>Failed to load images</p> // Message shown if images fetch fails for other reasons
          )}
        </>
      )}
    </div>
  );
}

export default Pro;