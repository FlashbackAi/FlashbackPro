import Login from "../pages/Auth/Login/Login";
import CreatorLogin from "../pages/Auth/Login/CreatorLogin";
// import ForgotPassword from "../pages/Auth/ForgotPassword/ForgotPassword";
// import Registration from "../pages/Auth/Register/Registration";
import Admin from "../pages/Admin/Admin";
// import ShareEvents from "../pages/Admin/ShareEvents/ShareEvents";
import Home from "../pages/Home/Home";
// import CreateFlashBack from "../pages/CreateFlashback/CreateFlashBack";
// import Profile from "../pages/Profile/Profile";
import ImagesPage from "../pages/ImagesPage/ImagesPage";
import Pro from "../pages/Pro/ProShare/Pro";
import ProNew from "../pages/Pro/ProShare/Pro-new";
import TermsAndConditions from "../pages/TermsAndConditions/TermsAndConditions";
import Collage from "../pages/Edit/Collage/Collage";
import SharedImage from "../pages/ImagesPage/SharedImage";
import PhotoSelection from "../pages/Pro/PhotoSelection/PhotoSelection";
import PhotoSelectionNew from "../pages/Pro/PhotoSelection/PhotoSelectionV1";
import FaceSelection from "../pages/Pro/FaceSelection/FaceSelection";
import Event from "../pages/Event/Event";
// import { LoginEvent } from "../pages/LoginEvent/LoginEvent";
import About from "../pages/About/About";
// import EventMain from "../pages/Event/EventMain";
import EventSelector from "../pages/Event/EventSelector";
// import CreateEvents from "../pages/Event/CreateEvents";
import EventDetails from "../pages/Event/EventDetails/EventDetails";
import Portfolio from "../pages/Portfolio/Portfolio/Portfolio";
import Fallback from "../pages/Fallback/Fallback";
import Dataset from "../pages/Dataset/Dataset/Dataset";
import DatasetForm from "../pages/Dataset/DatasetForm/DatasetForm";
import DatasetDetails from "../pages/Dataset/DatasetDetails/DatasetDetails";
import Model from "../pages/Model/Model/Model";
import ModelDetails from "../pages/Model/ModelDetails/ModelDetails"
import ModelForm from "../pages/Model/ModelForm/ModelForm";
import PortfolioForm from "../pages/Portfolio/PortfolioForm/PortfolioForm";
import Vision from "../pages/Vision/vision"
import Collab from "../pages/Collaboration/Collab";
import ImagesPageNew from "../pages/ImagesPage/ImagesPage-new";
import Invite from "../pages/Invitation/Invite";
import EventImages from "../pages/ImagesPage/EventImages";
import FaceSelectionV1 from "../pages/Pro/FaceSelection/FaceSelectionV1";
import PhotoSelectionV1 from "../pages/Pro/PhotoSelection/PhotoSelectionV1";
import DataSharingPage from "../pages/DataSharing/DataSharing";


