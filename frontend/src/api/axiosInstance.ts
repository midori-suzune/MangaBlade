import axios from 'axios';
import { handleAuthExpired, shouldHandleAuthExpired } from './authExpired';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if ((error.response?.status === 401 || error.response?.status === 403) && shouldHandleAuthExpired(error)) {
            handleAuthExpired();
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
