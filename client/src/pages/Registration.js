import { CognitoUserPool } from "amazon-cognito-identity-js";
import axios from 'axios';
import React, { useState } from 'react';
import Login from "./Login";
import { useNavigate} from "react-router-dom";

function Registration() {

  const serverIP = process.env.REACT_APP_SERVER_IP;
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');


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
            console.error(error.message);
            setMessage('error in creating new user')
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
                navigate("/")
            }
        })
        .catch(error => {
            console.error(error.message);
            setMessage('error in confirming new user');
        });
    };

    return (
        <form onSubmit={handleSubmit} className="loginContainer">
            <input name="username" required type="text" placeholder="Username" onChange={handleUsernameChange} />
            <input name="password" required type="password" placeholder="Password" />
            <input name="email" required type="email" placeholder="Email" />
            <input name="phoneNumber" required type="phoneNumber" placeholder="Phone Number"/>
            <button type="submit">Sign Up</button>
            {
                isRegistered &&(
                <div name="verifyCode" className="verifyCode">       
                    <input 
                        name ="verificationCode" 
                        type="text"
                        onChange={(e) => setVerificationCode(e.target.value)}
                        />
                    <button type="button" onClick={handleVerification}>Verify the Code</button>
                </div>
            )}
            <p>{message}</p>
            
        </form>
    );
}
export default Registration;