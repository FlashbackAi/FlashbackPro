import React from "react";
import "./MiniHeroComponent.css";

import { useNavigate } from 'react-router-dom';

const MiniHeroComponent = ({ userName,orgName, socialMediaLinks, backdropImage }) => {

  const navigate = useNavigate()

  const icons = {
    instagram: "assets/Images/icon-instagram.svg",
    youtube: "assets/Images/icon-youtube.svg",
    facebook: "assets/Images/icon-facebook.svg",
  };

  return (
    <div
      className="app-mini-hero"
      style={{
        backgroundImage: `url(${backdropImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'grayscale(100%)',
      }}
    >
      <span onClick={() => navigate(`/portfolio/${userName}`)}>{orgName}</span>
      <div className="social-icons">
        {socialMediaLinks && Object.keys(socialMediaLinks).map((platform) => (
          <a
            key={platform}
            href={socialMediaLinks[platform]}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img
              src={icons[platform]}
              alt={`${platform} icon`}
              className="social-icon"
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default MiniHeroComponent;
