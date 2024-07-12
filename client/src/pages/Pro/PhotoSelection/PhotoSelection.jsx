import React, { useEffect, useRef, useState } from "react";
import "../AlbumSelectionForm/AlbumSelectionForm.css";
import "./PhotoSelection.css";
import Header from "../../../components/Header/Header";
import { motion } from "framer-motion";
import API_UTIL from "../../../services/AuthIntereptor";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/Loader/LoadingSpinner";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Heart } from 'lucide-react';
import Modal from "../../../components/ImageModal/ImageModalNew";

const PhotoSelection = () => {
  const isDataFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const { eventName, form_owner } = useParams();
  const [isPhotosSelectionStarted, setIsPhotosSelectionStarted] = useState(false);
  const [imagesData, setImagesData] = useState({
    
    'Groom Solos':[],
    'Bride Solos':[],
    'Combined':[],
    'Groom Father':[],
    'Groom Mother':[],
    'Bride Father':[],
    'Bride Mother':[],
    'Groom Siblings':[],
    'Bride Siblings':[],
    'Groom Family':[],
    'Bride Family':[],
    'Groom and Bride Family':[],
    Kids: [],
    "Level 1 Cousins": [],
    "Level 2 Cousins": [],    
    Uncles: [],
    Aunts: [],
    "Grand Parents": [],
    "Other Important Relatives": [],
    Friends: [],
    "Other Important People":[],

  });
  
  const [formData, setFormData] = useState({
    event_name: eventName,
    form_owner: form_owner,
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
    "Other Important People":[],
    "groommaleSiblingCount": 0,
    "groomfemaleSiblingCount": 0,
    "bridemaleSiblingCount": 0,
    "bridefemaleSiblingCount": 0,
    isFacesSelectionDone: false
  });
  const [clickedUrl, setClickedUrl] = useState(null);
  const [clickedImgFavourite, setClickedImgFavourite] = useState(null);
  const [clickedImg, setClickedImg] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState();
  const [fetchTimeout, setFetchTimeout] = useState(false);

  const handleMainTabClick = async (key) => {
    setActiveMainTab(key);
    await handleSelectTab(key);
    console.log(imagesData);
  };

  const navigate = useNavigate();

  const displayFavIcon = (imageUrl) => {
    const element = document.querySelector(`svg[data-key="${imageUrl}"]`);
    if (element) {
      element.classList.remove("hidden");
    } else {
      console.log(`Element not found for imageUrl ${imageUrl}`);
    }
  };

  const hideFavIcon = (imageUrl) => {
    const element = document.querySelector(`svg[data-key="${imageUrl}"]`);
    if (element) {
      element.classList.add("hidden");
    } else {
      console.log(`Element not found for imageUrl ${imageUrl}`);
    }
  };

  const handleClickImage = (item) => {
    console.log("Image clicked:", item.s3_url);
    setClickedImg(item.s3_url);
    setClickedImgFavourite(item.selected);
    const imgName = item.s3_url.split("amazonaws.com/")[1];
    setClickedUrl(imgName);
    setImageLoaded(false);  // Set imageLoaded to false when a new image is clicked
    window.history.pushState({ id: 1 }, null, "?image=" + `${imgName}`);
  };

  const handleBackButton = () => {
    setClickedImg(null);
  };

  const handlePhotoSelectionStart = async () => {
    setIsPhotosSelectionStarted(true);
    handleMainTabClick('Groom Solos')
  };

  useEffect(() => {
    if (isDataFetched.current) return;
    fetchFormData();
    isDataFetched.current = true;
  }, []);

  const initializeImagesData = (formData) => {
    const imagesData = {
      'Groom Solos': [],
      'Bride Solos': [],
      'Combined': [],
      'Groom Father': [],
      'Groom Mother': [],
      'Bride Father': [],
      'Bride Mother': [],
      // 'Groom Siblings': [],
      // 'Bride Siblings': [],
      'Groom Family': [],
      'Bride Family': [],
      'Groom and Bride Family': [],
      Kids: [],
    "Level 1 Cousins": [],
    "Level 2 Cousins": [],    
    Uncles: [],
    Aunts: [],
    "Grand Parents": [],
    "Other Important Relatives": [],
    Friends: [],
    "Other Important People":[],
    };

    const siblingKeys = [];
    Object.keys(formData).forEach(key => {
      console.log(key)
      if ((key.match(/ Sister \d+$/) || key.match(/ Brother \d+$/)) && !key.includes('Count')) {
        console.log("---- ",key)
        siblingKeys.push(key);
      }
    });

    const updatedImagesData = insertAfterKey(imagesData, 'Bride Mother', siblingKeys);
    console.log(updatedImagesData);
    setImagesData(updatedImagesData);
  };

  const insertAfterKey = (obj, key, newKeys) => {
    const newObj = {};
    let insert = false;
    for (const k in obj) {
      newObj[k] = obj[k];
      if (k === key) {
        insert = true;
      }
      if (insert && newKeys.length) {
        newKeys.forEach(newKey => {
          newObj[newKey] = [];
        });
        insert = false;
      }
    }
    return newObj;
  };


  const fetchFormData = async () => {
    try {
      const response = await API_UTIL.get(`/getSelectionFormData/${eventName}/${form_owner}`);
      if (response.data) {
        setFormData(response.data);
        initializeImagesData(response.data)
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavourite = async (imageUrl, isFav, images, key) => {
    const index = images.findIndex(image => image.s3_url === imageUrl);
    if (index === -1) {
      console.log(`Image not found for imageUrl ${imageUrl}`);
      return;
    }
    const tempImages = [...images];
    let imgObj = tempImages[index];
    if (isFav) {
      tempImages[index].selected = true;
      imgObj = tempImages[index];
      displayFavIcon(imageUrl);
    } else {
      tempImages[index].selected = false;
      imgObj = tempImages[index];
      hideFavIcon(imageUrl);
    }
    setImagesData((prevState) => ({
      ...prevState,
      [key]: tempImages,
    }));

    try {
      await API_UTIL.post("/saveSelectedImage", {
        imageId: images[index].image_id,
        value: isFav
      });
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const fetchCombinedImages = async () => {
    const tempBride = formData.bride.split("/");
    const brideId = tempBride[tempBride.length - 1].split(".")[0];
    const tempGroom = formData.groom.split("/");
    const groomId = tempGroom[tempGroom.length - 1].split(".")[0];
    try {
      const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [groomId, brideId], 'operation': 'AND', 'eventName': eventName });
      if (response.status === 200) {
        return response.data;
      }
    } catch (err) {
      console.log(err);
    }
    return [];
  };
  
  const fetchFamilyImages = async (familyType, userIds) => {
    try {
      const response = await API_UTIL.post(`/getCombinationImagesWithUserIds`, { 'userIds': userIds, 'eventName': eventName });
      if (response.status === 200) {
        return response.data;
      }
    } catch (err) {
      console.log(err);
    }
    return [];
  };

  const handleSelectTab = async (key) => {
    let temp;
    let userId;
    switch (key) {
      case "Groom Solos":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          temp = formData.groom.image.split("/");
          userId = temp[temp.length - 1].split(".")[0];
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Bride Solos":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          temp = formData.bride.image.split("/");
          userId = temp[temp.length - 1].split(".")[0];
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Combined":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          temp = formData.bride.split("/");
          const brideId = temp[temp.length - 1].split(".")[0];
          temp = formData.groom.split("/");
          const groomId = temp[temp.length - 1].split(".")[0];
          try {
            const combinedImages = await fetchCombinedImages();
              setImagesData((prevState) => ({
                ...prevState,
                [key]: combinedImages,
              }));
              setIsLoading(false);
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Groom Father":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          temp = formData.groomsFather.split("/");
          userId = temp[temp.length - 1].split(".")[0];
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'eventName': eventName });
            if (response.status === 200 && response.data.length < 5) {
              // If less than 5, make another API call with mode as loose
              const looseResponse = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'mode': 'Loose', 'eventName': eventName });
              
              if (looseResponse.status === 200) {
                  setImagesData((prevState) => ({
                      ...prevState,
                      [key]: looseResponse.data,
                  }));
              }
          } else {
              setImagesData((prevState) => ({
                  ...prevState,
                  [key]: response.data,
              }));
          }
          setIsLoading(false);
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Groom Mother":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          temp = formData.groomsMother.split("/");
          userId = temp[temp.length - 1].split(".")[0];
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'eventName': eventName });
            if (response.status === 200 && response.data.length < 5) {
              // If less than 5, make another API call with mode as loose
              const looseResponse = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'mode': 'Loose', 'eventName': eventName });
              
              if (looseResponse.status === 200) {
                  setImagesData((prevState) => ({
                      ...prevState,
                      [key]: looseResponse.data,
                  }));
              }
          } else {
              setImagesData((prevState) => ({
                  ...prevState,
                  [key]: response.data,
              }));
          }
          setIsLoading(false);
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Bride Father":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          temp = formData.bridesFather.split("/");
          userId = temp[temp.length - 1].split(".")[0];
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'eventName': eventName });
            if (response.status === 200 && response.data.length < 5) {
              // If less than 5, make another API call with mode as loose
              const looseResponse = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'mode': 'Loose', 'eventName': eventName });
              
              if (looseResponse.status === 200) {
                  setImagesData((prevState) => ({
                      ...prevState,
                      [key]: looseResponse.data,
                  }));
              }
          } else {
              setImagesData((prevState) => ({
                  ...prevState,
                  [key]: response.data,
              }));
          }
          setIsLoading(false);
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Bride Mother":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          temp = formData.bridesMother.split("/");
          userId = temp[temp.length - 1].split(".")[0];
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'eventName': eventName });
            if (response.status === 200 && response.data.length < 5) {
              // If less than 5, make another API call with mode as loose
              const looseResponse = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'mode': 'Loose', 'eventName': eventName });
              
              if (looseResponse.status === 200) {
                  setImagesData((prevState) => ({
                      ...prevState,
                      [key]: looseResponse.data,
                  }));
              }
          } else {
              setImagesData((prevState) => ({
                  ...prevState,
                  [key]: response.data,
              }));
          }
          setIsLoading(false);
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
        
      // case "Groom Siblings":
      //   if (imagesData[key].length === 0) {
      //     setIsLoading(true);
      //     let userIds = [];
      //     Object.keys(formData).forEach((key) => {
      //       if ((key.startsWith('groommale') || key.startsWith('groomfemale')) && !key.includes("Count")) {
      //         const temp = formData[key].split("/");
      //         const userId = temp[temp.length - 1].split(".")[0];
      //         userIds.push(userId);
      //       }
      //     });
      //     try {
      //       const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
      //       if (response.status === 200) {
      //         setImagesData((prevState) => ({
      //           ...prevState,
      //           [key]: response.data,
      //         }));
      //         setIsLoading(false);
      //       }
      //     } catch (err) {
      //       console.log(err);
      //       setIsLoading(false);
      //     }
      //   }
      //   return;
      // case "Bride Siblings":
      //   if (imagesData[key].length === 0) {
      //     setIsLoading(true);
      //     let userIds = [];
      //     Object.keys(formData).forEach((key) => {
      //       if ((key.startsWith('bridemale') || key.startsWith('bridefemale')) && !key.includes("Count")) {
      //         const temp = formData[key].split("/");
      //         const userId = temp[temp.length - 1].split(".")[0];
      //         userIds.push(userId);
      //       }
      //     });
      //     try {
      //       const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
      //       if (response.status === 200) {
      //         setImagesData((prevState) => ({
      //           ...prevState,
      //           [key]: response.data,
      //         }));
      //         setIsLoading(false);
      //       }
      //     } catch (err) {
      //       console.log(err);
      //       setIsLoading(false);
      //     }
      //   }
      //   return;
      case "Groom Family":
      if (imagesData[key].length === 0) {
        setIsLoading(true);
        const combinedImages = imagesData["Combined"].length === 0 ? await fetchCombinedImages() : imagesData["Combined"];
        let userIds = [];
        Object.keys(formData).forEach((key) => {
          if ((key.startsWith('groom') || key === 'bride') && !key.includes("Count")) {
            const temp = formData[key].split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          }
        });
        const familyImages = await fetchFamilyImages(key, userIds);
        const filteredData = familyImages.filter(img => !combinedImages.some(combinedImg => combinedImg.image_id === img.image_id));
        setImagesData((prevState) => ({
          ...prevState,
          [key]: filteredData,
        }));
        setIsLoading(false);
      }
      break;
    case "Bride Family":
      if (imagesData[key].length === 0) {
        setIsLoading(true);
        const combinedImages = imagesData["Combined"].length === 0 ? await fetchCombinedImages() : imagesData["Combined"];
        let userIds = [];
        Object.keys(formData).forEach((key) => {
          if ((key.startsWith('bride') || key === 'groom') && !key.includes("Count")) {
            const temp = formData[key].split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          }
        });
        const familyImages = await fetchFamilyImages(key, userIds);
        const filteredData = familyImages.filter(img => !combinedImages.some(combinedImg => combinedImg.image_id === img.image_id));
        setImagesData((prevState) => ({
          ...prevState,
          [key]: filteredData,
        }));
        setIsLoading(false);
      }
      break;
    case "Groom and Bride Family":
      if (imagesData[key].length === 0) {
        setIsLoading(true);
        const combinedImages = imagesData["Combined"].length === 0 ? await fetchCombinedImages() : imagesData["Combined"];
        const brideFamilyImages = imagesData["Bride Family"].length === 0 ? await fetchFamilyImages("Bride Family", Object.keys(formData).filter(key => key.startsWith('bride') && !key.includes("Count")).map(key => formData[key].split("/").pop().split(".")[0])) : imagesData["Bride Family"];
        const groomFamilyImages = imagesData["Groom Family"].length === 0 ? await fetchFamilyImages("Groom Family", Object.keys(formData).filter(key => key.startsWith('groom') && !key.includes("Count")).map(key => formData[key].split("/").pop().split(".")[0])) : imagesData["Groom Family"];
        
        let userIds = [];
        Object.keys(formData).forEach((key) => {
          if ((key.startsWith('bride') || key.startsWith('groom')) && !key.includes("Count")) {
            const temp = formData[key].split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          }
        });
        const familyImages = await fetchFamilyImages(key, userIds);
        const filteredData = familyImages.filter(img => 
          !combinedImages.some(combinedImg => combinedImg.image_id === img.image_id) &&
          !brideFamilyImages.some(brideImg => brideImg.image_id === img.image_id) &&
          !groomFamilyImages.some(groomImg => groomImg.image_id === img.image_id)
        );
        setImagesData((prevState) => ({
          ...prevState,
          [key]: filteredData,
        }));
        setIsLoading(false);
      }
      break;
      case "Level 1 Cousins":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData[key].forEach((key, idx) => {
            const temp = key.split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          });
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Level 2 Cousins":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData[key].forEach((key, idx) => {
            const temp = key.split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          });
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Uncles":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData[key].forEach((key, idx) => {
            const temp = key.split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          });
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Aunts":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData[key].forEach((key, idx) => {
            const temp = key.split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          });
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Kids":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData[key].forEach((key, idx) => {
            const temp = key.split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          });
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Grand Parents":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData[key].forEach((key, idx) => {
            const temp = key.split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          });
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      case "Other Important People":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData[key].forEach((key, idx) => {
            const temp = key.split("/");
            const userId = temp[temp.length - 1].split(".")[0];
            userIds.push(userId);
          });
          try {
            const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'OR', mode: 'Loose', 'eventName': eventName });
            if (response.status === 200) {
              setImagesData((prevState) => ({
                ...prevState,
                [key]: response.data,
              }));
              setIsLoading(false);
              
            }
          } catch (err) {
            console.log(err);
            setIsLoading(false);
          }
        }
        break;
      default:
        if (key.match(/ Brother \d+$/) || key.match(/ Sister \d+$/)) {
          if (imagesData[key].length === 0) {
              setIsLoading(true);
              userId = formData[key].split("/").pop().split(".")[0];
              try {
                const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': [userId], 'operation': 'AND', 'eventName': eventName });
                if (response.status === 200) {
                  setImagesData((prevState) => ({
                    ...prevState,
                    [key]: response.data,
                  }));
                  setIsLoading(false);
                }
              } catch (err) {
                console.log(err);
                setIsLoading(false);
              }
          }
      } else {
          console.log("Unknown key:", key);
      }
    }
    console.log(imagesData[key].length)
    imagesData[key].length === 0 ?setFetchTimeout(true):console.log("Images fetched for : "+key);
  };

  return (
    <>
      <section>
        {formData.isFacesSelectionDone && !isPhotosSelectionStarted && (
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
            <h2>Let's Start with Photos selection Process</h2>
            <button onClick={handlePhotoSelectionStart}>Start</button>
          </motion.div>
        )}
        {formData.isFacesSelectionDone && isPhotosSelectionStarted && (
          <>
            <Header />
            <div className="container">
              <div className="sidebar">
                <ul>
                  {Object.keys(imagesData).map((key, index) => (
                    <li key={index} onClick={() => handleMainTabClick(key)} className={activeMainTab === key ? 'active' : ''}>
                      {key}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="content">
                {Object.keys(imagesData).map((tab, idx) => (
                  <div key={idx} className={`tab-content ${activeMainTab === tab ? 'active' : ''}`}>
                    <h2>{tab} Pictures</h2>
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : imagesData[tab].length > 0 ? (
                      <div className="wrapper">
                        {imagesData[tab].map((item, index) => (
                          <div key={index} className="wrapper-images">
                            <LazyLoadImage
                              src={item.thumbnailUrl}
                              effect="blur"
                              onLoad={() => {
                                item.selected === true && displayFavIcon(item.s3_url);
                                setImageLoaded(true); // Set imageLoaded to true when image is loaded
                              }}
                              onClick={() => handleClickImage(item)}
                            />
                            <Heart
                              data-key={item.s3_url}
                              className="image_favourite_down hidden"
                            />
                          </div>
                        ))}
                        {clickedImg && (
                          <Modal
                            clickedImg={clickedImg}
                            clickedImgFavourite={clickedImgFavourite}
                            setClickedImg={setClickedImg}
                            clickedUrl={clickedUrl}
                            handleBackButton={handleBackButton}
                            handleFavourite={(imageUrl, isFav) => handleFavourite(imageUrl, isFav, imagesData[tab], tab)}
                            favourite={clickedImgFavourite}  // Pass the favourite state
                            sharing={false}
                            close={true}
                            select={true}
                          >
                            {imageLoaded && ( // Only render image tools if image is loaded
                              <div className="imageToolBox">
                                {/* ToolBox content here */}
                              </div>
                            )}
                          </Modal>
                        )}
                      </div>
                    ) : fetchTimeout ? (
                      <p>No images to display</p>
                    ) : (
                      <p>Failed to load images</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default PhotoSelection;
