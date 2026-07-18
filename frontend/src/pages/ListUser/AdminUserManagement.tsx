import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { adminUserApi } from '../../api/userApi';
import type { UserType, UserRole } from '../../types/user';
import { useAuthStore } from '../../stores/authStore';
import { Users, ShieldAlert, Award, Search, FileText } from 'lucide-react';
import styles from '../UserProfile/UserProfile.module.css';

export const AdminUserManagement: React.FC = () => {
  const { roleType } = useParams<{ roleType: string }>();
  const navigate = useNavigate();
  const { displayName, user: loggedInUser } = useAuthStore();
  const currentAdminId = loggedInUser?.id;

  const getMappedRole = (): UserRole => {
    if (roleType === 'admins') return 'ADMIN';
    if (roleType === 'authors') return 'AUTHOR';
    return 'USER';
  };

  const targetRole = getMappedRole();

  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [filterBan, setFilterBan] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      return typeof responseData === 'string' ? responseData : 'Có lỗi xảy ra';
    }
    return 'Có lỗi xảy ra';
  };

  const fetchUsers = useCallback(async (nextPage = page) => {
    try {
      const isBannedParam = filterBan === 'all' ? undefined : filterBan === 'banned';
      const response = await adminUserApi.getUsers(targetRole, search || undefined, isBannedParam, nextPage, 10);
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    }
  }, [targetRole, search, filterBan, page]);

  useEffect(() => {
    Promise.resolve().then(() => fetchUsers());
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
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
      } catch (err: unknown) {
        alert(getErrorMessage(err));
      }
    }
  };

  const activeTab = roleType || "users";

  return (
    <div className={styles.profilePage}>
      <div className={styles.pageContainer}>
        <div className={styles.profileLayoutContainer}>
          <aside className={styles.profileSidebar}>
            <div className={styles.sidebarUserCard}>
              <div className={styles.sidebarUserMeta}>
                <span className={styles.sidebarUserTitleLabel}>Hệ thống quản trị</span>
                <span className={styles.sidebarUserName}>{displayName || "Admin"}</span>
              </div>
            </div>

            <nav className={styles.sidebarNav}>
              <button
                className={`${styles.sidebarNavItem} ${activeTab === "users" ? styles.sidebarActiveItem : ""}`}
                onClick={() => navigate('/admin/users/users')}
              >
                <Users size={16} /> Quản lý Độc giả
              </button>
              <button
                className={`${styles.sidebarNavItem} ${activeTab === "authors" ? styles.sidebarActiveItem : ""}`}
                onClick={() => navigate('/admin/users/authors')}
              >
                <Award size={16} /> Quản lý Tác giả
              </button>
              <button
                className={`${styles.sidebarNavItem} ${activeTab === "author-requests" ? styles.sidebarActiveItem : ""}`}
                onClick={() => navigate('/admin/users/author-requests')}
              >
                <FileText size={16} /> Đơn đăng ký Tác giả
              </button>
              <button
                className={`${styles.sidebarNavItem} ${activeTab === "admins" ? styles.sidebarActiveItem : ""}`}
                onClick={() => navigate('/admin/users/admins')}
              >
                <ShieldAlert size={16} /> Quản lý Admin
              </button>
            </nav>
          </aside>

          <main className={styles.profileMainContent}>
            <div className={styles.profileCard}>
              <div className={styles.pageTitleSection}>
                <h1 className={styles.pageTitle}>
                  Danh sách {targetRole === "USER" ? "Độc giả" : targetRole === "AUTHOR" ? "Tác giả" : "Quản trị viên (Admin)"}
                </h1>
                <p className={styles.pageSubtitle}>
                  Xem danh sách, tìm kiếm, sửa thông tin, khóa/mở khóa hoặc xóa tài khoản.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
                <form onSubmit={handleSearchSubmit} style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm theo tên account, email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={styles.formInput}
                    style={{ padding: '8px 12px 8px 36px', fontSize: '13px' }}
                  />
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Trạng thái:</span>
                  <select
                    value={filterBan}
                    onChange={(e) => {
                      setFilterBan(e.target.value);
                      setPage(0);
                    }}
                    className={styles.formInput}
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="banned">Bị khóa (Ban)</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>ID</th>
                      <th>Người dùng</th>
                      <th style={{ width: '130px' }}>Trạng thái</th>
                      <th style={{ width: '180px', textAlign: 'center' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          Không có dữ liệu hiển thị.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{user.id}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13.5px' }}>{user.username}</span>
                              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user.email}</span>
                            </div>
                          </td>
                          <td>
                            {user.banned ? (
                              <span
                                style={{
                                  backgroundColor: 'var(--color-red-bg)',
                                  color: 'var(--color-red)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  display: 'inline-block'
                                }}
                              >
                                Bị Ban
                              </span>
                            ) : (
                              <span
                                style={{
                                  backgroundColor: 'var(--color-green-bg)',
                                  color: 'var(--color-green)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  display: 'inline-block'
                                }}
                              >
                                Hoạt động
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              {user.id !== currentAdminId ? (
                                <button
                                  onClick={() => handleToggleBan(user)}
                                  className={user.banned ? styles.adminBtnUnban : styles.adminBtnBan}
                                >
                                  {user.banned ? 'Unban' : 'Ban'}
                                </button>
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '4px 8px' }}>
                                  Cá nhân
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((prev) => prev - 1)}
                    className={styles.btnTask}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-main)',
                      padding: '4px 12px',
                      opacity: page === 0 ? 0.5 : 1,
                      cursor: page === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Trước
                  </button>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((prev) => prev + 1)}
                    className={styles.btnTask}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-main)',
                      padding: '4px 12px',
                      opacity: page >= totalPages - 1 ? 0.5 : 1,
                      cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
