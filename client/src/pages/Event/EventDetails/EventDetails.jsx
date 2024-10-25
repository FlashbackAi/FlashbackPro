import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { createGlobalStyle } from 'styled-components';
import CustomQRCode from '../../../components/CustomQRCode/CustomQRCode';
import QRCode from 'qrcode.react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import Masonry from 'react-masonry-css';
import Modal from 'react-modal'
import ImageModal from "../../../components/ImageModal/ImageModal";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Edit2, Calendar, Clock, MapPin, Download, Share2, Users, Images, Album, Network, Handshake, Plus, X, Upload, ScrollText, Heart , Gem} from 'lucide-react';
import { IoDiamond } from "react-icons/io5";
import API_UTIL from '../../../services/AuthIntereptor';
import AppBar from '../../../components/AppBar/AppBar';
import MergeDuplicateUsers from '../../../pages/Pro/ProShare/MergeHandler/MergeDuplicateUsers'
import LoadingSpinner from '../../../components/Loader/LoadingSpinner';
import LabelAndInput from '../../../components/molecules/LabelAndInput/LabelAndInput';

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
  margin-bottom:1em;

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

const EventImage = styled.div`
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

const EventTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #66d3ff, #9a6aff 38%, #ee75cb 71%, #fd4d77);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const EventInfo = styled.div`
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

const QRCodeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1.5rem;
`;

const QRActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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

const MergeButton = styled(ActionButton)`
  background-color: #2a2a2a;
  &:hover {
    box-shadow: 0 0 10px rgba(64, 224, 208, 0.5);
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: #2a2a2a;
  &:hover {
    box-shadow: 0 0 10px rgba(255, 99, 71, 0.5);
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

const UserCategoryTabs = styled(StyledTabs)`
  margin-bottom: 1rem;
`;

const UserCategoryContent = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const TabContent = styled(motion.div)`
  background-color: #1e1e1e;
  border-radius: 0 0 1rem 1rem;
  padding: 0.25rem;
  min-height: 300px; // Add this to ensure a minimum height
  position: relative; // Add this for absolute positioning of spinner
  

  @media (max-width: 768px) {
  padding: 0.75rem;
}
`;


const InvitationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-right:10em;
`;

const InvitationItem = styled.li`
  padding: .8em;
  display: flex;
  flex-direction: column;
  border-radius:1em;
  background-color:#4b4a4a;
  margin-bottom:.5em;
`;

const InvitationInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const UserName = styled.span`
  font-weight: bold;
  font-size: 1.5em;
  margin-right:.5em
`;

const GuestCount = styled.span`
  font-size: 1em;
  margin-left:.5em
`;

const InvitationStatus = styled.span`
  font-size: 1em;  
`;

const StyledSeparator = styled.span`
  font-size: 1.5em;
`;

const InvitationDate = styled.div`
  font-size: 14px;
`;

const CenteredSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const FlashbackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const FlashbackTile = styled.div`
  background-color: #2a2a2a;
  border-radius: 0.5rem;
  height: 150px;
  display: flex;
  flex-direction:column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #3a3a3a;
    transform: translateY(-2px);
  }
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


const UserThumbnail = styled(motion.div)`
  width: 7rem;
  height: 7rem;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 0 0 0.25rem rgba(64, 224, 208, 0.5);
  }

  img {
    width: 100%;
    height: 100%;
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
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
  width: 5rem;
  height: 5rem;
}
`;


const StyledMasonry = styled(Masonry)`
  display: flex;
  margin-left: 1rem;
  width: auto;

  .my-masonry-grid_column {
    background-clip: padding-box;
  }

  .image-item {
    //margin-bottom: 0.5rem;
    break-inside: avoid;
  }

    @media (max-width: 768px) {
    .my-masonry-grid_column {
      //padding-left: 0.5rem;
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

const AttendeesSummary = styled.div`
  background-color: #2a2a2a;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalAttendees = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
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
    //margin-left: -30px;
    width: auto;
  }
  .my-masonry-grid_column {
   // padding-left: 30px;
    background-clip: padding-box;
  }
  .my-masonry-grid_column > div {
    background: grey;
   // margin-bottom: 30px;
  }
`;

const Label = styled.label`
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 500;
  margin-right:1em;
