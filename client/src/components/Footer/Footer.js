import React from 'react';
import './Footer.css';
import { ALL_RIGHTS_RESERVED,
  CONTACT,
  YEAR,
  COMPANY_NAME,
  PHONE_NUMBER,
  EMAIL } from '../../helpers/constants';

const Footer = () => {
  return (
    <footer className="footer">
        <div className="contactus">
          <span > {CONTACT} </span>
          <a href={`tel:${PHONE_NUMBER}`}> {PHONE_NUMBER} </a>
          <a href={`mailto:${EMAIL}`}> {EMAIL} </a>
        </div>
        <div className="social-container">
          <a href="https://x.com/Flashback_Inc_" target="_blank" rel="noopener noreferrer">
            <img src="assets/Images/icon-footer-x.svg" alt="Twitter" />
          </a>
          <a href="https://www.instagram.com/flashback_inc/" target="_blank" rel="noopener noreferrer">
            <img src="assets/Images/icon-footer-instagram.svg" alt="Instagram" />
          </a>
        </div>
        <div className="copy-right-info">
          <span>{COMPANY_NAME} {" "  + YEAR}</span>
          <span>{ALL_RIGHTS_RESERVED}</span>
        </div>
    </footer>
  );
};

export default Footer;
