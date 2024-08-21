import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowDownToLine, Share2, ArrowRight, ArrowLeft } from "lucide-react";
import LoadingSpinner from "../Loader/LoadingSpinner"; // Ensure you have a LoadingSpinner component
import API_UTIL from "../../services/AuthIntereptor";
import "./ImageModal.css";

const Modal = ({
  clickedImg,
  clickedImgFavourite,
  setClickedImg,
  clickedUrl,
  handleBackButton,
  handleFavourite,
  favourite = true,
  sharing = true,
  close = true,
  select = false,
  imagesData = [], // All images in the current tab
  initialFavourite = false, // The initial favourite state
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentImgUrl, setCurrentImgUrl] = useState(clickedUrl);
  const navigate = useNavigate();

  useEffect(() => {
    setIsFavourite(clickedImgFavourite);
    setCurrentIndex(imagesData.findIndex((img) => img.s3_url === clickedImg));
  }, [clickedImgFavourite, clickedImg, imagesData]);

  useEffect(() => {
    const handleSwipe = (e) => {
      const touchStartX = e.touches[0].clientX;
      const handleMove = (moveEvent) => {
        const touchEndX = moveEvent.touches[0].clientX;
        if (touchStartX - touchEndX > 50) {
          handleNextImage();
        } else if (touchEndX - touchStartX > 50) {
          handlePrevImage();
        }
        document.removeEventListener("touchmove", handleMove);
      };
      document.addEventListener("touchmove", handleMove);
      document.addEventListener("touchend", () => {
        document.removeEventListener("touchmove", handleMove);
      }, { once: true });
    };

    document.addEventListener("touchstart", handleSwipe);

    return () => {
      document.removeEventListener("touchstart", handleSwipe);
    };
  }, [currentIndex, imagesData]);

  const downloadCurrentImage = async () => {
    if (!currentImgUrl) {
      console.error("No current image found");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await API_UTIL.post(`/downloadImage`, {
        imageUrl: currentImgUrl,
      });
      if (response.status === 200) {
        const link = document.createElement("a");
        link.href = response.data;
        link.download = currentImgUrl;
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

  const addToFavourite = (e) => {
    e.stopPropagation(); // Prevent modal from closing
    const newFavState = !isFavourite;
    handleFavourite(clickedImg, newFavState);
    setIsFavourite(newFavState);

    // Update the imagesData array to reflect the change in favorite status
    const updatedImagesData = imagesData.map((img) => {
      if (img.s3_url === clickedImg) {
        return { ...img, selected: newFavState };
      }
      return img;
    });

    // Update currentIndex
    setCurrentIndex(updatedImagesData.findIndex(img => img.s3_url === clickedImg));

  };

  const share = () => {
    const shareAbleUrl = `${process.env.REACT_APP_SERVER_IP}/share/${currentImgUrl.split(".jpg")[0]}?redirectTo=singleImage`;
    const text = `${shareAbleUrl}\n Click and follow url to *View* and *Download Image*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleModalClose = () => {
    setClickedImg(null);
    navigate(".", { replace: true }); // Remove the image parameter from the URL
  };

  const handleNextImage = () => {
    let currentArray;
    if (initialFavourite) {
      if(!imagesData.filter(img => img.selected === true).length)
        return handleModalClose();
      currentArray = imagesData.filter(img => img.selected === true);
    } else {
      if(!imagesData.filter(img => img.selected === false || img.selected === undefined))
        return handleModalClose();
      currentArray = imagesData.filter(img => img.selected === false || img.selected === undefined);
    }

    const currentIndexInArray = currentArray.findIndex(img => img.s3_url === clickedImg);
    const nextIndex = (currentIndexInArray + 1) % currentArray.length;

    setClickedImg(currentArray[nextIndex].s3_url);
    setIsFavourite(currentArray[nextIndex].selected);
    setCurrentIndex(nextIndex);
    setCurrentImgUrl(currentArray[nextIndex].s3_url.split("amazonaws.com/")[1]);
  };

  const handlePrevImage = () => {
    let currentArray;
    if (initialFavourite) {
      currentArray = imagesData.filter(img => img.selected === true);
    } else {
      currentArray = imagesData.filter(img => img.selected === false || img.selected === undefined);
    }

    const currentIndexInArray = currentArray.findIndex(img => img.s3_url === clickedImg);
    const prevIndex = (currentIndexInArray - 1 + currentArray.length) % currentArray.length;

    setClickedImg(currentArray[prevIndex].s3_url);
    setIsFavourite(currentArray[prevIndex].selected);
    setCurrentIndex(prevIndex);
    setCurrentImgUrl(currentArray[prevIndex].s3_url.split("amazonaws.com/")[1]);
  };

  return (
    <div className="overlay dismiss" onClick={handleModalClose}>
      <div className="modalOuter lazyImage" onClick={(e) => e.stopPropagation()}>

        {!imageLoaded && <LoadingSpinner />} {/* Show spinner while image is loading */}
        <img
          src={clickedImg}
          alt="bigger pic"
          onLoad={() => setImageLoaded(true)} // Set imageLoaded to true when image is loaded
          style={{ display: imageLoaded ? 'block' : 'none' }} // Hide image until it's loaded
        />
        {imageLoaded && ( // Only show the toolbox if the image is loaded
          <div className="imageToolBox">


            {close && (
          //       <span className="dFlex alignCenter cursor-pointer dismiss" onClick={handleModalClose}>
          //     Go-Back
          // </span>
              <ArrowLeft className="back-left-arrow dismiss" onClick={handleModalClose} />
            )}


            {(favourite || select) && (
              <div
                className="dFlex alignCenter cursor-pointer"
                onClick={(e) => {
                  addToFavourite(e);
                  handleNextImage();
                }}
              >
                <Heart className={"favourite " + (isFavourite ? "bgRed" : "")} />
                {isFavourite ? "Unselect" : "Select"}
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
                <Share2 className="share-icon" />
                Share
              </div>
            )}



          </div>
        )}
        <ArrowLeft className="modal-arrow left-arrow" onClick={handlePrevImage} />
        <ArrowRight className="modal-arrow right-arrow" onClick={handleNextImage} />
      </div>
    </div>
  );
};

export default Modal;


