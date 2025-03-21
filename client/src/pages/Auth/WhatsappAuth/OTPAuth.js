import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const OTPContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: #1a1a1a;
  border-radius: 1rem;
  max-width: 25rem;
  margin: 2rem auto;
  box-shadow: 0 0.625rem 1.875rem rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const OTPInputContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const OTPInput = styled(motion.input)`
  width: 2.5rem;
  height: 3.125rem;
  margin: 0 0.3125rem;
  text-align: center;
  font-size: 1.25rem;
  border: 0.125rem solid #333333;
  border-radius: 0.5rem;
  background-color: #2a2a2a;
  color: #ffffff;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00ffff;
    outline: none;
    box-shadow: 0 0 0 0.125rem rgba(74, 144, 226, 0.3);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #2a2a2a;
  margin-bottom: 1rem;

  &:hover:not(:disabled) {
    opacity: 0.9;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled(motion.p)`
  font-size: 0.9rem;
  color: ${props => props.success ? '#4caf50' : '#f44336'};
  margin-top: 1rem;
`;

const Timer = styled.p`
  font-size: 0.9rem;
  color: #b3b3b3;
  margin-top: 1rem;
`;

const OTPAuth = ({ phoneNumber, onVerify, onResend, otpSentTime }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [remainingTime, setRemainingTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [message, setMessage] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);

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
    // Focus on the first input when the component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setTimeout(() => setCooldownTime(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    // Handle pasted content from mobile keyboard
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).replace(/\D/g, '');
      if (pastedData) {
        const newOtp = Array(6).fill('');
        for (let i = 0; i < 6; i++) {
          newOtp[i] = pastedData[i] || '';
        }
        setOtp(newOtp);

        // Focus on the last filled input or the next empty one
        const nextEmptyIndex = newOtp.findIndex((val) => val === '');
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();

        // Add highlight effect
        inputRefs.current.forEach((input) => input?.classList.add('highlight'));
        setTimeout(() => {
          inputRefs.current.forEach((input) => input?.classList.remove('highlight'));
        }, 500);
        
        return;
      }
    }
    // Handle single character input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'Enter' && otp.join('').length === 6) {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);

      const nextEmptyIndex = newOtp.findIndex(val => val === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();

      
      // Add highlight class to all inputs
      inputRefs.current.forEach((input) => input?.classList.add('highlight'));

      // Remove highlight class after animation completes
      setTimeout(() => {
        inputRefs.current.forEach((input) => input?.classList.remove('highlight'));
      }, 500);
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
        setIsVerifying(true);
        try {
          const result = await onVerify(otpString);
          if (result.success) {
            setMessage('OTP verified successfully!');
            setIsDisabled(true);
            clearInterval(timerRef.current);
          } else {
            setMessage(result.message || 'Incorrect OTP. Please try again.');
            setAttempts((prev) => prev + 1);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
          }
        } catch (error) {
          setMessage('Error verifying OTP. Please try again.');
          setAttempts(prev => prev + 1);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } finally {
          setIsVerifying(false);
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
    <OTPContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>Tadoinnnnnn!</Title>
      <Subtitle>[{phoneNumber}] got the code! Punch it in fast</Subtitle>
      <OTPInputContainer>
        {otp.map((digit, index) => (
          <OTPInput
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={index === 0 ? 6 : 1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            whileFocus={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          />
        ))}
      </OTPInputContainer>
      <AnimatePresence>
        {message && (
          <Message
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            success={message.includes('success')}
          >
            {message}
          </Message>
        )}
      </AnimatePresence>
      <Button
        onClick={handleVerify}
        disabled={isDisabled || otp.join('').length < 6 || isVerifying}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isVerifying ? 'Verifying...' : 'Verify'}
      </Button>
      {remainingTime > 0 && (
        <Timer>OTP expires in {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</Timer>
      )}
      {cooldownTime > 0 ? (
        <Timer>Please wait {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')} before trying again</Timer>
      ) : (
        <Button
          onClick={handleResend}
          disabled={remainingTime > 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ backgroundColor: '#555555' }}
        >
          Resend
        </Button>
      )}
      <Timer>Attempts: {attempts}/3</Timer>
    </OTPContainer>
  );
};

export default OTPAuth;