import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const ImageModal = ({
    clickedImg,
    setClickedImg,
    clickedUrl,
    handleBackButton
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
          console.error('No current image found');
          return;
        }
    
        setIsDownloading(true);
        try {
          const response = await axios.post(`${serverIP}/downloadImage`,{"imageUrl":clickedUrl});
          if (response.status === 200) {
           console.log(response);
            const link = document.createElement('a');
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
        }
        finally {
          setIsDownloading(false); // End downloading
        }
      };
    return (
      <>
        <div className="overlay dismiss" onClick={handleClick}>
          <img src={clickedImg} alt="bigger pic" />
          <span className="dismiss" onClick={handleBackButton}>
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