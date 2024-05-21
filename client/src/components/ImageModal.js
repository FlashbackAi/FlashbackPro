import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LazyLoadComponent,
  LazyLoadImage,
} from "react-lazy-load-image-component";
import PlaceholderImage from "../Media/blurredLogo.png";
import LoadingSpinner from "../pages/LoadingSpinner";
import { ArrowDownToLine, Heart } from "lucide-react";
import API_UTIL from "../services/AuthIntereptor";

const ImageModal = ({
  clickedImg,
  setClickedImg,
  clickedUrl,
  handleBackButton,
}) => {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const history = useNavigate();
  const handleClick = (e) => {
    if (e.target.classList.contains("dismiss")) {
      setClickedImg(null);
      history(-1);
    }
  };

  const galleryRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadCurrentImage = async () => {
    // const currentIndex = galleryRef.current.getCurrentIndex();
    // const currentImage = images[currentIndex];

    if (!clickedImg) {
      console.error("No current image found");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await API_UTIL.post(`${serverIP}/downloadImage`, {
        imageUrl: clickedUrl,
      });
      if (response.status === 200) {
        console.log(response);
        const link = document.createElement("a");
        link.href = response.data;
        link.download = clickedUrl;
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("Failed to fetch images");
      }

      // const response = await axios.get(clickedImg);
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', clickedUrl);
      // document.body.appendChild(link);
      // link.click();
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsDownloading(false); // End downloading
    }
  };

  const onLoad = (event) => {
    console.log(event);
    const lazySpan = document.querySelector(".lazyImage");
    const loader = document.querySelector(
      ".overlay.dismiss .loading-spinner-container"
    );
    loader && loader.remove();
    lazySpan && lazySpan.classList.add("visible");
  };

  const addToFavourite = (event) => {
    const fav = document.querySelector(".favourite");
    fav.classList.add("bgRed");
  };

  return (
    <>
      <div className="overlay dismiss" onClick={handleClick}>
        <LoadingSpinner />
        <div className="modalOuter lazyImage hidden">
          <span className="dismiss" onClick={handleBackButton}>
            X
          </span>
          <img onLoad={onLoad} src={clickedImg} alt="bigger pic" />
          <div className="imageToolBox">
            {/* {download && (
              <button
                onClick={downloadCurrentImage}
                disabled={isDownloading}
                className="downloadButton"
                id="download"
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            )} */}
            {/* <div className="dFlex alignCenter" onClick={addToFavourite}>
              <Heart className="favourite" />
              Favourite
            </div> */}
            <div
              className="dFlex alignCenter"
              onClick={downloadCurrentImage}
              disabled={isDownloading}
              id="download"
            >
              {isDownloading ? (
                <span className="isDownloading">
                  Downloading...
                </span>
              ) : (
                <>
                  <ArrowDownToLine />
                  Download
                </>
              )}
            </div>
          </div>
          {/* <button
            onClick={downloadCurrentImage}
            disabled={isDownloading}
            className="downloadButton"
          >
            {isDownloading ? "Downloading..." : "Download"}
          </button> */}
        </div>
      </div>
    </>
  );
};

export default ImageModal;
