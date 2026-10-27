import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register')
    ) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    let message = 'An unexpected error occurred';
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        message = data?.message || 'Invalid username/email or password. Please try again.';
      } else if (status === 403) {
        message = data?.message || 'You do not have permission to perform this action.';
      } else if (status === 404) {
        message = data?.message || 'Requested resource not found.';
      } else if (status === 502 || status === 503 || status === 504) {
        message = 'Server is temporarily unavailable or restarting. Please try again in a moment.';
      } else if (data && typeof data === 'object') {
        if (data.message) {
          message = data.message;
        }
        if (data.errors && typeof data.errors === 'object') {
          const fieldErrors = Object.values(data.errors).join(', ');
          if (fieldErrors) message = `${message}: ${fieldErrors}`;
        }
      } else if (error.message) {
        message = error.message;
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Please check your network or server status.';
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
