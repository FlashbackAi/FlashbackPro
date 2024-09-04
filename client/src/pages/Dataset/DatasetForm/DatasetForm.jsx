import React,{ useState } from 'react';
import './DatasetForm.css';
import API_UTIL from '../../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';


const DatasetForm = () => {

  const { orgName } = useParams();
  const [formData, setFormData] = useState({
    org_name:orgName,
    dataset_name: '',
    dataset_desc:'',
    dataset_category: '',
    dataset_url: '',
    dataset_acceskey: '',
    dataset_size:''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const userDetails = location.state?.userDetails;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const updateRewardPoints = async () => {

    try {
      const requestData = {
        user_phone_number: userDetails.user_phone_number,
        reward_points: userDetails.reward_points - formData.dataset_size/10,
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

  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const response = await API_UTIL.post('/saveDatasetDetails', formData)

      if (response.status !== 200) {
        throw new Error('Failed to save the Dataset');
      }
      // toast.success('Events created successfully');
      await updateRewardPoints();
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
    <div className="create-dataset-container">
      <h1 className="form-title">Create Dataset</h1>
      <form className="invitation-form" id="invitation-form" onSubmit={handleSubmit}>
        <LabelAndInput
          htmlFor="event-name"
          label="Dataset Name:"
          type="text"
          id="event-name"
          name="dataset_name"
          placeholder="Dataset Name"
          value={formData.dataset_name}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        />
        <LabelAndInput
          htmlFor="event-name"
          label="Dataset Description:"
          type="text"
          id="event-name"
          name="dataset_desc"
          placeholder="Dataset Description"
          value={formData.dataset_desc}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        />
        <div className="form-group dataset-form-select-div">
          <label htmlFor="dataset-category" className='dataset-form-select-label'>Dataset Category:</label>
          <select
            id="dataset-category"
            name="dataset_category"
            value={formData.dataset_category}
            onChange={handleInputChange}
            required
            className='dataset-form-select'
          >
            <option value="" disabled>Select a category</option> {/* Default option */}
            <option value="Faces Data">Faces Data</option>
            <option value="gender data">Gender Data</option>
            <option value="age data">Age Data</option>
            <option value="object data">Object Data</option>
          </select>
        </div>
        <LabelAndInput
          htmlFor="dataset-url"
          label="Dataset URL:"
          type="text"
          id="dataset-url"
          name="dataset_url"
          placeholder="Provide your dataset URL"
          value={formData.dataset_url}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        />
        <LabelAndInput
          htmlFor="dataset-acceskey"
          label="Dataset Access Key:"
          type="text"
          id="dataset-acceskey"
          name="dataset_acceskey"
          placeholder="Provide your dataset access key"
          value={formData.dataset_acceskey}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        />
        <LabelAndInput
          htmlFor="dataset-size"
          label="Dataset Size:"
          type="number"
          id="dataset-size"
          name="dataset_size"
          placeholder="Provide your dataset size"
          value={formData.dataset_size}
          handleChange={handleInputChange}
          isRequired={true}
          isEditable={true}
        />
        <button className="submit-button" type="submit">
          {formData.dataset_size ? `Pay ${formData.dataset_size / 10} coins` : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default DatasetForm;
