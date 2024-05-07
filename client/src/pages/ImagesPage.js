import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
// import ImageGallery from 'react-image-gallery';
// import 'react-image-gallery/styles/css/image-gallery.css'; // Import the CSS
import LoadingSpinner from "./LoadingSpinner";
import Modal from "../components/ImageModal";
import { useNavigate } from 'react-router-dom';




function ImagesPage() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const { eventName,userId } = useParams();
  const [images, setImages] = useState([]);
  const username = sessionStorage.getItem("username");
  const galleryRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(null);
  const pageSize = 10;
  const history = useNavigate();


  


  const [clickedImg,setClickedImg] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const handleClick = (item,index) =>{

    setCurrentIndex(index);
    setClickedImg(item.original);
    setClickedUrl(item.url)
    setIsModalOpen(true);
    console.log(isModalOpen)
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

  

 
  useEffect(() => {
    if(isModalOpen){
    const handleBackButton = (event) => {
      // Check if the navigation was caused by the back button
      console.log(isModalOpen)
     
        if (event.state && event.state.fromMyComponent) {
          setIsModalOpen(false);
          setClickedImg(null);
        }
      
    };

    // Add event listener for the popstate event on the window object
    window.addEventListener('popstate', handleBackButton);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }
  }, [isModalOpen]);

  useEffect(() => {
    // Add an entry to the browser's history when the component mounts
    window.history.pushState({ fromMyComponent: true }, '');
  }, []);

  useEffect(() => {
    const handleBackGesture = (event) => {
      // Check if the user performed a back gesture
      if (event.deltaX > 50) { // Adjust threshold as needed
        // Custom logic for handling back gesture
        if(isModalOpen){
          setIsModalOpen(false);
          setClickedImg(null);
        }
        console.log('Back gesture detected');
        // Add your custom logic here, such as navigating back
        history.goBack(); // Navigate back using React Router
      }
    };

    window.addEventListener('touchmove', handleBackGesture);

    return () => {
      window.removeEventListener('touchmove', handleBackGesture);
    };
  }, [history]);

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
            {isModalOpen && (
              <Modal
                clickedImg={clickedImg}
                setClickedImg={setClickedImg}
                setIsModalOpen={setIsModalOpen}
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