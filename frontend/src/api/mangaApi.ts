import axios, { AxiosError } from 'axios';
// Sử dụng import type riêng cho kiểu dữ liệu theo yêu cầu nghiêm ngặt của TypeScript
import type { InternalAxiosRequestConfig } from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default axiosClient;