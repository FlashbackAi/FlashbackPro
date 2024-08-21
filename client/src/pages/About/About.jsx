import React, { useState } from "react";
import PhotoSharing from "./PhotoSharing";
import AlbumSelection from "./AlbumSelection";
import Login from "../Auth/Login/Login";
import Modal from "react-modal";
import "./About.css";
import backgroundVideo from "./Flashback logo spinning loop.mp4"; // Ensure you provide the correct path to your video file
import Footer from "../../components/Footer/Footer";
import WeddingAlbums from "./WeddingAlbums";
import AppBar from "../../components/AppBar/AppBar";
import QAExpandComponent from "../../components/QAExpandComponent/QAExpandComponent";
import HowItWorksGroup from "../../components/HowItWorksGroup/HowItWorksGroup";

Modal.setAppElement("#root"); // Set the app root element for accessibility

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
      <AppBar showLogout={false}/>
      <header className="header-background">
        <div className="video-container">
          <img
            className="background-video"
            src="https://flashbackportfoliouploads.s3.amazonaws.com/Aarvi Media-aarvimedia/Wedding/1723054857157-S_Y03064 copy.jpg"
          />
          {/*  background-image: url();*/}
          {/*<video className="background-video" src={backgroundVideo} autoPlay loop muted />*/}
        </div>
        <div className="container header-content">
          <h1 className="header-h1">Flashback Inc</h1>
          <p className="header-p">Auto Curate & Instant Share Memories</p>
          <button onClick={openModal} className="cta-button">
            Get Started
          </button>
        </div>
      </header>
      {/* <div className='OurProducts'> */}
      {/* <h2 className='OurProducts-h2'>Our Products</h2> Small header added here */}
      {/* </div> */}
      {/* <section id="how-it-works" className="about-container">
        <div className="steps">
          <div className='photo-album-container'>
            <AlbumSelection />
            <WeddingAlbums/>
          </div>
        </div>
      </section> */}
      <div className="landing-body">
        <div className="feature">
          <div className="featureHeading">
            <span className="colorHeading featureName"> Instant & Secure </span>
            <span className="featureName"> Photo Sharing</span>
          </div>
          <div className="feature-body">
            <img src="assets/feature-photo-share.png"></img>
            <HowItWorksGroup index={0} />
          </div>
        </div>

        <div className="feature">
          <div className="featureHeading">
            <span className="colorHeading featureName"> Auto Curated </span>
            <span className="featureName"> Wedding Albums</span>
          </div>
          <div className="feature-body">
            <HowItWorksGroup index={1} />
            <img src="assets/feature-curate-album.png"></img>
          </div>
        </div>
      </div>
      <Footer />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Login Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <button onClick={closeModal} className="close-modal-button">
          &times;
        </button>
        <div className="login-container">
          <Login showAppBar={false} />
        </div>
      </Modal>
    </>
  );
};

export default About;
