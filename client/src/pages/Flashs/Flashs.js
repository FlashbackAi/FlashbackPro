import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import Modal from "../../components/ImageModal/ImageModal";
import { useNavigate, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PlaceholderImage from "../../media/images/blurredLogo.png";
import Header from "../../components/Header/Header";
import { Helmet } from 'react-helmet';
import API_UTIL from "../../services/AuthIntereptor";

function Flashs() {
  const { eventName, userId } = useParams();
  const thumbnailUrl = `https://rekognitionuserfaces.s3.amazonaws.com/thumbnails/${userId}.jpg`;
  const [images, setImages] = useState([]);
  const username = sessionStorage.getItem("username");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const [totalImages, setTotalImages] = useState(null);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(undefined);
  const isDataFetched = useRef(false);
  const history = useNavigate();
  const location = useLocation();

  const [clickedImg, setClickedImg] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const handleClick = (item, index) => {
    setClickedImg(item.original);
    const imgName = item.original.split("amazonaws.com/")[1];
    setClickedUrl(imgName);
    window.history.pushState({ id: 1 }, null, "?image=" + `${imgName}`);
  };

  const fetchImages = async () => {
    if (images.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.post(
        `/images-new/${eventName}/${userId}  `,
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
        if (!totalImages) {
          setTotalImages(response.data.totalImages);
        }
        if (images.length >= totalImages) {
          setIsLoading(false);
        }
      } else {
        throw new Error("Failed to fetch images");
      }
    } catch (error) {
      
      if(error.response.data.message === "UserDoesnotExist"){
        console.log("user does not exist");
        console.log(location.pathname)
        history(`/login/${eventName}`, { state: { from: location.pathname } });
      }
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

    if (totalImages === 0) {
      setFetchTimeout(true);
    } else {
      console.log("end");
      console.log(images.length);
    }

  }, [
    eventName,
    userId,
    isLoading,
    fetchTimeout,
    totalImages,
    lastEvaluatedKey,
    images,
  ]);



  const handleBackButton = () => {
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
        event.preventDefault();
      }
    }
    window.addEventListener("touchstart", touchHandler, { passive: false });
  }, []);

  const handleFavourite = () => {};

  return (
    <div>
    <Helmet>
      <title>Home Page</title>
      <meta name="description" content="This is the page to display images." />
      <meta property="og:title" content="Flashbacks" />
      <meta property="og:image" content={thumbnailUrl} />
      <meta property="og:description" content="This is the page to display images." />
    </Helmet>
      {isLoading ? (
        <LoadingSpinner /> 
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

export default Flashs;
