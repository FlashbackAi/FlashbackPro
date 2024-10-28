import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Grid } from "lucide-react";
import styled from "styled-components";
import API_UTIL from '../../../services/AuthIntereptor';
import { useParams } from "react-router";
import LoadingSpinner from "../../../components/Loader/LoadingSpinner";
import AppBar from "../../../components/AppBar/AppBar";
import Footer from "../../../components/Footer/Footer";
import MiniHeroComponent from "../../../components/MiniHeroComponent/MiniHeroComponent";
import ImageModal from "../../../components/ImageModal/ImageModal";
import defaultBanner from '../../../media/images/defaultbanner.jpg';

const PortfolioContainer = styled.div`
  background: linear-gradient(to bottom, #121212, #1a1a1a);
  min-height: 100vh;
  color: #ffffff;
`;

const ContentWrapper = styled.div`
  position: relative;
  padding: 0 2rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(180deg, rgba(0,255,255,0.03) 0%, rgba(0,0,0,0) 100%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const EventSelector = styled.div`
  position: relative;
  margin: 2rem auto 3rem;
  max-width: 400px;
  z-index: 10;
`;

const EventButton = styled.button`
  background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 1rem;
  color: #ffffff;
  padding: 1.2rem 1.5rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    background: linear-gradient(145deg, #2a2a2a, #333333);
    border-color: #00ffff;
    box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #00ffff;
  }
`;

const EventList = styled(motion.div)`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.1);
`;

const EventItem = styled(motion.button)`
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: #ffffff;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: rgba(0, 255, 255, 0.1);
    color: #00ffff;
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const ImageGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 3fr));
    gap: 1rem;
  }
`;

const ImageWrapper = styled(motion.div)`
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    display: block;
    padding-top: 75%;
  }

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s ease;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0) 50%
    );
    opacity: 0;
    transition: all 0.3s ease;
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 48px rgba(0, 255, 255, 0.2);

    img {
      transform: scale(1.05);
    }

    .overlay {
      opacity: 1;
    }
  }
`;

const ModalWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const Portfolio = () => {
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [portfolioImages, setPortfolioImages] = useState({});
  const [folderNames, setFolderNames] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFolderImages, setSelectedFolderImages] = useState([]);
  const [clickedImg, setClickedImg] = useState(null);
  const [clickedImgIndex, setClickedImgIndex] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [bannerImg, setBannerImg] = useState('');
  const { userName } = useParams();

  const fetchBannerImage = async (userDetails) => {
    if (userDetails.org_name && userDetails.user_name) {
      try {
        const response = await API_UTIL.get(`/getBannerImage/${userDetails.user_name}`);
        if (response.data && response.data.imageUrl) {
          const formattedUrl = encodeURIWithPlus(response.data.imageUrl);
          setBannerImg(`${formattedUrl}?t=${Date.now()}`);
        } else {
          setBannerImg(defaultBanner);
        }
      } catch (error) {
        setBannerImg(defaultBanner);
      }
    } else {
      setBannerImg(defaultBanner);
    }
  };

  const fetchPortfolioImages = async (user_name) => {
    try {
      const response = await API_UTIL.get(`/getPortfolioImages/${user_name}`);
      if (response.status === 200) {
        const images = response.data;
        if (!images || images.length === 0) {
          setPortfolioImages([]);
          setFolderNames([]);
          setSelectedFolder('');
          return;
        }
        const folderNames = images.map(folder => folder.folderName);
        setFolderNames(folderNames);
        setSelectedFolder(folderNames[0] || '');
        const selectedImages = images.find(folder => folder.folderName === folderNames[0])?.images || [];
        setSelectedFolderImages(selectedImages);
        setPortfolioImages(images);
      }
    } catch (error) {
      console.error('Error fetching portfolio images:', error);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await API_UTIL.get(`/fetchUserDetailsByUserName/${userName}`);
        const userData = response.data.data;
        setUserDetails(userData);
        await fetchBannerImage(userData);
        await fetchPortfolioImages(userData.user_name);
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

  const handleFolderSelect = (folderName) => {
    setSelectedFolder(folderName);
    const selectedImages = portfolioImages.find(folder => folder.folderName === folderName)?.images || [];
    setSelectedFolderImages(selectedImages);
    setIsEventListOpen(false);
  };

  const handleImageClick = (imageData, index) => {
    const updatedImages = selectedFolderImages.map(image => ({
      original: image.s3_url,
      thumbnail: image.s3_url,
    }));
    
    setImages(updatedImages);
    setClickedImg(imageData.s3_url);
    setClickedImgIndex(index);
    setClickedUrl(imageData.s3_url);
    window.history.pushState({ id: 1 }, null, "?image=" + `${imageData.s3_url.split('/').pop()}`);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <PortfolioContainer>
      <AppBar />
      {userDetails.org_name && (
        <MiniHeroComponent
          orgName={userDetails.org_name}
          socialMediaLinks={userDetails.social_media}
          backdropImage={bannerImg}
        />
      )}

      <ContentWrapper>
        <EventSelector>
          <EventButton onClick={() => setIsEventListOpen(!isEventListOpen)}>
            <span>{selectedFolder || "Select Event"}</span>
            <span className="icon-wrapper">
              <ChevronDown 
                size={18}
                style={{
                  transform: isEventListOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </span>
          </EventButton>

          <AnimatePresence>
            {isEventListOpen && (
              <EventList
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {folderNames.map((folder) => (
                  <EventItem
                    key={folder}
                    onClick={() => handleFolderSelect(folder)}
                    whileHover={{ x: 10 }}
                  >
                    {folder}
                  </EventItem>
                ))}
              </EventList>
            )}
          </AnimatePresence>
        </EventSelector>

        <ImageGrid
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {selectedFolderImages.map((image, index) => (
            <ImageWrapper
              key={index}
              variants={itemVariants}
              onClick={() => handleImageClick(image, index)}
            >
              <img src={image.s3_url} alt={`Event ${index + 1}`} />
              <motion.div 
                className="overlay"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <Grid size={24} color="#00ffff" />
              </motion.div>
            </ImageWrapper>
          ))}
        </ImageGrid>
      </ContentWrapper>

      <AnimatePresence>
        {clickedImg && (
          <ModalWrapper
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ImageModal
              clickedImg={clickedImg}
              clickedImgIndex={clickedImgIndex}
              favourite={false}
              setClickedImg={setClickedImg}
              clickedUrl={clickedUrl}
              handleBackButton={() => setClickedImg(null)}
              images={images}
            />
          </ModalWrapper>
        )}
      </AnimatePresence>

      <Footer />
    </PortfolioContainer>
  );
};

export default Portfolio;