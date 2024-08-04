import React from "react";
import "./Fallback.css";
import { useNavigate } from "react-router";
import { FALLBACK_PAGE_ERROR_MESSAGE } from "../../helpers/constants";
const Fallback = () => {
  const navigate = useNavigate();
  function handleClick() {
    navigate("/");
  }
  return (
    <div className="fallback-page">
      <div className="error-image">
        <span>4</span>
        <img width="50%" height={"50%"} src="logo.png"></img>
        <span>4</span>
      </div>
      <div className="error-message">
        {FALLBACK_PAGE_ERROR_MESSAGE}
      </div>
      <div>
        <button onClick={handleClick}> HOME</button>
      </div>
    </div>
  );
};

export default Fallback;
