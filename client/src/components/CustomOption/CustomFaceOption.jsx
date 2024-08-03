import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";

const CustomFaceOption = ({
  options,
  others,
  serialNo,
  onSelect,
  title,
  isFirst = false,
  isSubmit = false,
  sendSubmitAction,
  next,
  prev,
  multiple = false,
  question,
  sendSelection,
  selectedImage = [],
  isInternal = false,
  maritalStatus,
  isSibling = false
}) => {
  const [selection, setSelection] = useState(
    Array.isArray(selectedImage) ? selectedImage : [selectedImage]
  );

  const handleClick = (index, value) => {
    if (selection.includes(value) && !value.includes('missing.jpg')) {
      setSelection(selection.filter((item) => item !== value));
    } else {
      if (!multiple) {
        setSelection([value]);
      } else {
        setSelection((prevSelection) => [...prevSelection, value]);
      }
    }
    // Fetch and update family suggestions
    onSelect(question, value);
  };

  const handleClickSelected = (index, value) => {
    console.log(value);
    if (value.includes('missing.jpg')) {
      setSelection(selection.filter((_, i) => i !== index));
    } else {
      if (selection.includes(value)) {
        setSelection(selection.filter((item) => item !== value));
      } else {
        setSelection((prevSelection) => [...prevSelection, value]);
      }
    }

    onSelect(question, value);
  };

  useEffect(() => {
    sendSelection && sendSelection(question, multiple ? selection : selection[0]);
  }, [selection]);

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
      {selection && (
        <div className="img-options">
          <div className="selected-face">
            {selection.filter(url => url != null).map((url, index) => (
              <img key={index} src={url} alt={`selected ${index}`} className="selected-image" onClick={() => handleClickSelected(index, url)} />
            ))}
          </div>
        </div>
      )}
      <div className="img-options">
        <div className="separator">
          <hr className="partition-style" />
          {/* <p>Suggested People</p> */}
          <hr className="partition-style" />
        </div>
        <div className="img-group">
          {options.map((option, index) => (
            <div
              className={`img-outer ${selection.includes(option.face_url) ? "selected" : ""}`}
              key={index}
              onClick={() => handleClick(index, option.face_url)}
            >
              <img src={option.face_url} alt={option.user_id} />
            </div>
          ))}
        </div>
        { others && (
          <>
        <div className="separator">
          <hr className="partition-style" />
          <p>All Other People</p>
          <hr className="partition-style" />
        </div>

        <div className="img-group">
          {others.map((other, index) => (
            <div
              className={`img-outer ${selection.includes(other.face_url) ? "selected" : ""}`}
              key={index}
              onClick={() => handleClick(index, other.face_url)}
            >
              <img src={other.face_url} alt={other.user_id} />
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      <div className="button_flex">
        {!isFirst && !isSubmit && !isInternal && (
          <div onClick={() => prev(serialNo)}>
            <ChevronLeft />
          </div>
        )}
        {!isInternal && (
          <button onClick={isSubmit ? sendSubmitAction : () => next(serialNo)}>
            {isSubmit ? "Submit" : "Next"}
          </button>
        )}
        {isSibling && (
          <button onClick={() => maritalStatus()}>Marital Status</button>
        )}
      </div>
    </motion.div>
  );
};

export default CustomFaceOption;
