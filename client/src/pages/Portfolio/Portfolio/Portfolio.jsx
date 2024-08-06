import React, { useState, useEffect } from "react";
import "./Portfolio.css";
import Modal from "react-modal";
import Footer from "../../../components/Footer/Footer";
import AppBar from "../../../components/AppBar/AppBar";
import MiniHeroComponent from "../../../components/MiniHeroComponent/MiniHeroComponent";
import API_UTIL from '../../../services/AuthIntereptor';
import { useNavigate } from "react-router";

const Portfolio = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [portfolioImages, setPortfolioImages] = useState({});
  const [folderNames, setFolderNames] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolioImages = async (user_name, org_name) => {
      try {
        const response = await API_UTIL.get(`/getPortfolioImages/${org_name}/${user_name}`);
        if (response.status === 200) {
          const images = response.data.images;
          setPortfolioImages(images);
          const folders = Object.keys(images);
          setFolderNames(folders);
          setSelectedFolder(folders[0] || '');
        }
      } catch (error) {
        console.error('Error fetching portfolio images:', error);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const userPhoneNumber = sessionStorage.getItem('userphoneNumber');
        console.log(userPhoneNumber);
        const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
        setUserDetails(response.data.data);

        if (sessionStorage.getItem('userphoneNumber') === response.data.data.user_name || !response.data.data.hasOwnProperty('org_name')) {
          navigate(`/portfolioForm`)
        }
        await fetchPortfolioImages(response.data.data.user_name, response.data.data.org_name);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const openModal = (index) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const showPrevImage = () => {
    setSelectedImageIndex(
      (prevIndex) => (prevIndex - 1 + portfolioImages[selectedFolder].length) % portfolioImages[selectedFolder].length
    );
    console.log("Previous Image");
  };

  const showNextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % portfolioImages[selectedFolder].length);
    console.log("Next Image");
  };

  const handleFolderChange = (e) => {
    setSelectedFolder(e.target.value);
  };

  return (
    <div className="portfolio-container">
      <AppBar />
      <MiniHeroComponent />
      <div id="portfolio-body">
        <div className="folder-dropdown">
          <label htmlFor="folder-select">Select Event: </label>
          <select id="folder-select" value={selectedFolder} onChange={handleFolderChange}>
            {folderNames.map((folder, index) => (
              <option key={index} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>
        <main className="gallery">
          {selectedFolder && portfolioImages[selectedFolder] && portfolioImages[selectedFolder].map((photo, index) => (
            <div
              key={index}
              className="photo-container"
              onClick={() => openModal(index)}
            >
              <img
                src={photo.url}
                alt={`Gallery photo ${index + 1}`}
                className="gallery-photo"
              />
            </div>
          ))}
        </main>
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
              alt={`Gallery photo ${selectedImageIndex + 1}`}
              className="portfolio-modal-image"
            />
            <button className="portfolio-modal-next" onClick={showNextImage}>
              &gt;
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Portfolio;
