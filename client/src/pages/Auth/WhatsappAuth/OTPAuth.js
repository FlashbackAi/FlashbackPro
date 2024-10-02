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
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #b3b3b3;
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
    border-color: #4a90e2;
    outline: none;
    box-shadow: 0 0 0 0.125rem rgba(74, 144, 226, 0.3);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: #4a90e2;
  margin-bottom: 1rem;

  &:hover:not(:disabled) {
    opacity: 0.9;
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
      inputRefs.current[focusIndex].focus();

      
      // Add highlight class to all inputs
      inputRefs.current.forEach(input => input.classList.add('highlight'));

      // Remove highlight class after animation completes
      setTimeout(() => {
        inputRefs.current.forEach(input => input.classList.remove('highlight'));
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
            type="tel"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isDisabled}
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
        disabled={otp.join('').length !== 6 || isDisabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Verify OTP
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
          {remainingTime > 0 ? `Resend OTP in ${remainingTime}s` : 'Resend OTP'}
        </Button>
      )}
      <Timer>Attempts: {attempts}/3</Timer>
    </OTPContainer>
  );
};

export default OTPAuth;

// import React, { useState, useEffect, useRef } from 'react';
// import './OTPAuth.css';

// const OTPAuth = ({ phoneNumber, onVerify, onResend, otpSentTime }) => {
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [remainingTime, setRemainingTime] = useState(0);
//   const [attempts, setAttempts] = useState(0);
//   const [cooldownTime, setCooldownTime] = useState(0);
//   const [message, setMessage] = useState('');
//   const [isDisabled, setIsDisabled] = useState(false);
//   const inputRefs = useRef([]);
//   const timerRef = useRef(null);


//   useEffect(() => {
//     if (otpSentTime) {
//       const elapsedTime = Math.floor((Date.now() - otpSentTime) / 1000);
//       const newRemainingTime = Math.max(180 - elapsedTime, 0);
//       setRemainingTime(newRemainingTime);
//       setMessage('');
//       setIsDisabled(false);
//       setOtp(['', '', '', '', '', '']);
      
      
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }

//       if (newRemainingTime > 0) {
//         timerRef.current = setInterval(() => {
//           setRemainingTime((prevTime) => {
//             if (prevTime <= 1) {
//               clearInterval(timerRef.current);
//               setMessage('OTP has expired. Please request a new one.');
//               setIsDisabled(true);
//               return 0;
//             }
//             return prevTime - 1;
//           });
//         }, 1000);
//       }
//     }

//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, [otpSentTime]);

//   useEffect(() => {
//     // Focus on the first input when the component mounts
//     if (inputRefs.current[0]) {
//       inputRefs.current[0].focus();
//     }
//   }, []);

//   useEffect(() => {
//     let timer;
//     if (cooldownTime > 0) {
//       timer = setTimeout(() => setCooldownTime(prev => prev - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [cooldownTime]);

//   const handleChange = (index, value) => {
//     if (isNaN(value)) return;
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     if (value !== '' && index < 5) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    
//     if (pastedData) {
//       const newOtp = [...otp];
//       for (let i = 0; i < 6; i++) {
//         newOtp[i] = pastedData[i] || '';
//       }
//       setOtp(newOtp);

//       const nextEmptyIndex = newOtp.findIndex(val => val === '');
//       const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
//       inputRefs.current[focusIndex].focus();

      
//       // Add highlight class to all inputs
//       inputRefs.current.forEach(input => input.classList.add('highlight'));

//       // Remove highlight class after animation completes
//       setTimeout(() => {
//         inputRefs.current.forEach(input => input.classList.remove('highlight'));
//       }, 500);
//     }
//   };

//   const handleVerify = async () => {
//     const otpString = otp.join('');
//     if (otpString.length === 6) {
//       if (remainingTime === 0) {
//         setMessage('OTP has expired. Please request a new one.');
//         setIsDisabled(true);
//         return;
//       }
//       if (attempts < 3) {
//         try {
//           const result = await onVerify(otpString);
//           if (result.success) {
//             setMessage('OTP verified successfully!');
//             setIsDisabled(true);
//             clearInterval(timerRef.current);
//           } else {
//             setMessage('Incorrect OTP. Please try again.');
//             setAttempts(prev => prev + 1);
//             setOtp(['', '', '', '', '', '',]);
//           }
//         } catch (error) {
//           setMessage('Error verifying OTP. Please try again.');
//           setAttempts(prev => prev + 1);
//         }
//       } else {
//         setCooldownTime(180); // 3 minutes cooldown
//         setAttempts(0);
//         setMessage('Too many attempts. Please wait before trying again.');
//         setIsDisabled(true);
//       }
//     }
//   };

//   const handleResend = () => {
//     if (cooldownTime === 0 && remainingTime === 0) {
//       onResend();
//       // setRemainingTime(180); // 3 minutes
//       // setOtp(['', '', '', '', '', '']);
//       // setMessage('');
//       // setAttempts(0);
//       // setIsDisabled(false);
//     }
//   };

//   return (
//     <div className="otp-container">
//       <h2>Enter OTP</h2>
//       <p>We've sent a 6-digit OTP to {phoneNumber}</p>
//       <div className="otp-input-container">
//         {otp.map((digit, index) => (
//           <div key={index} className="flip-card">
//             <div className={`flip-card-inner ${digit ? 'flipped' : ''}`}>
//               <div className="flip-card-front">
//           <input
//             key={index}
//             ref={el => inputRefs.current[index] = el}
//             type="tel"
//             inputMode="numeric"
//             pattern="[0-9]"
//             maxLength={1}
//             value={digit}
//             onChange={(e) => handleChange(index, e.target.value)}
//             onKeyDown={(e) => handleKeyDown(index, e)}
//             onPaste={handlePaste}
//             className="otp-input"
//             disabled={isDisabled}
//             // autoComplete='off'
//           />
//           </div>
//           <div className="flip-card-back">
//             <span>{digit}</span>
//           </div>
//           </div>
//           </div>
//         ))}
//       </div>
//       {message && <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
//       <button onClick={handleVerify} className="verify-button" disabled={otp.join('').length !== 6 || isDisabled}>
//         Verify OTP
//       </button>
//       {remainingTime > 0 && (
//         <p className="timer">OTP expires in  {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</p>
//       )}
//       {cooldownTime > 0 ? (
//         <p className="cooldown">Please wait {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')} before trying again</p>
//       ) : (
//         <button onClick={handleResend} className="resend-button" disabled={remainingTime > 0}>
//           {remainingTime > 0 ? `Resend OTP in ${remainingTime}s` : 'Resend OTP'}
//         </button>
//       )}
//       <p className="attempts">Attempts: {attempts}/3</p>
//     </div>
//   );
// };

// export default OTPAuth;