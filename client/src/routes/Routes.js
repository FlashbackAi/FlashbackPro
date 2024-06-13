import Login from "../pages/Auth/Login/Login";
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
import AlbumSelection from "../pages/Pro/AlbumSelection";
import TermsAndConditions from "../pages/TermsAndConditions/TermsAndConditions";
import Collage from "../pages/Edit/Collage/Collage";
import SharedImage from "../pages/ImagesPage/SharedImage";
import AlbumSelectionForm from "../pages/Pro/AlbumSelectionForm/AlbumSelectionForm";

const ROUTES=[
    {
        path:"/",
        exact:false,
        protected:false,
        component:Login
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
        component:Login
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
]

export default ROUTES