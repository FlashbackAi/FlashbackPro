// client/src/App.js
import React, { useState } from "react";
import axios from "axios";
//const cors = require('cors');

function App() {
  const [image, setImage] = useState(null);

  const handleFileChange = (e) => {
    console.log(e);
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);
    console.log("upload method called");

    try {
      const response = await axios.post("http://localhost:5000/upload", formData);
      alert("Image uploaded successfully!");

      // Display the uploaded image
      const imageUrl = response.data.imageUrl;
      const imgElement = document.createElement("img");
      imgElement.src = imageUrl;
      document.body.appendChild(imgElement);
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };

  return (
    <div>
      <h1>Image Upload App</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}


export default App;
