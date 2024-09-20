import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import Modal from "../../components/ImageModal/ImageModal";
import { useNavigate, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PlaceholderImage from "../../media/images/blurredLogo.png";
// import Header from "../../components/Header/Header";
import API_UTIL from "../../services/AuthIntereptor";
import { Heart } from "lucide-react";
import Footer from "../../components/Footer/Footer";
import "../../components/Footer/Footer.css"; // Import the updated CSS
import "./ImagePage-new.css";
import AppBar from "../../components/AppBar/AppBar";
import MiniHeroComponent from "../../components/MiniHeroComponent/MiniHeroComponent";
import Masonry from "react-masonry-css"; // Import Masonry
import ClaimRewardsPopup from '../../components/ClaimRewardsPopup/ClaimRewardsPopup';

function ImagesPageNew() {
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
  const [clientObj, setClientObj] = useState();
  const [userObj,setUserObj] = useState();
  const [bannerImg, setBannerImg]  = useState();
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(true);


  const [breakpointColumnsObj, setBreakpointColumnsObj] = useState({
    default: calculateColumns(),
    1200: calculateColumns(),
    992: calculateColumns(),
    768: calculateColumns(),
    576: calculateColumns(),
  });

  useEffect(() => {
    const handleResize = () => {
      setBreakpointColumnsObj({
        default: calculateColumns(),
        1200: calculateColumns(),
        992: calculateColumns(),
        768: calculateColumns(),
        576: calculateColumns(),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (item, index) => {
    setClickedImg(item.thumbnail);
    console.log(item.thumbnail)
    setClickedImgIndex(index);
    setClickedImgFavourite(item.isFavourites);
    const imgName = item.original.split("amazonaws.com/")[1];
    setClickedUrl(imgName);
    window.history.pushState({ id: 1 }, null, "?image=" + `${imgName}`);
  };

  const fetchFavouriteImages = async () => {
    setIsLoading(true);
    try {
      const response = await API_UTIL.post(`/images-new/${eventName}/${userId}`, {
        isFavourites: true,
      });
  
      if (response.status === 200) {
        setClientObj(response.data.clientObj);
        await fetchPortfolioImages(response.data.clientObj.user_name, response.data.clientObj.org_name);
        setUserObj(response.data.userObj);
  
        const favoriteImages = response.data.images.map((img) => ({
          original: img.url,
          thumbnail: img.thumbnailUrl,
          isFavourites: true,
        }));
  
        setImages((prevImages) => [...prevImages, ...favoriteImages]);
  
        if (!totalImages) {
          setTotalImages(response.data.totalImages);
        }
        setLastFavIndex(response.data.totalImages - 1);
  
        await fetchImages(favoriteImages); // Pass favorite images to fetchImages
      } else {
        throw new Error("Failed to fetch images");
      }
    } catch (error) {
      if (error?.response?.status === 700) {
        history(`/login/${eventName}`, { state: { from: location } });
      }
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const fetchImages = async (favoriteImages = []) => {
    if (images.length === 0) setIsLoading(true);
    try {
      const response = await API_UTIL.post(`/images-new/${eventName}/${userId}`, {
        isFavourites: false,
        lastEvaluatedKey: lastEvaluatedKey,
      });
  
      if (response.status === 200) {
        // Filter out favorite images
        const favoriteImageUrls = favoriteImages.map((img) => img.original);
        const nonFavImages = response.data.images.filter(
          (img) => !favoriteImageUrls.includes(img.url)
        );
  
        const formattedImages = nonFavImages.map((img) => ({
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
  

  const fetchPortfolioImages = async (user_name, org_name) => {
    try {
      const response = await API_UTIL.get(`/getPortfolioImages/${org_name}/${user_name}`);
      if (response.status !== 200) {
        
          setBannerImg('')
      }
      setBannerImg(response.data.images.Banner[0].url.replace(/ /g, "%20"));
      
    } catch (error) {
      console.error('Error fetching portfolio images:', error);
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
    return () => {
      window.removeEventListener("touchstart",touchHandler);
    }
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
      // setClickedImgIndex(favIndex);
      setLastFavIndex((favIndex) => favIndex + 1);
      setImages(tempImages);
    } else {
      // to do: remove from favorites, adjust position in array
      const unFavIndex = lastFavIndex;
      const tempImages = [...images];
      tempImages[index].isFavourites = false;
      tempImages.splice(unFavIndex, 0, tempImages.splice(index, 1)[0]);
      hideFavIcon(unFavIndex);
      // setClickedImgIndex(unFavIndex);
      setLastFavIndex((favIndex) => favIndex - 1);
      setImages(tempImages);
    }
    await API_UTIL.post("/setFavouritesNew", {
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

  const toggleFavourite = (index) => {
    const isFav = !images[index].isFavourites;
    handleFavourite(index, images[index].original, isFav);
  };
  const closeClaimPopup = () => {
    setIsClaimPopupOpen(false);
  };


  // const breakpointColumnsObj = {
  //   default: 5,  // 6 columns for large screens (default)
  //   1200: 5,     // 6 columns for screens 1200px and above
  //   992: 5,      // 6 columns for screens between 992px and 1200px (laptops)
  //   768: 3,      // 3 columns for screens between 768px and 992px (tablets)
  //   576: 3,      // 3 columns for screens 576px and below (mobile)
  // };
  

  return (
    <div className="page-container">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <AppBar showCoins={true}/>
          <MiniHeroComponent 
            orgName={clientObj?.org_name}
              socialMediaLinks={clientObj?.social_media}
              backdropImage={bannerImg}
            />
          <div className="content-wrap">
            {images.length > 0 ? (
              <div className="im-wrapper">
                   <Masonry
                   breakpointCols={breakpointColumnsObj}
                   className="my-masonry-grid"
                   columnClassName="my-masonry-grid_column"
                 >
                   {images.map((item, index) => (
                     <div key={index} className="im-wrapper-images">
                       <img
                         src={item.thumbnail}
                         alt={`img ${index}`}
                         style={{ objectFit: "cover" }}
                         onClick={() => handleClick(item, index)}
                       />
                       <Heart
                         data-key={index}
                         className={`heart-icon ${item.isFavourites ? "bgRed" : ""}`}
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleFavourite(index);
                         }}
                       />
                     </div>
                   ))}
                 </Masonry>
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
                      images={images} // Pass the images array to Modal
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
          <Footer />  
        </>
      )}
    </div>
  );
}

const calculateColumns = () => {
  const width = window.innerWidth;
  if (width >= 1200) {
    return 6;
  } else if (width >= 992) {
    return 5;
  } else if (width >= 768) {
    return 4;
  } else {
    return 3;
  }
};

export default ImagesPageNew;