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
import "./About.css"

Modal.setAppElement("#root");

const PageContainer = styled.div`
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
`;

const Header = styled.header`
  position: relative;
  overflow: hidden;
  color: white;
  padding: 100px 0;
  text-align: center;
`;

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  // filter: grayscale(100%);
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 1s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const HeaderTitle = styled.h1`
  font-size: 48px;
  margin-bottom: 10px;
  color: white;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`;

const HeaderSubtitle = styled.p`
  font-size: 18px;
  margin: 0;
  color: white;
`;


const CTAButton = styled(motion.button)`
  background: #2a2a2a;
  border: none;
  color: #ffffff;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  border-radius: 2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 20px;
  font-weight: bold;

  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    transform: scale(1.03);
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 8px 16px;
  }
`;


const RocketIcon = styled(Rocket)`
  color: #ffffff;
  transition: all 0.3s ease;

  ${CTAButton}:hover & {
    transform: translateY(-2px) rotate(-45deg);
    color: #00ffff;
  }
`;

const LandingBody = styled.div`
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 4rem 2rem;
  display: grid;
  row-gap: 5rem;
  justify-content: center;

  @media (max-width: 768px) {
    row-gap: 3rem;
    padding: 2rem 1rem;
  }
`;

const Feature = styled.div`
  display: grid;
  row-gap: 3rem;

  &:nth-child(even) {
    .feature-body {
      flex-direction: row-reverse;
    }
  }

  @media (max-width: 768px) {
    row-gap: 1.5rem;

    &:nth-child(even) {
      .feature-body {
        flex-direction: column;
      }
    }
  }
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
  justify-content: space-between;
  align-items: center;
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;


const FeatureImage = styled.img`
  max-width: 45%;
  height: auto;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const StyledModal = styled(Modal)`
  position: absolute;
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  transform: translate(-50%, -50%);
  background: #2a2a2a;
  color: #ffffff;
  padding: 20px;
  border-radius: 2em;
  width: 80%;
  max-width: 25em;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: visible;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #000000;

  @media (max-width: 768px) {
    top: 5px;
    right: 5px;
    font-size: 20px;
    padding: 0.1em;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 999;
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

      <LandingBody>
        <Feature>
          <FeatureHeading>
            <ColoredSpan>Instant & Secure</ColoredSpan> Photo Sharing
          </FeatureHeading>
          <FeatureBody className="feature-body">
            <FeatureImage src="assets/feature-photo-share.png" alt="Photo Sharing" />
            <HowItWorksGroup index={0} />
          </FeatureBody>
        </Feature>

        <Feature>
          <FeatureHeading>
            <ColoredSpan>Auto Curated</ColoredSpan> Wedding Albums
          </FeatureHeading>
          <FeatureBody className="feature-body">
            <FeatureImage src="assets/feature-curate-album.png" alt="Wedding Albums" />
            <HowItWorksGroup index={1} />
          </FeatureBody>
        </Feature>
      </LandingBody>

      <Footer />

      <StyledModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Login Modal"
        overlayClassName={ModalOverlay}
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