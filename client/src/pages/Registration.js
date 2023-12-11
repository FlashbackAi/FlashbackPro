import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate} from "react-router-dom";

function Registration() {

  const serverIP = process.env.REACT_APP_SERVER_IP;
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');

    const Login=()=>{
        navigate("/login")

    }
  //var isRegistered=false;
    const handleUsernameChange = (e) => {
    setUsername(e.target.value);

  };
  const navigate = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
       

        axios.post(`${serverIP}/signup`, {
            username: data.get('username'),
            password: data.get('password'),
            email: data.get('email'),
            phoneNumber: data.get('phoneNumber')
        }).then(response => {
            //setMessage(response.data.message)
            console.log(response.data.status)
            if(response.data.status === "Success")
            {
                setIsRegistered(true);
                setUsername(username);
                console.log(isRegistered);
                setMessage("please enter the verification code sent to the registered mail id")
                
            }
        })
        .catch(error => {
            console.error(error.response.data);
            setMessage(error.response.data)
        });
    };

    const handleVerification = () => {
        console.log(username)
        console.log(verificationCode)
        axios.post(`${serverIP}/confirmUser`, {
            username: username,
            verificationCode: verificationCode
        }).then(response => {
            setMessage(response.data.message)
            console.log(response.data.status)
            if(response.data.status === "Success")
            {
                setMessage('new user has confirmed');
                navigate("/login")
            }
        })
        .catch(error => {
            console.error(error.message);
            setMessage('error in confirming new user');
        });
    };

    const resendVerfication = () => {
        
        axios.post(`${serverIP}/resend-verification`, {
            username: username
        }).then(response => {
            console.log(response.data.status)
            if(response.data.status === "Success")
            {
                setMessage('new verification code has been sent');
                navigate("/login")
            }
        })
        .catch(error => {
            console.error(error.message);
            setMessage('error in generating new verification code');
        });
    };

    return (

        <form onSubmit={handleSubmit} className="login-form-container">
            <div className="loginLeft">
                <p className="loginLogo">Flashback<p className="logoCaption">Create & share memories</p></p>
            </div>
            <div className="login-form">
            <input name="email" required type="email" placeholder="Email" />
            <input name="username" required type="text" placeholder="User Name" onChange={handleUsernameChange} />
            <input name="phoneNumber" required type="phoneNumber" placeholder="Phone Number" />
            <input name="password" required type="password" placeholder="Password" />
            <input name="Referral Code" type="text" placeholder="Referral Code"/>
            <button type="submit">Sign Up</button>
                <button type="button" onClick={Login}>Already have an account?</button>
            {
                isRegistered &&(
                <div name="verifyCode" className="verifyCode">       
                    <input 
                        name ="verificationCode" 
                        type="text"
                        onChange={(e) => setVerificationCode(e.target.value)}
                        />
                    <button type="button" onClick={handleVerification}>Verify the Code</button>
                    <button type="button" onClick={resendVerfication}>Resend Code</button>
                </div>
            )}
            <p>{message}</p>
            </div>
        </form>
    );
}
export default Registration;