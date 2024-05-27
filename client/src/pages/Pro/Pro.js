import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import Modal from "../../components/ImageModal/ImageModal";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PlaceholderImage from "../../media/images/blurredLogo.png";
import Header from "../../components/Header/Header";
import { set } from "internal-slot";
import API_UTIL from "../../services/AuthIntereptor";

function Pro() {
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
    const text = `*Greetings*,\nWe have discovered your images captured during the event *"${eventName}"*.\nKindly proceed to the provided URL to access and view your photographs:\nhttps://app.flashback.inc/photos/${eventName}/${userId}\n\nCheers,\n*Flashback*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };
  
  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(
        `/userThumbnails/${eventName}`
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