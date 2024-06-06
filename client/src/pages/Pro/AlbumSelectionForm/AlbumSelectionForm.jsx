import React, { useEffect, useRef, useState } from "react";
import "./AlbumSelectionForm.css";
import Header from "../../../components/Header/Header";
import {
  ArrowRight,
  ChevronLeft,
  SendToBack,
  SendToBackIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import API_UTIL from "../../../services/AuthIntereptor";
import { useParams } from "react-router";
import { element } from "prop-types";

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

  // TO DO
  // use the below approach
  // https://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling
  // function waitForScrollEnd() {
  //   let last_changed_frame = 0;
  //   let last_x = window.scrollX;
  //   let last_y = window.scrollY;

  //   return new Promise((resolve) => {
  //     function tick(frames) {
  //       // We requestAnimationFrame either for 500 frames or until 20 frames with
  //       // no change have been observed.
  //       if (frames >= 500 || frames - last_changed_frame > 20) {
  //         resolve();
  //       } else {
  //         if (window.scrollX != last_x || window.scrollY != last_y) {
  //           last_changed_frame = frames;
  //           last_x = window.scrollX;
  //           last_y = window.scrollY;
  //         }
  //         requestAnimationFrame(tick.bind(null, frames + 1));
  //       }
  //     }
  //     tick(0);
  //   });
  // }

  // useEffect(() => {
  //   const handleScroll = async (e) => {

  //     e.preventDefault();

  //     if (timer !== null) {
  //       clearTimeout(timer);
  //     }
  //     timer = setTimeout(function () {
  //       console.log(e);
  //       if (lastIndex === 0) return;
  //       // if (lastIndex < 3) {
  //       if (e.deltaY > 0) {
  //         console.log("scrolling down");
  //         // document.getElementsByClassName(lastIndex)[0].classList.add("hide");

  //         const doc = document.getElementsByClassName(lastIndex + 1)[0];
  //         if (doc) {
  //           window.scrollTo({ top: doc.offsetTop, behavior: "smooth" });
  //           // doc.classList.add("show");
  //         }
  //         // doc.classList.remove("hide");
  //         // doc.classList.add("show");

  //         // console.log(lastIndex);
  //         setLastIndex(lastIndex + 1);
  //         // console.log(lastIndex);
  //       }
  //       // }
  //       else if (e.deltaY <= -1) {
  //         console.log("scrolling up ",lastIndex);
  //         if (lastIndex != 0) {
  //           // document.getElementsByClassName(lastIndex)[0].classList.add("hide");

  //           const doc = document.getElementsByClassName(lastIndex - 1)[0];
  //           if (doc) {
  //             window.scrollTo({ top: doc.offsetTop, behavior: "smooth" });
  //             // doc.classList.add("show");
  //           }
  //           //   doc.classList.remove("hide");
  //           //   doc.classList.add("show");

  //           setLastIndex(lastIndex - 1);
  //         }
  //       }
  //     }, 100);
  //   };

  //   // document.addEventListener("scrollend", handleScroll, { passive: false });
  //   // document.addEventListener("scroll", (e) => e.preventDefault(), { passive: false });
  //   document.addEventListener("wheel", handleScroll, {
  //     passive: false,
  //   });
  //   return () => {
  //     // window.removeEventListener("scrollend", handleScroll);
  //     // window.removeEventListener("scroll", (e) => e.preventDefault(), false);
  //     window.removeEventListener("wheel", handleScroll, false);
  //   };
  // }, [lastIndex]);

  // useEffect(() => {
  //   const options = {
  //     // root: document.getElementsByClassName("albumSelectionForm")[0],
  //     threshold: 1,
  //   };
  //   const observer = new IntersectionObserver((entries) => {
  //     entries.forEach((entry) => {
  //       console.log(entry.target.offsetTop);
  //       console.log(entry);
  //       if (entry.isIntersecting) {
  //         window.scrollTo({
  //           top: entry.target.offsetTop,
  //           behavior: "smooth",
  //         });
  //         // entry.target.scrollIntoView(
  //         //   {
  //         //   behavior:"smooth",
  //         //   block:"center",
  //         //   inline:"center"
  //         // })
  //         entry.target.classList.add("show");
  //       } else {
  //         entry.target.classList.remove("show");
  //       }
  //     }, options);
  //   });
  //   const forms = document.querySelectorAll(".question_answer");
  //   forms.forEach((form) => {
  //     observer.observe(form);
  //   });
  // }, [userThumbnails]);

  function handleClick(e) {
    // window.scrollTo({
    //   top: document.getElementsByClassName("1")[0].offsetTop,
    //   behavior: "smooth",
    // });
    setStart(true);
    setLastIndex(lastIndex + 1);
    // document.querySelector("html").animate({offset:document.getElementById("divs").offsetTop})
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

  const filterOptions = (options) => {
    return options.filter((option) => !selectedValues.has(option.face_url));
  };

  return (
    <>
      <section className="albumSelectionForm">
        {/* <h1>Flashback - Album Selection</h1> */}
        {!start && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              // delay: 0.5,
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
            <motion.div
              initial={{ opacity: 0, visibility: "hidden" }}
              whileInView={{ opacity: 1, visibility: "visible" }}
              transition={{
                duration: 0.8,
                ease: "easeIn",
              }}
              className="1 question_answer"
            >
              <div className="question-header">
                <div className="icon">
                  1 <ArrowRight className="arrow" />
                </div>
                <div className="question">Please select the groom's image</div>
              </div>
              <div className="img-options">
                {filterOptions(males).map((male, index) => {
                  return (
                    <div className="img-outer" key={index}>
                      <img src={male.face_url} alt={male.user_id} />
                    </div>
                  );
                })}
              </div>
              <div className="button-flex" />
              <button>Next</button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, visibility: "hidden" }}
              whileInView={{ opacity: 1, visibility: "visible" }}
              transition={{
                duration: 0.8,
                ease: "easeIn",
              }}
              className="2 question_answer"
            >
              <div className="question-header">
                <div className="icon">
                  2 <ArrowRight className="arrow" />
                </div>
                <div className="question">Please select the groom's mother</div>
              </div>
              <div className="img-options">
                {filterOptions(females).map((male, index) => {
                  return (
                    <div className="img-outer" key={index}>
                      <img src={male.face_url} alt={male.user_id} />
                    </div>
                  );
                })}
              </div>
              <div className="button_flex">
                <div>
                  <ChevronLeft />
                </div>
                <button>Next</button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, visibility: "hidden" }}
              whileInView={{ opacity: 1, visibility: "visible" }}
              transition={{
                duration: 0.8,
                ease: "easeIn",
              }}
              className="3 question_answer"
            >
              <div className="question-header">
                <div className="icon">
                  3 <ArrowRight className="arrow" />
                </div>
                <div className="question">Please select the groom's father</div>
              </div>
              <div className="img-options">
                {filterOptions(males).map((male, index) => {
                  return (
                    <div className="img-outer" key={index}>
                      <img src={male.face_url} alt={male.user_id} />
                    </div>
                  );
                })}
              </div>
              <div className="button_flex">
                <div>
                  <ChevronLeft />
                </div>
                <button>Next</button>
              </div>
            </motion.div>
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
                  3a <ArrowRight className="arrow" />
                </div>
                <div className="question">
                  Number of Sibling Brothers ( own brothers )
                </div>
              </div>
              <input className="number_input" type="number" />
              <div className="question-header">
                <div className="icon">
                  3b <ArrowRight className="arrow" />
                </div>
                <div className="question">
                  Number of Sibling Sisters ( own sisters )
                </div>
              </div>
              <input className="number_input" type="number" />
            </motion.div>
          </>
        )}
      </section>
    </>
  );
};

export default AlbumSelectionForm;
