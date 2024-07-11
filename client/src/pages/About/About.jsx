// import React from 'react';
// import PhotoSharing from './PhotoSharing';
// import AlbumSelection from './AlbumSelection';
// import Login from "../Auth/Login/Login";
// import './About.css';
// import backgroundVideo from './Flashback logo spinning loop.mp4'; // Ensure you provide the correct path to your video file

// const App = () => {
//   return (
//     <div>
//       <header className='header-background'>
//         <div className="video-container">
//           <video className="background-video" src={backgroundVideo} autoPlay loop muted />
//         </div>
//         <div className="container header-content">
//           <h1 className='header-h1'>Flashback Inc</h1>
//           <p className='header-p'>Your Secure Memory Sharing Platform</p>
//           <a href="#how-it-works" className="cta-button">Get Started</a>
//         </div>
//       </header>

//       <section id="how-it-works" className="about-container">
//         <div className="steps">
//           <div className='photo-album-container'>
//             <PhotoSharing />
//             <AlbumSelection />
//           </div>
//           <div>
//             <div className='login-container'><Login /></div>
//           </div>
//         </div>
//       </section>

//       <footer>
//         <div className="container">
//           <p>&copy; 2024 Flashback Inc. All rights reserved.</p>
//           <p>Contact Us: +919090301234 | +919090401234</p>
//           <p>Write to Us: team@flashback.inc</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default App;


import React, { useState } from 'react';
import PhotoSharing from './PhotoSharing';
import AlbumSelection from './AlbumSelection';
import Login from "../Auth/Login/Login";
import Modal from 'react-modal';
import './About.css';
import backgroundVideo from './Flashback logo spinning loop.mp4'; // Ensure you provide the correct path to your video file
import Footer from '../../components/Footer/Footer';

Modal.setAppElement('#root'); // Set the app root element for accessibility

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <header className='header-background'>
        <div className="video-container">
          <video className="background-video" src={backgroundVideo} autoPlay loop muted />
        </div>
        <div className="container header-content">
          <h1 className='header-h1'>Flashback Inc</h1>
          <p className='header-p'>Your Secure Memory Sharing Platform</p>
          <button onClick={openModal} className="cta-button">Get Started</button>
        </div>
      </header>

      <section id="how-it-works" className="about-container">
        <div className="steps">
          <div className='photo-album-container'>
            <PhotoSharing />
            <AlbumSelection />
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default App;
