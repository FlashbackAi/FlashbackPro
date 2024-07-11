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
      <h3 className='card-h3'>Album Selection</h3>
      <p className='card-p'>Select and organize your photo albums.</p>
      <Carousel
        showThumbs={false}
        infiniteLoop={true}
        showStatus={false}
        autoPlay={isHovered}
        interval={3000}
        stopOnHover={true}
      >
        <div>
          <img src="https://via.placeholder.com/600x400.png?text=Album+1" alt="Album 1" />
        </div>
        <div>
          <img src="https://via.placeholder.com/600x400.png?text=Album+2" alt="Album 2" />
        </div>
        <div>
          <img src="https://via.placeholder.com/600x400.png?text=Album+3" alt="Album 3" />
        </div>
      </Carousel>
    </div>
  );
};

export default AlbumSelection;
