import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import logoImage from '../Media/logo.png';
import '../UserMenu.css'; 

const UserMenu = (isVisible) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    console.log("logout");
    sessionStorage.setItem("accessToken", null);
    sessionStorage.clear();
    navigate("/login");
  };



  return (
    <div className={`user-menu-container ${isVisible ? 'visible' : ''}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className={`user-menu ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
        <div className="user-icon">
        <img src={logoImage} alt="Logo" />
        </div>
      </div>
      {isMenuOpen && (
        <div className="dropdown-content" ref={menuRef}>
          <a href="/profile">Profile</a>
          <a href="#">Help</a>
          <a href="#">Rewards</a>
          <a href="#">Settings</a>
          <a href="#" onClick={handleLogout}>Logout</a>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
