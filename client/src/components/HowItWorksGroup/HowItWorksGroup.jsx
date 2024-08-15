import React from "react";
import "./HowItWorksGroup.css";
import { HOW_IT_WORKS_STRING, QAGroups } from "../../helpers/constants";
import QAExpandComponent from "../QAExpandComponent/QAExpandComponent";

const HowItWorksGroup = ({index}) => {
  return (
    <div className="how-it-works">
      <span className="heading"> {HOW_IT_WORKS_STRING}</span>
      <hr className="line"></hr>
      <div className="QA-group">
        {QAGroups[index].map((group) => {
          console.log("hello", group);
          return <QAExpandComponent group={group}></QAExpandComponent>;
        })}
      </div>
    </div>
  );
};

export default HowItWorksGroup;
