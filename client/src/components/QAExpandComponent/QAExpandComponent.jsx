import React, { useState } from "react";
import './QAExpandComponent.css'

const QAExpandComponent = ({ group }) => {
  const [isOpen, setIsOpen] = useState(false);
  function handleClick() {
    setIsOpen(!isOpen);
  }
  return (
    <div>
      <div className="QA-question-box" onClick={handleClick}>
        <span className="question">{group.question}</span>
        {isOpen ? (
          <img src="assets/Images/icon-chevron-up.svg"></img>
        ) : (
          <img src="assets/Images/icon-chevron-down.svg"></img>
        )}
      </div>
      {isOpen && <div className="answer">{group.answer}</div>}
    
      <hr className="line"></hr>
    </div>
  );
};

export default QAExpandComponent;
