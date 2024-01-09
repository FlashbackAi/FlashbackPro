import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreateFlashBack from "./pages/CreateFlashBack";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import LoadingSpinner from "./pages/LoadingSpinner";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate } from 'react-router-dom'

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
    const token = sessionStorage.getItem("accessToken");
    const isAuthenticated = token && !isTokenExpired(token);

    return isAuthenticated ? children : <Navigate to="/login" />;
  };
  
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    console.log("Dark mode enabled:",darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [darkMode]);
  return (

    
    <div className="App">
      {/* <meta name="viewport" content="width=device-width, user-scalable=no" /> */}
      <div className="Background">

      </div>
      <label className="toggle-switch">
        <div className='Darktitle'>
          <label>
            Dark Mode
          </label>
        </div>
        <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
        <span className="slider round"></span>

      </label>


      <Router>
        <div className="navbar">
          {/*<img src={"http://localhost:3000/static/media/logo.cf2c8490777d428b465f.png"}></img>*/}
          {/*<Link to="/"> Home Page</Link>*/}
          {/* <Link to="/createFlashBack">FlashBack</Link> */}
          {/*<Link to="/login"> Login</Link>*/}
          {/*<Link to="/registration"> Registration</Link>*/}
          <Link to="/admin"> Admin</Link>
          {/* { <Link to="/profile"> Profile</Link> } */}

        </div>
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
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><CreateFlashBack/></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}></Route>
            <Route path="/createFlashBack" element={<ProtectedRoute><CreateFlashBack /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

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