import React, { useEffect,useRef, useState ,useCallback} from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
// import ImageComponent from "./ImageComponent";
import { useGesture } from '@use-gesture/react';
import { animated, useSpring } from '@react-spring/web';
import './Admin.css';
import API_UTIL from '../../services/AuthIntereptor';
import { toast } from 'react-toastify';


function App() {
  const [folders, setFolders] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const collageRef = useRef(null);
  const canvasRef = useRef(null);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const imgRef = useRef();
  const [templateImages, setTemplateImages] = useState(new Map());
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [progress, setProgress] = useState(0); 
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  


  
  const togglePopup = useCallback(() => {
    setIsPopupOpen(prev => !prev);
  }, []);

  const handleProgress = useCallback((progressValue) => {
    const progress = Math.min(Math.max(progressValue, 0), 100);
    setProgress(progress); // Update progress state
    setIsProgressVisible(true);
  }, [progress]);
  

  const hideProgress = () => {
    setIsProgressVisible(false);
  };

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

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleSubmit = () => {
    // Check if eventName is selected
    if (!eventName) {
      console.error("Please select an event name");
      alert('Please select an event name')
      return;
    }  

    setIsProgressVisible(true);
    // Make API call to trigger-flashback with the selected event data
    API_UTIL.post(`/trigger-flashback`, { eventName })
      .then(response => {

        const responseData = response.data;
        const jsonStrings = responseData.split('\n').filter(obj => obj.trim() !== '');
        console.log('Response data:', jsonStrings);

        jsonStrings.forEach(jsonString => {
        try {
          const parsedData = JSON.parse(jsonString);
          const progress = parsedData.progress;
    
          console.log('Progress received:', progress);
          
  
          setProgress(prevProgress => {
            // Ensure that progress is always incremented
            const newProgress = Math.max(progress, prevProgress);
            return newProgress;
        });


          if (progress < 100) {
              // Flashbacks are in progress
              setProgressMessage(`Flashbacks are in progress... ${progress}%`);
              setSuccessMessage('');
          } else {
              // Flashbacks triggered successfully
              setProgressMessage('');
              setSuccessMessage(`Flashback triggered successfully ${progress}%`);
              setIsProgressVisible(false);
              setEventName('');
              alert('Flashback triggered successfully');
          }
    
      } catch (error) {
        // If parsing as JSON fails, handle the error
        console.error("Error parsing response:", error);
        // Display an error message
        setMessage(`Error parsing response: ${error.message}`);
        toast.error('Error parsing response');
      }
    });
  })
    .catch(error => {
      // Handle error response from the backend
      console.error("Error triggering flashback:", error);
      // Display error message
      setMessage(`Error triggering flashback: ${error.message}`);
      toast.error('Error triggering flashback')
    });
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
    
    // try{
      const response = await API_UTIL.post(`/fetchOriginalImages`, imagesList);
      if(response.status !== 200)
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
// catch(error){
  // console.log(error);
// }
  // };

  useEffect(() => {
    API_UTIL.get(`/folders`)
      .then(response => {
        setFolders(response.data);
      })
  }, []);

  useEffect(() => {
    API_UTIL.get(`/fetch-events`)
      .then(response => {
        // Transform the data before setting the events state
        const transformedEvents = response.data.map((event, index) => ({
          id: index + 1, // You can use index or any other unique identifier as the id
          name: event.S
        }));
        setEvents(transformedEvents);
      })
  }, []);

  const fetchImages = (event) =>{
    const folderName = event.target.value
    console.log("images are being fetched from " +folderName)
    setSelectedValue(event.target.value)
    if(folderName){
        try {
        const fetchedImages = async () => {
            const response = await API_UTIL.get(`/images/${folderName}`);
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
    API_UTIL.get(`/downloadFolder/${folderName}`)
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
        <div className='Buttoncontainer'>
        <div className='LaunchButton' onClick={togglePopup}>
        <div className="labels">
       
      <p className="redText">Trigger Flashback</p>
      <div className="redTextActive">
        </div>
        </div>
        <div className="red">
        </div>
        </div>
        </div>
      {/* Popup */}
      {isPopupOpen && (
        <div className ='pop'>
        <div className="eventpop">
          <div className="popup-content">
            <h2>Event Details</h2>
            <label htmlFor="event_name">Event Name:</label>
            <select id="event_name" value={eventName} onChange={handleEventNameChange} style={{ color: '#000' }}>
              <option value="">Select Event Name</option>
              {events.map(event => (
                  <option key={event.id} value={event.name}>{event.name}</option>
                ))}
            </select>
            <div className='submitbutton'>
            <button onClick={handleSubmit}>Create Flashback</button>
            </div>
            <div className='Closebutton'>
            <button onClick={handleClosePopup}>Close</button>
            </div>
          </div>
        </div>
        </div>
      )}

      {isProgressVisible && (
            <div className={`overlay ${isProgressVisible ? 'active' : ''}`}>
              <div className="progress-container">
                <div className="progress-message">
                {`Flashbacks are in progress`}
                </div>
              </div>
            </div>
          )}

    </div>
  );
}

export default App;
  