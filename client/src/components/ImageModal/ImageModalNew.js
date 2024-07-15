// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Heart, ArrowDownToLine, Share2 } from "lucide-react";
// // import LoadingSpinner from "../Loader/LoadingSpinner"; // Ensure you have a LoadingSpinner component
// // import API_UTIL from "../../services/AuthIntereptor";

// // const Modal = ({
// //   clickedImg,
// //   clickedImgFavourite,
// //   setClickedImg,
// //   clickedUrl,
// //   handleBackButton,
// //   handleFavourite,
// //   favourite = true,
// //   sharing = true,
// //   close = true,
// //   select = false,
// // }) => {
// //   const [isDownloading, setIsDownloading] = useState(false);
// //   const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
// //   const [imageLoaded, setImageLoaded] = useState(false);
// //   const navigate = useNavigate();

// //   const downloadCurrentImage = async () => {
// //     if (!clickedImg) {
// //       console.error("No current image found");
// //       return;
// //     }

// //     setIsDownloading(true);
// //     try {
// //       const response = await API_UTIL.post(`/downloadImage`, {
// //         imageUrl: clickedUrl,
// //       });
// //       if (response.status === 200) {
// //         const link = document.createElement("a");
// //         link.href = response.data;
// //         link.download = clickedUrl;
// //         document.body.appendChild(link);
// //         link.click();
// //         document.body.removeChild(link);
// //       } else {
// //         throw new Error("Failed to fetch images");
// //       }
// //     } catch (error) {
// //       console.error("Error fetching images:", error);
// //     } finally {
// //       setIsDownloading(false);
// //     }
// //   };

// //   const addToFavourite = (e) => {
// //     e.stopPropagation(); // Prevent modal from closing
// //     const newFavState = !isFavourite;
// //     handleFavourite(clickedImg, newFavState);
// //     setIsFavourite(newFavState);
// //   };

// //   const share = () => {
// //     const shareAbleUrl = `${process.env.REACT_APP_SERVER_IP}/share/${clickedUrl.split(".jpg")[0]}?redirectTo=singleImage`;
// //     const text = `${shareAbleUrl}\n Click and follow url to *View* and *Download Image*`;
// //     const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
// //     window.open(whatsappUrl, "_blank");
// //   };

// //   const handleModalClose = () => {
// //     setClickedImg(null);
// //     navigate(".", { replace: true }); // Remove the image parameter from the URL
// //   };

// //   return (
// //     <div className="overlay dismiss" onClick={handleModalClose}>
// //       <div className="modalOuter lazyImage" onClick={(e) => e.stopPropagation()}>
// //         {close && (
// //           <span className="dismiss" onClick={handleModalClose}>
// //             X
// //           </span>
// //         )}
// //         {!imageLoaded && <LoadingSpinner />} {/* Show spinner while image is loading */}
// //         <img
// //           src={clickedImg}
// //           alt="bigger pic"
// //           onLoad={() => setImageLoaded(true)} // Set imageLoaded to true when image is loaded
// //           style={{ display: imageLoaded ? 'block' : 'none' }} // Hide image until it's loaded
// //         />
// //         {imageLoaded && ( // Only show the toolbox if the image is loaded
// //           <div className="imageToolBox">
// //             {(favourite || select) && (
// //               <div
// //                 className="dFlex alignCenter cursor-pointer"
// //                 onClick={addToFavourite}
// //               >
// //                 <Heart className={"favourite " + (isFavourite ? "bgRed" : "")} />
// //                 {isFavourite ? "Unselect" : "Select"}
// //               </div>
// //             )}
// //             <div
// //               className="dFlex alignCenter"
// //               onClick={downloadCurrentImage}
// //               disabled={isDownloading}
// //               id="download"
// //             >
// //               {isDownloading ? (
// //                 <span className="isDownloading">Downloading...</span>
// //               ) : (
// //                 <>
// //                   <ArrowDownToLine />
// //                   Download
// //                 </>
// //               )}
// //             </div>
// //             {sharing && (
// //               <div className="dFlex alignCenter cursor-pointer" onClick={share}>
// //                 <Share2 className={"favourite " + (isFavourite ? "bgRed" : "")} />
// //                 Share
// //               </div>
// //             )}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Modal;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Heart, ArrowDownToLine, Share2, ArrowLeft, ArrowRight } from "lucide-react";
// import LoadingSpinner from "../Loader/LoadingSpinner"; // Ensure you have a LoadingSpinner component
// import API_UTIL from "../../services/AuthIntereptor";

// const Modal = ({
//   clickedImg,
//   clickedImgFavourite,
//   setClickedImg,
//   clickedUrl,
//   handleBackButton,
//   handleFavourite,
//   images, // New prop to receive all images
//   currentIndex, // New prop to receive current image index
//   setCurrentIndex, // New prop to update current image index
//   favourite = true,
//   sharing = true,
//   close = true,
//   select = false,
// }) => {
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setIsFavourite(clickedImgFavourite);
//   }, [clickedImgFavourite]);

