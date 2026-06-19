import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Track in-flight requests so we can surface a "server waking up" banner
// when something takes a while (Render free tier cold start).
let pending = 0;
let slowTimer = null;

const markStart = () => {
  pending += 1;
  if (!slowTimer) {
    slowTimer = setTimeout(() => window.dispatchEvent(new Event('api:slow')), 4000);
  }
};

const markEnd = () => {
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    clearTimeout(slowTimer);
    slowTimer = null;
    window.dispatchEvent(new Event('api:idle'));
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  markStart();
  return config;
});

api.interceptors.response.use(
  (response) => {
    markEnd();
    return response;
  },
  (error) => {
    markEnd();
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;