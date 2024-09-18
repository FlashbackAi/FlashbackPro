import React, { useEffect, useState, useRef } from 'react';
import './AppBar.css';
import { COMPANY_NAME } from '../../helpers/constants';
import { useNavigate } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import Modal from 'react-modal'; // Assuming you are using react-modal
import QRCode from 'qrcode.react'; // Assuming you are using qrcode.react for QR generation
import { FaCopy , FaBars} from 'react-icons/fa'; // Font Awesome Copy icon (install using: npm install react-icons)

Modal.setAppElement('#root'); // For accessibility, set the app root for the modal

const AppBar = ({ showLogout = true, showCoins = false }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null); // State to hold user details
  const [walletDetails, setWalletDetails] = useState(null); // State to hold wallet details
  const [isQrModalOpen, setIsQrModalOpen] = useState(false); // State to control QR modal visibility
  const qrRef = useRef(null); // Ref for QR code
  const [hashCode, setHashCode] = useState(''); // State to store the wallet hash code
  const [copyStatus, setCopyStatus] = useState('Copy Code'); // State to manage text for copy action
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to control menu visibility
  const [balance, setBalance] = useState(0);
  

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
  };
  // Function to fetch user details from backend
  const fetchUserDetails = async (userPhoneNumber) => {
    try {
      const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);

      setUserDetails(response.data.data);
      setBalance(response.data.data.reward_points);

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
  useEffect(() => {
    if (showCoins) {
      const userPhoneNumber = localStorage.getItem('userPhoneNumber');
    // Poll to fetch balance every 10 seconds
    const interval = setInterval(() => {
      if (userPhoneNumber) {
        fetchBalance(userPhoneNumber );
      }
    }, 5000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }
  }, [showCoins]);

  const fetchBalance = async (walletAddress) => {
    try {
      const response = await API_UTIL.get(`/wallet-balance/${walletAddress}`); // Use your API endpoint
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
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
     
        {showCoins && userDetails && (

          <div className='user-coins' onClick={openQrModal}>
            {/* <span>{balance}🪙</span> */}
            <span>{balance}🪙</span>
          </div>
        )}

      <div className='app-bar-logo'>
        <img src='assets/Images/logo.svg' alt='Logo' />
        <span>{COMPANY_NAME}</span>
      </div>
      {showCoins && userDetails && (
        <div className='hamburger'>
          <FaBars className='menu-icon' onClick={toggleMenu} />

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className='menu-panel'>
              <div className='menu-item'>{userDetails.user_phone_number}</div>
              <div className='menu-item'>Profile</div>
              <div className='menu-item'>Settings</div>
              <div className='menu-item' onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</div>
              <div className='menu-item'>Refer</div>
              <div className='menu-item'onClick={() => {navigate(`/dataSharing`)}}>Earn Rewards </div>
            </div>
          )}
          </div>
      )}

      <Modal
        isOpen={isQrModalOpen}
        onRequestClose={closeQrModal}
        contentLabel="Wallet Details"
        className="wallet-modal-content"
        overlayClassName="modal-overlay"
      >
        <div className='wallet-details-modal'>
        <div className='wallet-modal-header'>
            <h2 className='wallet-modal-title'>Wallet Details</h2>
            
            <button className='close-button' onClick={closeQrModal}>x</button>
          </div>
             <div className='wallet-modal-upper'>
             <span className='wallet-text'>Balance : {balance} 🪙</span>
            <span className='wallet-text'>Copy Wallet Address</span>

            {/* Hash code section with copy text and icon */}
            <div className='hash-code-section'>
            <span className='hash-code-text'>{formatHashCode(hashCode)}</span>
              <FaCopy className='copy-icon' onClick={copyHashCode} title={copyStatus} />
              <span className='copy-text'>{copyStatus}</span>
            </div>
          </div>
          <hr className='modal-separator' />
          <div className='wallet-modal-lower'>
            <div ref={qrRef} >
              <QRCode value={hashCode} size={256} />
            </div>
            {/* <button className='qr-footer-buttons' onClick={downloadQRCode}>
              Download QR
            </button> */}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppBar;
