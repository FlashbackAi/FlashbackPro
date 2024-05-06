import React, { useState, useEffect, useRef } from 'react';
const ImageModal = ({
    clickedImg,
    setClickedImg,
    handelRotationRight,
    handelRotationLeft,
    clickedUrl
  }) => {
    const handleClick = (e) => {
      if (e.target.classList.contains("dismiss")) {
        setClickedImg(null);
      }
    };
  
    const galleryRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const downloadCurrentImage = async () => {
        // const currentIndex = galleryRef.current.getCurrentIndex();
        // const currentImage = images[currentIndex];
    
        if (!clickedImg) {
          console.error('No current image found');
          return;
        }
    
        setIsDownloading(true);
        try {
          // const response = await axios.post(`${serverIP}/downloadImage`,{"imageUrl":currentImage.url});
          // if (response.status === 200) {
            console.log(clickedUrl);
            const link = document.createElement('a');
            link.href = clickedImg
            link.download = clickedUrl;

            const mimeType = "image/jpeg"; // Adjust this based on the image file type
            link.type = mimeType;

            document.body.appendChild(link); // Required for FF
            link.click();
            document.body.removeChild(link);
    
          // } else {
          //   throw new Error("Failed to fetch images");
          // }
        } catch (error) {
          console.error("Error fetching images:", error);
        }
        finally {
          setIsDownloading(false); // End downloading
        }
      };
    return (
      <>
        <div className="overlay dismiss" onClick={handleClick}>
          <img src={clickedImg} alt="bigger pic" />
          <span className="dismiss" onClick={handleClick}>
            X
          </span>

          <button onClick={downloadCurrentImage} disabled={isDownloading} className='downloadButton'>
            {isDownloading ? 'Downloading...' : 'Download' }
          </button>

          <div onClick={handelRotationLeft} className="overlay-arrows_left">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div onClick={handelRotationRight} className="overlay-arrows_right">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  export default ImageModal;