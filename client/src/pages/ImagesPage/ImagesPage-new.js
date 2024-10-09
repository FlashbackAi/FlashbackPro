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
  import { Edit2, Calendar, Clock, MapPin, Download, Share2, Handshake,ScrollText } from 'lucide-react';
  import { motion, AnimatePresence } from 'framer-motion';
  import styled, { createGlobalStyle } from 'styled-components';
  import Invite from "../Invitation/Invite";



  const PageWrapper = styled.div`
    background-color: #121212;
    min-height: 100vh;
    color: #ffffff;
  `;

  const MiniheroSec = styled.div`
  height: 300px; /* Keeps the height fixed */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1e1e1e; /* Optional: background color to match your design */
`;



  const ContentWrapper = styled.div`
    display: flex;
    padding: 1rem;
    gap: 1rem;
    top:300px;
    max-width: 100%;
    margin: 0 auto;

    @media (max-width: 768px) {
      flex-direction: column;
      padding: 0.5rem;
    }
  `;


  const SidePanel = styled.div`
    flex: 0 0 15em;
    background-color: #1e1e1e;
    border-radius: 1rem;
    padding: 1.5rem;
    height: fit-content;

    @media (max-width: 768px) {
      flex: 1;
    }
  `;

  const MainContent = styled.div`
    flex: 1;
    min-width: 0;
  `;
  const CenteredSpinner = styled.div`
  position: absolute;
  top: 75%;
  left: 60%;
  transform: translate(-50%, -50%);
`;
const StyledMasonry = styled(Masonry)`
  display: flex;
  margin-left:1rem;
  width: auto;

  .my-masonry-grid_column {
    background-clip: padding-box;
  }

  .image-item {
    margin-bottom: 0.5rem;
    break-inside: avoid;
  }

    @media (max-width: 768px) {
    .my-masonry-grid_column {
    }
  }
`;

