import { useState } from "react";

const AUTH_TOKEN_KEY = "auth_token";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  });

  const login = () => {
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};
