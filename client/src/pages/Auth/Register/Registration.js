import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_UTIL from "../../../services/AuthIntereptor";

function Registration() {
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [fullPhoneNumber, setFullPhoneNumber] = useState("");

  const Login = () => {
    navigate("/login");
  };
  //var isRegistered=false;
//   const handleUsernameChange = (e) => {
//     setUsername(e.target.value);
//   };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
    setFullPhoneNumber(`${countryCode}${phoneNumber}`);
  };

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
  };

  const navigate = useNavigate();
  const handleSubmit = (event) => {
    event.preventDefault();

    //const fullPhoneNumber = `${countryCode}${phoneNumber}`
    // const data = new FormData(event.target);

    API_UTIL.post(`/request-otp`, {
      phoneNumber: fullPhoneNumber,
    }).then((response) => {
      //setMessage(response.data.message)
      console.log(response.data);
      if (response.data.message === "OTP sent successfully.") {
        setIsRegistered(true);
        setUsername(fullPhoneNumber);
        console.log(isRegistered);
        setMessage(
          "please enter the verification code sent to the registered mail id"
        );
      }
    });
    // .catch(error => {
    //     console.error(error.response.data);
    //     setMessage(error.response.data)
    // });
  };

  const handleVerification = () => {
    console.log(username);
    console.log(verificationCode);
    API_UTIL.post(`/verify-otp`, {
      phoneNumber: fullPhoneNumber,
      otpCode: verificationCode,
    }).then((response) => {
      setMessage(response.data.message);
      console.log(response.data.status);
      if (response.data.message === "User confirmed successfully.") {
        setMessage("new user has confirmed");
        navigate("/login");
      }
    });
    // .catch(error => {
    //     console.error(error.message);
    //     setMessage('error in confirming new user');
    // });
  };

  const resendVerfication = () => {
    API_UTIL.post(`/resend-verification`, {
      username: username,
    }).then((response) => {
      console.log(response.data.status);
      if (response.data.status === "Success") {
        setMessage("new verification code has been sent");
        navigate("/login");
      }
    });
    // .catch(error => {
    //     console.error(error.message);
    //     setMessage('error in generating new verification code');
    // });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form-container">
      <div className="loginLeft">
        <p className="loginLogo">
          Flashback<p className="logoCaption">Auto Curate & Instant Share memories</p>
        </p>
      </div>
      <div className="login-form">
        <select
          name="countryCode"
          onChange={handleCountryCodeChange}
          defaultValue="+91"
        >
          <option value="+1">+1</option> {/* USA */}
          <option value="+44">+44</option> {/* UK */}
          <option value="+91">+91</option> {/* India */}
          {/* Add other countries as needed */}
        </select>

        <input
          name="phoneNumber"
          required
          type="phoneNumber"
          placeholder="Phone Number"
          onChange={handlePhoneNumberChange}
        />
        <button type="submit">Sign Up</button>
        <button type="button" onClick={Login}>
          Already have an account?
        </button>
        {isRegistered && (
          <div name="verifyCode" className="verifyCode">
            <input
              name="verificationCode"
              type="text"
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button type="button" onClick={handleVerification}>
              Verify the Code
            </button>
            <button type="button" onClick={resendVerfication}>
              Resend Code
            </button>
          </div>
        )}
        <p>{message}</p>
      </div>
    </form>
  );
}
export default Registration;
