import React, { useState, useEffect} from 'react';
import axios from "axios";
import PhotoCollageComponent from './PhotoCollageComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import UserMenu from './UserMenu';

function CreateFlashBack() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlashBack, setSelectedFlashBack] = useState('');
  const [flashBacks, setFlashBacks] = useState([]);
  

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleUpload = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('folderName', folderName);
    formData.append('username',sessionStorage.getItem("username"));

    selectedFiles.forEach(file => {
        formData.append('images', file);
    });
    const headers = {
        'Content-Type': 'multipart/form-data',
      };

    try {
      const response = await axios.post(`${serverIP}/upload/${folderName}`, formData,{headers});
      if(response.status !== 200 )
      {
        throw new Error(response.data.message)
      }
      toast.success(message)
    } catch (error) {
      console.error(error);
      toast.success(error)
      setMessage('Error uploading files.');
    }finally {
      setIsLoading(false);
    }
  };

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
        setUploadedImages(imageUrls);
        console.log(imageUrls);
        toast.success("Images Fetched Successfully")
      };
      fetchedImages();
    }
    catch(error) {
        toast.error(error)
        console.error('Error fetching images:', error);
      };
  };

  const handleFlashBackName = (event) => {
    setSelectedFlashBack(event.target.value);
    console.log(event.target.value);
  };

  useEffect(() => {
    axios.get(`${serverIP}/folderByUsername:${selectedFlashBack}`)
      .then(response => {
        setFlashBacks(response.data);
      })
      .catch(error => {
        console.error("Error fetching flashBacks: ", error);
      });
  }, []);

  const ProgressiveImage = ({ highResImage, lowResImage }) => {
    const [loaded, setLoaded] = useState(false);  
    return (
      <>
        <img
          src={lowResImage}
          alt="Low resolution preview"
          style={{ display: loaded ? 'none' : 'block' }}
        />
        <img
          src={highResImage}
          alt="High resolution"
          onLoad={() => setLoaded(true)}
          style={{ display: loaded ? 'block' : 'none' }}
        />
      </>
    );
  };
  

  return (
    <div>
       {isLoading ? (
       <div> 
      <h2>uploading Images</h2>
      <div className='loader' name='loader'></div>
      </div>) :
      (
      <div>
      <h1>Upload Images to S3</h1>

      <UserMenu/>

        <div className="status-post-container">
          {/*<textarea id="statusInput" placeholder="Create a Flashback?" ></textarea>*/}
      <input type="text" id="statusInput" placeholder="Enter the Flashback Name" onChange={handleFolderNameChange} />
      {/* <input type="file" multiple onChange={handleFileChange} /> */}
          <input type="file" name="images" multiple accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
        </div>


      <div className="App">
      {images.length > 0 && <PhotoCollageComponent images={images} />}
      </div>
      <h1>Album Folders</h1>
      <select value={selectedFlashBack} onChange={handleFlashBackName}>
        <option value="">Select an Album</option>
        {flashBacks.map((flashBack, index) => (
          <option value={flashBack}>{flashBack}</option>
        ))}
      </select>
      <button onClick={fetchImages}>Check Images</button>
      <div className="imageGalleryContainer">
        {uploadedImages.map((image, index) => (
          <img key={index} src={image} alt={`img-${index}`} />
          //<ProgressiveImage key={index} highResImage={image.highRes} lowResImage={image.lowRes} />
        ))}
      </div>

      <p>{message}</p>
      <ToastContainer />
      </div>
      )}
    </div>
  );
};

export default CreateFlashBack;

