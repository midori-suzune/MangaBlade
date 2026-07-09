import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Home/Login'; // Hãy đảm bảo file Login.tsx đã được kéo ra nằm trực tiếp trong thư mục src/pages/
import ProtectedRoute from './components/ProtectedRoute';

// Các màn hình giả lập (Mock UI) phục vụ kiểm thử hệ thống
const Home = () => <div><h1>MangaBlade - Phân hệ Độc giả (Công cộng)</h1></div>;
const AuthorDashboard = () => <div><h1>Khu vực tác giả - Dashboard số liệu</h1></div>;
const AdminDashboard = () => <div><h1>Hệ thống quản trị ACP - Admin</h1></div>;
const Unauthorized = () => <div><h1>403 - Bạn không có quyền truy cập chức năng này</h1></div>;

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* === PHÂN HỆ ĐỘC GIẢ (PUBLIC CLIENT) === */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* === ĐƯỜNG DẪN BỊ THIẾU KHIẾN TRẮNG TRANG === */}
        {/* Khai báo cổng đăng nhập riêng cho phân hệ quản lý theo tài liệu thiết kế */}
        <Route path="/management/login" element={<Login />} />

        {/* === NHÁNH QUẢN LÝ TÁC GIẢ (AUTHOR GUARD) === */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_AUTHOR', 'ROLE_ADMIN']} redirectPath="/management/login" />}>
          <Route path="/management/author/dashboard" element={<AuthorDashboard />} />
        </Route>

        {/* === NHÁNH QUẢN TRỊ VIÊN (ADMIN GUARD) === */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} redirectPath="/management/login" />}>
          <Route path="/management/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;