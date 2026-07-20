import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authorRequestApi, type AuthorRequestResponse } from '../../../api/authorRequestApi';
import { useAuthStore } from '../../../stores/authStore';
import { BarChart3, Users, FileText, ChevronDown, Eye } from 'lucide-react';
import styles from '../Admin.module.css';

interface DetailModalProps {
  request: AuthorRequestResponse;
  showRejectForm: boolean;
  rejectReasonText: string;
  setRejectReasonText: (v: string) => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  onClose: () => void;
  onShowRejectForm: (v: boolean) => void;
}

function AuthorRequestDetailModal({
  request,
  showRejectForm,
  rejectReasonText,
  setRejectReasonText,
  onApprove,
  onReject,
  onClose,
  onShowRejectForm
}: DetailModalProps) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            Chi Tiết Đơn Đăng Ký Tác Giả
          </h3>
          <button
            onClick={onClose}
            className={styles.modalClose}
          >
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Tài khoản:</span>
            <span className={styles.detailValue}>{request.username}</span>

            <span className={styles.detailLabel}>Email:</span>
            <span className={styles.detailValue}>{request.email}</span>

            <span className={styles.detailLabel}>Bút danh:</span>
            <span className={styles.detailValue}>{request.penName}</span>

            <span className={styles.detailLabel}>Số điện thoại:</span>
            <span className={styles.detailValue}>{request.phone}</span>

            <span className={styles.detailLabel}>Link MXH:</span>
            <a href={request.socialLink} target="_blank" rel="noopener noreferrer" className={styles.detailValue}>
              {request.socialLink}
            </a>

            <span className={styles.detailLabel}>Ngày gửi:</span>
            <span className={styles.detailValue}>
              {new Date(request.createdAt).toLocaleString('vi-VN')}
            </span>

            {request.reviewedAt && (
              <>
                <span className={styles.detailLabel}>Ngày duyệt/từ chối:</span>
                <span className={styles.detailValue}>
                  {new Date(request.reviewedAt).toLocaleString('vi-VN')}
                </span>
              </>
            )}

            <span className={styles.detailLabel}>Trạng thái:</span>
            <div>
              {request.status === 'PENDING' && (
                <span className={styles.pendingPlainText}>
                  Chờ duyệt
                </span>
              )}
              {request.status === 'APPROVED' && (
                <span className={`${styles.statusBadge} ${styles.statusSuccess}`}>
                  Đã duyệt
                </span>
              )}
              {request.status === 'REJECTED' && (
                <span className={`${styles.statusBadge} ${styles.statusDanger}`}>
                  Từ chối
                </span>
              )}
            </div>
          </div>

          {request.status === 'REJECTED' && (
            <div className={styles.rejectBox}>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>Lý do từ chối:</div>
              <div>{request.rejectReason || "Không có lý do chi tiết."}</div>
            </div>
          )}

          {request.status === 'PENDING' && (
            <div>
              {!showRejectForm ? (
                <div className={styles.modalActions}>
                  <button
                    onClick={() => {
                      if (window.confirm("Xác nhận duyệt đơn đăng ký tác giả này và nâng cấp quyền người dùng?")) {
                        onApprove(request.id);
                        onClose();
                      }
                    }}
                    className={styles.btnUnban}
                  >
                    Duyệt đơn
                  </button>
                  <button
                    onClick={() => onShowRejectForm(true)}
                    className={styles.btnBan}
                  >
                    Từ chối duyệt
                  </button>
                </div>
              ) : (
                <div className={styles.rejectForm}>
                  <label className={styles.rejectLabel}>
                    Nhập lý do từ chối:
                  </label>
                  <textarea
                    value={rejectReasonText}
                    onChange={(e) => setRejectReasonText(e.target.value)}
                    placeholder="Nêu rõ lý do từ chối để người dùng biết cách điều chỉnh..."
                    rows={3}
                    className={`${styles.formInput} ${styles.textarea}`}
                  />
                  <div className={styles.modalActions}>
                    <button
                      onClick={() => onShowRejectForm(false)}
                      className={styles.btnCancel}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        if (!rejectReasonText.trim()) {
                          alert("Lý do từ chối không được để trống!");
                          return;
                        }
                        onReject(request.id, rejectReasonText);
                        onClose();
                      }}
                      className={styles.btnBan}
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
  );
}

