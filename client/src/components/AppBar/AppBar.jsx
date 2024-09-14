import React, { useEffect, useState, useRef } from 'react';
import './AppBar.css';
import { COMPANY_NAME } from '../../helpers/constants';
import { useNavigate } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import Modal from 'react-modal'; // Assuming you are using react-modal
import QRCode from 'qrcode.react'; // Assuming you are using qrcode.react for QR generation
import { FaCopy } from 'react-icons/fa'; // Font Awesome Copy icon (install using: npm install react-icons)

Modal.setAppElement('#root'); // For accessibility, set the app root for the modal

const AppBar = ({ showLogout = true, showCoins = false }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null); // State to hold user details
  const [walletDetails, setWalletDetails] = useState(null); // State to hold wallet details
  const [isQrModalOpen, setIsQrModalOpen] = useState(false); // State to control QR modal visibility
  const qrRef = useRef(null); // Ref for QR code
  const [hashCode, setHashCode] = useState(''); // State to store the wallet hash code
  const [copyStatus, setCopyStatus] = useState('Copy Code'); // State to manage text for copy action

  // Function to fetch user details from backend
  const fetchUserDetails = async (userPhoneNumber) => {
    try {
      const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
      setUserDetails(response.data.data);

      // Fetch wallet details after fetching user details
      fetchWalletDetails(userPhoneNumber);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Function to fetch wallet details from the backend
  const fetchWalletDetails = async (userPhoneNumber) => {
    try {
      const response = await API_UTIL.get(`/fetchWallet/${userPhoneNumber}`);
      setWalletDetails(response.data.walletDetails);
      setHashCode(response.data.walletDetails.wallet_address); // Set the wallet address as the hash code
    } catch (error) {
      console.error('Error fetching wallet details:', error);
    }
  };
  const formatHashCode = (code) => {
    if (!code || code.length <= 8) return code;
    return `${code.slice(0, 4)}...${code.slice(-4)}`;
  };

  useEffect(() => {
    if (showCoins) {
      const userPhoneNumber = localStorage.getItem('userPhoneNumber');
      if (userPhoneNumber) {
        fetchUserDetails(userPhoneNumber);
      }
    }
  }, [showCoins]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const openQrModal = () => {
    setIsQrModalOpen(true);
  };

  const closeQrModal = () => {
    setIsQrModalOpen(false);
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qr_code.png';
    downloadLink.click();
  };

  const sendInvite = () => {
    alert('Invite sent!'); // Placeholder function for sending an invite
  };

  // Function to copy the hash code to clipboard and show "Copied" temporarily
  const copyHashCode = () => {
    navigator.clipboard.writeText(hashCode).then(() => {
      setCopyStatus('Copied'); // Show "Copied" temporarily
      setTimeout(() => setCopyStatus('Copy Code'), 1000); // Revert to "Copy Code" after 1 second
    }).catch((err) => {
      console.error('Failed to copy hash code:', err);
    });
  };

  return (
    <div className='app-bar'>
      <div className='app-bar-logo'>
        <img src='assets/Images/logo.svg' alt='Logo' />
        <span>{COMPANY_NAME}</span>
      </div>
      <div className='app-bar-socials'>
        <a href='https://x.com/Flashback_Inc_' target='_blank' rel='noopener noreferrer'>
          <img src='assets/Images/icon-footer-x.svg' alt='Twitter' />
        </a>
        <a href='https://www.instagram.com/flashback_inc/' target='_blank' rel='noopener noreferrer'>
          <img src='assets/Images/icon-footer-instagram.svg' alt='Instagram' />
        </a>
      </div>

      <div className='user-section'>
        {showCoins && userDetails && (
          <div className='user-coins' onClick={openQrModal}>
            <span>Coins: {userDetails.reward_points}🪙</span>
          </div>
        )}

        {showLogout && (
          <div className='logout-section'>
            <button className='logout-button' onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onRequestClose={closeQrModal}
        contentLabel="QR Code"
        className="qr-modal-content"
        overlayClassName="modal-overlay"
      >
        <div className='event-details-qr-modal'>
          <div className='modal-header'>
            <h2 className='modal-title'>QR Code</h2>
            <button className='close-button' onClick={closeQrModal}>x</button>
          </div>
          <div className='qr-modal-body'>
            <div ref={qrRef} style={{ marginBottom: '20px' }}>
              <QRCode value={hashCode} size={256} />
            </div>
            <button className='qr-footer-buttons' onClick={downloadQRCode}>
              Download QR
            </button>
          </div>
          <hr className='modal-separator' />

          <div className='qr-modal-footer'>
            <p className='invite-text'>Copy Wallet Address</p>

            {/* Hash code section with copy text and icon */}
            <div className='hash-code-section'>
            <span className='hash-code-text'>{formatHashCode(hashCode)}</span>
              <FaCopy className='copy-icon' onClick={copyHashCode} title={copyStatus} />
              <span className='copy-text'>{copyStatus}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppBar;
