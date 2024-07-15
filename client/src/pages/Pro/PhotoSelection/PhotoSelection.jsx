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
  const [imagesData, setImagesData] = useState({});
  const [formData, setFormData] = useState({
    event_name: eventName,
    form_owner: null,
    marital_status: null,
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
    kids: [],
    otherKids: [],
    otherCousins: [],
    uncles: [],
    aunts: [],
    grandParents: [],
    otherImportantRelatives: [],
    friends: [],
    isFacesSelectionDone: null
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
    const imagesData = {};

    if (formData.groom.image) {
      imagesData['Groom Solos'] = [];
    }
    if (formData.bride.image) {
      imagesData['Bride Solos'] = [];
    }
    if (formData.kids.length) {
      imagesData['Kids'] = [];
    }
    if (formData.groom.image && formData.bride.image) {
      imagesData['Combined'] = [];
    }

    if ( formData.groom.father.image || formData.groom.mother.image || formData.groom.brothers.length || formData.groom.sisters.length) {
      imagesData['Groom Family'] = [];
    }

    if ( formData.groom.father.parents.length) 
      imagesData['Groom Father Parents'] = [];
    if ( formData.groom.father.siblings.length ){
      formData.groom.father.siblings.forEach((sibling, index) => {
        imagesData[`Groom Father Sibling ${index + 1} Family`] = [];
      });
    }
    if (formData.groom.mother.parents.length)
      imagesData['Groom Mother Extended Family'] = [];
   if ( formData.groom.mother.siblings.length ){
      formData.groom.mother.siblings.forEach((sibling, index) => {
        imagesData[`Groom Mother Sibling ${index + 1} Family`] = [];
      });
    }



    if (formData.bride.father.image || formData.bride.mother.image || formData.bride.brothers.length || formData.bride.sisters.length) {
      imagesData['Bride Family'] = [];
    }

    
    if ( formData.bride.father.parents.length)
      imagesData['Bride Father Extended Family'] = [];
    if ( formData.bride.father.siblings.length ){
      formData.bride.father.siblings.forEach((sibling, index) => {
        imagesData[`Bride Father Sibling ${index + 1} Family`] = [];
      });
    }
    if (formData.bride.mother.parents.length)
      imagesData['Bride Mother Extended Family'] = [];
    if ( formData.bride.mother.siblings.length ){
      formData.bride.mother.siblings.forEach((sibling, index) => {
        imagesData[`Bride Mother Sibling ${index + 1} Family`] = [];
      });
    }
    if( ( formData.groom.father.image || formData.groom.mother.image || formData.groom.brothers.length || formData.groom.sisters.length) && (formData.bride.father.image || formData.bride.mother.image || formData.bride.brothers.length || formData.bride.sisters.length)) {
      imagesData['Groom and Bride Family'] = [];
    }

  
    if (formData.otherKids.length) {
      imagesData['Other Kids'] = [];
    }
    if (formData.otherCousins.length) {
      imagesData['Other Cousins'] = [];
    }
    if (formData.uncles.length) {
      imagesData['Uncles'] = [];
    }
    if (formData.aunts.length) {
      imagesData['Aunts'] = [];
    }
    if (formData.grandParents.length) {
      imagesData['Grand Parents'] = [];
    }
    if (formData.otherImportantRelatives.length) {
      imagesData['Other Important Relatives'] = [];
    }
    if (formData.friends.length) {
      imagesData['Friends'] = [];
    }

    setImagesData(imagesData);
  };

  const fetchFormData = async () => {
    try {
      const response = await API_UTIL.get(`/getSelectionFormData/${eventName}/${form_owner}`);
      if (response.data) {
        setFormData(response.data);
        initializeImagesData(response.data);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavourite = async (imageUrl, isFav, key) => {
    setImagesData((prevState) => {
      const updatedData = { ...prevState };
      Object.keys(updatedData).forEach((tabKey) => {
        updatedData[tabKey] = updatedData[tabKey].map((image) => {
          if (image.s3_url === imageUrl) {
            return { ...image, selected: isFav };
          }
          return image;
        });
      });
      return updatedData;
    });
  
    try {
      const response = await API_UTIL.post("/saveSelectedImage", {
        imageId: imagesData[key].find(image => image.s3_url === imageUrl).image_id,
        value: isFav,
      });
      if (response.status === 200) {
        console.log("Image selection updated successfully.");
      }
    } catch (error) {
      console.error("Error saving favorite:", error);
    }
  };

  async function getSolos(personType, formData) {
    
    const imagePath = formData[personType].image;
    const temp = imagePath.split("/");
    const userId = temp[temp.length - 1].split(".")[0];
  
    try {
      const response = await API_UTIL.post(`/getImagesWithUserIds`, {
        'userIds': [userId],
        'operation': 'AND',
        'eventName': eventName
      });
      const stateKey = `${personType.charAt(0).toUpperCase()}${personType.slice(1)} Solos`;
  
      if (response.status === 200) {
        setImagesData((prevState) => ({
          ...prevState,
          [stateKey]: response.data,
        }));
        return response.data;
      }
    } catch (err) {
      console.log(err);
    }
  }
  

  const fetchCombinedImages = async () => {
    // const tempBride = formData.bride.image.split("/");
    // const brideId = tempBride[tempBride.length - 1].split(".")[0];
    // const tempGroom = formData.groom.image.split("/");
    // const groomId = tempGroom[temp.length - 1].split(".")[0];
    let userIds=[];
    userIds.push(extractId(formData.groom.image));
    userIds.push(extractId(formData.bride.image));
    if(formData.kids && formData.kids.length!=0){
      formData.kids.forEach(kid =>{
        userIds.push(extractId(kid));
      })
    }
    try {
      const response = await API_UTIL.post(`/getImagesWithUserIds`, { 'userIds': userIds, 'operation': 'AND', 'eventName': eventName });
      if (response.status === 200) {
        setImagesData((prevState) => ({
          ...prevState,
          ['Combined']: response.data,
        }));
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
  const extractId = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1].split(".")[0];
};
  function extractUserIds(personType, formData) {
    let userIds = [];

    // Function to extract ID from a URL
    
        userIds.push(extractId(formData.groom.image));
        userIds.push(extractId(formData.bride.image));

    // Add person's father image ID
    if (formData[personType].father && formData[personType].father.image) {
        userIds.push(extractId(formData[personType].father.image));
    }

    // Add person's mother image ID
    if (formData[personType].mother && formData[personType].mother.image) {
        userIds.push(extractId(formData[personType].mother.image));
    }

      // Function to process siblings, including their children and spouse
      const processSiblings = (siblings) => {
          if (siblings) {
              Object.values(siblings).forEach(sibling => {
                  sibling.children && Object.values(sibling.children).forEach(child => {
                      // Add child IDs
                      userIds.push(extractId(child))
    
                      // Add spouse ID if present
                    
                  });
                  if (sibling.spouse) {
                    userIds.push(extractId(sibling.spouse));
                }
              });
          }
    };


    // Process person's brothers and sisters
    if (formData[personType].brothers) {
        formData[personType].brothers.forEach(brother => {
            if (brother) {
                userIds.push(extractId(brother));
            }
        });
    }

    if (formData[personType].sisters) {
        formData[personType].sisters.forEach(sister => {
            if (sister) {
                userIds.push(extractId(sister));
            }
        });
    }

    // Check if person has siblings (Sister and Brother) and process them
    if (formData[personType].Sister) {
        processSiblings(formData[personType].Sister);
    }

    if (formData[personType].Brother) {
        processSiblings(formData[personType].Brother);
    }

    return userIds;
}
const extractIds = async (obj) => {
  let result = [];
  
  const recursiveExtract = (item) => {
    if (typeof item === 'string') {
      result.push(extractId(item));
    } else if (Array.isArray(item)) {
      item.forEach(subItem => recursiveExtract(subItem));
    } else if (typeof item === 'object' && item !== null) {
      Object.values(item).forEach(value => recursiveExtract(value));
    }
  };

  recursiveExtract(obj);
  return result;
};

  const handleSelectTab = async (key) => {
    let temp;
    let userId;
    switch (key) {
      case "Groom Solos":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          await getSolos('groom', formData);
          setIsLoading(false);
        }
        else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Bride Solos":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          await getSolos('bride', formData);
          setIsLoading(false);
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Combined":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          // temp = formData.bride.image.split("/");
          // const brideId = temp[temp.length - 1].split(".")[0];
          // temp = formData.groom.image.split("/");
          // const groomId = temp[temp.length - 1].split(".")[0];
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
    case "Groom Family":
      if (imagesData[key].length === 0) {
        setIsLoading(true);
        const combinedImages = imagesData["Combined"].length === 0 ? await fetchCombinedImages() : imagesData["Combined"];
        const brideSolos = imagesData['Bride Solos'].length === 0? await  getSolos('bride', formData):imagesData['Bride Solos'];
        const groomSolos = imagesData['Groom Solos'].length === 0? await  getSolos('groom', formData):imagesData['Groom Solos'];
        const userIds = extractUserIds('groom',formData);
        const familyImages = await fetchFamilyImages(key, userIds);
        const filteredData = familyImages.filter(img => {
          // Construct an array that conditionally includes brideSolos and groomSolos only if they have data
          const imageCollections = [combinedImages, ...brideSolos.length > 0 ? [brideSolos] : [], ...groomSolos.length > 0 ? [groomSolos] : []];
        
          // Flatten the array of arrays and check if any image_id matches
          return !imageCollections.flat().some(combinedImg => combinedImg.image_id === img.image_id);
        });
        
        setImagesData((prevState) => ({
          ...prevState,
          [key]: filteredData,
        }));
        setIsLoading(false);
      }else{
        if(isLoading === true)
          setIsLoading(false)
      }
      break;
      
     case "Groom Father Parents":
          if(imagesData[key].length === 0){
            setIsLoading(true)
            const userIds =await extractIds(formData.groom.father)
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
          }else{
            if(isLoading === true)
              setIsLoading(false)
          }
          break;
    case "Groom Mother Parents":
          if(imagesData[key].length === 0){
            setIsLoading(true)
            const userIds =await extractIds(formData.groom.mother)
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
          }else{
            if(isLoading === true)
              setIsLoading(false)
          }
          break;

      
      case "Bride Family":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          const combinedImages = imagesData["Combined"].length === 0 ? await fetchCombinedImages() : imagesData["Combined"];
          const brideSolos = imagesData['Bride Solos'].length === 0? await  getSolos('bride', formData):imagesData['Bride Solos'];
          const groomSolos = imagesData['Groom Solos'].length === 0? await  getSolos('groom', formData):imagesData['Groom Solos'];
          const userIds = extractUserIds('bride',formData);
          
          const familyImages = await fetchFamilyImages(key, userIds);
          const filteredData = familyImages.filter(img => {
            // Construct an array that conditionally includes brideSolos and groomSolos only if they have data
            const imageCollections = [combinedImages, ...brideSolos.length > 0 ? [brideSolos] : [], ...groomSolos.length > 0 ? [groomSolos] : []];
          
            // Flatten the array of arrays and check if any image_id matches
            return !imageCollections.flat().some(combinedImg => combinedImg.image_id === img.image_id);
          });
          
          setImagesData((prevState) => ({
            ...prevState,
            [key]: filteredData,
          }));
          setIsLoading(false);
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
        case "Bride Father Parents":
          if(imagesData[key].length === 0){
            setIsLoading(true)
            const userIds =await extractIds(formData.bride.father)
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
          }else{
            if(isLoading === true)
              setIsLoading(false)
          }
          break;
    case "Bride Mother Parents":
          if(imagesData[key].length === 0){
            setIsLoading(true)
            const userIds =await extractIds(formData.bride.mother)
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
          }else{
            if(isLoading === true)
              setIsLoading(false)
          }
          break;

      
        case "Groom and Bride Family":
          if (imagesData[key].length === 0) {
            setIsLoading(true);
            const combinedImages = imagesData["Combined"].length === 0 ? await fetchCombinedImages() : imagesData["Combined"];
            let userIds1 = extractUserIds('bride',formData)
            const brideFamilyImages = imagesData["Bride Family"].length === 0 ? await fetchFamilyImages("Bride Family", userIds1) : imagesData["Bride Family"];
            let userIds2 = extractUserIds('groom',formData)
            const groomFamilyImages = imagesData["Groom Family"].length === 0 ? await fetchFamilyImages("Groom Family", userIds2) : imagesData["Groom Family"];
            let userIds = userIds1.concat(userIds2)
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
          }else{
            if(isLoading === true)
              setIsLoading(false)
          }
          break;
      case "Kids":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData.kids.forEach((kid) => {
            const temp = kid.split("/");
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Other Kids":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData.otherKids.forEach((kid) => {
            const temp = kid.split("/");
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Other Cousins":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData.otherCousins.forEach((cousin) => {
            const temp = cousin.split("/");
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Uncles":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData.uncles.forEach((uncle) => {
            const temp = uncle.split("/");
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Aunts":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData.aunts.forEach((aunt) => {
            const temp = aunt.split("/");
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Grand Parents":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData.grandParents.forEach((grandParent) => {
            const temp = grandParent.split("/");
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Other Important Relatives":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData.otherImportantRelatives.forEach((relative) => {
            const temp = relative.split("/");
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
      case "Friends":
        if (imagesData[key].length === 0) {
          setIsLoading(true);
          let userIds = [];
          formData.friends.forEach((friend) => {
            const temp = friend.split("/");
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
        }else{
          if(isLoading === true)
            setIsLoading(false)
        }
        break;
        default:
          if (key.startsWith("Groom Father Sibling") || key.startsWith("Groom Mother Sibling")) {
            if (imagesData[key].length === 0) {
              setIsLoading(true);
              const relation = key.split(' ')[1]
              const siblingIndex = key.split(' ')[3]
              const parentType = relation.toLowerCase();
              const siblingKey = extractId(formData.groom[parentType].siblings[parseInt(siblingIndex) - 1]);
              const userIds = await extractIds(formData.groom[parentType].Siblings[parseInt(siblingIndex)]);
              userIds.push(siblingKey);
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
          }else{
            if(isLoading === true)
              setIsLoading(false)
          }
          break;
    }
    console.log(imagesData[key].length)
    // imagesData[key].length === 0 ?setFetchTimeout(true):console.log("Images fetched for : "+key);
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
                    <div className="horizontal-sections-wrapper">
                      <div className="horizontal-section">
                        <h3>Selected Images</h3>
                        <div className="image-row">
                          {imagesData[tab].filter(item => item.selected).length > 0 ? (
                            imagesData[tab].filter(item => item.selected).map((item, index) => (
                              <div key={index} className="image-container">
                                <LazyLoadImage
                                  src={item.thumbnailUrl}
                                  effect="blur"
                                  onLoad={() => {
                                    displayFavIcon(item.s3_url);
                                    setImageLoaded(true); // Set imageLoaded to true when image is loaded
                                  }}
                                  onClick={() => handleClickImage(item)}
                                />
                                <Heart
                                  data-key={item.s3_url}
                                  className="image_favourite_down"
                                />
                              </div>
                            ))
                          ) : (
                            <p>No selected images</p>
                          )}
                        </div>
                      </div>
                      <div className="horizontal-section">
                        <h3>Other Images</h3>
                        <div className="image-row">
                          {imagesData[tab].filter(item => !item.selected).length > 0 ? (
                            imagesData[tab].filter(item => !item.selected).map((item, index) => (
                              <div key={index} className="image-container">
                                <LazyLoadImage
                                  src={item.thumbnailUrl}
                                  effect="blur"
                                  onLoad={() => {
                                    hideFavIcon(item.s3_url);
                                    setImageLoaded(true); // Set imageLoaded to true when image is loaded
                                  }}
                                  onClick={() => handleClickImage(item)}
                                />
                                <Heart
                                  data-key={item.s3_url}
                                  className="image_favourite_down hidden"
                                />
                              </div>
                            ))
                          ) : (
                            <p>No other images</p>
                          )}
                        </div>
                      </div>
                      {clickedImg && (
                        <Modal
                          clickedImg={clickedImg}
                          clickedImgFavourite={clickedImgFavourite}
                          setClickedImg={setClickedImg}
                          clickedUrl={clickedUrl}
                          handleBackButton={handleBackButton}
                          handleFavourite={(imageUrl, isFav) => handleFavourite(imageUrl, isFav, tab)}
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
