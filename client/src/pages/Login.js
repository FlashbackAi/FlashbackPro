import React, { useState, useContext,createContext} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";


function Login() {
  const serverIP = process.env.REACT_APP_SERVER_IP;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');
  const { setAuthState } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const login = () => {
    axios.post(`${serverIP}/login`, { username: username, password: password }).then((response) => {

    console.log(response)
      if (response.data.error) {
        console.log(response)
        alert(response.data.error);
        setMessage(response.data.error)
      } else {
        // console.log(response.data.result)
        // localStorage.setItem("accessToken", response.data.result.getAccessToken().getJwtToken());
        // setMessage(username+" "+response.data.message)
        // console.log(response.data.accessToken)
        // // setAuthState({
        // //   username: response.data.username,
        // //   id: response.data.id,
        // //   status: true,
        // // });
        // //history.push("/");
        navigate("/createFlashBack")
      }
    }).catch(error => {
      console.error(error);
      setMessage(error.response.data);
  });
  };

  const Register=()=>{
    navigate("/registration")

  }
  return (
      <body className="loginBody">
      <div className="loginLeft">
        <p className="loginLogo">Flashback<p className="logoCaption">Create & share memories</p></p>


    <div className="login-form-container">


        <div className="login-form">
      <input
          type="text" id="email" name="email" placeholder="Email or phone number" required
        onChange={(event) => {
          setUsername(event.target.value);
        }}
      />

      <input
        type="password" id="password" name="password" placeholder="Password" required
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />

      <button type="submit" onClick={login}> Login </button>
          <div className="loginForgotPassword">
            <a href="#" >Forgot password?</a>
          </div>
      <button type="button" onClick={Register}>Create new account</button>

      <p>{message}</p>

        </div>
    </div>
      </div>
      </body>


  );
}

export default Login;