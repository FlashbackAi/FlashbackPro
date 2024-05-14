import React from "react";
import logo from "../Media/logoCropped.png";
import "./Header.css"

const Header = (props) => {
  return (
    <header>
      <h2>
        FlashB
        <span>
          <img src={logo} />
        </span>
        ck
      </h2>
    </header>
  );
};

export default Header;
