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

    try {
      const response = await axios.post("http://localhost:5000/upload", formData);

      alert("Image uploaded successfully! at "+response.data.imageUrl );

      // // Display the uploaded image
      // var imageUrl = "../"+response.data.imageUrl;
      // //imageUrl=imageUrl.substring(2);
      // const imgElement = document.createElement("img");
      // imgElement.src = imageUrl;
      // console.log(imgElement);
      // document.body.appendChild(imgElement);
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
