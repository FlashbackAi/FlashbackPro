import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css'; // Import the CSS

function ImagesPage() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const { folderName } = useParams();
  const [images, setImages] = useState([]);
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${serverIP}/images/${folderName}`);
        if (response.status === 200) {
          // Format images for react-image-gallery
          const formattedImages = response.data.map((img) => ({
            original: img.imageData, // Assuming `imageData` is the URL to the image
            thumbnail: img.imageData, // Optionally, if you have a thumbnail URL, use that instead
          }));
          setImages(formattedImages);
        } else {
          throw new Error("Failed to fetch images");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [folderName, serverIP, username]);

  return (
    <div>
      <h1>Images in: {folderName}</h1>
      {images.length > 0 ? (
        <ImageGallery items={images} />
      ) : (
        <p>No images to display</p>
      )}
    </div>
  );
}

export default ImagesPage;