import styled from 'styled-components';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Edit3, WalletMinimal, ExternalLink, Image, Video, MessageCircle } from 'lucide-react';
import { RiYoutubeLine, RiInstagramLine, RiTwitterXLine, RiFacebookBoxFill} from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import defaultBanner from '../../media/images/defaultbanner.jpg';
import API_UTIL from '../../services/AuthIntereptor';
import LoadingSpinner from '../Loader/LoadingSpinner';
import Wallet from '../WalletModal/WalletModal';

const PanelContainer = styled.div`
  position: fixed;
  top: 75px; // Adjust based on your AppBar height
  left: ${({ isOpen }) => (isOpen ? '0' : '-320px')};
  width: 320px;
  height: fit-content;
  background-color: #121212;
  transition: left 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    left: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 80px; // Adjust to align with the top of the content area
  left: ${({ isOpen }) => (isOpen ? '320px' : '0')};
  background-color: #2a2a2a;
  border: none;
  border-radius: 0 5px 5px 0;
  padding: 10px;
  cursor: pointer;
  color: #00ffff;
  transition: left 0.3s ease;
  z-index: 1001;

  &:hover {
    background-color: #3a3a3a;
  }
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const FixedContent = styled.div`
  padding: 20px;
`;


const BannerImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1e1e1e; // Dark background for loading state
`;

const SpinnerContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const BannerImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-position: center;
  border-radius: 1rem 1rem 0 0;
  transition: opacity 0.3s ease;
`;

const EditBannerButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(42, 42, 42, 0.7);
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(58, 58, 58, 0.7);
  }
`;

const ProfileInfo = styled.div`
  padding: 20px;
  color: #ffffff;
`;

const BrandName = styled.h2`
  margin-bottom: 10px;
  color: #00ffff;
  font-size: 1.5rem;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
`;

const SocialLink = styled.a`
  color: #ffffff;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: #00ffff;
    transform: scale(1.1);
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  background-color: #2a2a2a;
  border: none;
  color: #ffffff;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  svg {
    margin-bottom: 5px;
  }

  &:hover {
    background-color: #3a3a3a;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
`;

const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;


const ProfilePanel = ({ userDetails, isOpen, togglePanel }) => {
    const navigate = useNavigate();
    const [bannerImage, setBannerImage] = useState(defaultBanner);
    const [isLoading, setIsLoading] = useState(true);
    const [timestamp, setTimestamp] = useState(Date.now());
    const fileInputRef = useRef(null);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
    useEffect(() => {
        if (userDetails.org_name && userDetails.user_name) {
          fetchBannerImage();
        }
      }, [userDetails]);

    const encodeURIWithPlus = (uri) => {
        return uri.replace(/ /g, '+');
      };
      
      const openQrModal = () => {
        setIsWalletModalOpen(true);
      };
    
      const closeQrModal = () => {
        setIsWalletModalOpen(false);
      };
    
    const fetchBannerImage = useCallback(async () => {
      console.log('Entering FetchBannerImage Method and started loading');
        setIsLoading(true);
      if (userDetails.org_name && userDetails.user_name) {
        try {
          const response = await API_UTIL.get(`/getBannerImage/${userDetails.org_name}/${userDetails.user_name}`);
          console.log(`ImageURl:`, response.data.imageUrl);
            
          if (response.data && response.data.imageUrl) {
            const formattedUrl = encodeURIWithPlus(response.data.imageUrl);
            console.log(`formattedUrl:`, formattedUrl);
            setBannerImage(`${formattedUrl}?t=${Date.now()}`);
          } else {
            console.log('[catch1]Falling back to default banner');
            setBannerImage(defaultBanner);
          }
        } catch (error) {
          console.error('Error fetching banner image:', error);
          console.log(`[catch2]Falling back to default banner`);
          setBannerImage(defaultBanner);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log(`[catch3]Falling back to default banner`);
        setBannerImage(defaultBanner);
        setIsLoading(false);
      }
    }, [userDetails.org_name, userDetails.user_name, timestamp]);
  
    const handleEditPortfolio = () => {
      navigate('/portfolioForm');
    };

  
    const handleBannerEdit = () => {
      fileInputRef.current.click();
    };
  
    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('bannerImage', file);
        formData.append('orgName', userDetails.org_name);
        formData.append('userName', userDetails.user_name);
  
        try {
          const response = await API_UTIL.post('/updateBannerImage', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (response.data && response.data.imageUrl) {
            const formattedUrl = encodeURIWithPlus(response.data.imageUrl);
            console.log(`formattedUrl:`, formattedUrl);
          
            setBannerImage(`${formattedUrl}?t=${Date.now()}`);
  
          }
        } catch (error) {
          console.error('Error uploading banner image:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    return (
      <>
        <ToggleButton onClick={togglePanel} isOpen={isOpen}>
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </ToggleButton>
        <PanelContainer isOpen={isOpen}>
          <PanelContent>
            <BannerImageContainer>
            {/* {isLoading ? (
              <SpinnerContainer>
                <LoadingSpinner />
              </SpinnerContainer>
            ) : ( */}
              <BannerImage src={bannerImage} />
            {/* )} */}
              <EditBannerButton onClick={handleBannerEdit}>
                <Edit3 size={16} />
              </EditBannerButton>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
                accept="image/*"
              />
            </BannerImageContainer>
            <ProfileInfo>
              <BrandName>{userDetails.org_name || userDetails.user_phone_number}</BrandName>
              <SocialLinks>
                {userDetails.social_media?.instagram && (
                  <SocialLink href={userDetails.social_media.instagram} target="_blank" rel="noopener noreferrer">
                    <RiInstagramLine size={24} />
                  </SocialLink>
                )}
                {userDetails.social_media?.youtube && (
                  <SocialLink href={userDetails.social_media.youtube} target="_blank" rel="noopener noreferrer">
                    <RiYoutubeLine size={24} />
                  </SocialLink>
                )}
                {userDetails.social_media?.facebook && (
                  <SocialLink href={userDetails.social_media.facebook} target="_blank" rel="noopener noreferrer">
                    <RiFacebookBoxFill size={24} />
                  </SocialLink>
                )}
              </SocialLinks>
            </ProfileInfo>
          </PanelContent>
          <FixedContent>
            <ActionButtons>
              <ActionButton onClick={openQrModal}>
                <WalletMinimal size={20} />
                Wallet
              </ActionButton>
              <ActionButton onClick={handleEditPortfolio}>
                <Edit3 size={20} />
                Portfolio
              </ActionButton>
              {/* Add more action buttons here */}
            </ActionButtons>
          </FixedContent>
          {isWalletModalOpen &&(
            <Wallet
                isOpen={isWalletModalOpen}
                onClose={closeQrModal}
                userPhoneNumber={localStorage.getItem('userPhoneNumber')}
                datasetName={`Memories-${userDetails?.user_name}`}
              />
            )}
        </PanelContainer>
      </>
    );
  };
  
  export default ProfilePanel;