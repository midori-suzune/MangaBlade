import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { adminUserApi } from '../../../api/userApi';
import type { UserType, UserRole, SpringPageResponse } from '../../../types/user';
import { useAuthStore } from '../../../stores/authStore';
import { BarChart3, Users, FileText, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import styles from '../Admin.module.css';

type UserRoleFilter = 'ALL' | UserRole;
type UserStatusFilter = 'all' | 'active' | 'banned';

const USER_TABLE_PAGE_SIZE = 10;

interface UserDetailModalProps {
  user: UserType;
  onSubmit: (updatedUser: Pick<UserType, 'username' | 'email' | 'role' | 'banned'>) => void;
  onClose: () => void;
}

function UserDetailModal({ user, onSubmit, onClose }: UserDetailModalProps) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    role: user.role,
    banned: user.banned,
  });
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});

  const toggleFieldEdit = (field: string, isEditing: boolean) => {
    setEditingFields((current) => ({ ...current, [field]: isEditing }));
  };

  const toggleFieldSave = (field: string) => {
    setEditingFields((current) => ({ ...current, [field]: !current[field] }));
  };

  const saveFieldOnEnter = (event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    if (event.key === 'Enter') {
      toggleFieldEdit(field, false);
    }
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Cập Nhật Người Dùng</h3>
          <button onClick={onClose} className={styles.modalClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.userDetailHeader}>
            <div className={styles.userDetailIdentity}>
              <span className={styles.userDetailAvatar}>
                {form.username.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className={styles.userDetailName}>{form.username}</div>
                <div className={styles.userDetailEmail}>{form.email}</div>
              </div>
            </div>
            <button type="button" className={styles.btnPrimary} onClick={handleSubmit}>
              Submit
            </button>
          </div>

          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Username:</span>
            <div className={styles.editableFieldRow}>
              <input
                className={`${styles.formInput} ${styles.modalFormInput}`}
                value={form.username}
                disabled={!editingFields.username}
                onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))}
                onBlur={() => toggleFieldEdit('username', false)}
                onKeyDown={(e) => saveFieldOnEnter(e, 'username')}
              />
              <button
                type="button"
                className={`${styles.fieldEditButton} ${editingFields.username ? styles.fieldEditButtonActive : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleFieldSave('username')}
              >
                <Pencil size={18} />
              </button>
            </div>

            <span className={styles.detailLabel}>Email:</span>
            <div className={styles.editableFieldRow}>
              <input
                className={`${styles.formInput} ${styles.modalFormInput}`}
                type="email"
                value={form.email}
                disabled={!editingFields.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                onBlur={() => toggleFieldEdit('email', false)}
                onKeyDown={(e) => saveFieldOnEnter(e, 'email')}
              />
              <button
                type="button"
                className={`${styles.fieldEditButton} ${editingFields.email ? styles.fieldEditButtonActive : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleFieldSave('email')}
              >
                <Pencil size={18} />
              </button>
            </div>

            <span className={styles.detailLabel}>Role:</span>
            <div className={styles.editableFieldRow}>
              <select
                className={`${styles.formInput} ${styles.modalFormInput}`}
                value={form.role}
                disabled={!editingFields.role}
                onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as UserRole }))}
                onBlur={() => toggleFieldEdit('role', false)}
                onKeyDown={(e) => saveFieldOnEnter(e, 'role')}
              >
                <option value="USER">Độc giả</option>
                <option value="AUTHOR">Tác giả</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="button"
                className={`${styles.fieldEditButton} ${editingFields.role ? styles.fieldEditButtonActive : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleFieldSave('role')}
              >
                <Pencil size={18} />
              </button>
            </div>

            <span className={styles.detailLabel}>Khóa tài khoản:</span>
            <div className={styles.editableFieldRow}>
              <select
                className={`${styles.formInput} ${styles.modalFormInput}`}
                value={form.banned ? 'banned' : 'active'}
                disabled={!editingFields.status}
                onChange={(e) => setForm((current) => ({ ...current, banned: e.target.value === 'banned' }))}
                onBlur={() => toggleFieldEdit('status', false)}
                onKeyDown={(e) => saveFieldOnEnter(e, 'status')}
              >
                <option value="active">Mở khóa</option>
                <option value="banned">Khóa</option>
              </select>
              <button
                type="button"
                className={`${styles.fieldEditButton} ${editingFields.status ? styles.fieldEditButtonActive : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleFieldSave('status')}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { displayName, user: loggedInUser } = useAuthStore();
  const currentAdminId = loggedInUser?.id;

  const [users, setUsers] = useState<UserType[]>([]);
  const [userPage, setUserPage] = useState<SpringPageResponse<UserType> | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRoleFilter>('ALL');
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [filterBan, setFilterBan] = useState<UserStatusFilter>('all');
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectionResetKey, setSelectionResetKey] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      if (typeof responseData === 'string') return responseData;
      if (responseData?.message) return responseData.message;
      if (responseData?.error) return responseData.error;
      return 'Có lỗi xảy ra';
    }
    return 'Có lỗi xảy ra';
  };

  const fetchUsers = useCallback(async (nextPage = page) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const isBannedParam = filterBan === 'active' ? false : filterBan === 'banned' ? true : undefined;
      const response = await adminUserApi.getUsers({
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        search: search || undefined,
        isBanned: isBannedParam,
        page: nextPage,
        size: USER_TABLE_PAGE_SIZE,
      });
      setUsers(response.data.content);
      setUserPage(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      setUsers([]);
      setUserPage(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [selectedRole, search, filterBan, page]);

  useEffect(() => {
    Promise.resolve().then(() => fetchUsers());
  }, [fetchUsers]);

  useEffect(() => {
    if (selectionResetKey === 0) return;
    Promise.resolve().then(() => setSelectedUserIds([]));
  }, [selectionResetKey]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
    setSelectionResetKey((current) => current + 1);
  };

  const toggleSelectionMode = () => {
    setSelectionMode((current) => {
      if (current) setSelectedUserIds([]);
      return !current;
    });
  };

  const toggleSelectUser = (userId: number) => {
    setSelectedUserIds((current) => (
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    ));
  };

  const toggleSelectAll = () => {
    const selectableIds = users.filter((user) => user.id !== currentAdminId).map((user) => user.id);
    setSelectedUserIds((current) => (
      selectableIds.every((id) => current.includes(id)) ? [] : selectableIds
    ));
  };

  const handleDeleteSelected = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Xác nhận xóa ${selectedUserIds.length} tài khoản đã chọn?`)) return;

    try {
      await Promise.all(selectedUserIds.map((id) => adminUserApi.deleteUser(id)));
      setUsers((current) => current.filter((user) => !selectedUserIds.includes(user.id)));
      setSelectedUserIds([]);
      if (users.length === selectedUserIds.length && page > 0) {
        setPage((current) => current - 1);
      } else {
        fetchUsers();
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleSubmitUserUpdate = async (updatedUser: Pick<UserType, 'username' | 'email' | 'role' | 'banned'>) => {
    if (!selectedUser) return;
    if (selectedUser.id === currentAdminId && updatedUser.banned) {
      alert("Hành động bị cấm: Bạn không thể tự khóa chính mình!");
      return;
    }

    try {
      await adminUserApi.updateUser(selectedUser.id, {
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      });

      if (selectedUser.banned !== updatedUser.banned) {
        await adminUserApi.toggleBan(selectedUser.id);
      }

      const mergedUser = { ...selectedUser, ...updatedUser };
      setUsers((current) => current.map((user) => (user.id === selectedUser.id ? mergedUser : user)));
      setSelectedUser(mergedUser);
      alert("Cập nhật user thành công!");
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const roleLabelByType = (role: UserRole) => {
    if (role === "ADMIN") return "Admin";
    if (role === "AUTHOR") return "Tác giả";
    return "Độc giả";
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString('vi-VN');
  };

  const getTitleName = (user: UserType) => user.activeTitle?.name || (user.activeTitleId ? `#${user.activeTitleId}` : "-");
  const baseColSpan = selectedRole === 'ALL' || selectedRole === 'USER' ? 7 : 6;
  const emptyColSpan = selectionMode ? baseColSpan + 1 : baseColSpan;
  const selectableUsers = users.filter((user) => user.id !== currentAdminId);
  const isAllSelected = selectableUsers.length > 0 && selectableUsers.every((user) => selectedUserIds.includes(user.id));
  const canGoPrevious = userPage ? !userPage.first : false;
  const canGoNext = userPage ? !userPage.last : false;

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    setSelectedUserIds([]);
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminShell}>
        <section className={styles.adminPanel}>
          <nav className={styles.adminNav}>
              <div className={styles.sidebarHeader}>
                <span className={styles.brandText}>Manga<span>Blade</span></span>
              </div>
              <button
                className={styles.adminNavItem}
                onClick={() => navigate('/admin/dashboard')}
              >
                <BarChart3 size={16} /> Dashboard
              </button>
              <button
                className={`${styles.adminNavItem} ${styles.active}`}
                onClick={() => navigate('/admin/users')}
              >
                <Users size={16} /> Quản lý User
              </button>
              <button
                className={styles.adminNavItem}
                onClick={() => navigate('/admin/author-requests')}
              >
                <FileText size={16} /> Đơn đăng ký Tác giả
              </button>
          </nav>

          <main className={styles.adminContent}>
              <div className={styles.pageTitleSection}>
                <div>
                  <h2 className={styles.pageTitle}>
                    Danh sách {selectedRole === "ALL" ? "Người dùng" : selectedRole === "USER" ? "Độc giả" : selectedRole === "AUTHOR" ? "Tác giả" : "Quản trị viên (Admin)"}
                  </h2>
                  <p className={styles.pageSubtitle}>
                    Xem danh sách, tìm kiếm, sửa thông tin, khóa/mở khóa hoặc xóa tài khoản.
                  </p>
                </div>
                <button className={styles.adminUserChip} type="button" aria-label="Tài khoản quản trị">
                  <span className={styles.adminAvatar}>{(displayName || "A").charAt(0).toUpperCase()}</span>
                  <span className={styles.adminUserMeta}>
                    <span className={styles.adminUserName}>{displayName || "Admin"}</span>
                    <span className={styles.adminUserRole}>Super Admin</span>
                  </span>
                  <ChevronDown size={16} className={styles.chipIcon} />
                </button>
              </div>

              <div className={styles.tableToolbar}>
                <div className={styles.tableToolbarLeft}>
                  <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                    <input
                      type="text"
                      placeholder="Tìm username hoặc email"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className={`${styles.formInput} ${styles.searchInput}`}
                    />
                  </form>

                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      setPage(0);
                      setSelectedRole(e.target.value as UserRoleFilter);
                      setSelectionResetKey((current) => current + 1);
                    }}
                    className={`${styles.formInput} ${styles.compactSelect}`}
                  >
                    <option value="ALL">All</option>
                    <option value="USER">Độc giả</option>
                    <option value="AUTHOR">Tác giả</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <select
                    value={filterBan}
                    onChange={(e) => {
                      setFilterBan(e.target.value as UserStatusFilter);
                      setPage(0);
                      setSelectionResetKey((current) => current + 1);
                    }}
                    className={`${styles.formInput} ${styles.compactSelect}`}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Không bị khóa</option>
                    <option value="banned">Bị khóa</option>
                  </select>
                </div>

                <div className={styles.tableToolbarActions}>
                  {selectionMode && selectedUserIds.length > 0 && (
                    <button className={styles.btnDangerOutline} type="button" onClick={handleDeleteSelected}>
                      <Trash2 size={15} /> <span>Delete</span>
                    </button>
                  )}
                  <button className={styles.btnPrimary} type="button" onClick={toggleSelectionMode}>
                    <Trash2 size={15} /> <span>{selectionMode ? 'Cancel' : 'Remove'}</span>
                  </button>
                </div>
              </div>

              <div className={styles.userTablePanel}>

                <div className={styles.tableFrame}>
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        {selectionMode && (
                          <th className={styles.checkboxColumn}>
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={toggleSelectAll}
                              aria-label="Chọn tất cả user"
                            />
                          </th>
                        )}
                        <th className={styles.idColumn}>ID</th>
                        <th className={styles.usernameColumn}>Username</th>
                        <th className={styles.emailColumn}>Email</th>
                        {selectedRole === 'ALL' && <th className={styles.roleColumn}>Role</th>}
                        {selectedRole === 'USER' && <th className={styles.titleColumn}>Title</th>}
                        <th className={styles.statusColumn}>Status</th>
                        <th className={styles.dateColumn}>Created At</th>
                        <th className={styles.actionColumn}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={emptyColSpan} className={styles.emptyCell}>
                            {loading ? 'Đang tải dữ liệu...' : errorMessage || 'Không có dữ liệu hiển thị.'}
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            {selectionMode && (
                              <td className={styles.checkboxColumn}>
                                <input
                                  type="checkbox"
                                  checked={selectedUserIds.includes(user.id)}
                                  disabled={user.id === currentAdminId}
                                  onChange={() => toggleSelectUser(user.id)}
                                  aria-label={`Chọn ${user.username}`}
                                />
                              </td>
                            )}
                            <td className={styles.idCell}>{user.id}</td>
                            <td>
                              <span className={styles.userName}>{user.username}</span>
                            </td>
                            <td className={styles.truncateCell}>{user.email}</td>
                            {selectedRole === 'ALL' && <td>{roleLabelByType(user.role)}</td>}
                            {selectedRole === 'USER' && <td>{getTitleName(user)}</td>}
                            <td>
                              {user.banned ? (
                                <span className={`${styles.dotStatus} ${styles.dotDanger}`}>
                                  Bị khóa
                                </span>
                              ) : (
                                <span className={`${styles.dotStatus} ${styles.dotSuccess}`}>
                                  Hoạt động
                                </span>
                              )}
                            </td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td>
                              <div className={styles.iconActions}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedUser(user)}
                                  className={styles.iconBtn}
                                  aria-label="Cập nhật user"
                                >
                                  <Pencil size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {userPage && userPage.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      type="button"
                      className={styles.btnPage}
                      disabled={!canGoPrevious}
                      onClick={() => goToPage(page - 1)}
                    >
                      Trước
                    </button>
                    <span className={styles.pageCount}>
                      {page + 1}/{userPage.totalPages}
                    </span>
                    <button
                      type="button"
                      className={styles.btnPage}
                      disabled={!canGoNext}
                      onClick={() => goToPage(page + 1)}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
          </main>
        </section>
      </div>
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onSubmit={handleSubmitUserUpdate}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};
