import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import cookies from "js-cookie";
import config from "../../config";

const COOKIE_KEY_AUTH_STATE = "shibefy-auth";

interface IAuthContext {
  isAuthenticated: boolean;
  error: string | null;
  login(): Promise<void>
  logout(): Promise<void>
}

const AuthContext = React.createContext<IAuthContext>({
  isAuthenticated: false,
  error: null,
  login: async () => {},
  logout: async () => {},
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
  const navigate = useNavigate();
  const params = useQuery();

  const login = useCallback(async () => {
    setError(null);
    const { href } = window.location;
    const loc = href.split('?')[0];
    const url = `https://${config.backendDomain}/auth/spotify?returnTo=${loc}`;
    window.location.href = url; 
  }, []);

  const logout = useCallback(async () => {
    cookies.remove(COOKIE_KEY_AUTH_STATE);
    setIsAuthenticated(false);
    navigate("/");
  }, [navigate]);
  

  useEffect(() => {
    const error = params.get("error");
    if (error) {
      const decoded = decodeURIComponent(error);
      setError(decoded);
      navigate("/");
    }
    
    const cookie = cookies.get(COOKIE_KEY_AUTH_STATE);
    if (!cookie) return;
    
    const { isLoggedIn } = JSON.parse(cookie);
    if (isLoggedIn) {
      setIsAuthenticated(true);
      navigate("/");
    }

  }, [navigate, params]);

  return (
    <AuthContext.Provider value={{
      error,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
