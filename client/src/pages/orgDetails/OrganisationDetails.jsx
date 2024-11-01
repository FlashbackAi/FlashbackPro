import React from 'react';
import styled from 'styled-components';

// Styled Components
const OrgHeader = styled.div`
  width: 100%;
  background-color: black;
  top: 0;
  border-image: linear-gradient(90deg, #66D3FF 0%, #9A6AFF 38%, #EE75CB 71%, #FD4D77 100%);

   border-image-slice: 1;
    border-bottom: 2px solid ;
`;
const HeaderTopRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;


const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const OrganizationName = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: White;
  margin-left:2em;
`;

const OrganizationType = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const Location = styled.p`
  font-size: 1rem;
  margin-left:2em;
  color:Wheat;
`;
const AlternatingSection = styled.div`
  display: flex;
  flex-direction: ${({ alignRight }) => (alignRight ? 'row-reverse' : 'row')};
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 1.5em;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
`;

const SectionContent = styled.ol`
  font-size: 1.2rem;
  color: #ddd;
  line-height: 1.8;
  padding: 0 1.5rem;
  list-style-position: inside;
  margin: 0;
`;

const SectionListItem = styled.li`
  margin-bottom: 1rem;
  font-weight: normal;

  & > strong {
    font-weight: bold;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  color: white;
  margin-bottom: 1rem;
  text-align: center;
`;

const SectionContainer = styled.div`
  width: 60%;
  background-color: #1e1e1e;
  border-radius:1em;
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align all items to the left */
  padding-left:4em;
  margin-top: 1rem;
  gap: 0.5rem; /* Add gap between items */
  padding-bottom:1em;
`;

const ItemHeader = styled.p`
  font-size: 1.3rem;
  font-weight:bold;
  color: #ccc;
  margin: 0;
  padding-right:.5em;
`;

const ItemValue = styled.p`
  font-size: 1.1rem;
  color: #ccc;
  margin: 0;
`;
const Item = styled.div`
display:flex;
`

const SocialLink = styled.a`
  color: #007BFF;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;


const DocumentLink = styled.a`
  color: #007BFF;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
const PapersContainer = styled.div`
display: flex;
flex-direction: column;
width: 100%;
margin-top: 2rem;
`;

const PapersList = styled.ul`
list-style-type: none; /* Remove default list styling */
padding: 0;
margin: 0;
`;

const PaperItem = styled.li`
font-size: 1.1rem;
color: #ccc;
margin-bottom: 0.5rem;
`;

const PaperLink = styled.a`
color: #007BFF;
text-decoration: none;
&:hover {
  text-decoration: underline;
}
`;


const OrganizationProfile = () => {
  // Hard-coded organization details
  const organization = {
    org_name: 'KAI Labs',
    org_type: 'AI Development Firm',
    org_desc: `
    Computer Vision Solutions: We create models that excel at recognizing and interpreting visual data. Our computer vision algorithms are designed for tasks such as image classification, object recognition, facial analysis, emotion detection, and anomaly detection.

    Advanced Research in Image Analysis: KAI AI Labs is committed to advancing the frontiers of image-based AI. Our research team continuously works on enhancing the efficiency and reliability of AI models using innovative techniques like convolutional neural networks (CNN), generative adversarial networks (GAN), and unsupervised learning methods.

    Healthcare Imaging: In the healthcare domain, we leverage medical image datasets to develop AI models that assist in diagnostics, early detection of diseases, and personalized treatment plans. Our AI-driven imaging solutions contribute to faster and more accurate diagnoses in radiology, dermatology, and other critical fields.

    Autonomous Systems & Smart Infrastructure: We work on developing vision-based solutions for autonomous vehicles, drones, and robotics. Our AI models analyze real-time image data to enhance safety, navigation, and efficiency in these systems. Moreover, our smart infrastructure solutions enable cities to adopt AI-powered surveillance and monitoring capabilities.

    Data Annotation & Model Enhancement: We focus on curating high-quality image datasets and meticulously annotating them to train precise AI models. Additionally, our lab specializes in transfer learning and fine-tuning of existing models, enabling faster deployment with optimized performance.
  `,org_location: 'Hyderabad, India',
    org_mail: 'team@KaiLabs.com',
    contact_person: 'Vinay Thadem',
    contact_role: 'Chief Executive Officer',
    contact_phone: '+1-1234567890',
    org_social_links: 'https://www.linkedin.com/company/KAI-labs',
    previous_works: 'AI-driven chatbot solutions, Predictive maintenance for manufacturing, Automated video analysis tool',
    patents: 'US-123456789, US-987654321',
    owner_verification: 'https://example.com/documents/verification.pdf', // Replace with your actual PDF link
    owner_linkedin: 'https://www.linkedin.com/in/janedoe',
  };

  return (
    <>
    <OrgHeader>
        <HeaderTopRow>
        <OrganizationName>{organization.org_name}</OrganizationName>
        <Location>{organization.org_location}</Location>
        </HeaderTopRow>
    </OrgHeader>
    <ProfileContainer>

    <AlternatingSection alignRight={false}>
    <SectionContainer>
      <SectionTitle>About Us</SectionTitle>
      <SectionContent>
        <SectionListItem>
          <strong>Computer Vision Solutions:</strong> Creating AI models for image classification, object recognition, and facial analysis.
        </SectionListItem>
        <SectionListItem>
          <strong>Advanced Research in Image Analysis:</strong> Advancing AI models with innovative techniques like CNN, GAN, and unsupervised learning.
        </SectionListItem>
        <SectionListItem>
          <strong>Healthcare Imaging:</strong> Developing AI solutions for diagnostics and personalized treatment in radiology and other fields.
        </SectionListItem>
        <SectionListItem>
          <strong>Autonomous Systems & Smart Infrastructure:</strong> Building vision-based AI for autonomous vehicles, drones, and smart city infrastructure.
        </SectionListItem>
        <SectionListItem>
          <strong>Data Annotation & Model Enhancement:</strong> Curating high-quality datasets and enhancing AI models through transfer learning and fine-tuning.
        </SectionListItem>
      </SectionContent>
    </SectionContainer>
  </AlternatingSection>

  <AlternatingSection alignRight={true}>
  <SectionContainer>
        <SectionTitle>Contact Information</SectionTitle>
        <ContactDetails>
            <Item>
                <ItemHeader>Email:</ItemHeader>
                <ItemValue> {organization.org_mail}
                </ItemValue>
            </Item>   
            
            <Item>
                <ItemHeader>LinkedIn:</ItemHeader>
            <SocialLink href={organization.org_social_links} target="_blank" rel="noopener noreferrer">
              {organization.org_social_links}
            </SocialLink>
            </Item>
            <Item>
                <ItemHeader>Website Link:</ItemHeader>
                <SocialLink href={"https://kaiLabs.com/"} target="_blank" rel="noopener noreferrer">
                https://kaiLabs.com/
            </SocialLink>
            </Item>   
            
            <Item>
                <ItemHeader>Founder Name:</ItemHeader>
                <ItemValue> Vinay Thadem
                </ItemValue>
            </Item>   
            <Item>
                <ItemHeader>Founder LinkedIn:</ItemHeader>
                <SocialLink href={"https://www.linkedin.com/company/vinaythadem"} target="_blank" rel="noopener noreferrer">
                https://www.linkedin.com/company/vinaythadem
            </SocialLink>
            </Item>   
            <Item>
                <ItemHeader>Contact Person:</ItemHeader>
                <ItemValue> Anirudh Thadem
                </ItemValue>
            </Item>  
            <Item>
                <ItemHeader>Role/Title: </ItemHeader>
                <ItemValue> {organization.contact_role}
                </ItemValue>
            </Item>  
            <Item>
                <ItemHeader>Contact: </ItemHeader>
                <ItemValue> {organization.contact_phone}
                </ItemValue>
            </Item>  
        </ContactDetails>
      </SectionContainer>
      </AlternatingSection>
      <AlternatingSection alignRight={false}>
      <SectionContainer>
        <SectionTitle>Organisation Incorporation Details</SectionTitle>
        <ContactDetails>
            <Item>
                <ItemHeader>Organisation Registration Number: </ItemHeader>
                <ItemValue> L21091KA2019OPC141331</ItemValue>
            </Item>
            <Item>
                <ItemHeader>Organisation Incorporation Date: </ItemHeader>
                <ItemValue> 22-02-2000</ItemValue>
            </Item>
        </ContactDetails>
      </SectionContainer>
      </AlternatingSection>
      <AlternatingSection alignRight={true}>
      <SectionContainer>
        <SectionTitle>Research Papers and Patents</SectionTitle>
        <PapersContainer>
            <PapersList>
            <PaperItem>
                <PaperLink href="https://example.com/paper1" target="_blank" rel="noopener noreferrer">
                Paper Title 1 - Journal Name, Year
                </PaperLink>
            </PaperItem>
            <PaperItem>
                <PaperLink href="https://example.com/patent1" target="_blank" rel="noopener noreferrer">
                Patent Title 1 - US-123456789
                </PaperLink>
            </PaperItem>
            <PaperItem>
                <PaperLink href="https://example.com/paper2" target="_blank" rel="noopener noreferrer">
                Paper Title 2 - Conference Name, Year
                </PaperLink>
            </PaperItem>
            </PapersList>
        </PapersContainer>
        </SectionContainer>

      </AlternatingSection>
      <AlternatingSection alignRight={false}>
      <SectionContainer>
    <SectionTitle>Trained Models on the Network</SectionTitle>
    <PapersContainer>
      <PapersList>
        <PaperItem>
          <PaperLink href="https://example.com/model1" target="_blank" rel="noopener noreferrer">
            Object Detection Model 
          </PaperLink>
        </PaperItem>
        <PaperItem>
          <PaperLink href="https://example.com/model2" target="_blank" rel="noopener noreferrer">
            Facial Recognition Model 
          </PaperLink>
        </PaperItem>
        <PaperItem>
          <PaperLink href="https://example.com/model3" target="_blank" rel="noopener noreferrer">
            Medical Imaging Model
          </PaperLink>
        </PaperItem>
      </PapersList>
    </PapersContainer>
  </SectionContainer>
      </AlternatingSection>
    </ProfileContainer>
    </>
  );
};

export default OrganizationProfile;
