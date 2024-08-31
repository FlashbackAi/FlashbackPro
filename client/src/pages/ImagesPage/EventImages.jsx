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

function EventImages() {
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
  const { eventName } = useParams();
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
      const response = await API_UTIL.get(`/getEventImages/${eventName}?continuationToken=${encodeURIComponent(continuationToken || '')}`);
      
      if (response.status === 200) {
        const { images: s3Urls, clientObj, lastEvaluatedKey } = response.data;

        const formattedImages = s3Urls.map((url) => ({
          original: url,
          thumbnail: url,
          isFavourites: false,
        }));

        setImages((prevImages) => [...prevImages, ...formattedImages]);

        // Set client details and fetch portfolio images on first fetch
        if (!continuationToken) {
          setClientObj(clientObj);
          if (clientObj) {
            await fetchPortfolioImages(clientObj.user_name, clientObj.org_name);
          }
        }

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
  }, [continuationToken, isLoading, hasMore, eventName]); // Use useCallback to prevent re-creation on each render

  const fetchPortfolioImages = async (user_name, org_name) => {
    try {
      const response = await API_UTIL.get(`/getPortfolioImages/${org_name}/${user_name}`);
      if (response.status !== 200) {
        setBannerImg('');
      } else {
        setBannerImg(response.data.images.Banner[0].url.replace(/ /g, "%20"));
      }
    } catch (error) {
      console.error('Error fetching portfolio images:', error);
    }
  };

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

export default EventImages;
