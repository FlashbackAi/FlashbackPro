import React from "react";
import { useNavigate } from 'react-router-dom'

function Profile(){

    const navigate = useNavigate();
    const handleLogout=()=>{
    
        console.log("logout")
        sessionStorage.setItem("accessToken", null);
        sessionStorage.clear();
        navigate("/login")
      };

    return(
        <div>
            <h1>Welcome to profile page</h1>
            <button name="logout" onClick={handleLogout}>Logout</button>
        </div>
    );
}
export default Profile;