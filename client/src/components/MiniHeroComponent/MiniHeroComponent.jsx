import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa';

const HeroContainer = styled(motion.div)`
  height: 300px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-image: url(${props => props.backdropImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }

  @media (max-width: 768px) {
  height: 70%;
  }
`;

const Content = styled.div`
  z-index: 1;
  text-align: center;
`;

const OrgName = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 0.1rem 0.1rem;
  }
`;

const SocialIcons = styled(motion.div)`
  display: inline-flex;
  gap: 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1.5rem; // Add horizontal padding
  border-radius: 50px;
  backdrop-filter: blur(10px);
  align-items: center; // Center the icons

  @media (max-width: 768px){
  padding: 0.1rem 0.5rem;
  }
`;

const SocialLink = styled(motion.a)`
  color: #ffffff;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;

  &:hover {
    transform: scale(1.2);
  }
`;

const iconComponents = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  facebook: FaFacebook,
};

const MiniHeroComponent = ({ orgName, socialMediaLinks, backdropImage }) => {
  
  return (
    <HeroContainer
      backdropImage={backdropImage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Content>
        <OrgName
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {orgName}
        </OrgName>
        <SocialIcons
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {Object.entries(socialMediaLinks).map(([platform, url]) => {
            const IconComponent = iconComponents[platform];
            return IconComponent ? (
              <SocialLink
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconComponent />
              </SocialLink>
            ) : null;
          })}
        </SocialIcons>
      </Content>
    </HeroContainer>
  );
};

export default MiniHeroComponent;