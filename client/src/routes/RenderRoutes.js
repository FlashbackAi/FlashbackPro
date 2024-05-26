import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import LoadingSpinner from "../components/Loader/LoadingSpinner";
import ROUTES from "./Routes";

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

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
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