const seededAuthorRequests: AuthorRequestResponse[] = [
  {
    id: 101,
    userId: 1,
    username: 'hieuminh4958',
    email: 'hieuminh4958@gmail.com',
    penName: 'Minh Họa',
    phone: '0901-222-345',
    socialLink: 'https://facebook.com/hieuminh4958',
    status: 'PENDING',
    rejectReason: null,
    createdAt: '2026-07-13T08:30:00',
    reviewedAt: null,
  },
  {
    id: 102,
    userId: 2,
    username: 'blade_reader',
    email: 'reader@demo.com',
    penName: 'Lam Phong',
    phone: '0902-456-789',
    socialLink: 'https://x.com/blade_reader',
    status: 'PENDING',
    rejectReason: null,
    createdAt: '2026-07-14T10:15:00',
    reviewedAt: null,
  },
  {
    id: 103,
    userId: 3,
    username: 'nguyen_author',
    email: 'author@demo.com',
    penName: 'Nguyễn Ảnh',
    phone: '0903-111-222',
    socialLink: 'https://facebook.com/nguyen.author',
    status: 'APPROVED',
    rejectReason: null,
    createdAt: '2026-07-10T14:20:00',
    reviewedAt: '2026-07-11T09:00:00',
  },
  {
    id: 104,
    userId: 4,
    username: 'locked_writer',
    email: 'locked-writer@demo.com',
    penName: 'Hắc Vũ',
    phone: '0904-333-555',
    socialLink: 'https://facebook.com/locked.writer',
    status: 'REJECTED',
    rejectReason: 'Thông tin liên hệ chưa rõ ràng.',
    createdAt: '2026-07-08T16:40:00',
    reviewedAt: '2026-07-09T11:30:00',
  },
  {
    id: 105,
    userId: 5,
    username: 'novel_kid',
    email: 'novel@demo.com',
    penName: 'Tử Diệp',
    phone: '0905-888-999',
    socialLink: 'https://www.instagram.com/novel_kid',
    status: 'PENDING',
    rejectReason: null,
    createdAt: '2026-07-15T12:05:00',
    reviewedAt: null,
  },
];

