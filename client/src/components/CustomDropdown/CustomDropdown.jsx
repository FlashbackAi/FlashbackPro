import React, { useState, useEffect, useRef } from 'react';
import './CustomDropdown.css';

const CustomDropdown = ({ question, options, selectedValue, onSelectChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerClassName = `custom-dropdown ${question}`

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSelect = (value) => {
    onSelectChange(question, value);
    setIsOpen(false);
  };

  return (
    <div className={containerClassName} ref={dropdownRef}>
      <div className="custom-dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
        {selectedValue ? <img src={selectedValue} alt="Selected" className="selected-image" /> : 'Select an image'}
      </div>
      {isOpen && (
        <div className="custom-dropdown-options">
          {options.map(option => (
            <div
              key={option.url}
              className="user_id"
              onClick={() => handleSelect(option.face_url)}
            >
              <img src={option.face_url} alt={option.description} className="option-image" />
              <span>{option.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
