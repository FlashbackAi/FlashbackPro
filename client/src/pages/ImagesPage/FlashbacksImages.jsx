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
import defaultBanner from '../../media/images/defaultbanner.jpg';
import JSZip from "jszip"; // Import JSZip
import { saveAs } from "file-saver"; // Import FileSaver.js for saving files
import styled, { createGlobalStyle } from 'styled-components';
import {Download} from 'lucide-react';

const ActionButton = styled.button`
  background-color: #2a2a2a;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  margin: .8rem;
  width:30%;

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
  width:60%
}
`;

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
  const [bannerImage, setBannerImage] = useState('');
  const [eventOwners, setEventOwners] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownload, setShowDownload] = useState(true);

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
    // Initial image fetch
    if(flashbackName === 'favourites'){
      setShowDownload(false);
      fetchEventFavouriteImages();     
    }else
    fetchImages();
  },[eventId]);

  const fetchEventOwners = async () => {
    try {
      const response = await API_UTIL.get(`/getEventOwners/${eventId}`);
      if (response.status ===200){
        return response.data;
      } else{
        throw new Error('Failed to fetch');
      }
    } catch (err) {
      console.log(err.message);
      throw new Error('Failed to fetch');
    }
  };
  const fetchEventFavouriteImages = async()=>{
    setIsLoading(true);
    try {
      const eventOwners = await fetchEventOwners();
      for(const owner of eventOwners.owners){
      const response = await API_UTIL.get(`/getOwnerFavImages/${eventOwners.folder_name}/${owner}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
        // If you need to send body data or authentication, include it here
      });
      if(response.status === 200){

        const formattedImages = response.data.map((obj) => {
  // Replace 'Deliverables/' with 'Deliverables/thumbnails/' to get the thumbnail URL
  const thumbnailUrl = obj.s3_url.replace('/Deliverables/', '/Deliverables/thumbnails/');

  return {
    original: obj.s3_url,
    thumbnail: thumbnailUrl,
  };
});

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
      }
    }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchImages = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await API_UTIL.get(`/getFlashbackImages/${flashbackName}/${eventId}?continuationToken=${encodeURIComponent(continuationToken || '')}`);
      
      if (response.status === 200) {
        const { images: s3Urls, continuationToken:lastEvaluatedKey } = response.data;
        console.log(lastEvaluatedKey);

        const formattedImages = s3Urls.map((obj) => {
          // Replace 'Deliverables/' with 'Deliverables/thumbnails/' to get the thumbnail URL
          const thumbnailUrl = obj.replace('/Deliverables/', '/Deliverables/thumbnails/');
        
          return {
            original: obj,
            thumbnail: thumbnailUrl,
          };
        });
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

  const encodeURIWithPlus = (uri) => {
    return uri.replace(/ /g, '+');
  };

  useEffect(()=>{
  const fetchBannerImage = async () => {
      setIsLoading(true);
    if (clientObj.org_name && clientObj.user_name) {
      try {
        const response = await API_UTIL.get(`/getBannerImage/${clientObj.user_name}`);
          
        if (response.data && response.data.imageUrl) {
          const formattedUrl = encodeURIWithPlus(response.data.imageUrl);
          
          setBannerImage(`${formattedUrl}?t=${Date.now()}`);
        } else {
          console.log('[catch1]Falling back to default banner');
          setBannerImage(defaultBanner);
        }
      } catch (error) {
        console.error('Error fetching banner image:', error);
        console.log(`[catch2]Falling back to default banner`);
        setBannerImage(defaultBanner);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log(`[catch3]Falling back to default banner`);
      setBannerImage(defaultBanner);
      setIsLoading(false);
    }
  }
  if(clientObj){
    fetchBannerImage();
  }

},[clientObj]);

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

  // const downloadAllImages = async () => {
  //   setIsDownloading(true);
  //   try{
  //   const zip = new JSZip();
  //   const imgFolder = zip.folder("images");

  //   for (const image of images) {
  //     const response = await fetch(image.original,{ mode: 'no-cors' });
  //     const blob = await response.blob();
  //     const fileName = image.original.split('/').pop();
  //     imgFolder.file(fileName, blob);
  //   }

  //   zip.generateAsync({ type: "blob" }).then((content) => {
  //     saveAs(content, "images.zip");
  //   });
  // }
  // catch(err){
  //   console.log(err);
  // }
  // finally{
  //   setIsDownloading(false);
  // }
  // };


  // const downloadAllImages = async () => {
  //   setIsDownloading(true);
  //   try {
  //     for (const image of images) {
  //       await downloadImage(image.original);
  //     }
  //   } catch (error) {
  //     console.error("Error downloading images:", error);
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };
  const downloadAllImages = () => {
    setIsDownloading(true);

    // Construct the download URL with route parameters
    const downloadUrl = `${process.env.REACT_APP_SERVER_IP}/downloadFlashbacks/${encodeURIComponent(eventId)}/${encodeURIComponent(flashbackName)}`;

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${flashbackName}_${eventId}.zip`);

    // Append the link to the body
    document.body.appendChild(link);

    // Simulate a click to trigger the download
    link.click();

    // Clean up by removing the temporary link
    document.body.removeChild(link);

    // Reset the button state after a delay
    const resetDelay = 10000; // 10 seconds, adjust as needed
    setTimeout(() => {
      setIsDownloading(false);
    }, resetDelay);
  };


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
              backdropImage={bannerImage}
            />
          )}
          <div className="content-wrap">
          {images.length > 0 && showDownload &&  (
            
              <ActionButton onClick={downloadAllImages} title="Download QR Code">
              {isDownloading ? (
              <span >Downloading...</span>
            ) : (
              <>
                <Download size={18}/>
                <span style={{marginLeft:'.5em', fontSize:'1.2em'}}>Download All </span>
              </>
            )}
            </ActionButton>
            )}
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
