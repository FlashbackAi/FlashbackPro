import React,{ useState } from 'react';
import './ModelForm.css';
import API_UTIL from '../../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate, useParams, useLocation} from 'react-router-dom';

const ModalForm = () => {

  const { orgName } = useParams();
  const [formData, setFormData] = useState({
    org_name:orgName,
    model_name: '',
    model_category: '',
    model_url: '',
    model_desc: '',
    dataset_size:''
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
      const response = await API_UTIL.post('/saveModelDetails', formData)

      if (response.status === 200) {
        // toast.success('Events created successfully');
      await updateRewardPoints()
      setTimeout(() => {
        navigate('/model');
      }, 1000);
      }else{
        throw new Error('Failed to save the Dataset');
      }
      
    } catch (error) {
      console.error('Error saving form data to backend:', error);
      toast.error('Failed to save the dataset. Please try again.');
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
        toast.error("Error im creating Model")
      }
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
        <div className="form-group">
          <label htmlFor="event-location">Training Dataset size:</label>
          <input
            type="number"
            id="event-location"
            name="dataset_size"
            placeholder="Provide data set size req for model"
            value={formData.dataset_size}
            onChange={handleInputChange}
            required
          />
        </div>
        <button className="submit-button" type="submit" >Create
          {formData.dataset_size ? ` [Pay ${formData.dataset_size} coins]` : ''}
          
        </button>
      </form>
    </div>
  );
};

export default ModalForm;
