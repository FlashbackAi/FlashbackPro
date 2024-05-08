import React, { useState, useEffect, useRef } from 'react';
const ImageModal = ({
    clickedImg,
    setClickedImg,
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

 
        </div>
      </>
    );
  };
  
  export default ImageModal;