import React, { useState } from 'react';
import './ModelForm.css';
import API_UTIL from '../../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';

const ModelForm = () => {
  const { orgName } = useParams();
  const [formData, setFormData] = useState({
    org_name: orgName,
    model_name: '',
    model_category: '',
    model_url: '',
    model_desc: '',
    is_audited:false
  });
  const navigate = useNavigate();
  const location = useLocation();
  const userDetails = location.state?.userDetails;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API_UTIL.post('/saveModelDetails', formData);

      if (response.status === 200) {
        // await updateRewardPoints();
        setTimeout(() => {
          navigate('/model');
        }, 1000);
      } else {
        throw new Error('Failed to save the Model');
      }
    } catch (error) {
      console.error('Error saving form data to backend:', error);
      toast.error('Failed to save the model. Please try again.');
    }
  };

  const updateRewardPoints = async () => {
    try {
      const requestData = {
        user_phone_number: userDetails.user_phone_number,
        reward_points: userDetails.reward_points - formData.dataset_size,
      };

      console.log('Sending request to server with data:', requestData);

      await API_UTIL.post("/updateUserDetails", requestData);
    } catch (error) {
      console.error("Error in registering the model:", error);
      if (error.response) {
        toast.error("Error in creating Model");
      }
    }
  };

  return (
    <div className="create-model-container">
      <h1 className="form-title">Create Model</h1>
      <form className="invitation-form" id="invitation-form" onSubmit={handleSubmit}>
        <LabelAndInput
          htmlFor="model-name"
          label="Model Name:"
          type="text"
          id="model-name"
          name="model_name"
          placeholder="Model Name"
          value={formData.model_name}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        />
        <LabelAndInput
          htmlFor="model-desc"
          label="Model Description:"
          type="text"
          id="model-desc"
          name="model_desc"
          placeholder="Model Description"
          value={formData.model_desc}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        />
        <div className="form-group model-form-select-div">
          <label htmlFor="model-category" className='model-form-select-label'>Model Category:</label>
          <select
            id="model-category"
            name="model_category"
            value={formData.model_category}
            onChange={handleInputChange}
            required
            className='model-form-select'
          >
            <option value="" disabled>Select a category</option> {/* Default option */}
            <option value="Faces Data">Faces Data</option>
            <option value="gender data">Gender Data</option>
            <option value="age data">Age Data</option>
            <option value="object data">Object Data</option>
          </select>
        </div>
        <LabelAndInput
          htmlFor="model-url"
          label="Model URL:"
          type="text"
          id="model-url"
          name="model_url"
          placeholder="Provide your model URL"
          value={formData.model_url}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        />
        {/* <LabelAndInput
          htmlFor="dataset-size"
          label="Training Dataset Size:"
          type="number"
          id="dataset-size"
          name="dataset_size"
          placeholder="Provide dataset size required for model"
          value={formData.dataset_size}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        /> */}
        <button className="submit-button" type="submit">
          {/* {formData.dataset_size ? `Pay ${formData.dataset_size} coins` : 'Create'} */}
          Create
        </button>
      </form>
    </div>
  );
};

export default ModelForm;
