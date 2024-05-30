import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Loader/LoadingSpinner";
import { ArrowDownToLine, Heart, Share2 } from "lucide-react";
import API_UTIL from "../../services/AuthIntereptor";
import { toast } from "react-toastify";

const ImageModal = ({
  clickedImg,
  clickedImgIndex,
  setClickedImg,
  clickedUrl,
  handleBackButton,
  handleFavourite,
  clickedImgFavourite,
}) => {
  const history = useNavigate();
  const handleClick = (e) => {
    if (e.target.classList.contains("dismiss")) {
      setClickedImg(null);
      history(-1);
    }
  };

  const galleryRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
  const downloadCurrentImage = async () => {
    // const currentIndex = galleryRef.current.getCurrentIndex();
    // const currentImage = images[currentIndex];

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

  const onLoad = () => {
    const lazySpan = document.querySelector(".lazyImage");
    const loader = document.querySelector(
      ".overlay.dismiss .loading-spinner-container"
    );
    loader && loader.remove();
    lazySpan && lazySpan.classList.add("visible");
  };

  const addToFavourite = () => {
    const fav = document.querySelector(".favourite");
    if (isFavourite) fav.classList.remove("bgRed");
    else fav.classList.add("bgRed");
    handleFavourite(clickedImgIndex, clickedImg, !isFavourite);
    setIsFavourite((isFav) => !isFav);
  };

  const share = () => {
    const shareAbleUrl = `${process.env.REACT_APP_SERVER_IP}/share/${clickedUrl.split(".jpg")[0]}?redirectTo=singleImage`;
    navigator.clipboard.writeText(shareAbleUrl);
    toast("Copied link to clipboard!!");
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
            <div
              className="dFlex alignCenter cursor-pointer"
              onClick={addToFavourite}
            >
              <Heart
                className={"favourite " + (clickedImgFavourite && "bgRed")}
              />
              Favourite
            </div>
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
            <div className="dFlex alignCenter cursor-pointer" onClick={share}>
              <Share2
                className={"favourite " + (clickedImgFavourite && "bgRed")}
              />
              Share
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
