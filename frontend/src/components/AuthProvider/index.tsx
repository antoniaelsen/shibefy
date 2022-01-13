import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../../config";


interface IAuthContext {
  isAuthenticated: boolean;
  error: string | null;
  token: string | null;
  login(): Promise<void>
}

const AuthContext = React.createContext<IAuthContext>({
  isAuthenticated: false,
  error: null,
  token: null,
  login: async () => {},
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
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const params = useQuery();

  const login = useCallback(async () => {
    setError(null);
    const { href } = window.location;
    const loc = href.split('?')[0];
    const url = `https://${config.backendDomain}/auth/spotify?returnTo=${loc}`;
    window.location.href = url; 
  }, []);
  

  useEffect(() => {
    const token = params.get("access_token");
    const error = params.get("error");

    if (error) {
      const decoded = decodeURIComponent(error);
      setError(decoded);
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
      error,
      isAuthenticated,
      login,
      token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
