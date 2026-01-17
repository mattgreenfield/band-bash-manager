import { useState, useCallback } from "react";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USERNAME_KEY = "auth_username";

// API endpoints - use localhost only when running on localhost
const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE = isLocalhost
  ? "http://localhost:8888/.netlify/functions"
  : "https://setlists.netlify.app/.netlify/functions";
const SESSION_API = `${API_BASE}/session`;

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  });

  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_USERNAME_KEY);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (inputUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(SESSION_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputUsername, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Login failed");
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USERNAME_KEY, data.username);
      setIsAuthenticated(true);
      setUsername(data.username);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USERNAME_KEY);
    setIsAuthenticated(false);
    setUsername(null);
  }, []);

  const getToken = useCallback((): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }, []);

  return { 
    isAuthenticated, 
    username,
    isLoading, 
    error, 
    login, 
    logout,
    getToken 
  };
};

// Utility function to get auth headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};
