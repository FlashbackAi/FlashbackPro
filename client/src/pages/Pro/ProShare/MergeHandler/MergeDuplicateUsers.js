import React, { useState } from 'react';
import './MergeDuplicateUsers.css';

function MergeDuplicateUsers({ users, onClose, onMerge }) {
  const [mergeReason, setMergeReason] = useState('');
  const [mergeState, setMergeState] = useState('idle'); // 'idle', 'merging', 'success', 'failure'
  const [mergeMessage, setMergeMessage] = useState('');

  const handleMerge = () => {
    if (mergeReason) {
      setMergeState('merging');
      onMerge(mergeReason)
        .then(result => {
          if (result.success) {
            setMergeState('success');
            setMergeMessage('Thanks for the feedback! Users have been merged successfully.');
          } else {
            setMergeState('failure');
            setMergeMessage(`Oops! ${result.message}`);
          }
          setTimeout(() => {
            onClose();
          }, 3000); // Close popup after 3 seconds
        })
        .catch(error => {
          setMergeState('failure');
          setMergeMessage('An error occurred during the merge process.');
          setTimeout(() => {
            onClose();
          }, 3000);
        });
    } else {
      alert("Please select a reason for merging.");
    }
  };

  const handleCancel = () => {
    onClose(true);
  };

  return (
    <div className="merge-popup">
      <div className="merge-popup-content">
        <h2>Merge Faces</h2>
        <div className={`selected-users ${mergeState !== 'idle' ? 'merging' : ''}`}>
          {users.map((user, index) => (
            <div key={index} className={`selected-user ${mergeState !== 'idle' ? 'merging' : ''}`}>
              <img src={user.face_url} alt={`User ${index + 1}`} />
              <p>{user.count} images</p>
            </div>
          ))}
        </div>
        {mergeState === 'idle' && (
          <>
            <div className="merge-reason">
              <h3>Help us improve:</h3>
              <select value={mergeReason} onChange={(e) => setMergeReason(e.target.value)}>
                <option value="">Select a reason for merge</option>
                <option value="very_similar">Faces are very similar</option>
                <option value="hard_to_identify">A bit hard to identify</option>
                <option value="very_tough">Very tough to identify</option>
              </select>
            </div>
            <div className="merge-actions">
              <button onClick={handleMerge} disabled={!mergeReason}>Merge</button>
              <button onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
        {mergeState === 'merging' && (
          <div className="merging-message">
            <p>Merging in progress...</p>
          </div>
        )}
        {(mergeState === 'success' || mergeState === 'failure') && (
          <div className={`merge-result ${mergeState}`}>
            <p>{mergeMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MergeDuplicateUsers;