const ROUTES=[
    {
        path:"/",
        exact:false,
        protected:false,
        component:About
    },
    {
        path:"/login",
        exact:false,
        protected:false,
        component:Login
    },
    // {
    //     path:"/",
    //     exact:false,
    //     protected:false,
    //     component:Login
    // },
    {
        path:"/login/:eventName",
        exact:false,
        protected:false,
        //component:Login
        component:Login,
    },
    // {
    //     path: "/login/:eventName/rsvp",
    //     exact: true,
    //     protected: false,
    //     component: LoginEvent // or another component if the questionnaire is different
    // },
    // {
    //     path:"/registration",
    //     exact:false,
    //     protected:false,
    //     component:Registration
    // },
    // {
    //     path:"/forgotPassword",
    //     exact:false,
    //     protected:false,
    //     component:ForgotPassword
    // },
    {
        path:"/admin",
        exact:false,
        protected:true,
        component:Admin
    },
    // {
    //     path:"/admin/shareEvents",
    //     exact:true,
    //     protected:false,
    //     component:ShareEvents
    // },
    // {
    //     path:"/admin/ShareEvents/:eventName/people",
    //     exact:false,
    //     protected:false,
    //     component:ShareEvents
    // },
    {
        path:"/home",
        exact:false,
        protected:true,
        component:Home
    },
    // {
    //     path:"/createFlashback",
    //     exact:false,
    //     protected:true,
    //     component:CreateFlashBack,
    // },
    // {
    //     path:"/profile",
    //     exact:false,
    //     protected:true,
    //     component:Profile,
    // },
    {
        path:"/photos/:eventName/:userId",
        exact:false,
        protected:true,
        component:ImagesPage
    },
    {
        path:"/photosV1/:eventName/:userId",
        exact:false,
        protected:true,
        component:ImagesPageNew
    },
    {
        path:"/eventPhotos/:eventName",
        exact:false,
        protected:true,
        component:EventImages
    },
    // {
    //     path:"/pictures/:eventName/:userId",
    //     exact:false,
    //     protected:false,
    //     component:Flashs
    // },
    {
        path:"/pro/:eventName",
        exact:false,
        protected:true,
        component:Pro
    },
    {
        path:"/proV1/:eventId",
        exact:false,
        protected:true,
        component:ProNew
    },
    {
        path:"/TermsAndConditions",
        exact:false,
        protected:true,
        component:TermsAndConditions
    },
    // {
    //     path:"/AlbumSelection/:eventName",
    //     exact:false,
    //     protected:false,
    //     component:AlbumSelection
    // },
    // {
    //     path:"/form/:eventName",
    //     exact:false,
    //     protected:false,
    //     component:AlbumSelectionForm
    // },
    {
        path:"/relations/:eventName",
        exact:false,
        protected:false,
        component:FaceSelection
    },
    {
        path:"/relationsV1/:eventId",
        exact:false,
        protected:false,
        component:FaceSelectionV1
    },
    {
        path:"/photoSelectionNew/:eventName/:form_owner",
        exact:false,
        protected:true,
        component:PhotoSelectionNew
    },
    {
        path:"/photoSelection/:eventName/:form_owner",
        exact:false,
        protected:false,
        component:PhotoSelection
    },
    {
        path:"/photoSelectionV1/:eventName/:form_owner",
        exact:false,
        protected:false,
        component:PhotoSelectionV1
    },
    {
        path:"/edit/collage",
        exact:false,
        protected:true,
        component:Collage
    },
    {
        path:"/SharedImage/:eventName/:userId",
        exact:false,
        protected:false,
        component:SharedImage
    },
    {
        path:"/creatorLogin",
        exact:false,
        protected:true,
        component:CreatorLogin
    },
    // {
    //     path:"/CreateEvent",
    //     exact:false,
    //     protected:false,
    //     component:CreateEventForm
    // },
    {
        path:"/Event",
        exact:false,
        protected:true,
        component:Event,
    },
    {
        path:"/eventSelector",
        exact:false,
        protected:true,
        component:EventSelector,
    },
    // {
    //     path:"/createEventForm/:clientName",
    //     exact:false,
    //     protected:false,
    //     component:CreateEvents,
    // },
    {
        path:"/eventDetails/:eventName",
        exact:false,
        protected:true,
        component:EventDetails,
    },
    {
        path:"/about",
        exact:false,
        protected:true,
        component:About,
    },
    {
        path:"/portfolio",
        exact:false,
        protected:true,
        component:Portfolio,
    },
    {
        path:"/portfolio/:userName",
        exact:false,
        protected:false,
        component:Portfolio,
    },
    {
        path:"*",
        exact:false,
        protected:false,
        component:Fallback,
    },
    {
        path:"/portfolioForm",
        exact:false,
        protected:true,
        component:PortfolioForm,
    },
    {
        path:"/vision",
        exact:false,
        protected:true,
        component:Vision,
    },
    {
        path:"/collab/:eventId",
        exact:false,
        protected:true,
        component:Collab,
    },
    {
        path:"/invite/:eventId",
        exact:false,
        protected:true,
        component:Invite,
    },
    
    

    // This routes are for protocol - dataset
    {
        path:"/dataset",
        exact:false,
        protected:true,
        component:Dataset, 
    },
    {
        path:"/datasetForm/:orgName",
        exact:false,
        protected:true,
        component:DatasetForm, 
    },
    {
        path:"/datasetDetails/:orgName/:datasetName",
        exact:false,
        protected:true,
        component:DatasetDetails, 
    }, {
        path:"/model",
        exact:false,
        protected:true,
        component:Model, 
    },
    {
        path:"/modelForm/:orgName",
        exact:false,
        protected:true,
        component:ModelForm, 
    },
    {
        path:"modelDetails/:orgName/:modelName",
        exact:false,
        protected:true,
        component:ModelDetails, 
    },
    {
        path:"dataSharing",
        exact:false,
        protected:true,
        component:DataSharingPage, 
    }

]

export default ROUTES