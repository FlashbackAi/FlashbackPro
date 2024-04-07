import React, {useRef, useState, useContext,useCallback,useEffect} from "react";
import axios from "axios";
import { useNavigate, useNavigationType } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { useLocation } from 'react-router-dom';
import Webcam from 'react-webcam'
import * as faceapi from 'face-api.js';

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
  
  // useEffect(() => {
  //   const loadModelsAndStartCapture = async () => {
  //     await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  //     await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  //     await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  //   };

  //   loadModelsAndStartCapture();
  // }, []);

  // const detectFaces = useCallback(async () => {
  //   const detections = await faceapi.detectAllFaces(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
  //   console.log(detections)
  //   if (detections && detections.length === 1) {
  //     //console.log(detections)
  //     const imageSrc = webcamRef.current.getScreenshot();
      
  //     return true;
  //   } else {
  //     setFaceDetected(false);
  //     setImgSrc(null);
  //     return false;
  //   }
  // },[webcamRef]);

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
       
        // axios.post(`${serverIP}/request-otp`, {
            
        //     phoneNumber: fullPhoneNumber
        // }).then(response => {
        //     //setMessage(response.data.message)
        //     console.log(response.data)
        //     if(response.data.message === "OTP sent successfully.")
        //     {
        //         setIsPhoneNumberValid(true);
        //         setUsername(fullPhoneNumber);
        //         console.log(isPhoneNumberValid);
        //         setMessage("please enter the verification code sent to the registered mail id")
                
        //     }
        // })
        // .catch(error => {
        //     console.error(error.response.data);
        //     setMessage(error.response.data)
        // });
        // setIsPhoneNumberValid(true);
        // setUsername(fullPhoneNumber);
        //setIsNewUser(true);
        
        //setMessage("please enter the verification code sent to the registered mail id")
    };

    const uploadPhoto = async (e)=>{

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

    const handleVerification = () => {
        console.log(username)
        console.log(verificationCode)
        // axios.post(`${serverIP}/verify-otp`, {
        //     phoneNumber: fullPhoneNumber,
        //     otpCode: verificationCode
        // }).then(response => {
        //     setMessage(response.data.message)
        //     console.log(response.data.status)
        //     if(response.data.message === "User confirmed successfully.")
        //     {
        //         setMessage('new user has confirmed');
        //         console.log(from.pathname)
        //         navigate(from.pathname)
        //     }
        // })
        // .catch(error => {
        //     console.error(error.message);
        //     setMessage('error in confirming new user');
        // });
        
        console.log(from.pathname)
        navigate(from.pathname)
        setIsNewUser(true);
    };

    const resendVerification = () => {
        
        // axios.post(`${serverIP}/resend-verification`, {
        //     username: username
        // }).then(response => {
        //     console.log(response.data.status)
        //     if(response.data.status === "Success")
        //     {
        //         setMessage('new verification code has been sent');
                
        //     }
        // })
        // .catch(error => {
        //     console.error(error.message);
        //     setMessage('Error in generating new verification code');
        // });
    };

  


    // return (
    //   <div className="loginBody">
    //     <div className="loginLeft">
    //       <p className="loginLogo">Flashback<p className="logoCaption">Create & share memories</p></p>
    //       <div className="login-form-container">
    //         {!isPhoneNumberValid ? (
    //           <form onSubmit={handleSubmit} className="login-form">
    //             <input name="phoneNumber" required type="tel" placeholder="Phone Number" onChange={handlePhoneNumberChange}/>
    //             <button type="submit">Send OTP</button>
    //             <p>{message}</p>
    //           </form>
    //         ) : (
              
    //           <form className="login-form" onSubmit={handleVerification}>
    //             <p>OTP has been sent to the {phoneNumber}</p>
    //             <input 
    //               name ="verificationCode"
    //               required 
    //               type="text"
    //               value={verificationCode}
    //               placeholder="Verification Code"
    //               onChange={(e) => setVerificationCode(e.target.value)}
    //             />
    //             <button type="submit" >Verify the Code</button>
    //             <button type="button" onClick={resendVerification}>Resend Code</button>
    //             <p>{message}</p>
    //           </form>
    //         )}
    //         {
    //           isNewUser &&(<div className="container">
    //           <div className="verifyMobile">
    //             <input text></input>
    //           </div>
    //           {imgSrc ? (
    //             <img src={imgSrc} alt="webcam" />
    //           ) : (
    //             <Webcam
    //                     audio={false}
    //                     ref={webcamRef}
    //                     screenshotFormat="image/jpeg"
    //                     style={{ zIndex: 0 }}
    //                   />
    //           )}
    //           <div className="btn-container">
    //             {imgSrc ? (
    //               <button onClick={retake}>Retake photo</button>
    //             ) : (
    //               <button onClick={capture}>Capture photo</button>
    //             )}
    //           </div>
    //           <p>{message}</p>
    //         </div>)
    //         }
    //       </div>
    //     </div>
    //   </div>
    // );

    return (
      <div className="loginBody">
        <div className="loginLeft">
          <p className="loginLogo">Flashback<p className="logoCaption">Create & share memories</p></p>
          <div className="login-form-container">
            {!isPhoneNumberValid && (
              <form onSubmit={handleSubmit} className="login-form">
                <input name="phoneNumber" required type="tel" placeholder="Phone Number" onChange={handlePhoneNumberChange}/>
                {phoneNumberError && <p style={{ color: 'red' }}>{phoneNumberError}</p>}
                <button type="submit">Login</button>
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
                      />
              )}
              <div className="btn-container">
                {imgSrc ? (
                  <div className="login-form-container">
                    <form className="login-form">
                    <button type="button" onClick={uploadPhoto}>Submit photo</button>
                    <button type="button" onClick={retake}>Retake photo</button>
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