import React, { useState, useEffect, useRef } from 'react';
import './OTPAuth.css';

const OTPAuth = ({ phoneNumber, onVerify, onResend, otpSentTime }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [remainingTime, setRemainingTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [message, setMessage] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);


  useEffect(() => {
    if (otpSentTime) {
      const elapsedTime = Math.floor((Date.now() - otpSentTime) / 1000);
      const newRemainingTime = Math.max(180 - elapsedTime, 0);
      setRemainingTime(newRemainingTime);
      setMessage('');
      setIsDisabled(false);
      setOtp(['', '', '', '', '', '']);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (newRemainingTime > 0) {
        timerRef.current = setInterval(() => {
          setRemainingTime((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              setMessage('OTP has expired. Please request a new one.');
              setIsDisabled(true);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [otpSentTime]);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setTimeout(() => setCooldownTime(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      if (remainingTime === 0) {
        setMessage('OTP has expired. Please request a new one.');
        setIsDisabled(true);
        return;
      }
      if (attempts < 3) {
        try {
          const result = await onVerify(otpString);
          if (result.success) {
            setMessage('OTP verified successfully!');
            setIsDisabled(true);
            clearInterval(timerRef.current);
          } else {
            setMessage('Incorrect OTP. Please try again.');
            setAttempts(prev => prev + 1);
            setOtp(['', '', '', '', '', '',]);
          }
        } catch (error) {
          setMessage('Error verifying OTP. Please try again.');
          setAttempts(prev => prev + 1);
        }
      } else {
        setCooldownTime(180); // 3 minutes cooldown
        setAttempts(0);
        setMessage('Too many attempts. Please wait before trying again.');
        setIsDisabled(true);
      }
    }
  };

  const handleResend = () => {
    if (cooldownTime === 0 && remainingTime === 0) {
      onResend();
      // setRemainingTime(180); // 3 minutes
      // setOtp(['', '', '', '', '', '']);
      // setMessage('');
      // setAttempts(0);
      // setIsDisabled(false);
    }
  };

  return (
    <div className="otp-container">
      <h2>Enter OTP</h2>
      <p>We've sent a 6-digit OTP to {phoneNumber}</p>
      <div className="otp-input-container">
        {otp.map((digit, index) => (
          <div key={index} className="flip-card">
            <div className={`flip-card-inner ${digit ? 'flipped' : ''}`}>
              <div className="flip-card-front">
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="otp-input"
            disabled={isDisabled}
          />
          </div>
          <div className="flip-card-back">
            <span>{digit}</span>
          </div>
          </div>
          </div>
        ))}
      </div>
      {message && <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
      <button onClick={handleVerify} className="verify-button" disabled={otp.join('').length !== 6 || isDisabled}>
        Verify OTP
      </button>
      {remainingTime > 0 && (
        <p className="timer">OTP expires in  {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</p>
      )}
      {cooldownTime > 0 ? (
        <p className="cooldown">Please wait {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')} before trying again</p>
      ) : (
        <button onClick={handleResend} className="resend-button" disabled={remainingTime > 0}>
          {remainingTime > 0 ? `Resend OTP in ${remainingTime}s` : 'Resend OTP'}
        </button>
      )}
      <p className="attempts">Attempts: {attempts}/3</p>
    </div>
  );
};

export default OTPAuth;