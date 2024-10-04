import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import './SlideToAction.css';

function SlideToAction({ onSlideComplete, label }) {
    const [value, setValue] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [bouncing, setBouncing] = useState(true);

    useEffect(() => {
        // Bounce animation logic
        const bounceTimeout = setTimeout(() => setBouncing(false), 2000);
        return () => clearTimeout(bounceTimeout);
    }, []);

    const handleAfterChange = (val) => {
        if (val >= 70) {  // Completion at 70%
            setValue(100); // Automatically snap to 100%
            setCompleted(true);
            if (onSlideComplete) {
                onSlideComplete();
            }
        }
    };

    return (
        <div className="slider-container">
            <ReactSlider
                className={`custom-slider ${completed ? 'completed' : ''}`}
                thumbClassName={`thumb ${completed ? 'thumb-completed' : ''} ${bouncing ? 'thumb-bouncing' : ''}`}
                trackClassName="track"
                value={value}
                onAfterChange={handleAfterChange}
                onChange={(val) => !completed && setValue(val)}
                min={0}
                max={100}
                disabled={completed}  // Lock the slider after completion
            />
            <div className="slider-label">
                {completed ? 'Processing...' : label}
            </div>
        </div>
    );
}

export default SlideToAction;
