import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Loader/LoadingSpinner";
import { ArrowLeft, ArrowRight, ArrowDownToLine, Heart, Share2 } from "lucide-react";
import API_UTIL from "../../services/AuthIntereptor";
import { toast } from "react-toastify";
import "./ImageModal.css";

const ImageModal = ({
  clickedImg,
  clickedImgIndex,
  setClickedImg,
  clickedUrl,
  handleBackButton,
  handleFavourite,
  clickedImgFavourite,
  images,
  favourite = true,
  sharing = true,
  close = true,
  select = false,
}) => {
  const history = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(clickedImgIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
  const touchStartRef = useRef(0);  // To store the starting touch position
  const isNavigatingRef = useRef(false);  // Track if we're navigating images

  // Define base font size for em calculation
  const baseFontSize = 16; // Adjust if your app uses a different base font size
  console.log(clickedImg)

  useEffect(() => {
    if (isNavigatingRef.current) {
      setClickedImg(images[currentIndex].thumbnail);
      setIsFavourite(images[currentIndex].isFavourites);
      isNavigatingRef.current = false;  // Reset after updating
    }
  }, [currentIndex, images, setClickedImg]);

  const handleClick = (e) => {
    if (e.target.classList.contains("dismiss")) {
      setClickedImg(null);
      history(-1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      isNavigatingRef.current = true;  // Set flag to true for navigation
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      isNavigatingRef.current = true;  // Set flag to true for navigation
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSwipeStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;  // Capture the start touch position
  };

  const handleSwipeMove = (e) => {
    const touch = e.touches[0];
    const touchEnd = touch.clientX;

    // Calculate swipe threshold in ems (1.25em * baseFontSize = 20px if baseFontSize is 16px)
    const swipeThresholdInPixels = 2 * baseFontSize;

    if (touchStartRef.current - touchEnd > swipeThresholdInPixels) {  // Swipe left
      handleNext();
      touchStartRef.current = touchEnd;  // Reset start position
    } else if (touchEnd - touchStartRef.current > swipeThresholdInPixels) {  // Swipe right
      handlePrev();
      touchStartRef.current = touchEnd;  // Reset start position
    }
  };

  const downloadCurrentImage = async (e) => {
    e.stopPropagation(); // Prevents the event from bubbling up
    if (!clickedImg) {
      console.error("No current image found");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await API_UTIL.post(`/downloadImage`, {
        imageUrl: clickedUrl,
      });
      if (response.status === 200) {
        const link = document.createElement("a");
        link.href = response.data;
        link.download = clickedUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("Failed to fetch images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const onLoad = () => {
    const lazySpan = document.querySelector(".lazyImage");
    const loader = document.querySelector(
      ".overlay.dismiss .loading-spinner-container"
    );
    loader && loader.remove();
    lazySpan && lazySpan.classList.add("visible");
  };

  const addToFavourite = (e) => {
    e.stopPropagation(); // Prevents the event from bubbling up
    const fav = document.querySelector(".favourite");
    if (isFavourite) fav.classList.remove("bgRed");
    else fav.classList.add("bgRed");

    handleFavourite(currentIndex, images[currentIndex].original, !isFavourite);
    setIsFavourite((isFav) => !isFav);
  };

  const share = () => {
    const shareAbleUrl = `${process.env.REACT_APP_SERVER_IP}/share/${clickedUrl.split(".jpg")[0]}?redirectTo=singleImage`;
    const text = `${shareAbleUrl}\n Click and follow url to *View* and *Download Image*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="overlay dismiss" onClick={handleClick} onTouchStart={handleSwipeStart} onTouchMove={handleSwipeMove}>
      <LoadingSpinner />
      <div className="modalOuter lazyImage hidden">
        <img onLoad={onLoad} src={clickedImg} alt="bigger pic" />
        <div className="imageToolBox">
          {close && (
            <ArrowLeft className="back-left-arrow dismiss" onClick={handleBackButton} />
          )}
          {favourite && (
            <div
              className="dFlex alignCenter cursor-pointer"
              onClick={addToFavourite}
            >
              <Heart className={"favourite " + (isFavourite ? "bgRed" : "")} />
              Favourite
            </div>
          )}
          {select && (
            <div
              className="dFlex alignCenter cursor-pointer"
              onClick={addToFavourite}
            >
              <Heart className={"favourite " + (isFavourite ? "bgRed" : "")} />
              Select
            </div>
          )}
          <div
            className="dFlex alignCenter"
            onClick={downloadCurrentImage}
            disabled={isDownloading}
            id="download"
          >
            {isDownloading ? (
              <span className="isDownloading">Downloading...</span>
            ) : (
              <>
                <ArrowDownToLine />
                Download
              </>
            )}
          </div>
          {sharing && (
            <div className="dFlex alignCenter cursor-pointer" onClick={share}>
              <Share2 className={"favourite " + (clickedImgFavourite && "bgRed")} />
              Share
            </div>
          )}
        </div>
        <ArrowLeft className="modal-arrow left-arrow" onClick={handlePrev} />
        <ArrowRight className="modal-arrow right-arrow" onClick={handleNext} />
      </div>
    </div>
  );
};

export default ImageModal;
