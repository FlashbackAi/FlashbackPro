import React, { useState, useEffect, useCallback} from 'react';
import axios from "axios";
import PhotoCollageComponent from './PhotoCollageComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import UserMenu from './UserMenu';
import { useHistory } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import API_UTIL from '../services/AuthIntereptor';

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
  const username = sessionStorage.getItem("username")
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImagesUrl,setSelectedImagesUrl] =  useState([]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = useCallback(() => {
    setIsPopupOpen(prev => !prev);
  }, []);



  const handleImageClick = (url,index) => {

    if (selectedImages.includes(index)) {
      setSelectedImages(selectedImages.filter(i => i !== index));
      setSelectedImagesUrl(selectedImagesUrl.filter(i => i!==url));
    } else {
      setSelectedImages([...selectedImages, index]);
      setSelectedImagesUrl([...selectedImagesUrl,url]);
    }
  }

  // const handleFileChange = useCallback((e) => {
  //   const files = Array.from(e.target.files);
  //   setSelectedFiles(files);
  // }, []);

  // const handleFolderNameChange = useCallback((e) => {
  //   setFolderName(e.target.value);
  // }, []);

  const handleUpload = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('folderName', folderName);
    formData.append('username',username);

    selectedFiles.forEach(file => {
        formData.append('images', file);
    });
    const headers = {
        'Content-Type': 'multipart/form-data',
      };

    console.log(folderName)
    try {
      const response = await API_UTIL.post(`${serverIP}/upload/${folderName}`, formData,{headers});
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
    console.log("images are being fetched from " +selectedFlashBack)
    try {
      const fetchedImages = async () => {
        const response = await fetch(`${serverIP}/images/${selectedFlashBack}`);
        if(response.status !== 200)
        {
          throw new Error("Error in Uploading Images")
        }
        
        const imageUrls = await response.json();
        setUploadedImages(imageUrls);
        //console.log(imageUrls[0].imageData);
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
    console.log(username);
    API_UTIL.get(`${serverIP}/folderByUsername/${username}`)
      .then(response => {
        console.log(response.data);
        setFlashBacks(response.data);
        console.log(flashBacks);
      })
  }, []);

  const deleteImages = async() =>  {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('FolderName', folderName);
      formData.append('Username',username);
      formData.append('selectedImages',selectedImagesUrl);
      // const headers = {
      //     'Content-Type': 'multipart/form-data',
      //   };
  
      try {
        console.log(formData);
        const response = await API_UTIL.post(`${serverIP}/deleteImages`, selectedImagesUrl);
        if(response.status !== 200 )
        {
          throw new Error(response.data)
        }
        selectedImagesUrl.forEach(image=>{
          setUploadedImages(uploadedImages.filter((url,data) => image !== url))
        });
        

        toast.success(response.data)
      } catch (error) {
        console.error(error);
        toast.success(error)
        setMessage('Error uploading files.');
      }finally {
        setIsLoading(false);
      }
    };
  const AddImages = async() => {
    

    setSelectedFiles(selectedImages);
    setFolderName(selectedFlashBack);
    handleUpload();
  };

  const deleteFlashBack = async() => {

    const formData = new FormData();
   

    try {
      const response = await API_UTIL.post(`${serverIP}/deleteFlashBack/${selectedFlashBack}`);
      if(response.status !== 200 )
      {
        throw new Error(response.data.message)
      }
      toast.success(message)
    } catch (error) {
      console.error(error);
      toast.success(error)
      setMessage('Error Deleted FalshBack folder.');
    }
  };

  const Popup = (({ isOpen, close, uploadHandler}) => {
    if (!isOpen) return null;

    console.log("pop is called")

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    };
  
    const handleFolderNameChange = (e) => {
      console.log(e.target.value);
      setFolderName(e.target.value);
    };
    return (
      <div className="popup-overlay" onClick={close}>
        
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h1>Upload Images to S3</h1>
          <button onClick={close}>Close</button>
          <div className="status-post-container">
            {/* <textarea id="statusInput" placeholder="Create a Flashback?" value={folderName} onChange={folderNameChange}></textarea> */}
            <input type="text"  id="statusInput"  autoFocus="autoFocus" value={folderName} placeholder="Enter the Flashback Name"  onChange={handleFolderNameChange} />
            <input type="file" name="images" multiple accept="image/*" onChange={handleFileChange} />
            <button onClick={uploadHandler}>Upload</button>
          </div>
          <p>{message}</p>
        </div>
      </div>
    );
  });


  function FlashbackCard({ flashback, onSelect }) {

    const navigate = useNavigate();

  const navigateToImages = () => {
    navigate(`/images/${flashback.folder_name}`);
  };

    return (
      <div className="flashback-card" onClick={navigateToImages}>
        <li>{flashback.folder_name}</li>
        {/* Add more details you want to show */}
      </div>
    );
  }
  
  

  return (
    
    <div>

      <h1>Upload Images to S3</h1>
       <div>
        <button onClick={togglePopup}>Create New FlashBack</button>
        <Popup 
          isOpen={isPopupOpen} 
          close={togglePopup} 
          // folderNameChange={handleFolderNameChange} 
          // fileChange={handleFileChange} 
          uploadHandler={handleUpload} 
          // folderName={folderName}
        />
      </div>


     {/* <div className="status-post-container">
             <textarea id="statusInput" placeholder="Create a Flashback?" onChange={handleFolderNameChange} ></textarea>
            <input type="text" id="statusInput" placeholder="Enter the Flashback Name" onChange={handleFolderNameChange} />
            <input type="file" multiple onChange={handleFileChange} /> 
            <input type="file" name="images" multiple accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button> 
      </div>  */}

      <UserMenu/>
      <div className="App">
      {images.length > 0 && <PhotoCollageComponent images={images} />}
      </div>
      <h1>Uploaded FlashBacks</h1>
      {/* <select value={selectedFlashBack} onChange={handleFlashBackName}> */}
      <div className="flashback-container">
        {flashBacks.map((flashBack, index) => (
          <FlashbackCard key={index} flashback={flashBack} onSelect={handleFlashBackName} />
        ))}
      </div>

      {/* </select> */}
      <button onClick={fetchImages}>Check Images</button>
      <button onClick={deleteFlashBack}>Delete FalshBack</button>
    
      <div className="imageGalleryContainer">
      <button onClick={deleteImages}>Delete Images</button>
      <button onClick={AddImages}>Add Images</button>
        {uploadedImages.map((image, index) => (
          // <img key={index} src={image} alt={`img-${index}`} />
        <img
          key={index}
          src={image.imageData}
          alt={`img-${index}`}
          onClick={() => handleImageClick(image.url, index)}
          className={selectedImages.includes(index) ? 'selected' : ''}
          style={{ 
            border: selectedImages.includes(index) ? '3px solid blue' : 'none' 
          }}
        />
        ))}
      </div>
         
      <p>{message}</p>
      <ToastContainer />
      </div>
  );
};

export default CreateFlashBack;

