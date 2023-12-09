import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const [folders, setFolders] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  //const [folderName, setFolderName] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    console.log(event.target.value);
    if(selectedValue){
        fetchImages();
    }
    
  };

  useEffect(() => {
    axios.get(`${serverIP}/folders`)
      .then(response => {
        setFolders(response.data);
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const fetchImages = (event) =>{
    const folderName = event.target.value
    console.log("images are being fetched from " +folderName)
    setSelectedValue(event.target.value)
    if(folderName){
        try {
        const fetchedImages = async () => {
            const response = await fetch(`${serverIP}/images/${folderName}`);
            console.log(response);
            const imageUrls = await response.json();
            setUploadedImages(imageUrls);
        };
        fetchedImages();
        }
        catch(error ) {
            console.error('Error fetching images:', error);
        };
    }
};

const downloadFolder = async () =>{
  const folderName = selectedValue
  console.log(folderName)
  if(folderName){
      try {
          const response = await axios.get(`${serverIP}/downloadFolder/${folderName}`);
          console.log(response);
      }
      catch(error ) {
          console.error('Error fetching images:', error);
      };
  }
};

  return (
    <div>
      <h1>Album Folders</h1>
      <select value={selectedValue} onChange={fetchImages}>
        <option value="">Select an Album</option>
        {folders.map((folder, index) => (
          <option value={folder}>{folder}</option>
        ))}
      </select>
      <button onClick={downloadFolder}>Download Folder</button>
      <div className="imageGalleryContainer">
        {uploadedImages.map((imageUrl, index) => (
          <img key={index} src={imageUrl} alt={`img-${index}`} />
        ))}
      </div>
     
    </div>
  );
}

export default App;
