import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authorRequestApi, type AuthorRequestResponse } from '../../api/authorRequestApi';
import { useAuthStore } from '../../stores/authStore';
import { Users, ShieldAlert, Award, FileText } from 'lucide-react';
import styles from '../UserProfile/UserProfile.module.css';

export const AdminAuthorRequests: React.FC = () => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();

  const [requests, setRequests] = useState<AuthorRequestResponse[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  const [selectedRequest, setSelectedRequest] = useState<AuthorRequestResponse | null>(null);
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [rejectReasonText, setRejectReasonText] = useState<string>("");

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      return typeof responseData === 'string' ? responseData : 'Có lỗi xảy ra';
    }
    return 'Có lỗi xảy ra';
  };

  const fetchRequests = useCallback(async (nextPage = page) => {
    try {
      const statusParam = filterStatus === 'ALL' ? undefined : filterStatus;
      const response = await authorRequestApi.getAll(statusParam, nextPage, 10);
      if (response.success && response.payload) {
        setRequests(response.payload.content);
        setTotalPages(response.payload.totalPages);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn đăng ký:", error);
    }
  }, [filterStatus, page]);

  useEffect(() => {
    Promise.resolve().then(() => fetchRequests());
  }, [fetchRequests]);

  const handleApprove = async (id: number) => {
    if (window.confirm("Xác nhận duyệt đơn đăng ký tác giả này và nâng cấp quyền người dùng?")) {
      try {
        const res = await authorRequestApi.review(id, { action: 'APPROVE' });
        if (res.success) {
          alert("Duyệt đơn đăng ký thành công!");
          fetchRequests();
        } else {
          alert(res.message);
        }
      } catch (err: unknown) {
        alert(getErrorMessage(err));
      }
    }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      const res = await authorRequestApi.review(id, { action: 'REJECT', rejectReason: reason });
      if (res.success) {
        alert("Từ chối đơn đăng ký thành công!");
        fetchRequests();
      } else {
        alert(res.message);
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const activeTab: string = "author-requests";

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
                <h1 className={styles.pageTitle}>Danh sách đơn đăng ký Tác giả</h1>
                <p className={styles.pageSubtitle}>
                  Xem, duyệt hoặc từ chối các đơn đăng ký trở thành Tác giả của người dùng.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center', justifyContent: 'end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Trạng thái:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(0);
                    }}
                    className={styles.formInput}
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="PENDING">Chờ duyệt (Pending)</option>
                    <option value="APPROVED">Đã duyệt (Approved)</option>
                    <option value="REJECTED">Từ chối (Rejected)</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Người đăng ký</th>
                      <th>Bút danh</th>
                      <th style={{ width: '120px' }}>Trạng thái</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          Không có dữ liệu hiển thị.
                        </td>
                      </tr>
                    ) : (
                      requests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13.5px' }}>{req.username}</span>
                              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{req.email}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{req.penName}</td>
                          <td>
                            {req.status === 'PENDING' && (
                              <span style={{
                                color: '#d97706',
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'inline-block'
                              }}>
                                Chờ duyệt
                              </span>
                            )}
                            {req.status === 'APPROVED' && (
                              <span style={{
                                backgroundColor: 'var(--color-green-bg)',
                                color: 'var(--color-green)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                display: 'inline-block'
                              }}>
                                Đã duyệt
                              </span>
                            )}
                            {req.status === 'REJECTED' && (
                              <span style={{
                                backgroundColor: 'var(--color-red-bg)',
                                color: 'var(--color-red)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                display: 'inline-block'
                              }} title={req.rejectReason || undefined}>
                                Từ chối
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setShowRejectForm(false);
                                  setRejectReasonText("");
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-accent)',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  padding: '4px 8px',
                                  textDecoration: 'none'
                                }}
                              >
                                Xem chi tiết
                              </button>
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

      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--border-radius-md)',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              borderTopLeftRadius: 'var(--border-radius-md)',
              borderTopRightRadius: 'var(--border-radius-md)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: 0 }}>
                Chi tiết Đơn đăng ký Tác giả
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#e0e7ff',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '20px', display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Tài khoản:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{selectedRequest.username}</span>

                <span style={{ color: 'var(--color-text-muted)' }}>Email:</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{selectedRequest.email}</span>

                <span style={{ color: 'var(--color-text-muted)' }}>Bút danh:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{selectedRequest.penName}</span>

                <span style={{ color: 'var(--color-text-muted)' }}>Số điện thoại:</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{selectedRequest.phone}</span>

                <span style={{ color: 'var(--color-text-muted)' }}>Link MXH:</span>
                <a href={selectedRequest.socialLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
                  {selectedRequest.socialLink}
                </a>

                <span style={{ color: 'var(--color-text-muted)' }}>Ngày gửi:</span>
                <span style={{ color: 'var(--color-text-main)' }}>
                  {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
                </span>

                <span style={{ color: 'var(--color-text-muted)' }}>Trạng thái:</span>
                <div>
                  {selectedRequest.status === 'PENDING' && (
                    <span style={{
                      color: '#d97706',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      Chờ duyệt
                    </span>
                  )}
                  {selectedRequest.status === 'APPROVED' && (
                    <span style={{
                      backgroundColor: 'var(--color-green-bg)',
                      color: 'var(--color-green)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      Đã duyệt
                    </span>
                  )}
                  {selectedRequest.status === 'REJECTED' && (
                    <span style={{
                      backgroundColor: 'var(--color-red-bg)',
                      color: 'var(--color-red)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      Từ chối
                    </span>
                  )}
                </div>
              </div>

              {selectedRequest.status === 'REJECTED' && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-red-bg)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--color-red)',
                  fontSize: '13.5px',
                  lineHeight: 1.5,
                  border: '1px solid rgba(239, 68, 68, 0.15)'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Lý do từ chối:</div>
                  <div>{selectedRequest.rejectReason || "Không có lý do chi tiết."}</div>
                </div>
              )}

              {selectedRequest.status === 'PENDING' && (
                <div style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '16px',
                  marginTop: '8px'
                }}>
                  {!showRejectForm ? (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                      <button
                        onClick={() => {
                          if (window.confirm("Xác nhận duyệt đơn đăng ký tác giả này và nâng cấp quyền người dùng?")) {
                            handleApprove(selectedRequest.id);
                            setSelectedRequest(null);
                          }
                        }}
                        className={styles.adminBtnUnban}
                        style={{ padding: '8px 20px', fontSize: '13px' }}
                      >
                        Duyệt đơn
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className={styles.adminBtnBan}
                        style={{ padding: '8px 20px', fontSize: '13px' }}
                      >
                        Từ chối duyệt
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        Nhập lý do từ chối:
                      </label>
                      <textarea
                        value={rejectReasonText}
                        onChange={(e) => setRejectReasonText(e.target.value)}
                        placeholder="Nêu rõ lý do từ chối để người dùng biết cách điều chỉnh..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: '13.5px',
                          outline: 'none',
                          resize: 'vertical',
                          backgroundColor: 'var(--color-surface-hover)',
                          color: 'var(--color-text-main)'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'end' }}>
                        <button
                          onClick={() => setShowRejectForm(false)}
                          style={{
                            padding: '6px 14px',
                            fontSize: '12.5px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-muted)',
                            borderRadius: 'var(--border-radius-sm)',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => {
                            if (!rejectReasonText.trim()) {
                              alert("Lý do từ chối không được để trống!");
                              return;
                            }
                            handleReject(selectedRequest.id, rejectReasonText);
                            setSelectedRequest(null);
                          }}
                          className={styles.adminBtnBan}
                          style={{ padding: '6px 14px', fontSize: '12.5px' }}
                        >
                          Xác nhận từ chối
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
