import React from "react";
import "./MiniHeroComponent.css";

const MiniHeroComponent = () => {
  const socialMediaLinks = {
    instagram: {
      url: "https://www.instagram.com/aarvi_media/",
      icon: "assets/Images/icon-instagram.svg", // Replace with your Instagram icon URL
    },
    youtube: {
      url: "https://www.youtube.com/@aarvimedia",
      icon: "assets/Images/icon-youtube.svg", // Replace with your YouTube icon URL
    },
    facebook: {
      url: "https://www.facebook.com/mediaaarvi",
      icon: "assets/Images/icon-facebook.svg", // Replace with your Facebook icon URL
    }
    // Add more social media links and icons here
  };
  return (
    <div className="app-mini-hero">
      <span>Aarvi Media</span>
      <div className="social-icons">
        {Object.keys(socialMediaLinks).map((platform) => (
          <a
            key={platform}
            href={socialMediaLinks[platform].url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img
              src={socialMediaLinks[platform].icon}
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
