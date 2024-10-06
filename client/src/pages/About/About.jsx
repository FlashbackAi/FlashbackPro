import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import PhotoSharing from "./PhotoSharing";
import AlbumSelection from "./AlbumSelection";
import Login from "../Auth/Login/Login";
import Modal from "react-modal";
import WeddingAlbums from "./WeddingAlbums";
import AppBar from "../../components/AppBar/AppBar";
import QAExpandComponent from "../../components/QAExpandComponent/QAExpandComponent";
import HowItWorksGroup from "../../components/HowItWorksGroup/HowItWorksGroup";
import Footer from "../../components/Footer/Footer";
import { Rocket } from "lucide-react";

Modal.setAppElement("#root");

const PageContainer = styled.div`
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
`;

const Header = styled.header`
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
`;

const HeaderContent = styled.div`
  position: relative;
  text-align: center;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 80%;
`;

const HeaderTitle = styled.h1`
  font-size: 4rem;
  margin: 0rem;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`;

const HeaderSubtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 2rem;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const CTAButton = styled(motion.button)`
  background: #2a2a2a;
  border: none;
  color: #ffffff;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }
`;

const FeatureSection = styled.div`
  padding: 4rem 2rem;
`;

const FeatureHeading = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
`;

const ColoredSpan = styled.span`
  color: #00ffff;
`;

const FeatureBody = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
`;

const FeatureImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
`;

const StyledModal = styled(Modal)`
  background-color: #1e1e1e;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  margin: 2rem auto;
  outline: none;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const RocketIcon = styled(Rocket)`
  color: #ffffff;
  transition: all 0.3s ease;

  ${CTAButton}:hover & {
    transform: translateY(-2px) rotate(-45deg);
    color: #00ffff;
  }
`;

const About = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <PageContainer>
      <AppBar showLogout={false} />
      <Header>
        <BackgroundImage src="https://flashbackportfoliouploads.s3.amazonaws.com/Aarvi Media-aarvimedia/Wedding/1723054857157-S_Y03064 copy.jpg" alt="Background" />
        <HeaderContent>
          <HeaderTitle>Flashback Inc</HeaderTitle>
          <HeaderSubtitle>Auto Curate & Instant Share Memories</HeaderSubtitle>
          <CTAButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openModal}
          >
           <RocketIcon size={22} />
            Get Started
          </CTAButton>
        </HeaderContent>
      </Header>

      <FeatureSection>
        <FeatureHeading>
          <ColoredSpan>Instant & Secure</ColoredSpan> Photo Sharing
        </FeatureHeading>
        <FeatureBody>
          <FeatureImage src="assets/feature-photo-share.png" alt="Photo Sharing" />
          <HowItWorksGroup index={0} />
        </FeatureBody>
      </FeatureSection>

      <FeatureSection>
        <FeatureHeading>
          <ColoredSpan>Auto Curated</ColoredSpan> Wedding Albums
        </FeatureHeading>
        <FeatureBody>
          <HowItWorksGroup index={1} />
          <FeatureImage src="assets/feature-curate-album.png" alt="Wedding Albums" />
        </FeatureBody>
      </FeatureSection>

      <Footer />

      <StyledModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Login Modal"
      >
        <CloseButton onClick={closeModal}>
          <X />
        </CloseButton>
        <Login showAppBar={false} />
      </StyledModal>
    </PageContainer>
  );
};

export default About;