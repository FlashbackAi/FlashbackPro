import React, {useRef, useState, useContext,useCallback,useEffect} from "react";
import axios from "axios";
import { useNavigate, useNavigationType } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { useLocation } from 'react-router-dom';
import Webcam from 'react-webcam'


function Login() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { setAuthState } = useContext(AuthContext);

  const [isNewUser, setIsNewUser] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState("+91");
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');

  const [faceDetected, setFaceDetected] = useState(false);
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  
  const videoConstraints = {
    width: 350,
    height: 250,
    facingMode: "user"
  };

  let location = useLocation();
  const navigate = useNavigate();

  let { from } = location.state || { from: { pathname: "/home" } }

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    // Regular expression for a 10-digit phone number
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(value)) {
      console.log("invalid phone number")
      setPhoneNumberError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneNumberError('');
    }
  };
  const capture = useCallback(async () => {
  const imageSrc = webcamRef.current.getScreenshot();
   //const flag = await detectFaces();
   const flag = true;
   console.log("capture clicked  - "+flag)
  
  if(flag){
  setImgSrc(imageSrc);
  setMessage("Please proceed Ahead")
  }
  else{
  setMessage("No faces has been detected please re-capture your picture")
  }
  }, [webcamRef]);

  const retake = () => {
  setImgSrc(null);
  };     
  

  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const fullPhoneNumber = countryCode + phoneNumber; // Combine country code and phone number
      console.log(fullPhoneNumber); // Log the full phone number
       
        try {
          const response = await axios.post(`${serverIP}/createUser`, { username: fullPhoneNumber});
          setIsPhoneNumberValid(true);
          console.log(response.status)
          if(response.status===201)
          {
            setIsNewUser(true);
            alert('User created successfully please take a selfie');
            console.log("user has been created succesfully");
          }
          else if(response.status===200)
          {
            setIsNewUser(true);
            navigate('/home')
            alert(`hey ${fullPhoneNumber}, you already exists. Have a great event ahead..`);
          }
        } catch (error) {
          console.log(error)
          setError(error.message);
        }
    };

    const uploadPhoto = async (e)=>{

      console.log(termsAccepted)
      if(termsAccepted){
        
        e.preventDefault();
        const fullPhoneNumber = countryCode + phoneNumber;
        const formData = new FormData();
        formData.append('image', imgSrc);
        formData.append('username', fullPhoneNumber );
    
        try {
          const response = await axios.post(`${serverIP}/uploadUserPotrait`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log(response.data);
          navigate('/home')
        } catch (error) {
          console.error('Error uploading image:', error);
        }
    }

    }

    const handleVerification = () => {
        console.log(username)
        console.log(verificationCode)
        console.log(from.pathname)
        navigate(from.pathname)
        setIsNewUser(true);
    };

    const resendVerification = () => {
    };


    return (
      <div className="loginBody">
        <div className="loginLeft">
          <p className="loginLogo">Flashback<p className="logoCaption">Create & share memories</p></p>
          <div className="login-form-container">
            {!isPhoneNumberValid && (
              <form onSubmit={handleSubmit} className="login-form">
                <input name="phoneNumber" required type="tel" placeholder="Phone Number" onChange={handlePhoneNumberChange}/>
                {phoneNumberError && <p style={{ color: 'red' }}>{phoneNumberError}</p>}
                <button type="submit" disabled={phoneNumber.length !== 10}>Login</button>   
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </form>
            ) }
            {
              isNewUser &&(
              <div  className="login-form-container">
              {imgSrc ? (
                <img src={imgSrc} alt="webcam" />
              ) : (
                <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        style={{ zIndex: 0 }}
                        videoConstraints={videoConstraints}
                        mirrored={true}
                        // forceScreenshotSourceSize={true}
                      />
                      
              )}
              <div className="btn-container">
                {imgSrc ? (
                  <div className="login-form-container">
                    <form className="login-form" onSubmit={uploadPhoto}>
                      <button type="submit" >Submit photo</button>
                      <button type="button" onClick={retake}>Retake photo</button> 
                      <label style={{ display: 'flex',}}>
                        <input name="checkbox" type="checkbox" required style={{transform: 'scale(2.0)'}}
                         onChange={(e) => setTermsAccepted(e.target.checked)}
                         onInvalid={(e) => e.target.setCustomValidity('Please accept the terms and conditions.')}
                         onInput={(e) => e.target.setCustomValidity('')}/>
                        <a href="/TermsAndConditions" target="_blank" rel="noopener noreferrer" style={{color: "red"}}>Accept terms and conditions</a>
                      </label>
                    
                    </form>
                    
                 </div>
                
                ) : (
                  <div className="login-form-container">
                    <form  className="login-form">
                      <button type="button" onClick={capture}>Capture photo</button>
                    </form>
                  </div>
                )}
              </div>
            </div>)
            }
          </div>
        </div>
      </div>
    );

    
  }

export default Login;