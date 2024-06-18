import React, { useState } from 'react';
import './PhotoSelection.css'; // Assuming the CSS is moved to App.css

function PhotoSelection() {
  const [activeMainTab, setActiveMainTab] = useState('tab1');
  const [activeSubTab, setActiveSubTab] = useState('Details1');

  const handleMainTabClick = (tabName) => {
    setActiveMainTab(tabName);
  };

  const handleSubTabClick = (subTabName) => {
    setActiveSubTab(subTabName);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <ul>
          <li onClick={() => handleMainTabClick('tab1')}>Groom</li>
          <li onClick={() => handleMainTabClick('tab2')}>Bride</li>
          <li onClick={() => handleMainTabClick('tab3')}>Groom+Bride</li>
        </ul>
      </div>
      <div className="content">
        {['tab1', 'tab2', 'tab3'].map((tab, idx) => (
          <div key={idx} className={`tab-content ${activeMainTab === tab ? 'active' : ''}`}>
            <h2>{tab === 'tab1' ? 'Groom Pictures' : tab === 'tab2' ? 'Bride Pictures' : 'Combined Pictures'}</h2>
            <div className="tab">
              <button className={`tablinks ${activeSubTab === 'Details' + (idx + 1) ? 'active' : ''}`} onClick={() => handleSubTabClick('Details' + (idx + 1))}>Details</button>
              <button className={`tablinks ${activeSubTab === 'YTD' + (idx + 1) ? 'active' : ''}`} onClick={() => handleSubTabClick('YTD' + (idx + 1))}>YTD</button>
              <button className={`tablinks ${activeSubTab === 'Compare' + (idx + 1) ? 'active' : ''}`} onClick={() => handleSubTabClick('Compare' + (idx + 1))}>Compare</button>
            </div>
            <div id={`Details${idx + 1}`} className={`tabcontent ${activeSubTab === 'Details' + (idx + 1) ? 'active' : ''}`}>
              <h3>Details Content for Tab {idx + 1}</h3>
              <p>Some content for Details {idx + 1}...</p>
            </div>
            <div id={`YTD${idx + 1}`} className={`tabcontent ${activeSubTab === 'YTD' + (idx + 1) ? 'active' : ''}`}>
              <h3>YTD Content for Tab {idx + 1}</h3>
              <p>Some content for YTD {idx + 1}...</p>
            </div>
            <div id={`Compare${idx + 1}`} className={`tabcontent ${activeSubTab === 'Compare' + (idx + 1) ? 'active' : ''}`}>
              <h3>Compare Content for Tab {idx + 1}</h3>
              <p>Some content for Compare {idx + 1}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotoSelection;
