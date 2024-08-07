import React, { useState, useEffect } from 'react';
import './PortfolioForm.css';
import API_UTIL from '../../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import {  useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../../components/Loader/LoadingSpinner';

const PortfolioForm = () => {
  const userPhoneNumber = sessionStorage.getItem('userphoneNumber');

  const [formData, setFormData] = useState({
    user_phone_number: userPhoneNumber,
    social_media: {
      instagram: '',
      youtube: '',
      facebook:''
    },
    org_name: '',
  });

  const [folders, setFolders] = useState([{ folderName: 'Banner', images: [] }]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {

    const fetchUserDetails = async () => {
      try {
        const userPhoneNumber = sessionStorage.getItem('userphoneNumber');
        console.log(userPhoneNumber);
        const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
        setIsLoading(false)
        if (sessionStorage.getItem('userphoneNumber') !== response.data.data.user_name && response.data.data.hasOwnProperty('org_name')) {
          navigate(`/portfolio/${response.data.data.user_name}`)
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [navigate]);

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

  const saveUploadedImages = async (user_name) => {
    const data = new FormData();
    data.append('user_phone_number', formData.user_phone_number);
    data.append('org_name', formData.org_name);
    data.append('user_name',user_name);

    folders.forEach((folder) => {
      folder.images.forEach((image) => {
        data.append(`${folder.folderName}_images`, image);
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

      const res = await API_UTIL.post("/updatePortfolioDetails", requestData);
      if (res.status === 200) {
        await saveUploadedImages(res.data.data.user_name);
        navigate(`/portfolio/${res.data.data.user_name}`);
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
    <>
    {
      isLoading ? (
        <LoadingSpinner/>
      ) : (
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
          <label htmlFor="event-date">Facebook URL:</label>
          <input
            type="text"
            id="event-date"
            name="facebook"
            placeholder="Provide your Instagram URL"
            value={formData.social_media.facebook}
            onChange={handleSocialMediaChange}
            required
          />
        </div>
        {/* Banner Image Upload Section */}
        <div className="folder-section">
          <div className="form-group">
            <label className="form-label">Upload Banner Image:</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleImageUpload(0, e)} // Index 0 for the banner folder
              className="form-input"
            />
          </div>
        </div>

       

        {folders.slice(1).map((folder, index) => (
          <div key={index + 1} className="folder-section">
            <div className="form-group">
              <label htmlFor={`folder-name-${index + 1}`}>Folder Name:</label>
              <input
                type="text"
                id={`folder-name-${index + 1}`}
                name={`folder_name_${index + 1}`}
                placeholder="Enter folder name"
                value={folder.folderName}
                onChange={(e) => handleFolderNameChange(index + 1, e)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Upload Images to {folder.folderName || 'folder'}:</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleImageUpload(index + 1, e)}
                className="form-input"
              />
            </div>
          </div>
        ))}

        <div className="form-group">
          <button type="button" onClick={addFolder} className="add-folder-button">Add Folder</button>
        </div>

        <button className="submit-button" type="submit">Create</button>
      </form>
    </div>
    )
  }
  </>
  );
};

export default PortfolioForm;
