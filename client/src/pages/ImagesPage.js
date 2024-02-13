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
      })
      .catch(error => {
        console.error("Error fetching flashBacks: ", error);
      });

      console.log(flashBacks)
      if(!flashBacks.some(flashBack => flashBack.folder_name === folderName))
      {
        // const formData = new FormData();
        // formData.append('folderName', folderName);
        // formData.append('username',username);
        try {
            const response =  axios.post(`${serverIP}/addFolder`,  {folderName:folderName, username: username });
            if(response.status !== 200 )
            {
              throw new Error(response.data.message)
            }
          } catch (error) {
            console.error(error);
          }
      }
      else
      {
        console.log("user does nothave folder");
      }

    fetchImages();
  }, [folderName]);

  const fetchImages = async() =>{
    console.log("images are being fetched from " +folderName)
    try {
      const fetchedImages = async () => {
        const response = await fetch(`${serverIP}/images/${folderName}`);
        if(response.status !== 200)
        {
          throw new Error("Error in Uploading Images")
        }
        
        const imageUrls = await response.json();
        setImages(imageUrls);
        //console.log(imageUrls[0].imageData);
        //toast.success("Images Fetched Successfully")
      };
      fetchedImages();
    }
    catch(error) {
        //toast.error(error)
        console.error('Error fetching images:', error);
      };
  };

  return (
    <div>
      <h1>Images in: {folderName}</h1>
      <div className="images-container">
      {images.map((image, index) => (
          // <img key={index} src={image} alt={`img-${index}`} />
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
