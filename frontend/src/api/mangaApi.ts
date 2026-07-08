import axios, { AxiosError } from 'axios';
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

// === BỔ SUNG HÀM GETMANGA ĐỂ SỬA LỖI BUILD CỦA TRANG HOME ===
export const getManga = async () => {
  // Đường dẫn endpoint này tùy thuộc vào API lấy danh sách truyện hiện tại của Backend bạn thiết lập
  const response = await axiosClient.get('/manga'); 
  return response.data;
};

// Vẫn giữ lại export mặc định cho axiosClient để trang Login dùng chung
export default axiosClient;