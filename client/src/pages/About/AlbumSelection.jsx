import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './Card.css';

const AlbumSelection = () => {
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
      <h3 className='card-h3'>Instant & Secure Photo Sharing</h3>
      <Carousel
        showThumbs={false}
        infiniteLoop={true}
        showStatus={false}
        autoPlay={isHovered}
        interval={3000}
        stopOnHover={true}
        showIndicators={false}
      >
        <div>
          <img src="/assets/1.1.jpg" alt="Album 1" />
        </div>
        <div>
          <img src="/assets/1.2.jpg" alt="Album 2" />
        </div>
        <div>
          <img src="/assets/1.3.jpg" alt="Album 3" />
        </div>
      </Carousel>
    </div>
  );
};

export default AlbumSelection;
