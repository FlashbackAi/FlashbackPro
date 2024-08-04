import React,{ useState } from 'react';
import './ModelForm.css';
import API_UTIL from '../../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const ModalForm = () => {

  const { orgName } = useParams();
  const [formData, setFormData] = useState({
    org_name:orgName,
    model_name: '',
    model_category: '',
    model_url: '',
    model_desc: '',
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const response = await API_UTIL.post('/saveModelDetails', formData)

      if (response.status !== 200) {
        throw new Error('Failed to save the Dataset');
      }
      // toast.success('Events created successfully');
      setTimeout(() => {
        navigate('/model');
      }, 1000);
      return response;
    } catch (error) {
      console.error('Error saving form data to backend:', error);
      toast.error('Failed to save the dataset. Please try again.');
    } 
  };

  return (
    <div className="create-event-container">
      <h1 className="form-title">Create Model</h1>
      <form className="invitation-form" id="invitation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="event-name">Model Name:</label>
          <input
            type="text"
            id="event-name"
            name="model_name"
            placeholder="Modal Name"
            value={formData.model_name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dataset-category">Model Category:</label>
          <select
            id="dataset-category"
            name="model_category"
            value={formData.model_category}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Select a category</option> {/* Default option */}
            <option value="Faces Data">Faces Data</option>
            <option value="gender data">Gender Data</option>
            <option value="age data">Age Data</option>
            <option value="object data">Object Data</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="event-date">Model Url:</label>
          <input
            type="text"
            id="event-date"
            name="model_url"
            placeholder="provide your Model url"
            value={formData.model_url}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-location">Model Description:</label>
          <input
            type="text"
            id="event-location"
            name="model_desc"
            placeholder="provide your Model Description "
            value={formData.model_desc}
            onChange={handleInputChange}
            required
          />
        </div>
        <button className="submit-button" type="submit" >
          {/* {uploading ? 'Creating...' : 'Create'} */}
          Create
        </button>
      </form>
    </div>
  );
};

export default ModalForm;
