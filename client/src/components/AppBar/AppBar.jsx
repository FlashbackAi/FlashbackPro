import React from 'react'
import './AppBar.css'
import { COMPANY_NAME } from '../../helpers/constants';


const AppBar = () => {
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
    </div>
  )
}

export default AppBar;
