import React, { useEffect, useRef, useState } from "react";
import "../AlbumSelectionForm/AlbumSelectionForm.css";
import "./FaceSelection.css";
import Header from "../../../components/Header/Header";
import { ArrowRight, ChevronLeft, Minus, Plus } from "lucide-react";
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
    groom: null,
    groomsFather: null,
    groomsMother: null,
    bride: null,
    bridesMother: null,
    bridesFather: null,
    Kids: [],
    "Level 1 Cousins": [],
    "Level 2 Cousins": [],
    Uncles: [],
    Aunts: [],
    "Grand Parents": [],
    "Other Important Relatives": [],
    Friends: [],
    "Other Important People": [],
    "groommaleSiblingCount": 0,
    "groomfemaleSiblingCount": 0,
    "bridemaleSiblingCount": 0,
    "bridefemaleSiblingCount": 0,
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

  const generateSiblingSelects = (count, char, gender, serialNoStart) => {
    const siblings = [];
    const options = gender === "male" ? filterOptions(males).slice(0, 10) : filterOptions(females).slice(0, 10);

    [...Array(count).keys()].forEach((elm, index) => {
      const title = gender === "male" ? `Select ${char} Sibling (Brother ${index + 1})` : `Select ${char} Sibling (Sister ${index + 1})`;
      const sibling = `${char}${gender}Sibling${index + 1}`;

      siblings.push(
        <div className="sibling-container" key={`${serialNoStart}.${index + 1}`}>
          <div className="centered-selection">
            <CustomFaceOption
              question={sibling}
              options={options}
              others={filterOptions(userThumbnails)}
              serialNo={`${serialNoStart}.${index + 1}`}
              title={title}
              isSibling = {true}
              maritalStatus = {() => handleOpenMaritalStatusModal(sibling)}
              next={next}
              prev={prev}
              onSelect={handleSelectFace}
              sendSelection={handleSelectChange}
              selectedImage={[formData[sibling]]}
            />
            {(formData[`${sibling}MaritalStatus`] === "married" || formData[`${sibling}MaritalStatus`] === "marriedWithKids") && (
              <CustomFaceOption
                question={`${sibling}Spouse`}
                options={gender === "male" ? filterOptions(females) : filterOptions(males)}
                others={filterOptions(userThumbnails)}
                serialNo={`${serialNoStart}.${index + 1}.1`}
                title={`Select ${char} Sibling's Spouse`}
                onSelect={handleSelectFace}
                sendSelection={handleSelectChange}
                selectedImage={[formData[`${sibling}Spouse`]]}
                next={next}
                prev={prev}
                isInternal={true}
              />
            )}
            {formData[`${sibling}MaritalStatus`] === "marriedWithKids" && (
              <CustomFaceOption
                question={`${sibling}Children`}
                options={filterOptions(kids)}
                others={filterOptions(userThumbnails)}
                serialNo={`${serialNoStart}.${index + 1}.2`}
                title={`Select ${char} Sibling's Children`}
                multiple={true}
                isInternal={true}
                next={next}
                prev={prev}
                onSelect={handleSelectFace}
                sendSelection={handleSelectChange}
                selectedImage={formData[`${sibling}Children`] || []}
              />
            )}
          </div>
        </div>
      );
    });

    return siblings;
  };

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
    //fetchFormData();
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

  const handleSiblingChange = (setter, sibling, value) => {
    if (value === -1) {
      let count;
      switch (sibling) {
        case 'groommale': count = groomBrothersCount; break;
        case 'groomfemale': count = groomSistersCount; break;
        case 'bridemale': count = brideBrothersCount; break;
        case 'bridefemale': count = brideSistersCount; break;
        default: console.log(sibling);
      }

      const formKey = `${sibling}Sibling${count}`;
      const countKey = `${sibling}SiblingCount`;
      setFormData((prevState) => {
        const newFormData = {
          ...prevState,
          [formKey]: '',
          [countKey]: count - 1
        };
        updateSelectedValues(newFormData);
        return newFormData;
      });
    }
    const val = formData[`${sibling}SiblingCount`] + value;
    setFormData((prevState) => ({
      ...prevState,
      [`${sibling}SiblingCount`]: val,
    }));
  };

  const filterOptions = (options = []) => {
    return options.filter((option) => !selectedValues.has(option.face_url));
  };

  const next = (serialNo) => {
    const getNextElement = (currentSerial) => {
      if(currentSerial.toString().length ===1 ){
        let nextElement = document.getElementsByClassName(currentSerial+1)[0];
        if (nextElement) return nextElement;
        else{
          let nextSerial =  ((currentSerial.toString().split('.').map(Number))[0]+1).toString()+'.1'
          return document.getElementsByClassName(nextSerial)[0];
        }
      }else{
        let parts = currentSerial.toString().split('.').map(Number);
        parts[parts.length - 1] += 1;
        let nextSerial = parts.join('.');
        let nextElement = document.getElementsByClassName(nextSerial)[0];
        if (nextElement) return nextElement;
        else{
          let nextSerial = (parts[0]+1)
          
          let nextElement = document.getElementsByClassName(nextSerial)[0];
          if (nextElement) return nextElement;
           nextSerial = (parts[0]+1).toString()+'.1';
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
      if(currentSerial.toString().length ===1 ){
        let nextElement = document.getElementsByClassName(currentSerial-1)[0];
        if (nextElement) return nextElement;
        else{
          let nextSerial =  ((currentSerial.toString().split('.').map(Number))[0]-1).toString()+'.1'
          return document.getElementsByClassName(nextSerial)[0];
        }
      }else{
        let parts = currentSerial.toString().split('.').map(Number);
        parts[parts.length - 1] -= 1;
        let nextSerial = parts.join('.');
        let nextElement = document.getElementsByClassName(nextSerial)[0];
        if (nextElement) return nextElement;
        else{
          let nextSerial = (parts[0]-1)
          
          let nextElement = document.getElementsByClassName(nextSerial)[0];
          if (nextElement) return nextElement;
           nextSerial = (parts[0]-1).toString()+'.1';
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
      updateSelectedValues(newFormData);
      return newFormData;
    });
  };

  const updateSelectedValues = (formData) => {
    const newSelectedValues = new Set();
    Object.values(formData).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((val) => newSelectedValues.add(val));
      } else {
        newSelectedValues.add(value);
      }
    });
    setSelectedValues(newSelectedValues);
  };

  const onSubmitForm = async () => {
    try {
      // Assume you have an API function to update the form data in the database
      const response = await API_UTIL.post(`/saveSelectionFormData`, {
        ...formData,
        isFacesSelectionDone: true,
      });
      console.log("response : "+response);
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
    handleSelectChange("form_owner",character);
    
    console.log(`Selected character: ${character}`);
  }; 
  const checkCharacterSelected = ()=>{
    console.log(formData['form_owner']);
    if(formData['form_owner'] != null){
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
              onClick={() => handleSelectCharacter("couple")}
              className={`card ${formData['form_owner'] === "couple" ? "selected" : ""}`}
            >
              <img src = 'couple_icon.png'/>
            </div>
            <div
              onClick={() => handleSelectCharacter("groom")}
              className={`card ${formData['form_owner'] === "groom" ? "selected" : ""}`}
            >
              <img src = 'groom_icon.png'/>
            </div>
            <div
              onClick={() => handleSelectCharacter("bride")}
              className={`card ${formData['form_owner'] === "bride" ? "selected" : ""}`}
            >
             <img src = 'bride_icon.png'/>
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
            <Header/>
            <h2>Let's Start with Selecting Faces</h2>
            <button onClick={handleClick}>Start</button>
          </motion.div>
        )}
        {!!userThumbnails.length && start && (
          <>
            <CustomFaceOption
              serialNo={1}
              options={filterOptions(grooms).slice(0,10)}
              others={filterOptions(userThumbnails)}
              title="Please select the groom's image"
              next={next}
              prev={prev}
              question="groom"
              sendSelection={handleSelectChange}
              isFirst={true}
              onSelect={handleSelectFace}
              selectedImage={[formData.groom]}
            />
            <CustomFaceOption
              serialNo={2}
              title="Please select the bride's image"
              next={next}
              prev={prev}
              options={filterOptions(brides).slice(0,10)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              question="bride"
              sendSelection={handleSelectChange}
              selectedImage={[formData.bride]}
            />
            <CustomFaceOption
              serialNo={3}
              title="Please select the groom's mother"
              next={next}
              prev={prev}
              question="groomsMother"
              sendSelection={handleSelectChange}
              options={filterOptions(aunts).slice(0,10)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={[formData.groomsMother]}
            />
            <CustomFaceOption
              serialNo={4}
              title="Please select the groom's father"
              next={next}
              prev={prev}
              question="groomsFather"
              sendSelection={handleSelectChange}
              options={filterOptions(uncles).slice(0,10)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              selectedImage={[formData.groomsFather]}
            />
            <CustomFaceOption
              serialNo={5}
              title="Please select the bride's mother"
              next={next}
              prev={prev}
              options={filterOptions(aunts).slice(0,10)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              question="bridesMother"
              sendSelection={handleSelectChange}
              selectedImage={[formData.bridesMother]}
            />
            <CustomFaceOption
              serialNo={6}
              title="Please select the bride's father"
              next={next}
              prev={prev}
              options={filterOptions(uncles).slice(0,10)}
              others={filterOptions(userThumbnails)}
              onSelect={handleSelectFace}
              question="bridesFather"
              sendSelection={handleSelectChange}
              selectedImage={[formData.bridesFather]}
            />
            <motion.div
              initial={{ opacity: 0, visibility: "hidden" }}
              whileInView={{ opacity: 1, visibility: "visible" }}
              transition={{
                duration: 0.8,
                ease: "easeIn",
              }}
              className="7 question_answer"
            >
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">Number of Groom Sibling Brothers (own brothers)</div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingReset(setGroomBrothersCount, "groommale")}>
                  <label>Reset</label>
                </div>
                <input className="number_input" type="number" readOnly value={formData['groommaleSiblingCount']} />
                <div className="icon_container" onClick={() => handleSiblingChange(setGroomBrothersCount, "groommale", +1)}>
                  <Plus />
                </div>
              </div>
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">Number of Groom Sibling Sisters (own sisters)</div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingReset(setGroomSistersCount, "groomfemale")}>
                  <label>Reset</label>
                </div>
                <input className="number_input" readOnly type="number" value={formData['groomfemaleSiblingCount']} />
                <div className="icon_container" onClick={() => handleSiblingChange(setGroomSistersCount, "groomfemale", +1)}>
                  <Plus />
                </div>
              </div>
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">Number of Bride Sibling Brothers (own brothers)</div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingReset(setBrideBrothersCount, "bridemale")}>
                  <label>Reset</label>
                </div>
                <input className="number_input" readOnly type="number" value={formData['bridemaleSiblingCount']} />
                <div className="icon_container" onClick={() => handleSiblingChange(setBrideBrothersCount, "bridemale", +1)}>
                  <Plus />
                </div>
              </div>
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">Number of Bride Sibling Sisters (own sisters)</div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingReset(setBrideSistersCount, "bridefemale")}>
                  <label>Reset</label>
                </div>
                <input className="number_input" readOnly type="number" value={formData['bridefemaleSiblingCount']} />
                <div className="icon_container" onClick={() => handleSiblingChange(setBrideSistersCount, "bridefemale", +1)}>
                  <Plus />
                </div>
              </div>
              <div className="button_flex">
                <div onClick={() => prev(7)}>
                  <ChevronLeft />
                </div>
                <button onClick={() => next(7)}>Next</button>
              </div>
            </motion.div>
            {generateSiblingSelects(formData.groommaleSiblingCount, "groom", "male", 8)}
            {generateSiblingSelects(formData.groomfemaleSiblingCount, "groom", "female", 9)}
            {generateSiblingSelects(formData.bridemaleSiblingCount, "bride", "male", 10)}
            {generateSiblingSelects(formData.bridefemaleSiblingCount, "bride", "female", 11)}
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
            <CustomFaceOption
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
            />
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
              title="Plese select Friends"
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
