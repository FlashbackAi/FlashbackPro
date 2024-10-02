import React, { useEffect, useState, useRef } from 'react';
import './AppBar.css';
import { COMPANY_NAME } from '../../helpers/constants';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import Modal from 'react-modal'; // Assuming you are using react-modal
import QRCode from 'qrcode.react'; // Assuming you are using qrcode.react for QR generation
// import { FaCopy , FaBars} from 'react-icons/fa'; // Font Awesome Copy icon (install using: npm install react-icons)
import { Copy, Menu, User, Settings, LogOut, UserPlus, Coins, X } from 'lucide-react';


Modal.setAppElement('#root'); // For accessibility, set the app root for the modal

const StyledAppBar = styled.div`
  padding-top: env(safe-area-inset-top);
  height: 4.375rem;
  width: 100%;
  background-color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid;
  border-image: linear-gradient(90deg, #66D3FF 0%, #9A6AFF 38%, #EE75CB 71%, #FD4D77 100%);
  border-image-slice: 1;
`;

const Logo = styled.div`
  display: flex;
  gap: 0.3125rem;
  height: 1.875rem;
  align-items: center;
  cursor: pointer;
  
  img {
    height: 1.25rem;
  }
  
  span {
    font-size: 1.25rem;
    font-weight: bold;
  }
`;

const Socials = styled.div`
  display: flex;
  gap: 1.75rem;
  
  a {
    margin-left: 0px;
    width: 1.75rem;
    height: 1.75rem;
    display: grid;
    justify-content: center;
    align-items: center;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const CoinDisplay = styled.div`
  color: white;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 1em;
  margin-right: 2em;
  display: flex;
  align-items: center;
  
  img {
    height: 1.5rem;
    width: 1.5rem;
    object-fit: contain;
    vertical-align: middle;
    margin-left: 0.5em;
  }
`;

const MenuIcon = styled(Menu)`
  cursor: pointer;
  margin-right: 1em;
  font-size: 1.5em;
  color: white;
`;

const MenuPanel = styled(motion.div)`
  position: absolute;
  right: 0;
  top: 4.375rem;
  background-color: #fff;
  width: 15em;
  box-shadow: 0 0.5em 1em rgba(0,0,0,0.15);
  z-index: 100;
  color: black;
  border-radius: 0.5em;
  overflow: hidden;
`;

const MenuItem = styled.div`
  padding: 0.9375em;
  border-bottom: 1px solid #ccc;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #ececec;
  }

  svg {
    margin-right: 0.5em;
  }
`;

const StyledModal = styled(Modal)`
  &.wallet-modal-content {
    background-color: #1e1e1e;
    color: white;
    padding: 2em;
    margin: 2em auto;
    border-radius: 1em;
    max-width: 30em;
    outline: none;
    box-shadow: 0 0.5em 2em rgba(0, 0, 0, 0.3);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
`;

const ModalTitle = styled.h2`
  font-size: 1.5em;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
`;

const WalletDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Balance = styled.div`
  font-size: 2em;
  margin-bottom: 1em;
  display: flex;
  align-items: center;
  
  img {
    height: 1.5em;
    width: 1.5em;
    margin-left: 0.5em;
  }
`;

const HashCode = styled.div`
  display: flex;
  align-items: center;
  background: #2a2a2a;
  padding: 0.5em 1em;
  border-radius: 2em;
  margin-bottom: 1em;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #00ffff;
  cursor: pointer;
  margin-left: 0.5em;
  display: flex;
  align-items: center;
`;

const QRCodeWrapper = styled.div`
  background: white;
  padding: 1em;
  border-radius: 0.5em;
  margin-bottom: 1em;
`;

const WithdrawButton = styled.button`
  background: linear-gradient(90deg, #66D3FF 0%, #9A6AFF 38%, #EE75CB 71%, #FD4D77 100%);
  border: none;
  color: white;
  padding: 0.75em 2em;
  border-radius: 2em;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const AppBar = ({ showLogout = true, showCoins = false }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null); // State to hold user details
  const [walletDetails, setWalletDetails] = useState(null); // State to hold wallet details
  const [isQrModalOpen, setIsQrModalOpen] = useState(false); // State to control QR modal visibility
  const qrRef = useRef(null); // Ref for QR code
  const [hashCode, setHashCode] = useState(''); // State to store the wallet hash code
  const [copyStatus, setCopyStatus] = useState('Copy'); // State to manage text for copy action
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
    <StyledAppBar>
      <Logo onClick={() => navigate('/')}>
        <img src='assets/Images/logo.svg' alt='Logo' />
        <span>{COMPANY_NAME}</span>
      </Logo>
      
      <Socials>
        <a href='https://x.com/Flashback_Inc_' target='_blank' rel='noopener noreferrer'>
          <img src='assets/Images/icon-footer-x.svg' alt='Twitter' />
        </a>
        <a href='https://www.instagram.com/flashback_inc/' target='_blank' rel='noopener noreferrer'>
          <img src='assets/Images/icon-footer-instagram.svg' alt='Instagram' />
        </a>
      </Socials>

      <UserSection>
        {showCoins && userDetails && (
          <>
            <CoinDisplay onClick={openQrModal}>
              <span>{balance}</span>
              <img className='unityLogo' src='/unityLogo.png' alt=''/>
            </CoinDisplay>
          
            <MenuIcon onClick={toggleMenu} />

            <AnimatePresence>
              {isMenuOpen && (
                <MenuPanel
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <MenuItem><User size={18} /> {userDetails.user_phone_number}</MenuItem>
                {/* <MenuItem><User size={18} /> Profile</MenuItem> */}
                <MenuItem><UserPlus size={18} /> Refer</MenuItem>
                <MenuItem onClick={() => {navigate(`/dataSharing`)}}><Coins size={18} /> Earn Rewards</MenuItem>
                <MenuItem><Settings size={18} /> Settings</MenuItem>
                <MenuItem onClick={() => { localStorage.clear(); navigate('/'); }}><LogOut size={18} /> Logout</MenuItem>
              </MenuPanel>
              )}
            </AnimatePresence>
          </>
        )}
      </UserSection>

      <StyledModal
        isOpen={isQrModalOpen}
        onRequestClose={closeQrModal}
        contentLabel="Wallet Details"
        className="wallet-modal-content"
        overlayClassName="modal-overlay"
      >
        <ModalHeader>
          <ModalTitle>Wallet Details</ModalTitle>
          <CloseButton onClick={closeQrModal}><X size={25} /></CloseButton>
        </ModalHeader>
        
        <WalletDetails>
          <Balance>
            {balance} <img className='unityLogo' src='/unityLogo.png' alt=''/>
          </Balance>
          
          <HashCode>
            {formatHashCode(hashCode)}
            <CopyButton onClick={copyHashCode} title={copyStatus}>
              <Copy size={18} /> {copyStatus}
            </CopyButton>
          </HashCode>
          
          <QRCodeWrapper ref={qrRef}>
            <QRCode value={hashCode} size={200} />
          </QRCodeWrapper>
          
          <WithdrawButton onClick={() => navigate('/withdraw')}>
            Withdraw
          </WithdrawButton>
        </WalletDetails>
      </StyledModal>
    </StyledAppBar>
  );
};

export default AppBar;