const ImageWrapper = styled.div`
  margin-bottom: 16px;
  break-inside: avoid;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  margin-left:1em;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

  const EventImage = styled.div`
    width: 100%;
    height: 200px;
    border-radius: 1rem;
    overflow: hidden;
    margin-bottom: 1.5rem;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;

  const EventTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #66d3ff, #9a6aff 38%, #ee75cb 71%, #fd4d77);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `;

  const EventInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  `;

  const InfoItem = styled.div`
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: white;

    svg {
      margin-right: 0.5rem;
      color: #00ffff;
    }
  `;



  const ActionButton = styled.button`
    background-color: #2a2a2a;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    margin: 0 0.5rem;

    &:hover {
      box-shadow: 0 0 10px rgba(64, 224, 208, 0.5);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 1;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
    padding: 0.3rem;
    font-size: 0.8rem;
  }
  `;


  const ImageModalWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  background-color: rgba(0, 0, 0, 1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

  const GlobalStyle = createGlobalStyle`
    .wrapper-pro {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .wrapper-images-pro {
      position: relative;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease;

      img {
        width: 100%;
        height: 150px;
        object-fit: cover;
      }

      p {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        margin: 0;
        padding: 0.25rem;
        text-align: center;
      }

      &.selectable {
        &:hover {
          transform: scale(1.05);
        }
      }

      &.selected {
        border: 2px solid #00ffff;
      }

      .tick-mark {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background-color: #00ffff;
        color: #1e1e1e;
        border-radius: 50%;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .my-masonry-grid {
      display: flex;
      width: auto;
    }
    .my-masonry-grid_column > div {
    background: grey;
    margin-bottom: 30px;
  }
  `;

  function ImagesPageNew() {
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(undefined);
    const [fetchTimeout, setFetchTimeout] = useState(false);
    const [totalImages, setTotalImages] = useState(null);
    const [clickedUrl, setClickedUrl] = useState(null);
    const [clickedImgIndex, setClickedImgIndex] = useState(null);
    const [clickedImgFavourite, setClickedImgFavourite] = useState(null);
    const [clickedImg, setClickedImg] = useState(null);
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
    const [event, setEvent] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);


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

    useEffect(() => {
      if (eventName) {
        fetchEventData(eventName);
      }
    }, [eventName]);

 
  
    const fetchEventData = async (foldername) => {
      setIsPageLoading(true);
      try {
        const response = await API_UTIL.get(`/getEventDetailsByFolderName/${foldername}`);
        setEvent(response.data);
        console.log(response);
  
        // Check the event date and time condition before fetching images
        // if (!response.data.event_date || new Date(response.data.event_date) < new Date()) {
          fetchAllImages(); // Fetch images if the date is not set or the date has passed
        // }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setIsPageLoading(false);
      }
    };

  
  


    const handleImageClick = (imageData, index) => {
      console.log("Image clicked");
      setClickedImg(imageData.thumbnail);
      setClickedImgIndex(index);
      setClickedImgFavourite(imageData.isFavourites);
      setClickedUrl(imageData.original);
      window.history.pushState({ id: 1 }, null, "?image=" + `${imageData.original.split('/').pop()}`);
    };

    const fetchFavouriteImages = async () => {
      setIsGalleryLoading(true);
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
    
          addUniqueImages(favoriteImages);
    
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
        setIsGalleryLoading(false);
      }
    };

    const addUniqueImages = (newImages) => {
      setImages((prevImages) => {
        // Create a Set of existing image URLs for quick lookup
        const existingUrls = new Set(prevImages.map((img) => img.original));
    
        // Filter out new images that already exist in the current state
        const uniqueImages = newImages.filter((img) => !existingUrls.has(img.original));
    
        // Return the combined array of previous images and unique new images
        return [...prevImages, ...uniqueImages];
      });
    };
    
    

     const fetchImages = async (favoriteImages = []) => {
    if (images.length === 0) setIsGalleryLoading(true);
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
        addUniqueImages(formattedImages);
  
        // setImages((prevImages) => [...prevImages, ...formattedImages]);
        console.log(response.data.lastEvaluatedKey);
        setLastEvaluatedKey(response.data.lastEvaluatedKey);
  
        if (!totalImages) {
          setTotalImages(response.data.totalImages);
        }
  
        if (images.length >= totalImages) {
          setIsGalleryLoading(false); // Stop fetching more images when all images are fetched
        }
      } else {
        throw new Error("Failed to fetch images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsGalleryLoading(false);
    }
  };
  

    

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isGalleryLoading) {
            fetchImages();
          }
        },
        { threshold: 0.5 }
      );
  
      if (loader.current) {
        observer.observe(loader.current);
      }
  
      return () => {
        if (loader.current) {
          observer.unobserve(loader.current);
        }
      };
    }, [fetchImages, hasMore, isGalleryLoading]);
    

    const fetchPortfolioImages = async (user_name, org_name) => {
      try {
        const response = await API_UTIL.get(`/getBannerImage/${org_name}/${user_name}`);
        if (response.status !== 200) {
          
            setBannerImg('')
        }
        setBannerImg(response.data.imageUrl.replace(/ /g, "%20"));
        
      } catch (error) {
        console.error('Error fetching portfolio images:', error);
      }
    };

    const fetchAllImages = async () => {
      fetchFavouriteImages()
      
    };

    

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
    const formatEventName = (name) => {
      if (!name) return '';
      let event = name.replace(/_/g, ' ');
      return event.trim();
    };

    // const breakpointColumnsObj = {
    //   default: 5,  // 6 columns for large screens (default)
    //   1200: 5,     // 6 columns for screens 1200px and above
    //   992: 5,      // 6 columns for screens between 992px and 1200px (laptops)
    //   768: 3,      // 3 columns for screens between 768px and 992px (tablets)
    //   576: 3,      // 3 columns for screens 576px and below (mobile)
    // };
    

    return (
      <PageWrapper>
      <GlobalStyle />
      <AppBar showCoins={true} />
      <MiniheroSec>
      {clientObj &&(
      <MiniHeroComponent 
        orgName={clientObj?.org_name}
        socialMediaLinks={clientObj?.social_media}
        backdropImage={bannerImg}
      />
    )}
    </MiniheroSec>
      <ContentWrapper>
        {event && (
        <SidePanel>
          <EventImage>
            <img src={event?.event_image} alt="Event" />
          </EventImage>
          <EventTitle>{formatEventName(event?.event_name)}</EventTitle>
          <EventInfo>
            <InfoItem>
              <Calendar size={18} />
              {event?.event_date && !isNaN(Date.parse(event?.event_date)) 
                ? new Date(event?.event_date).toLocaleDateString() 
                : 'Date not set'}
            </InfoItem>
            <InfoItem>
              <Clock size={18} />
              {event?.event_date && !isNaN(new Date(event?.event_date).getTime()) 
              ? new Date(event?.event_date).toLocaleTimeString() 
              : 'Time not set'}

            </InfoItem>
            <InfoItem>
              <MapPin size={18} />
              {event?.event_location || 'Location not set'}
            </InfoItem>
            <InfoItem>
              <ScrollText size={18} />
              {event?.invitation_note || 'Invitation Note not set'}
            </InfoItem>
          </EventInfo>
        </SidePanel>
        )}
        <MainContent>
        {isGalleryLoading ? (
            <CenteredSpinner>
              <LoadingSpinner color="#40E0D0" />
            </CenteredSpinner>
          ) : images.length === 0 && totalImages === 0 ? (
            <div style={{ textAlign: "center", color: "#FFFFFF", marginTop: "2rem" }}>
              <h2>Congratulations! You have successfully registered for the event.</h2>
              <p>Once the images are uploaded, we will notify you.</p>
            </div>
          ) : (
            <StyledMasonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {images.map((imageData, index) => (
                <ImageWrapper key={index}>
                  <img
                    src={imageData.thumbnail}
                    alt={`img ${index}`}
                    onClick={() => handleImageClick(imageData, index)}
                  />
                  <Heart
                         data-key={index}
                         className={`heart-icon ${imageData.isFavourites ? "bgRed" : ""}`}
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleFavourite(index);
                         }}
                  />
                </ImageWrapper>
              ))}
            </StyledMasonry>
          )}

        </MainContent>
      </ContentWrapper>

      {clickedImg && (
        <ImageModalWrapper>
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
        </ImageModalWrapper>
      )}
    </PageWrapper>
    );
  }

  const calculateColumns = () => {
    const width = window.innerWidth;
    if (width >= 1200) {
      return 5;
    } else if (width >= 992) {
      return 5;
    } else if (width >= 768) {
      return 4;
    } else {
      return 3;
    }
  };

  export default ImagesPageNew;