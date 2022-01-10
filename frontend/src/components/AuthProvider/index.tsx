import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../../config";

const login = async () => {
  const { href } = window.location;
  const loc = href.split('?')[0];
  const url = `https://${config.backendDomain}/auth/spotify?returnTo=${loc}`;
  window.location.href = url; 
}

interface IAuthContext {
  isAuthenticated: boolean;
  token: string | null;
  login(): Promise<void>
}

const AuthContext = React.createContext<IAuthContext>({
  isAuthenticated: false,
  token: null,
  login,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const params = useQuery();

  useEffect(() => {
    const token = params.get("access_token");
    const error = params.get("error");

    if (error) {
      console.log("Failed to authenticate", error)
      navigate("/");
    }

    if (token) {
      setIsAuthenticated(true);
      setToken(token);
      navigate("/");
    }

  }, [navigate, params]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}