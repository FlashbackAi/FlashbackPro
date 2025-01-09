import React, { useState } from 'react';
import styled from 'styled-components';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';

// Styled Components
const FormContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const FormGroup = styled.form`
  width: 80%;
`;

const FormTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
`;

const FormStep = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const StepTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const Button = styled.button`
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const OrganizationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    org_name: '',
    org_type: '',
    org_desc: '',
    org_incorporation: '',
    org_location: '',
    org_mail: '',
    contact_person: '',
    contact_role: '',
    contact_phone: '',
    org_social_links: '',
    org_documents: '',
    previous_works: '',
    patents: '',
    owner_verification: '',
    owner_linkedin: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here (API call)
    console.log('Form Data Submitted:', formData);
  };

  return (
    <FormContainer>
      <FormTitle>Organization Onboarding</FormTitle>
      <FormGroup onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <FormStep>
            <StepTitle>Step 1: Enter Your Organization Details</StepTitle>
            <LabelAndInput
              htmlFor="org-name"
              label="Organization Name:"
              type="text"
              id="org-name"
              name="org_name"
              placeholder="Organization Name"
              value={formData.org_name}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="org-type"
              label="Organization Type:"
              type="text"
              id="org-type"
              name="org_type"
              placeholder="E.g., AI Development Firm, Research Institute"
              value={formData.org_type}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="org-desc"
              label="Organization Description:"
              type="text"
              id="org-desc"
              name="org_desc"
              placeholder="Brief description of your organization"
              value={formData.org_desc}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
             <LabelAndInput
              htmlFor="org-location"
              label="Location:"
              type="text"
              id="org-location"
              name="org_location"
              placeholder="Organization Location"
              value={formData.org_location}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <NavigationButtons>
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            </NavigationButtons>
          </FormStep>
        )}

        {currentStep === 2 && (
          <FormStep>
            <StepTitle>Step 2: Incorporation Details</StepTitle>
            <LabelAndInput
              htmlFor="org-incorporation"
              label="Registration Number:"
              placeholder="Organisation Registration Number"
              type="text"
              id="registration-number"
              name="registration_number"
              value={formData.org_incorporation}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="org-incorporation"
              label="Incorporation Date:"
              type="date"
              id="org-incorporation"
              name="org_incorporation"
              value={formData.org_incorporation}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="org-documents"
              label="Organization Incorporation Document:"
              type="file"
              id="org-documents"
              name="org_documents"
              placeholder="Organisation Incorporation Document"
              value={formData.org_documents}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
           
            <NavigationButtons>
              <Button type="button" onClick={prevStep}>
                Previous
              </Button>
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            </NavigationButtons>
          </FormStep>
        )}

        {currentStep === 3 && (
          <FormStep>
            <StepTitle>Step 3: Organizational Communication </StepTitle>
            <LabelAndInput
              htmlFor="org-mail"
              label="Organization Mail ID:"
              type="email"
              id="org-mail"
              name="org_mail"
              placeholder="Provide Organization Mail ID"
              value={formData.org_mail}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="org-social-links"
              label="Organization LinkedIn Link:"
              type="text"
              id="org-social-links"
              name="org_social_links"
              placeholder="Provide LinkedIn link"
              value={formData.org_social_links}
              handleChange={handleInputChange}
              isRequired={false}
              isEditable={true}
            />
            
            <LabelAndInput
              htmlFor="owner-linkedin"
              label="Owner LinkedIn Profile:"
              type="text"
              id="owner-linkedin"
              name="owner_linkedin"
              placeholder="LinkedIn profile link"
              value={formData.owner_linkedin}
              handleChange={handleInputChange}
              isRequired={false}
              isEditable={true}
            />
            
            <NavigationButtons>
              <Button type="button" onClick={prevStep}>
                Previous
              </Button>
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            </NavigationButtons>
          </FormStep>
        )}


        {currentStep === 4 && (
          <FormStep>
            <StepTitle>Step 4: Contact Information</StepTitle>
            <LabelAndInput
              htmlFor="contact-person"
              label="Primary Contact Name:"
              type="text"
              id="contact-person"
              name="contact_person"
              placeholder="Name of the primary contact person"
              value={formData.contact_person}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="contact-role"
              label="Role/Title:"
              type="text"
              id="contact-role"
              name="contact_role"
              placeholder="Role/Title of the contact person"
              value={formData.contact_role}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="contact-phone"
              label="Contact Phone:"
              type="tel"
              id="contact-phone"
              name="contact_phone"
              placeholder="Contact person's phone number"
              value={formData.contact_phone}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <NavigationButtons>
              <Button type="button" onClick={prevStep}>
                Previous
              </Button>
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            </NavigationButtons>
          </FormStep>
        )}

       
        {currentStep === 5 && (
          <FormStep>
            <StepTitle>Step 5: Previous Works and Patents</StepTitle>
            <LabelAndInput
              htmlFor="previous-works"
              label="Previous Works by Organization:"
              type="text"
              id="previous-works"
              name="previous_works"
              placeholder="Portfolio or past projects"
              value={formData.previous_works}
              handleChange={handleInputChange}
              isRequired={false}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="patents"
              label="Patents or Published Papers:"
              type="text"
              id="patents"
              name="patents"
              placeholder="Any patents or published works"
              value={formData.patents}
              handleChange={handleInputChange}
              isRequired={false}
              isEditable={true}
            />
            <NavigationButtons>
              <Button type="button" onClick={prevStep}>
                Previous
              </Button>
              <Button type="submit">Submit</Button>
            </NavigationButtons>
          </FormStep>
        )}
{/* 
        {currentStep === 6 && (
          <FormStep>
            <StepTitle>Step 6: Owner Verification and LinkedIn</StepTitle>
            <LabelAndInput
              htmlFor="owner-verification"
              label="Owner Verification Documents:"
              type="file"
              id="owner-verification"
              name="owner_verification"
              placeholder="Owner's legal documents"
              value={formData.owner_verification}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="owner-linkedin"
              label="Owner LinkedIn Profile:"
              type="text"
              id="owner-linkedin"
              name="owner_linkedin"
              placeholder="LinkedIn profile link"
              value={formData.owner_linkedin}
              handleChange={handleInputChange}
              isRequired={false}
              isEditable={true}
            />
            <NavigationButtons>
              <Button type="button" onClick={prevStep}>
                Previous
              </Button>
              <Button type="submit">Submit</Button>
            </NavigationButtons>
          </FormStep>
        )} */}
      </FormGroup>
    </FormContainer>
  );
};

export default OrganizationForm;
