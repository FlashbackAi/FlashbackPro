import React, { useState, useContext,createContext} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');
  const { setAuthState } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const login = () => {
    axios.post("http://localhost:5000/login", { username: username, password: password }).then((response) => {

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
      <button onClick={Register}>New User?</button>

      <p>{message}</p>
    </div>
  );
}

export default Login;