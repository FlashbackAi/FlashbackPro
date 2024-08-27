import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import logoImage from '../../../media/images/logo.png';
import './UserMenu.css'; 

const UserMenu = () => {
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
   localStorage.setItem("accessToken", null);
   localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="user-menu-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className={`user-menu ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
        <div className="user-icon-d">
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
