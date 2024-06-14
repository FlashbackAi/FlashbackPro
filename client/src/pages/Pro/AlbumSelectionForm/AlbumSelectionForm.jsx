import React, { useEffect, useRef, useState } from "react";
import "./AlbumSelectionForm.css";
import Header from "../../../components/Header/Header";
import { ArrowRight, ChevronLeft, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import API_UTIL from "../../../services/AuthIntereptor";
import { useParams } from "react-router";
import CustomFaceOption from "../../../components/CustomOption/CustomFaceOption";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AlbumSelectionForm = () => {
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
  const [formData, setFormData] = useState( {
          event_name: eventName,
          form_owner: "groom",
          groom: null,
          groomFather: null,
          groomMother: null,
          bride:null,
          bridesMother:null,
          "Level 1 Cousins": [],
          "Level 2 Cousins": [],
          Friends: [],
          Uncles: [],
          Aunts: [],
          Kids: [],
          "Grand Parents": [],
          "Other Important People": [],
        }
  );
  const [showcase, setShowcase] = useState({});
  const [isFormDataUpdated,setIsFormDataUpdated] = useState(false);
  var timer;
  const navigate = useNavigate();
  const generateSiblingSelects = (count, char,gender, serialNoStart) => {
    const siblings = [];
    const options =
      gender === "male" ? filterOptions(males) : filterOptions(females);

    [...Array(count).keys()].forEach((elm, index) => {
      const title =
        gender === "male"
          ? `Select ${char} Sibling (Brother ${index + 1})`
          : `Select ${char} Sibling (Sister ${index + 1})`;
      let sibling = `${char}${gender}Sibling${index + 1}`;
      siblings.push(
        <CustomFaceOption
          question={sibling}
          options={options}
          serialNo={`${serialNoStart}.${index + 1}`}
          title={title}
          next={next}
          prev={prev}
          key={index}
          onSelect={handleSelectFace}
          sendSelection={handleSelectChange}
        />
      );
    });
    return siblings;
  };

  const handleClick = () => {
    setStart(true);
  };

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnails/${eventName}`);
      if (response.status === 200) {
        setUserThumbnails(response.data);
        const malesData = response.data.filter((item) => item.gender === "Male");
        const groomData = response.data.filter(
          (item) => item.gender === "Male" && item.avgAge >= 15 && item.avgAge <= 40
        );
        const brideData = response.data.filter(
          (item) => item.gender === "Female" && item.avgAge >= 15 && item.avgAge <= 40
        );
        const femalesData = response.data.filter((item) => item.gender === "Female");
        const kids = response.data.filter((item) => item.avgAge <= 15);
        const uncles = response.data.filter(
          (item) => item.gender === "Male" && item.avgAge >= 40
        );
        const aunts = response.data.filter(
          (item) => item.gender === "Female" && item.avgAge >= 40
        ); // Fixed typo here
        const grandParents = response.data.filter((item) => item.avgAge >= 50);

        const cousins = response.data.filter((item) => item.avgAge >= 10 && item.avgAge <= 40);
        //siblings less than 40 , 
        //
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
    fetchFormData();
    isDataFetched.current = true;
  }, []);

  useEffect(() => {
    // Save form data to localStorage whenever it changes
    // localStorage.setItem('formData', JSON.stringify(formData));
    //Save data to Backend\
      if(isFormDataUpdated){
      saveFormDataToBackend(formData);
      }
    
}, [formData]);

const saveFormDataToBackend = async (formData) => {
    try {
    // Make a POST request to your backend API endpoint
    console.log(formData);
    const response = await API_UTIL.post(`/saveSelectionFormData`,formData);

    console.log('Form data saved successfully to backend:', response.data);
    } catch (error) {
    console.error('Error saving form data to backend:', error);
    }
};

// useEffect(() => {

//     fetchFormData();
// }, []);

 // Fetch form data from backend
const fetchFormData = async () => {
  try {
  const response = await API_UTIL.get(`/getSelectionFormData/${eventName}/groom`);
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

  const handleSiblingReset = (setter,sibling) =>{

    for (let key in formData) {
      if (key.startsWith(sibling)) {
        delete formData[key];
      }
    }
    setter(0);
  }
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
      
      setFormData(prevState => {
        const newFormData = {
          ...prevState,
          [formKey]: '',
          [countKey]: count - 1
        };
        updateSelectedValues(newFormData);
        return newFormData;
      });
    }
    
    setter(prev => {
      const newValue = prev + value;
      return newValue >= 0 && newValue <= 10 ? newValue : prev;
    });
  
    // Update formData with the new count
    setFormData(prevState => ({
      ...prevState,
      [`${sibling}SiblingCount`]: value === 1 ? prevState[`${sibling}SiblingCount`] + 1 : prevState[`${sibling}SiblingCount`] - 1,
    }));
  };
  

  const filterOptions = (options = []) => {
    return options.filter(option => !selectedValues.has(option.face_url));
  };

  const next = (serialNo) => {
    window.scrollTo({
      top: document.getElementsByClassName(serialNo)[0].nextElementSibling.offsetTop,
      behavior: "smooth",
    });
  };

  const prev = (serialNo) => {
    window.scrollTo({
      top: document.getElementsByClassName(serialNo)[0].previousElementSibling.offsetTop,
      behavior: "smooth",
    });
  };

  const handleSelectFace = (question, faceUrl) => {
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

  const onSubmitForm = () => {
    toast("Selection has been saved Successfully");
    navigate('/photos/Venky_Spandana_Reception_06022022/5fb8028c-d978-44');
  };

  return (
    <>
      <section className="albumSelectionForm">
        {!start && (
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
            <h2>Let's Start with groom's family</h2>
            <button onClick={handleClick}>Start</button>
          </motion.div>
        )}
        {!!userThumbnails.length && start && (
          <>
            <CustomFaceOption
              serialNo={1}
              options={filterOptions(grooms)}
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
              options={filterOptions(brides)}
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
              question="groomMother"
              sendSelection={handleSelectChange}
              options={filterOptions(aunts)}
              onSelect={handleSelectFace}
              selectedImage={[formData.groomMother]}
            />
            <CustomFaceOption
              serialNo={4}
              title="Please select the groom's father"
              next={next}
              prev={prev}
              question="groomFather"
              sendSelection={handleSelectChange}
              options={filterOptions(uncles)}
              onSelect={handleSelectFace}
              selectedImage={[formData.groomFather]}
            />
          
            <CustomFaceOption
              serialNo={5}
              title="Please select the bride's mother"
              next={next}
              prev={prev}
              options={filterOptions(aunts)}
              onSelect={handleSelectFace}
              question="brideMother"
              sendSelection={handleSelectChange}
              selectedImage={[formData.brideMother]}
            />
              <CustomFaceOption
              serialNo={6}
              title="Please select the bride's father"
              next={next}
              prev={prev}
              options={filterOptions(uncles)}
              onSelect={handleSelectFace}
              question="brideFather"
              sendSelection={handleSelectChange}
              selectedImage={[formData.brideFather]}
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
                <div className="question">
                  Number of Groom Sibling Brothers (own brothers)
                </div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingReset(setGroomBrothersCount,"groommale" )}>
                <label>Reset</label>
                </div>
                <input className="number_input" type="number" readOnly value={groomBrothersCount} />
                <div className="icon_container" onClick={() => handleSiblingChange(setGroomBrothersCount,"groommale", +1)}>
                  <Plus />
                </div>
              </div>
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">
                  Number of Groom Sibling Sisters (own sisters)
                </div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingReset(setGroomSistersCount,"groomfemale" )}>
                <label>Reset</label>
                </div>
                <input className="number_input" readOnly type="number" value={groomSistersCount} />
                <div className="icon_container" onClick={() => handleSiblingChange(setGroomSistersCount,"groomfemale", +1)}>
                  <Plus />
                </div>
              </div>
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">
                  Number of Bride Sibling Brothers (own brothers)
                </div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingReset(setBrideBrothersCount,"bridemale" )}>
                 <label>Reset</label>
                </div>
                <input className="number_input" readOnly type="number" value={brideBrothersCount} />
                <div className="icon_container" onClick={() => handleSiblingChange(setBrideBrothersCount,"bridemale", +1)}>
                  <Plus />
                </div>
              </div>
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">
                  Number of Bride Sibling Sisters (own sisters)
                </div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingReset(setBrideSistersCount,"bridefemale" )}>
                <label>Reset</label>
                </div>
                <input className="number_input" readOnly type="number" value={brideSistersCount} />
                <div className="icon_container" onClick={() => handleSiblingChange(setBrideSistersCount,"bridefemale", +1)}>
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
            {generateSiblingSelects(groomBrothersCount,"groom", "male", 7)}
            {generateSiblingSelects(groomSistersCount, "groom", "female", 8)}
            {generateSiblingSelects(brideBrothersCount, "bride", "male", 9)}
            {generateSiblingSelects(brideSistersCount, "bride", "female", 10)}
            <CustomFaceOption
              serialNo={9}
              title="Please select Level 1 Cousins"
              next={next}
              prev={prev}
              question="Level 1 Cousins"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              onSelect={handleSelectFace}
              selectedImage={formData["Level 1 Cousins"]}
            />
            <CustomFaceOption
              serialNo={10}
              title="Please select Level 2 Cousins"
              next={next}
              prev={prev}
              question="Level 2 Cousins"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              onSelect={handleSelectFace}
              selectedImage={formData["Level 2 Cousins"]}
            />
            <CustomFaceOption
              serialNo={12}
              title="Please select Uncles"
              next={next}
              prev={prev}
              question="Uncles"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(uncles)}
              onSelect={handleSelectFace}
              selectedImage={formData.Uncles}
            />
            <CustomFaceOption
              serialNo={13}
              title="Please select Aunts"
              next={next}
              prev={prev}
              options={filterOptions(aunts)}
              onSelect={handleSelectFace}
              question="Aunts"
              multiple={true}
              sendSelection={handleSelectChange}
              selectedImage={formData.Aunts}
            />
            <CustomFaceOption
              serialNo={14}
              title="Please select Kids"
              next={next}
              prev={prev}
              options={filterOptions(kids)}
              question="Kids"
              multiple={true}
              sendSelection={handleSelectChange}
              sendSubmitAction={onSubmitForm}
              onSelect={handleSelectFace}
              selectedImage={formData.Kids}
            />
            <CustomFaceOption
              serialNo={15}
              title="Please select Grand Parents"
              next={next}
              prev={prev}
              options={filterOptions(grandParents)}
              question="Grand Parents"
              multiple={true}
              sendSelection={handleSelectChange}
              sendSubmitAction={onSubmitForm}
              onSelect={handleSelectFace}
              selectedImage={formData["Grand Parents"]}
            />
            
            <CustomFaceOption
              serialNo={11}
              title="Please select Friends"
              next={next}
              prev={prev}
              question="Friends"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              onSelect={handleSelectFace}
              selectedImage={formData.Friends}
            />
            <CustomFaceOption
              serialNo={11}
              title="Please select Other Important People"
              next={next}
              isSubmit={true}
              prev={prev}
              question="Other Important People"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              onSelect={handleSelectFace}
              selectedImage={formData["Other Important People"]}
            />
          </>
        )}
      </section>
    </>
  );
};

export default AlbumSelectionForm;
