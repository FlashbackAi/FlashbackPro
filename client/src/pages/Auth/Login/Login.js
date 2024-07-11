import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import logo from "../../../media/images/logoCropped.png";
import { toast } from "react-toastify";
import { useLocation, useParams } from "react-router-dom";
import API_UTIL from "../../../services/AuthIntereptor";
import CountryCodes from "../../../media/json/CountryCodes.json";
import Select, { components } from "react-select";
import "./login.css";
import * as faceapi from 'face-api.js';
import Header from "../../../components/Header/Header";

const CustomOption = ({ children, ...props }) => {
  return (
    <components.Option {...props}>
      <div className="flagOption customOption" style={{ display: "flex" }}>
        <img
          className="iconImg"
          alt={props.data.code}
          src={`assets/CountryFlags/${props.data.code}.png`}
        />
        {props.data.code}
        {children}
      </div>
    </components.Option>
  );
};

const CustomControl = ({ children, ...props }) => {
  return (
    <components.Control {...props}>
      <div className="flagOption customControl" style={{ display: "flex" }}>
        <img
          alt={props.getValue()[0]?.code}
          className="iconImg"
          src={`assets/CountryFlags/${props.getValue()[0]?.code}.png`}
        />
        {children}
      </div>
    </components.Control>
  );
};

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

