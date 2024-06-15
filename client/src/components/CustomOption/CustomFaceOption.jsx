import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";

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
  selectedImage,
}) => {
  const abc = selectedImage?selectedImage:[];
  const [selection, setSelection] = useState(abc)
  console.log(selectedImage);
  const handleClick = (index, value) => {
    if (selection.includes(value)) {
      setSelection(selection.filter((item) => item !== value));
    } else {
      if (!multiple) {
        setSelection([value]);
      } else {
        setSelection((prevSelection) => [...prevSelection, value]);
      }
    }
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
      {selection  && (
        <div className="img-options">
          <div className="selected-face">
     
          {selection.filter(url => url !== null).map((url, index) => (
            <img key={index} src={url} alt={`selected ${index}`} className="selected-image" />
          ))}
          </div>
        </div>
      )}
      <div className="img-options">
        {options.map((option, index) => (
          <div
            className={`img-outer ${
              selection.includes(option.face_url) ? "selected" : ""
            }`}
            key={index}
            onClick={() => handleClick(index, option.face_url)}
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
