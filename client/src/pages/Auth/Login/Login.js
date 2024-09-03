import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useLocation, useParams } from "react-router-dom";
import API_UTIL from "../../../services/AuthIntereptor";
import CountryCodes from "../../../media/json/CountryCodes.json";
import Select, { components } from "react-select";
import "./login.css";
import AppBar from "../../../components/AppBar/AppBar";
import OTPAuth from "../WhatsappAuth/OTPAuth";
import { from } from "readable-stream";

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

function Login({ name, onLoginSuccess, showAppBar = true }) {
  const [error] = useState("");
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
  const [setStep] = useState(0); // 0: move head, 1: blink, 2: ready to capture
  const [isCaptureEnabled, setIsCaptureEnabled] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [otpSentTime, setOtpSentTime] = useState(null);

  const videoConstraints = {
    width: 350,
    height: 250,
    facingMode: "user",
  };

  let location = useLocation();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userPhoneNumber = localStorage.getItem("userPhoneNumber");
    if (userPhoneNumber && !location.state?.from?.pathname?.includes('/photos')) {
      navigate(location.state?.from?.pathname || "/event");
    }
  }, [navigate, location.state]);

  useEffect(() => {
    if (isToastDisp.current) return;
    // toast("Register to view pictures, provide accurate mobile number so we can share you the pictures");
    isToastDisp.current = true;
  }, []);

  const fromUrl = location.state?.from?.pathname || "/event";
  console.log(fromUrl);

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

  const capture = async () => {
    if (isCaptureEnabled) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  };

  const retake = () => {
    setImgSrc(null);
    setStep(0);
    setIsCaptureEnabled(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fullPhoneNumber = countryCode + phoneNumber;
    try {
      const response = await API_UTIL.post('/sendOTP', { phoneNumber: fullPhoneNumber });
      if (response.status === 200) {
        setShowOTP(true);
        setOtpSentTime(Date.now());
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleOTPVerify = async (otpString) => {
    const fullPhoneNumber = countryCode + phoneNumber;
    try {
      const response = await API_UTIL.post('/verifyOTP', { phoneNumber: fullPhoneNumber, otp: otpString });
      if (response.status === 200) {
        // OTP verified successfully, proceed with user creation or login
        await createOrLoginUser(fullPhoneNumber);
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false };
    }
    finally{
      setShowOTP(false);
    }
  };

  const handleOTPResend = async () => {
    const fullPhoneNumber = countryCode + phoneNumber;
    try {
      const response = await API_UTIL.post('/sendOTP', { phoneNumber: fullPhoneNumber });
      if (response.status === 200) {
        setOtpSentTime(Date.now()); // Update the time when OTP was resent
      }
      // Optionally, show a success message to the user
    } catch (error) {
      console.error("Error resending OTP:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const createOrLoginUser = async (fullPhoneNumber) => {
    let userSource = "flashback";
    let role = "user";
    let reward_points = 50;
    if (typeof fromUrl === 'string' && fromUrl.includes("photos")) {
      userSource = "flashback-pro";
    }
    if (typeof fromUrl === 'string' && fromUrl.includes("dataset")) {
      role = "dataOwner";
      reward_points = 100000
    }
    if (typeof fromUrl === 'string' && fromUrl.includes("model")) {
      role = "modelOwner"
      reward_points = 100000
    }

    try {
      const response = await API_UTIL.post(`/createUser`, {
        username: fullPhoneNumber,
        eventName: eventName,
        userSource: userSource,
        role: role,
        reward_points: reward_points
      });
      setIsPhoneNumberValid(true);
      if (response.status === 201) {
        setIsNewUser(true);
      } else if (response.status === 200) {
        localStorage.setItem('userPhoneNumber', fullPhoneNumber);
        handleNavigation(fullPhoneNumber);
      }
    } catch (error) {
      console.error("Error creating/logging in user:", error);
    }
  };

  const handleNavigation = async (fullPhoneNumber) => {
    if (typeof fromUrl === 'string' && fromUrl.includes("photos")) {
      try {
        const urlArray = fromUrl.split("/");
        const response = await API_UTIL.post(`/userIdPhoneNumberMapping`, {
          phoneNumber: fullPhoneNumber,
          eventName: urlArray[urlArray.length - 2],
          userId: urlArray[urlArray.length - 1],
        });
        if (response.status === 200) {
          localStorage.setItem('userPhoneNumber', fullPhoneNumber);
          navigate(fromUrl);
        }
      } catch (error) {
        console.log("Error in mapping the userId and phone number");
      }
    } else {
      navigate(fromUrl);
    }
    localStorage.setItem('userPhoneNumber', fullPhoneNumber);
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
        localStorage.setItem('userPhoneNumber', fullPhoneNumber);
        handleNavigation(fullPhoneNumber);
        if (typeof fromUrl === 'string' && fromUrl.includes("photos")) {
          try {
            const urlArray = fromUrl.split("/");
            const response = await API_UTIL.post(`/userIdPhoneNumberMapping`, {
              phoneNumber: fullPhoneNumber,
              eventName: urlArray[urlArray.length - 2],
              userId: urlArray[urlArray.length - 1],
            });
            if (response.status === 200) {
              navigate(fromUrl);
            }
          } catch (error) {
            console.log("error in mapping the userId and phone number");
          }
        } else {
          navigate(fromUrl);
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
    <div className="login-root">
      <div className="login-page-appbar">
        {showAppBar && (
          <div>
            <AppBar showLogout={false}></AppBar>
          </div>
        )}
        <>
          <h1>Flashback</h1>
          <h4>Auto Curate & Instant Share Memories</h4>
        </>
      </div>
      <div className="loginBody">
        <div className="loginLeft">
          <div className="login-form-container">
            {!isPhoneNumberValid && !showOTP && (
              <form onSubmit={handleSubmit} className="login-form">
                <div className={"phoneOuter " + (phoneNumberError && "error")} style={{ position: "relative" }}>
                  <Select
                    className="country-code"
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
            {showOTP && (
              <OTPAuth 
                phoneNumber={countryCode + phoneNumber}
                onVerify={handleOTPVerify}
                onResend={handleOTPResend}
                otpSentTime={otpSentTime}
              />
            )}
            {isNewUser && (
              <div className="login-form-container">
                <p className="caution">Hey, don't worry we won't see your image :)</p>
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
        </div>
      </div>
    </div>
  );
}

export default Login;
