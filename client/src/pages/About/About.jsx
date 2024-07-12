import React, { useState } from 'react';
import PhotoSharing from './PhotoSharing';
import AlbumSelection from './AlbumSelection';
import Login from "../Auth/Login/Login";
import Modal from 'react-modal';
import './About.css';
import backgroundVideo from './Flashback logo spinning loop.mp4'; // Ensure you provide the correct path to your video file
import Footer from '../../components/Footer/Footer';
import WeddingAlbums from './WeddingAlbums';

Modal.setAppElement('#root'); // Set the app root element for accessibility

const About = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <header className='header-background'>
        <div className="video-container">
          <video className="background-video" src={backgroundVideo} autoPlay loop muted />
        </div>
        <div className="container header-content">
          <h1 className='header-h1'>Flashback Inc</h1>
          <p className='header-p'>Create & Share Memories</p>
          <button onClick={openModal} className="cta-button">Get Your Photos</button>
        </div>
      </header>
      <div className='OurProducts'>
      <h2 className='OurProducts-h2'>Our Products</h2> {/* Small header added here */}
      </div>
      <section id="how-it-works" className="about-container">
        <div className="steps">
          <div className='photo-album-container'>
            <AlbumSelection />
            <WeddingAlbums/>
          </div>
        </div>
      </section>

      <Footer/>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Login Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <button onClick={closeModal} className="close-modal-button">&times;</button>
        <div className='login-container'><Login /></div>
      </Modal>
    </>
  );
};

export default About;

