// PhotoCollageComponent.js
import React from 'react';
import './PhotoCollageComponent.css';

const PhotoCollageComponent = ({ images }) => {
  return (
    <div className="collage">
      {images.map((image, index) => (
        <div key={index} className="collage-item">
          <img src={image.src} alt={`Collage Item ${index}`} />
        </div>
      ))}
    </div>
  );
};

export default PhotoCollageComponent;
