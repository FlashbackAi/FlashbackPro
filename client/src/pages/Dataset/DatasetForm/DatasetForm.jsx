import React,{ useState } from 'react';
import './DatasetForm.css';
import API_UTIL from '../../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const DatasetForm = () => {

  const { orgName } = useParams();
  const [formData, setFormData] = useState({
    org_name:orgName,
    dataset_name: '',
    dataset_desc:'',
    dataset_category: '',
    dataset_url: '',
    dataset_acceskey: '',
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const response = await API_UTIL.post('/saveDatasetDetails', formData)

      if (response.status !== 200) {
        throw new Error('Failed to save the Dataset');
      }
      // toast.success('Events created successfully');
      setTimeout(() => {
        navigate('/dataset');
      }, 1000);
      return response;
    } catch (error) {
      console.error('Error saving form data to backend:', error);
      toast.error('Failed to save the dataset. Please try again.');
    } 
  };

  return (
    <div className="create-event-container">
      <h1 className="form-title">Create Dataset</h1>
      <form className="invitation-form" id="invitation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="event-name">Dataset Name:</label>
          <input
            type="text"
            id="event-name"
            name="dataset_name"
            placeholder="Dataset Name"
            value={formData.dataset_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-name">Dataset Description:</label>
          <input
            type="text"
            id="event-name"
            name="dataset_desc"
            placeholder="Dataset Description"
            value={formData.dataset_desc}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dataset-category">Dataset Category:</label>
          <select
            id="dataset-category"
            name="dataset_category"
            value={formData.dataset_category}
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
          <label htmlFor="event-date">Dataset Url:</label>
          <input
            type="text"
            id="event-date"
            name="dataset_url"
            placeholder="provide your dataset url"
            value={formData.dataset_url}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-location">Dataset Acces Key:</label>
          <input
            type="text"
            id="event-location"
            name="dataset_acceskey"
            placeholder="provide your dataset access key "
            value={formData.dataset_acceskey}
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

export default DatasetForm;
