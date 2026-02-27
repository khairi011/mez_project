import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🔴 [API Error]', error.config?.method?.toUpperCase(), error.config?.url, '→', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('accessToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Only redirect to login if user was authenticated (avoid loop)
      if (hadToken && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;