import React, { useState, useEffect,useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import API_UTIL from '../../../services/AuthIntereptor';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../../components/Loader/LoadingSpinner';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';
import { LazyLoadImage } from "react-lazy-load-image-component";
import Masonry from "react-masonry-css";
import { Heart, Edit2,Upload, X,ChevronUp, ChevronDown} from "lucide-react";
import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import AppBar from '../../../components/AppBar/AppBar';
import defaultBanner from '../../../media/images/defaultbanner.jpg';
import  Modal   from 'react-modal';
import ImageModal from "../../../components/ImageModal/ImageModal";


const PageWrapper = styled.div`
  background-color: #121212;
  min-height: 100vh;
  color: #ffffff;
`;

const ContentWrapper = styled.div`
  display: flex;
  padding: 1rem;
  gap: 1rem;
  max-width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0.5rem;
  }
`;


const UnityLogo = styled.img`
  width: 1rem;
  height: 1rem;
  vertical-align: middle;
  margin-left: 0.25rem;
`;


const UploadTile = styled(motion.div)`
  background-color: #2a2a2a;
  border-radius: 0.5rem;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 0px 5px rgba(0, 255, 255, 0.5);

  &:hover {
    background-color: #3a3a3a;
    transform: translateY(-2px);
  }

  svg {
    margin-bottom: 0.5rem;
    color: #ffffff;
  }
`;

const UploadText = styled.span`
  color: #ffffff;
  font-size: 0.9rem;
`;

const SidePanel = styled.div`
  flex: 0 0 300px;
  background-color: #1e1e1e;
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const PortfolioImage = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const OrgName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #66d3ff, #9a6aff 38%, #ee75cb 71%, #fd4d77);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: white;

  svg {
    margin-right: 0.5rem;
    color: #00ffff;
  }
`;


const ActionButton = styled.button`
  background-color: #2a2a2a;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  margin: 0 0.5rem;

  &:hover {
    box-shadow: 0 0 10px rgba(64, 224, 208, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 1;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
  padding: 0.3rem;
  font-size: 0.8rem;
}
`;

const StyledTabs = styled.div`
  .tab-list {
    display: flex;
    border-bottom: 1px solid #3a3a3a;
    margin-bottom: 1.5rem;
  }

  .tab {
    color: #ffffff;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
    background-color: transparent;

    &:hover {
      background-color: #2a2a2a;
    }

    &.active {
      background-color: #3a3a3a;
      box-shadow: 0 0 5px rgba(64, 224, 208, 0.5);
      border-radius: 0.5rem 0.5rem 0 0;
      background: 0 0 10px rgba(64, 224, 208, 0.5);
    }
  }
`;


const TabContent = styled(motion.div)`
  background-color: #1e1e1e;
  border-radius: 0 0 1rem 1rem;
  padding: 1.5rem;
  min-height: 300px; // Add this to ensure a minimum height
  position: relative; // Add this for absolute positioning of spinner

  @media (max-width: 768px) {
  padding: 0.75rem;
}
`;

const CenteredSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;


const ImageWrapper = styled.div`
  margin-bottom: 16px;
  break-inside: avoid;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  margin-left:1em;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
`;


const ImageModalWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  background-color: rgba(0, 0, 0, 1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledMasonry = styled(Masonry)`
  display: flex;
  margin-left:1rem;
  width: auto;

  .my-masonry-grid_column {
    background-clip: padding-box;
  }

  .image-item {
    margin-bottom: 0.5rem;
    break-inside: avoid;
  }

    @media (max-width: 768px) {
    .my-masonry-grid_column {
    }
  }
`;

const StyledModal = styled(Modal)`
  &.modal-content {
    background-color: transparent;
    border: none;
    padding: 0;
    max-width: 100%;
    width: auto;
    margin: 0;
    outline: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 1.25rem;
  max-width: 31.25rem;
  width: 90%;
  color: #ffffff;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1rem;
  transition: color 0.3s ease;

  &:hover {
    color: #00ffff;
  }
`;

const Dropzone = styled.div`
  border: 0.125rem dashed #3a3a3a;
  border-radius: 0.625rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ffff;
    background-color: rgba(0, 255, 255, 0.05);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.625rem;
  background-color: #2a2a2a;
  border-radius: 0.3125rem;
  margin-top: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #00ffff;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;
const FolderSection = styled.div`
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
   display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
`;

// Folder name section with clickable area to expand/collapse
const FolderName = styled.div`
  padding: 10px 15px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-left:5em;
 
`;

// Button to expand/collapse the folder content
const ExpandButton = styled.span`
  font-size: 14px;
  color: White;
  border-radius: 12px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right:1em;
`;

const Input = styled.input`
  background-color: #ffffff;
  border: 1px solid #3a3a3a;
  color: #000000;
  padding: 0.5rem;
  border-radius: 4px;
`;

const GlobalStyle = createGlobalStyle`
  .wrapper-pro {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .wrapper-images-pro {
    position: relative;
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;

    img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    p {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      margin: 0;
      padding: 0.25rem;
      text-align: center;
    }

    &.selectable {
      &:hover {
        transform: scale(1.05);
      }
    }

    &.selected {
      border: 2px solid #00ffff;
    }

    .tick-mark {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background-color: #00ffff;
      color: #1e1e1e;
      border-radius: 50%;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .my-masonry-grid {
    display: flex;
    width: auto;
  }
  .my-masonry-grid_column {
    background-clip: padding-box;
  }
  .my-masonry-grid_column > div {
    background: #323232;
    margin-bottom: 30px;
  }
`;


const PortfolioForm = () => {
  const userPhoneNumber = localStorage.userPhoneNumber;
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    user_phone_number: userPhoneNumber,
    social_media: {
      instagram: '',
      youtube: '',
      facebook: '',
    },
    org_name: '',
    role: 'creator',
  });
  const [bannerImage, setBannerImage] = useState(defaultBanner);

   const [clickedImg, setClickedImg] = useState(null);
  const [clickedImgIndex, setClickedImgIndex] = useState(null);
  const [clickedImgFavourite, setClickedImgFavourite] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
 
  
  const [folders, setFolders] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(null);
  const [ editMode, setEditMode] = useState(false);
  const [breakpointColumnsObj, setBreakpointColumnsObj] = useState({
    default: 5,
    1200: 4,
    992: 3,
    768: 2,
    576: 1,
  });

  const [uploadStatus, setUploadStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [totalUploadedBytes, setTotalUploadedBytes] = useState(0);
  const [isUploadFilesModelOpen, setUploadFilesModeOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFilesModalStatus, setUploadFilesModalStatus] = useState('');
  const [isUploadFilesFailed, setIsUploadFilesFailed] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadingFolderName,setUploadingFolderName] = useState('');
 const [images, setImages] = useState([]);

 const [expandedFolderIndex, setExpandedFolderIndex] = useState(0);  // First folder expanded by default


  const handleBannerImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('bannerImage', file);
      formData.append('userName', userName);

      try {
        const response = await API_UTIL.post('/updateBannerImage', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data && response.data.imageUrl) {
          const formattedUrl = encodeURIWithPlus(response.data.imageUrl);
          console.log(`formattedUrl:`, formattedUrl);
        
          setBannerImage(`${formattedUrl}?t=${Date.now()}`);

        }
      } catch (error) {
        console.error('Error uploading banner image:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const totalFiles = acceptedFiles.length;
    if (totalFiles > 500) {
      setFileCount(totalFiles);
      setUploadStatus(`You have selected ${totalFiles} files. You can upload a maximum of 30 files`);
      setUploading(false);
    } else {
      setFiles(acceptedFiles);
      setFileCount(totalFiles);
      setUploadProgress({});
      setUploadStatus('');
      setUploading(false);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  


  
  const uploadFiles = async () => {
    if (files.length === 0) {
      setUploadStatus('Please select files to upload');
      return;
    }
  
    setUploading(true);
    setUploadFilesModalStatus('Uploading files...');
    setIsUploadFilesFailed(false);
    setOverallProgress(0); // Start at 0% progress
  
    const MAX_CONCURRENT_UPLOADS = 3; // Reduced to avoid 429 error
    const MAX_RETRIES = 3;
    let index = 0;
    const totalFiles = files.length;
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0); // Total size of all files
  
    // Use React state to safely track the total uploaded bytes
  
    const uploadFile = async (file) => {
      const data = new FormData();
      data.append('user_phone_number', formData.user_phone_number);
      data.append('user_name', userName);
      data.append(`${uploadingFolderName}_images`, file);    
        
      let attempts = 0;
      let delayTime = 1000; // Start with 1 second delay
  
      while (attempts < MAX_RETRIES) {
        try {
          const response = await API_UTIL.post('/uploadPortfolioImages', data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },onUploadProgress: (progressEvent) => {
              // Dynamically update the total uploaded bytes using state update function
              setTotalUploadedBytes((prevUploadedBytes) => {
                const updatedUploadedBytes = prevUploadedBytes + progressEvent.loaded;
                
                // Calculate and update overall progress based on total uploaded bytes
                const overallProgress = (updatedUploadedBytes / totalBytes) * 100;
                setOverallProgress(Math.ceil(overallProgress)); // Round to nearest integer
                
                return updatedUploadedBytes;
              });
            },
          });
  
          return response.data;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            console.error(`Error uploading file ${file.name}, attempt ${attempts}: Too many requests, retrying after ${delayTime / 1000} seconds`);
            await delay(delayTime);
            delayTime *= 2; // Double the delay time for exponential backoff
          } else {
            console.error(`Error uploading file ${file.name}, attempt ${attempts}:`, error);
          }
          attempts++;
          if (attempts === MAX_RETRIES) throw error;
        }
      }
    };
  
    const handleUploads = async () => {
      while (index < files.length) {
        const promises = [];
        for (let i = 0; i < MAX_CONCURRENT_UPLOADS && index < files.length; i++) {
          promises.push(uploadFile(files[index]));
          index++;
        }
        await Promise.allSettled(promises);
      }
    };
  
    try {
      await handleUploads();  
      setUploadStatus('Upload completed successfully');
      setFolders(prevFolders => {
        const existingFolderIndex = prevFolders.findIndex(folder => folder.folderName === uploadingFolderName);
      
        // Map file details as needed
        const newImages = files.map(file => ({
          s3_url: `https://flashbackportfoliouploads.s3.ap-south-1.amazonaws.com/${userName}/${uploadingFolderName}/${file.name}`,
          uploadDate: Date.now(),
          is_favourite: false
        }));
      
        let updatedFolder;
      
        if (existingFolderIndex !== -1) {
          // Folder exists, update its images
          updatedFolder = {
            ...prevFolders[existingFolderIndex],
            images: [...prevFolders[existingFolderIndex].images, ...newImages]  // Append new images
          };
      
          // Remove the existing folder and reinsert at the top
          const remainingFolders = prevFolders.filter((_, index) => index !== existingFolderIndex);
          return [updatedFolder, ...remainingFolders];
        } else {
          // Folder doesn't exist, create a new one and add it to the top
          updatedFolder = {
            folderName: uploadingFolderName,
            images: newImages
          };
      
          return [updatedFolder, ...prevFolders];
        }
      });
      setExpandedFolderIndex(0);
      
      
      setFiles([]);
      console.log(folders);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setOverallProgress(100); // Ensure progress bar is set to 100% on completion
      setFileCount(0);
      setUploadFilesModeOpen(false);
      setUploadingFolderName('');
    }
  };

  

