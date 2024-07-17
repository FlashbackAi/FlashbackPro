import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowDownToLine, Share2, ArrowLeft, ArrowRight } from "lucide-react";
import LoadingSpinner from "../Loader/LoadingSpinner"; // Ensure you have a LoadingSpinner component
import API_UTIL from "../../services/AuthIntereptor";

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
  imagesData = [],  // Pass imagesData as a prop
  setClickedImgFavourite // Add the setter prop
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current image index
  const navigate = useNavigate();

  useEffect(() => {
    const currentIndex = imagesData.findIndex(image => image.s3_url === clickedImg);
    setCurrentIndex(currentIndex);
  }, [clickedImg, imagesData]);

  // const navigateImages = (direction) => {

  //   const filteredImages = imagesData.filter(image => (image.selected !== undefined ? image.selected : false) === isFavourite);

  //   let newIndex = filteredImages.findIndex(image => image.s3_url === clickedImg) + direction;

  //   // Ensure the newIndex wraps around the array length
  //   if (newIndex < 0) newIndex = filteredImages.length - 1;
  //   if (newIndex >= filteredImages.length) newIndex = 0;

  //   const newImage = filteredImages[newIndex];
  //   if (newImage) {
  //     setCurrentIndex(newIndex);
  //     setClickedImg(newImage.s3_url);
  //     setIsFavourite(newImage.selected !== undefined ? newImage.selected : false); // Update the favourite state
  //     setClickedImgFavourite(newImage.selected !== undefined ? newImage.selected : false); // Update the favourite state in PhotoSelection
  //   }
  // };

  const downloadCurrentImage = async () => {
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

  const addToFavourite = (e) => {
    e.stopPropagation(); // Prevent modal from closing
    const newFavState = !isFavourite;
    handleFavourite(clickedImg, newFavState);
    setIsFavourite(newFavState);
    setClickedImgFavourite(newFavState);
  };

  const share = () => {
    const shareAbleUrl = `${process.env.REACT_APP_SERVER_IP}/share/${clickedUrl.split(".jpg")[0]}?redirectTo=singleImage`;
    const text = `${shareAbleUrl}\n Click and follow url to *View* and *Download Image*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleModalClose = () => {
    setClickedImg(null);
    navigate(".", { replace: true }); // Remove the image parameter from the URL
  };

  return (
    <div className="overlay dismiss" onClick={handleModalClose}>
      <div className="modalOuter lazyImage" onClick={(e) => e.stopPropagation()}>
        {close && (
          <span className="dismiss" onClick={handleModalClose}>
            X
          </span>
        )}
        {!imageLoaded && <LoadingSpinner />} {/* Show spinner while image is loading */}
        <img
          src={clickedImg}
          alt="bigger pic"
          onLoad={() => setImageLoaded(true)} // Set imageLoaded to true when image is loaded
          style={{ display: imageLoaded ? 'block' : 'none' }} // Hide image until it's loaded
        />
        {imageLoaded && ( // Only show the toolbox if the image is loaded
          <div className="imageToolBox">
            {(favourite || select) && (
              <div
                className="dFlex alignCenter cursor-pointer"
                onClick={addToFavourite}
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
                <Share2 className={"favourite " + (isFavourite ? "bgRed" : "")} />
                Share
              </div>
            )}
          </div>
        )}
         {imageLoaded && ( // Add navigation arrows
        <>
          {/* <ArrowLeft className="navigation-arrow" onClick={() => navigateImages(-1)} />
          <ArrowRight className="navigation-arrow" onClick={() => navigateImages(1)} /> */}
        </>
      )}
      </div>
    </div>
  );
};

export default Modal;