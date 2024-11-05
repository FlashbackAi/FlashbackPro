import React, { useEffect, useState } from 'react';
import './AppBar.css';
import { COMPANY_NAME } from '../../helpers/constants';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import Modal from 'react-modal'; // Assuming you are using react-modal
// import { FaCopy , FaBars} from 'react-icons/fa'; // Font Awesome Copy icon (install using: npm install react-icons)
import {  Menu, User, LogOut} from 'lucide-react';
import Wallet from '../WalletModal/WalletModal';




const StyledAppBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: env(safe-area-inset-top);
  height: 4.375rem;
  width: 100%;
  background-color: black;
  border-bottom: 2px solid;
  border-image: linear-gradient(90deg, #66D3FF 0%, #9A6AFF 38%, #EE75CB 71%, #FD4D77 100%);
  border-image-slice: 1;
  font-family: Advent Pro
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
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
    font-size: 1.75rem;
    font-weight: bold;
    color: white;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1em;
`;

const CoinDisplay = styled.div`
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 1em;

  img {
    height: 1.5rem;
    width: 1.5rem;
    object-fit: contain;
    margin-left: 0.5em;
  }
`;

const MenuIcon = styled(Menu)`
  cursor: pointer;
  color: white;
  margin-right: 1em;
`;

const MenuPanel = styled(motion.div)`
  position: absolute;
  right: 0;
  top: 4.375rem;
  background-color: #fff;
  width: 15em;
  box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.15);
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


const AppBar = ({ showLogout = true, showCoins = false }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null); // State to hold user details
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // State to control QR modal visibility
 
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
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };


  // // Function to fetch wallet details from the backend
  // const fetchWalletDetails = async (userPhoneNumber) => {
  //   try {
  //     const response = await API_UTIL.get(`/fetchWallet/${userPhoneNumber}`);
  //     setWalletDetails(response.data.walletDetails);
  //     setHashCode(response.data.walletDetails.wallet_address); // Set the wallet address as the hash code
  //   } catch (error) {
  //     console.error('Error fetching wallet details:', error);
  //   }
  // };
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



  useEffect(() => {
    if (showCoins) {
      const userPhoneNumber = localStorage.getItem('userPhoneNumber');
      if (userPhoneNumber) {
        fetchUserDetails(userPhoneNumber);
      }
    }
  }, [showCoins]);



  const openQrModal = () => {
    setIsWalletModalOpen(true);
  };

  const closeQrModal = () => {
    setIsWalletModalOpen(false);
  };




  return (
    <StyledAppBar>
      <LogoContainer>
        <Logo onClick={() => navigate('/model')}>
          <img src='/unityLogo.png' alt='Logo' />
          <span>{COMPANY_NAME}</span>
        </Logo>
      </LogoContainer>

      <UserSection>
        {showCoins && userDetails && (
          <>
            <CoinDisplay onClick={openQrModal}>
              <span>{balance}</span>
              <img className='unityLogo' src='/unityLogo.png' alt='' />
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
                  <MenuItem>
                    <User size={18} /> {userDetails.user_phone_number}
                  </MenuItem>
                  <MenuItem onClick={() => { localStorage.clear(); navigate('/'); }}>
                    <LogOut size={18} /> Logout
                  </MenuItem>
                </MenuPanel>
              )}
            </AnimatePresence>
          </>
        )}
      </UserSection>

      {isWalletModalOpen && (
        <Wallet
          isOpen={isWalletModalOpen}
          onClose={closeQrModal}
          userPhoneNumber={localStorage.getItem('userPhoneNumber')}
          datasetName={`Memories-${userDetails?.user_name}`}
          showCoins={showCoins}
        />
      )}
    </StyledAppBar>
  );
};

export default AppBar;