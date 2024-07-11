import React from "react";
import logo from "../../media/images/logoCropped.png";
import "./Header.css";

const Header = ({ clientName, stickToTop = true }) => {
  return (
    <header className={clientName && "m_Bottom_Low " + (stickToTop && "stickToTop")}>
      <h2>
        FlashBack
      </h2>
      {clientName && <h3>An event by {clientName}</h3>}
    </header>
  );
};

export default Header;
