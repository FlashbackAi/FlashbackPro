import React from "react";
import "./InputBox.css";

// const createStyles = () => ({

//     // root : {
//     //     width: 100%;
//     //     height: 54px;
//     //     border-radius: 4px;
//     //     border-color: white;
//     //     background: white;
//     // }

// })

const InputBox = ({
  value,
  defaultValue,
  isEditable = false,
  type = "text",
  name,
  handleChange,
  placeholder,
  isRequired = false,
  accept
}) => {
   
  return (
    <div>
      <input
        className="input-field"
        name={name}
        disabled={!isEditable}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={isRequired}
        accept={accept}
      ></input>
    </div>
  );
};

export default InputBox;
