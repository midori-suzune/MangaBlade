import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Thay cổng 8080 bằng cổng chạy Spring Boot của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cấu hình tự động đính kèm JWT Token vào Header nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Hoặc nơi bạn lưu trữ token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cấu hình tự động bắt dữ liệu trả về từ Response
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi tập trung (Ví dụ: bóc tách message lỗi từ backend trả về)
    return Promise.reject(error);
  }
);

export default axiosClient;