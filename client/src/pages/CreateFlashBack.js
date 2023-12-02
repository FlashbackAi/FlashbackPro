import React, { useState } from 'react';
import axios from "axios";
//import { PhotoCollage } from 'react-photo-collage';
import PhotoCollageComponent from './PhotoCollageComponent';

// const collageLayout = {
//     sizes: [{ cols: 2, rows: 2 }],
//   }; 
function CreateFlashBack() {
    const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('folderName', folderName);

    // for (const file of selectedFiles) {
    //     console.log(file);
    //   formData.append('images', file);
    // }
    selectedFiles.forEach(file => {
        formData.append('images', file);
    });
    const headers = {
        'Content-Type': 'multipart/form-data',
      };

    try {
      const response = await axios.post(`http://localhost:5000/upload/${folderName}`, formData,{headers});
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage('Error uploading files.');
    }
  };

  const fetchImages = async() =>{
    console.log("images are being fetched from " +folderName)
    try {
      const fetchedImages = async () => {
        const response = await fetch(`http://localhost:5000/images/${folderName}`);
        console.log(response);
        const imageUrls = await response.json();
        setUploadedImages(imageUrls);
      };
      fetchedImages();
      }
    catch(error ) {
        console.error('Error fetching images:', error);
      };
  };

  return (
    <div>
      <h1>Upload Images to S3</h1>
      <input type="text" placeholder="Folder Name" onChange={handleFolderNameChange} />
      {/* <input type="file" multiple onChange={handleFileChange} /> */}
      <input type="file" name="images" multiple accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div className="App">
      {images.length > 0 && <PhotoCollageComponent images={images} />}
      </div>
      <button onClick={fetchImages}>Check Images</button>
      <div className="imageGalleryContainer">
        {uploadedImages.map((imageUrl, index) => (
          <img key={index} src={imageUrl} alt={`img-${index}`} />
        ))}
      </div>

      <p>{message}</p>
    </div>
  );
};

export default CreateFlashBack;

