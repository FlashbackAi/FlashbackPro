import React, { useState, useEffect, useRef} from 'react';
import { useParams } from "react-router-dom";
import CustomDropdown from '../../components/CustomDropdown/CustomDropdown';
import LoadingSpinner from "../../components/Loader/LoadingSpinner";

import API_UTIL from "../../services/AuthIntereptor";
import './AlbumSelection.css'; // Assuming you have a CSS file for styles

const FamilyDetailsForm = () => {
    const [brothersCount, setBrothersCount] = useState(0);
    const [sistersCount, setSistersCount] = useState(0);
    const [userThumbnails, setUserThumbnails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchTimeout, setFetchTimeout] = useState(false);
    const { eventName} = useParams();
    const isDataFetched = useRef(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
    groom: '',
    groomFather: '',
    groomMother: '',
    'Level 1 Cousins': [],
    'Level 2 Cousins': [],
    Friends: [],
    Uncles: [],
    Aunts: [],
    'Nephews & Nieces': []
  });
  const [males, setMales] = useState([]);
  const [females, setFemales] = useState([]);
  const [selectedValues, setSelectedValues] = useState(new Set());
  const [kidsData, setKidsData] = useState([]);
  const [selectedThumbnails, setSelectedThumbnails] = useState({
    'Level 1 Cousins': [],
    'Level 2 Cousins': [],
    Friends: [],
    Uncles: [],
    Aunts: [],
    'Nephews & Nieces': []
  });

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(
        `/userThumbnails/${eventName}`
      );
      if (response.status === 200) {
        
        setUserThumbnails(response.data)
        const malesData = response.data.filter(item => item.gender === 'Male');
      const femalesData = response.data.filter(item => item.gender === 'Female');
      const kidsData =  response.data.filter(item => item.avgAge <= 15);

      setMales(malesData);
      setFemales(femalesData);
      setKidsData(kidsData);

      } else {
        throw new Error("Failed to fetch user thumbnails");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDataFetched.current) return;
    fetchThumbnails();
    isDataFetched.current = true;
  }, []);

  // const handleSelectChange = (question, selectedValue) => {
  //   setFormData(prevState => {
  //     const newFormData = { ...prevState, [question]: selectedValue };
  //     updateSelectedValues(newFormData);
  //     return newFormData;
  //   });
  //   console.log(formData);
  // };
  const handleSelectChange = (question, selectedValue) => {
    setFormData(prevState => {
      if (Array.isArray(prevState[question])) {
        // Handle array updates
        const newArray = prevState[question]?.includes(selectedValue)
          ? prevState[question].filter(value => value !== selectedValue)
          : [...prevState[question], selectedValue];
          updateSelectedValues(newArray);
        return { ...prevState, [question]: newArray };
      } else {
        // Handle single value updates
        const newFormData = { ...prevState, [question]: selectedValue };
            updateSelectedValues(newFormData);
             return newFormData;
      }
    });
  };

  // const handleThumbnailSelectChange = (group,thumbnail) =>{
    
  //   onSelectChange(group, thumbnail);
  // };

  const handleGroupSelectChange = (group, thumbnailUrl) => {
    handleSelectChange(group, thumbnailUrl);
    setSelectedThumbnails(prevState => {
      const newSelectedThumbnails = prevState[group].includes(thumbnailUrl)
        ? prevState[group].filter(url => url !== thumbnailUrl)
        : [...prevState[group], thumbnailUrl];
      return {
        ...prevState,
        [group]: newSelectedThumbnails
      };
    });
    console.log(selectedThumbnails);
  };
  const handleSelctedThumbnailClick = (group,thumbnail) =>{

  };



  const updateSelectedValues = (formData) => {
    const newSelectedValues = new Set(Object.values(formData));
    setSelectedValues(newSelectedValues);
  };
  const filterOptions = (options) => {
    console.log(selectedValues)
    return options.filter(option => !selectedValues.has(option.face_url));
  };


    const handleSiblingChange = (setter, value) => {
        setter(prev => {
            const newValue = prev + value;
            return newValue >= 0 && newValue <= 10 ? newValue : prev;
        });
    };

    const generateSiblingSelects = (gender) => {
        const totalSiblings = gender === "male" ? brothersCount : sistersCount;
        const siblings = [];
        const options = gender ==="male" ? filterOptions(males) : filterOptions(females);

        for (let i = 1; i <= totalSiblings; i++) {
            const label = gender === "male" ? `Select your Sibling (Brother ${i})` : `Select your Sibling (Sister ${i})`;
            let sibling = `groom${gender}Sibling${i}`
            
            siblings.push(
                <div key={i}>
                    <label>{label}</label>
                   
                <CustomDropdown
                question={sibling}
                options={options}
                selectedValue={formData[sibling]}
                onSelectChange={handleSelectChange}
              />

                </div>
            );
        }

        return siblings;
    };

    const getThumbnailsForGroup = (group) => {
      // switch (group) {
      //   case 'Level 1 Cousins':
      //     return filterOptions(userThumbnails.filter(item => item.avgAge <=45)).slice(5, 25).map(item => item.face_url);
      //   case 'Level 2 Cousins':
      //     return filterOptions(userThumbnails.filter(item => item.avgAge <=45)).slice(10, 30).map(item => item.face_url);
      //   case 'Friends':
      //     return filterOptions(userThumbnails.filter(item => item.avgAge >= 15 && item.avgAge <=40)) .slice(20, 40).map(item => item.face_url);
      //   case 'Uncles':
      //     return filterOptions(males).filter(item => item.avgAge >= 35 ).slice(0, 20).map(item => item.face_url);
      //   case 'Aunts':
      //     return filterOptions(females).filter(item => item.avgAge >= 35 ).slice(0, 20).map(item => item.face_url);
      //   case 'Nephews & Nieces':
      //     return filterOptions(kidsData).slice(0, 20).map(item => item.face_url);
      //   default:
      //     return [];
      // }
      switch (group) {
        case 'Level 1 Cousins':
          return userThumbnails.filter(item => item.avgAge >= 10 && item.avgAge <=40).slice(5, 25).map(item => item.face_url);
        case 'Level 2 Cousins':
          return userThumbnails.filter(item => item.avgAge >= 10 && item.avgAge <=40).slice(10, 30).map(item => item.face_url);
        case 'Friends':
          return userThumbnails.filter(item => item.avgAge >= 15 && item.avgAge <=40).slice(20, 40).map(item => item.face_url);
        case 'Uncles':
          return males.filter(item => item.avgAge >= 35 ).slice(0, 20).map(item => item.face_url);
        case 'Aunts':
          return females.filter(item => item.avgAge >= 35 ).slice(0, 20).map(item => item.face_url);
        case 'Nephews & Nieces':
          return kidsData.slice(0, 20).map(item => item.face_url);
        default:
          return [];
      }
     };

    const ThumbnailSelection = ({ group, thumbnails, selectedThumbnails, onSelectChange }) => {
      

      return (
        <div className="thumbnail-group">
          <label>Select {group}:</label>
          {selectedThumbnails.length > 0 && (
          <div className="selected-thumbnails-container">
            <h4 style={{"color":"black"}}> Selected </h4>
            <div className="thumbnails-container">
              {selectedThumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  className="thumbnail"
                  onClick={() => handleSelctedThumbnailClick(group,thumbnail)}
                >
                  <img src={thumbnail} alt={`Selected Option ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
      )}
          <div className="thumbnails-container">
            {thumbnails.map((thumbnail, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedThumbnails?.includes(thumbnail) ? 'selected' : ''}`}
                onClick={()  => handleGroupSelectChange(group,thumbnail)}
              >
                <img src={thumbnail} alt={`Option ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      );
    };



    return (
        <div>
        {isLoading ? (
            <LoadingSpinner /> 
        ) : (
            <div className="container">
            <h2>Flashback Pro</h2>
            <h3>Lets Select Groom's Family</h3>
            <form action="#" method="post">
                <label htmlFor="groom">Groom</label>
                <CustomDropdown
                question="groom"
                options={filterOptions(males)}
                selectedValue={formData.groom}
                onSelectChange={handleSelectChange}
              />

                <label htmlFor="groomMother">Groom's Mom</label>
                <CustomDropdown
                question="groomMother"
                options={filterOptions(females)}
                selectedValue={formData.groomMother}
                onSelectChange={handleSelectChange}
              />


                <label htmlFor="groomFather">Groom's Dad</label>
                <CustomDropdown
                question="groomFather"
                options={filterOptions(males)}
                selectedValue={formData.groomFather}
                onSelectChange={handleSelectChange}
              />


                <div className="incrementor">
                    <label htmlFor="brothers">Number of Sibling Brothers (own brothers)</label>
                    <button type="button" onClick={() => handleSiblingChange(setBrothersCount, -1)}>-</button>
                    <input type="number" name="brothers" id="brothers" value={brothersCount} readOnly />
                    <button type="button" onClick={() => handleSiblingChange(setBrothersCount, 1)}>+</button>
                </div>

                <div id="siblingsContainer">
                    {generateSiblingSelects("male")}
                </div>
                <div className="incrementor">
                    <label htmlFor="sisters">Number of Sibling Sisters (own sisters)</label>
                    <button type="button" onClick={() => handleSiblingChange(setSistersCount, -1)}>-</button>
                    <input type="number" name="sisters" id="sisters" value={sistersCount} readOnly />
                    <button type="button" onClick={() => handleSiblingChange(setSistersCount, 1)}>+</button>
                </div>

                <div id="siblingsContainer">
                    {generateSiblingSelects("female")}
                </div>

                <div>
                  {['Level 1 Cousins', 'Level 2 Cousins', 'Uncles', 'Aunts','Nephews & Nieces', 'Friends'].map(group => (
                    <ThumbnailSelection
                      key={group}
                      group={group}
                      thumbnails={getThumbnailsForGroup(group)}
                      selectedThumbnails={selectedThumbnails[group]}
                      onSelectChange={handleGroupSelectChange}
                    />
                  ))}
                </div>

                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </div>
        )}
        </div>
    );
};

export default FamilyDetailsForm;
