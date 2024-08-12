import React, { useState, useRef, useEffect } from 'react';
import './vision.css';
import API_UTIL from '../../services/AuthIntereptor';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AppBar from '../../components/AppBar/AppBar';

const Vision = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rekognitionResults, setRekognitionResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  };

  const handleFileSelection = (selectedFile) => {
    setFile(selectedFile);
    setRekognitionResults(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an image first!');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await API_UTIL.post('/vision', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRekognitionResults(response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'An error occurred during image analysis.';
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        errorMessage += ` Server responded with: ${error.response.data.error || ''} ${error.response.data.details || ''}`;
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage += ' No response received from server.';
      } else {
        console.error('Error setting up request:', error.message);
        errorMessage += ` ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = imagePreview;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height);

      if (rekognitionResults) {
        // Draw face bounding boxes
        rekognitionResults.indexFaces.FaceRecords.forEach(face => {
          const box = face.Face.BoundingBox;
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 14;
          ctx.strokeRect(
            box.Left * canvas.width,
            box.Top * canvas.height,
            box.Width * canvas.width,
            box.Height * canvas.height
          );
        });

        // Draw label bounding boxes
        rekognitionResults.detectLabels.Labels.forEach(label => {
          if (label.Instances) {
            label.Instances.forEach(instance => {
              const box = instance.BoundingBox;
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 14;
              ctx.strokeRect(
                box.Left * canvas.width,
                box.Top * canvas.height,
                box.Width * canvas.width,
                box.Height * canvas.height
              );
              ctx.fillStyle = 'blue';
              ctx.font = '14px Arial';
              ctx.fillText(label.Name, box.Left * canvas.width, (box.Top * canvas.height) - 5);
            });
          }
        });
      }
    };
  };

  useEffect(() => {
    if (imagePreview && rekognitionResults) {
      drawBoundingBoxes();
    }
  }, [imagePreview, rekognitionResults]);

  const resetAnalysis = () => {
    setFile(null);
    setImagePreview(null);
    setRekognitionResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    
    <div className="visioncontainer">
      <AppBar/>
      <h1 className="title">Flashback Vision</h1>
      {!imagePreview ? (
        <div 
          className="upload-area" 
          onDrop={handleFileDrop} 
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
        >
          <svg className="upload-icon" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
          </svg>
          <p>
            <span className="file-label">Upload a file</span>
            <span> or drag and drop</span>
          </p>
          <p className="file-hint">PNG, JPG, GIF up to 10MB</p>
          <input
            id="file-upload"
            type="file"
            onChange={(e) => handleFileSelection(e.target.files[0])}
            ref={fileInputRef}
            className="hidden-input"
          />
        </div>
      ) : (
        <div className="analysis-container">
          <div className="image-container">
            {rekognitionResults ? (
              <canvas ref={canvasRef} className="result-canvas" />
            ) : (
              <img src={imagePreview} alt="Preview" className="preview-image" />
            )}
          </div>
          <p className="tagline">Compare Image Insights</p>
          {!rekognitionResults && !isLoading && (
            <div className="button-container">
              <button onClick={handleSubmit} className="analyze-button">
                Analyze Image
              </button>
            </div>
          )}
          {isLoading && <div className="loading-indicator">Analyzing...</div>}
          {rekognitionResults && (
            <div className="results-wrapper">
              <div className="results-grid">
                <div className="rekognition-results">
                  <div className="results-header">
                    <h2>Rekognition Results</h2>
                    <button 
                      className="copy-button" 
                      onClick={() => copyToClipboard(JSON.stringify(rekognitionResults, null, 2))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                      {isCopied && <span className="copied-text">Copied!</span>}
                    </button>
                  </div>
                  <div className="json-output">
                    <pre>{JSON.stringify(rekognitionResults, null, 2)}</pre>
                  </div>
                </div>
                <div className="flashback-vision">
                  <h2>Flashback Machine Vision</h2>
                  <p>Coming soon...</p>
                </div>
              </div>
              <button onClick={resetAnalysis} className="analyze-button new-image-button">
                Analyze New Image
              </button>
            </div>
          )}
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default Vision;