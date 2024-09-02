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
  placeholder ,
  isRequired,
  accept
}) => {
  return (
    <div className="label-text-field">
      <label >{label}</label>
      <InputBox
        value={value}
        defaultValue={defaultValue}
        handleChange={handleChange}
        name={name}
        type={type}
        isEditable={isEditable}
        placeholder={placeholder}
        isRequired={isRequired}
        accept={accept}
      ></InputBox>
    </div>
  );
};

export default LabelAndInput;
