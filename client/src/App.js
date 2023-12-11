import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreateFlashBack from "./pages/CreateFlashBack";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import LoadingSpinner from "./pages/LoadingSpinner";
import Admin from "./pages/Admin";
import { useEffect, useState } from "react";

function App() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
          <Link to="/createFlashBack">Home</Link>
          {/*<Link to="/login"> Login</Link>*/}
          {/*<Link to="/registration"> Registration</Link>*/}
          <Link to="/admin"> Admin</Link>
          <Link to="/"> Logout</Link>
        </div>
        {isLoading ? (
          // Display Loading spinner while waiting
          <LoadingSpinner />
        ) : (
          <Routes>
            <Route path="/registration" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/" element={<Login />} />
            <Route path="/createFlashBack" element={<CreateFlashBack />} />
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