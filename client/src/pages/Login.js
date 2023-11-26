import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');
  const { setAuthState } = useContext(AuthContext);

  let history = useNavigate();

  const login = () => {
    axios.post("http://localhost:5000/login", { username: username, password: password }).then((response) => {
      if (response.data.error) {
        alert(response.data.error);
        setMessage(response.data.message)
      } else {
        localStorage.setItem("accessToken", response.data.accessToken);
        setMessage(username+" "+response.data.message)
        console.log(response.data.accessToken)
        // setAuthState({
        //   username: response.data.username,
        //   id: response.data.id,
        //   status: true,
        // });
        //history.push("/");
      }
    });
  };
  return (
    <div className="loginContainer">
      <label>Username:</label>
      <input
        type="text"
        onChange={(event) => {
          setUsername(event.target.value);
        }}
      />
      <label>Password:</label>
      <input
        type="password"
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />

      <button onClick={login}> Login </button>

      <p>{message}</p>
    </div>
  );
}

export default Login;