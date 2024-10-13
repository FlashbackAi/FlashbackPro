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

const Portfolio = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [portfolioImages, setPortfolioImages] = useState({});
  const [folderNames, setFolderNames] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const { userName } = useParams();
  const [isLoading, setLoading] = useState(true);
  const [bannerImg, setBannerImg] = useState('');
  const [gridImages, setGridImages] = useState({});

  useEffect(() => {
    const convertImagesForGridGallery = async (imagesByFolder) => {
      const gridImagesByFolder = {};
      
      for (const [folderName, images] of Object.entries(imagesByFolder)) {
        const imgs = await Promise.all(
          images.map(async (photo) => {
            const { width, height } = await loadImageDimensions(photo.url);
            return {
              src: photo.url,
              thumbnail: photo.url,
              width: Math.floor(width) || 320,
              height: Math.floor(height) || 250,
            };
          })
        );
        gridImagesByFolder[folderName] = imgs;
      }
  
      return gridImagesByFolder;
    };
    const fetchPortfolioImages = async (user_name, org_name) => {
      try {
        const response = await API_UTIL.get(`/getPortfolioImages/${user_name}`);
        if (response.status === 200) {
          const images = response.data.images;
          setPortfolioImages(images);
          setBannerImg(response.data.images.Banner[0].url.replace(/ /g, "%20"));
          
          const folders = Object.keys(images).filter(folder => folder.toLowerCase() !== 'banner');
          setFolderNames(folders);
          setSelectedFolder(folders[0] || '');

          const gridImages = await convertImagesForGridGallery(images);
          setGridImages(gridImages);
        }
      } catch (error) {
        console.error('Error fetching portfolio images:', error);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const response = await API_UTIL.get(`/fetchUserDetailsByUserName/${userName}`);
        setUserDetails(response.data.data);
        await fetchPortfolioImages(response.data.data.user_name, response.data.data.org_name);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [  userName]);

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
    setSelectedFolder(e.target.value);
  };

  const loadImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
    });
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
            <div className="dropdown">
              <label className="dropdown-label" >Event: </label>
              <select className="dropdown-select"  value={selectedFolder} onChange={handleFolderChange}>
                {folderNames.map((folder, index) => (
                  <option key={index} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
            </div>
            <div>
            <main className="gallery">
              {selectedFolder && gridImages[selectedFolder] && (
                <Gallery
                  photos={gridImages[selectedFolder]}
                  direction="row"
                  // columns={Math.min(gridImages[selectedFolder].length, 3)}
                  columns={2}
                  margin={3}
                />
              )}
            </main>
            </div>
          </div>

          <Footer />
          {selectedImageIndex !== null && (
            <Modal
              isOpen={selectedImageIndex !== null}
              onRequestClose={closeModal}
              contentLabel="Image Modal"
              className="portfolio-modal"
              overlayClassName="overlay"
            >
              <div className="portfolio-modal-content">
                <button className="portfolio-modal-close" onClick={closeModal}>
                  &times;
                </button>
                <button className="portfolio-modal-prev" onClick={showPrevImage}>
                  &lt;
                </button>
                <img
                  src={portfolioImages[selectedFolder][selectedImageIndex]?.url}
                  alt={`Galleryphoto ${selectedImageIndex + 1}`}
                  className="portfolio-modal-image"
                />
                <button className="portfolio-modal-next" onClick={showNextImage}>
                  &gt;
                </button>
              </div>
            </Modal>
          )}
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};

export default Portfolio;
