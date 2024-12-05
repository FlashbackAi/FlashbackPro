import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useLocation, useParams } from "react-router-dom";
import API_UTIL from "../../../services/AuthIntereptor";
import CountryCodes from "../../../media/json/CountryCodes.json";
import Select, { components } from "react-select";
import "./login.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import styled from 'styled-components';
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

const colors = {
  primary: '#1fb8f9',
  secondary: '#0000ff',
  background: '#ffffff',
  text: '#000000',
  lightGray: '#f0f0f0',
  darkGray: '#666666',
};

const breakpoints = {
  xs: '480px',   // Extra small devices (phones)
  sm: '600px',   // Small devices (larger phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1200px'   // Extra large devices
};

const StyledPhoneInput = styled.div`
  .react-tel-input {
    width: 100%;
  }

  .form-control {
    width: 100% !important;
    height: 56px !important;
    border-radius: 4px !important;
    border: 1px solid rgba(0, 0, 0, 0.23) !important;
    font-size: 16px !important;
    background: ${colors.background} !important;
    color: ${colors.text} !important;
    padding-left: 50px !important;
    
    &:hover {
      border-color: rgba(0, 0, 0, 0.87) !important;
    }
    
    &:focus {
      border-color: ${colors.primary} !important;
      border-width: 2px !important;
      box-shadow: none !important;
    }

    @media (max-width: ${breakpoints.xs}) {
      height: 48px !important;
      font-size: 14px !important;
    }
  }

  .flag-dropdown {
    background: transparent !important;
    border: none !important;
    border-radius: 4px 0 0 4px !important;
    height: 56px !important;

    @media (max-width: ${breakpoints.xs}) {
      height: 48px !important;
    }
    
    &.open {
      background: transparent !important;
      border-radius: 4px 0 0 4px !important;
    }
  }

  .selected-flag {
    background: transparent !important;
    width: 45px !important;
    height: 54px !important;
    padding: 0 0 0 8px !important;
    border-radius: 4px 0 0 4px !important;

    @media (max-width: ${breakpoints.xs}) {
      height: 46px !important;
    }

    &:hover, &:focus {
      background: transparent !important;
      border-radius: 4px 0 0 4px !important;
    }
  }

  .country-list {
    border-radius: 4px !important;
    margin-top: 4px !important;
    max-height: 300px !important;
    overflow-y: auto !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;

    .country {
      padding: 10px !important;
      color: ${colors.text};
      
      &:hover {
        background: ${colors.primary} !important;
      }
      
      &.highlight {
        background: ${colors.lightGray} !important;
      }

      .dial-code {
        color: ${colors.text} !important;
      }
    }

    .search {
      padding: 10px !important;
      
      input {
        width: 80% !important;
        padding: 8px !important;
        border: 1px solid rgba(0, 0, 0, 0.23) !important;
        border-radius: 4px !important;

        &:focus {
          border-color: ${colors.primary} !important;
          outline: none !important;
        }
      }
    }
  }

  .invalid-number-message {
    color: #d32f2f;
    font-size: 0.75rem;
    margin-top: 4px;
    margin-left: 14px;
  }
`;


function Login({ name, onLoginSuccess, showAppBar = true }) {
  const [error] = useState("");
  const { eventName } = useParams();
  const [isNewUser, setIsNewUser] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [fullPhoneValue, setFullPhoneValue] = useState("");
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const isToastDisp = useRef(false);
  const [setStep] = useState(0); // 0: move head, 1: blink, 2: ready to capture
  const [isCaptureEnabled, setIsCaptureEnabled] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const url = location.state?.from?.pathname 
      ? location.state.from.pathname 
      : (eventName ? `/photosv1/${eventName}/undefined` : "/dashboard");
      navigate(url);
    }
  }, [navigate, location.state]);

  useEffect(() => {
    if (isToastDisp.current) return;
    // toast("Register to view pictures, provide accurate mobile number so we can share you the pictures");
    isToastDisp.current = true;
  }, []);

  //const fromUrl = location.state?.from?.pathname || "/dashboard";
  const fromUrl = location.state?.from?.pathname 
  ? location.state.from.pathname 
  : (eventName ? `/photosv1/${eventName}/undefined` : "/dashboard");

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
    //setStep(0);
    setIsCaptureEnabled(true);
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
    const login_platform = 'FlashbackWeb';
    try {
      const response = await API_UTIL.post('/verifyOTP', { phoneNumber: fullPhoneNumber, otp: otpString, login_platform });
      if (response.data.success === false) {
        return { 
          success: false, 
          message: response.data.message,
          remainingAttempts: response.data.remainingAttempts 
        };
      }
        await createOrLoginUser(fullPhoneNumber);
        setShowOTP(false);
        return { success: true };
      } catch (error) {
        console.error("Error verifying OTP: ", error);
        return { 
          success: false,
          message: error.response?.data?.message || 'Error verifying OTP'
        };
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
    let reward_points = 100;
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
      formData.append("event",eventName);
      setIsSubmitting(true);

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
      }finally{
        setIsSubmitting(false);
      }
    }
  };

  const onChangeCountryCode = (event) => {
    setCountryCode(event.label);
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      event.preventDefault();
      if (phoneNumber.length === 10) {
        handleSubmit(event);
      }
    }
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
                 <StyledPhoneInput>
                  <PhoneInput
                    country={'in'}
                    value={fullPhoneValue}
                    onChange={(value, data) => {
                      // Get the input element
                      const inputElement = document.querySelector('.react-tel-input input');
                      const selectionStart = inputElement?.selectionStart || 0;
                      const selectionEnd = inputElement?.selectionEnd || 0;
                      const isSelected = selectionEnd - selectionStart > 0;
                      
                      // Handle selection deletion or replacement
                      if (isSelected) {
                        const beforeSelection = value.slice(0, data.dialCode.length + selectionStart);
                        const afterSelection = value.slice(data.dialCode.length + selectionEnd);
                        const newValue = beforeSelection + afterSelection;
                        value = newValue;
                      }

                      setFullPhoneValue(value);
                      
                      // Only update country code when explicitly changed via dropdown
                      if (value.length <= data.dialCode.length) {
                        setCountryCode('+' + data.dialCode);
                      }
                      
                      // Extract the phone number without country code
                      const numberWithoutCode = value.slice(data.dialCode.length).replace(/\D/g, '');
                      setPhoneNumber(numberWithoutCode);
                      
                      // Validate the phone number
                      if (!numberWithoutCode) {
                        setPhoneNumberError("Phone number is required");
                      } else if (numberWithoutCode.length !== 10) {
                        setPhoneNumberError("Please enter a valid 10-digit phone number");
                      } else {
                        setPhoneNumberError("");
                      }
                    }}
                    onCountryChange={(countryCode, data) => {
                      setCountryCode('+' + data.dialCode);
                      // Preserve the phone number when changing country
                      setFullPhoneValue(data.dialCode + phoneNumber);
                    }}
                    enableSearch
                    searchPlaceholder="Search countries..."
                    inputProps={{
                      name: 'phone',
                      required: true,
                      placeholder: 'Phone Number',
                      onKeyDown: handleKeyDown
                    }}
                    specialLabel=""
                    countryCodeEditable={false}
                    disableCountryCode={false}
                    preserveOrder={['onCountryChange', 'onChange']}
                  />
                  {phoneNumberError && (
                    <div className="invalid-number-message">
                      {phoneNumberError}
                    </div>
                  )}
                </StyledPhoneInput>
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
                        <button type="button" onClick={uploadPhoto} className="submit submitPhoto">  {isSubmitting ? 'Submitting...' : 'Submit Photo'}</button>
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
