import React, { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
// import ImageComponent from "./ImageComponent";
import { useGesture } from '@use-gesture/react';
import { animated, useSpring } from '@react-spring/web';



function App() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const [folders, setFolders] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const collageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const imgRef = React.useRef();

  

  const ImageComponent = ({ src, alt, onDrop, onDragOver }) => {
    const [style, api] = useSpring(() => ({
      x: 0, y: 0, scale: 1
    }));
  
    const bind = useGesture({
      onDrag: ({event, offset: [x, y] }) => 
      {
          event.preventDefault();
          event.stopPropagation();
          api.start({ x, y });
          
      },
  
      onPinch: ({event, offset: [d, a], origin: [ox, oy] }) =>
        { 
          event.preventDefault();
          event.stopPropagation();
          api.start({ scale: d, ox, oy });
      }
    });

    return (
      <animated.img
        {...bind()}
        src={src}
        alt={alt}
        style={{ ...style, touchAction: 'none' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="background"
      />
    );
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

      <div>
            <h1>
                Image Template
            </h1>
            <div ref={collageRef} >
                  <div className="collage" > 
                    <div className="background" onDrop={(e) => handleDrop(setImage1, e)} onDragOver={handleDragOver}>
                      <ImageComponent className="image"  src={image1} alt="Image 1" name="img1" />
                    </div>
                    <div className="background" onDrop={(e) => handleDrop(setImage2, e)} onDragOver={handleDragOver}>
                      <ImageComponent className="image" src={image2} alt="Image 2" name="img2" />
                    </div>
                    <div className="background" onDrop={(e) => handleDrop(setImage3, e)} onDragOver={handleDragOver}>
                      <ImageComponent className="image" src={image3} alt="Image 3" name="img3"/>
                    </div>
                    <div className="background" onDrop={(e) => handleDrop(setImage4, e)} onDragOver={handleDragOver}>
                      <ImageComponent className="image" src={image4} alt="Image 4" name="img4" />
                    </div>
                    <img className="foreground" src="/templates/background.png" alt="Foreground Image" /> 
                  </div>
            </div>
            <canvas ref={canvasRef} ></canvas>
            <button onClick={downloadCollage}>Download Collage</button>
           
        </div>
    </div>
  );
}

export default App;
