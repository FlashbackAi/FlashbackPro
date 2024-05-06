import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
// import ImageGallery from 'react-image-gallery';
// import 'react-image-gallery/styles/css/image-gallery.css'; // Import the CSS
import LoadingSpinner from "./LoadingSpinner";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(null);
  const pageSize = 10;


  
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
  const [clickedUrl, setClickedUrl] = useState(null);
  const handleClick = (item,index) =>{

    setCurrentIndex(index);
    setClickedImg(item.original);
    setClickedUrl(item.url)
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
      if(images.length==0)
      setIsLoading(true);

      try {
        const response = await axios.get(`${serverIP}/images/${eventName}/${userId}/${currentPage}`);
        if (response.status === 200) {
          const formattedImages = response.data.images.map((img) => ({
            original: img.imageData,
            thumbnail: img.imageData,
            url: img.url,
            originalHeight: '800px',
            originalWidth: '800px'
          }));
          setImages(prevImages => [...prevImages, ...formattedImages]);
          setCurrentPage(prevPage => prevPage + 1);
          if (!totalImages) {
            setTotalImages(response.data.totalImages);
      
          }
          console.log(totalImages+" :"+images.length)
          if (images.length >= totalImages) {
            setIsLoading(false); // Stop fetching more images when all images are fetched
          }
        } else {
          throw new Error("Failed to fetch images");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (images.length < totalImages) {
      console.log(images.length)
      fetchImages();
    }
    if(!totalImages)
    {
      fetchImages();
    }

    // Intersection Observer...
  }, [eventName, userId, serverIP, isLoading, fetchTimeout, currentPage, totalImages]);

  

  return (
    <div>
      {isLoading ? (
       <LoadingSpinner />// You can replace this with a spinner or loader component
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
                clickedUrl={clickedUrl}
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