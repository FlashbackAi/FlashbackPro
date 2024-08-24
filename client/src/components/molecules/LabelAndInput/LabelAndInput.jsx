import React from "react";
import InputBox from "../../atoms/InputBox/InputBox";
import './LabelAndInput.css'
const LabelAndInput = ({
  label,
  value,
  defaultValue,
  name,
  isEditable,
  type,
  handleChange,
}) => {
  return (
    <div className="label-text-field">
      <span>{label}</span>
      <InputBox
        value={value}
        defaultValue={defaultValue}
        handleChange={handleChange}
        name={name}
        type={type}
        isEditable={isEditable}
      ></InputBox>
    </div>
  );
};

export default LabelAndInput;
