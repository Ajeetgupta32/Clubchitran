import axios from 'axios';

const rawApiBase = import.meta.env.VITE_API_BASE_URL;
const cleanApiBase = rawApiBase ? rawApiBase.replace(/\/+$/, '') : '';
const baseURL = cleanApiBase ? `${cleanApiBase}/api` : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token and redirect to login if not already there
      if (!window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
