import React, { useEffect, useState } from 'react';
import API_UTIL from '../../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';
import AppBar from '../../../components/AppBar/AppBar';
import { Plus, Trash2, X, CheckCircle, Mail, Globe, MapPin, Search } from 'lucide-react';
import { RiGithubFill } from "react-icons/ri";
import { GrLinkedin } from "react-icons/gr";
import LoadingSpinner from '../../../components/Loader/LoadingSpinner';

const ModelPage = styled.div`
  background-color: #121212;
  min-height: 100vh;
  color: #ffffff;
  font-family: 'Arial', sans-serif;
`;

const ContentWrapper = styled.div`
  display: flex;
  padding: 1rem;
  gap: 1rem;
  max-width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0.5rem;
  }
`;

const SidePanel = styled.div`
  flex: 0 0 300px;
  background-color: #1e1e1e;
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const CustomSelect = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #232323;
  border: none;
  border-bottom: 1px solid #3a3a3a;
  color: #ffffff;
  font-size: 1rem;

  &:focus {
    outline: none;
  }
`;


const SelectButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #00ffff;
  }
`;


const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`;

const OptionsList = styled.div`
  max-height: 150px;
  overflow-y: auto;

  /* Webkit browsers (Chrome, Safari) */
  &::-webkit-scrollbar {
    width: 8px;
    background-color: #1e1e1e;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4a4a4a;
    border-radius: 4px;
    
    &:hover {
      background-color: #5a5a5a;
    }
  }

  &::-webkit-scrollbar-track {
    background-color: #2a2a2a;
    border-radius: 4px;
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #4a4a4a #2a2a2a;

`;

const Option = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  color: #ffffff;

  &:hover {
    background-color: #3a3a3a;
  }
`;

const CustomCategoryInput = styled.input`
  width: 100%;
  max-width: 95%;
  padding: 0.75rem;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: #00ffff;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  background-color: #1e1e1e;
  border-radius: 1rem;
  padding: 1.5rem;
`;

const OrgTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #00ffff;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: white;
  margin-bottom: 0.75rem;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }
`;

const ModelList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ModelCard = styled(motion.div)`
  background-color: #2a2a2a;
  border-radius: 0.75rem;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
`;

const ModelName = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #00ffff;
`;

const ModelInfo = styled.p`
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: #ffffff;
`;

const AuditStatus = styled.span`
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  background-color: ${props => props.isAudited ? '#4CAF50' : '#FFC107'};
  color: #000000;
`;

const DeleteIcon = styled(Trash2)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: #FD4D77;
  cursor: pointer;
`;

