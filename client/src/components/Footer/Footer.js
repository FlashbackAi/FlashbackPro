import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="contact-container">
        <p>&copy; 2024 Flashback Inc. All rights reserved.</p>
        <p>
          Contact Us: <a href="tel:+919090401234">+919090401234</a>
          <a href="mailto:team@flashback.inc">,team@flashback.inc</a>
        </p>
        <p>
        </p>
    </div>
        <div className="social-container">
          <a href="https://x.com/Flashback_Inc_" target="_blank" rel="noopener noreferrer">
            <img src="https://img.icons8.com/ffffff/m_outlined/2x/twitterx--v2.png" alt="Twitter" />
          </a>
          <a href="https://www.instagram.com/flashback_inc/" target="_blank" rel="noopener noreferrer">
            <img src="https://img.icons8.com/ffffff/fluent/2x/instagram-new.png" alt="Instagram" />
          </a>
        </div>
    </footer>
  );
};

export default Footer;
