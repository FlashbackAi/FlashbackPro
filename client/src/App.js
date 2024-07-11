import { BrowserRouter as Router } from "react-router-dom";
import { useEffect, useState } from "react";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "./media/images/logoCropped.png";
import "./App.css";
import RenderRoutes from "./routes/RenderRoutes";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  
  return (
    <>
      <Router>
        <RenderRoutes isLoading={isLoading} />
      </Router>
      <ToastContainer
        limit={1}
        position="bottom-right"
        autoClose={4000}
        closeOnClick
        theme="light"
        transition={Slide}
        icon={() => <img src={logo} />}
      />
    </>
  );
}

export default App;