const CreateModelCard = styled(ModelCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #121212;
  box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
`;

const AddModelIcon = styled(Plus)`
  width: 3rem;
  height: 3rem;
  color: #00ffff;
  margin-bottom: 1rem;
`;

const StyledModal = styled(Modal)`
  background-color: #1e1e1e;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  margin: 2rem auto;
  outline: none;
  color: #ffffff;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #00ffff;
`;

const CloseButton = styled(X)`
  cursor: pointer;
  color: #ffffff;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
`;

const SubmitButton = styled.button`
  background: linear-gradient(90deg, #66D3FF, #9A6AFF);
  color: #ffffff;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const DeleteModalContent = styled.div`
  text-align: center;
`;

const DeleteMessage = styled.p`
  text-align: center;
  margin: 1rem 0;
`;

const SuccessIcon = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const DeleteButton = styled.button`
  background-color: #FD4D77;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const CancelButton = styled(DeleteButton)`
  background-color: #2a2a2a;
`;

const Model = () => {
  const [modelsList, setModelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const orgName = localStorage.org_name || userDetails?.org_name || '';
  const labelStyle = { color: '#ffffff' };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    org_name: orgName,
    model_name: '',
    model_category: '',
    model_url: '',
    model_desc: ''
  });

  const categories = [
    "Faces Data",
    "Image Processing",
    "Natural Language Processing",
    "Computer Vision",
    "Machine Learning",
    "Deep Learning",
    "Data Analysis",
    "Robotics",
    "Other"
  ];


  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'Other') {
      setFormData(prevState => ({
        ...prevState,
        model_category: customCategory || 'Other'
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        model_category: category
      }));
    }
    setIsDropdownOpen(false);
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData(prevState => ({
      ...prevState,
      model_category: value
    }));
  };
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const userPhoneNumber = localStorage.userPhoneNumber;
      const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
      setUserDetails(response.data.data);
      fetchModels(response.data.data.org_name);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (orgName) => {
    try {
      const response = await API_UTIL.get(`/getModels/${orgName}`);
      setModelsList(response.data);
    } catch (error) {
      console.error("Error fetching models:", error);
      setError('Failed to fetch models');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDetailFormSubmit = async (e) => {
    e.preventDefault();
  
    const userPhoneNumber = localStorage.userPhoneNumber;
  
    if (!userPhoneNumber) {
      toast.error("User phone number is missing from session.");
      return;
    }
  
    const modelData = {
      ...formData,
      org_name: orgName,  
      is_audited: false,  
      model_category: selectedCategory === 'Other' ? customCategory : selectedCategory
    };
  
    try {
      const response = await API_UTIL.post('/saveModelDetails', modelData);
  
      if (response.status === 200) {
        toast.success("Task created successfully");
        setIsDetailModalOpen(false);
        fetchModels(userDetails.org_name);
        setFormData({
          model_name: '',
          model_category: '',
          model_url: '',
          model_desc: ''
        });
        setSelectedCategory('');
        setCustomCategory('');
      } else {
        throw new Error('Failed to save the Task');
      }
    } catch (error) {
      console.error('Error saving form data to backend:', error);
      toast.error('Failed to save the Task. Please try again.');
    }
  };

  const openDeleteModal = (e, model) => {
    e.stopPropagation();
    setModelToDelete(model);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setModelToDelete(null);
  };

  const deleteModel = async () => {
    try {
      setDeleteMessage("Deleting Task...");
      await API_UTIL.delete(`/deleteModel/${modelToDelete.model_name}/${modelToDelete.org_name}`);
      setModelsList(modelsList.filter(model => model.model_name !== modelToDelete.model_name));
      setDeleteMessage('Task deleted successfully');
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setIsDeleteModalOpen(false);
        setDeleteMessage("");
        setShowSuccessAnimation(false);
      }, 2000);
    } catch (error) {
      console.error("Error deleting Task:", error);
      toast.error('Failed to delete the Task. Please try again.');
    }
  };

  const handleModelClick = (model) => {
    navigate(`/modelDetails/${userDetails.org_name}/${model.model_name}`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <ModelPage>
      <AppBar showCoins={true} />
      <ContentWrapper>
        <SidePanel>
          <OrgTitle onClick={()=>navigate('/orgProfile')}> {userDetails.org_name}</OrgTitle>
          <InfoItem>
            Technology, Information and Internet
          </InfoItem>
          <InfoItem>
            <MapPin size={18} />
            Hyderabad, India
          </InfoItem>
          <InfoItem>
            <Mail size={18} />
            {userDetails.org_email}
          </InfoItem>
          <InfoItem>
            <Globe size={18} />
            {userDetails.website_url}
          </InfoItem>
          <InfoItem>
            <GrLinkedin size={18}/>
            {userDetails.founder_linkedinUrl}
          </InfoItem>
        </SidePanel>
        <MainContent>
          <OrgTitle>Tasks</OrgTitle>
          <ModelList>
            <CreateModelCard
              onClick={() => setIsDetailModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AddModelIcon />
              <span>Add Task</span>
            </CreateModelCard>
            {modelsList.map((model) => (
              <ModelCard key={model.model_name} onClick={() => handleModelClick(model)}>
                <ModelName>{model.model_name}</ModelName>
                <ModelInfo>Category: {model.model_category}</ModelInfo>
                <ModelInfo>
                  Audit Status: <AuditStatus isAudited={model.is_audited}>{model.is_audited ? 'Audited' : 'Not Audited'}</AuditStatus>
                </ModelInfo>
                <ModelInfo>
                  <a href={model.model_url} target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>
                    <RiGithubFill size={16} style={{ marginRight: '0.5rem' }} />
                    Repository
                  </a>
                </ModelInfo>
                <DeleteIcon onClick={(e) => openDeleteModal(e, model)} />
              </ModelCard>
            ))}
          </ModelList>
        </MainContent>
      </ContentWrapper>

      <StyledModal
        isOpen={isDetailModalOpen}
        onRequestClose={() => setIsDetailModalOpen(false)}
        contentLabel="Create Model"
      >
        <ModalHeader>
          <ModalTitle>Create New Task</ModalTitle>
          <CloseButton onClick={() => setIsDetailModalOpen(false)} />
        </ModalHeader>
        <Form onSubmit={handleDetailFormSubmit}>
          <LabelAndInput
            label="Task Name"
            name="model_name"
            value={formData.model_name}
            handleChange={handleInputChange}
            isRequired={true}
            isEditable={true}
            style={labelStyle}
          />
      <div>
        <label htmlFor="model_category">Task Category</label>
        <SelectWrapper>
          <CustomSelect>
            <SelectButton
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedCategory || 'Select a category'}
            </SelectButton>
            {isDropdownOpen && (
              <DropdownMenu>
                <SearchInput
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <OptionsList>
                  {filteredCategories.map((category) => (
                    <Option
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </Option>
                  ))}
                </OptionsList>
              </DropdownMenu>
            )}
          </CustomSelect>
          {selectedCategory === 'Other' && (
            <CustomCategoryInput
              type="text"
              placeholder="Enter custom category"
              value={customCategory}
              onChange={handleCustomCategoryChange}
              required
            />
          )}
        </SelectWrapper>
      </div>
          <LabelAndInput
          label="Repository URL"
          name="model_url"
          value={formData.model_url}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
          style={labelStyle}
        />
        <LabelAndInput
          label="Task Description"
          name="model_desc"
          value={formData.model_desc}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
          style={labelStyle}
        />
        <SubmitButton type="submit">Create Task</SubmitButton>
      </Form>
    </StyledModal>

    <StyledModal
      isOpen={isDeleteModalOpen}
      onRequestClose={closeDeleteModal}
      contentLabel="Delete Confirmation"
    >
      <DeleteModalContent>
        <ModalHeader>
          <ModalTitle>Confirm Delete</ModalTitle>
        </ModalHeader>
        {deleteMessage ? (
          <>
            <DeleteMessage>{deleteMessage}</DeleteMessage>
            {showSuccessAnimation && (
              <SuccessIcon
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle size={48} color="#00ffff" />
              </SuccessIcon>
            )}
          </>
        ) : (
          <>
            <p>Are you sure you want to delete this Task?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <DeleteButton onClick={deleteModel}>Confirm</DeleteButton>
              <CancelButton onClick={closeDeleteModal}>Cancel</CancelButton>
            </div>
          </>
        )}
      </DeleteModalContent>
    </StyledModal>
  </ModelPage>
);
};

export default Model;