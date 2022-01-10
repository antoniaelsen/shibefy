import React from 'react';
import {
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";

import { Login } from '../Login';
import { PlaylistPage } from '../PlaylistPage';
import { useAuth } from '../AuthProvider';


function RequireAuth({ children }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}


export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          <RequireAuth>
            <PlaylistPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
