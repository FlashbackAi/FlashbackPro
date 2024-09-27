import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API_UTIL from '../../services/AuthIntereptor';
import LabelAndInput from '../../components/molecules/LabelAndInput/LabelAndInput';
import './orgDetails.css'; // Import your styling file if needed

const OrgDetails = () => {
  const { orgname } = useParams();  // Get orgname from the route
  const [orgDetails, setOrgDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        const response = await API_UTIL.get(`/fetchUserDetailsByUserName/${orgname}`);
        setOrgDetails(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrgDetails();
  }, [orgname]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="org-details-page">
      <h1>Organisation Details</h1>
      {orgDetails && (
        <form className="org-details-form">
          <LabelAndInput
            htmlFor="org_name"
            label="Organisation Name:"
            type="text"
            id="org_name"
            name="org_name"
            value={orgDetails.org_name}
            isEditable={false}
          />
          <LabelAndInput
            htmlFor="org_desc"
            label="Organisation Description:"
            type="text"
            id="org_desc"
            name="org_desc"
            value={orgDetails.org_desc}
            isEditable={false}
          />
          <LabelAndInput
            htmlFor="established_nation"
            label="Established Nation:"
            type="text"
            id="established_nation"
            name="established_nation"
            value={orgDetails.established_nation}
            isEditable={false}
          />
          <LabelAndInput
            htmlFor="website_url"
            label="Website URL:"
            type="text"
            id="website_url"
            name="website_url"
            value={orgDetails.website_url}
            isEditable={false}
          />
          <LabelAndInput
            htmlFor="org_email"
            label="Organisation Email:"
            type="email"
            id="org_email"
            name="org_email"
            value={orgDetails.org_email}
            isEditable={false}
          />
          <LabelAndInput
            htmlFor="founder_name"
            label="Founder Name:"
            type="text"
            id="founder_name"
            name="founder_name"
            value={orgDetails.founder_name}
            isEditable={false}
          />
          <LabelAndInput
            htmlFor="founder_linkedinUrl"
            label="Founder LinkedIn URL:"
            type="text"
            id="founder_linkedinUrl"
            name="founder_linkedinUrl"
            value={orgDetails.founder_linkedinUrl}
            isEditable={false}
          />
          <LabelAndInput
            htmlFor="founder_email"
            label="Founder Email:"
            type="email"
            id="founder_email"
            name="founder_email"
            value={orgDetails.founder_email}
            isEditable={false}
          />
          <LabelAndInput
            htmlFor="founder_contactNo"
            label="Founder Contact No:"
            type="text"
            id="founder_contactNo"
            name="founder_contactNo"
            value={orgDetails.founder_contactNo}
            isEditable={false}
          />
        </form>
      )}
    </div>
  );
};

export default OrgDetails;
