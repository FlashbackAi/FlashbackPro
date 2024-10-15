import React, { useState, useEffect } from "react";
import "./Portfolio.css";
import Modal from "react-modal";
import Footer from "../../../components/Footer/Footer";
import AppBar from "../../../components/AppBar/AppBar";
import MiniHeroComponent from "../../../components/MiniHeroComponent/MiniHeroComponent";
import API_UTIL from '../../../services/AuthIntereptor';
import { useParams } from "react-router";
import Gallery from "react-photo-gallery";
import LoadingSpinner from "../../../components/Loader/LoadingSpinner";
import defaultBanner from '../../../media/images/defaultbanner.jpg';
import Masonry from "react-masonry-css";
import ImageModal from "../../../components/ImageModal/ImageModal";
import { LazyLoadImage } from "react-lazy-load-image-component";

import styled, { createGlobalStyle } from 'styled-components';

import { motion, AnimatePresence } from 'framer-motion';



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



const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 1.25rem;
  max-width: 31.25rem;
  width: 90%;
  color: #ffffff;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1rem;
  transition: color 0.3s ease;

  &:hover {
    color: #00ffff;
  }
`;

const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
`;

const Label = styled.label`
  margin-right: 10px;
  margin-left: 2em;
  font-weight: bold;
  font-size:2em;
  color: #333;
`;

const Select = styled.select`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 1.2em;

  &:hover {
    border-color: #888;
  }
`;

