import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import LoadingSpinner from "../components/Loader/LoadingSpinner";
import ROUTES from "./Routes";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const isTokenExpired = (token) => {
  const decodedToken = jwtDecode(token);
  const currentDate = new Date();

  // Token expiry is usually given in seconds but JavaScript uses milliseconds
  return decodedToken.exp * 1000 < currentDate.getTime();
};

const ProtectedRoute = ({ children }) => {
 const isAuthenticated = !!localStorage?.userPhoneNumber;
 
 let location = useLocation();

 if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}

return children;
};

function RenderRoutes({ isLoading = false }) {
  return (
    <>
      {isLoading ? (
        <div>
          <LoadingSpinner />
        </div>
      ) : (
        <Routes>
          {ROUTES.map((route, i) => {
            const RouteComponent = route.component;
            return (
              <Route
                key={i}
                path={route.path}
                exact={route.exact}
                element={
                  route.protected ? (
                    <ProtectedRoute>
                      <route.component />
                    </ProtectedRoute>
                  ) : (
                    <route.component />
                  )
                }
              />
            );
          })}

          <Route component={() => <h1>Not Found!</h1>} />
        </Routes>
      )}
    </>
  );
}

export default RenderRoutes;
// export default {Routes :RenderRoutes};