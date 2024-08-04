import React, { useState } from "react";
import "./Portfolio.css";
import Modal from "react-modal";
import Footer from "../../components/Footer/Footer";
import AppBar from "../../components/AppBar/AppBar";
import MiniHeroComponent from "../../components/MiniHeroComponent/MiniHeroComponent";

const photos = [
  "assets/Images/img1.jpg",
  "assets/Images/img2.jpg",
  "assets/Images/img4.jpg",
  "assets/Images/img7.jpg",
  "assets/Images/img8.jpg",
  "assets/Images/img9.jpg",
  "assets/Images/img11.jpg",
  "assets/Images/img12.jpg",
  "assets/Images/img13.jpg",
  "assets/Images/img17.jpg",
  "assets/Images/img19.jpg",
  "assets/Images/img20.jpg",

  // Add more photo URLs here
];



const Portfolio = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const openModal = (index) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const showPrevImage = () => {
    setSelectedImageIndex(
      (prevIndex) => (prevIndex - 1 + photos.length) % photos.length
    );
    console.log("Previous Image");
  };

  const showNextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % photos.length);
    console.log("Next Image");
  };

  return (
    <div className="portfolio-container">
      <AppBar/>
      <MiniHeroComponent />
      <div id="portfolio-body">
        <main className="gallery">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="photo-container"
              onClick={() => openModal(index)}
            >
              <img
                src={photo}
                alt={`Gallery photo ${index + 1}`}
                className="gallery-photo"
              />
            </div>
          ))}
        </main>
      </div>
      <Footer></Footer>
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
              src={photos[selectedImageIndex]}
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
