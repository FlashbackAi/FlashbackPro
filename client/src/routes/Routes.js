import Login from "../pages/Auth/Login/Login";
import CreatorLogin from "../pages/Auth/Login/CreatorLogin";
// import ForgotPassword from "../pages/Auth/ForgotPassword/ForgotPassword";
// import Registration from "../pages/Auth/Register/Registration";
// import Admin from "../pages/Admin/Admin";
// import ShareEvents from "../pages/Admin/ShareEvents/ShareEvents";
import Home from "../pages/Home/Home";
// import CreateFlashBack from "../pages/CreateFlashback/CreateFlashBack";
// import Profile from "../pages/Profile/Profile";
import ImagesPage from "../pages/ImagesPage/ImagesPage";
import Pro from "../pages/Pro/ProShare/Pro";
import TermsAndConditions from "../pages/TermsAndConditions/TermsAndConditions";
import Collage from "../pages/Edit/Collage/Collage";
import SharedImage from "../pages/ImagesPage/SharedImage";
import PhotoSelection from "../pages/Pro/PhotoSelection/PhotoSelection";
import PhotoSelectionNew from "../pages/Pro/PhotoSelection/PhotoSelectionNew";
import FaceSelection from "../pages/Pro/FaceSelection/FaceSelection";
import Event from "../pages/Event/Event";
import CreateEventForm from "../pages/CreateEvent/CreateEvent";
import { LoginEvent } from "../pages/LoginEvent/LoginEvent";
import About from "../pages/About/About";
// import EventMain from "../pages/Event/EventMain";
import EventSelector from "../pages/Event/EventSelector";
import CreateEvents from "../pages/Event/CreateEvents";
import EventDetails from "../pages/Event/EventDetails/EventDetails";
import Portfolio from "../pages/Portfolio/Portfolio";
import Fallback from "../pages/Fallback/Fallback";
import Dataset from "../pages/Dataset/Dataset/Dataset";
import DatasetForm from "../pages/Dataset/DatasetForm/DatasetForm";
import DatasetDetails from "../pages/Dataset/DatasetDetails/DatasetDetails";
import Model from "../pages/Model/Model/Model";
import ModelDetails from "../pages/Model/ModelDetails/ModelDetails"
import ModelForm from "../pages/Model/ModelForm/ModelForm";


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
        component:LoginEvent,
    },
    {
        path: "/login/:eventName/rsvp",
        exact: true,
        protected: false,
        component: LoginEvent // or another component if the questionnaire is different
    },
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
    // {
    //     path:"/admin",
    //     exact:false,
    //     protected:false,
    //     component:Admin
    // },
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
        protected:false,
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
        protected:false,
        component:ImagesPage
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
        path:"/TermsAndConditions",
        exact:false,
        protected:false,
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
        path:"/photoSelectionNew/:eventName/:form_owner",
        exact:false,
        protected:false,
        component:PhotoSelectionNew
    },
    {
        path:"/photoSelection/:eventName/:form_owner",
        exact:false,
        protected:false,
        component:PhotoSelection
    },
    {
        path:"/edit/collage",
        exact:false,
        protected:false,
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
        protected:false,
        component:CreatorLogin
    },
    {
        path:"/CreateEvent",
        exact:false,
        protected:false,
        component:CreateEventForm
    },
    {
        path:"/Event",
        exact:false,
        protected:true,
        component:Event,
    },
    {
        path:"/eventSelector",
        exact:false,
        protected:false,
        component:EventSelector,
    },
    {
        path:"/createEventForm/:clientName",
        exact:false,
        protected:false,
        component:CreateEvents,
    },
    {
        path:"/eventDetails/:eventName",
        exact:false,
        protected:false,
        component:EventDetails,
    },
    {
        path:"/about",
        exact:false,
        protected:false,
        component:About,
    },
    {
        path:"/portfolio",
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
    }

]

export default ROUTES