const Portfolio = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [portfolioImages, setPortfolioImages] = useState({});
  const [folderNames, setFolderNames] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFolderImages, setSelectedFolderImages] = useState('');
  const { userName } = useParams();
  const [isLoading, setLoading] = useState(true);
  const [bannerImg, setBannerImg] = useState('');
  const [images, setImages] = useState([]);
  const [clickedImg, setClickedImg] = useState(null);
  const [clickedImgIndex, setClickedImgIndex] = useState(null);
  const [clickedImgFavourite, setClickedImgFavourite] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const [breakpointColumnsObj, setBreakpointColumnsObj] = useState({
    default: 5,
    1200: 4,
    992: 3,
    768: 2,
    576: 1,
  });

  useEffect(() => {
    // const convertImagesForGridGallery = async (imagesByFolder) => {
    //   const gridImagesByFolder = {};
      
    //   for (const [folderName, images] of Object.entries(imagesByFolder)) {
    //     const imgs = await Promise.all(
    //       images.map(async (photo) => {
    //         const { width, height } = await loadImageDimensions(photo.url);
    //         return {
    //           src: photo.s3_url,
    //           thumbnail: photo.s3_url,
    //           width: Math.floor(width) || 320,
    //           height: Math.floor(height) || 250,
    //         };
    //       })
    //     );
    //     gridImagesByFolder[folderName] = imgs;
    //   }
  
    //   return gridImagesByFolder;
    // };
    const fetchPortfolioImages = async (user_name) => {
      try {
        const response = await API_UTIL.get(`/getPortfolioImages/${user_name}`);
        if (response.status === 200) {
          const images = response.data;
    
          if (!images || images.length === 0) {
            // Handle case where no images are returned
            setPortfolioImages([]);
            setBannerImg(null);
            setFolderNames([]);
            setSelectedFolder('');
            return;
          }

          // Filter out the banner folder and extract folder names
          const folderNames = images.map(folder => folder.folderName);
          setFolderNames(folderNames);
          setSelectedFolder(folderNames[0] || '');
          const selectedImages = images.find(folder => folder.folderName === folderNames[0])?.images || [];
          console.log(selectedImages);
          setSelectedFolderImages(selectedImages);;
    
          // Set the portfolio images for other uses
          setPortfolioImages(images);
        }
      } catch (error) {
        console.error('Error fetching portfolio images:', error);
      }
    };
    
    const fetchBannerImage =async (userDetails) => {

      if (userDetails.org_name && userDetails.user_name) {
        try {
          const response = await API_UTIL.get(`/getBannerImage/${userDetails.user_name}`);
          console.log(`ImageURl:`, response.data.imageUrl);
            
          if (response.data && response.data.imageUrl) {
            const formattedUrl = encodeURIWithPlus(response.data.imageUrl);
            console.log(`formattedUrl:`, formattedUrl);
            setBannerImg(`${formattedUrl}?t=${Date.now()}`);
          } else {
            console.log('[catch1]Falling back to default banner');
            setBannerImg(defaultBanner);
          }
        } catch (error) {
          setBannerImg(defaultBanner);
        } 
      } else {
        setBannerImg(defaultBanner);
      }
    };
    const fetchUserDetails = async () => {
      try {
        const response = await API_UTIL.get(`/fetchUserDetailsByUserName/${userName}`);
        setUserDetails(response.data.data);
        fetchBannerImage(response.data.data);
        await fetchPortfolioImages(response.data.data.user_name, response.data.data.org_name);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userName]);

  const encodeURIWithPlus = (uri) => {
    return uri.replace(/ /g, '+');
  };

  const openModal = (index) => {
    setSelectedImageIndex(index);
  };

  const handleClick = (event, { photo, index }) => {
    openModal(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const showPrevImage = () => {
    setSelectedImageIndex(
      (prevIndex) => (prevIndex - 1 + portfolioImages[selectedFolder].length) % portfolioImages[selectedFolder].length
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % portfolioImages[selectedFolder].length);
  };

  const handleFolderChange = (e) => {
    const newFolderName = e.target.value;
    setSelectedFolder(newFolderName);
    console.log(newFolderName);  // Log the selected folder name

    // Filter images based on selected folder
    const selectedImages = portfolioImages.find(folder => folder.folderName === newFolderName)?.images || [];
    setSelectedFolderImages(selectedImages);
    console.log(selectedImages);  // Log the filtered images
  };

  const handleImageClick = (imageData, index, images) => {
    const updatedImages = images.map(image => ({
      original: image.s3_url,  // Rename s3_url to original
      thumbnail: image.s3_url, // Add thumbnail with the same value as s3_url
    }));
    
    setImages(updatedImages);
    setClickedImg(imageData.s3_url);
    setClickedImgIndex(index);
    setClickedImgFavourite(imageData.isFavourites);
    setClickedUrl(imageData.original);
    window.history.pushState({ id: 1 }, null, "?image=" + `${imageData.s3_url.split('/').pop()}`);
  };
  const handleBackButton = () => {
    setClickedImg(null);
  };
  

 

  return (
    <>
      {isLoading === false ? (
        <div className="portfolio-container">
          <AppBar />
          {userDetails.org_name && (
            <MiniHeroComponent
              orgName={userDetails.org_name}
              socialMediaLinks={userDetails.social_media}
              backdropImage={bannerImg}
            />
          )}
          <div id="portfolio-body">
          <DropdownContainer className="dropdown">
            <Label className="dropdown-label">Event:</Label>
            <Select className="dropdown-select" value={selectedFolder} onChange={handleFolderChange}>
              {folderNames.map((folder, index) => (
                <option key={index} value={folder}>
                  {folder}
                </option>
              ))}
            </Select>
          </DropdownContainer>
            <div>
              {selectedFolder && selectedFolderImages && (
                <AnimatePresence>
                <StyledMasonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                  {selectedFolderImages.map((image, imgIndex) => (
                    <ImageWrapper key={imgIndex}>
                      <img
                        src={image.s3_url}  // Use the s3_url directly from the API response
                        alt={`img ${imgIndex}`}
                        effect="blur"
                        onClick={() => handleImageClick(image, imgIndex,selectedFolderImages)}
                      />
                    </ImageWrapper>
                  ))}
                </StyledMasonry>
                </AnimatePresence>
              )}
            </div>
          </div>

          <Footer />
          {clickedImg && (
            <ImageModalWrapper>
            <ImageModal
            clickedImg={clickedImg}
            clickedImgIndex={clickedImgIndex}
            favourite = {false}
            setClickedImg={setClickedImg}
            clickedUrl={clickedUrl}
            handleBackButton={handleBackButton}
            images={images}
            />
            </ImageModalWrapper>
          )}
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};

export default Portfolio;
