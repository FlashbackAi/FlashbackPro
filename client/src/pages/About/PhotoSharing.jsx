import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './Card.css';

const PhotoSharing = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h3 className='card-h3'>Photo Sharing</h3>
      <p className="card-p">Share your photos with friends and family.</p>
      <Carousel
        showThumbs={false}
        infiniteLoop={true}
        showStatus={false}
        autoPlay={isHovered}
        interval={3000}
        stopOnHover={true}
      >
        <div>
          <img src="https://via.placeholder.com/600x400.png?text=Photo+1" alt="Photo 1" />
        </div>
        <div>
          <img src="https://via.placeholder.com/600x400.png?text=Photo+2" alt="Photo 2" />
        </div>
        <div>
          <img src="https://via.placeholder.com/600x400.png?text=Photo+3" alt="Photo 3" />
        </div>
      </Carousel>
    </div>
  );
};

export default PhotoSharing;
