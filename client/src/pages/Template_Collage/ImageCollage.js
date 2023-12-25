import React, { useRef, useEffect, useState} from 'react';
import { useNavigation} from 'react-router-dom';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
//import "./ImageUpload.css"

const ImageCollage = () => {
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

    // useEffect(() => {
    //     const collage = collageRef.current;
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');

    //     // Set canvas size equal to collage size
    //     canvas.width = collage.offsetWidth;
    //     canvas.height = collage.offsetHeight;

    //     const images = collage.getElementsByTagName('img');
    //     Array.from(images).forEach((img, index) => {
    //         img.onload = function() {
    //             // Adjust positioning and sizing as needed
    //             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    //             if (index === images.length - 1) {
    //                 // All images loaded and drawn
    //                 canvas.style.display = 'block';
    //             }
    //         };
    //         img.src = img.src; // Trigger load
    //     });
    // }, []);

    // const downloadImage = () => {
    //     const canvas = canvasRef.current;
    //     const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    //     const link = document.createElement('a');
    //     link.download = 'collage.png';
    //     link.href = image;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // };
    const downloadCollage = () => {
        const collageElement = document.querySelector('.collage');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set the canvas size to match the collage element, accounting for device pixel ratio
        const rect = collageElement.getBoundingClientRect();
        const scale = window.devicePixelRatio;
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;
        
        // You need to draw each image onto the canvas here...
        // For example:
        // ctx.drawImage(imageElement, x, y, width, height);

        // Once all images are drawn, you can export the canvas
        
        ctx.drawImage(document.getElementsByName('img1')[0], canvas.width * (0 / 100), canvas.height * (0 / 100),250,180)
        ctx.drawImage(document.getElementsByName('img2')[0],canvas.width * (0 / 100), canvas.height * (50 / 100),250,180)
        ctx.drawImage(document.getElementsByName('img3')[0],canvas.width * (50 / 100), canvas.height * (0 / 100),250,180)
        ctx.drawImage(document.getElementsByName('img4')[0],canvas.width * (50 / 100), canvas.height * (50 / 100),250,180)
        ctx.drawImage(document.getElementsByClassName('foreground')[0],0,0,canvas.width,canvas.height)
        canvas.toBlob(blob => {
            saveAs(blob, 'collage.png');
        });
      };

      const downloadCollage1 = () => {
        // Assuming 'collage' is the class of your collage container
        const collageElement = document.querySelector('.collage');
      
        html2canvas(collageElement).then((canvas) => {
          // Convert the canvas to a Blob
          canvas.toBlob((blob) => {
            // Use FileSaver to download the Blob as an image
            console.log(blob)
            saveAs(blob, 'collage.png');
          });
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
                <div className="collage">
               
                    <img className="background" name="img1" src="/images//img1.jpg" alt="Background Image 1"></img>
                    <img className="background" name="img2" src="/images//img2.jpg" alt="Background Image 2"></img>
                    <img className="background" name="img3" src="/images//img3.jpg" alt="Background Image 3"></img>
                    <img className="background" name="img4" src="/images//img4.jpg" alt="Background Image 4"></img>
                    <img className="foreground" src="/images/background.png" alt="Foreground Image"></img>
                     {/* <div  className="background">
                        <input type="file" onChange={(e) => handleImageChange(e, setImage1)} accept="image/*" />
                        {image1 && <img src={image1} alt="Slot 1" className="background" />}
                        </div>
                        <div className="background">
                        <input type="file" onChange={(e) => handleImageChange(e, setImage2)} accept="image/*" />
                        {image2 && <img src={image2} alt="Slot 2" className="background" />}
                        </div>
                        <div className="background">
                        <input type="file" onChange={(e) => handleImageChange(e, setImage3)} accept="image/*" />
                        {image3 && <img src={image3} alt="Slot 3" className="background" />}
                        </div>
                        <div className="background">
                        <input type="file" onChange={(e) => handleImageChange(e, setImage4)} accept="image/*" />
                        {image4 && <img src={image4} alt="Slot 4" className="background" />}
                    </div> */}
                    
                    
                </div>
                {/* Add more images as needed */}
            </div>

           

            <canvas ref={canvasRef} ></canvas>
            <button onClick={downloadCollage}>Download Collage</button>
        </div>
    );
};

export default ImageCollage;
