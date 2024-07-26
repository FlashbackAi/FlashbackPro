import React, { useState } from 'react';
import './Portfolio.css';
import Modal from 'react-modal';

const photos = [
  'https://www.hindustantimes.com/ht-img/img/2024/02/21/1600x900/rakul_preet_singh_1708527529195_1708527529380.png',
  'https://www.hindustantimes.com/ht-img/img/2024/02/21/1600x900/rakul_preet_singh_1708527529195_1708527529380.png',
  'https://www.hindustantimes.com/ht-img/img/2024/02/21/1600x900/rakul_preet_singh_1708527529195_1708527529380.png',
  'https://www.hindustantimes.com/ht-img/img/2024/02/21/1600x900/rakul_preet_singh_1708527529195_1708527529380.png',
  'https://www.hindustantimes.com/ht-img/img/2024/02/21/1600x900/rakul_preet_singh_1708527529195_1708527529380.png',
  'https://www.hindustantimes.com/ht-img/img/2024/02/21/1600x900/rakul_preet_singh_1708527529195_1708527529380.png',
  'https://www.hindustantimes.com/ht-img/img/2024/02/21/1600x900/rakul_preet_singh_1708527529195_1708527529380.png',
  'https://www.hindustantimes.com/ht-img/img/2024/02/21/1600x900/rakul_preet_singh_1708527529195_1708527529380.png',
  // Add more photo URLs here
];

const socialMediaLinks = {
  instagram: {
    url: 'https://www.instagram.com/aarvi_media/',
    icon: 'https://img.icons8.com/color/2x/instagram-new.png', // Replace with your Instagram icon URL
  },
  facebook: {
    url: 'https://www.facebook.com/mediaaarvi',
    icon: 'https://img.icons8.com/color/2x/facebook.png', // Replace with your Facebook icon URL
  },
  youtube: {
    url: 'https://www.youtube.com/@aarvimedia',
    icon: 'https://img.icons8.com/color/2x/youtube-play.png', // Replace with your YouTube icon URL
  },
  // Add more social media links and icons here
};

const Portfolio = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const openModal = (index) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const showPrevImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
    console.log("Previous Image");
  };

  const showNextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % photos.length);
    console.log("Next Image");
  };

  return (
    <div className="portfolio-container">
      <header className="main-header">
        <h1>Aarvi Media</h1>
      </header>
      <header className="secondary-header">
        {Object.keys(socialMediaLinks).map((platform) => (
          <a
            key={platform}
            href={socialMediaLinks[platform].url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src={socialMediaLinks[platform].icon} alt={`${platform} icon`} className="social-icon" />
          </a>
        ))}
      </header>
      <main className="gallery">
        {photos.map((photo, index) => (
          <div key={index} className="photo-container" onClick={() => openModal(index)}>
            <img src={photo} alt={`Gallery photo ${index + 1}`} className="gallery-photo" />
          </div>
        ))}
      </main>
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
            <img src={photos[selectedImageIndex]} alt={`Gallery photo ${selectedImageIndex + 1}`} className="portfolio-modal-image" />
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
