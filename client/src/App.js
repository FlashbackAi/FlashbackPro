
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CreateFlashBack from "./pages/CreateFlashBack";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import LoadingSpinner from "./pages/LoadingSpinner";
import Admin from "./pages/Admin";
import ShareEvents from "./pages/ShareEvents";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation,Navigate } from 'react-router-dom'
import ImagesPage from './pages/ImagesPage';
import Pro from './pages/Pro';
import TermsAndConditions from "./pages/TermsAndConditions";


function App() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  
  const isTokenExpired = (token) => {
    const decodedToken = jwtDecode(token);
    const currentDate = new Date();

    // Token expiry is usually given in seconds but JavaScript uses milliseconds
    return decodedToken.exp * 1000 < currentDate.getTime();
  };

  const ProtectedRoute = ({ children }) => {

    let location = useLocation();
    const token = localStorage.getItem("accessToken");
    const isAuthenticated = token && !isTokenExpired(token);

    return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;;
  };
  
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    console.log("Dark mode enabled:",darkMode);
      document.documentElement.classList.add("dark-mode");
    
  }, [darkMode]);
  return (

    
    <div className="App1">
      {/* <meta name="viewport" content="width=device-width, user-scalable=no" /> */}
      <div className="Background">

      </div>
      {/* <label className="toggle-switch">
        <div className='Darktitle'>
          <label>
            Dark Mode
          </label>
        </div>
        <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
        <span className="slider round"></span>

      </label> */}


      <Router>
        
        {isLoading ? (
          // Display Loading spinner while waiting
          <div>
          <LoadingSpinner />
          </div>
        ) : (
          <Routes>
            <Route path="/registration" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/ShareEvents" element={<ShareEvents />}>
              <Route path="/admin/ShareEvents/:eventName/people" element={<ShareEvents />} />
            </Route>
            {/* <Route path="/" element={<ProtectedRoute><CreateFlashBack/></ProtectedRoute>} /> */}
            <Route path="/home" element={<Home/>}></Route> 
            {/* <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}></Route> */}
            <Route path="/createFlashback" element={<ProtectedRoute><CreateFlashBack /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* <Route path="/images/:eventName/:userId" element={<ProtectedRoute><ImagesPage /></ProtectedRoute>} /> */}
            <Route path="/photos/:eventName/:userId" element={<ImagesPage />} /> 
            <Route path="/pro/:eventName" element={<Pro />} /> 
            <Route path="/" element={<Login />} />
            <Route path="/TermsAndConditions" element={<TermsAndConditions />} />TermsAndConditions

          </Routes>
          )}
        </Router>

    </div>
  );
  //       <Switch>
  //         <Route path="/" exact component={Home} />
  //         <Route path="/createFlashBack" exact component={CreateFlashBack} />
  //         <Route path="/registration" exact component={Registration} />
  //         <Route path="/login" exact component={Login} />
  //       </Switch>
  //     </Router> 
  //     <Router>
  //           <div className="navbar">
  //               <Link to="/"> Home Page</Link>
  //               <Link to="/createFlashBack"> Create FlashBack</Link>
  //               <Link to="/login"> Login</Link>
  //               <Link to="/registration"> Registration</Link>
  //           </div>
  //           <Routes>
  //               <Route path="/registration" element={<Registration />} />
  //               <Route path="/home" element={<Home />} />
  //               <Route path="/" element={<Login />} />
  //               <Route path="/login" element={<Login />} />
  //               <Route path="/createFlashBack" element={<CreateFlashBack />} />
  //           </Routes>
  //       </Router>
  //   </div>
  // );
}




export default App;