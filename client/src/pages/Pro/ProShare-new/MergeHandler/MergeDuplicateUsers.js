import React, { useState } from 'react';
import './MergeDuplicateUsers.css';

function MergeDuplicateUsers({ 
  onClose, 
  onMerge, 
  thumbnails,
  selectedMainUser,
  selectedDuplicateUsers,
  onMainUserSelect,
  onDuplicateUserSelect
}) {
  const [merging, setMerging] = useState(false);

  const handleMainUserSelect = (thumbnail) => {
    onMainUserSelect(thumbnail);
  };

  const handleDuplicateUserSelect = (thumbnail) => {
    if (selectedDuplicateUsers.length < 5 && !selectedDuplicateUsers.includes(thumbnail) && thumbnail !== selectedMainUser) {
      onDuplicateUserSelect([...selectedDuplicateUsers, thumbnail]);
    }
  };

  const handleRemoveDuplicateUser = (thumbnail) => {
    onDuplicateUserSelect(selectedDuplicateUsers.filter(user => user !== thumbnail));
  };

  const handleMerge = () => {
    if (selectedMainUser && selectedDuplicateUsers.length > 0) {
      if (window.confirm('Are you sure you want to merge these users?')) {
        setMerging(true);
        setTimeout(() => {
          onMerge(selectedMainUser, selectedDuplicateUsers);
          setMerging(false);
        }, 2000); // 2 seconds for the animation
      }
    }
  };

  return (
    <div className="merge-component">
      <div className="merge-header">
        <h2>Merge Users</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="user-selection">
        <div className="main-user">
          <h3>Main User</h3>
          {selectedMainUser ? (
            <div className="selected-user">
              <img src={selectedMainUser.face_url} alt="Main User" />
              <p>{selectedMainUser.count} images</p>
            </div>
          ) : (
            <div className="user-slot" onClick={() => handleMainUserSelect(null)}>Click to select main user</div>
          )}
        </div>
        <div className="duplicate-users">
          <h3>Duplicate Users (up to 5)</h3>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="user-slot">
              {selectedDuplicateUsers[index] ? (
                <div className="selected-user">
                  <img src={selectedDuplicateUsers[index].face_url} alt={`Duplicate User ${index + 1}`} />
                  <p>{selectedDuplicateUsers[index].count} images</p>
                  <button onClick={() => handleRemoveDuplicateUser(selectedDuplicateUsers[index])}>Remove</button>
                </div>
              ) : (
                <div onClick={() => handleDuplicateUserSelect(null)}>Click to select duplicate user</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="merge-actions">
        <button onClick={handleMerge} disabled={!selectedMainUser || selectedDuplicateUsers.length === 0 || merging}>
          Merge
        </button>
      </div>
      {merging && (
        <div className="merge-animation">
          <div className="merging-text">Merging the users...</div>
          <div className="main-user-animate" style={{backgroundImage: `url(${selectedMainUser.face_url})`}}></div>
          {selectedDuplicateUsers.map((user, index) => (
            <div key={index} className="duplicate-user-animate" style={{backgroundImage: `url(${user.face_url})`}}></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MergeDuplicateUsers;