const handleEditClick = () => {
  console.log("Edit Click");
  setEditMode(true);
}
const handleCancelEdit = () => setEditMode(false);


const handleImageClick = (imageData, index, images) => {
  const updatedImages = images.map(image => ({
    original: image.s3_url,  // Rename s3_url to original
    thumbnail: image.s3_url, // Add thumbnail with the same value as s3_url
    isFavourite: image.is_favourite,
  }));
  
  setImages(updatedImages);
  setClickedImg(imageData.s3_url);
  setClickedImgIndex(index);
  setClickedImgFavourite(imageData.isFavourites);
  setClickedUrl(imageData.original);
  window.history.pushState({ id: 1 }, null, "?image=" + `${imageData.s3_url.split('/').pop()}`);
};
const handleBackButton = () => {
  setClickedImg(null);
};

const handleFavourite = async (index, imageUrl, isFav) => {
  // Make the API request
  await API_UTIL.post("/setPortfolioFavourites", {
    imageUrl,
    username: formData.user_name,
    isFav,
  });

  // After successful API call, update the folders state
  setFolders(prevFolders =>
    prevFolders.map(folder => {
      // Update the images with the new favourite status
      const updatedImages = folder.images.map(image =>
        image.s3_url === imageUrl ? { ...image, is_favourite: isFav } : image
      );

      // Sort the images by is_favourite (favourites first)
      const sortedImages = updatedImages.sort((a, b) => b.is_favourite - a.is_favourite);

      return {
        ...folder,
        images: sortedImages, // Use sorted images
      };
    })
  );
};



