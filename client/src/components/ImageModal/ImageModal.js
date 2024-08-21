// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import LoadingSpinner from "../Loader/LoadingSpinner";
// import { ArrowDownToLine, Heart, Share2 } from "lucide-react";
// import API_UTIL from "../../services/AuthIntereptor";
// import { toast } from "react-toastify";

// const ImageModal = ({
//   clickedImg,
//   clickedImgIndex,
//   setClickedImg,
//   clickedUrl,
//   handleBackButton,
//   handleFavourite,
//   clickedImgFavourite,
//   favourite =true,
//   sharing = true,
//   close = true,
//   select = false,
// }) => {
//   const history = useNavigate();
//   const handleClick = (e) => {
//     if (e.target.classList.contains("dismiss")) {
//       setClickedImg(null);
//       history(-1);
//     }
//   };

//   console.log(clickedUrl);
//   const galleryRef = useRef(null);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
//   const downloadCurrentImage = async () => {
//     // const currentIndex = galleryRef.current.getCurrentIndex();
//     // const currentImage = images[currentIndex];

//     if (!clickedImg) {
//       console.error("No current image found");
//       return;
//     }

//     setIsDownloading(true);
//     try {
//       const response = await API_UTIL.post(`/downloadImage`, {
//         imageUrl: clickedUrl,
//       });
//       if (response.status === 200) {
//         console.log(response);
//         const link = document.createElement("a");
//         link.href = response.data;
//         link.download = clickedUrl;
//         document.body.appendChild(link); // Required for FF
//         link.click();
//         document.body.removeChild(link);
//       } else {
//         throw new Error("Failed to fetch images");
//       }

//       // const response = await axios.get(clickedImg);
//       // const url = window.URL.createObjectURL(new Blob([response.data]));
//       // const link = document.createElement('a');
//       // link.href = url;
//       // link.setAttribute('download', clickedUrl);
//       // document.body.appendChild(link);
//       // link.click();
//     } catch (error) {
//       console.error("Error fetching images:", error);
//     } finally {
//       setIsDownloading(false); // End downloading
//     }
//   };

//   const onLoad = () => {
//     const lazySpan = document.querySelector(".lazyImage");
//     const loader = document.querySelector(
//       ".overlay.dismiss .loading-spinner-container"
//     );
//     loader && loader.remove();
//     lazySpan && lazySpan.classList.add("visible");
//   };

//   const addToFavourite = () => {
//     const fav = document.querySelector(".favourite");
//     if (isFavourite) fav.classList.remove("bgRed");
//     else fav.classList.add("bgRed");

//     handleFavourite(clickedImgIndex, clickedImg, !isFavourite);
//     setIsFavourite((isFav) => !isFav);
//   };

//   const share = () => {
//     const shareAbleUrl = `${process.env.REACT_APP_SERVER_IP}/share/${clickedUrl.split(".jpg")[0]}?redirectTo=singleImage`;
//     // navigator.clipboard.writeText(shareAbleUrl);
//     // toast("Copied link to clipboard!!");
//     const text = `${shareAbleUrl}\n Click and follow url to *View* and *Download Image*`;
//     const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
//     window.open(whatsappUrl, "_blank");
//   };

//   return (
//     <>
//       <div className="overlay dismiss" onClick={handleClick}>
//         <LoadingSpinner />
//         <div className="modalOuter lazyImage hidden">
//           {close &&(
//           <span className="dismiss" onClick={handleBackButton}>
//             X
//           </span>)}
//           <img onLoad={onLoad} src={clickedImg} alt="bigger pic" />
//           <div className="imageToolBox">
//             {/* {download && (
//               <button
//                 onClick={downloadCurrentImage}
//                 disabled={isDownloading}
//                 className="downloadButton"
//                 id="download"
//               >
//                 {isDownloading ? "Downloading..." : "Download"}
//               </button>
//             )} */}
//              {favourite && (
//             <div
//               className="dFlex alignCenter cursor-pointer"
//               onClick={addToFavourite}
//             >
              
//               <Heart
//                 className={"favourite " + (clickedImgFavourite && "bgRed")}
//               />
//               Favourite
//             </div>
//              )}
//              {select && (
//             <div
//               className="dFlex alignCenter cursor-pointer"
//               onClick={addToFavourite}
//             >
              
//               <Heart
//                 className={"favourite " + (clickedImgFavourite && "bgRed")}
//               />
//               Select
//             </div>
//              )}
//             <div
//               className="dFlex alignCenter"
//               onClick={downloadCurrentImage}
//               disabled={isDownloading}
//               id="download"
//             >
//               {isDownloading ? (
//                 <span className="isDownloading">Downloading...</span>
//               ) : (
//                 <>
//                   <ArrowDownToLine />
//                   Download
//                 </>
//               )}
//             </div>
//             {sharing &&(
//             <div className="dFlex alignCenter cursor-pointer" onClick={share}>
//               <Share2
//                 className={"favourite " + (clickedImgFavourite && "bgRed")}
//               />
//               Share
//             </div>
//             )}
//           </div>
//           {/* <button
//             onClick={downloadCurrentImage}
//             disabled={isDownloading}
//             className="downloadButton"
//           >
//             {isDownloading ? "Downloading..." : "Download"}
//           </button> */}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ImageModal;

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

  useEffect(() => {
    setClickedImg(images[currentIndex].original);
    setIsFavourite(images[currentIndex].isFavourites);
  }, [currentIndex, images, setClickedImg]);

  const handleClick = (e) => {
    if (e.target.classList.contains("dismiss")) {
      setClickedImg(null);
      history(-1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSwipe = (e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;

    const handleMove = (moveEvent) => {
      const moveTouch = moveEvent.touches[0];
      const moveX = moveTouch.clientX;

      if (startX - moveX > 50) {
        handleNext();
        document.removeEventListener("touchmove", handleMove);
      } else if (moveX - startX > 50) {
        handlePrev();
        document.removeEventListener("touchmove", handleMove);
      }
    };

    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", () => {
      document.removeEventListener("touchmove", handleMove);
    }, { once: true });
  };

  

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
    <div className="overlay dismiss" onClick={handleClick} onTouchStart={handleSwipe}>
      <LoadingSpinner />
      <div className="modalOuter lazyImage hidden">
        {/*{close && (*/}
        {/*  <span className="dismiss" onClick={handleBackButton}>*/}
        {/*    X*/}
        {/*  </span>*/}
        {/*)}*/}

        <img onLoad={onLoad} src={clickedImg} alt="bigger pic" />
        <div className="imageToolBox">

          {close && (
              //       <span className="dFlex alignCenter cursor-pointer dismiss" onClick={handleModalClose}>
              //     Go-Back
              // </span>
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



