import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
// import ImageGallery from 'react-image-gallery';
// import 'react-image-gallery/styles/css/image-gallery.css'; // Import the CSS

import Modal from "../components/ImageModal";




function ImagesPage() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const { eventName,userId } = useParams();
  const [images, setImages] = useState([]);
  const username = sessionStorage.getItem("username");
  const galleryRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);


  
  const downloadCurrentImage = async () => {
    const currentIndex = galleryRef.current.getCurrentIndex();
    const currentImage = images[currentIndex];

    if (!currentImage) {
      console.error('No current image found');
      return;
    }

    setIsDownloading(true);
    try {
      // const response = await axios.post(`${serverIP}/downloadImage`,{"imageUrl":currentImage.url});
      // if (response.status === 200) {
        console.log(currentImage.original);
        const link = document.createElement('a');
        link.href = currentImage.original;
        link.download = currentImage.url;
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

  const [clickedImg,setClickedImg] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const handleClick = (item,index) =>{

    setCurrentIndex(index);
    setClickedImg(item.original);
  };

  const handelRotationRight = () => {
    const totalLength = images.length;
    if (currentIndex + 1 >= totalLength) {
      setCurrentIndex(0);
      const newUrl = images[0].original;
      setClickedImg(newUrl);
      return;
    }
    const newIndex = currentIndex + 1;
    const newUrl = images.filter((item) => {
      return images.indexOf(item) === newIndex;
    });
    const newItem = newUrl[0].original;
    setClickedImg(newItem);
    setCurrentIndex(newIndex);
  };

  const handelRotationLeft = () => {
    const totalLength = images.length;
    if (currentIndex === 0) {
      setCurrentIndex(totalLength - 1);
      const newUrl = images[totalLength - 1].original;
      setClickedImg(newUrl);
      return;
    }
    const newIndex = currentIndex - 1;
    const newUrl = images.filter((item) => {
      return images.indexOf(item) === newIndex;
    });
    const newItem = newUrl[0].original;
    setClickedImg(newItem);
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true); // Start loading
  
      // Set a timeout for 5 minutes (5 * 60 * 1000 milliseconds)
      const timeoutId = setTimeout(() => {
        if (images.length === 0) {
          setFetchTimeout(true); // Trigger timeout condition
          setIsLoading(false); // Stop loading
        }
      }, 5 * 60 * 1000);
  
      try {
        const response = await axios.get(`${serverIP}/images/${eventName}/${userId}`);
        if (response.status === 200) {
          const formattedImages = response.data.map((img) => ({
            original: img.imageData, // Assuming `imageData` is the URL to the image
            thumbnail: img.imageData,
            url: img.url,
            originalHeight:'800px',
            originalWidth:'800px'
          }));
          setImages(formattedImages);
        } else {
          throw new Error("Failed to fetch images");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setIsLoading(false); // Stop loading
        clearTimeout(timeoutId); // Clear the timeout if images are fetched before 5 minutes
      }
    };
  
    fetchImages();
  }, [eventName, userId, serverIP, username]);
  

  return (
    <div>
      {isLoading ? (
        <p>Loading images...</p> // You can replace this with a spinner or loader component
      ) : images.length > 0 ? (
        // <>
        //    <ImageGallery ref={galleryRef} items={images} showPlayButton={false} showFullscreenButton={false}  thumbnailPosition={'bottom'} />
        //    <button onClick={downloadCurrentImage} disabled={isDownloading} className='downloadButton'>
        //     {isDownloading ? 'Downloading...' : 'Download' }
        //   </button>
        // </>

        <div className='wrapper'>
          {
            images.map((item,index)=>(
              <div key={index} className='wrapper-images'>
                <img src={item.original} alt={item.thumbnail} onClick={()=>handleClick(item,index)}/>
              </div>
            ))
          }
          <div>
            {clickedImg && (
              <Modal
                clickedImg={clickedImg}
                handelRotationRight={handelRotationRight}
                setClickedImg={setClickedImg}
                handelRotationLeft={handelRotationLeft}
              />
            )}
          </div>
          </div>



      ) : fetchTimeout ? (
        <p>No images to display</p> // Message shown if fetch timeout is reached
      ) : (
        <p>Failed to load images</p> // Message shown if images fetch fails for other reasons
      )}
    </div>
  );
  
}

export default ImagesPage;