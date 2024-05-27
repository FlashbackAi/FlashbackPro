// ForgotPassword.js
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import API_UTIL from '../../../services/AuthIntereptor';

const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // try {
            const response = await API_UTIL.post(`/forgot-password`, { email });
            setMessage(response.data.message);
            setCodeSent(true);
        // } catch (error) {
        //     setMessage(error.response.data.message);
        // }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        // try {
            const response = await API_UTIL.post(`/reset-password`, { email,code,newPassword });
            setMessage(response.data.message);
            navigate("/login")
        // } catch (error) {
        //     setMessage(error.response.data.message);
        // }
    };

    return (
        <div>
            <div>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
            </div>
        {
        codeSent &&(   
        <div>
         <h2>Reset Password</h2>
         <form onSubmit={resetPassword}>
             <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Email"
                 required
             />
             <input
                 type="text"
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 placeholder="Verification Code"
                 required
             />
             <input
                 type="password"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 placeholder="New Password"
                 required
             />
             <button type="submit">Reset Password</button>
         </form>
     </div>
        )}
     </div>
    );
};

export default ForgotPassword;