const toggleFavourite = (index,image) => {
  const isFav = image.is_favourite;
  handleFavourite(index,image.s3_url, !isFav);
};

const toggleFolder = (index) => {
  if (index === expandedFolderIndex) {
    setExpandedFolderIndex(null);  // Collapse the currently expanded folder
  } else {
    setExpandedFolderIndex(index);  // Expand the clicked folder
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log(formData);
    // if(name === 'org_name'){
    //   if(!userName){
    //     console.log(value);
    //     setFormData({...formData,'user_name':value});
    //   }
      
    // }
  };
  const handleFolderName = (e) => {
    setUploadingFolderName(e.target.value);
  }

  const handleFolderNameChange = (index, event) => {
    const { value } = event.target;
    const updatedFolders = [...folders];
    updatedFolders[index].folderName = value;
    setFolders(updatedFolders);
  };

  // const handleImageUpload = (index, event) => {
  //   const files = Array.from(event.target.files);
  //   const updatedFolders = [...folders];
  //   updatedFolders[index].images = [...(updatedFolders[index].images || []), ...files];
  //   setFolders(updatedFolders);
  // };

  const addFolder = () => {
    
    setUploadFilesModeOpen(true);
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      social_media: {
        ...prevData.social_media,
        [name]: value,
      },
    }));
  };



  const fetchPortfolioImages = async (user_name) => {
    try {
      const response = await API_UTIL.get(`/getPortfolioImages/${user_name}`);
      if (response.status === 200) {
       
        // const folders = Object.keys(images).filter(folder => folder.toLowerCase() !== 'banner');
        setFolders(response.data);

        // const gridImages = await convertImagesForGridGallery(images);
        // setGridImages(gridImages);
      }
    } catch (error) {
      console.error('Error fetching portfolio images:', error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await API_UTIL.get(`/fetchUserDetails/${userPhoneNumber}`);
      setIsLoading(false);
      
      // Check if the user details have the `org_name` and if the user is the same.
      if (
        userPhoneNumber !== response.data.data.user_name &&
        response.data.data.hasOwnProperty('org_name')
      ) {
        // Update the formData state with the retrieved user details.
        setFormData((prevFormData) => ({
          ...prevFormData,
          org_name: response.data.data.org_name || '',
          social_media: {
            instagram: response.data.data.social_media?.instagram || '',
            youtube: response.data.data.social_media?.youtube || '',
            facebook: response.data.data.social_media?.facebook || '',
          },
          role: response.data.data.role || 'creator',
          user_name:response.data.data.user_name
        }));
        if(!response.data.data.user_name) setEditMode(true);
        else{

          setUserName(response.data.data.user_name);
          fetchBannerImage(response.data.data);
          fetchPortfolioImages(response.data.data.user_name);

        }
       
       
       
      }
      else{
        setEditMode(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchBannerImage = useCallback(async (userDetails) => {
    console.log('Entering FetchBannerImage Method and started loading');
      setIsLoading(true);
    if (userDetails.org_name && userDetails.user_name) {
      try {
        const response = await API_UTIL.get(`/getBannerImage/${userDetails.user_name}`);
        console.log(`ImageURl:`, response.data.imageUrl);
          
        if (response.data && response.data.imageUrl) {
          const formattedUrl = encodeURIWithPlus(response.data.imageUrl);
          console.log(`formattedUrl:`, formattedUrl);
          setBannerImage(`${formattedUrl}?t=${Date.now()}`);
        } else {
          console.log('[catch1]Falling back to default banner');
          setBannerImage(defaultBanner);
        }
      } catch (error) {
        console.error('Error fetching banner image:', error);
        console.log(`[catch2]Falling back to default banner`);
        setBannerImage(defaultBanner);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log(`[catch3]Falling back to default banner`);
      setBannerImage(defaultBanner);
      setIsLoading(false);
    }
  }, []);
 
 
  const encodeURIWithPlus = (uri) => {
    return uri.replace(/ /g, '+');
  };

  useEffect(() => {
    fetchUserDetails();
    
  }, [navigate]);

  // const saveUploadedImages = async (user_name) => {
  //   const data = new FormData();
  //   data.append('user_phone_number', formData.user_phone_number);
  //   data.append('org_name', formData.org_name);
  //   data.append('user_name', user_name);

  //   folders.forEach((folder) => {
  //     folder.images.forEach((image) => {
  //       data.append(`${folder.folderName}_images`, image);
  //     });
  //   });

  //   const headers = {
  //     'Content-Type': 'multipart/form-data',
  //   };

  //   try {
  //     const response = await API_UTIL.post('/uploadPortfolioImages', data, { headers });
  //     if (response.status !== 200) {
  //       throw new Error('Failed to save images');
  //     }
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error in saveUploadedImages:', error);
  //   }
  // };


  // const handleImageUpload = async (index, event) => {
  //   const files = Array.from(event.target.files);
  //   console.log(files);
  //   if(files.length===0){
  //     return;
  //   }
  //   const folderName = folders[index].folderName;
   
  
  //   // Create FormData for each folder and upload directly to the backend
  //   const data = new FormData();
  //   data.append('user_phone_number', formData.user_phone_number);
  //   data.append('user_name', formData.user_name);
    
  //   // Append each file to the FormData object with the folder name
  //   files.forEach((file) => {
  //     data.append(`${folderName}_images`, file); // The key corresponds to the field name expected by the API
  //   });

  //   setSelectedFiles(files);
  
  //   try {
  //     const response = await API_UTIL.post('/uploadPortfolioImages', data, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  
  //     if (response.status === 200) {
  //       const updatedFolders = [...folders];
  //       updatedFolders[index].images = [...(updatedFolders[index].images || []), ...files];
  //       setFolders(updatedFolders);
  //       console.log('Images uploaded successfully:', response.data);
  //       // You can update the state or display a success message here
  //     } else {
  //       console.error('Failed to upload images:', response);
  //     }
  //   } catch (error) {
  //     console.error('Error uploading images:', error);
  //   }
  // };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let requestData = {
        user_phone_number: formData.user_phone_number,
        ...formData,

      };
  
      // Check if userName does NOT exist and add user_name with org_name value
      if (!userName) { // Assuming userName is the variable or function checking the existence of the name
        requestData.user_name = formData.org_name; // Add user_name from org_name
      } else { // Assuming you have a function to check if userName exists
        const { user_name, ...rest } = requestData; // Destructure and exclude user_name
        requestData = { ...rest }; // Create a new object without user_name
      }
  
      const res = await API_UTIL.post("/updatePortfolioDetails", requestData);
      if (res.status === 200) {
        setActiveTab('images');
        setEditMode(false);
        setUserName(res.data.data.user_name);
      }
    } catch (error) {
      console.error("Error in updating the portfolio details:", error);
      if (error.response) {
        toast.error("Error in updating portfolio");
      }
    }
  };

  const openUploadFilesModal = () => {
    setUploadFilesModeOpen(true);
  };

  const closeUploadFilesModal = () => {
    setUploadFilesModeOpen(false);
    setFiles([]);
    setUploadProgress({});
    setUploadStatus('');
    setUploading(false);
    setFileCount(0);
  };
  

  const toggleHighlight = (folderIndex, imgIndex) => {
    const updatedFolders = [...folders];
    const image = updatedFolders[folderIndex].images[imgIndex];
    image.highlighted = !image.highlighted;
    setFolders(updatedFolders);
  };

  return (
    <PageWrapper>
      <GlobalStyle />
      <AppBar showCoins={true} />
      <ContentWrapper>
        <AnimatePresence>
        <SidePanel>
          <PortfolioImage>
            <img src={bannerImage} alt="Event" />
            
          </PortfolioImage>
          <ActionButton onClick={handleEditClick} >
              <Edit2 size={18} />
          </ActionButton>
          <OrgName>{formData.org_name}</OrgName>
          <SocialLinks>
            <InfoItem>
              <FaInstagram size={18} />
              {formData.social_media.instagram || 'Link not set'}
            </InfoItem>
            <InfoItem>
              <FaYoutube size={18} />
              {formData.social_media.youtube || 'Link not set'}

            </InfoItem>
            <InfoItem>
              <FaFacebook size={18} />
              {formData.social_media.facebook || 'Link not set'}
            </InfoItem>
          </SocialLinks>  
            <ActionButton type="button" onClick={addFolder} className="add-folder-button">
              Add Folder
            </ActionButton>


        </SidePanel>
        </AnimatePresence>
        <MainContent>
        <AnimatePresence >
        {folders.map((folder, index) => (
        <div key={index} className="folder-section">
          <FolderSection>
            <FolderName onClick={() => toggleFolder(index)}>
              {folder.folderName}
              </FolderName>
              <ExpandButton onClick={() => toggleFolder(index)}>
              {expandedFolderIndex === index ? <ChevronUp /> : <ChevronDown />}
              </ExpandButton>
           
          </FolderSection>

          {/* Conditionally render the folder contents based on the expanded state */}
          {expandedFolderIndex === index && (
              <StyledMasonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                <UploadTile onClick={() => { openUploadFilesModal();  setUploadingFolderName(folder.folderName); }} 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}>
                            <Upload size={24} />
                            <UploadText> Upload images </UploadText>
                          </UploadTile>

                  {folder.images.map((image, imgIndex) => (
                    <ImageWrapper key={imgIndex}>
                      <LazyLoadImage
                        src={image.s3_url}  // Use the s3_url directly from the API response
                        alt={`img ${index}`}
                        effect="blur"
                        onClick={() => handleImageClick(image, imgIndex,folder.images)}
                      />
                      <Heart
                        data-key={index}
                        className={`heart-icon ${image.is_favourite ? "bgRed" : ""}`}  // Adjusted key for favourite
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavourite(index,image);
                        }}
                      />
                    </ImageWrapper>
                    // <AnimatePresence mode="wait">
                      
                    //   <StyledMasonry
                    //     breakpointCols={breakpointColumnsObj}
                    //     className="my-masonry-grid"
                    //     columnClassName="my-masonry-grid_column"
                    //   >
                    //     <UploadTile >
                    //     whileHover={{ scale: 1.05 }}
                    //     whileTap={{ scale: 0.95 }}>
                    //       <Upload size={24} />
                    //       <UploadText> Upload images </UploadText>
                    //     </UploadTile>
                    //     { images.map((imageData, index) => (
                    //       <ImageWrapper key={index} >
                    //         <img
                    //           src={imageData.s3_url}
                    //           alt={`img ${index}`}
                    //           onClick={() => handleImageClick(imageData, index)}
                    //         />
                    //         </ImageWrapper>
                    //     ))}
                    //   </StyledMasonry>

                    // </AnimatePresence>
                  ))}
                </StyledMasonry>
          )}
              </div>
          ))}
        </AnimatePresence>
        </MainContent>
      </ContentWrapper>
      {clickedImg && (
        <ImageModalWrapper>
        <ImageModal
        clickedImg={clickedImg}
        clickedImgIndex={clickedImgIndex}
        clickedImgFavourite={clickedImgFavourite}
        setClickedImg={setClickedImg}
        clickedUrl={clickedUrl}
        handleBackButton={handleBackButton}
        handleFavourite={handleFavourite}
        images={images}
        />
        </ImageModalWrapper>
      )}
      <StyledModal
        isOpen={isUploadFilesModelOpen}
        onRequestClose={closeUploadFilesModal}
        contentLabel="Upload Files"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <ModalOverlay>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CloseButton onClick={closeUploadFilesModal}><X size={24} /></CloseButton>
            <FormGroup>
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                type="text"
                id="folderName"
                name="folderName"
                value={uploadingFolderName}
                onChange={handleFolderName}
                required
              />
            </FormGroup>
            <h2>Upload Files</h2>
            <Dropzone {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              {files.length > 0 ? (
  <p>{fileCount} file(s) selected.</p>
                ) : (
                  <p>Drag 'n' drop files here, or click to select files</p>
                )}
            </Dropzone>

            {uploadStatus && <p>{uploadStatus}</p>}
            <div style={{
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '2rem', 
              paddingTop: '1rem' }}>
            <ActionButton onClick={uploadFiles} disabled={ files.length === 0 || fileCount > 30}>
              Upload
            </ActionButton>
            </div>
            {uploading && (
              <ProgressBar>
                <ProgressFill progress={overallProgress} />
              </ProgressBar>
            )}
          </ModalContent>
        </ModalOverlay>
      </StyledModal>


      <AnimatePresence>
        {editMode && (
          <StyledModal
            isOpen={editMode}
            onRequestClose={handleCancelEdit}
            contentLabel="Edit Event"
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            <ModalOverlay>
              <ModalContent
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <CloseButton onClick={handleCancelEdit}><X size={24} /></CloseButton>
                <h2>Create Portfolio</h2>
                <form onSubmit={handleSubmit}>
                  <LabelAndInput
                    htmlFor="org_name"
                    label="Photography Name:"
                    type="text"
                    id="org_name"
                    name="org_name"
                    placeholder="Enter your Studio Name"
                    value={formData.org_name}
                    handleChange={handleInputChange}
                    isRequired={true}
                    isEditable={true}
                  />
                  <LabelAndInput
                    htmlFor="instagram"
                    label="Instagram URL:"
                    type="text"
                    id="instagram"
                    name="instagram"
                    placeholder="Provide your Instagram URL"
                    value={formData.social_media.instagram}
                    handleChange={handleSocialMediaChange}
                    isRequired={false}
                    isEditable={true}
                  />
                  <LabelAndInput
                    htmlFor="youtube"
                    label="YouTube URL:"
                    type="text"
                    id="youtube"
                    name="youtube"
                    placeholder="Provide your YouTube URL"
                    value={formData.social_media.youtube}
                    handleChange={handleSocialMediaChange}
                    isRequired={false}
                    isEditable={true}
                  />
                  <LabelAndInput
                    htmlFor="facebook"
                    label="Facebook URL:"
                    type="text"
                    id="facebook"
                    name="facebook"
                    placeholder="Provide your Facebook URL"
                    value={formData.social_media.facebook}
                    handleChange={handleSocialMediaChange}
                    isRequired={false}
                    isEditable={true}
                  />
                  <FormGroup>
                    <Label htmlFor="eventImage">Upload Banner Image</Label>
                    <Input
                      type="file"
                      id="eventImage"
                      name="eventImage"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                    />
                  </FormGroup>
                  <StyledButton type="submit">Save</StyledButton>
                </form>
              </ModalContent>
            </ModalOverlay>
          </StyledModal>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default PortfolioForm;

// Styled Components
// const Container = styled.div`
//   padding: 20px;
// `;

// const TabButtons = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin-bottom: 20px;
// `;


const StyledButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  margin: 10px 0;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const calculateColumns = () => {
  const width = window.innerWidth;
  if (width >= 1200) {
    return 5;
  } else if (width >= 992) {
    return 4;
  } else if (width >= 768) {
    return 3;
  } else {
    return 2;
  }
};

