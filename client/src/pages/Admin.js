import React, { useEffect,useRef, useState ,useCallback} from 'react';
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
  const collageRef = useRef(null);
  const canvasRef = useRef(null);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const imgRef = useRef();
  const [templateImages, setTemplateImages] = useState(new Map());
  //const [templateImages, setTemplateImages] = useState([{}]);

  


  const ImageCropper = ({ src }) => {
    let [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });
    let[scale,setScale] = useState();
    let imageRef = useRef();
    useGesture(
      {
        onDrag: ({ offset: [dx, dy] }) => {
          setCrop((crop) => ({ ...crop, x: dx, y: dy }));
        },
        onPinch: ({ offset: [d] }) => {
         
          setScale(d /2);
        },
      },
      {
        target: imageRef,
        eventOptions: { passive: false },
      }
    );
  
    return (
      <>
          <div style={{border: '2px solid red'}} className='image'>
            <img
              src={src}
              ref={imageRef}
              style={{
                position: "relative",
                left: crop.x,
                top: crop.y,
                transform: `scale(${scale})`,
                touchAction: "none",
                height: "100%",
                width: "100%"
              }}
             
            />
          </div>
      </>
    );
  };



  const handleDrop = (imageSetter, name, e) => {
    e.preventDefault(); 
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const img = new Image()
      let imagedata=e.dataTransfer.getData("text/plain");
      img.src = imagedata;
      
      imagedata = imagedata.split(";base64,")[0];
      imagedata = imagedata.split(":")[1];
      console.log(imagedata);
      setTemplateImages(new Map([...templateImages, [name,imagedata ]]));
      imageSetter(URL.createObjectURL(e.dataTransfer.files[0]));

      
    }
    // if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    //   imageSetter(URL.createObjectURL(e.dataTransfer.files[0]));
    //   templateImages.map(   )

    // }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const downloadCollage = async() => {   




    const collageElement = document.querySelector('.collage');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rect = collageElement.getBoundingClientRect();
    //const scale = window.devicePixelRatio;
    const scale = window.devicePixelRatio;
    // canvas.width = rect.width * scale;
    // canvas.height = rect.height * scale;
    canvas.width = 3000;
    canvas.height = 3000;
    const imagesList = [...templateImages.values()];
    console.log(imagesList);
    let originalImages = null;
    
    try{
      const response = await axios.post(`${serverIP}/fetchOriginalImages`, imagesList);
      if(response.status != 200)
      {
        throw new Error(response.data.message)
      }
      else{
        originalImages=response.data;
        let imagesLoaded = 0;
        const totalImages = originalImages.length;

      
        

        const img1 = new Image();
        img1.src = originalImages[0].imageData;
        img1.onload = () => {
          console.log(img1)
            ctx.drawImage(img1, 0, 0,1500,1500);
            checkAllImagesLoaded();
        };

        const img2 = new Image();
        img2.src = originalImages[1].imageData;
        img2.onload = () => {
            ctx.drawImage(img2, 0,1500,1500,1500);
            checkAllImagesLoaded();
        };

        const img3 = new Image();
        img3.src = originalImages[2].imageData;
        img3.onload = () => {
            ctx.drawImage(img3, 1500,0,1500,1500);
            checkAllImagesLoaded();
        };

        const img4 = new Image();
        img4.src = originalImages[3].imageData;
        img4.onload = () => {
            ctx.drawImage(img4, 1500, 1500,1500,1500);
            checkAllImagesLoaded();
           
        };

        function checkAllImagesLoaded() {
          imagesLoaded++;
          if (imagesLoaded === totalImages) {
              // All images are loaded, draw the foreground and download the canvas
              ctx.drawImage(document.getElementsByClassName('foreground')[0], 0, 0, canvas.width, canvas.height);
              canvas.toBlob(blob => {
                  saveAs(blob, 'collage.png');
              });
          }
      }
    //     ctx.drawImage(document.getElementsByClassName('foreground')[0],0,0,canvas.width,canvas.height)
    // canvas.toBlob(blob => {
    //     saveAs(blob, 'collage.png');
    // });
  }
}
catch(error){
  console.log(error);
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
          <img key={imageUrl.url} src={imageUrl.imageData} alt={`img-${index}`} />
        ))}
      </div>

      <div>
            <h1>
                Image Template
            </h1>
            <div ref={collageRef} >
                  <div className="collage" >
                    
                 
                    <div className="background" onDrop={(e) => handleDrop(setImage1, "img1", e)} onDragOver={handleDragOver}>
                      <ImageCropper  src={image1} alt="Image 1" name="img1" />
                    </div>
                      
                    <div className="background" onDrop={(e) => handleDrop(setImage2, "img2", e)} onDragOver={handleDragOver}>
                      <ImageCropper src={image2} alt="Image 2" name="img2" />
                    </div>
                  
                    <div className="background" onDrop={(e) => handleDrop(setImage3, "img3", e)} onDragOver={handleDragOver}>
                      <ImageCropper className="image" src={image3} alt="Image 3" name="img3"/>
                    </div>
                    <div className="background" onDrop={(e) => handleDrop(setImage4, "img4", e)} onDragOver={handleDragOver}>
                      <ImageCropper className="image" src={image4} alt="Image 4" name="img4" />
                    </div>
                    <img className="foreground" src="/templates/background.png" alt="Foreground Image" /> 
                  </div>
            </div>

            {/* <div className="p-8">
              <ImageCropper src="http://i3.ytimg.com/vi/bNDCFBIiAe8/maxresdefault.jpg" />
            </div> */}
            <canvas ref={canvasRef} ></canvas>
            <button onClick={downloadCollage}>Download Collage</button>
           
        </div>
    </div>
  );
}

export default App;
