import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const CustomFaceOption = ({
  options,
  serialNo,
  title,
  isFirst = false,
  isSubmit = false,
  sendSubmitAction,
  next,
  prev,
  multiple = false,
  question,
  sendSelection,
}) => {
  const [selection, setSelection] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();

  const handleClick = (e, index, value) => {
    const checkSelection = document.getElementsByClassName(
      serialNo + "_" + index + " selected"
    );
    console.log(checkSelection);
    if (!!checkSelection.length) {
      checkSelection[0].classList.remove("selected");
      const selected = selection;
      selected.splice(selected.indexOf(value), 1);
      setSelection(selected);
    } else {
      if (!multiple) {
        setSelection([]);
        const doc = document.getElementsByClassName(
          serialNo + "_" + selectedIndex
        );
        if (!!doc.length) doc[0].classList.remove("selected");
      }
      setSelectedIndex(index);
      setSelection((prevSelection) => [...prevSelection, value]);
      e.target.classList.add("selected");
    }
  };

  useEffect(() => {
    sendSelection(question, multiple ? selection : selection[0]);
  }, [selection]);

  const [selectedFace, setSelectedFace] = useState(null);

  const handleSelect = (face) => {
    setSelectedFace(face);
  };

  return (
    <motion.div
      initial={{ opacity: 0, visibility: "hidden" }}
      whileInView={{ opacity: 1, visibility: "visible" }}
      transition={{
        duration: 0.8,
        ease: "easeIn",
      }}
      className={`${serialNo} question_answer`}
    >
      <div className="question-header">
        <div className="icon">
          <ArrowRight className="arrow" />
        </div>
        <div className="question">{title}</div>
      </div>
      {selectedFace && (
      <div className="img-options">
      
        <div className="selected-face">
          <h3>Selected Face:</h3>
          <img src={selectedFace.face_url} alt="Selected face" />
        </div>
      
        {options.map((option, index) => {
          return (
            <div
              className="img-outer"
              onClick={(e) => handleClick(e, index, option.face_url)}
              key={index}
            >
              <img
                className={serialNo + "_" + index}
                src={option.face_url}
                alt={option.user_id}
              />
              {/* <div className="backdrop-img"/> */}
            </div>
          );
        })}
      </div>
      )}  
      <div className="img-options">
        {options.map((option, index) => (
          <div
            className={`img-outer ${selectedFace === option ? 'selected' : ''}`}
            key={index}
            onClick={() => handleSelect(option)}
          >
            <img src={option.face_url} alt={option.user_id} />
          </div>
        ))}
      </div>
   
     
      <div className="button_flex">
        {!isFirst && !isSubmit && (
          <div onClick={() => prev(serialNo)}>
            <ChevronLeft />
          </div>
        )}
        <button onClick={isSubmit ? sendSubmitAction : () => next(serialNo)}>
          {isSubmit ? "Submit" : "Next"}
        </button>
      </div>
    </motion.div>
  );
};

export default CustomFaceOption;