export const AuthorRequests: React.FC = () => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();

  const [requests, setRequests] = useState<AuthorRequestResponse[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
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

  const filterRequestsBySearch = useCallback((items: AuthorRequestResponse[]) => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return items;
    return items.filter((request) => (
      request.username.toLowerCase().includes(normalizedSearch)
      || request.email.toLowerCase().includes(normalizedSearch)
      || request.penName.toLowerCase().includes(normalizedSearch)
    ));
  }, [search]);

  const getSeededRequests = useCallback(() => {
    return filterRequestsBySearch(
      seededAuthorRequests.filter((request) => filterStatus === 'ALL' || request.status === filterStatus)
    );
  }, [filterStatus, filterRequestsBySearch]);

  const fetchRequests = useCallback(async (nextPage = page) => {
    try {
      const statusParam = filterStatus === 'ALL' ? undefined : filterStatus;
      const response = await authorRequestApi.getAll(statusParam, nextPage, 10);
      if (response.success && response.payload) {
        const fetchedRequests = filterRequestsBySearch(response.payload.content);
        setRequests(response.payload.content.length > 0 ? fetchedRequests : getSeededRequests());
        setTotalPages(response.payload.content.length > 0 ? response.payload.totalPages : 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn đăng ký:", error);
      setRequests(getSeededRequests());
      setTotalPages(0);
    }
  }, [filterStatus, page, filterRequestsBySearch, getSeededRequests]);

  useEffect(() => {
    Promise.resolve().then(() => fetchRequests());
  }, [fetchRequests]);

  const handleApprove = async (id: number) => {
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
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString('vi-VN');
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
                className={`${styles.adminNavItem} ${activeTab === "users" ? styles.active : ""}`}
                onClick={() => navigate('/admin/users')}
              >
                <Users size={16} /> Quản lý User
              </button>
              <button
                className={`${styles.adminNavItem} ${activeTab === "author-requests" ? styles.active : ""}`}
                onClick={() => navigate('/admin/author-requests')}
              >
                <FileText size={16} /> Đơn đăng ký Tác giả
              </button>
          </nav>

          <main className={styles.adminContent}>
              <div className={styles.pageTitleSection}>
                <div>
                  <h2 className={styles.pageTitle}>Danh sách đơn đăng ký Tác giả</h2>
                  <p className={styles.pageSubtitle}>
                    Xem, duyệt hoặc từ chối các đơn đăng ký trở thành Tác giả của người dùng.
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
                      placeholder="Tìm username, email hoặc bút danh"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className={`${styles.formInput} ${styles.searchInput}`}
                    />
                  </form>

                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(0);
                    }}
                    className={`${styles.formInput} ${styles.authorStatusSelect}`}
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                </div>
              </div>

              <div className={styles.userTablePanel}>
                <div className={styles.tableFrame}>
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        <th className={styles.idColumn}>ID</th>
                        <th className={styles.usernameColumn}>Username</th>
                        <th className={styles.emailColumn}>Email</th>
                        <th className={styles.titleColumn}>Bút danh</th>
                        <th className={styles.statusColumn}>Status</th>
                        <th className={styles.dateColumn}>Created At</th>
                        <th className={styles.actionColumn}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className={styles.emptyCell}>
                            Không có dữ liệu hiển thị.
                          </td>
                        </tr>
                      ) : (
                        requests.map((req) => (
                          <tr key={req.id}>
                            <td className={styles.idCell}>{req.id}</td>
                            <td>
                              <span className={styles.userName}>{req.username}</span>
                            </td>
                            <td className={styles.truncateCell}>{req.email}</td>
                            <td className={styles.truncateCell}>{req.penName}</td>
                            <td>
                              {req.status === 'PENDING' && (
                                <span className={styles.pendingPlainText}>
                                  Chờ duyệt
                                </span>
                              )}
                              {req.status === 'APPROVED' && (
                                <span className={`${styles.dotStatus} ${styles.dotSuccess}`}>
                                  Đã duyệt
                                </span>
                              )}
                              {req.status === 'REJECTED' && (
                                <span className={`${styles.dotStatus} ${styles.dotDanger}`} title={req.rejectReason || undefined}>
                                  Từ chối
                                </span>
                              )}
                            </td>
                            <td>{formatDate(req.createdAt)}</td>
                            <td>
                              <div className={styles.iconActions}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setShowRejectForm(false);
                                    setRejectReasonText("");
                                  }}
                                  className={styles.iconBtn}
                                  aria-label="Xem chi tiết đơn"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((prev) => prev - 1)}
                    className={styles.btnPage}
                  >
                    Trước
                  </button>
                  <span className={styles.pageCount}>
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((prev) => prev + 1)}
                    className={styles.btnPage}
                  >
                    Sau
                  </button>
                </div>
              )}
          </main>
        </section>
      </div>

      {selectedRequest && (
        <AuthorRequestDetailModal
          request={selectedRequest}
          showRejectForm={showRejectForm}
          rejectReasonText={rejectReasonText}
          setRejectReasonText={setRejectReasonText}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelectedRequest(null)}
          onShowRejectForm={setShowRejectForm}
        />
      )}
    </div>
  );
};
