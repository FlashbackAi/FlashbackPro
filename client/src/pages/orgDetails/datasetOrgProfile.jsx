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

const OrganisationAbout = styled.span`
  margin-bottom: 1rem;
  font-weight: normal;
  font-size:1.2em;

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
const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem;
`;

const Tag = styled.span`
  background-color: #646566;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
`;

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


const DataSetOrganizationProfile = () => {
  // Hard-coded organization details
  const organization = {
    org_name: 'Flashback.Inc',
    org_type: 'AI Development Firm',
    org_desc: `
    Computer Vision Solutions: We create models that excel at recognizing and interpreting visual data. Our computer vision algorithms are designed for tasks such as image classification, object recognition, facial analysis, emotion detection, and anomaly detection.

    Advanced Research in Image Analysis: KAI AI Labs is committed to advancing the frontiers of image-based AI. Our research team continuously works on enhancing the efficiency and reliability of AI models using innovative techniques like convolutional neural networks (CNN), generative adversarial networks (GAN), and unsupervised learning methods.

    Healthcare Imaging: In the healthcare domain, we leverage medical image datasets to develop AI models that assist in diagnostics, early detection of diseases, and personalized treatment plans. Our AI-driven imaging solutions contribute to faster and more accurate diagnoses in radiology, dermatology, and other critical fields.

    Autonomous Systems & Smart Infrastructure: We work on developing vision-based solutions for autonomous vehicles, drones, and robotics. Our AI models analyze real-time image data to enhance safety, navigation, and efficiency in these systems. Moreover, our smart infrastructure solutions enable cities to adopt AI-powered surveillance and monitoring capabilities.

    Data Annotation & Model Enhancement: We focus on curating high-quality image datasets and meticulously annotating them to train precise AI models. Additionally, our lab specializes in transfer learning and fine-tuning of existing models, enabling faster deployment with optimized performance.
  `,org_location: 'Karimnagar, India',
    org_mail: 'team@Flashback.com',
    contact_person: 'Vinay Thadem',
    contact_role: 'Chief Executive Officer',
    contact_phone: '+91-9876543210',
    org_social_links: 'https://www.linkedin.com/company/FlashbackInc',
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
        <OrganisationAbout>Flashback.Inc is a super app for images, offering users a platform where they can:</OrganisationAbout>
        <SectionListItem>
          <strong>Create and organize events</strong> (e.g., weddings, birthdays, vacations) to capture memories in curated albums.   </SectionListItem>
        <SectionListItem>
          <strong>Upload and share personal photos</strong> with friends, family, and specific groups</SectionListItem>
        <SectionListItem>
          <strong>Curating Memories</strong>Creating Memories from the Images by Relationship and Sentiment Analysis</SectionListItem>

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
                <SocialLink href={"https://flashback.inc/"} target="_blank" rel="noopener noreferrer">
                https://flashback.inc/
            </SocialLink>
            </Item>   
            
            <Item>
                <ItemHeader>Founder Name:</ItemHeader>
                <ItemValue> Srikanth Alla
                </ItemValue>
            </Item>   
            <Item>
                <ItemHeader>Founder LinkedIn:</ItemHeader>
                <SocialLink href={"https://www.linkedin.com/company/srikanthalla"} target="_blank" rel="noopener noreferrer">
                https://www.linkedin.com/company/srikanthalla
            </SocialLink>
            </Item>   
            <Item>
                <ItemHeader>Contact Person:</ItemHeader>
                <ItemValue>Pranay Vollala
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
                <ItemValue>U74140KA2020PTC136426</ItemValue>
            </Item>
            <Item>
                <ItemHeader>Organisation Incorporation Date: </ItemHeader>
                <ItemValue> 26-01-2024</ItemValue>
            </Item>
        </ContactDetails>
      </SectionContainer>
      </AlternatingSection>
      <AlternatingSection alignRight={true}>
      <SectionContainer>
    <SectionTitle>Data On the Network</SectionTitle>
    <ContactDetails>
      <Item>
        <ItemHeader>No. Of Images:</ItemHeader>
        <ItemValue>1,000,000</ItemValue>
      </Item>
      <Item>
        <ItemHeader>No. of  Individual contributors</ItemHeader>
        <ItemValue>15000</ItemValue>
      </Item>
      <Item>
        <ItemHeader>No. of Models Trained on the dataset:</ItemHeader>
        <ItemValue>150</ItemValue>
      </Item>
      

    </ContactDetails>
    <TagsContainer>
      <Tag>Faces</Tag>
      <Tag>People</Tag>
      <Tag>Facial Landmarks</Tag>
      <Tag>Clothing</Tag>
      <Tag>Activities</Tag>
      <Tag>Scenes</Tag>
      <Tag>Environments</Tag>
      <Tag>Text in Images</Tag>
      <Tag>Emotions</Tag>
      <Tag>Gender</Tag>
      <Tag>Age</Tag>
      <Tag>Objects</Tag>
      <Tag>Wedding Data</Tag>
      <Tag>Colors</Tag>
      <Tag>Landmarks</Tag>
      <Tag>Places</Tag>
    </TagsContainer>

  </SectionContainer>
      </AlternatingSection>
    </ProfileContainer>
    </>
  );
};

export default DataSetOrganizationProfile;
