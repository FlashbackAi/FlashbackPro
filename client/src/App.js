import "./App.css";
import { BrowserRouter as Router, Route, Routes ,Link} from "react-router-dom";
import Home from "./pages/Home";
import CreateFlashBack from "./pages/CreateFlashBack";
import Registration from "./pages/Registration";
import Login from "./pages/Login";

function App() {
  return (
    <div className="App">
       {/* <Router>
        <div className="navbar">
          <Link to="/"> Home Page</Link>
          <Link to="/createFlashBack"> Create FlashBack</Link>
          <Link to="/login"> Login</Link>
          <Link to="/registration"> Registration</Link>
        </div>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/createFlashBack" exact component={CreateFlashBack} />
          <Route path="/registration" exact component={Registration} />
          <Route path="/login" exact component={Login} />
        </Switch>
      </Router>  */}
      <Router>
            <div className="navbar">
                <Link to="/"> Home Page</Link>
                <Link to="/createFlashBack"> Create FlashBack</Link>
                <Link to="/login"> Login</Link>
                <Link to="/registration"> Registration</Link>
            </div>
            <Routes>
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/createFlashBack" element={<CreateFlashBack />} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;