import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import './ClaimRewardsPopup.css';

const ClaimRewardsPopup = ({ isOpen, onClose, datasetDetails, requests, updateRequestStatus }) => {
    const navigate = useNavigate();
    const userPhoneNumber = localStorage.userPhoneNumber;

    const handleMayBeLater = () => {
        onClose(); // Close the modal
    };

    const [rewards, setRewards] = useState(0);

    useEffect(() => {
        // Fetch the count from the backend API
        API_UTIL.get(`/imagesForFederated/${userPhoneNumber}`)
            .then(response => {
                setRewards(Math.floor(response.data.count / 2));
            })
            .catch(error => {
                console.error('Error fetching photo count:', error);
            });
    }, [userPhoneNumber]);

    return (
        <>
            {rewards && (
                <Modal
                    isOpen={isOpen}
                    onRequestClose={onClose}
                    contentLabel="Requests"
                    className="claim-modal-content"
                    overlayClassName="modal-overlay"
                >
                    <div>
                        <div className="claim-modal-header">
                            <span className="claim-modal-title">Congatulations!! You have {rewards}<img className='unityLogo' src='/unityLogo.png' alt='Coin' /> to claim</span>
                        </div>
                        <div className="claim-modal-body">
                            <button className="claim-button" onClick={() => navigate('/dataSharing')}>
                                Claim
                            </button>
                            <button className="later-button" onClick={handleMayBeLater}>
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default ClaimRewardsPopup;
