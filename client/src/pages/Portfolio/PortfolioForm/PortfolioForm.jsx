import React, { useState } from 'react';
import './PortfolioForm.css';
import API_UTIL from '../../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PortfolioForm = () => {
  const userPhoneNumber = sessionStorage.getItem('userphoneNumber');

  const [formData, setFormData] = useState({
    user_phone_number: userPhoneNumber,
    user_name: '',
    social_media: {
      instagram: '',
      youtube: '',
    },
    org_name: '',
  });

  const [folders, setFolders] = useState([]);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFolderNameChange = (index, event) => {
    const { value } = event.target;
    const updatedFolders = [...folders];
    updatedFolders[index].folderName = value;
    setFolders(updatedFolders);
  };

  const handleImageUpload = (index, event) => {
    const files = Array.from(event.target.files);
    const updatedFolders = [...folders];
    updatedFolders[index].images = [...(updatedFolders[index].images || []), ...files];
    setFolders(updatedFolders);
  };

  const addFolder = () => {
    setFolders([...folders, { folderName: '', images: [] }]);
  };

  const saveUploadedImages = async () => {
    const data = new FormData();
    data.append('user_phone_number', formData.user_phone_number);
    data.append('user_name', formData.user_name);
    data.append('org_name', formData.org_name);

    folders.forEach((folder) => {
      folder.images.forEach((image) => {
        data.append(`${folder.folderName}_images`, image); // Include folder name in the form data
      });
    });

    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    try {
      const response = await API_UTIL.post('/uploadPortfolioImages', data, { headers });
      
      if (response.status !== 200) {
        throw new Error('Failed to save images');
      }

      const result = response.data;
      console.log('Save result:', result);
      return result;
    } catch (error) {
      console.error('Error in saveUploadedImages:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const requestData = {
        user_phone_number: formData.user_phone_number,
        ...formData
      };

      console.log('Sending request to server with data:', requestData);

      const res = await API_UTIL.post("/updateUserDetails", requestData);
      if (res.status === 200) {
        await saveUploadedImages();
        navigate(`/portfolio`);
      }
    } catch (error) {
      console.error("Error in registering the model:", error);
      if (error.response) {
        toast.error("Error in creating Model");
      }
    }
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      social_media: {
        ...prevData.social_media,
        [name]: value,
      },
    }));
  };

  return (
    <div className="create-event-container">
      <h1 className="form-title">Create Model</h1>
      <form className="invitation-form" id="invitation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="event-name">Photography Name:</label>
          <input
            type="text"
            id="event-name"
            name="org_name"
            placeholder="Enter your Studio Name"
            value={formData.org_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-name">User Name:</label>
          <input
            type="text"
            id="event-name"
            name="user_name"
            placeholder="Enter your Name"
            value={formData.user_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-date">Instagram URL:</label>
          <input
            type="text"
            id="event-date"
            name="instagram"
            placeholder="Provide your Instagram URL"
            value={formData.social_media.instagram}
            onChange={handleSocialMediaChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-location">YouTube URL:</label>
          <input
            type="text"
            id="event-location"
            name="youtube"
            placeholder="Provide your YouTube URL"
            value={formData.social_media.youtube}
            onChange={handleSocialMediaChange}
            required
          />
        </div>

        <div className="form-group">
          <button type="button" onClick={addFolder} className="add-folder-button">Add Folder</button>
        </div>

        {folders.map((folder, index) => (
          <div key={index} className="folder-section">
            <div className="form-group">
              <label htmlFor={`folder-name-${index}`}>Folder Name:</label>
              <input
                type="text"
                id={`folder-name-${index}`}
                name={`folder_name_${index}`}
                placeholder="Enter folder name"
                value={folder.folderName}
                onChange={(e) => handleFolderNameChange(index, e)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Upload Images to {folder.folderName || 'folder'}:</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleImageUpload(index, e)}
                className="form-input"
              />
            </div>
          </div>
        ))}

        <button className="submit-button" type="submit">Create</button>
      </form>
    </div>
  );
};

export default PortfolioForm;
