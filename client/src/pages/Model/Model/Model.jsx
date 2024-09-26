import React, { useEffect, useState } from 'react';
import API_UTIL from '../../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import './Model.css'; // Import the new CSS file
import { useNavigate } from 'react-router-dom';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';
import OrgHeader from '../../../components/OrgHeader/OrgHeader';

const Model = () => {
  const [modelsList, setModelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    org_name: '',
    org_desc: '',
    established_nation: '',
    website_url: '',
    org_email: '',
    founder_name: '',
    founder_linkedinUrl: '',
    founder_email: '',
    founder_contactNo: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventData = async (userName) => {
      try {
        const response = await API_UTIL.get(`/getModels/${userName}`);
        setModelsList(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userPhoneNumber = localStorage.userPhoneNumber;
        const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
        setUserDetails(response.data.data);
        if (sessionStorage.getItem('userphoneNumber') !== response.data.data.user_name) {
          fetchEventData(response.data.data.user_name);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLinkClick = () => {
    const clientName = userDetails.user_name;
    const sessionNumber = localStorage.userPhoneNumber;
    if (clientName === sessionNumber) {
      openIsDetailsModalOpen();
    } else {
      navigate(`/modelForm/${userDetails.user_name}`, { state: { userDetails } });
    }
  };

  const openIsDetailsModalOpen = () => {
    setIsDetailModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
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

    const updateData = {
      user_phone_number: userPhoneNumber,
      user_name: formData.org_name,
      ...formData,
    };

    try {
      const response = await API_UTIL.post('/updateUserDetails', updateData);
      if (response.status === 200) {
        setUserDetails(response.data.data);
        toast.success("User details updated successfully");
        navigate(`/modelForm/${response.data.data.user_name}`, { state: { userDetails } });
      } else {
        toast.error("Failed to update user details. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const openDeleteModal = (event) => {
    setModelToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setModelToDelete(null);
  };

  const deleteModel = async (modelName, orgName) => {
    try {
      await API_UTIL.delete(`/deleteModel/${modelName}/${orgName}`);
      setModelsList(modelsList.filter(model => !(model.model_name === modelName && model.org_name === orgName)));
      setIsDeleteModalOpen(false);
      toast.success('Model deleted successfully');
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error('Failed to delete the event. Please try again.');
    }
  };

  const onModelClick = (modelName) => {
    navigate(`/modelDetails/${userDetails.user_name}/${modelName}`, { state: { userDetails } });
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (error) return <div className="loading-screen">Error: {error}</div>;

  return (
    <div className="models-page-root">
      {userDetails.org_name && <OrgHeader orgObj={userDetails} />}
      
      <div className="models-page-model-container">
        <h1 className="models-page-model-title">My Models</h1>
        
        <div className="models-page-model-list">
          <div
            className="models-page-create-model-card"
            onClick={handleLinkClick}
          >
            <div className="models-page-add-model-image-div">
              <img src="assets/Images/icon-plus.svg" alt="img" />
            </div>
            <span>Click here to Add Model</span>
          </div>
          {modelsList.map((model) => (
            <div
              className="models-page-model-card"
              key={model.model_name}
              onClick={() => onModelClick(model.model_name)}
            >
              <div className="model-card-header">
                <img
                  src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(model);
                  }}
                  alt="Delete"
                />
              </div>
              <img src="/modelIcon.jpg" alt="img" />
              <div className="model-name">
                <span>{model?.model_name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <Modal
          isOpen={isDetailModalOpen}
          onRequestClose={() => setIsDetailModalOpen(false)}
          contentLabel="Model Details"
          className="modal-content model-modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-header">
            <h2 className="modal-title">Model Details</h2>
            <button className="close-button" onClick={() => setIsDetailModalOpen(false)}>x</button>
          </div>
          <form onSubmit={handleDetailFormSubmit} className="modal-body">
            <LabelAndInput
              htmlFor="org_name"
              label="Organisation Name:"
              type="text"
              id="org_name"
              name="org_name"
              placeholder="Please enter your Organisation name"
              value={formData.org_name}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="org_desc"
              label="Organisation Description:"
              type="text"
              id="org_desc"
              name="org_desc"
              placeholder="Please enter your Organisation Description"
              value={formData.org_desc}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="established_nation"
              label="Established Nation:"
              type="text"
              id="established_nation"
              name="established_nation"
              placeholder="Enter the nation where the organisation was established"
              value={formData.established_nation}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="website_url"
              label="Website URL:"
              type="text"
              id="website_url"
              name="website_url"
              placeholder="Provide your website URL"
              value={formData.website_url}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="org_email"
              label="Organisation Email:"
              type="email"
              id="org_email"
              name="org_email"
              placeholder="Enter the organisation's email address"
              value={formData.org_email}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="founder_name"
              label="Founder Name:"
              type="text"
              id="founder_name"
              name="founder_name"
              placeholder="Enter the founder's name"
              value={formData.founder_name}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="founder_linkedinUrl"
              label="Founder LinkedIn URL:"
              type="text"
              id="founder_linkedinUrl"
              name="founder_linkedinUrl"
              placeholder="Provide the LinkedIn URL of the founder"
              value={formData.founder_linkedinUrl}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="founder_email"
              label="Founder Email:"
              type="email"
              id="founder_email"
              name="founder_email"
              placeholder="Enter the founder's email address"
              value={formData.founder_email}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <LabelAndInput
              htmlFor="founder_contactNo"
              label="Founder Contact No:"
              type="text"
              id="founder_contactNo"
              name="founder_contactNo"
              placeholder="Enter the founder's contact number"
              value={formData.founder_contactNo}
              handleChange={handleInputChange}
              isRequired={true}
              isEditable={true}
            />
            <button type="submit" className="save-button">Submit</button>
          </form>
        </Modal>
        
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeDeleteModal}
          contentLabel="Delete Confirmation"
          className="delete-modal-content"
          overlayClassName="modal-overlay"
        >
          <div className='delete-modal-bg'>
            <h2 className="modal-title">Confirm Delete</h2>
            <p className="modal-body">Do you want to delete this Model?</p>
            <div className="modal-footer">
              <button className="delete-button" onClick={() => deleteModel(modelToDelete.model_name, modelToDelete.org_name)}>Confirm</button>
              <button className="cancel-button" onClick={closeDeleteModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Model;
