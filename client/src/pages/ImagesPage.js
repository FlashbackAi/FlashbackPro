import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
// import ImageGallery from 'react-image-gallery';
// import 'react-image-gallery/styles/css/image-gallery.css'; // Import the CSS
import LoadingSpinner from "./LoadingSpinner";
import Modal from "../components/ImageModal";
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from "react-lazy-load-image-component";




function ImagesPage() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const { eventName,userId } = useParams();
  const [images, setImages] = useState([]);
  const username = sessionStorage.getItem("username");
  const galleryRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(null);
  const IMAGES_TO_LOAD = 20;
  const [loadedImages, setLoadedImages] = useState([]);
  const history = useNavigate();


  


  const [clickedImg,setClickedImg] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const handleClick = (item,index) =>{

    setCurrentIndex(index);
    setClickedImg(item.original);
    setClickedUrl(item.url)
    window.history.pushState({ id: 1 }, null, '?image=img');
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
            url: img.url
          }));
          setImages(prevImages => [...prevImages, ...formattedImages]);
          if(currentPage === 1)
            {
              console.log("initial hit");
              setLoadedImages(formattedImages)
            }
          setCurrentPage(prevPage => prevPage + 1);
          if (!totalImages) {
            setTotalImages(response.data.totalImages);
      
          }
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
      fetchImages();
    }
    if(!totalImages)
    {
      fetchImages();
    }

    // Intersection Observer...
  }, [eventName, userId, serverIP, isLoading, fetchTimeout, currentPage, totalImages]);

  

 
  useEffect(() => {
    
    const handleBackButton = (event) => {
      // Check if the navigation was caused by the back button
       // if (event.state && event.state.fromMyComponent) {
        //alert("clicked back button");
            setClickedImg(null);
          

      //}
      
    };

    // Add event listener for the popstate event on the window object
    window.addEventListener('popstate', handleBackButton);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);
  useEffect(() => {
    const handleBackGesture = (event) => {
      // Check if the user performed a back gesture
      if (event.deltaX > 50) { // Adjust threshold as needed
          setClickedImg(null);
          console.log("back gesture detected");

        // Add your custom logic here, such as navigating back
        history.goBack(); // Navigate back using React Router
      }
    };

    window.addEventListener('touchmove', handleBackGesture);

    return () => {
      window.removeEventListener('touchmove', handleBackGesture);
    };
  }, [history]);

  const handleScroll = () => {

    if (
      window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight
    ) {
      setLoadedImages(prevLoadedImages => [...prevLoadedImages, ...images.slice(prevLoadedImages.length, prevLoadedImages.length + IMAGES_TO_LOAD)]);

    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [images,loadedImages]);

  return (
    <div>
      {isLoading ? (
       <LoadingSpinner />// You can replace this with a spinner or loader component
      ) : loadedImages.length > 0 ? (
        <div className='wrapper'>
          {
            loadedImages.map((item,index)=>(
              <div key={index} className='wrapper-images'>
                <LazyLoadImage src={item.original} onClick={()=>handleClick(item,index)}  effect="blur"/>
              </div>
            ))
          }
          <div>
            {clickedImg && (
              <Modal
                clickedImg={clickedImg}
                setClickedImg={setClickedImg}
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