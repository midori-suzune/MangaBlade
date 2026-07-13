import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminUserApi } from '../../api/userApi';
import type { UserType, UserRole } from '../../types/user';

export const AdminUserManagement: React.FC = () => {
  // Lấy params định tuyến từ URL: "users" | "admins" | "authors"
  const { roleType } = useParams<{ roleType: string }>(); 
  
  // Chuyển đổi slug URL thành chuẩn dữ liệu Enum của Backend
  const getMappedRole = (): UserRole => {
    if (roleType === 'admins') return 'ADMIN';
    if (roleType === 'authors') return 'AUTHOR';
    return 'USER';
  };

  const targetRole = getMappedRole();

  // State quản lý UI và dữ liệu
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterBan, setFilterBan] = useState<string>('all'); // 'all' | 'active' | 'banned'
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // ID của Admin hiện tại (Lấy từ JWT / AuthContext của bạn)
  const currentAdminId = 1; 

  const fetchUsers = async () => {
    try {
      const isBannedParam = filterBan === 'all' ? undefined : filterBan === 'banned';
      const response = await adminUserApi.getUsers(targetRole, search || undefined, isBannedParam, page, 10);
      
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    }
  };

  // Tự động tải lại khi đổi màn hình role, bộ lọc khóa hoặc chuyển trang
  useEffect(() => {
    fetchUsers();
  }, [roleType, filterBan, page]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0); // Quay về trang đầu khi bắt đầu tìm từ khóa mới
    fetchUsers();
  };

  const handleToggleBan = async (user: UserType) => {
    if (user.id === currentAdminId) {
      alert("Hành động bị cấm: Bạn không thể tự khóa chính mình!");
      return;
    }
    const actionText = user.banned ? 'Mở khóa (Unban)' : 'Khóa (Ban)';
    if (window.confirm(`Xác nhận thực hiện ${actionText} tài khoản này?`)) {
      try {
        await adminUserApi.toggleBan(user.id);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data || "Có lỗi xảy ra");
      }
    }
  };

  const handleDelete = async (user: UserType) => {
    if (user.id === currentAdminId) {
      alert("Hành động bị cấm: Bạn không thể tự xóa chính mình!");
      return;
    }
    if (window.confirm(`Hành động nguy hiểm! Xác nhận xóa vĩnh viễn tài khoản ${user.username}?`)) {
      try {
        await adminUserApi.deleteUser(user.id);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data || "Có lỗi xảy ra");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Quản Lý Danh Sách {targetRole}
      </h2>
      
      {/* Bộ lọc & Tìm kiếm */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Tìm theo tên account, email..." 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Tìm kiếm
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trạng thái:</span>
          <select 
            value={filterBan} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFilterBan(e.target.value); setPage(0); }}
            className="border border-gray-300 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="banned">Bị khóa (Ban)</option>
          </select>
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-left text-xs font-semibold uppercase tracking-wider">
              <th className="p-4">ID</th>
              <th className="p-4">Username</th>
              <th className="p-4">Email</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">Không có dữ liệu hiển thị.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-gray-500">{user.id}</td>
                  <td className="p-4 font-medium">{user.username}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    {user.banned ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">Bị Ban</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Hoạt động</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200">
                        Sửa
                      </button>
                      
                      {user.id !== currentAdminId ? (
                        <>
                          <button 
                            onClick={() => handleToggleBan(user)}
                            className={`px-3 py-1 rounded text-xs font-medium text-white transition ${user.banned ? 'bg-teal-600 hover:bg-teal-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                          >
                            {user.banned ? 'Unban' : 'Ban'}
                          </button>
                          <button 
                            onClick={() => handleDelete(user)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
                          >
                            Xóa
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic py-1 px-2 bg-gray-50 rounded">Tài khoản cá nhân</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Điều hướng Phân Trang */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4 items-center">
          <button 
            disabled={page === 0}
            onClick={() => setPage(prev => prev - 1)}
            className="px-3 py-1 bg-white border text-sm rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">Trang {page + 1} / {totalPages}</span>
          <button 
            disabled={page >= totalPages - 1}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1 bg-white border text-sm rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};