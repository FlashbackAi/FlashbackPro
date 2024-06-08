import React, { useEffect, useRef, useState } from "react";
import "./AlbumSelectionForm.css";
import Header from "../../../components/Header/Header";
import {
  ArrowRight,
  ChevronLeft,
  Minus,
  Plus,
  SendToBack,
  SendToBackIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import API_UTIL from "../../../services/AuthIntereptor";
import { useParams } from "react-router";
import { element } from "prop-types";
import CustomFaceOption from "../../../components/CustomOption/CustomFaceOption";

const AlbumSelectionForm = (props) => {
  const isDataFetched = useRef(false);
  const [lastIndex, setLastIndex] = useState(0);
  const [start, setStart] = useState(false);
  const [brothersCount, setBrothersCount] = useState(0);
  const [sistersCount, setSistersCount] = useState(0);
  const [userThumbnails, setUserThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const { eventName } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    groom: "",
    groomFather: "",
    groomMother: "",
  });
  const [males, setMales] = useState([]);
  const [females, setFemales] = useState([]);
  const [selectedValues, setSelectedValues] = useState(new Set());
  var timer;

  const generateSiblingSelects = (count, gender, serialNoStart) => {
    const siblings = [];
    const options =
      gender === "male" ? filterOptions(males) : filterOptions(females);

    [...Array(count).keys()].forEach((elm, index) => {
      const title =
        gender === "male"
          ? `Select your Sibling (Brother ${index + 1})`
          : `Select your Sibling (Sister ${index + 1})`;

      siblings.push(
        <CustomFaceOption
          options={options}
          serialNo={`${serialNoStart}.${index + 1}`}
          title={title}
          next={next}
          prev={prev}
          key={index}
        />
      );
    });
    return siblings;
  };

  function handleClick(e) {
    setStart(true);
  }

  const fetchThumbnails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnails/${eventName}`);
      if (response.status === 200) {
        setUserThumbnails(response.data);
        const malesData = response.data.filter(
          (item) => item.gender === "Male"
        );
        const femalesData = response.data.filter(
          (item) => item.gender === "Female"
        );

        setMales(malesData);
        setFemales(femalesData);
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
      setIsLoading(false);
    } finally {
    }
  };

  useEffect(() => {
    if (isDataFetched.current) return;
    fetchThumbnails();
    isDataFetched.current = true;
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [userThumbnails]);

  const handleSiblingChange = (setter, value) => {
    setter((prev) => {
      const newValue = prev + value;
      return newValue >= 0 && newValue <= 10 ? newValue : prev;
    });
  };

  const filterOptions = (options) => {
    return options.filter((option) => !selectedValues.has(option.face_url));
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

  const onSubmitForm = () => {
    console.log("Form Submitted");
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
              options={filterOptions(males)}
              title="Please select the groom's image"
              next={next}
              prev={prev}
              isFirst={true}
            />
            <CustomFaceOption
              serialNo={2}
              title="Please select the groom's mother"
              next={next}
              prev={prev}
              options={filterOptions(females)}
            />
            <CustomFaceOption
              serialNo={3}
              title="Please select the groom's father"
              next={next}
              prev={prev}
              options={filterOptions(males)}
            />
            <motion.div
              initial={{ opacity: 0, visibility: "hidden" }}
              whileInView={{ opacity: 1, visibility: "visible" }}
              transition={{
                duration: 0.8,
                ease: "easeIn",
              }}
              className="4 question_answer"
            >
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">
                  Number of Sibling Brothers ( own brothers )
                </div>
              </div>
              <div className="input_container">
                <div
                  className="icon_container"
                  onClick={() => handleSiblingChange(setBrothersCount, +1)}
                >
                  <Plus />
                </div>
                <input
                  className="number_input"
                  type="number"
                  readOnly
                  value={brothersCount}
                />
                <div
                  className="icon_container"
                  onClick={() => handleSiblingChange(setBrothersCount, -1)}
                >
                  <Minus />
                </div>
              </div>
              <div className="question-header">
                <div className="icon">
                  <ArrowRight className="arrow" />
                </div>
                <div className="question">
                  Number of Sibling Sisters ( own sisters )
                </div>
              </div>
              
              <div className="input_container">
                <div
                  className="icon_container"
                  onClick={() => handleSiblingChange(setSistersCount, +1)}
                >
                  <Plus />
                </div>
                <input
                  className="number_input"
                  readOnly
                  type="number"
                  value={sistersCount}
                />
                <div
                  className="icon_container"
                  onClick={() => handleSiblingChange(setSistersCount, -1)}
                >
                  <Minus />
                </div>
              </div>
              <div className="button_flex">
                  <div onClick={() => prev(4)}>
                    <ChevronLeft />
                  </div>
                  <button onClick={() => next(4)}>Next</button>
                </div>
            </motion.div>
            <>{generateSiblingSelects(brothersCount, "male", 5)}</>
            <>{generateSiblingSelects(sistersCount, "female", 6)}</>
            <CustomFaceOption
              serialNo={7}
              title="Please select Level 1 Cousins"
              next={next}
              prev={prev}
              options={filterOptions([...males, ...females])}
            />
            <CustomFaceOption
              serialNo={8}
              title="Please select Level 2 Cousins"
              next={next}
              prev={prev}
              options={filterOptions([...males, ...females])}
            />
            <CustomFaceOption
              serialNo={9}
              title="Please select Friends"
              next={next}
              prev={prev}
              options={filterOptions([...males, ...females])}
            />
            <CustomFaceOption
              serialNo={10}
              title="Please select Uncles"
              next={next}
              prev={prev}
              options={filterOptions(males)}
            />
            <CustomFaceOption
              serialNo={11}
              title="Please select Aunts"
              next={next}
              prev={prev}
              options={filterOptions(males)}
            />
            <CustomFaceOption
              serialNo={12}
              title="Please select Nephews & Nieces"
              next={next}
              prev={prev}
              options={filterOptions([...males, ...females])}
              isSubmit={true}
              sendSubmitAction={onSubmitForm}
            />
          </>
        )}
      </section>
    </>
  );
};

export default AlbumSelectionForm;
