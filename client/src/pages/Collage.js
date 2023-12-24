import React, { useRef, useEffect } from 'react';
import { useNavigation} from 'react-router-dom'

const ImageCollage = () => {
    const collageRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    useEffect(() => {
        const collage = collageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size equal to collage size
        canvas.width = collage.offsetWidth;
        canvas.height = collage.offsetHeight;

        const images = collage.getElementsByTagName('img');
        Array.from(images).forEach((img, index) => {
            img.onload = function() {
                // Adjust positioning and sizing as needed
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                if (index === images.length - 1) {
                    // All images loaded and drawn
                    canvas.style.display = 'block';
                }
            };
            img.src = img.src; // Trigger load
        });
    }, []);

    const downloadImage = () => {
        const canvas = canvasRef.current;
        const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const link = document.createElement('a');
        link.download = 'collage.png';
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>HAHAHA
            <div ref={collageRef} style={{ display: 'none' }}>
                <div className="collage">
                    <img className="background" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKtCv9zAPpkrT7XZ0FN9oF_Lg7-ja3TOk7ZMhHBST4HFO5H9lD9pYsf9eiRTvgfYQhpJI&usqp=CAU"></img>
                    <img className="background" src="https://pbs.twimg.com/media/CCf1QhoUMAApMXw.jpg" alt="Background Image 2"></img>
                    <img className="background" src="https://assets.mubicdn.net/images/film/71642/image-w856.jpg?1506353917" alt="Background Image 3"></img>
                    <img className="background" src="https://pbs.twimg.com/media/FO7KO-gaUAAhkvL?format=jpg&name=large" alt="Background Image 4"></img>
                    <img className="foreground" src="https://stg.stevieawards.com/sites/default/files/24%20Bride%20Stills.png" alt="Foreground Image"></img>
                </div>
                {/* Add more images as needed */}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <button onClick={downloadImage}>Download Collage</button>
        </div>
    );
};

export default ImageCollage;
