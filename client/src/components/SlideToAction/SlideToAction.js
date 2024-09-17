import React, { useState } from 'react';
import ReactSlider from 'react-slider';
import './SlideToAction.css';

function SlideToAction({ onSlideComplete, label }) {
    const [value, setValue] = useState(0);

    const handleAfterChange = (val) => {
        if (val >= 90) {
            // Trigger the slide action logic
            if (onSlideComplete) {
                onSlideComplete();
            }
        }
    };

    return (
        <div className="slider-container">
            <ReactSlider
                className="custom-slider"
                thumbClassName="thumb"
                trackClassName="track"
                value={value}
                onAfterChange={handleAfterChange}
                onChange={(val) => setValue(val)}
                min={0}
                max={100}
            />
            <div className="slider-label">
                {value < 90 ? label : 'Processing...'}
            </div>
        </div>
    );
}

export default SlideToAction;
