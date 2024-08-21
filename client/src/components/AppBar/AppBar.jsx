import React from 'react'
import './AppBar.css'
import { COMPANY_NAME } from '../../helpers/constants';
import { useNavigate } from 'react-router-dom';

const AppBar = ({ showLogout = true }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove session storage
    sessionStorage.clear();

    // Navigate to the default page '/'
    navigate('/');
  };
  return (
    <div className='app-bar'>
      <div className='app-bar-logo'>
        <img src='assets/Images/logo.svg'></img>
        <span>{COMPANY_NAME} </span>
      </div>
      <div className='app-bar-socials'>
      <a href="https://x.com/Flashback_Inc_" target="_blank" rel="noopener noreferrer">
            <img src="assets/Images/icon-footer-x.svg" alt="Twitter" />
          </a>
          <a href="https://www.instagram.com/flashback_inc/" target="_blank" rel="noopener noreferrer">
            <img src="assets/Images/icon-footer-instagram.svg" alt="Instagram" />
          </a>
      </div>
      {showLogout && (
      <div className='logout-section'>
        
          <button className='logout-button' onClick={handleLogout}>
            Logout
          </button>
       
      </div>
       )}
    </div>
  )
}

export default AppBar;
