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
  const [brothersCount, setBrothersCount] = useState(0);
  const [sistersCount, setSistersCount] = useState(0);
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
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("formData");
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          event_name: eventName,
          form_owner: "groom",
          groom: "",
          groomFather: "",
          groomMother: "",
          "Level 1 Cousins": [],
          "Level 2 Cousins": [],
          Friends: [],
          Uncles: [],
          Aunts: [],
          "Nephews and Nieces": [],
          "Grand Parents": [],
          "Other Important People": [],
        };
  });
  const [showcase, setShowcase] = useState({});
  var timer;
  const navigate = useNavigate();
  const generateSiblingSelects = (count, gender, serialNoStart) => {
    const siblings = [];
    const options =
      gender === "male" ? filterOptions(males) : filterOptions(females);

    [...Array(count).keys()].forEach((elm, index) => {
      const title =
        gender === "male"
          ? `Select your Sibling (Brother ${index + 1})`
          : `Select your Sibling (Sister ${index + 1})`;
      let sibling = `groom${gender}Sibling${index + 1}`;
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
          (item) => item.gender === "Male" && item.avgAge >= 15 && item.avgAge <= 45
        );
        const brideData = response.data.filter(
          (item) => item.gender === "Female" && item.avgAge >= 15 && item.avgAge <= 45
        );
        const femalesData = response.data.filter((item) => item.gender === "Female");
        const kids = response.data.filter((item) => item.avgAge <= 15);
        const uncles = response.data.filter(
          (item) => item.gender === "Male" && item.avgAge >= 30
        );
        const aunts = response.data.filter(
          (item) => item.gender === "Female" && item.avgAge >= 30
        ); // Fixed typo here
        const grandParents = response.data.filter((item) => item.avgAge >= 40);

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

  const handleSiblingChange = (setter, value) => {
    setter((prev) => {
      const newValue = prev + value;
      return newValue >= 0 && newValue <= 10 ? newValue : prev;
    });
  };

  const filterOptions = (options = []) => {
    // const opt =  options.map((option) =>
    //   selectedValues.has(option.face_url) ? { ...option, disabled: true } : option
    // );
    // return opt;
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
    setFormData((prevState) => {
      const newFormData = { ...prevState, [question]: selectedValue };
      updateSelectedValues(newFormData);
      console.log(newFormData);
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
            />
            <CustomFaceOption
              serialNo={3}
              title="Please select the groom's mother"
              next={next}
              prev={prev}
              question="groomMother"
              sendSelection={handleSelectChange}
              options={filterOptions(females)}
              onSelect={handleSelectFace}
            />
            <CustomFaceOption
              serialNo={4}
              title="Please select the groom's father"
              next={next}
              prev={prev}
              question="groomFather"
              sendSelection={handleSelectChange}
              options={filterOptions(males)}
              onSelect={handleSelectFace}
            />
            <CustomFaceOption
              serialNo={5}
              title="Please select the bride's father"
              next={next}
              prev={prev}
              options={filterOptions(males)}
              onSelect={handleSelectFace}
              question="brideFather"
              sendSelection={handleSelectChange}
            />
            <CustomFaceOption
              serialNo={6}
              title="Please select the bride's mother"
              next={next}
              prev={prev}
              options={filterOptions(females)}
              onSelect={handleSelectFace}
              question="brideMother"
              sendSelection={handleSelectChange}
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
                  Number of Sibling Brothers (own brothers)
                </div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingChange(setBrothersCount, +1)}>
                  <Plus />
                </div>
                <input className="number_input" type="number" readOnly value={brothersCount} />
                <div className="icon_container" onClick={() => handleSiblingChange(setBrothersCount, -1)}>
                  <Minus />
                </div>
              </div>
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">
                  Number of Sibling Sisters (own sisters)
                </div>
              </div>
              <div className="input_container">
                <div className="icon_container" onClick={() => handleSiblingChange(setSistersCount, +1)}>
                  <Plus />
                </div>
                <input className="number_input" readOnly type="number" value={sistersCount} />
                <div className="icon_container" onClick={() => handleSiblingChange(setSistersCount, -1)}>
                  <Minus />
                </div>
              </div>
              <div className="button_flex">
                <div onClick={() => prev(7)}>
                  <ChevronLeft />
                </div>
                <button onClick={() => next(7)}>Next</button>
              </div>
            </motion.div>
            {generateSiblingSelects(brothersCount, "male", 7)}
            {generateSiblingSelects(sistersCount, "female", 8)}
            <CustomFaceOption
              serialNo={9}
              title="Please select Level 1 Cousins"
              next={next}
              prev={prev}
              question="Level1Cousins"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              onSelect={handleSelectFace}
            />
            <CustomFaceOption
              serialNo={10}
              title="Please select Level 2 Cousins"
              next={next}
              prev={prev}
              question="Level2Cousins"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              onSelect={handleSelectFace}
            />
            <CustomFaceOption
              serialNo={11}
              title="Please select Friends"
              next={next}
              prev={prev}
              question="friends"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(cousins)}
              onSelect={handleSelectFace}
            />
            <CustomFaceOption
              serialNo={12}
              title="Please select Uncles"
              next={next}
              prev={prev}
              question="uncles"
              multiple={true}
              sendSelection={handleSelectChange}
              options={filterOptions(uncles)}
              onSelect={handleSelectFace}
            />
            <CustomFaceOption
              serialNo={13}
              title="Please select Aunts"
              next={next}
              prev={prev}
              options={filterOptions(aunts)}
              onSelect={handleSelectFace}
              question="aunts"
              multiple={true}
              sendSelection={handleSelectChange}
            />
            <CustomFaceOption
              serialNo={14}
              title="Please select Nephews & Nieces"
              next={next}
              prev={prev}
              options={filterOptions(kids)}
              isSubmit={true}
              question="NephewsNieces"
              multiple={true}
              sendSelection={handleSelectChange}
              sendSubmitAction={onSubmitForm}
              onSelect={handleSelectFace}
            />
            <CustomFaceOption
              serialNo={15}
              title="Please select Grand Parents"
              next={next}
              prev={prev}
              options={filterOptions(grandParents)}
              isSubmit={true}
              question="grandParents"
              multiple={true}
              sendSelection={handleSelectChange}
              sendSubmitAction={onSubmitForm}
              onSelect={handleSelectFace}
            />
          </>
        )}
      </section>
    </>
  );
};

export default AlbumSelectionForm;