//   const downloadCurrentImage = async () => {
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
//         const link = document.createElement("a");
//         link.href = response.data;
//         link.download = clickedUrl;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       } else {
//         throw new Error("Failed to fetch images");
//       }
//     } catch (error) {
//       console.error("Error fetching images:", error);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const addToFavourite = (e) => {
//     e.stopPropagation(); // Prevent modal from closing
//     const newFavState = !isFavourite;
//     handleFavourite(clickedImg, newFavState);
//     setIsFavourite(newFavState);
//   };

//   const share = () => {
//     const shareAbleUrl = `${process.env.REACT_APP_SERVER_IP}/share/${clickedUrl.split(".jpg")[0]}?redirectTo=singleImage`;
//     const text = `${shareAbleUrl}\n Click and follow url to *View* and *Download Image*`;
//     const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
//     window.open(whatsappUrl, "_blank");
//   };

//   const handleModalClose = () => {
//     setClickedImg(null);
//     navigate(".", { replace: true }); // Remove the image parameter from the URL
//   };

//   const handleNext = () => {
//     if (currentIndex < images.length - 1) {
//       const newIndex = currentIndex + 1 ;
//       setCurrentIndex(newIndex);
//       setClickedImg(images[newIndex].s3_url);
//       const imgName = images[newIndex].s3_url.split("amazonaws.com/")[1];
      
//     }
//   };

//   const handlePrev = () => {
//     if (currentIndex > 0) {
//       const newIndex = currentIndex - 1;
//       setCurrentIndex(newIndex);
//       setClickedImg(images[newIndex].s3_url);
//       const imgName = images[newIndex].s3_url.split("amazonaws.com/")[1];
//     }
//   };

//   return (
//     <div className="overlay dismiss" onClick={handleModalClose}>
//       <div className="modalOuter lazyImage" onClick={(e) => e.stopPropagation()}>
//         {close && (
//           <span className="dismiss" onClick={handleModalClose}>
//             X
//           </span>
//         )}
//         {!imageLoaded && <LoadingSpinner />} {/* Show spinner while image is loading */}
//         <img
//           src={clickedImg}
//           alt="bigger pic"
//           onLoad={() => setImageLoaded(true)} // Set imageLoaded to true when image is loaded
//           style={{ display: imageLoaded ? 'block' : 'none' }} // Hide image until it's loaded
//         />
//         {imageLoaded && ( // Only show the toolbox if the image is loaded
//           <div className="imageToolBox">
//             {(favourite || select) && (
//               <div
//                 className="dFlex alignCenter cursor-pointer"
//                 onClick={addToFavourite}
//               >
//                 <Heart className={"favourite " + (isFavourite ? "bgRed" : "")} />
//                 {isFavourite ? "Unselect" : "Select"}
//               </div>
//             )}
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
//             {sharing && (
//               <div className="dFlex alignCenter cursor-pointer" onClick={share}>
//                 <Share2 className={"favourite " + (isFavourite ? "bgRed" : "")} />
//                 Share
//               </div>
//             )}
//           </div>
//         )}
//         <ArrowLeft className="modal-arrow left-arrow" onClick={handlePrev} />
//         <ArrowRight className="modal-arrow right-arrow" onClick={handleNext} />
//       </div>
//     </div>
//   );
// };

// export default Modal;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowDownToLine, Share2, ArrowLeft, ArrowRight } from "lucide-react";
import LoadingSpinner from "../Loader/LoadingSpinner"; // Ensure you have a LoadingSpinner component
import API_UTIL from "../../services/AuthIntereptor";

const Modal = ({
  clickedImg,
  clickedImgFavourite,
  setClickedImg,
  handleBackButton,
  handleFavourite,
  images, // New prop to receive all images
  currentIndex, // New prop to receive current image index
  setCurrentIndex, // New prop to update current image index
  favourite = true,
  sharing = true,
  close = true,
  select = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavourite, setIsFavourite] = useState(clickedImgFavourite);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [clickedUrl, setClickedUrl] = useState(""); // Add this line
  const navigate = useNavigate();

  useEffect(() => {
    setIsFavourite(clickedImgFavourite);
    const imgName = clickedImg.split("amazonaws.com/")[1];
    setClickedUrl(imgName); // Add this line
  }, [clickedImgFavourite, clickedImg]);

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

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setClickedImg(images[newIndex].s3_url);
      setIsFavourite(images[newIndex].selected); // Update isFavourite state
      const imgName = images[newIndex].s3_url.split("amazonaws.com/")[1];
      setClickedUrl(imgName);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setClickedImg(images[newIndex].s3_url);
      setIsFavourite(images[newIndex].selected); // Update isFavourite state
      const imgName = images[newIndex].s3_url.split("amazonaws.com/")[1];
      setClickedUrl(imgName);
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
  };

  const handleTouchMove = (e) => {
    if (!startX) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startX;

    if (diffX > 50) {
      handlePrev();
      setStartX(null);
    } else if (diffX < -50) {
      handleNext();
      setStartX(null);
    }
  };

  const [startX, setStartX] = useState(null);

  return (
    <div className="overlay dismiss" onClick={handleModalClose}>
      <div className="modalOuter lazyImage" onClick={(e) => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
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
        <ArrowLeft className="modal-arrow left-arrow" onClick={handlePrev} />
        <ArrowRight className="modal-arrow right-arrow" onClick={handleNext} />
      </div>
    </div>
  );
};

export default Modal;
