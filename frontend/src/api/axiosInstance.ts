import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
