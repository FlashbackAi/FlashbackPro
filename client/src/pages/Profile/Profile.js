import React from "react";
import { useNavigate } from 'react-router-dom'

function Profile(){

    const navigate = useNavigate();
    const handleLogout=()=>{

        console.log("logout")
       localStorage.setItem("accessToken", null);
       localStorage.clear();
        navigate("/login")
      };

    return(
        <div>
            <h1>Welcome to profile page</h1>
            <button name="logout" onClick={handleLogout}>Logout</button>

            <div className="collage">
                <img className="background" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKtCv9zAPpkrT7XZ0FN9oF_Lg7-ja3TOk7ZMhHBST4HFO5H9lD9pYsf9eiRTvgfYQhpJI&usqp=CAU"></img>
                    <img className="background" src="https://pbs.twimg.com/media/CCf1QhoUMAApMXw.jpg" alt="Background Image 2"></img>
                        <img className="background" src="https://assets.mubicdn.net/images/film/71642/image-w856.jpg?1506353917" alt="Background Image 3"></img>
                            <img className="background" src="https://pbs.twimg.com/media/FO7KO-gaUAAhkvL?format=jpg&name=large" alt="Background Image 4"></img>
                                <img className="foreground" src="https://stg.stevieawards.com/sites/default/files/24%20Bride%20Stills.png" alt="Foreground Image"></img>
            </div>
        </div>

    );
}
export default Profile;