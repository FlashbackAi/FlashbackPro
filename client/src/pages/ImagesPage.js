import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";

function ImagesPage() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const { folderName } = useParams();
  const [images, setImages] = useState([]);
  const username = sessionStorage.getItem("username");
  const [flashBacks, setFlashBacks] = useState([]);
  
  //const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(()  => {
    // Fetch images based on folderName

    console.log(username);
    axios.get(`${serverIP}/folderByUsername/${username}`)
      .then(response => {
        console.log(response.data);
        setFlashBacks(response.data);
        console.log(flashBacks);
        if(!response.data.some(flashBack => flashBack.folder_name === folderName))
        {

        console.log("user doesnot have ")
        
            const response =  axios.post(`${serverIP}/addFolder`,  {folderName:folderName, username: username })
            .then( response => {
              fetchImages();
              if(response.status !== 200 )
              {
                throw new Error(response.data.message)
              }
            })
            .catch (error => {
            console.error(error);
          });
      }
      else
      {
        console.log("user already have folder");
        fetchImages();
      }
      })
      .catch(error => {
        console.error("Error fetching flashBacks: ", error);
      });
      
  }, [folderName]);

  

  const fetchImages = async () => {
    console.log("images are being fetched from " + folderName);
    try {
      const response = await fetch(`${serverIP}/images/${folderName}`);
      if (response.status !== 200) {
        throw new Error("Error in Fetching Images");
      }
      const imageData = await response.json();
      setImages(imageData);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  return (
    <div>
      <h1>Images in: {folderName}</h1>
      <div className="images-container">
      {images && images.map((image, index) => (
        image && // <img key={index} src={image} alt={`img-${index}`} />
        <img
          key={index}
          src={image.imageData}
          alt={`img-${index}`}
        />
        ))}
      </div>
    </div>
  );
}

export default ImagesPage;
