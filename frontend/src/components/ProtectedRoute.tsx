import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectPath: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, redirectPath }) => {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('role'); // Nhận giá trị: ROLE_ADMIN, ROLE_AUTHOR, ROLE_USER

  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  // Nếu có role nhưng không nằm trong danh sách được phép -> Chặn quyền truy cập
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;