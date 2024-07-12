import Login from "../pages/Auth/Login/Login";
import CreatorLogin from "../pages/Auth/Login/CreatorLogin";
import ForgotPassword from "../pages/Auth/ForgotPassword/ForgotPassword";
import Registration from "../pages/Auth/Register/Registration";
import Admin from "../pages/Admin/Admin";
import ShareEvents from "../pages/Admin/ShareEvents/ShareEvents";
import Home from "../pages/Home/Home";
import CreateFlashBack from "../pages/CreateFlashback/CreateFlashBack";
import Profile from "../pages/Profile/Profile";
import ImagesPage from "../pages/ImagesPage/ImagesPage";
import Flashs from "../pages/Flashs/Flashs";
import Pro from "../pages/Pro/Pro";
import AlbumSelection from "../pages/Pro/AlbumSelection/AlbumSelection";
import TermsAndConditions from "../pages/TermsAndConditions/TermsAndConditions";
import Collage from "../pages/Edit/Collage/Collage";
import SharedImage from "../pages/ImagesPage/SharedImage";
import AlbumSelectionForm from "../pages/Pro/AlbumSelectionForm/AlbumSelectionForm";
import PhotoSelection from "../pages/Pro/PhotoSelection/PhotoSelection";
import FaceSelection from "../pages/Pro/FaceSelection/FaceSelection";
import Event from "../pages/Event/Event";
import CreateEventForm from "../pages/CreateEvent/CreateEvent";
import { LoginEvent } from "../pages/LoginEvent/LoginEvent";
import About from "../pages/About/About";


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
    {
        path:"/login/:eventName",
        exact:false,
        protected:false,
        //component:Login
        component:LoginEvent,
    },
    {
        path:"/registration",
        exact:false,
        protected:false,
        component:Registration
    },
    {
        path:"/forgotPassword",
        exact:false,
        protected:false,
        component:ForgotPassword
    },
    {
        path:"/admin",
        exact:false,
        protected:false,
        component:Admin
    },
    {
        path:"/admin/shareEvents",
        exact:true,
        protected:false,
        component:ShareEvents
    },
    {
        path:"/admin/ShareEvents/:eventName/people",
        exact:false,
        protected:false,
        component:ShareEvents
    },
    {
        path:"/home",
        exact:false,
        protected:false,
        component:Home
    },
    {
        path:"/createFlashback",
        exact:false,
        protected:true,
        component:CreateFlashBack,
    },
    {
        path:"/profile",
        exact:false,
        protected:true,
        component:Profile,
    },
    {
        path:"/photos/:eventName/:userId",
        exact:false,
        protected:false,
        component:ImagesPage
    },
    {
        path:"/pictures/:eventName/:userId",
        exact:false,
        protected:false,
        component:Flashs
    },
    {
        path:"/pro/:eventName",
        exact:false,
        protected:false,
        component:Pro
    },
    {
        path:"/TermsAndConditions",
        exact:false,
        protected:false,
        component:TermsAndConditions
    },
    {
        path:"/AlbumSelection/:eventName",
        exact:false,
        protected:false,
        component:AlbumSelection
    },
    {
        path:"/form/:eventName",
        exact:false,
        protected:false,
        component:AlbumSelectionForm
    },
    {
        path:"/faceSelection/:eventName",
        exact:false,
        protected:false,
        component:FaceSelection
    },
    {
        path:"/photoSelection/:eventName",
        exact:false,
        protected:false,
        component:PhotoSelection
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
        protected:false,
        component:Event,
    },
    {
        path:"/about",
        exact:false,
        protected:false,
        component:About,
    },

]

export default ROUTES