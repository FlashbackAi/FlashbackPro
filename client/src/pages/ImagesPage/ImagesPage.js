import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import Modal from "../../components/ImageModal/ImageModal";
import { useNavigate,useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PlaceholderImage from "../../media/images/blurredLogo.png";
import Header from "../../components/Header/Header";
import API_UTIL from "../../services/AuthIntereptor";
import { Heart } from "lucide-react";

function ImagesPage() {
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(undefined);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const [totalImages, setTotalImages] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const [clickedImgIndex, setClickedImgIndex] = useState(null);
  const [clickedImgFavourite, setClickedImgFavourite] = useState(null);
  const [clickedImg, setClickedImg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFavIndex, setLastFavIndex] = useState(-1);
  const [images, setImages] = useState([]);
  const { eventName, userId } = useParams();
  const isFavouritesFetched = useRef(false);
  const history = useNavigate();
  const location = useLocation();
  const [clientName, setClientName] = useState();
 
  const handleClick = (item, index) => {
    setClickedImg(item.original);
    setClickedImgIndex(index);
    setClickedImgFavourite(item.isFavourites);
    const imgName = item.original.split("amazonaws.com/")[1];
    setClickedUrl(imgName);
    window.history.pushState({ id: 1 }, null, "?image=" + `${imgName}`);
  };

  const fetchFavouriteImages = async () => {
    setIsLoading(true);
    try {
      const response = await API_UTIL.post(
        `/images-new/${eventName}/${userId}`,
        {
          isFavourites: true
        }
      );
      if (response.status === 200) {
        setClientName(response.data.clientName);
        const formattedImages = response.data.images.map((img) => ({
          original: img.url,
          thumbnail: img.thumbnailUrl,
          isFavourites: true,
        }));
        setImages((prevImages) => [...prevImages, ...formattedImages]);
        if (!totalImages) {
          setTotalImages(response.data.totalImages);
        }
        setLastFavIndex(response.data.totalImages - 1);
        if (images.length >= totalImages) {
          setIsLoading(false); // Stop fetching more images when all images are fetched
        }
        await fetchImages();
      } else {
        throw new Error("Failed to fetch images");
      }
    } catch (error) {
      if( error?.response?.status === 700){;
        history(`/login/${eventName}`, { state: { from: location.pathname } });
      }
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImages = async () => {
    if (images.length === 0) setIsLoading(true);
    try {
      const response = await API_UTIL.post(
        `/images-new/${eventName}/${userId}  `,
        {
          isFavourites: false,
          lastEvaluatedKey: lastEvaluatedKey
        }
      );
      if (response.status === 200) {
        const formattedImages = response.data.images.map((img) => ({
          original: img.url,
          thumbnail: img.thumbnailUrl,
          isFavourites: false,
        }));
        setImages((prevImages) => [...prevImages, ...formattedImages]);
        console.log(response.data.lastEvaluatedKey);
        setLastEvaluatedKey(response.data.lastEvaluatedKey);
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

  const fetchAllImages = async () => {
    fetchFavouriteImages()
  };

  useEffect(() => {
    if (isFavouritesFetched.current) return;
    fetchAllImages();
    isFavouritesFetched.current = true;
  }, []);

  useEffect(() => {
    if (totalImages === 0) {
      setFetchTimeout(true);
    }
  }, [totalImages]);

  useEffect(() => {
    if (lastEvaluatedKey) {
      console.log("call");
      fetchImages();
    }
    console.log(images.length);
  }, [lastEvaluatedKey]);

  const handleBackButton = () => {
    // Check if the navigation was caused by the back button
    setClickedImg(null);
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
      if (event.touches.length > 1) {
        //the event is multi-touch
        //you can then prevent the behavior
        event.preventDefault();
      }
    }
    window.addEventListener("touchstart", touchHandler, { passive: false });
  }, []);

  // useEffect(()=>{
  //   displayFavIcon(lastFavIndex+1)
  // },[images])

  const handleFavourite = async (index, imageUrl, isFav) => {
    if (isFav) {
      const favIndex = lastFavIndex + 1;
      const tempImages = [...images];
      tempImages[index].isFavourites = true;
      tempImages.splice(favIndex, 0, tempImages.splice(index, 1)[0]);
      displayFavIcon(favIndex);
      setClickedImgIndex(favIndex);
      setLastFavIndex((favIndex) => favIndex + 1);
      setImages(tempImages);
    } else {
      // to do: remove from favorites, adjust position in array
      const unFavIndex = lastFavIndex;
      const tempImages = [...images];
      tempImages[index].isFavourites = false;
      tempImages.splice(unFavIndex, 0, tempImages.splice(index, 1)[0]);
      hideFavIcon(unFavIndex);
      setClickedImgIndex(unFavIndex);
      setLastFavIndex((favIndex) => favIndex - 1);
      setImages(tempImages);
    }
    await API_UTIL.post("/setFavourites", {
      imageUrl,
      userId,
      isFav,
    });
  };

  const displayFavIcon = (index) => {
    console.log(index);
    document
      .querySelector(`svg[data-key="${index}"]`)
      .classList.remove("hidden");
  };

  const hideFavIcon = (index) => {
    console.log(index);
    document.querySelector(`svg[data-key="${index}"]`).classList.add("hidden");
  };

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Header clientName={clientName} />
          {images.length > 0 ? (
            <div className="wrapper">
              {images.map((item, index) => (
                <div key={index} className="wrapper-images">
                  <LazyLoadImage
                    src={item.thumbnail}
                    placeholderSrc={PlaceholderImage}
                    effect="blur"
                    onLoad={() => item.isFavourites && displayFavIcon(index)}
                    onClick={() => handleClick(item, index)}
                  />
                  {/* {item.isFavourites && ( */}
                  <Heart
                    data-key={index}
                    className="image_favourite_down hidden"
                  />
                  {/* )} */}
                </div>
              ))}
              <div>
                {clickedImg && (
                  <Modal
                    clickedImg={clickedImg}
                    clickedImgIndex={clickedImgIndex}
                    clickedImgFavourite={clickedImgFavourite}
                    setClickedImg={setClickedImg}
                    clickedUrl={clickedUrl}
                    handleBackButton={handleBackButton}
                    handleFavourite={handleFavourite}
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
