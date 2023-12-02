// import React from "react";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import axios from "axios";

// function Registration() {
//   const initialValues = {
//     username: "",
//     password: "",
//   };

//   const validationSchema = Yup.object().shape({
//     username: Yup.string().min(3).max(15).required(),
//     password: Yup.string().min(4).max(20).required(),
//   });

//   const onSubmit = (data) => {
//     axios.post("http://localhost:3001/auth", data).then(() => {
//       console.log(data);
//     });
//   };

//   return (
//     <div>
//       <Formik
//         initialValues={initialValues}
//         onSubmit={onSubmit}
//         validationSchema={validationSchema}
//       >
//         <Form className="formContainer">
//           <label>Username: </label>
//           <ErrorMessage name="username" component="span" />
//           <Field
//             autocomplete="off"
//             id="inputCreatePost"
//             name="username"
//             placeholder="(Ex. John123...)"
//           />

//           <label>Password: </label>
//           <ErrorMessage name="password" component="span" />
//           <Field
//             autocomplete="off"
//             type="password"
//             id="inputCreatePost"
//             name="password"
//             placeholder="Your Password..."
//           />

//           <button type="submit"> Register</button>
//         </Form>
//       </Formik>
//     </div>
//   );
// }

// export default Registration;

import { CognitoUserPool } from "amazon-cognito-identity-js";
import axios from 'axios';
import React, { useState } from 'react';
import Login from "./Login";
import { useNavigate} from "react-router-dom";

function Registration() {
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
       

        axios.post('http://localhost:5000/signup', {
            username: data.get('username'),
            password: data.get('password'),
            email: data.get('email')
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
        axios.post('http://localhost:5000/confirmUser', {
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