import React, { useEffect, useState } from 'react';
import API_UTIL from '../../../services/AuthIntereptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import './Dataset.css'; // Import the new CSS file
import { useNavigate } from 'react-router-dom';
import OrgHeader from '../../../components/OrgHeader/OrgHeader';

const Dataset = () => {
  const [datasetList, setDatasetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const userPhoneNumber =localStorage.userPhoneNumber;

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
        const response = await API_UTIL.get(`/getDatasets/${userName}`);
        setDatasetList(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        
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

  }, [userPhoneNumber]);

  const handleLinkClick = () => {
    const clientName = userDetails.user_name;
    const sessionNumber =localStorage.userPhoneNumber;
    if (clientName === sessionNumber) {
      openIsDetailsModalOpen();
    } else {
      navigate(`/datasetForm/${userDetails.user_name}`,  { state: { userDetails } })
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

    const userPhoneNumber =localStorage.userPhoneNumber;

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
        navigate(`/datasetForm/${response.data.data.user_name}`, { state: { userDetails } });
      } else {
        toast.error("Failed to update user details. Please try again.");
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const openDeleteModal = (event) => {
    setDatasetToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDatasetToDelete(null);
  };

  const deleteDataset = async (datasetName, orgName) => {
    try {
      await API_UTIL.delete(`/deleteDataset/${datasetName}/${orgName}`);
      setDatasetList(datasetList.filter(dataset => !(dataset.dataset_name === datasetName && dataset.org_name === orgName)));
      setIsDeleteModalOpen(false);
      toast.success('Dataset deleted successfully');
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error('Failed to delete the event. Please try again.');
    }
  };

  const onDataSetClick = (datasetName) => {
    navigate(`/datasetDetails/${userDetails.org_name}/${datasetName}`, { state: { userDetails } });
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (error) return <div className="loading-screen">Error: {error}</div>;

  return (
    <div className='datasets-page-root'>
    {userDetails.org_name && <OrgHeader orgObj={userDetails}/>}
    
    <div className="datasets-page-dataset-container">
    <h1 className="datasets-page-dataset-title ">My Datasets</h1>
      
      <div className = 'datasets-page-dataset-list'>
        <div
          className="datasets-page-create-dataset-card"
          // onClick={() => setIsCreateModalOpen(true)}
          onClick={ handleLinkClick}
        >
          <div className="datasets-page-add-dataset-image-div">
            <img src="assets/Images/icon-plus.svg" alt="img" />
          </div>
          <span>Click here to Add Dataset</span>
        </div>
        {datasetList.map((dataset) => (
          <div
            className="datasets-page-dataset-card"
            key={dataset.dataset_name} // Add key to each event card
            onClick={() => onDataSetClick(dataset.dataset_name)}
          >
            <div className="dataset-card-header">
              <img
                src="https://img.icons8.com/BB271A/m_rounded/2x/filled-trash.png"
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(dataset);
                }}
                alt="Delete"
              />
            </div>
            <img src="/datasetIcon.jpg" alt="img" />
            <div className="dataset-name">
              <span>{dataset?.dataset_name}</span>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={isDetailModalOpen}
        onRequestClose={() => setIsDetailModalOpen(false)}
        contentLabel="Dataset Details"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2 className="modal-title">Dataset Details</h2>
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
          <p className="modal-body">Do you want to delete this Dataset?</p>
          <div className="modal-footer">
            <button className="delete-button" onClick={() => deleteDataset(datasetToDelete.dataset_name, datasetToDelete.org_name)}>Confirm</button>
            <button className="cancel-button" onClick={closeDeleteModal}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>



    
    </div>
  );
}

export default Dataset;
