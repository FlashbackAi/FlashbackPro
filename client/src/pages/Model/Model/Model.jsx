import React, { useEffect, useState } from 'react';
import API_UTIL from '../../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import './Model.css'; // Import the new CSS file
import { useNavigate } from 'react-router-dom';
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
        const userPhoneNumber = sessionStorage.getItem('userphoneNumber');
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
    const sessionNumber = sessionStorage.getItem('userphoneNumber');
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

    const userPhoneNumber = sessionStorage.getItem('userphoneNumber');

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
    <>
    {userDetails.org_name && <OrgHeader orgObj={userDetails}/>}
    <div className="event-container">
      <h1 className="event-title">My Models</h1>
      <ul className="event-list">
        <li className="event-item" onClick={handleLinkClick}>
          <div className="event-card">
            <img src="https://img.icons8.com/B48E75/stamp/2x/add.png" alt="/img" className="add-event-image" />
            <div className="event-card-footer">
              <h2 className="event-name">Click here to Add Models</h2>
            </div>
          </div>
        </li>
        {modelsList.map((model) => (
          <li key={model.model_name} className="event-item">
            <div className="event-card" onClick={() => onModelClick(model.model_name)}>
              <div className="event-card-header">
                <img
                  src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
                  className="delete-icon"
                  onClick={(e) => { e.stopPropagation(); openDeleteModal(model); }}
                  alt="Delete"
                />
              </div>
              <img src='/datasetIcon.jpg' alt="/img" className="event-image" />
              <div className="event-card-footer">
                <h2 className="event-name">{model?.model_name}</h2>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={isDetailModalOpen}
        onRequestClose={() => setIsDetailModalOpen(false)}
        contentLabel="Dataset Details"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2 className="modal-title">Model Details</h2>
          <button className="close-button" onClick={() => setIsDetailModalOpen(false)}>x</button>
        </div>
        <form onSubmit={handleDetailFormSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Organisation Name:</label>
            <input
              type="text"
              name="org_name"
              value={formData.org_name}
              onChange={handleInputChange}
              placeholder='Please enter your Organisation name'
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Organisation Description:</label>
            <input
              type="text"
              name="org_desc"
              value={formData.org_desc}
              onChange={handleInputChange}

              className="form-input"
              requiredplaceholder='Please enter your Organisation Description'
            />
          </div>
          <div className="form-group">
            <label className="form-label">Establieshed Nation:</label>
            <input
              type="text"
              name="established_nation"
              value={formData.established_nation}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Website Url:</label>
            <input
              type="text"
              name="website_url"
              value={formData.website_url}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Organisation Email:</label>
            <input
              type="text"
              name="org_email"
              value={formData.org_email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Founder Name:</label>
            <input
              type="text"
              name="founder_name"
              value={formData.founder_name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Founder Linkedin Url:</label>
            <input
              type="text"
              name="founder_linkedinUrl"
              value={formData.founder_linkedinUrl}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Founder Email:</label>
            <input
              type="text"
              name="founder_email"
              value={formData.founder_email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Founder Contact No:</label>
            <input
              type="text"
              name="founder_contactNo"
              value={formData.founder_contactNo}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
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
    </>
  );
}

export default Model;