import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import Modal from "../../components/ImageModal/ImageModal";
import { useNavigate } from "react-router-dom";
import API_UTIL from "../../services/AuthIntereptor";
import Footer from "../../components/Footer/Footer";
import "../../components/Footer/Footer.css";
import "./ImagePage-new.css";
import AppBar from "../../components/AppBar/AppBar";
import MiniHeroComponent from "../../components/MiniHeroComponent/MiniHeroComponent";
import Masonry from "react-masonry-css";

function FlashbacksImages() {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [clickedImg, setClickedImg] = useState(null);
  const [clickedImgIndex, setClickedImgIndex] = useState(null);
  const [clickedImgFavourite, setClickedImgFavourite] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const [continuationToken, setContinuationToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [clientObj, setClientObj] = useState(null);
  const [bannerImg, setBannerImg] = useState(null);
  const { flashbackName, eventId } = useParams();
  const navigate = useNavigate();
  const loader = useRef(null);

  const [breakpointColumnsObj, setBreakpointColumnsObj] = useState({
    default: 6,
    1200: 5,
    992: 4,
    768: 3,
    576: 2,
  });

  useEffect(() => {
    const handleResize = () => {
      setBreakpointColumnsObj({
        default: 6,
        1200: 5,
        992: 4,
        768: 3,
        576: 2,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Initial image fetch
    fetchImages();
  }, []);

  const fetchImages = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await API_UTIL.get(`/getFlashbackImages/${flashbackName}/${eventId}?continuationToken=${encodeURIComponent(continuationToken || '')}`);
      
      if (response.status === 200) {
        const { images: s3Urls, lastEvaluatedKey } = response.data;

        const formattedImages = s3Urls.map((url) => ({
          original: url,
          thumbnail: url,
          isFavourites: false,
        }));

        setImages((prevImages) => {
          // Create a set of existing image URLs to quickly check for duplicates
          const existingImageUrls = new Set(prevImages.map((image) => image.original));
        
          // Filter out any images that already exist in the current state
          const newImages = formattedImages.filter(
            (image) => !existingImageUrls.has(image.original)
          );
        
          // Return a new array with the existing images and the filtered new images
          return [...prevImages, ...newImages];
        });
        
        // Update continuation token for next fetch
        setContinuationToken(lastEvaluatedKey);

        // Determine if more images are available
        setHasMore(Boolean(lastEvaluatedKey));
      } else {
        console.error("Failed to fetch images");
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [continuationToken, isLoading, hasMore, eventId, flashbackName]); // Use useCallback to prevent re-creation on each render


  useEffect(() => {
    const fetchClientDetails = async (eventId) => {
  
      try {
        const response = await API_UTIL.get(`/getClientDetailsByEventId/${eventId}`);
        if (response.status === 200) {
          setClientObj(response.data);
        } else {
          throw new Error("Failed to fetch client Details");
        }
      } catch (error) {
        console.error("Error fetching user thumbnails:", error);
        setIsLoading(false);
      } 
    };
    if(eventId){
      fetchClientDetails(eventId);
    }
  }, [eventId]);

  const handleClick = (item, index) => {
    setClickedImg(item.thumbnail);
    setClickedImgIndex(index);
    setClickedImgFavourite(item.isFavourites);
    setClickedUrl(item.original);
    window.history.pushState({ id: 1 }, null, "?image=" + `${item.original.split('/').pop()}`);
  };

  const handleBackButton = () => {
    setClickedImg(null);
  };

  useEffect(() => {
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchImages();
        }
      },
      {
        root: null, // Relative to the viewport
        rootMargin: "0px",
        threshold: 0.5, // Trigger when 50% of the loader is visible
      }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [fetchImages, hasMore, isLoading]); // Updated dependencies

  return (
    <div className="page-container">
      {isLoading && images.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          <AppBar />
          {clientObj && (
            <MiniHeroComponent
            userName={clientObj.user_name}
              orgName={clientObj.org_name}
              socialMediaLinks={clientObj.social_media}
              backdropImage={bannerImg}
            />
          )}
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
                    </div>
                  ))}
                </Masonry>
                <div ref={loader} style={{ height: '20px', marginTop: '20px' }} />
                {clickedImg && (
                  <Modal
                    clickedImg={clickedImg}
                    clickedImgIndex={clickedImgIndex}
                    clickedImgFavourite={clickedImgFavourite}
                    setClickedImg={setClickedImg}
                    clickedUrl={clickedUrl}
                    handleBackButton={handleBackButton}
                    images={images}
                    favourite={false}
                    
                  />
                )}
              </div>
            ) : (
              <p>No images to display</p>
            )}
          </div>
          <Footer />
        </>
      )}
    </div>
  );
}

export default FlashbacksImages;
