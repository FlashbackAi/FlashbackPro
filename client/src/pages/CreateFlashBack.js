import React, { useState, useEffect} from 'react';
import axios from "axios";
import PhotoCollageComponent from './PhotoCollageComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import UserMenu from './UserMenu';
import { saveAs } from 'file-saver';

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

  const collageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const handleImageChange = (event, setImage) => {
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };
  const handleDrop = (imageSetter, e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      imageSetter(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const downloadCollage = () => {
    const collageElement = document.querySelector('.collage');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rect = collageElement.getBoundingClientRect();
    const scale = window.devicePixelRatio;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    
    ctx.drawImage(document.getElementsByName('img1')[0], canvas.width * (0 / 100), canvas.height * (0 / 100),250,180)
    ctx.drawImage(document.getElementsByName('img2')[0],canvas.width * (0 / 100), canvas.height * (50 / 100),250,180)
    ctx.drawImage(document.getElementsByName('img3')[0],canvas.width * (50 / 100), canvas.height * (0 / 100),250,180)
    ctx.drawImage(document.getElementsByName('img4')[0],canvas.width * (50 / 100), canvas.height * (50 / 100),250,180)
    ctx.drawImage(document.getElementsByClassName('foreground')[0],0,0,canvas.width,canvas.height)
    canvas.toBlob(blob => {
        saveAs(blob, 'collage.png');
    });
  };
  

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
    formData.append('username',username);

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
      <h1>Uploaded FlashBacks</h1>
      <select value={selectedFlashBack} onChange={handleFlashBackName}>
        <option value="">Select an Album</option>
        {flashBacks.map((flashBack, index) => (
          <option value={flashBack.folder_name}>{flashBack.folder_name}</option>
        ))}
      </select>
      <button onClick={fetchImages}>Check Images</button>
      <div className="imageGalleryContainer">
        {uploadedImages.map((image, index) => (
          <img key={index} src={image} alt={`img-${index}`} />
          //<ProgressiveImage key={index} highResImage={image.highRes} lowResImage={image.lowRes} />
        ))}
      </div>
      <div>
            <h1>
                Image Template
            </h1>
            <div ref={collageRef} >
                  <div className="collage" >
                    <img  src={image1} alt="Image 1" name="img1" className="background" onDrop={(e) => handleDrop(setImage1, e)} onDragOver={handleDragOver}style={{border: '2px solid red'}}/>
                    <img  src={image2} alt="Image 2" name="img2" className="background" onDrop={(e) => handleDrop(setImage2, e)} onDragOver={handleDragOver}style={{border: '2px solid red'}}/>
                    <img  src={image3} alt="Image 3" name="img3"className="background" onDrop={(e) => handleDrop(setImage3, e)} onDragOver={handleDragOver}style={{border: '2px solid red'}}/>
                    <img  src={image4} alt="Image 4" name="img4" className="background" onDrop={(e) => handleDrop(setImage4, e)} onDragOver={handleDragOver}style={{border: '2px solid red'}}/>
                    {/* <img className="foreground" src="/images/background.png" alt="Foreground Image" />  */}
                  </div>
            </div>

           

            <canvas ref={canvasRef} ></canvas>
            <button onClick={downloadCollage}>Download Collage</button>
        </div>      
      <p>{message}</p>
      <ToastContainer />
      </div>
      )}
    </div>
  );
};

export default CreateFlashBack;

