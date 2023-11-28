import React from "react";
import loadingImage from "../Media/logo.png"; 
import "../LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
      <img src={loadingImage} alt="Loading" />
     </div>
    </div>
  );
};

export default LoadingSpinner;
