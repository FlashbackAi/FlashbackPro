import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../helpers/AuthContext";
import Webcam from "react-webcam";
import logo from "../../../media/images/logoCropped.png";
import { toast } from "react-toastify";
import { useLocation, useParams } from "react-router-dom";
import API_UTIL from "../../../services/AuthIntereptor";
import CountryCodes from "../../../media/json/CountryCodes.json";
import Select, { components } from "react-select";

const CustomOption = ({ children, ...props }) => {
  console.log(`assets/CountryFlags/${props.data.code}.png`);
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
  console.log(props);
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

function Login() {
  // const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // const { setAuthState } = useContext(AuthContext);
  const { eventName } = useParams();
  const [isNewUser, setIsNewUser] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  // const [verificationCode, setVerificationCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  // const [fullPhoneNumber, setFullPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  // const [faceDetected, setFaceDetected] = useState(false);
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const videoConstraints = {
    width: 350,
    height: 250,
    facingMode: "user",
  };

  let location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || "/home";

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    // Regular expression for a 10-digit phone number
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(value)) {
      setPhoneNumberError("Please enter a valid 10-digit phone number");
    } else {
      setPhoneNumberError("");
    }
  };
  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    //const flag = await detectFaces();
    const flag = true;

    if (flag) {
      setImgSrc(imageSrc);
      setMessage("Please proceed Ahead");
    } else {
      setMessage("No faces has been detected please re-capture your picture");
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fullPhoneNumber = countryCode + phoneNumber; // Combine country code and phone number

    const response = await API_UTIL.post(`/createUser`, {
      username: fullPhoneNumber,
      eventName: eventName,
    });
    setIsPhoneNumberValid(true);
    if (response.status === 201) {
      setIsNewUser(true);
      toast("User created successfully please take a selfie");
    } else if (response.status === 200) {
      //setIsNewUser(true);
      console.log(from);
      if(from.includes("pictures")){
        try{
        const response = await API_UTIL.post(`/userIdPhoneNumberMapping`, {
          phoneNumber: fullPhoneNumber
        });
        if(response.status == 200)
          {
            console.log("Succesfully mapped the userId and phoneNumber");
          }
      }
      catch(error){
        console.log("error in mapping the userId and phone number");
      }
    }
      navigate(from);
      toast(
        `hey ${fullPhoneNumber}, you already exists. Have a great event ahead..`
      );
    }
  };

  const uploadPhoto = async (e) => {
    if (termsAccepted) {
      e.preventDefault();
      const fullPhoneNumber = countryCode + phoneNumber;
      const formData = new FormData();
      formData.append("image", imgSrc);
      formData.append("username", fullPhoneNumber);

      try {
        await API_UTIL.post(
          `/uploadUserPotrait`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if(from.includes("pictures")){
          try{
          const response = await API_UTIL.post(`userIdPhoneNumberMapping`, {
            phoneNumber: fullPhoneNumber
          });
          if(response.status == 200)
            {
              console.log("Succesfully mapped the userId and phoneNumber");
            }
        }
        catch(error){
          console.log("error in mapping the userId and phone number");
        }
        }
        navigate(from);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleVerification = () => {
    navigate(from);
    setIsNewUser(true);
  };

  // const resendVerification = () => {};

  return (
    <div className="loginBody">
      {/* {CountryCodes.map((cnt) => {
        return (
          <div className="flagOption">
            <img
              className="iconImg"
              src={`assets/CountryFlags/${cnt.code}.png`}
            />
            {cnt.code} {cnt.dial_code}
          </div>
        );
      })} */}
      <div className="loginLeft">
        {/* <p className="loginLogo">Flashback<p className="logoCaption">Create & share memories</p></p> */}
        <div className="loginLogoBox">
          <h2>
            FlashB
            <span>
              <img src={logo} />
            </span>
            ck
          </h2>
        </div>
        <div className="login-form-container">
          {!isPhoneNumberValid && (
            <form onSubmit={handleSubmit} className="login-form">
              <div
                className={"phoneOuter " + (phoneNumberError && "error")}
                style={{ position: "relative" }}
              >
                {/* <div className="countryCode"> */}
                {/* <img src={india} /> +91 */}
                <Select
                  className="countryCode"
                  classNamePrefix={"fb"}
                  options={CountryCodes}
                  defaultValue={{
                    name: "India",
                    dial_code: "+91",
                    code: "IN",
                    label: "+91",
                    value: "+91",
                  }}
                  components={{ Option: CustomOption, Control: CustomControl }}
                />
                <input
                  name="phoneNumber"
                  required
                  type="tel"
                  placeholder="Phone Number"
                  onChange={handlePhoneNumberChange}
                />
                {/* </div> */}
                {/* <PhoneInput
                className="phoneOuter"
                placeholder="Phone Number"
                forceDialCode={true}
                inputClassName="inputClass"
                  defaultCountry="in"
                  // value={phone}
                  // onChange={(phone) => setPhone(phone)}
                /> */}
              </div>
              {phoneNumberError && (
                <p
                  style={{
                    color: "#f66060",
                    // backgroundColor: "#FFBABA",
                    padding: "0.2em",
                    fontSize: "0.8rem",
                    borderRadius: "2px",
                    margin: "0",
                    textAlign: "left",
                  }}
                >
                  *{phoneNumberError}
                </p>
              )}
              <button
                type="submit"
                className="submit"
                disabled={phoneNumber.length !== 10}
              >
                Login
              </button>
              {error && (
                <p
                  style={{
                    color: "#cc0033",
                    backgroundColor: "#FFBABA",
                    padding: "0.2em",
                    fontSize: "0.9rem",
                    borderRadius: "2px",
                    margin: "0.5em",
                  }}
                >
                  {error}
                </p>
              )}
            </form>
          )}
          {isNewUser && (
            <div className="login-form-container">
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
                      <button type="submit" className="submit submitPhoto">
                        Submit photo
                      </button>
                      <button
                        type="button"
                        className="button takePhoto"
                        onClick={retake}
                      >
                        Retake photo
                      </button>
                      <label
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <input
                          name="checkbox"
                          type="checkbox"
                          required
                          style={{ transform: "scale(1.1)" }}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          onInvalid={(e) =>
                            e.target.setCustomValidity(
                              "Please accept the terms and conditions."
                            )
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                        />
                        <a
                          href="/TermsAndConditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="termsAndConditionButton"
                        >
                          Accept terms and conditions
                        </a>
                      </label>
                    </form>
                  </div>
                ) : (
                  <div className="login-form-container">
                    <form className="login-form">
                      <button
                        className="button takePhoto"
                        type="button"
                        onClick={capture}
                      >
                        Capture photo
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
