import React, { useEffect, useState } from 'react';
import { fabric } from 'fabric';
import html2canvas from 'html2canvas';

const ImageCollage = ({ images, templateUrl }) => {
  const [canvas, setCanvas] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const initializeCanvas = async () => {
      const template = await loadImage(templateUrl);
      const newCanvas = new fabric.Canvas('collageCanvas', {
        width: template.width,
        height: template.height,
      });

      newCanvas.setBackgroundImage(templateUrl, newCanvas.renderAll.bind(newCanvas));

      images.forEach((imageUrl, index) => {
        loadImage(imageUrl).then((img) => {
          const fabricImage = new fabric.Image(img, {
            left: 0,
            top: 0,
            scaleX: 1,
            scaleY: 1,
          });

          newCanvas.add(fabricImage);
        });
      });

      setCanvas(newCanvas);
    };

    initializeCanvas();
  }, [images, templateUrl]);

  useEffect(() => {
    if (canvas) {
      canvas.setZoom(zoomLevel);
      canvas.renderAll();
    }
  }, [zoomLevel, canvas]);

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(url, (img) => {
        resolve(img.getElement());
      });
    });
  };

  const handleZoomChange = (event) => {
    event.evt.preventDefault();
    const scaleBy = 1.05;
    const newZoom = event.evt.deltaY > 0 ? zoomLevel * scaleBy : zoomLevel / scaleBy;
    setZoomLevel(Math.max(0.1, newZoom));
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const handleDownloadCollage = () => {
    html2canvas(document.getElementById('collageCanvas')).then((canvas) => {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'collage.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div>
      <canvas id="collageCanvas" onWheel={handleZoomChange}></canvas>
      <button onClick={handleDownloadCollage}>Download Collage</button>
    </div>
  );
};

export default ImageCollage;
