import React from 'react';
//import './TermsAndConditions.css';

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <h2>Terms and Conditions</h2>
      <div className="terms-content">
        <h3>
          Welcome to FlashBack!
        </h3>
        <p>
          Please read these terms and conditions carefully before using our services.
        </p>
        <div className="section">
          <h3>1. Consent</h3>
          <ul>
            <li>By using [Your Application Name], you consent to the following terms and conditions. If you do not agree, please do not proceed.</li>
          </ul>
        </div>
        <div className="section">
          <h3>2. User Registration</h3>
          <ul>
            <li>To use our services, you may need to provide your country code, phone number, and a portrait image. By registering, you agree to provide accurate information.</li>
          </ul>
        </div>
        <div className="section">
          <h3>3. Data Usage</h3>
          <ul>
            <li>Your phone number and portrait image will be used for facial recognition and image sharing purposes only. We prioritize your privacy and will not share your data with third parties.</li>
          </ul>
        </div>
        <div className="section">
          <h3>4. Facial Recognition</h3>
          <ul>
            <li>We use facial recognition technology to match your portrait image with others in our database for image sharing. By providing your portrait image, you consent to this process.</li>
          </ul>
        </div>
        <div className="section">
          <h3>6. Termination</h3>
          <ul>
            <li>We reserve the right to terminate or suspend your access to our services at any time without prior notice if you breach these terms and conditions.</li>
          </ul>
        </div>
        <div className="section">
          <h3>8. Contact Us</h3>
          <ul>
            <li>If you have any questions or concerns about these terms and conditions, please contact us at <b>9090401234</b>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
