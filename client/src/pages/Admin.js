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

const downloadFolderold = async () =>{
  const folderName = selectedValue
  console.log(folderName)
  if(folderName){
   // downloadZip(folderName)
      try {
          const response = await axios.get(`${serverIP}/downloadFolder/${folderName}`);
          console.log(response);
      }
      catch(error ) {
          console.error('Error fetching images:', error);
      };
  }
};

const downloadFolder = async () => {
    // Replace with your server's endpoint URL
    const folderName = selectedValue
  console.log(folderName)
  if(folderName){
    fetch(`${serverIP}/downloadFolder/${folderName}`, {
        method: 'GET'
    })
    .then(response => {
        if (response.ok) return response.blob();
        throw new Error('Network response was not ok.');
    })
    .then(blob => {
        // Create a new URL for the blob object
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${folderName}.zip`; // Set the file name for the download
        document.body.appendChild(a);
        a.click();

        // Clean up by removing the element and revoking the URL
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
  }
}


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
