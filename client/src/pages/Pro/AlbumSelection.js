import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import CustomDropdown from '../../components/CustomDropdown/CustomDropdown';
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import API_UTIL from "../../services/AuthIntereptor";
import './AlbumSelection.css'; // Assuming you have a CSS file for styles

const FamilyDetailsForm = () => {
    const [groomBrothersCount, setGroomBrothersCount] = useState(0);
    const [groomSistersCount, setGroomSistersCount] = useState(0);
    const [brideBrothersCount, setBrideBrothersCount] = useState(0);
    const [brideSistersCount, setBrideSistersCount] = useState(0);
    const [userThumbnails, setUserThumbnails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { eventName } = useParams();
    const isDataFetched = useRef(false);
    const [formData, setFormData] = useState({
        groom: '',
        groomFather: '',
        groomMother: '',
        bride: '',
        brideFather: '',
        brideMother: '',
        'Level 1 Cousins': [],
        'Level 2 Cousins': [],
        cousins:'',
        Friends: [],
        Uncles: [],
        Aunts: [],
        'Nephews & Nieces': [],
        'Grand Parents': []
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
        'Nephews & Nieces': [],
        'Grand Parents': []
    });

    const fetchThumbnails = async () => {
        if (userThumbnails.length === 0) setIsLoading(true);

        try {
            const response = await API_UTIL.get(`/userThumbnails/${eventName}`);
            if (response.status === 200) {
                setUserThumbnails(response.data);
                const malesData = response.data.filter(item => item.gender === 'Male');
                const femalesData = response.data.filter(item => item.gender === 'Female');
                const kidsData = response.data.filter(item => item.avgAge <= 15);

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

    const handleSelectChange = (question, selectedValue) => {
        console.log(question);
        setFormData(prevState => {
            if (Array.isArray(prevState[question])) {
                const newArray = prevState[question]?.includes(selectedValue)
                    ? prevState[question].filter(value => value !== selectedValue)
                    : [...prevState[question], selectedValue];
                updateSelectedValues({ ...prevState, [question]: newArray });
                return { ...prevState, [question]: newArray };
            } else {
                const newFormData = { ...prevState, [question]: selectedValue };
                updateSelectedValues(newFormData);
                return newFormData;
            }
        });
    };

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
    };

    const updateSelectedValues = (formData) => {
        const newSelectedValues = new Set();
        Object.values(formData).forEach(value => {
            if (Array.isArray(value)) {
                value.forEach(val => newSelectedValues.add(val));
            } else {
                newSelectedValues.add(value);
            }
        });
        setSelectedValues(newSelectedValues);
    };

    const filterOptions = (options) => {
        return options.filter(option => !selectedValues.has(option.face_url));
    };

    const handleSiblingChange = (setter,sibling, value) => {
       
        if(value === -1){
            let count;
            console.log(value +" : "+sibling);
          switch(sibling){
            case 'groomMale': count = groomBrothersCount;
                             break;
            case 'groomFemale': count = groomSistersCount;
                            break;
            case 'brideMale': count = brideBrothersCount;
                            break;
            case 'brideFemale': count = brideSistersCount;
                            break;
            default : console.log(sibling)
          }
          const formKey = `${sibling}Sibling${count}`;
          console.log(formKey)
          setFormData(prevState => {
            const newFormData = { ...prevState, [formKey]: '' };
            updateSelectedValues(newFormData);
            return newFormData;
        });
        }
        console.log(formData)
        setter(prev => {
            const newValue = prev + value;
            return newValue >= 0 && newValue <= 10 ? newValue : prev;
        });
       

       
    };

    const generateSiblingSelects = (form, gender, count) => {
        const siblings = [];
        const options = gender === "Male" ? filterOptions(males) : filterOptions(females);

        for (let i = 1; i <= count; i++) {
            const label = gender === "Male" ? `Select ${form} Sibling (Brother ${i})` : `Select your Sibling (Sister ${i})`;
            const sibling = `${form}${gender}Sibling${i}`;

            siblings.push(
                <div key={i}>
                    <label>{label}</label>
                    <CustomDropdown
                        question={sibling}
                        options={options}
                        selectedValue={formData[sibling]}
                        onSelectChange={(question, value) => handleSelectChange(question, value)}
                    />
                </div>
            );
        }

        return siblings;
    };

    const getThumbnailsForGroup = (group) => {
        switch (group) {
            case 'Level 1 Cousins':
                return filterOptions(userThumbnails.filter(item => item.avgAge >= 10 && item.avgAge <= 40).slice(5, 25));
            case 'Level 2 Cousins':
                return filterOptions(userThumbnails.filter(item => item.avgAge >= 10 && item.avgAge <= 40).slice(10, 30));
            case 'Friends':
                return filterOptions(userThumbnails.filter(item => item.avgAge >= 15 && item.avgAge <= 40).slice(20, 40));
            case 'Uncles':
                return filterOptions(males.filter(item => item.avgAge >= 35).slice(0, 20));
            case 'Aunts':
                return filterOptions(females.filter(item => item.avgAge >= 35).slice(0, 20));
            case 'Nephews & Nieces':
                return filterOptions(kidsData.slice(0, 20));
            case 'Grand Parents':
                return filterOptions(userThumbnails.filter(item => item.avgAge >= 50).slice(0, 20));
            default:
                return [];
        }
    };

    const ThumbnailSelection = ({ group }) => {
        const thumbnails = getThumbnailsForGroup(group);
        const selectedGroupThumbnails = selectedThumbnails[group];

        return (
            <div className="thumbnail-group">
                <label>Select {group}:</label>
                {selectedGroupThumbnails.length > 0 && (
                    <div className="selected-thumbnails-container">
                        <h4 style={{ "color": "black" }}> Selected </h4>
                        <div className="thumbnails-container">
                            {selectedGroupThumbnails.map((thumbnail, index) => (
                                <div
                                    key={index}
                                    className="thumbnail"
                                    onClick={() => handleGroupSelectChange(group, thumbnail)}
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
                            className={`thumbnail ${selectedGroupThumbnails?.includes(thumbnail.face_url) ? 'selected' : ''}`}
                            onClick={() => handleGroupSelectChange(group, thumbnail.face_url)}
                        >
                            <img src={thumbnail.face_url} alt={`Option ${index + 1}`} />
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
                        <label htmlFor="bride">Bride</label>
                         <CustomDropdown
                          question="bride"
                          options={filterOptions(females)}
                          selectedValue={formData.bride}
                          onSelectChange={(question, value) => handleSelectChange(question, value)}
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
                        <label htmlFor="brideMother">Bride's Mom</label>
                        <CustomDropdown
                            question="brideMother"
                            options={filterOptions(females)}
                            selectedValue={formData.brideMother}
                            onSelectChange={(question, value) => handleSelectChange(question, value)}
                        />

                        <label htmlFor="brideFather">Bride's Dad</label>
                        <CustomDropdown
                            question="brideFather"
                            options={filterOptions(males)}
                            selectedValue={formData.brideFather}
                            onSelectChange={(question, value) => handleSelectChange(question, value)}
                        />

                        <div className="incrementor">
                            <label htmlFor="brothers">Number of Groom Sibling Brothers (own brothers)</label>
                            <button type="button" onClick={() => handleSiblingChange(setGroomBrothersCount,"groomMale", -1)}>-</button>
                            <input type="number" name="brothers" id="brothers" value={groomBrothersCount} readOnly />
                            <button type="button" onClick={() => handleSiblingChange(setGroomBrothersCount,"groomMale", 1)}>+</button>
                        </div>

                        <div id="siblingsContainer">
                            {generateSiblingSelects('groom', 'Male', groomBrothersCount)}
                        </div>
                        <div className="incrementor">
                            <label htmlFor="sisters">Number of Groom Sibling Sisters (own sisters)</label>
                            <button type="button" onClick={() => handleSiblingChange(setGroomSistersCount,"groomFemale", -1)}>-</button>
                            <input type="number" name="sisters" id="sisters" value={groomSistersCount} readOnly />
                            <button type="button" onClick={() => handleSiblingChange(setGroomSistersCount,"groomFemale", 1)}>+</button>
                        </div>

                        <div id="siblingsContainer">
                            {generateSiblingSelects('groom', 'Female', groomSistersCount)}
                        </div>
                        <div className="incrementor">
                            <label htmlFor="brothers">Number of Bride Sibling Brothers (own brothers)</label>
                            <button type="button" onClick={() => handleSiblingChange(setBrideBrothersCount,"groomFemale", -1)}>-</button>
                            <input type="number" name="brothers" id="brothers" value={brideBrothersCount} readOnly />
                            <button type="button" onClick={() => handleSiblingChange(setBrideBrothersCount,"groomFemale", 1)}>+</button>
                        </div>

                        <div id="siblingsContainer">
                            {generateSiblingSelects('bride', 'Male', brideBrothersCount)}
                        </div>
                        <div className="incrementor">
                            <label htmlFor="sisters">Number of Bride Sibling Sisters (own sisters)</label>
                            <button type="button" onClick={() => handleSiblingChange(setBrideSistersCount,"groomMale", -1)}>-</button>
                            <input type="number" name="sisters" id="sisters" value={brideSistersCount} readOnly />
                            <button type="button" onClick={() => handleSiblingChange(setBrideSistersCount,"groomMale", 1)}>+</button>
                        </div>                

                        <div id="siblingsContainer">
                            {generateSiblingSelects('bride', 'Female', brideSistersCount)}
                        </div>
                       

                        <div>
                            {['Level 1 Cousins', 'Level 2 Cousins', 'Uncles', 'Aunts', 'Nephews & Nieces', 'Friends', 'Grand Parents'].map(group => (
                                <ThumbnailSelection
                                    key={group}
                                    group={group}
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
