import React, {useState} from 'react';
import { saveAs } from 'file-saver';
import "../ImageUpload.css"

const ImageCollageNew = () => {
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

      

    return (
        <div>
            <br/>
            <br/>
            <br/>
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
    );
};

export default ImageCollageNew;
