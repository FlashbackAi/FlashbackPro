import React, { useEffect, useRef, useState } from "react";
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
import Footer from "../../../components/Footer/Footer";
import "../../../components/Footer/Footer.css";
import AppBar from "../../../components/AppBar/AppBar";

const FaceSelection = () => {
  const isDataFetched = useRef(false);
  const [lastIndex, setLastIndex] = useState(0);
  const [start, setStart] = useState(false);
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
    marital_status:null,
    groom: {
      image: null,
      father: {
        image: null,
        parents: [],
        siblings: []
      },
      mother: {
        image: null,
        parents: [],
        siblings: []
      },
      brothers: [],
      sisters: []
    },
    bride: {
      image: null,
      father: {
        image: null,
        parents: [],
        siblings: []
      },
      mother: {
        image: null,
        parents: [],
        siblings: []
      },
      brothers: [],
      sisters: []
    },
    kids:null,
    otherKids:[],
    otherCousins: [],
    uncles: [],
    aunts: [],
    grandParents: [],
    otherImportantRelatives: [],
    friends: [],
    isFacesSelectionDone: null
  });

  const missingThumbnail = {
    face_url: 'assets/missing.jpg',
    gender: 'unknown',
    avgAge: 0
  };
  
  // const filterOptions = (options = []) => {
  //   return [missingThumbnail, ...options.filter((option) => !selectedValues.has(option.face_url))];
  // };
  

  
  const filterOptions = (options = []) => {
    return options.filter((option) => {
      // Always include the missing thumbnail
      if (option.face_url === 'assets/missing.jpg') {
        return true;
      }
      // Exclude already selected values, except for the missing thumbnail
      return !selectedValues.has(option.face_url);
    });
  };

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
    
    if(currentSibling === 'groom'|| currentSibling === 'bride'){
      handleSelectChange(`marital_status`, status);
    }
    // }else{
    // handleSelectChange(`${currentSibling}.maritalStatus`, status);
    // }
    handleCloseMaritalStatusModal();
  };
  
  const getNestedProperty = (obj, path) => {
  
    const p = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return p;
  };
  const extractId = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1].split(".")[0];
};
  
  const generateFamilySection = (char, srNoStart) => {
    const familyData = formData[char.toLowerCase()];
    if (!familyData || !familyData.image) return null;
  
    const userId = extractId(familyData.image)
    const suggestions = formData.suggestions?.[userId] || {};
    

    const parents = [
      {
        label: `${char} Father`,
        question: `${char.toLowerCase()}.father.image`,
        gender: 'Male',
        options: suggestions.father || [],
        isInternal: false
      },
      {
        label: `${char} Mother`,
        gender: 'Female',
        question: `${char.toLowerCase()}.mother.image`,
        options: suggestions.mother || [],
        isInternal: true
      },
    ];

    const siblings = [
      {
        label: `${char} Brothers`,
        question: `${char.toLowerCase()}.brothers`,
        gender: 'Male',
        options: suggestions.siblings?.filter(sibling => sibling.gender === 'Male') || [],
        isInternal: false
      },
      {
        label: `${char} Sisters`,
        question: `${char.toLowerCase()}.sisters`,
        gender: 'Female',
        options: suggestions.siblings?.filter(sibling => sibling.gender === 'Female') || [],
        isInternal: true
      },
    ];
    console.log(parents)

    return (
      <div className={`${char.toLowerCase()}-family-container`} key={`${char}-family`}>
        <div className="centered-selection">
          <div className="sibling-image-container">
            <div className="question-header">
              <div className="icon"></div>
              <div className="question">{char}</div>
            </div>
            <div className="selected-face">
              <img src={familyData.image} className="selected-image" />
            </div>
          </div>
          {parents.map((parent, index) => (
            <CustomFaceOption
              key={parent.question}
              serialNo={`${srNoStart}.1`}
              title={`Please select the ${parent.label.toLowerCase()}`}
              next={next}
              prev={prev}
              question={parent.question}
              sendSelection={handleSelectChange}
              options={filterOptions(removeDuplicates([...parent.options.slice(0, 10),missingThumbnail,...userThumbnails.filter((item) => item.avgAge >= 30 && item.gender === parent.gender)]))}             
              // options={filterOptions(parent.options).slice(0, 10)}
              // others={[missingThumbnail,...filterOptions(userThumbnails)]}
              onSelect={handleSelectFace}
              selectedImage={getNestedProperty(formData, parent.question) || []}
              isInternal={parent.isInternal}
            />
          ))}
        </div>
        <div className="centered-selection">
          <div className="sibling-image-container">
            <div className="question-header">
              <div className="icon"></div>
              <div className="question">{char}</div>
            </div>
            <div className="selected-face">
              <img src={familyData.image} className="selected-image" />
            </div>
          </div>
          {siblings.map((sibling, index) => (
            <CustomFaceOption
              key={`${sibling.question}.${index + 1}`}
              serialNo={`${srNoStart}.2`}
              title={`Please select the ${sibling.label.toLowerCase()}`}
              next={next}
              prev={prev}
              question={sibling.question}
              sendSelection={handleSelectChange}
              options={filterOptions(removeDuplicates([...sibling.options.slice(0, 10),missingThumbnail,...userThumbnails.filter((item) => item.avgAge >= 16 && item.avgAge <= 50  && item.gender === sibling.gender)]))}             
              
              // options={filterOptions(sibling.options).slice(0,10)}
              // others={[missingThumbnail,...filterOptions(userThumbnails)]}
              onSelect={handleSelectFace}
              selectedImage={getNestedProperty(formData, sibling.question) || []}
              multiple={true}
              isInternal={sibling.isInternal}
            />
          ))}
        </div>
      </div>
    );
  };
  

  // const generateFamilySection = (char, srNoStart) => {
  //   const familyData = formData[char.toLowerCase()];
  //   if (!familyData || !familyData.image) return null;
  
  //   const parents = [
  //     {
  //       label: `${char} Father`,
  //       question: `${char.toLowerCase()}.father.image`,
  //       options: uncles,
  //       isInternal:false
  //     },
  //     {
  //       label: `${char} Mother`,
  //       question: `${char.toLowerCase()}.mother.image`,
  //       options: aunts,
  //       isInternal:true
  //     },
  //   ];
  
  //   const siblings = [
  //     {
  //       label: `${char} Brothers`,
  //       question: `${char.toLowerCase()}.brothers`,
  //       gender: 'male',
  //       isInternal:false
  //     },
  //     {
  //       label: `${char} Sisters`,
  //       question: `${char.toLowerCase()}.sisters`,
  //       gender: 'female',
  //       isInternal:true
  //     },
  //   ] ;
  
  //   return (
  //     <div className={`${char.toLowerCase()}-family-container`} key={`${char}-family`}>
  //       <div className="centered-selection">
  //         <div className="sibling-image-container">
  //           <div className="question-header">
  //             <div className="icon"></div>
  //             <div className="question">{char}</div>
  //           </div>
  //           <div className="selected-face">
  //             <img src={familyData.image} className="selected-image" />
  //           </div>
  //         </div>
  //         {parents.map((parent, index) => (
  //           <CustomFaceOption
  //             key={parent.question}
  //             serialNo={`${srNoStart}.1`}
  //             title={`Please select the ${parent.label.toLowerCase()}`}
  //             next={next}
  //             prev={prev}
  //             question={parent.question}
  //             sendSelection={handleSelectChange}
  //             options={filterOptions(parent.options).slice(0, 10)}
  //             others={filterOptions(userThumbnails)}
  //             onSelect={handleSelectFace}
  //             selectedImage={getNestedProperty(formData, parent.question) || []}
  //             isInternal={parent.isInternal}
  //           />
  //         ))}
  //       </div>
  //       <div className="centered-selection">
  //       <div className="sibling-image-container">
  //           <div className="question-header">
  //             <div className="icon"></div>
  //             <div className="question">{char}</div>
  //           </div>
  //           <div className="selected-face">
  //             <img src={familyData.image} className="selected-image" />
  //           </div>
  //         </div>
  //         {siblings.map((sibling, index) => (
  //           <CustomFaceOption
  //             key={`${sibling.question}.${index + 1}`}
  //             serialNo={`${srNoStart}.2`}
  //             title={`Please select the ${sibling.label.toLowerCase()}`}
  //             next={next}
  //             prev={prev}
  //             question={sibling.question}
  //             sendSelection={handleSelectChange}
  //             options={filterOptions(sibling.gender === 'male' ? males : sibling.gender === 'female' ? females : males.concat(females)).slice(0, 10)}
  //             others={filterOptions(userThumbnails)}
  //             onSelect={handleSelectFace}
  //             selectedImage={getNestedProperty(formData, sibling.question) || []}
  //             multiple={true}
  //             isInternal={sibling.isInternal}
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };
  
  const generateParentSection = (char, parentKey, srNoStart) => {
    const parentData = formData[char.toLowerCase()][parentKey];
    
    if (!parentData.image) return null;
    const userId = extractId(parentData.image);
      const suggestions = formData.suggestions?.[userId] || {};
      console.log(suggestions)
    return (
      <div className='parent-container' key={`${char} ${parentKey} Family`}>
        <div className="centered-selection">
          <div className="sibling-image-container">
            <div className="question-header">
              <div className="icon"></div>
              <div className="question">{char} {parentKey}</div>
            </div>
            <div className="selected-face">
              <img src={parentData.image} className="selected-image" />
            </div>
          </div>
          <CustomFaceOption
            question={`${char.toLowerCase()}.${parentKey}.parents`}
            // options={filterOptions([...suggestions?.father?.slice(0,8)||[],...suggestions?.mother?.slice(0,8)||[]])}
            options={filterOptions(removeDuplicates([...suggestions?.father?.slice(0, 10)||[],missingThumbnail,...suggestions?.mother?.slice(0, 10)||[],...userThumbnails.filter((item) => item.avgAge >= 40)]))}             
            others={[missingThumbnail,...filterOptions(userThumbnails)]}
            title={`Select ${char} ${parentKey} Parents`}
            onSelect={handleSelectFace}
            sendSelection={handleSelectChange}
            selectedImage={getNestedProperty(formData, `${char.toLowerCase()}.${parentKey}.parents`) || []}
            next={next}
            prev={prev}
            serialNo={srNoStart}
            multiple={true}
          />
          <CustomFaceOption
            question={`${char.toLowerCase()}.${parentKey}.siblings`}
            // options={filterOptions(suggestions?.siblings||[]).slice(0,20)}
            options={filterOptions(removeDuplicates([...suggestions?.siblings?.slice(0, 10)||[],missingThumbnail,...userThumbnails.filter((item) => item.avgAge >= 16)]))}             
            others={[missingThumbnail,...filterOptions(userThumbnails)]}
            title={`Select ${char} ${parentKey} Siblings`}
            onSelect={handleSelectFace}
            sendSelection={handleSelectChange}
            selectedImage={getNestedProperty(formData, `${char.toLowerCase()}.${parentKey}.siblings`) || []}
            next={next}
            prev={prev}
            isInternal={true}
            multiple={true}
          />
        </div>
      </div>
    );
  };
  

  
  const generateSiblingFamilySection = (siblings, char, parentKey, srNoStart) => {
    if (!siblings || siblings.length === 0) return null;
  
    return siblings.map((sibling, index) => {
      const userId = extractId(sibling);
      const suggestions = formData.suggestions?.[userId] || {};
      let opt = userThumbnails;
      let ques;
      console.log(suggestions?.user?.gender)
  
      if (parentKey === "Brother" || parentKey === "Sister") {
        ques = `${char.toLowerCase()}.${parentKey}`;
        opt = suggestions?.kids || [];
      } else {
        ques = `${char.toLowerCase()}.${parentKey}.Siblings`;
        opt = userThumbnails;
      }
  
      return (
        <div className={`${char.toLowerCase()}-${parentKey.toLowerCase()}-sibling-family-container`} key={`${char} ${parentKey} Sibling ${index + 1}`}>
          <div className="centered-selection">
            <div className="sibling-image-container">
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">{char} {parentKey} Sibling {index + 1}</div>
              </div>
              <div className="selected-face">
                <img src={sibling} alt={`selected ${index + 1}`} className="selected-image" />
              </div>
            </div>
            <CustomFaceOption
              question={`${ques}.${index + 1}.spouse`}
              // options={filterOptions(suggestions?.spouse||[]).slice(0, 10)}
              options={filterOptions(removeDuplicates([...suggestions?.spouse?.slice(0, 10)||[],missingThumbnail,...userThumbnails.filter((item) => item.avgAge >= 16 && suggestions?.user?.gender!==item.gender)]))}             
              
              // others={[missingThumbnail, ...filterOptions(userThumbnails)]}
              serialNo={`${srNoStart}.${index + 1}`}
              title={`Select ${char} ${parentKey} ${index + 1} Spouse`}
              onSelect={handleSelectFace}
              sendSelection={handleSelectChange}
              selectedImage={getNestedProperty(formData, `${ques}.${index + 1}.spouse`) || []}
              next={next}
              prev={prev}
            />
            <CustomFaceOption
              question={`${ques}.${index + 1}.children`}
              // options={filterOptions(suggestions?.kids||[]).slice(0,10)}
              options={filterOptions(removeDuplicates([...suggestions?.kids?.slice(0, 10)||[],missingThumbnail,...userThumbnails.filter((item) => item.avgAge <= 40)]))}             
              
              others={[missingThumbnail, ...filterOptions(userThumbnails)]}
              title={`Select ${char} ${parentKey} Sibling ${index + 1} Children`}
              multiple={true}
              onSelect={handleSelectFace}
              sendSelection={handleSelectChange}
              selectedImage={getNestedProperty(formData, `${ques}.${index + 1}.children`) || []}
              next={next}
              prev={prev}
              isInternal={true}
            />
          </div>
        </div>
      );
    });
  };
  
  

  // const generateSiblingFamilySection = (siblings, char, parentKey, srNoStart) => {
  //   if (!siblings || siblings.length === 0) return null;
  //   //const opt = kids ? (parentKey === "Brothers" || parentKey ==="Sisters") : userThumbnails
  //   let opt;
  //   let ques;
  //   if(parentKey === "Brother" || parentKey ==="Sister")
  //   {
  //     ques = `${char.toLowerCase()}.${parentKey}`
  //     opt = kids;
  //   }
  //   else{
  //     ques = `${char.toLowerCase()}.${parentKey}.Siblings`
  //     opt = userThumbnails
  //   }
  //   return siblings.map((sibling, index) => (
  //     <div className={`${char.toLowerCase()}-${parentKey.toLowerCase()}-sibling-family-container`} key={`${char} ${parentKey} Sibling ${index + 1}`}>
  //       <div className="centered-selection">
  //         <div className="sibling-image-container">
  //           <div className="question-header">
  //             <div className="icon">
  //               <ArrowRight className="arrow" />
  //             </div>
  //             <div className="question">{char} {parentKey} Sibling {index + 1}</div>
  //           </div>
  //           <div className="selected-face">
  //             <img src={sibling} alt={`selected ${index + 1}`} className="selected-image" />
  //           </div>
  //         </div>
  //         <CustomFaceOption
  //           question={`${ques}.${index + 1}.spouse`}
  //           options={filterOptions(userThumbnails)}
  //           others={filterOptions(userThumbnails)}
  //           serialNo={`${srNoStart}.${index + 1}`}
  //           title={`Select ${char} ${parentKey} ${index + 1} Spouse`}
  //           onSelect={handleSelectFace}
  //           sendSelection={handleSelectChange}
  //           selectedImage={getNestedProperty(formData, `${ques}.${index + 1}.spouse`) || []}
  //           next={next}
  //           prev={prev}
  //         />
  //         <CustomFaceOption
  //           question={`${ques}.${index + 1}.children`}
  //           options={filterOptions(opt)}
  //           others={filterOptions(userThumbnails)}
  //           // serialNo={`${srNoStart}.${index + 1}.2`}
  //           title={`Select ${char} ${parentKey} Sibling ${index + 1} Children`}
  //           multiple={true}
  //           onSelect={handleSelectFace}
  //           sendSelection={handleSelectChange}
  //           selectedImage={getNestedProperty(formData, `${ques}.${index + 1}.children`) || []}
  //           next={next}
  //           prev={prev}
  //           isInternal={true}
  //         />
  //       </div>
  //     </div>
  //   ));
  // };

  const generateCousinSections = (parentData, parentKey, srNoStart) => {
    if (!parentData || !parentData.Siblings) return null;
    let idx=0;
    return Object.keys(parentData.Siblings).map((siblingIndex) => {
      const siblingData = parentData.Siblings[siblingIndex];
      if (!siblingData.children) return null;
      let key = parentKey.replace(/\s+/g, '.').toLowerCase();
      return siblingData.children.map((cousin, cousinIndex) => {
        const userId = extractId(cousin);
        const suggestions = formData.suggestions?.[userId] || {};
        idx++
        return(
        <div className="cousin-family-container" key={`${key} Cousin ${srNoStart}.${siblingIndex + 1}.${cousinIndex + 1}`}>
          <div className="centered-selection">
            <div className="sibling-image-container">
              <div className="question-header">
                <div className="icon">
                </div>
                <div className="question">Cousin </div>
              </div>
              <div className="selected-face">
                <img src={cousin} alt={`selected ${cousinIndex + 1}`} className="selected-image" />
              </div>
            </div>
            <CustomFaceOption
              question={`${key}.Siblings.${siblingIndex}.Children.${cousinIndex+1}.spouse`}
              // options={filterOptions(suggestions?.spouse||[]).slice(0,10)}
              //others={[missingThumbnail,...filterOptions(userThumbnails)]}
              options={filterOptions(removeDuplicates([...suggestions?.spouse?.slice(0, 10)||[],missingThumbnail,...userThumbnails.filter((item) => item.avgAge >= 20 && suggestions?.user?.gender!==item.gender)]))}             
              serialNo={`${srNoStart}.${idx}`}
              title={`Select Cousin's Spouse`}
              onSelect={handleSelectFace}
              sendSelection={handleSelectChange}
              selectedImage={getNestedProperty(formData, `${key}.Siblings.${siblingIndex}.Children.${cousinIndex+1}.spouse`) || []}
              next={next}
              prev={prev}
            />
            <CustomFaceOption
              question={`${key}.Siblings.${siblingIndex}.Children.${cousinIndex+1}.children`}
              options={filterOptions(removeDuplicates([...suggestions?.kids?.slice(0, 10)||[],missingThumbnail,...userThumbnails.filter((item) => item.avgAge <= 20)]))}             
              // options={filterOptions(suggestions?.kids||[]).slice(0,10)}
              // others={[missingThumbnail,...filterOptions(userThumbnails)]}
              serialNo={`${srNoStart}.${siblingIndex + 1}.${cousinIndex + 1}.2`}
              title={`Select Cousin's Children`}
              multiple={true}
              onSelect={handleSelectFace}
              sendSelection={handleSelectChange}
              selectedImage={getNestedProperty(formData, `${key}.Siblings.${siblingIndex}.Children.${cousinIndex+1}.children`) || []}
              next={next}
              prev={prev}
              isInternal={true}
            />
          </div>
        </div>
       );
      });
    });
  };


    const generateCousinSections1 = (parentData, parentKey, srNoStart) => {
    let idx=0;
      if (!parentData.children) return null;
      return parentData.children.map((cousin, cousinIndex) => {
        idx++
        return(
        <div className="cousin-family-container" key={`${parentKey} Cousin ${srNoStart}.${cousinIndex + 1}`}>
          <div className="centered-selection">
            <div className="sibling-image-container">
              <div className="question-header">
                <div className="icon">
                </div>
                <div className="question">Cousin </div>
              </div>
              <div className="selected-face">
                <img src={cousin} alt={`selected ${cousinIndex + 1}`} className="selected-image" />
              </div>
            </div>
            <CustomFaceOption
              question={`${parentKey.toLowerCase()}.Siblings.children.${cousinIndex}.spouse`}
              options={filterOptions(userThumbnails)}
              others={[missingThumbnail,...filterOptions(userThumbnails)]}
              serialNo={`${srNoStart}.${idx}`}
              title={`Select Cousin's Spouse`}
              onSelect={handleSelectFace}
              sendSelection={handleSelectChange}
              selectedImage={getNestedProperty(formData, `${parentKey.toLowerCase()}.Siblings.children.${cousinIndex}.spouse`) || []}
              next={next}
              prev={prev}
            />
            <CustomFaceOption
              question={`${parentKey.toLowerCase()}.Siblings.children.${cousinIndex}.children`}
              options={filterOptions(kids)}
              others={[missingThumbnail,...filterOptions(userThumbnails)]}
              serialNo={`${srNoStart}.${cousinIndex + 1}.2`}
              title={`Select Cousin's Children`}
              multiple={true}
              onSelect={handleSelectFace}
              sendSelection={handleSelectChange}
              selectedImage={getNestedProperty(formData, `${parentKey}.children`) || []}
              next={next}
              prev={prev}
              isInternal={true}
            />
          </div>
        </div>
       );
      });
  };

  

  const handleClick = () => {
    setStart(true);
    //fetchFormData();
  };

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnails/${eventName}`);
      if (response.status === 200) {
        setUserThumbnails(response.data);
        const malesData = response.data.filter((item) => item.gender === "Male");
        const groomData = response.data.filter((item) => item.gender === "Male" && item.avgAge >= 15 && item.avgAge <= 45);
        const brideData = response.data.filter((item) => item.gender === "Female" && item.avgAge >= 15 && item.avgAge <= 45);
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
           // const correctedData = mapDataToStateStructure(formData, response.data.Attributes);
            setFormData(response.data);
            updateSelectedValues(response.data);
        }
    } catch (error) {
        console.error('Error fetching form data:', error);
    } finally {
        setIsLoading(false);
    }
};

  const next = (serialNo) => {
    const getNextElement = (currentSerial) => {
      console.log("currentSerial",currentSerial)
      if (!currentSerial.toString().includes('.')) {
        let nextSerial = ((currentSerial.toString().split('.').map(Number))[0] + 1).toString();
        let nextElement = document.getElementsByClassName(nextSerial)[0];
         console.log("checked",nextSerial)
        if (nextElement) return nextElement;
        else {
          let nextSerial = ((currentSerial.toString().split('.').map(Number))[0] + 1).toString() + '.1'
          console.log("checked",nextSerial)
          return document.getElementsByClassName(nextSerial)[0];
        }
      } else {
        let parts = currentSerial.toString().split('.').map(Number);
        parts[parts.length - 1] += 1;
        let nextSerial = parts.join('.');
        let nextElement = document.getElementsByClassName(nextSerial)[0];
        console.log("checked",nextSerial)
        if (nextElement) return nextElement;
        else {
          let nextSerial = (parts[0] + 1)

          let nextElement = document.getElementsByClassName(nextSerial)[0];
          console.log("checked",nextSerial)
          if (nextElement) return nextElement;
          nextSerial = (parts[0] + 1).toString() + '.1';
          nextElement = document.getElementsByClassName(nextSerial)[0];
          console.log("checked",nextSerial)
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
        console.log("newSerial",serialNo)
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

  const fetchFamilySuggestions = async (userId) => {


    
    const response = await API_UTIL.get(`/getFamilySuggestions/${userId}/${eventName}`);
    const data = await response.data;
    return data;
  };
  
  const handleSelectFace = async (question, faceUrl) => {
    setSelectedValues((prev) => new Set(prev).add(faceUrl));

    if (faceUrl && question !== 'form_owner') {
        // Fetch suggestions asynchronously
        const parts = faceUrl.toString().split("/");
        const userId =  parts[parts.length - 1].split(".")[0]
        const suggestions = await fetchFamilySuggestions(userId);
        if(faceUrl){
        setFormData((prevState) => {
            const newFormData = { ...prevState };
            newFormData.suggestions = newFormData.suggestions || {}; // Ensure the suggestions object exists
            newFormData.suggestions[userId] = suggestions; // Save groom suggestions
            console.log(newFormData);
            return newFormData;
        });
      }else{
        
        setFormData((prevState) => {
          const newFormData = { ...prevState };
          newFormData.suggestions = newFormData.suggestions || {}; // Ensure the suggestions object exists
          newFormData.suggestions[userId] = []; // Save groom suggestions
          console.log(newFormData);
          return newFormData;
      });
      }
    }
};


  const handleSelectChange = (question, selectedValue) => {
    setIsFormDataUpdated(true);
    setFormData((prevState) => {
        const newFormData = { ...prevState };
        const keys = question.split('.');
        let data = newFormData;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                if (Array.isArray(data[key]) && typeof selectedValue === 'string') {
                    // If the existing data is an array and the new value is a string,
                    // replace or append the new value appropriately
                    data[key] = data[key].map((item, idx) => idx === keys.length - 1 ? { image: selectedValue, spouse: null, children: [] } : item);
                } else {
                    data[key] = selectedValue;
                }
            } else {
                if (!data[key]) {
                    data[key] = {};
                }
                data = data[key];
            }
        });

        updateSelectedValues(newFormData);
        return newFormData;
    });
};


  const updateSelectedValues = (formData) => {
    const newSelectedValues = new Set();
    const extractValues = (data) => {
      if (Array.isArray(data)) {
        data.forEach((val) => newSelectedValues.add(val));
      } else if (typeof data === 'object' && data !== null) {
        Object.values(data).forEach(extractValues);
      } else {
        newSelectedValues.add(data);
      }
    };
    extractValues(formData);
    setSelectedValues(newSelectedValues);
  };

  const onSubmitForm = async () => {
    try {
      const response = await API_UTIL.post(`/saveSelectionFormData`, {
        ...formData,
        isFacesSelectionDone: true,
      });
      if (response.status === 200) {
        toast("Selection has been saved Successfully");

        setFormData((prevState) => ({
          ...prevState,
          isFacesSelectionDone: true,
        }));

        setIsFacesSelectionDone(true);

        console.log("Navigating to photo selection");
        navigate(`/photoSelection/${eventName}/${formData['form_owner']}`);
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
  };

  const checkCharacterSelected = () => {
    if (formData['form_owner'] != null) {
      setIsCharacterSelected(true);
      
      setStart(true)
    }
  }

  const removeDuplicates = (array) => {
    const uniqueUrls = new Set();
    return array.filter((item) => {
      if (!uniqueUrls.has(item.face_url)) {
        uniqueUrls.add(item.face_url);
        return true;
      }
      return false;
    });
  };

  return (
    <>
    <AppBar/>
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
            <Header/>
            <h2>Please Select the Album type</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              
              <div
                onClick={() => handleSelectCharacter("Groom")}
                className={`card ${formData['form_owner'] === "Groom" ? "selected" : ""}`}
              >
                <img src='assets/groom_icon.png' alt="Groom Icon" />
                <div className="icon-text">Groom Side</div>
              </div>
              <div
                onClick={() => handleSelectCharacter("Bride")}
                className={`card ${formData['form_owner'] === "Bride" ? "selected" : ""}`}
              >
                <img src='assets/bride_icon.png' alt="Bride Icon" />
                <div className="icon-text">Bride Side</div>
              </div>
              <div
                onClick={() => handleSelectCharacter("Couple")}
                className={`card ${formData['form_owner'] === "Couple" ? "selected" : ""}`}
              >
                <img src='assets/couple_icon.png' alt="Couple Icon" />
                <div className="icon-text">Bride and Groom Side</div>
              </div>
            </div>

            <button onClick={checkCharacterSelected}>Next</button>
          </motion.div>
        )}

          {/* {isCharacterSelected && !start && (
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
          )} */}
        {!!userThumbnails.length && start && (
          <>
            <div className="couple-container" key={`Couple`}>
              <div className="centered-selection">
                <CustomFaceOption
                  serialNo={1}
                  options={filterOptions(removeDuplicates([...grooms.slice(0, 5),...userThumbnails.filter((item) => item.gender === "Male"&& item.avgAge > 10  )]))}
                  // others={filterOptions(userThumbnails)}
                  title="Please select the Groom's image"
                  next={next}
                  prev={prev}
                  question="groom.image"
                  sendSelection={handleSelectChange}
                  isFirst={true}
                  onSelect={handleSelectFace}
                  selectedImage={[formData.groom.image]}
                  isSibling= {true}
                  maritalStatus={() => handleOpenMaritalStatusModal('groom')}
                />
                <CustomFaceOption
                  title="Please select the Bride's image"
                  next={next}
                  prev={prev}
                  options={filterOptions(removeDuplicates([...brides.slice(0, 5),...userThumbnails.filter((item) => item.gender === "Female" && item.avgAge >= 20)]))}
                  others={filterOptions(userThumbnails)}
                  onSelect={handleSelectFace}
                  question="bride.image"
                  isInternal={true}
                  sendSelection={handleSelectChange}
                  selectedImage={[formData.bride.image]}
                />
                {(formData[`marital_status`] ==="marriedWithKids") && (
                  <CustomFaceOption
                    question={`kids`}
                    options={filterOptions(kids)}
                    others={filterOptions(userThumbnails)}
                    isInternal ={true}
                    title={`Select Kids`}
                    onSelect={handleSelectFace}
                    sendSelection={handleSelectChange}
                    selectedImage={formData[`kids`] || []}
                    next={next}
                    prev={prev}
                  />
               )}
              </div>
            </div>

            {/* groom */}
            {generateFamilySection("Groom", '2')}
            {generateFamilySection("Bride", '3')}
            {generateSiblingFamilySection(formData.groom.brothers, "Groom", "Brother", 4)}
            {generateSiblingFamilySection(formData.groom.sisters, "Groom", "Sister", 5)}
            {generateParentSection("Groom", "father", '6')}
            {generateSiblingFamilySection(formData.groom.father.siblings, "Groom", "father", 7)}
            {generateCousinSections(formData.groom.father, 'Groom Father', 8)}
            {generateParentSection("Groom", "mother", '9')}
            {generateSiblingFamilySection(formData.groom.mother.siblings, "Groom", "mother", 10)}  
            {generateCousinSections(formData.groom.mother, 'Groom Mother', 11)}

            {/* bride */}
            {/* {generateFamilySection("Bride", '11')} */}
            {generateSiblingFamilySection(formData.bride.brothers, "Bride", "Brother", 12)}
            {generateSiblingFamilySection(formData.bride.sisters, "Bride", "Sister", 13)}
            {generateParentSection("Bride", "father", '14')}
            {generateSiblingFamilySection(formData.bride.father.siblings, "Bride", "father", 15)}
            {generateCousinSections(formData.bride.father, 'Bride Father', 16)}
            {generateParentSection("Bride", "mother", '17')}
            {generateSiblingFamilySection(formData.bride.mother.siblings, "Bride", "mother", 18)}
            {generateCousinSections(formData.bride.mother, 'Bride Mother', 19)}

            <CustomFaceOption
              serialNo={20}
              title="Please select Other Cousins"
              next={next}
              prev={prev}
              question="otherCousins"
              multiple={true}
              sendSelection={handleSelectChange}
              // options={[...filterOptions(cousins),...userThumbnails]}
              options={filterOptions(removeDuplicates([...cousins,...userThumbnails.filter((item) => item.avgAge >= 16)]))}             
              
              // others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={formData.otherCousins}
            />
            <CustomFaceOption
              serialNo={21}
              title="Please select Other Kids"
              next={next}
              prev={prev}
              // options={filterOptions(kids)}
              // others={filterOptions(userThumbnails)}
              options={filterOptions(removeDuplicates([...kids,...userThumbnails.filter((item) => item.avgAge <= 16)]))}             
              question="otherKids"
              multiple={true}
              sendSelection={handleSelectChange}
              onSelect={handleSelectFace}
              selectedImage={formData.otherKids}
            />
            <CustomFaceOption
              serialNo={22}
              title="Please select Uncles"
              next={next}
              prev={prev}
              question="uncles"
              multiple={true}
              sendSelection={handleSelectChange}
              // options={filterOptions(uncles)}
              // others={filterOptions(userThumbnails)}
              options={filterOptions(removeDuplicates([...uncles,...userThumbnails.filter((item) => item.avgAge >= 16 && item.gender === 'Male')]))}        
              kids
              onSelect={handleSelectFace}
              selectedImage={formData.uncles}
            />
            <CustomFaceOption
              serialNo={23}
              title="Please select Aunts"
              next={next}
              prev={prev}
              // options={filterOptions(aunts)}
              // others={filterOptions(userThumbnails)}
              options={filterOptions(removeDuplicates([...aunts,...userThumbnails.filter((item) => item.avgAge >= 16 && item.gender === 'Female')]))} 
              onSelect={handleSelectFace}
              question="aunts"
              multiple={true}
              sendSelection={handleSelectChange}
              selectedImage={formData.aunts}
            />
            <CustomFaceOption
              serialNo={24}
              title="Please select Grand Parents"
              next={next}
              prev={prev}
              // options={filterOptions(grandParents)}
              // others={filterOptions(userThumbnails)}
              options={filterOptions(removeDuplicates([...grandParents,...userThumbnails.filter((item) => item.avgAge >= 40)]))} 
              question="grandParents"
              multiple={true}
              sendSelection={handleSelectChange}
              onSelect={handleSelectFace}
              selectedImage={formData.grandParents}
            />            
          <CustomFaceOption
            serialNo={25}
            title="Please select Friends"
            next={next}
            prev={prev}
            question="friends"
            multiple={true}
            sendSelection={handleSelectChange}
            // others={filterOptions(userThumbnails)}
            // options={filterOptions(cousins)}
            options={filterOptions(removeDuplicates([...cousins,...userThumbnails.filter((item) => item.avgAge >= 16)]))} 
            onSelect={handleSelectFace}
            selectedImage={formData.friends}
            
          />
            <CustomFaceOption
              serialNo={26}
              title="Please select Other Important Relatives"
              next={next}
              prev={prev}
              question="otherImportantRelatives"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(removeDuplicates(userThumbnails))} 
              onSelect={handleSelectFace}
            isSubmit={true}
            sendSubmitAction={onSubmitForm}
              selectedImage={formData.otherImportantRelatives}
            />

          {/* <button onClick={handleReset()}>Reset</button> */}
          </>
        )}
      </section>

      <Footer/>

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
                checked={getNestedProperty(formData, `marital_status`) === "unmarried"}
                onChange={() => handleMaritalStatusChange("unmarried")}
              />
              Unmarried
            </label>
            <label>
              <input
                type="radio"
                name="maritalStatus"
                value="married"
                checked={getNestedProperty(formData, `marital_status`) === "married"}
                onChange={() => handleMaritalStatusChange("married")}
              />
              Married
            </label>
            <label>
              <input
                type="radio"
                name="maritalStatus"
                value="marriedWithKids"
                checked={getNestedProperty(formData, `marital_status`) === "marriedWithKids"}
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