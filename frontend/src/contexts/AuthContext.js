import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;  // Important for cookies

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token or reauthenticate
        const token = localStorage.getItem('token');
        if (token) {
          // Attempt the original request again
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }
      } catch (err) {
        console.error('Error refreshing auth:', err);
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/user/current');
      setUser(response.data);
    } catch (error) {
      // Only remove token if it's an authentication error
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('token');
        setUser(null);
      }
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    localStorage.setItem('token', response.data.token);
    setUser(response.data);
    return response.data;
  };

  const register = async (username, email, password) => {
    const response = await axios.post('/api/auth/register', {
      username,
      email,
      password
    });
    localStorage.setItem('token', response.data.token);
    setUser(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
