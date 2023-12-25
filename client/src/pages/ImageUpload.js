import React, { useState } from 'react';
import "./ImageUpload.css"

function ImageUpload() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);

  const handleImageChange = (event, setImage) => {
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  return (

    <div>
    <div className="image-upload-container">
          <h1>upload</h1>
          <h1>upload</h1>
      <div className="image-slot">
        <input type="file" onChange={(e) => handleImageChange(e, setImage1)} accept="image/*" />
        {image1 && <img src={image1} alt="Slot 1" />}
      </div>
      <div className="image-slot">
        <input type="file" onChange={(e) => handleImageChange(e, setImage2)} accept="image/*" />
        {image2 && <img src={image2} alt="Slot 2" />}
      </div>
    </div>
    </div>
  );
}

export default ImageUpload;