function Login() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { eventName } = useParams();
  const [isNewUser, setIsNewUser] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const isToastDisp = useRef(false);
  const [step, setStep] = useState(0); // 0: move head, 1: blink, 2: ready to capture
  const [isCaptureEnabled, setIsCaptureEnabled] = useState(false);

  const videoConstraints = {
    width: 350,
    height: 250,
    facingMode: "user",
  };

  let location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isToastDisp.current) return;
    toast("Register to view pictures, provide accurate mobile number so we can share you the pictures", {
      position: "top-center"
    });
    isToastDisp.current = true;
  }, []);

  const from = location.state?.from || "/home";

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    loadModels();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          if (step === 0) {
            await detectHeadMovement();
          } else if (step === 1) {
            await detectBlink();
          }
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [step]);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(value)) {
      setPhoneNumberError("Please enter a valid 10-digit phone number");
    } else {
      setPhoneNumberError("");
    }
  };

  const detectHeadMovement = async () => {
    if (!webcamRef.current) return;
    const video = webcamRef.current.video;
    if (video.videoWidth === 0) return;

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if (detections.length > 0) {
      const landmarks = detections[0].landmarks;
      const nose = landmarks.getNose();
      const noseX = nose[3].x; // The tip of the nose (center point)

      // Detect significant head movement
    
      const videoWidth = video.videoWidth;
      console.log(noseX, videoWidth*0.3,videoWidth*0.7)
      if (noseX < videoWidth * 0.4 || noseX > videoWidth * 0.6) {
        console.log('Head movement detected');
        setStep(1);
        setMessage("Please blink.");
      }
    }
  };

  const detectBlink = async () => {
    if (!webcamRef.current) return;
    const video = webcamRef.current.video;
    if (video.videoWidth === 0) return;

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

    if (detections.length > 0) {
      const landmarks = detections[0].landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      const leftEAR = calculateEAR(leftEye);
      const rightEAR = calculateEAR(rightEye);

      if (leftEAR < 0.27 && rightEAR < 0.27) {
        setMessage("Please Capture your Selfie");
        console.log('Blink detected');
        setStep(2);
       
        setIsCaptureEnabled(true);
      }
    }
  };

  const calculateEAR = (eye) => {
    const A = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
    const B = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
    const C = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    return (A + B) / (2.0 * C);
  };

  const capture = async () => {
    if (isCaptureEnabled) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      setMessage("Image captured. Please proceed.");
    }
  };

  const retake = () => {
    setImgSrc(null);
    setStep(0);
    setMessage("Please move your head to the left or right.");
    setIsCaptureEnabled(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fullPhoneNumber = countryCode + phoneNumber;
    let userSource = "flashback";
    if (from.includes("photos")) {
      userSource = "flashback-pro";
    }
    const response = await API_UTIL.post(`/createUser`, {
      username: fullPhoneNumber,
      eventName: eventName,
      userSource: userSource,
      role: "user"
    });
    setIsPhoneNumberValid(true);
    if (response.status === 201) {
      setIsNewUser(true);
      toast("Click a selfie to register, don't worry we won't save your selfie.", {
        position: "top-center",
      });
    } else if (response.status === 200) {
      if (from.includes("photos")) {
        try {
          const urlArray = from.split("/");
          const response = await API_UTIL.post(`/userIdPhoneNumberMapping`, {
            phoneNumber: fullPhoneNumber,
            eventName: urlArray[urlArray.length - 2],
            userId: urlArray[urlArray.length - 1],
          });
          if (response.status == 200) {
            console.log("Succesfully mapped the userId and phoneNumber");
            navigate(from);
          }
        } catch (error) {
          console.log("error in mapping the userId and phone number");
          navigate(`${location.pathname}`, { state: { from } });
        }
      } else {
        navigate(from);
      }
      toast(
        `hey ${fullPhoneNumber}, you already exist. Have a great event ahead..`,
        { position: "top-center" }
      );
    }
  };

  const uploadPhoto = async () => {
    if (termsAccepted) {
      const fullPhoneNumber = countryCode + phoneNumber;
      const formData = new FormData();
      formData.append("image", imgSrc);
      formData.append("username", fullPhoneNumber);

      try {
        await API_UTIL.post(`/uploadUserPotrait`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (from.includes("photos")) {
          try {
            const urlArray = from.split("/");
            const response = await API_UTIL.post(`/userIdPhoneNumberMapping`, {
              phoneNumber: fullPhoneNumber,
              eventName: urlArray[urlArray.length - 2],
              userId: urlArray[urlArray.length - 1],
            });
            if (response.status == 200) {
              console.log("Succesfully mapped the userId and phoneNumber");
              navigate(from);
            }
          } catch (error) {
            console.log("error in mapping the userId and phone number");
          }
        } else {
          navigate(from);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const onChangeCountryCode = (event) => {
    setCountryCode(event.label);
  };

  return (
    <div>
      <Header/>
      <div className="loginBody">
      <div className="loginLeft">
        <div className="login-form-container">
          {!isPhoneNumberValid && (
            <form onSubmit={handleSubmit} className="login-form">
              <div className={"phoneOuter " + (phoneNumberError && "error")} style={{ position: "relative" }}>
                <Select
                  className="countryCode"
                  classNamePrefix={"fb"}
                  options={CountryCodes}
                  onChange={onChangeCountryCode}
                  defaultValue={{
                    name: "India",
                    dial_code: "+91",
                    code: "IN",
                    label: "+91",
                    value: "+91",
                  }}
                  components={{ Option: CustomOption, Control: CustomControl }}
                />
                <input name="phoneNumber" required type="tel" placeholder="Phone Number" onChange={handlePhoneNumberChange} />
              </div>
              <div className="privacyNotice">
                <p>By Submitting your phone number, you confirm you've read this <a href="/TermsAndConditions" target="_blank">Privacy Notice</a></p>
              </div>
              {phoneNumberError && (
                <p style={{ color: "#f66060", padding: "0.2em", fontSize: "0.8rem", borderRadius: "2px", margin: "0", textAlign: "left" }}>
                  *{phoneNumberError}
                </p>
              )}
              <button type="submit" className="submit" disabled={phoneNumber.length !== 10}>Login</button>
              {error && (
                <p style={{ color: "#cc0033", backgroundColor: "#FFBABA", padding: "0.2em", fontSize: "0.9rem", borderRadius: "2px", margin: "0.5em" }}>
                  {error}
                </p>
              )}
            </form>
          )}
          {isNewUser && (
            <div className="login-form-container">
              <p className="caution">Hey, don't worry we won't see your image :)</p>
              <p className={`instructions ${step === 0 ? 'rotate' : step === 1 ? 'blink' : ''}`}>
               <span className="instructionSpan">{step === 0 ? " Please move your head left or right  to verify." : step === 1 ? " Please blink  to verify." : "Capture your Selfie"}</span>
              </p>
              {imgSrc ? (
                <img src={imgSrc} alt="webcam" />
              ) : (
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ zIndex: 0 }} videoConstraints={videoConstraints} mirrored={true} />
              )}
              <div className="btn-container">
                {imgSrc ? (
                  <div className="login-form-container">
                    <form className="login-form">
                      <button type="button" onClick={uploadPhoto} className="submit submitPhoto">Submit photo</button>
                      <button type="button" className="button takePhoto" onClick={retake}>Retake photo</button>
                      <label style={{ display: "flex", justifyContent: "center" }}>
                        <input name="checkbox" type="checkbox" defaultChecked required style={{ transform: "scale(1.1)" }} onChange={(e) => setTermsAccepted(e.target.checked)} onInvalid={(e) => e.target.setCustomValidity("Please accept the terms and conditions.")} onInput={(e) => e.target.setCustomValidity("")} />
                        <a href="/TermsAndConditions" target="_blank" rel="noopener noreferrer" className="termsAndConditionButton">Accept terms and conditions</a>
                      </label>
                    </form>
                  </div>
                ) : (
                  <div className="login-form-container">
                    {isCaptureEnabled && (
                      <form className="login-form">
                        <button className="button takePhoto" type="button" onClick={capture}>Capture photo</button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* {!isPhoneNumberValid &&(
        <div className="contactUs">
          <p>Contact Us: <a href="tel:+919090301234">+919090301234 | +919090401234</a></p>
          <p>Write to Us: <text>team@flashback.inc</text></p>
        </div>
        )} */}
      </div>
    </div>
    </div>
  );
}

export default Login;
