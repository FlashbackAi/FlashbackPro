import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// import ImageGallery from 'react-image-gallery';
// import 'react-image-gallery/styles/css/image-gallery.css'; // Import the CSS
import LoadingSpinner from "./LoadingSpinner";
import Modal from "../components/ImageModal";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PlaceholderImage from "../Media/blurredLogo.png";
import Header from "../components/Header";
import API_UTIL from "../services/AuthIntereptor";

function ImagesPage() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const { eventName, userId } = useParams();
  const [images, setImages] = useState([]);
  const username = sessionStorage.getItem("username");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  //const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(null);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(undefined);
  const isDataFetched = useRef(false);
  const history = useNavigate();

  const [clickedImg, setClickedImg] = useState(null);
  // const [currentIndex, setCurrentIndex] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const handleClick = (item, index) => {
    //console.log(item)
    //setCurrentIndex(index);
    setClickedImg(item.original);
    const imgName = item.original.split("amazonaws.com/")[1];
    setClickedUrl(imgName);
    window.history.pushState({ id: 1 }, null, "?image=" + `${imgName}`);
    //window.history.pushState({ id: 1 }, null, '?image');
  };

  const fetchImages = async () => {
    if (images.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.post(
        `${serverIP}/images/${eventName}/${userId}  `,
        { lastEvaluatedKey: lastEvaluatedKey }
      );
      if (response.status === 200) {
        const formattedImages = response.data.images.map((img) => ({
          original: img.url,
          thumbnail: img.thumbnailUrl,
        }));
        setImages((prevImages) => [...prevImages, ...formattedImages]);
        console.log(response.data.lastEvaluatedKey);
        setLastEvaluatedKey(response.data.lastEvaluatedKey);
        // if(currentPage === 1)
        //   {
        //     console.log("initial hit");
        //     setLoadedImages(formattedImages)
        //   }
        // setCurrentPage(prevPage => prevPage + 1);
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

  useEffect(() => {
    if (isDataFetched.current) return;
    fetchImages();
    isDataFetched.current = true;
  }, []);

  useEffect(() => {
    if (lastEvaluatedKey) {
      console.log("call");
      fetchImages();
    }
    // if (totalImages===null) {
    //   console.log("call2");
    //   fetchImages();
    // }
    if (totalImages === 0) {
      setFetchTimeout(true);
    } else {
      console.log("end");
      console.log(images.length);
    }

    // Intersection Observer...
  }, [
    eventName,
    userId,
    serverIP,
    isLoading,
    fetchTimeout,
    totalImages,
    lastEvaluatedKey,
    images,
  ]);

  // useEffect(() => {
  //   // if (images.length > 0) {
  //   // console.log(images);
  //   // const firstImageUrl = images[0].thumbnail; // Assuming images is an array of objects with a 'url' property
  //   // setClickedImg(firstImageUrl);
  //   // setClickedUrl(firstImageUrl.split("amazonaws.com/")[1]); // Extracting the image name from the URL

  //   // Dynamically set og:image meta tag
  //   // const ogImageMeta = document.createElement("meta");
  //   // ogImageMeta.setAttribute("property", "og:image");
  //   // ogImageMeta.setAttribute("content", firstImageUrl);
  //   // document.head.appendChild(ogImageMeta);
  //   var ogImageMeta = document.querySelector("meta[name='flashback-og:image']");
  //   if (!ogImageMeta) {
  //     ogImageMeta = document.createElement("meta");
  //     ogImageMeta.setAttribute("property", "og:image");
  //     ogImageMeta.setAttribute("name", "flashback-og:image");
  //     ogImageMeta.setAttribute("itemprop", "image");
  //     ogImageMeta.setAttribute(
  //       "content",
  //       "https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/Aarthi_Vinay_19122021/Ec_E__DSC1682.jpg"
  //     );
  //     document.head.appendChild(ogImageMeta);
  //     // const ogTypeMeta = document.createElement("meta");
  //     // ogTypeMeta.setAttribute("property", "og:type");
  //     // ogTypeMeta.setAttribute("name", "flashback-og:type");
  //     // ogTypeMeta.setAttribute("content", "website");
  //     // document.head.appendChild(ogTypeMeta);
  //   }
  //   // }
  //   // }, [images]); // checking with hardcoding on load
  // }, [eventName]);

  const handleBackButton = () => {
    // Check if the navigation was caused by the back button
    // if (event.state && event.state.fromMyComponent) {
    //alert("clicked back button");
    setClickedImg(null);

    //}
  };
  useEffect(() => {
    // Add event listener for the popstate event on the window object
    window.addEventListener("popstate", handleBackButton);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);
  useEffect(() => {
    const handleBackGesture = (event) => {
      // Check if the user performed a back gesture
      if (event.deltaX > 50) {
        // Adjust threshold as needed
        setClickedImg(null);
        console.log("back gesture detected");

        // Add your custom logic here, such as navigating back
        history.goBack(); // Navigate back using React Router
      }
    };

    window.addEventListener("touchmove", handleBackGesture);

    return () => {
      window.removeEventListener("touchmove", handleBackGesture);
    };
  }, [history]);

  // const handleScroll = () => {

  //   if (
  //     window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight
  //   ) {
  //     setLoadedImages(prevLoadedImages => [...prevLoadedImages, ...images.slice(prevLoadedImages.length, prevLoadedImages.length + IMAGES_TO_LOAD)]);

  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener('scroll', handleScroll);
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, [images,loadedImages]);

  useEffect(() => {
    const disablePinchZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", disablePinchZoom, {
      passive: false,
    });
    return () => {
      document.removeEventListener("touchmove", disablePinchZoom);
    };
  }, []);

  useEffect(() => {
    function touchHandler(event) {
      console.log(event);
      if (event.touches.length > 1) {
        //the event is multi-touch
        //you can then prevent the behavior
        event.preventDefault();
      }
    }
    window.addEventListener("touchstart", touchHandler, { passive: false });
  }, []);

  const handleFavourite = () => {};

  return (
    <div>
      {/* <Helmet>
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://app.flashback.inc/photos/Aarthi_Vinay_19122021/+918978073062_Flash_401"
        />
        <meta property="og:title" content="" />
        <meta
          property="og:description"
          content="Flashback - Create & Share Memories!"
        />
        <meta
          property="og:image"
          content="https://flashbackimagesthumbnail.s3.ap-south-1.amazonaws.com/Aarthi_Vinay_19122021/Ec_E__DSC1682.jpg"
        />
      </Helmet> */}
      {isLoading ? (
        <LoadingSpinner /> // You can replace this with a spinner or loader component
      ) : (
        <>
          <Header />
          {images.length > 0 ? (
            <div className="wrapper">
              {images.map((item, index) => (
                <div key={index} className="wrapper-images">
                  <LazyLoadImage
                    src={item.thumbnail}
                    placeholderSrc={PlaceholderImage}
                    effect="blur"
                    onClick={() => handleClick(item, index)}
                  />
                </div>
              ))}
              <div>
                {clickedImg && (
                  <Modal
                    clickedImg={clickedImg}
                    setClickedImg={setClickedImg}
                    clickedUrl={clickedUrl}
                    handleBackButton={handleBackButton}
                  />
                )}
              </div>
            </div>
          ) : fetchTimeout ? (
            <p>No images to display</p> // Message shown if fetch timeout is reached
          ) : (
            <p>Failed to load images</p> // Message shown if images fetch fails for other reasons
          )}
        </>
      )}
    </div>
  );
}

export default ImagesPage;
