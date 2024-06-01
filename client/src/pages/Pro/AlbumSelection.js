import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import CustomDropdown from '../../components/CustomDropdown/CustomDropdown';
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import API_UTIL from "../../services/AuthIntereptor";
import './AlbumSelection.css'; // Assuming you have a CSS file for styles

const FamilyDetailsForm = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { eventName } = useParams();
    const isDataFetched = useRef(false);

    const [userThumbnails, setUserThumbnails] = useState([]);
    const [males, setMales] = useState([]);
    const [females, setFemales] = useState([]);
    const [kidsData, setKidsData] = useState([]);
    const [selectedValues, setSelectedValues] = useState(new Set());

    const [groomFormData, setGroomFormData] = useState({
        groom: '',
        groomFather: '',
        groomMother: '',
        'Level 1 Cousins': [],
        'Level 2 Cousins': [],
        Friends: [],
        Uncles: [],
        Aunts: [],
        'Nephews & Nieces': [],
        'Grand Parents': []
    });
    const [brideFormData, setBrideFormData] = useState({
        bride: '',
        brideFather: '',
        brideMother: '',
        'Level 1 Cousins': [],
        'Level 2 Cousins': [],
        Friends: [],
        Uncles: [],
        Aunts: [],
        'Nephews & Nieces': [],
        'Grand Parents': []
    });

    const [groomBrothersCount, setGroomBrothersCount] = useState(0);
    const [groomSistersCount, setGroomSistersCount] = useState(0);
    const [brideBrothersCount, setBrideBrothersCount] = useState(0);
    const [brideSistersCount, setBrideSistersCount] = useState(0);

    const [selectedThumbnails, setSelectedThumbnails] = useState({
        groom: {
            'Level 1 Cousins': [],
            'Level 2 Cousins': [],
            Friends: [],
            Uncles: [],
            Aunts: [],
            'Nephews & Nieces': [],
            'Grand Parents': []
        },
        bride: {
            'Level 1 Cousins': [],
            'Level 2 Cousins': [],
            Friends: [],
            Uncles: [],
            Aunts: [],
            'Nephews & Nieces': [],
            'Grand Parents': []
        }
    });

  //   const [selectedBrideThumbnails, setSelectedBrideThumbnails] = useState({
  //     groom: {
  //         'Level 1 Cousins': [],
  //         'Level 2 Cousins': [],
  //         Friends: [],
  //         Uncles: [],
  //         Aunts: [],
  //         'Nephews & Nieces': [],
  //         'Grand Parents': []
  //     },
  //     bride: {
  //         'Level 1 Cousins': [],
  //         'Level 2 Cousins': [],
  //         Friends: [],
  //         Uncles: [],
  //         Aunts: [],
  //         'Nephews & Nieces': [],
  //         'Grand Parents': []
  //     }
  // });

    const [isGroomFormExpanded, setIsGroomFormExpanded] = useState(false);
    const [isBrideFormExpanded, setIsBrideFormExpanded] = useState(false);

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

    const handleSelectChange = (form, question, selectedValue) => {
        const setFormData = form === 'groom' ? setGroomFormData : setBrideFormData;
        const formData = form === 'groom' ? groomFormData : brideFormData;
        
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

    const handleGroupSelectChange = (form, group, thumbnailUrl) => {
        handleSelectChange(form, group, thumbnailUrl);
        //const setSelectedThumbnails = form === 'groom' ? setSelectedGroomThumbnails : setSelectedBrideThumbnails;
        setSelectedThumbnails(prevState => {
            const newSelectedThumbnails = prevState[form][group].includes(thumbnailUrl)
                ? prevState[form][group].filter(url => url !== thumbnailUrl)
                : [...prevState[form][group], thumbnailUrl];
            return {
                ...prevState,
                [form]: {
                    ...prevState[form],
                    [group]: newSelectedThumbnails
                }
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
        newSelectedValues.forEach(value => selectedValues.add(value));
        setSelectedValues(newSelectedValues);
        console.log(selectedValues);
    };

    const filterOptions = (options) => {
        return options.filter(option => !selectedValues.has(option.face_url));
    };

    const handleSiblingChange = (setter, value) => {
        setter(prev => {
            const newValue = prev + value;
            return newValue >= 0 && newValue <= 10 ? newValue : prev;
        });
    };

    const generateSiblingSelects = (form, gender, count) => {
        const siblings = [];
        const options = gender === "male" ? filterOptions(males) : filterOptions(females);

        for (let i = 1; i <= count; i++) {
            const label = gender === "male" ? `Select your Sibling (Brother ${i})` : `Select your Sibling (Sister ${i})`;
            const sibling = `${form}${gender}Sibling${i}`;

            siblings.push(
                <div key={i}>
                    <label>{label}</label>
                    <CustomDropdown
                        question={sibling}
                        options={options}
                        selectedValue={form === 'groom' ? groomFormData[sibling] : brideFormData[sibling]}
                        onSelectChange={(question, value) => handleSelectChange(form, question, value)}
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

    const ThumbnailSelection = ({ form, group }) => {
        const thumbnails = getThumbnailsForGroup(group);
        const selectedGroupThumbnails = selectedThumbnails[form][group];
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
                                    onClick={() => handleGroupSelectChange(form, group, thumbnail)}
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
                            className='thumbnail'
                            onClick={() => handleGroupSelectChange(form, group, thumbnail.face_url)}
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
                    <h3>Let's Select Family Details</h3>
                    <div className="form-container">
                        <div className="form-section">
                            <div className="form-header" onClick={() => setIsGroomFormExpanded(!isGroomFormExpanded)}>
                                <h3>Groom's Family</h3>
                                <button type="button">{isGroomFormExpanded ? 'Collapse' : 'Expand'}</button>
                            </div>
                            {isGroomFormExpanded && (
                                <div className="form-content">
                                    <form action="#" method="post">
                                        <label htmlFor="groom">Groom</label>
                                        <CustomDropdown
                                            question="groom"
                                            options={filterOptions(males)}
                                            selectedValue={groomFormData.groom}
                                            onSelectChange={(question, value) => handleSelectChange('groom', question, value)}
                                        />

                                        <label htmlFor="groomMother">Groom's Mom</label>
                                        <CustomDropdown
                                            question="groomMother"
                                            options={filterOptions(females)}
                                            selectedValue={groomFormData.groomMother}
                                            onSelectChange={(question, value) => handleSelectChange('groom', question, value)}
                                        />

                                        <label htmlFor="groomFather">Groom's Dad</label>
                                        <CustomDropdown
                                            question="groomFather"
                                            options={filterOptions(males)}
                                            selectedValue={groomFormData.groomFather}
                                            onSelectChange={(question, value) => handleSelectChange('groom', question, value)}
                                        />

                                        <div className="incrementor">
                                            <label htmlFor="brothers">Number of Sibling Brothers (own brothers)</label>
                                            <button type="button" onClick={() => handleSiblingChange(setGroomBrothersCount, -1)}>-</button>
                                            <input type="number" name="brothers" id="brothers" value={groomBrothersCount} readOnly />
                                            <button type="button" onClick={() => handleSiblingChange(setGroomBrothersCount, 1)}>+</button>
                                        </div>

                                        <div id="siblingsContainer">
                                            {generateSiblingSelects('groom', 'male', groomBrothersCount)}
                                        </div>
                                        <div className="incrementor">
                                            <label htmlFor="sisters">Number of Sibling Sisters (own sisters)</label>
                                            <button type="button" onClick={() => handleSiblingChange(setGroomSistersCount, -1)}>-</button>
                                            <input type="number" name="sisters" id="sisters" value={groomSistersCount} readOnly />
                                            <button type="button" onClick={() => handleSiblingChange(setGroomSistersCount, 1)}>+</button>
                                        </div>

                                        <div id="siblingsContainer">
                                            {generateSiblingSelects('groom', 'female', groomSistersCount)}
                                        </div>

                                        <div>
                                            {['Level 1 Cousins', 'Level 2 Cousins', 'Uncles', 'Aunts', 'Nephews & Nieces', 'Friends', 'Grand Parents'].map(group => (
                                                <ThumbnailSelection
                                                    key={group}
                                                    form="groom"
                                                    group={group}
                                                />
                                            ))}
                                        </div>

                                        <button type="submit" className="submit-btn">Submit</button>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <div className="form-header" onClick={() => setIsBrideFormExpanded(!isBrideFormExpanded)}>
                                <h3>Bride's Family</h3>
                                <button type="button">{isBrideFormExpanded ? 'Collapse' : 'Expand'}</button>
                            </div>
                            {isBrideFormExpanded && (
                                <div className="form-content">
                                    <form action="#" method="post">
                                        <label htmlFor="bride">Bride</label>
                                        <CustomDropdown
                                            question="bride"
                                            options={filterOptions(females)}
                                            selectedValue={brideFormData.bride}
                                            onSelectChange={(question, value) => handleSelectChange('bride', question, value)}
                                        />

                                        <label htmlFor="brideMother">Bride's Mom</label>
                                        <CustomDropdown
                                            question="brideMother"
                                            options={filterOptions(females)}
                                            selectedValue={brideFormData.brideMother}
                                            onSelectChange={(question, value) => handleSelectChange('bride', question, value)}
                                        />

                                        <label htmlFor="brideFather">Bride's Dad</label>
                                        <CustomDropdown
                                            question="brideFather"
                                            options={filterOptions(males)}
                                            selectedValue={brideFormData.brideFather}
                                            onSelectChange={(question, value) => handleSelectChange('bride', question, value)}
                                        />

                                        <div className="incrementor">
                                            <label htmlFor="brothers">Number of Sibling Brothers (own brothers)</label>
                                            <button type="button" onClick={() => handleSiblingChange(setBrideBrothersCount, -1)}>-</button>
                                            <input type="number" name="brothers" id="brothers" value={brideBrothersCount} readOnly />
                                            <button type="button" onClick={() => handleSiblingChange(setBrideBrothersCount, 1)}>+</button>
                                        </div>

                                        <div id="siblingsContainer">
                                            {generateSiblingSelects('bride', 'male', brideBrothersCount)}
                                        </div>
                                        <div className="incrementor">
                                            <label htmlFor="sisters">Number of Sibling Sisters (own sisters)</label>
                                            <button type="button" onClick={() => handleSiblingChange(setBrideSistersCount, -1)}>-</button>
                                            <input type="number" name="sisters" id="sisters" value={brideSistersCount} readOnly />
                                            <button type="button" onClick={() => handleSiblingChange(setBrideSistersCount, 1)}>+</button>
                                        </div>

                                        <div id="siblingsContainer">
                                            {generateSiblingSelects('bride', 'female', brideSistersCount)}
                                        </div>

                                        <div>
                                            {['Level 1 Cousins', 'Level 2 Cousins', 'Uncles', 'Aunts', 'Nephews & Nieces', 'Friends', 'Grand Parents'].map(group => (
                                                <ThumbnailSelection
                                                    key={group}
                                                    form="bride"
                                                    group={group}
                                                />
                                            ))}
                                        </div>

                                        <button type="submit" className="submit-btn">Submit</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyDetailsForm;
