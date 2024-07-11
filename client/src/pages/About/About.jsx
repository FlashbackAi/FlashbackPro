// import React, { useState, useEffect } from 'react';
// import PhotoSharing from './PhotoSharing';
// import AlbumSelection from './AlbumSelection';
// import CreateEvents from './CreateEvents';
// import LoginPopup from './LoginPopup';
// import './About.css';

// const About = () => {
//   const [showPopup, setShowPopup] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setShowPopup(true);
//     }, 1200); // 120000 milliseconds = 2 minutes

//     return () => clearInterval(interval); // Cleanup interval on component unmount
//   }, []);

//   const handleClosePopup = () => {
//     setShowPopup(false);
//   };

//   return (
//     <div className="about-container">
//       {showPopup && <LoginPopup onClose={handleClosePopup} />}
//       <PhotoSharing />
//       <AlbumSelection />
//       <CreateEvents />
//     </div>
//   );
// };

// export default About;

// import React, { useState, useEffect } from 'react';
// import PhotoSharing from './PhotoSharing';
// import AlbumSelection from './AlbumSelection';
// import CreateEvents from './CreateEvents';
// import LoginPopup from './LoginPopup';
// import './About.css';

// const About = () => {
//   const [showPopup, setShowPopup] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setShowPopup(true);
//     }, 1200); // 120000 milliseconds = 2 minutes

//     return () => clearInterval(interval); // Cleanup interval on component unmount
//   }, []);

//   const handleClosePopup = () => {
//     setShowPopup(false);
//   };

//   return (
//     <div className="about-container">
//       {showPopup && <LoginPopup onClose={handleClosePopup} />}
//       <PhotoSharing />
//       <AlbumSelection />
//       <CreateEvents />
//     </div>
//   );
// };

// export default About;

import React from 'react';
import PhotoSharing from './PhotoSharing';
import AlbumSelection from './AlbumSelection';
import Login from "../Auth/Login/Login";
import './About.css';
import backgroundVideo from './Flashback logo spinning loop.mp4'; // Ensure you provide the correct path to your video file

const App = () => {
  return (
    <div>
      <header className='header-background'>
        <div className="video-container">
          <video className="background-video" src={backgroundVideo} autoPlay loop muted />
        </div>
        <div className="container header-content">
          <h1 className='header-h1'>Flashback Inc</h1>
          <p className='header-p'>Your Secure Memory Sharing Platform</p>
          <a href="#how-it-works" className="cta-button">Get Started</a>
        </div>
      </header>

      <section id="how-it-works" className="about-container">
        <div className="steps">
          <div className='photo-album-container'>
            <PhotoSharing />
            <AlbumSelection />
          </div>
          <div>
            <div className='login-container'><Login /></div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2024 Flashback Inc. All rights reserved.</p>
          <p>Contact Us: +919090301234 | +919090401234</p>
          <p>Write to Us: team@flashback.inc</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