`;

const Input = styled.input`
  background-color: #ffffff;
  border: 1px solid #3a3a3a;
  color: #000000;
  padding: 0.5rem;
  border-radius: 4px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const EventDetails = () => {
  const { eventName } = useParams();
  const [event, setEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPeopleLoading, setIsPeopleLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [continuationToken, setContinuationToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [requiredCoins, setRequiredCoins] = useState(0);
  const [totalUploadedBytes, setTotalUploadedBytes] = useState(0);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [isUploadFilesModelOpen, setUploadFilesModeOpen] = useState(false);
  const [isCreateFlashbackModalOpen,setIsCreateFlashbackModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userThumbnails, setUserThumbnails] = useState([]);
  const [eventInvitations,setEventInvitations ] = useState([]);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('gallery');
  const [userDetails, setUserDetails] = useState(null);
 // const [requiredCoins, setRequiredCoins] = useState(0);
  const [canUpload, setCanUpload] = useState(true);
  const [showMergePopup, setShowMergePopup] = useState(false);
  const [showMergeDuplicateUsers, setShowMergeDuplicateUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userPhoneNumber = localStorage.userPhoneNumber;
  const [isImageProcessingDone, setIsImageProcessingDone] = useState(true);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMainUser, setSelectedMainUser] = useState(null);
  const [selectedDuplicateUsers, setSelectedDuplicateUsers] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadFilesModalStatus, setUploadFilesModalStatus] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isUploadFilesFailed, setIsUploadFilesFailed] = useState(false);
  const [isCoinsDedcuted,setIsCoinsDeducted] = useState(false);
  const [mergeMessage, setMergeMessage] = useState("");
  const isDataFetched = useRef(false);
  const [clickedImg, setClickedImg] = useState(null);
  const [clickedImgIndex, setClickedImgIndex] = useState(null);
  const [clickedImgFavourite, setClickedImgFavourite] = useState(null);
  const [clickedUrl, setClickedUrl] = useState(null);
  const [rewardPoints, setRewardPoints] = useState();
  const [clientDetails, setClientDetails] = useState([]);
  const [showRewardPointsPopUp, setShowRewardPointsPopUp] = useState(null);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userCategoryTab, setUserCategoryTab] = useState('registered');
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [flashbackName, setFlashbackName] = useState('');
  const navigate = useNavigate();
  const qrRef = useRef();
  const loader = useRef(null);
  const [eventFlashbacks, setEventFlashbacks]= useState([]);
  const [ eventImage, setEventImage] = useState('');
  const [selectedInvitationStatus, setSelectedInvitationStatus] = useState(null);


  const onLoad = () => {
    setIsImageLoading(false);
    const lazySpan = document.querySelector(".lazyImage");
    lazySpan && lazySpan.classList.add("visible");
  };

  useEffect(() => {
    fetchEventData(eventName);
    fetchUserDetails();
  }, [eventName]);

  const fetchEventData = async (eventName) => {
    setIsPageLoading(true);
    try {
      const response = await API_UTIL.get(`/getEventDetails/${eventName}`);
      setEvent(response.data);
      setEventImage(response.data.event_image);
      setEventData({
        eventName: response.data.event_name,
        eventDate: response.data.event_date.split('T')[0],
        eventTime: response.data.event_date.split('T')[1].slice(0, 5),
        invitationNote: response.data.invitation_note,
        eventLocation: response.data.event_location,
        folder_name: response.data.folder_name
      });
      setIsImageProcessingDone(response.data.uploaded_files === response.data.files_indexed);
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true)
    try {
      const response = await API_UTIL.get(`/getUserDetails/${userPhoneNumber}`);
      if (response.status === 200) {
        setUserDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const closeImageModal = () => {
    setSelectedImage(null);
  };
  
  const fetchImages = useCallback(async () => {
    if (!event || !hasMore || isGalleryLoading) return;
  
    setIsGalleryLoading(true);
    try {
      const response = await API_UTIL.get(`/getEventImages/${event.folder_name}?continuationToken=${encodeURIComponent(continuationToken || '')}`);
      
      if (response.status === 200) {
        const { images: s3Urls, lastEvaluatedKey } = response.data;
  
        const formattedImages = s3Urls.map((url) => ({
          original: url,
          thumbnail: url,
          isFavourites: false,
        }));
  
        setImages((prevImages) => [...prevImages, ...formattedImages]);
        setContinuationToken(lastEvaluatedKey);
        setHasMore(Boolean(lastEvaluatedKey));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setHasMore(false);
    } finally {
      setIsGalleryLoading(false);
    }
  }, [continuationToken, hasMore, isGalleryLoading, event]);

  useEffect(() => {
    if (event && activeTab === 'gallery' && images.length === 0) {
      fetchImages();
    }
  }, [event, activeTab, images.length, fetchImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isGalleryLoading) {
          fetchImages();
        }
      },
      { threshold: 0.5 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [fetchImages, hasMore, isGalleryLoading]);
  
  const fetchUserThumbnails = async () => {
    setIsPeopleLoading(true);
    try {
      const response = await API_UTIL.get(`/userThumbnailsByEventId/${event.event_id}`);
      if (response.status === 200) {
        setUserThumbnails(response.data);
      } else {
        throw new Error("Failed to fetch user thumbnails");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsPeopleLoading(false);
    }
  };

  const fetchEventInvitations = async () => {
    setIsPeopleLoading(true);
    try {
      const response = await API_UTIL.get(`/getEventInvitationDetails/${event.event_id}`);
      if (response.status === 200) {
        setEventInvitations(response.data.data);
        setUserCategoryTab('invited');
      } else {
        throw new Error("Failed to fetch user thumbnails");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsPeopleLoading(false);
    }
  };

  useEffect(() => {
    if (event && activeTab === 'people') {
      if(event.uploaded_files>=0)
        fetchUserThumbnails();
      else  
        fetchEventInvitations();
    }
  }, [event, activeTab]);

  const statusCounts = useMemo(() => {
    return eventInvitations.reduce((acc, inv) => {
      acc[inv.invitation_status] = (acc[inv.invitation_status] || 0) + 1;
      return acc;
    }, {});
  }, [eventInvitations]);

  const filteredInvitations = selectedInvitationStatus
  ? eventInvitations.filter((inv) => inv.invitation_status === selectedInvitationStatus)
  : eventInvitations;

  const handleEditClick = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFlashbackNameChange = (event) => {
    const { value } = event.target;
    setFlashbackName(value);
    setFlashbackName(value);
  };
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API_UTIL.put(`/updateEvent/${event.event_id}`, {
        event_name: eventData.eventName,
        event_date: `${eventData.eventDate}T${eventData.eventTime}:00`,
        invitation_note: eventData.invitationNote,
        event_location: eventData.eventLocation,
      });

      if (response.status === 200) {
        setEditMode(false);
        fetchEventData(eventName);
        toast.success('Event updated successfully');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update the event. Please try again.');
    }
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${event.event_name}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.error('QR Code canvas not found');
    }
  };

  const UsershareOnWhatsApp = (item) => {
    const userId = item.user_id;
    const count = item.count;
    const text = `*Greetings*,\nWe have discovered your *${count}* images captured during the event *"${eventDetails?.event_name}"*.\nKindly proceed to the provided URL to access and view your photographs:\nhttps://flashback.inc/photosV1/${eventDetails?.folder_name}/${userId}\n\nCheers,\n*Flashback*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareOnWhatsApp = async () => {
    const message = eventData
    ? `Check out this event: ${formatEventName(event?.event_name)} on ${getFormattedDate(eventData?.eventDate)} at ${getFormattedTime(eventData?.eventDate)}. Location: ${eventData?.eventLocation} , Url: https://flashback.inc/invite/${event?.event_id}`
    : `Check out this event: ${formatEventName(event?.event_name)} on ${getFormattedDate(event.event_date)} at ${getFormattedTime(event.event_date)}. Location: ${event.event_location} , Url: https://flashback.inc/invite/${event?.folder_name}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  
  window.open(url, '_blank');
  //await updateRewards(10);
};

const handleCollabClick = async () => {
  try {
    const collabLink = `https://flashback.inc/collab/${event.event_id}`;
    const message = `Join the collaboration for the event: ${formatEventName(event?.event_name)}. Collaborate using the following link: ${collabLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
    //await updateRewards(10);
    //await transferChewyCoins(userDetails.user_phone_number, 10);
  } catch (error) {
    console.error('Error generating collaboration link:', error);
    toast.error('Failed to generate collaboration link. Please try again.');
  }
};

const saveFlashback = async () => {
  const isDuplicate = eventFlashbacks.some((flashback) => flashback.flashback_name === flashbackName);

  if (isDuplicate) {
    // If it's a duplicate, show an error message and exit the function
    return;
  }
  try {
    const response = await API_UTIL.post("/saveFlashbackDetails", {
      "flashbackName":flashbackName,
      "eventId":event.event_id,
      "eventName":event.event_name,
      "userPhoneNumber":userPhoneNumber,
    });

    if (response.status === 200) {
      console.log("Flashback saved successfully", response.data);
      // Show success notification or update the UI accordingly
      setEventFlashbacks((prevFlashbacks) => [
        response.data.data,
        ...prevFlashbacks,
        // Assuming `response.data` is the saved flashback item
      ]);
    } else {
      console.error("Error saving flashback:", response.data);
    }
  } catch (error) {
    console.error("Error saving flashback:", error);
    // Handle error (e.g., show error notification)
  }
};


const onDrop = useCallback((acceptedFiles) => {
  const totalFiles = acceptedFiles.length;
  if (totalFiles > 500) {
    setFileCount(totalFiles);
    setUploadStatus(`You have selected ${totalFiles} files. You can upload a maximum of 500 files at a time.`);
    setUploading(false);
  } else {
    setFiles(acceptedFiles);
    setFileCount(totalFiles);
    setUploadProgress({});
    setUploadStatus('');
    setUploading(false);
  }
  setRequiredCoins(totalFiles);
  setCanUpload(userDetails && userDetails.reward_points >= totalFiles);
}, [userDetails]);

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
    const formData = new FormData();
    formData.append('files', file);
    formData.append('eventName', event.event_name);
    formData.append('eventDate', event.event_date);
    formData.append('folderName', event.folder_name);

    let attempts = 0;
    let delayTime = 1000; // Start with 1 second delay

    while (attempts < MAX_RETRIES) {
      try {
        const response = await API_UTIL.post(`/uploadFiles/${event.event_name}/${userPhoneNumber}/${event.folder_name}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
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

    // After all files are uploaded successfully, update the uploaded files count
    const newUploadedFilesCount = uploadedFilesCount + files.length;
    setUploadedFilesCount(newUploadedFilesCount);

    try {
      const response = await API_UTIL.put(`/updateEvent/${event.event_id}`, {
        event_name: eventData.eventName,
        event_date: `${eventData.eventDate}T${eventData.eventTime}:00`,
        invitation_note: eventData.invitationNote,
        event_location: eventData.eventLocation,
        uploaded_files: newUploadedFilesCount,
      });

      if (response.status === 200) {
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Error updating event with new file count:', error);
      toast.error('Failed to update the event with new file count. Please try again.');
    }
    await updateRewards(-files.length);

    setUploadStatus('Upload completed successfully');
    setFiles([]);
  } catch (error) {
    console.error('Upload failed:', error);
    setUploadStatus('Upload failed. Please try again.');
  } finally {
    setUploading(false);
    setOverallProgress(100); // Ensure progress bar is set to 100% on completion
    setFileCount(0);
    closeUploadFilesModal();
    
  }
};


const uploadFlashbackFiles = async () => {
  if (files.length === 0) {
    setUploadStatus('Please select files to upload');
    return;
  }

  await saveFlashback();
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
    const formData = new FormData();
    formData.append('files', file);
    formData.append('eventName', event.event_name);
    formData.append('eventDate', event.event_date);
    formData.append('folderName', event.folder_name);

    let attempts = 0;
    let delayTime = 1000; // Start with 1 second delay

    while (attempts < MAX_RETRIES) {
      try {
        const response = await API_UTIL.post(`/uploadFlashbackFiles/${flashbackName}/${event.event_id}/${userPhoneNumber}/${event.folder_name}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
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

    // After all files are uploaded successfully, update the uploaded files count
    // const newUploadedFilesCount = uploadedFilesCount + files.length;
    // setUploadedFilesCount(newUploadedFilesCount);
    await updateRewards(-files.length);
    //await deductCoins(files.length);

    setUploadStatus('Upload completed successfully');
    setFiles([]);
  } catch (error) {
    console.error('Upload failed:', error);
    setUploadStatus('Upload failed. Please try again.');
  } finally {
    setOverallProgress(100); // Ensure progress bar is set to 100% on completion
    setFileCount(0);
    closeFlashbackUploadFilesModal();
  }
};

  const updateRewards = async (points) => {
    try {
      // Prepare the request payload
      const payload = {
        amount: points.toString(), // The number of images is the amount to deduct
        senderMobileNumber: userPhoneNumber, // The current user's phone number
      };
  
      // Call the API to transfer Chewy coins
      const response = await API_UTIL.post('/updateRewards', payload);
  
      if (response.status === 200) {
        setIsCoinsDeducted(true);
      } else {
        throw new Error('Failed to deduct coins.');
      }
    } catch (error) {
      console.error('Error deducting coins:', error);
      toast.error('Failed to deduct coins. Please try again.');
    }
  };

  const handleClick = (item) => {
    if (mergeMode) {
      handleThumbnailClick(item);
    } else {
      saveShareDetails(item);
      UsershareOnWhatsApp(item);
    }
  };

  const handleMergeClick = () => {
    if (!isImageProcessingDone) {
      setIsWarningModalOpen(true); // Show warning if images are still processing
    }else{
      setShowMergeDuplicateUsers(true);
      setMergeMode(true);
      setSelectedMainUser(null);
      setSelectedDuplicateUsers([]);
    }
  };

  const handleCancelManageUsers = () => {
    setMergeMode(false);
    setShowMergePopup(false);
    setSelectedUsers([]);
    setMergeMessage("");
    setShowMergeDuplicateUsers(false);
  };
  
  const handleThumbnailClick = (user) => {
    if (!mergeMode) return;

    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.user_id === user.user_id);
      if (isSelected) {
        return prev.filter((u) => u.user_id !== user.user_id);
      } else if (prev.length < 2) {
        const newSelected = [...prev, user];
        if (newSelected.length === 2) {
          setShowMergePopup(true);
        }
        return newSelected;
      }
      return prev;
    });
  };

  const saveShareDetails = async (item) => {
    try {
      const user = userPhoneNumber;
      const response = await API_UTIL.post(`/saveProShareDetails`, {
        user: user,
        sharedUser: item.user_id,
        event_id: event.event_id,
      });
      if (response.status === 200) {
        //updateRewards(10);
      } else {
        throw new Error("Failed to save share info");
      }
    } catch (error) {
      console.error("Error saving share details:", error);
    }
  };

  // const updateRewardPoints = async (points) => {
  //   const updateData = {
  //     user_phone_number: userPhoneNumber,
  //     reward_points: userDetails?.reward_points ? userDetails.reward_points + points : 50 + points,
  //   };

  //   try {
  //     const response = await API_UTIL.post("/updateUserDetails", updateData);
  //     if (response.status === 200) {
  //       setRewardPoints(points);
  //       setShowRewardPointsPopUp(true);
  //       setUserDetails(response.data.data);
  //     } else {
  //       console.log("Failed to update user details. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating user details:", error);
  //   }
  // };

  useEffect(() => {
    const fetchEventDetailsInterval = () => {
      if (event && event.event_id) {
        fetchEventDetails(event.event_id);
      }
    };
  
    fetchEventDetailsInterval(); // Fetch event details initially
  
    const interval = setInterval(fetchEventDetailsInterval, 30000); // Fetch event details every 30 seconds
  
    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [event?.event_id]); // Dependency on event.event_id
  
  useEffect(() => {
    if (isDataFetched.current) return;
    fetchThumbnails();
    isDataFetched.current = true;
  }, []);

  useEffect(() =>{
    if(event?.event_id){      
     fetchFlashbacks(event.event_id);
    }
  },[event]);

  const fetchThumbnails = async () => {
    if(!event) return;
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnailsByEventId/${event.event_id}`);
      if (response.status === 200) {
        setUserThumbnails(response.data);
        fetchClientDetails();
      } else {
        throw new Error("Failed to fetch user thumbnails");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientDetails = async () => {
    if (userThumbnails.length === 0) setIsLoading(true);

    try {
      const response = await API_UTIL.get(`/userThumbnailsByEventId/${event.event_id}`);
      if (response.status === 200) {
        setClientDetails(response.data);
        fetchUserDetails();
      } else {
        throw new Error("Failed to fetch client Details");
      }
    } catch (error) {
      console.error("Error fetching user thumbnails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (imageData, index) => {
    console.log("Image clicked");
    setClickedImg(imageData.thumbnail);
    setClickedImgIndex(index);
    setClickedImgFavourite(imageData.isFavourites);
    setClickedUrl(imageData.original);
    window.history.pushState({ id: 1 }, null, "?image=" + `${imageData.original.split('/').pop()}`);
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

  const closeFlashbackUploadFilesModal = () => {
    setIsCreateFlashbackModalOpen(false);
    setFiles([]);
    setUploadProgress({});
    setUploadStatus('');
    setUploading(false);
    setFileCount(0);
    setFlashbackName('');
  };


  
  // const handleCloseModal = () => {
  //   setClickedImg(null);
  //   setClickedImgIndex(null);
  //   setClickedImgFavourite(null);
  //   setClickedUrl(null);
  //   window.history.back();
  // };
  
  const handleBackButton = () => {
    setClickedImg(null);
  };
  
  useEffect(() => {
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  const handleFavourite = (index, imageUrl, isFavourite) => {
    // Implement your favourite logic here
    console.log(`Image at index ${index} is now ${isFavourite ? 'favourite' : 'not favourite'}`);
  };

  const formatEventName = (name) => {
    if (!name) return '';
    let event = name.replace(/_/g, ' ');
    if (userDetails && userDetails.user_name) {
      event = event.replace(userDetails.user_name, '');
    }
    return event.trim();
  };
  
  function getFormattedDate(datetime) {
    console.log("inside format" );
    console.log(datetime);
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  function getFormattedTime(datetime) {
    const date = new Date(datetime);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${hours}:${minutes} ${ampm}`;
  }

  const fetchFlashbacks = async (eventId) => {
    try {
      const response = await API_UTIL.get(`/getFlashbacks/${eventId}`);
      if (response.status === 200) {
        setEventFlashbacks(response.data); // Assuming setEventFlashbacks is used to store the fetched flashbacks
      } else {
        console.error("Error fetching flashbacks:", response.data);
      }
    } catch (error) {
      console.error("Error fetching flashbacks:", error);
    }
  };
  


  const fetchEventDetails = async () => {
    try {
      const response = await API_UTIL.get(`/getEventDetails/${event.event_id}`);
      if (response.status === 200) {
        setEventDetails(response.data); // Set event details in state
        if( response.data.uploaded_files === response.data.files_indexed){
          if(isImageProcessingDone === false)
            fetchThumbnails()
          //fetchFlashbacks(response.data.event_id);
          setIsImageProcessingDone(true);
        }
        else{
            setIsImageProcessingDone(false);
  
        }
      } else {
        throw new Error("Failed to fetch event details");
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };
  

  const handleMerge = async (reason) => {
    if(!event) return;
    try {
      const user_phone_number = localStorage.getItem("userPhoneNumber");
      const response = await API_UTIL.post("/mergeUsers", {
        userIds: selectedUsers.map((u) => u.user_id),
        reason: reason,
        eventId: event.event_id,
        user_phone_number: user_phone_number,
      });

      if (response.data.success) {
       // await updateRewards(50);
        //await transferChewyCoins(user_phone_number, 50);
        await fetchThumbnails();
      }
      return response.data;
    } catch (error) {
      console.error("Error merging users:", error);
      return { success: false, message: "Error merging users. Please try again." };
    }
  };


  const sendWhatsappMsg = async () => {
    try {
      const userIdMappingResponse = await API_UTIL.post("/generateUserIdsForExistingUsers", {
        eventName: eventDetails?.folder_name,
      });
      if (userIdMappingResponse.status === 200) {
        const sendFlashbacksResponse = await API_UTIL.post("/send-flashbacks", {
          eventName: eventDetails?.folder_name,
        });

        if (sendFlashbacksResponse.status === 200) {
          toast.success("Flashbacks sent successfully!");
        } else {
          throw new Error("Failed to send flashbacks.");
        }
      } else {
        throw new Error("Failed to send flashbacks.");
      }
    } catch (error) {
      console.error("Error Publishing Images", error);
      toast.error("Failed to Publish Images");
    }
  };

  const [breakpointColumnsObj, setBreakpointColumnsObj] = useState({
    default: 5,
    1200: 4,
    992: 3,
    768: 2,
    576: 1,
  });

  useEffect(() => {
    const handleResize = () => {
      setBreakpointColumnsObj({
        default: 5,
        1200: 4,
        992: 3,
        768: 2,
        576: 1,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSendPhotos = async () => {
    if (!isImageProcessingDone) {
      setIsWarningModalOpen(true); // Show warning if images are still processing
    } else {
      setIsSending(true);
      setIsSendModalOpen(true);
      try {
        await sendWhatsappMsg();
      } finally {
        setIsSending(false); 
      }
    }
  };
  const closeWarningModal = () => {
    setIsWarningModalOpen(false);
  };
  const closeClaimPopup = () => {
    setIsClaimPopupOpen(false);
  };

  // const transferChewyCoins = async (recipientMobileNumber, amount) => {
  //   try {
  //     const senderMobileNumber = "+919090401234";
  //     const payload = {
  //       amount: amount,
  //       senderMobileNumber: senderMobileNumber,
  //       recipientMobileNumber: recipientMobileNumber,
  //     };

  //     const response = await API_UTIL.post('/transfer-chewy-coins', payload);

  //     if (response.status === 200) {
  //       toast.success('Rewards added successfully!');
  //       fetchUserDetails();
  //     } else {
  //       throw new Error('Failed to transfer Chewy Coins.');
  //     }
  //   } catch (error) {
  //     console.error('Error transferring Chewy Coins:', error);
  //     toast.error('Failed to transfer Unity Coins. Please try again.');
  //   }
  // };

  const registeredUsers = userThumbnails.filter((thumbnail) => thumbnail.is_registered);
  const unregisteredUsers = userThumbnails.filter((thumbnail) => !thumbnail.is_registered);


  if (isPageLoading) {
    return <LoadingSpinner />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }


  const StyledLabel = styled.label`
  color: white;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #00ffff;
  }
`;

// const LabelAndInput = React.memo(({ label, name, value, type, handleChange, isEditable, ...props }) => {
//   const onChangeHandler = (e) => {
//     if (handleChange) {
//       handleChange(e);
//     }
//   };

//   return (
//     <div>
//       <StyledLabel htmlFor={name}>{label}</StyledLabel>
//       <StyledInput
//         id={name}
//         name={name}
//         value={value}
//         type={type}
//         onChange={onChangeHandler}
//         disabled={!isEditable}
//         {...props}
//       />
//     </div>
//   );
// });


const handleEventImageUpdate = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('eventImage', file);
    formData.append('eventId', event.event_id); // Assuming you have eventId in your state
    formData.append('eventName', formData.org_name); // Use the correct form data field if it's named differently
    formData.append('clientName', event.client_name); // Assuming clientName is in your state or form data

    try {
      const response = await API_UTIL.post('/updateEventImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data && response.data.imageUrl) {
        const formattedUrl = encodeURIWithPlus(response.data.imageUrl);
        console.log(`formattedUrl:`, formattedUrl);
        setEvent((prevData) => ({
          ...prevData,
          'event_image': formattedUrl // Replace 'new value' with the actual value you want to set
        }));
        setEventImage(formattedUrl);
        
      }
    } catch (error) {
      console.error('Error updating event image:', error);
    } 
  }
};
const encodeURIWithPlus = (uri) => {
  return uri.replace(/ /g, '+');
};

const createFlashback =({

});

  if (!event) {
    return <div>No event data available. Please try again later.</div>;
  }

  return (
    <PageWrapper>
      <GlobalStyle />
      <AppBar showCoins={true} />
      <ContentWrapper>
        <SidePanel>
          <EventImage>
            <img src={event.event_image} alt="Event" />
            <ActionButton onClick={handleEditClick} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
              <Edit2 size={18} />
            </ActionButton>
          </EventImage>
          <EventTitle>{formatEventName(event?.event_name)}</EventTitle>
          <EventInfo>
            <InfoItem>
              <Calendar size={18} />
              {event.event_date && !isNaN(Date.parse(event.event_date)) 
                ? new Date(event.event_date).toLocaleDateString() 
                : 'Date not set'}
            </InfoItem>
            <InfoItem>
              <Clock size={18} />
              {event.event_date && !isNaN(new Date(event.event_date).getTime()) 
              ? new Date(event.event_date).toLocaleTimeString() 
              : 'Time not set'}

            </InfoItem>
            <InfoItem>
              <MapPin size={18} />
              {event.event_location || 'Location not set'}
            </InfoItem>
            <InfoItem>
              <ScrollText size={18} />
              {event.invitation_note || 'Invitation Note not set'}
            </InfoItem>
          </EventInfo>
          <QRCodeWrapper>
          <div ref={qrRef}> 
             <CustomQRCode value={`https://flashback.inc/login/${event.folder_name}`} size={150} logoUrl={'logo.png'} logoSize={40} />
            </div>
            <QRActions>
              <ActionButton onClick={downloadQRCode} title="Download QR Code">
                <Download size={18} />
              </ActionButton>
              <ActionButton onClick={shareOnWhatsApp} title="Share on WhatsApp">
                <Share2 size={18} />
              </ActionButton>
              <ActionButton onClick={handleCollabClick} title="Collaborate">
                <Handshake size={18} />
              </ActionButton>
            </QRActions>
          </QRCodeWrapper>
        </SidePanel>
        <MainContent>
          <StyledTabs>
            <div className="tab-list">
            <button className={`tab ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')} style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}><Images size={24} />Gallery</button>
              <button className={`tab ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')} style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}><Users size={24} /> People</button>
              <button className={`tab ${activeTab === 'flashbacks' ? 'active' : ''}`} onClick={() => setActiveTab('flashbacks')} style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}><Album size={24} /> Flashbacks</button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'gallery' && (
                <TabContent
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isGalleryLoading && images.length === 0 ? (
                  <CenteredSpinner>
                    <LoadingSpinner color="#40E0D0" />
                  </CenteredSpinner>
                ) : (
                  <>
                      <StyledMasonry
                        breakpointCols={breakpointColumnsObj}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column"
                      >
                        <UploadTile onClick={openUploadFilesModal}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                          <Upload size={24} />
                          <UploadText> Upload images </UploadText>
                        </UploadTile>
                        { images.map((imageData, index) => (
                          <ImageWrapper key={index} >
                            <img
                              src={imageData.thumbnail}
                              alt={`img ${index}`}
                              onClick={() => handleImageClick(imageData, index)}
                            />
                            </ImageWrapper>
                        ))}
                      </StyledMasonry>
                      <div ref={loader} style={{ height: '20px', marginTop: '20px' }} />
              </>
                )}
                </TabContent>
              )}

              {activeTab === 'people' && (
                <TabContent
                  key="people"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {isPeopleLoading ? (
                    <CenteredSpinner>
                      <LoadingSpinner color="#40E0D0" />
                    </CenteredSpinner>
                  ) :event.uploaded_files>0 && userThumbnails.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff' }}>
                      No people detected in the photos you've uploaded. Try uploading more photos that contain human faces.
                    </div>
                  )  :!event.uploaded_files>0 && eventInvitations.length === 0 ?(
                    <>
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff' }}>
                     No Event Invitations found !! Send Event Invitations
                     
                    </div>
                    <ActionButton onClick={shareOnWhatsApp} title="Share on WhatsApp">
                    Invite <Share2 size={18} />
                  </ActionButton>
                  </>
                    
                  ):(
                    <>
                  <AttendeesSummary>
                    {!event.uploaded_files>0 ? (
                      <>
                      <TotalAttendees>Total Attendees: {eventInvitations.length}</TotalAttendees>
                      <div>
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <ActionButton
                          key={status}
                          onClick={() => setSelectedInvitationStatus(status)}
                          className={selectedInvitationStatus === status ? "active" : ""}
                        >
                          {status} ({count})
                        </ActionButton>
                      ))}
                      <ActionButton onClick={() => setSelectedInvitationStatus(null)} className={!selectedInvitationStatus ? "active" : ""}>
                        All
                      </ActionButton>
                    </div>
                    </>
                    ):(
                      <>
                      <TotalAttendees>Total Attendees: {userThumbnails.length}</TotalAttendees>
                    

                      <div>
                        {!mergeMode ? (
                          <ActionButton onClick={handleMergeClick}>Manage Faces</ActionButton>
                        ) : (
                          <ActionButton onClick={handleCancelManageUsers}>Cancel</ActionButton>
                        )}
                        <ActionButton onClick={handleSendPhotos} disabled={isSending}>
                          {isSending ? "Sending..." : "Send Photos"}
                        </ActionButton>
                  </div>
                  </>
                  )}
                  </AttendeesSummary>
                  <UserCategoryTabs>
                    { !event.uploaded_files>0 ?(
                      <div className="tab-list">
                      <button className={`tab ${userCategoryTab === 'invited' ? 'active' : ''}`} onClick={() => setUserCategoryTab('invited')} title="View all invited users">Invited Users</button>
                      <button className={`tab ${userCategoryTab === 'registered' ? 'active' : ''}`} onClick={() => setUserCategoryTab('registered')} disabled={true} title="Upload Photos to view">Registered Users</button>
                      <button className={`tab ${userCategoryTab === 'unregistered' ? 'active' : ''}`} onClick={() => setUserCategoryTab('unregistered')}disabled={true}title="Upload Photos to view">Unregistered Users</button>
                    </div>
                    ):(
                      <div className="tab-list">
                      <button className={`tab ${userCategoryTab === 'registered' ? 'active' : ''}`} onClick={() => setUserCategoryTab('registered')}>Registered Users</button>
                      <button className={`tab ${userCategoryTab === 'unregistered' ? 'active' : ''}`} onClick={() => setUserCategoryTab('unregistered')}>Unregistered Users</button>
                      <button className={`tab ${userCategoryTab === 'invited' ? 'active' : ''}`} onClick={() => setUserCategoryTab('invited')}>Invited Users</button>
                    </div>
                    )}
                   
                  </UserCategoryTabs>
                  <UserCategoryContent active={userCategoryTab === 'registered'}>
                  {mergeMessage && <div className="merge-message">{mergeMessage}</div>}
                  {!isImageProcessingDone && (
                    <div className="image-processing-message">
                      <span>Some of the images are still being processed. Stay tuned for updates.</span>
                    </div>
                  )}
                  {mergeMode && (
                    <div className="merge-message">
                      Select 2 duplicate faces to merge
                    </div>
                  )}
                  <div className="wrapper-pro">
                    {registeredUsers.map((item, index) => (
                      <motion.div
                        key={index}
                        className={`wrapper-images-pro ${mergeMode ? "selectable" : ""} ${
                          selectedUsers.some((u) => u.user_id === item.user_id) ? "selected" : ""
                        }`}
                        onClick={() => handleClick(item)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <LazyLoadImage src={item.face_url} alt={`User ${index + 1}`} />
                        <p>{item.count}</p>
                        {mergeMode && selectedUsers.some((u) => u.user_id === item.user_id) && (
                          <div className="tick-mark">✓</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  </UserCategoryContent>
                  <UserCategoryContent active={userCategoryTab === 'unregistered'}>
                  <div className="wrapper-pro">
                    {unregisteredUsers.map((item, index) => (
                      <motion.div
                        key={index}
                        className={`wrapper-images-pro ${mergeMode ? "selectable" : ""} ${
                          selectedUsers.some((u) => u.user_id === item.user_id) ? "selected" : ""
                        }`}
                        onClick={() => handleClick(item)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <LazyLoadImage src={item.face_url} alt={`User ${index + 1}`} />
                        <p>{item.count}</p>
                        {mergeMode && selectedUsers.some((u) => u.user_id === item.user_id) && (
                          <div className="tick-mark">✓</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  </UserCategoryContent>
                  <UserCategoryContent active={userCategoryTab === 'invited'}>
                  <InvitationList>
                  {filteredInvitations.map((inv) => (
                    <InvitationItem key={inv.user_name}>
                      <InvitationInfo>
                        <UserName>{inv.user_name}</UserName>
                        <StyledSeparator>|</StyledSeparator>
                        <GuestCount className="guest-count">{inv.attendees_count} {inv.attendees_count > 1 ? 'Guests' : 'Guest'}</GuestCount>
                       
                      </InvitationInfo>
                      <InvitationDate>
                        {new Date(inv.responded_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </InvitationDate>
                      <InvitationStatus>{inv.invitation_status}</InvitationStatus>
                    </InvitationItem>
                  ))}
                </InvitationList>

                  </UserCategoryContent>
                  </>
                    )}
                </TabContent>
              )}

              {activeTab === 'flashbacks' && (
                <TabContent
                  key="flashbacks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FlashbackGrid>
                    <FlashbackTile onClick={()=>setIsCreateFlashbackModalOpen(true)}>
                      <Plus size={24} />
                      <span style={{ marginTop: '8px', display: 'block', textAlign: 'center'}}>Create Falshback</span>
                    </FlashbackTile>
                    <FlashbackTile onClick={() => navigate(`/flashs/favourites/${event.event_id}/`)}>
                    <Heart size={24} />
                    <span style={{ marginTop: '8px', display: 'block', textAlign: 'center'}}>Favourites</span>
                    </FlashbackTile>
                    <FlashbackTile onClick={()=>setIsCreateFlashbackModalOpen(true)}>
                    <span style={{ marginTop: '8px', display: 'block', textAlign: 'center'}}>Deliverables</span>
                    </FlashbackTile>
                    {eventFlashbacks.map((flashback, index) => (
                      <FlashbackTile key={index} onClick={() => navigate(`/flashs/${flashback.flashback_name}/${flashback.event_id}`)}>
                        <span style={{ marginTop: "8px", display: "block", textAlign: "center" }}>
                          {flashback.flashback_name}
                        </span>
                      </FlashbackTile>
                    ))}
                  </FlashbackGrid>
                </TabContent>
              )}
            </AnimatePresence>
          </StyledTabs>
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
            <h2>Upload Files</h2>
            <Dropzone {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop files here, or click to select files</p>
            </Dropzone>
            {files.length > 0 && (
              <p>
              {fileCount} file(s) selected.{" "}
                {canUpload ? (
                  <>
                    {requiredCoins } 
                    <IoDiamond color="Yellow" size=".8em"/> will be deducted from your wallet.
                  </>
                ) : (
                  "Insufficient balance."
                )}
              </p>
            )}
            {uploadStatus && <p>{uploadStatus}</p>}
            <div style={{
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '2rem', 
              paddingTop: '1rem' }}>
            <ActionButton onClick={uploadFiles} disabled={!canUpload || files.length === 0 || fileCount > 500}>
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
      {showMergePopup && (
      <MergeDuplicateUsers
        users={selectedUsers}
        onClose={handleCancelManageUsers}
        isOpen={showMergePopup}
        onMerge={handleMerge}
      />
    )}
      <StyledModal
        isOpen={isSendModalOpen}
        onRequestClose={() => setIsSendModalOpen(false)}
        contentLabel="Send Photos"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <ModalOverlay>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CloseButton onClick={() => setIsSendModalOpen(false)}><X size={24} /></CloseButton>
            <h2>Send Photos</h2>
            <p>Only registered users will receive Photos.</p>
            <p>For unregistered users, you can click on their thumbnail and send photos through your WhatsApp.</p>
          </ModalContent>
        </ModalOverlay>
      </StyledModal>

      <AnimatePresence>
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
                <form onSubmit={handleFormSubmit}>
                  <LabelAndInput
                    label="Event Name"
                    name="eventName"
                    value={eventData.eventName}
                    handleChange={handleInputChange}
                    isEditable={false}
                  />
                  <LabelAndInput
                    label="Event Date"
                    name="eventDate"
                    type="date"
                    value={eventData.eventDate}
                    handleChange={handleInputChange}
                    isEditable={true}
                  />
                  <LabelAndInput
                    label="Event Time"
                    name="eventTime"
                    type="time"
                    value={eventData.eventTime}
                    handleChange={handleInputChange}
                    isEditable={true}
                  />
                  <LabelAndInput
                    label="Invitation Note"
                    name="invitationNote"
                    value={eventData.invitationNote}
                    handleChange={handleInputChange}
                    isEditable={true}
                  />
                  <LabelAndInput
                    label="Event Location"
                    name="eventLocation"
                    value={eventData.eventLocation}
                    handleChange={handleInputChange}
                    isEditable={true}
                  />
                  <FormGroup>
                    <Label htmlFor="eventImage">Upload Banner Image</Label>
                    <Input
                      type="file"
                      id="eventImage"
                      name="eventImage"
                      accept="image/*"
                      onChange={handleEventImageUpdate}
                    />
                  </FormGroup>
                  <ActionButton type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Save</ActionButton>
                </form>
              </ModalContent>
            </ModalOverlay>
          </StyledModal>
      </AnimatePresence>

      <StyledModal
        isOpen={isCreateFlashbackModalOpen}
        onRequestClose={closeFlashbackUploadFilesModal}
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
            <CloseButton onClick={closeFlashbackUploadFilesModal}><X size={24} /></CloseButton>
            <FormGroup>
            <Label>FlashBack Name:</Label>
            <Input
                type="text"
                id="flashbackName"
                name="flashbackName"
                value={flashbackName}
                onChange={handleFlashbackNameChange}
                required
              />
              </FormGroup>
            <h2>Upload Files</h2>
            <Dropzone {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop files here, or click to select files</p>
            </Dropzone>
            {files.length > 0 && (
              <p>
              {fileCount} file(s) selected.{" "}
                {canUpload ? (
                  <>
                    {requiredCoins} <IoDiamond color="Yellow" size=".8em"/> will be deducted from your wallet.
                  </>
                ) : (
                  "Insufficient balance."
                )}
              </p>
            )}
            {uploadStatus && <p>{uploadStatus}</p>}
            <div style={{
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '2rem', 
              paddingTop: '1rem' }}>
            <ActionButton onClick={uploadFlashbackFiles} disabled={!canUpload || files.length === 0 || fileCount > 500}>
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
    </PageWrapper>
  );
};

const LoadMoreButton = styled.button`
  background-color: #2a2a2a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3a3a3a;
  }

  &:disabled {
    background-color: #1a1a1a;
    cursor: not-allowed;
  }
`;


export default EventDetails;