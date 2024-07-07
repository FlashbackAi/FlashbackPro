import React, { useEffect, useRef, useState } from "react";
import "../AlbumSelectionForm/AlbumSelectionForm.css";
import "./FaceSelection.css";
import Header from "../../../components/Header/Header";
import { ArrowRight, ChevronLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";
import API_UTIL from "../../../services/AuthIntereptor";
import { useParams, useNavigate } from "react-router";
import CustomFaceOption from "../../../components/CustomOption/CustomFaceOption";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/Loader/LoadingSpinner";
import Modal from '../../../components/Modal/Modal';

const FaceSelection = () => {
  const isDataFetched = useRef(false);
  const [lastIndex, setLastIndex] = useState(0);
  const [start, setStart] = useState(false);
  const [groomBrothersCount, setGroomBrothersCount] = useState(0);
  const [groomSistersCount, setGroomSistersCount] = useState(0);
  const [brideBrothersCount, setBrideBrothersCount] = useState(0);
  const [brideSistersCount, setBrideSistersCount] = useState(0);
  const [userThumbnails, setUserThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { eventName } = useParams();
  const [males, setMales] = useState([]);
  const [grooms, setGrooms] = useState([]);
  const [brides, setBrides] = useState([]);
  const [uncles, setUncles] = useState([]);
  const [aunts, setAunts] = useState([]);
  const [grandParents, setGrandParents] = useState([]);
  const [females, setFemales] = useState([]);
  const [kids, setKids] = useState([]);
  const [cousins, setCousins] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedValues, setSelectedValues] = useState(new Set());
  const [isFacesSelectionDone, setIsFacesSelectionDone] = useState();
  const [isCharacterSelected, setIsCharacterSelected] = useState(false);
  const [showMaritalStatusModal, setShowMaritalStatusModal] = useState(false);
  const [currentSibling, setCurrentSibling] = useState('');

  const [formData, setFormData] = useState({
    event_name: eventName,
    form_owner: null,
    Groom: null,
    'Groom Father': null,
    'Groom Mother': null,
    Bride: null,
    'Bride Mother': null,
    'Bride Father': null,
    Kids: [],
    "Level 1 Cousins": [],
    "Level 2 Cousins": [],
    Uncles: [],
    Aunts: [],
    "Grand Parents": [],
    "Other Important Relatives": [],
    Friends: [],
    "Other Important People": [],
    isFacesSelectionDone: null
  });

  const [isFormDataUpdated, setIsFormDataUpdated] = useState(false);

  const navigate = useNavigate();

  const handleOpenMaritalStatusModal = (sibling) => {
    setCurrentSibling(sibling);
    setShowMaritalStatusModal(true);
  };

  const handleCloseMaritalStatusModal = () => {
    setShowMaritalStatusModal(false);
    setCurrentSibling('');
  };

  const handleMaritalStatusChange = (status) => {
    handleSelectChange(`${currentSibling}MaritalStatus`, status);
    handleCloseMaritalStatusModal();
  };

  const generateCoupleFamily = (char, srNoStart) => {
    if (!formData[char]) {
      return null;
    }
   
    const parents = [
      {
        label: `${char} Father`,
        question: `${char} Father`,
        options: uncles,
      },
      {
        label: `${char} Mother`,
        question: `${char} Mother`,
        options: aunts,
      },
    ];
  
    const siblings = [
      {
        label: `${char.charAt(0).toUpperCase() + char.slice(1)} Brothers`,
        question: `${char.charAt(0).toUpperCase() + char.slice(1)} Brothers`,
        gender: 'male',
      },
      {
        label: `${char.charAt(0).toUpperCase() + char.slice(1)} Sisters`,
        question: `${char.charAt(0).toUpperCase() + char.slice(1)} Sisters`,
        gender: 'female',
      },
    ];
  
    return (
      <div className={`${char}-family-container`} key={`${char}-family`}>
        <div className="centered-selection">
        <div className="sibling-image-container">
            <div className="question-header">
              <div className="icon">
              </div>
              <div className="question">{char.charAt(0).toUpperCase()+ char.slice(1)}</div>
            </div>
            <div className="selected-face">
              <img src={formData[char]}  className="selected-image" />
            </div>
          </div>
          {parents.map((parent, index) => (
            <CustomFaceOption
              key={parent.question}
              serialNo={`${srNoStart}.${index + 1}`}
              title={`Please select the ${parent.label.toLowerCase()}`}
              next={next}
              prev={prev}
              question={parent.question}
              sendSelection={handleSelectChange}
              options={filterOptions(parent.options).slice(0, 10)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={[formData[parent.question]]}
            />
          ))}
          </div>
          <div className="centered-selection">
          <div className="sibling-image-container">
            <div className="question-header">
              <div className="icon">
              </div>
              <div className="question">{char.charAt(0).toUpperCase()+ char.slice(1)}</div>
            </div>
            <div className="selected-face">
              <img src={formData[char]}  className="selected-image" />
            </div>
          </div>
          {siblings.map((sibling, index) => (
            <CustomFaceOption
              key={sibling.question}
              serialNo={`${srNoStart}.${parents.length + index + 1}`}
              title={`Please select the ${sibling.label.toLowerCase()}`}
              next={next}
              prev={prev}
              question={sibling.question}
              sendSelection={handleSelectChange}
              options={filterOptions(sibling.gender === 'male' ? males : females).slice(0, 10)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={formData[sibling.question] || []}
              multiple={true}
            />
          ))}
        </div>
      </div>
    );
  };
  const generateParentSection = (char,couple, srNoStart)=>{
    if(!formData[`${couple} ${char}`]) return null;
    return(
    <div className='parent-container' key={`${couple} ${char} Family`}>
              <div className="centered-selection">
              <div className="sibling-image-container">
                <div className="question-header">
                  <div className="icon">
                  </div>
                  <div className="question">{couple} {char}</div>
                </div>
                <div className="selected-face">
                  <img src={formData[`${couple} ${char}`]}  className="selected-image" />
                </div>
              </div>
                    <CustomFaceOption
                      question={`${couple} ${char} Parents`}
                      options={filterOptions(grandParents)}
                      others={filterOptions(userThumbnails)}
                      title={`Select ${couple} ${char} Parents`}
                      onSelect={handleSelectFace}
                      sendSelection={handleSelectChange}
                      selectedImage={formData[`${couple} ${char} Parents`] || []}
                      next={next}
                      prev={prev}
                      isInternal={true}
                      multiple={true}
                    />

                    <CustomFaceOption
                      question={`${couple} ${char} Siblings`}
                      options={filterOptions(userThumbnails)}
                      others={filterOptions(userThumbnails)}
                      title={`Select ${couple} ${char} Siblings`}
                      onSelect={handleSelectFace}
                      sendSelection={handleSelectChange}
                      selectedImage={formData[`${couple} ${char} Siblings`] || []}
                      next={next}
                      prev={prev}
                      isInternal={true}
                      multiple={true}
                    />
                    
                  </div>
                  </div>
    )
                
  }
  

  const generateParentSiblingSelects = (siblings, parent, srNo) => {
    if (!siblings || siblings.length === 0) return null;
  
    return siblings.map((sibling, index) => (
      <div className="parent-sibling-container" key={`${parent} Sibling ${index + 1}`}>
        <div className="centered-selection">
          <div className="sibling-image-container">
            <div className="question-header">
              <div className="icon">
                <ArrowRight className="arrow" />
              </div>
              <div className="question">Selected {parent} Sibling {index + 1}</div>
            </div>
            <div className="selected-face">
              <img src={sibling} alt={`selected ${index + 1}`} className="selected-image" />
            </div>
          </div>
          <CustomFaceOption
            question={`${parent} Sibling ${index + 1} Spouse`}
            options={filterOptions(userThumbnails)}
            others={filterOptions(userThumbnails)}
            serialNo={`${srNo}.${index+2}`}
            title={`Select ${parent} Sibling ${index + 1} Spouse`}
            onSelect={handleSelectFace}
            sendSelection={handleSelectChange}
            selectedImage={formData[`${parent} Sibling ${index + 1} Spouse`] || []}
            next={next}
            prev={prev}
            // isInternal={true}
          />
          <CustomFaceOption
            question={`${parent} Sibling ${index + 1} Children`}
            options={filterOptions(userThumbnails)}
            others={filterOptions(userThumbnails)}
            serialNo={`${parent.replace(" ", "")}Sibling${index + 1}.2`}
            title={`Select ${parent} Sibling ${index + 1} Children`}
            multiple={true}
            isInternal={true}
            next={next}
            prev={prev}
            onSelect={handleSelectFace}
            sendSelection={(question, selectedValue) => {
              handleSelectChange(question, selectedValue);
              // Adding selected children to cousins
              setFormData((prevState) => {
                const newCousins = [...prevState["Level 1 Cousins"], ...selectedValue];
                return { ...prevState, "Level 1 Cousins": newCousins };
              });
            }}
            selectedImage={formData[`${parent} Sibling ${index + 1} Children`] || []}
          />
        </div>
      </div>
    ));
  };
  
  const generateCousinSelects = () => {
    if(!formData['Level 1 Cousins']) return null;
    return formData["Level 1 Cousins"].map((cousin, index) => (
      <div className="cousin-container" key={`Level 1 Cousin ${index + 1}`}>
        <div className="centered-selection">
          <div className="sibling-image-container">
            <div className="question-header">
              <div className="icon">
                <ArrowRight className="arrow" />
              </div>
              <div className="question">Selected Level 1 Cousin {index + 1}</div>
            </div>
            <div className="selected-face">
              <img src={cousin} alt={`selected ${index + 1}`} className="selected-image" />
            </div>
          </div>
          <CustomFaceOption
            question={`Level 1 Cousin ${index + 1} Spouse`}
            options={filterOptions(userThumbnails)}
            others={filterOptions(userThumbnails)}
            serialNo={`cousin.${index + 1}.1`}
            title={`Select Level 1 Cousin ${index + 1} Spouse`}
            onSelect={handleSelectFace}
            sendSelection={handleSelectChange}
            selectedImage={formData[`Level 1 Cousin ${index + 1} Spouse`] || []}
            next={next}
            prev={prev}
            isInternal={true}
          />
          <CustomFaceOption
            question={`Level 1 Cousin ${index + 1} Children`}
            options={filterOptions(userThumbnails)}
            others={filterOptions(userThumbnails)}
            serialNo={`cousin.${index + 1}.2`}
            title={`Select Level 1 Cousin ${index + 1} Children`}
            multiple={true}
            isInternal={true}
            next={next}
            prev={prev}
            onSelect={handleSelectFace}
            sendSelection={handleSelectChange}
            selectedImage={formData[`Level 1 Cousin ${index + 1} Children`] || []}
          />
        </div>
      </div>
    ));
  };
  
  

  // const   generateCousinSelects = (cousins, srNoStart) => {
  //   if (!cousins || cousins.length === 0) return null;

  //   return cousins.map((cousin, index) => (
  //     <div className="cousin-container" key={`Cousin ${index + 1}`}>
  //       <div className="centered-selection">
  //         <CustomFaceOption
  //           question={`Cousin ${index + 1}`}
  //           options={filterOptions(userThumbnails)}
  //           others={filterOptions(userThumbnails)}
  //           serialNo={`${srNoStart}.${index + 1}`}
  //           title={`Select Cousin ${index + 1}`}
  //           onSelect={handleSelectFace}
  //           sendSelection={handleSelectChange}
  //           selectedImage={[cousin]}
  //           next={() => {
  //             if (!formData[`Cousin ${index + 1}MaritalStatus`]) {
  //               handleOpenMaritalStatusModal(`Cousin ${index + 1}`);
  //             } else {
  //               next(`${srNoStart}.${index + 1}`);
  //             }
  //           }}
  //           prev={prev}
  //           isSibling={true}
  //           maritalStatus={() => handleOpenMaritalStatusModal(`Cousin ${index + 1}`)}
  //         />
  //         {(formData[`Cousin ${index + 1}MaritalStatus`] === "married" || formData[`Cousin ${index + 1}MaritalStatus`] === "marriedWithKids") && (
  //           <CustomFaceOption
  //             question={`Cousin ${index + 1} Spouse`}
  //             options={filterOptions(userThumbnails)}
  //             others={filterOptions(userThumbnails)}
  //             serialNo={`${srNoStart}.${index + 1}.1`}
  //             title={`Select Cousin ${index + 1} Spouse`}
  //             onSelect={handleSelectFace}
  //             sendSelection={handleSelectChange}
  //             selectedImage={formData[`Cousin ${index + 1} Spouse`] || []}
  //             next={next}
  //             prev={prev}
  //             isInternal={true}
  //           />
  //         )}
  //         {formData[`Cousin ${index + 1}MaritalStatus`] === "marriedWithKids" && (
  //           <CustomFaceOption
  //             question={`Cousin ${index + 1} Children`}
  //             options={filterOptions(userThumbnails)}
  //             others={filterOptions(userThumbnails)}
  //             serialNo={`${srNoStart}.${index + 1}.2`}
  //             title={`Select Cousin ${index + 1} Children`}
  //             multiple={true}
  //             isInternal={true}
  //             next={next}
  //             prev={prev}
  //             onSelect={handleSelectFace}
  //             sendSelection={handleSelectChange}
  //             selectedImage={formData[`Cousin ${index + 1} Children`] || []}
  //           />
  //         )}
  //       </div>
  //     </div>
  //   ));
  // };
  const generateSiblingFamilySection = (siblings, char, srNoStart) => {
    if (!siblings || siblings.length === 0) return null;
    return siblings.map((sibling, index) => (
      <div className={`${char}-sibling-family-container`} key={`${char} Sibling ${index + 1}`}>
        <div className="centered-selection">
          <div className="sibling-image-container">
            <div className="question-header">
              <div className="icon">
                <ArrowRight className="arrow" />
              </div>
              <div className="question">Selected {char} Sibling {index + 1}</div>
            </div>
            <div className="selected-face">
              <img src={sibling} alt={`selected ${index + 1}`} className="selected-image" />
            </div>
          </div>
          <CustomFaceOption
            question={`${char} Sibling ${index + 1} Spouse`}
            options={filterOptions(userThumbnails)}
            others={filterOptions(userThumbnails)}
            serialNo={`${srNoStart}.${index + 1}.1`}
            title={`Select ${char} Sibling ${index + 1} Spouse`}
            onSelect={handleSelectFace}
            sendSelection={handleSelectChange}
            selectedImage={formData[`${char} Sibling ${index + 1} Spouse`] || []}
            next={next}
            prev={prev}
          />
          <CustomFaceOption
            question={`${char} Sibling ${index + 1} Children`}
            options={filterOptions(userThumbnails)}
            others={filterOptions(userThumbnails)}
            serialNo={`${srNoStart}.${index + 1}.2`}
            title={`Select ${char} Sibling ${index + 1} Children`}
            multiple={true}
            onSelect={handleSelectFace}
            sendSelection={handleSelectChange}
            selectedImage={formData[`${char} Sibling ${index + 1} Children`] || []}
            next={next}
            prev={prev}
          />
        </div>
      </div>
    ));
  };


  // const generateSiblingSelects = (count, char, gender, serialNoStart) => {
  //   const siblings = [];
  //   const options = gender === "male" ? filterOptions(males).slice(0, 10) : filterOptions(females).slice(0, 10);

  //   [...Array(count).keys()].forEach((elm, index) => {
  //     const title = gender === "male" ? `Select ${char} Brother ${index + 1}` : `Select ${char} Sister ${index + 1}`;
  //     const sibling = `${char} ${gender === "male" ? "Brother" : "Sister"} ${index + 1}`;

  //     siblings.push(
  //       <div className="sibling-container" key={`${serialNoStart}.${index + 1}`}>
  //         <div className="centered-selection">
  //           <CustomFaceOption
  //             question={sibling}
  //             options={options}
  //             others={filterOptions(userThumbnails)}
  //             serialNo={`${serialNoStart}.${index + 1}`}
  //             title={title}
  //             isSibling={true}
  //             maritalStatus={() => handleOpenMaritalStatusModal(sibling)}
  //             next={() => {
  //               if (!formData[`${sibling}MaritalStatus`]) {
  //                 handleOpenMaritalStatusModal(sibling);
  //               } else {
  //                 next(`${serialNoStart}.${index + 1}`);
  //               }
  //             }}
  //             prev={prev}
  //             onSelect={handleSelectFace}
  //             sendSelection={handleSelectChange}
  //             selectedImage={[formData[sibling]]}
  //           />
  //           {(formData[`${sibling}MaritalStatus`] === "married" || formData[`${sibling}MaritalStatus`] === "marriedWithKids") && (
  //             <CustomFaceOption
  //               question={`${sibling} Spouse`}
  //               options={gender === "male" ? filterOptions(females) : filterOptions(males)}
  //               others={filterOptions(userThumbnails)}
  //               serialNo={`${serialNoStart}.${index + 1}.1`}
  //               title={`Select ${char} Sibling's Spouse`}
  //               onSelect={handleSelectFace}
  //               sendSelection={handleSelectChange}
  //               selectedImage={[formData[`${sibling} Spouse`]]}
  //               next={next}
  //               prev={prev}
  //               isInternal={true}
  //             />
  //           )}
  //           {formData[`${sibling}MaritalStatus`] === "marriedWithKids" && (
  //             <CustomFaceOption
  //               question={`${sibling} Children`}
  //               options={filterOptions(kids)}
  //               others={filterOptions(userThumbnails)}
  //               serialNo={`${serialNoStart}.${index + 1}.2`}
  //               title={`Select ${char} Sibling's Children`}
  //               multiple={true}
  //               isInternal={true}
  //               next={next}
  //               prev={prev}
  //               onSelect={handleSelectFace}
  //               sendSelection={handleSelectChange}
  //               selectedImage={formData[`${sibling} Children`] || []}
  //             />
  //           )}
  //         </div>
  //       </div>
  //     );
  //   });

  //   return siblings;
  // };

  const handleClick = () => {
    setStart(true);
    fetchFormData();
  };

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnails/${eventName}`);
      if (response.status === 200) {
        setUserThumbnails(response.data);
        const malesData = response.data.filter((item) => item.gender === "Male");
        const groomData = response.data.filter((item) => item.gender === "Male" && item.avgAge >= 15 && item.avgAge <= 40);
        const brideData = response.data.filter((item) => item.gender === "Female" && item.avgAge >= 15 && item.avgAge <= 40);
        const femalesData = response.data.filter((item) => item.gender === "Female");
        const kids = response.data.filter((item) => item.avgAge <= 15);
        const uncles = response.data.filter((item) => item.gender === "Male" && item.avgAge >= 40);
        const aunts = response.data.filter((item) => item.gender === "Female" && item.avgAge >= 40);
        const grandParents = response.data.filter((item) => item.avgAge >= 50);
        const cousins = response.data.filter((item) => item.avgAge >= 10 && item.avgAge <= 40);

        setGrooms(groomData);
        setBrides(brideData);
        setMales(malesData);
        setFemales(femalesData);
        setKids(kids);
        setUncles(uncles);
        setAunts(aunts);
        setGrandParents(grandParents);
        setCousins(cousins);
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDataFetched.current) return;
    fetchThumbnails();
    isDataFetched.current = true;
  }, []);

  useEffect(() => {
    if (isFormDataUpdated) {
      saveFormDataToBackend(formData);
    }
  }, [formData]);

  const saveFormDataToBackend = async (formData) => {
    try {
      const response = await API_UTIL.post(`/saveSelectionFormData`, formData);
      console.log('Form data saved successfully to backend:', response.data);
    } catch (error) {
      console.error('Error saving form data to backend:', error);
    }
  };

  const fetchFormData = async () => {
    try {
      const formOwner = formData['form_owner'];
      const response = await API_UTIL.get(`/getSelectionFormData/${eventName}/${formOwner}`);
      if (response.data) {
        setFormData(response.data);
        updateSelectedValues(response.data);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSiblingReset = (setter, sibling) => {
    setFormData((prevState) => {
      const newFormData = { ...prevState };

      for (let key in newFormData) {
        if (key.startsWith(sibling)) {
          if (key.includes("Count")) {
            newFormData[key] = 0;
          } else {
            newFormData[key] = null;
          }
        }
      }
      return newFormData;
    });
    setter(0);
  };

  const handleSiblingChange = (setter, sibling, increment) => {
    setFormData((prevState) => {
      const newCount = prevState[`${sibling}SiblingCount`] + increment;

      if (newCount >= 0) {
        const updatedFormData = {
          ...prevState,
          [`${sibling}SiblingCount`]: newCount
        };

        // Add null placeholders for new siblings
        for (let i = 1; i <= newCount; i++) {
          const siblingKey = `${sibling === "groommale" ? "Groom Brother" : sibling === "groomfemale" ? "Groom Sister" : sibling === "bridemale" ? "Bride Brother" : "Bride Sister"} ${i}`;
          if (!updatedFormData[siblingKey]) {
            updatedFormData[siblingKey] = null;
          }
        }

        return updatedFormData;
      }

      return prevState;
    });

    // Update the sibling count state
    setter((prevCount) => {
      const newCount = prevCount + increment;
      return newCount >= 0 ? newCount : prevCount;
    });
  };

  const filterOptions = (options = []) => {
    return options.filter((option) => !selectedValues.has(option.face_url));
  };

  const next = (serialNo) => {
    const getNextElement = (currentSerial) => {
      if (currentSerial.toString().length === 1) {
        let nextElement = document.getElementsByClassName(currentSerial + 1)[0];
        if (nextElement) return nextElement;
        else {
          let nextSerial = ((currentSerial.toString().split('.').map(Number))[0] + 1).toString() + '.1'
          return document.getElementsByClassName(nextSerial)[0];
        }
      } else {
        let parts = currentSerial.toString().split('.').map(Number);
        parts[parts.length - 1] += 1;
        let nextSerial = parts.join('.');
        let nextElement = document.getElementsByClassName(nextSerial)[0];
        if (nextElement) return nextElement;
        else {
          let nextSerial = (parts[0] + 1)

          let nextElement = document.getElementsByClassName(nextSerial)[0];
          if (nextElement) return nextElement;
          nextSerial = (parts[0] + 1).toString() + '.1';
          nextElement = document.getElementsByClassName(nextSerial)[0];
          if (nextElement) return nextElement;
        }
      }
    };

    let nextElement;
    do {
      nextElement = getNextElement(serialNo);
      if (nextElement) {
        window.scrollTo({
          top: nextElement.offsetTop,
          behavior: "smooth",
        });
        break;
      } else {
        serialNo = (parseInt(serialNo.toString().split('.')[0]) + 1).toString();
      }
    } while (!nextElement);
  };

  const prev = (serialNo) => {
    const getNextElement = (currentSerial) => {
      if (currentSerial.toString().length === 1) {
        let nextElement = document.getElementsByClassName(currentSerial - 1)[0];
        if (nextElement) return nextElement;
        else {
          let nextSerial = ((currentSerial.toString().split('.').map(Number))[0] - 1).toString() + '.1'
          return document.getElementsByClassName(nextSerial)[0];
        }
      } else {
        let parts = currentSerial.toString().split('.').map(Number);
        parts[parts.length - 1] -= 1;
        let nextSerial = parts.join('.');
        let nextElement = document.getElementsByClassName(nextSerial)[0];
        if (nextElement) return nextElement;
        else {
          let nextSerial = (parts[0] - 1)

          let nextElement = document.getElementsByClassName(nextSerial)[0];
          if (nextElement) return nextElement;
          nextSerial = (parts[0] - 1).toString() + '.1';
          nextElement = document.getElementsByClassName(nextSerial)[0];
          if (nextElement) return nextElement;
        }
      }
    };

    let nextElement;
    do {
      nextElement = getNextElement(serialNo);
      if (nextElement) {
        window.scrollTo({
          top: nextElement.offsetTop,
          behavior: "smooth",
        });
        break;
      } else {
        serialNo = (parseInt(serialNo.toString().split('.')[0]) - 1).toString();
      }
    } while (!nextElement);
  };

  const handleSelectFace = async (question, faceUrl) => {
    setSelectedValues((prev) => new Set(prev).add(faceUrl));
  };

  const handleSelectChange = (question, selectedValue) => {
    setIsFormDataUpdated(true);
    setFormData((prevState) => {
      const newFormData = { ...prevState, [question]: selectedValue };
  
      if (question.includes("Siblings")) {
        const siblingType = question.split(" ")[0]+' '+question.split(" ")[1]; // E.g., "Groom Father"
        const siblingsArray = newFormData[question];
        
        // If a sibling is removed, find which one and clear its spouse and children fields
        const currentSiblings = new Set(siblingsArray || []);
        const previousSiblings = new Set(formData[question] || []);
  
        // Find removed siblings
        const removedSiblings = [...previousSiblings].filter(x => !currentSiblings.has(x));
        console.log("--------",removedSiblings)
        removedSiblings.forEach((removedSibling) => {
          const siblingIndex = [...previousSiblings].indexOf(removedSibling) + 1;
          const siblingBaseKey = `${siblingType} Sibling ${siblingIndex}`;
          console.log(siblingBaseKey,"--------")
          newFormData[`${siblingBaseKey} Spouse`] = null;
          newFormData[`${siblingBaseKey} Children`] = new Set();
        });
      }
  
      updateSelectedValues(newFormData);
      return newFormData;
    });
  };
  
  const updateSelectedValues = (formData) => {
    const newSelectedValues = new Set();
    Object.values(formData).forEach((value) => {
      if (Array.isArray(value) || value instanceof Set) {
        value.forEach((val) => newSelectedValues.add(val));
      } else {
        newSelectedValues.add(value);
      }
    });
    setSelectedValues(newSelectedValues);
  };
  

  const onSubmitForm = async () => {
    try {
      const response = await API_UTIL.post(`/saveSelectionFormData`, {
        ...formData,
        isFacesSelectionDone: true,
      });
      console.log("response : " + response);
      if (response.status === 200) {
        toast("Selection has been saved Successfully");

        setFormData((prevState) => ({
          ...prevState,
          isFacesSelectionDone: true,
        }));

        setIsFacesSelectionDone(true);

        console.log("Navigating to photo selection");
        navigate(`/photoSelection/${eventName}`);
      } else {
        throw new Error("Failed to save the selection");
      }
    } catch (error) {
      console.error("Error saving selection:", error);
      toast.error("Failed to save the selection. Please try again.");
    }
  };

  const handleSelectCharacter = async (character) => {
    try {
      const response = await API_UTIL.get(`/getSelectionFormData/${eventName}/${character}`);
      if (response.data) {
        setFormData(response.data);
        updateSelectedValues(response.data);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
    handleSelectChange("form_owner", character);

    console.log(`Selected character: ${character}`);
  };

  const checkCharacterSelected = () => {
    console.log(formData['form_owner']);
    if (formData['form_owner'] != null) {
      setIsCharacterSelected(true);
    }
  }

  return (
    <>
      <section className="albumSelectionForm">
        {!isCharacterSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0, 0.71, 0.2, 1.01],
            }}
            className="entry"
          >
            <Header />
            <h2>Are you a Couple, Groom or Bride</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div
                onClick={() => handleSelectCharacter("Couple")}
                className={`card ${formData['form_owner'] === "Couple" ? "selected" : ""}`}
              >
                <img src='assets/couple_icon.png' />
              </div>
              <div
                onClick={() => handleSelectCharacter("Groom")}
                className={`card ${formData['form_owner'] === "Groom" ? "selected" : ""}`}
              >
                <img src='assets/groom_icon.png' />
              </div>
              <div
                onClick={() => handleSelectCharacter("Bride")}
                className={`card ${formData['form_owner'] === "Bride" ? "selected" : ""}`}
              >
                <img src='assets/bride_icon.png' />
              </div>
            </div>
            <button onClick={checkCharacterSelected}>Next</button>
          </motion.div>
        )}


        {isCharacterSelected && !start && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0, 0.71, 0.2, 1.01],
            }}
            className="entry"
          >
            <Header />
            <h2>Let's Start with Selecting Faces</h2>
            <button onClick={handleClick}>Start</button>
          </motion.div>
        )}
        {!!userThumbnails.length && start && (
          <>
           <div className="couple-container" key={`Couple`}>
           <div className="centered-selection">
            <CustomFaceOption
              serialNo={1}
              options={filterOptions(grooms).slice(0, 10)}
              others={filterOptions(userThumbnails)}
              title="Please select the groom's image"
              next={next}
              prev={prev}
              question="Groom"
              sendSelection={handleSelectChange}
              isFirst={true}
              onSelect={handleSelectFace}
              selectedImage={[formData.Groom]}
            />
            <CustomFaceOption
              title="Please select the bride's image"
              next={next}
              prev={prev}
              options={filterOptions(brides).slice(0, 10)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              question="Bride"
              isInternal = {true}
              sendSelection={handleSelectChange}
              selectedImage={[formData.Bride]}
            />
            </div>
            </div>
            {generateCoupleFamily("Groom",'3')}
            {generateCoupleFamily("Bride",'5')}
            {generateParentSection("Father", "Groom", '3')}
            {generateParentSection("Mother", "Groom", '4')}
            {generateParentSection("Father", "Bride", '5')}
            {generateParentSection("Mother", "Bride", '6')}
            {generateSiblingFamilySection(formData["Groom Brothers"], "Groom Brother", 5)}
            {generateSiblingFamilySection(formData["Groom Sisters"], "Groom Sister", 6)}
            {generateSiblingFamilySection(formData["Bride Brothers"], "Bride Brother", 9)}
            {generateSiblingFamilySection(formData["Bride Sisters"], "Bride Sister", 10)}
            {generateParentSiblingSelects(formData['Groom Mother Siblings'], "Groom Mother",'3')}
            {generateParentSiblingSelects(formData['Groom Father Siblings'], "Groom Father",'4')}
            {generateParentSiblingSelects(formData['Bride Mother Siblings'], "Bride Mother",'5')}            
            {generateParentSiblingSelects(formData['Bride Father Siblings'], "Bride Father",'6')} 
            <CustomFaceOption
              serialNo={12}
              title="Please select Kids"
              next={next}
              prev={prev}
              options={filterOptions(kids)}
              others={filterOptions(userThumbnails)}
              question="Kids"
              multiple={true}
              sendSelection={handleSelectChange}
              onSelect={handleSelectFace}
              selectedImage={formData.Kids}
            />
            {/* <CustomFaceOption
              serialNo={13}
              title="Please select Level 1 Cousins"
              next={next}
              prev={prev}
              question="Level 1 Cousins"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={formData["Level 1 Cousins"]}
            /> */}
             {generateCousinSelects(formData['Level 1 Cousins'], 13)}
            <CustomFaceOption
              serialNo={14}
              title="Please select Level 2 Cousins"
              next={next}
              prev={prev}
              question="Level 2 Cousins"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={formData["Level 2 Cousins"]}
            />
            <CustomFaceOption
              serialNo={15}
              title="Please select Uncles"
              next={next}
              prev={prev}
              question="Uncles"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(uncles)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={formData.Uncles}
            />
            <CustomFaceOption
              serialNo={16}
              title="Please select Aunts"
              next={next}
              prev={prev}
              options={filterOptions(aunts)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              question="Aunts"
              multiple={true}
              sendSelection={handleSelectChange}
              selectedImage={formData.Aunts}
            />

            <CustomFaceOption
              serialNo={17}
              title="Please select Grand Parents"
              next={next}
              prev={prev}
              options={filterOptions(grandParents)}
              others={filterOptions(userThumbnails)}
              question="Grand Parents"
              multiple={true}
              sendSelection={handleSelectChange}
              onSelect={handleSelectFace}
              selectedImage={formData["Grand Parents"]}
            />
            <CustomFaceOption
              serialNo={18}
              title="Please select Other Important Relatives"
              next={next}
              prev={prev}
              question="Other Important Relatives"
              multiple={true}
              sendSelection={handleSelectChange}
              others={filterOptions(userThumbnails)}
              options={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={formData["Other Important Relatives"]}
            />
            <CustomFaceOption
              serialNo={19}
              title="Please select Friends"
              next={next}
              prev={prev}
              question="Friends"
              multiple={true}
              sendSelection={handleSelectChange}
              others={filterOptions(userThumbnails)}
              options={filterOptions(cousins)}
              onSelect={handleSelectFace}
              selectedImage={formData.Friends}
            />
            <CustomFaceOption
              serialNo={20}
              title="Please select Other Important People"
              next={next}
              isSubmit={true}
              prev={prev}
              question="Other Important People"
              multiple={true}
              sendSelection={handleSelectChange}
              others={filterOptions(userThumbnails)}
              options={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              sendSubmitAction={onSubmitForm}
              selectedImage={formData["Other Important People"]}
            />
           
          </>
        )}
      </section>

      <Modal isOpen={showMaritalStatusModal} onClose={handleCloseMaritalStatusModal}>
        <div className="marital-status">
          <br /><br />
          <label>Marital Status:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="maritalStatus"
                value="unmarried"
                checked={formData[`${currentSibling}MaritalStatus`] === "unmarried"}
                onChange={() => handleMaritalStatusChange("unmarried")}
              />
              Unmarried
            </label>
            <label>
              <input
                type="radio"
                name="maritalStatus"
                value="married"
                checked={formData[`${currentSibling}MaritalStatus`] === "married"}
                onChange={() => handleMaritalStatusChange("married")}
              />
              Married
            </label>
            <label>
              <input
                type="radio"
                name="maritalStatus"
                value="marriedWithKids"
                checked={formData[`${currentSibling}MaritalStatus`] === "marriedWithKids"}
                onChange={() => handleMaritalStatusChange("marriedWithKids")}
              />
              Married with Kids
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FaceSelection;

