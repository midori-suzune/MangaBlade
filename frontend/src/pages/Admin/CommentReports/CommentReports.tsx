import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChevronDown,
  Eye,
  FileCheck,
  FileText,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { adminCommentReportApi } from '../../../api/adminCommentReportApi';
import type { AdminCommentReportItem, AdminCommentReportReason, AdminCommentReportStatus } from '../../../api/adminCommentReportApi';
import type { SpringPageResponse } from '../../../types/user';
import { CommentText } from '../../../components/CommentEmojiPicker/CommentText';
import styles from '../Admin.module.css';

type CommentReportStatusFilter = 'ALL' | AdminCommentReportStatus;
type CommentReportReasonFilter = 'ALL' | AdminCommentReportReason;
const REPORT_TABLE_PAGE_SIZE = 10;

const statusLabels: Record<AdminCommentReportStatus, string> = {
  PENDING: 'Chờ xử lý',
  CHECKING: 'Đang kiểm tra',
  RESOLVED: 'Đã xử lý',
  REJECTED: 'Bác bỏ',
};

const commentReasonLabels: Record<Exclude<CommentReportReasonFilter, 'ALL'>, string> = {
  SPAM: 'Spam / Quảng cáo',
  HARASSMENT: 'Xúc phạm / Độc hại',
  SPOILER: 'Tiết lộ nội dung (Spoiler)',
  HATE_SPEECH: 'Phát ngôn thù ghét',
  OTHER: 'Khác',
};

interface CommentReportDetailModalProps {
  report: AdminCommentReportItem;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  onReview: (status: AdminCommentReportStatus, deleteComment?: boolean, banUser?: boolean) => void;
  onClose: () => void;
}

function CommentReportDetailModal({ report, rejectReason, setRejectReason, onReview, onClose }: CommentReportDetailModalProps) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Chi tiết báo cáo bình luận</h3>
          <button onClick={onClose} className={styles.modalClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailGrid} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px 16px', alignItems: 'start' }}>
            <span className={styles.detailLabel} style={{ paddingTop: '2px' }}>Nội dung Comment:</span>
            <span className={styles.detailValue} style={{ fontWeight: 600, color: '#2563eb', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
              "<CommentText content={report.commentContent} />"
            </span>

            <span className={styles.detailLabel}>Người comment:</span>
            <span className={styles.detailValue}>{report.commentAuthorUsername}</span>

            <span className={styles.detailLabel}>Truyện / Chương:</span>
            <span className={styles.detailValue}>{report.mangaTitle} {report.chapterNumber ? `(Chương ${report.chapterNumber})` : ''}</span>

            <span className={styles.detailLabel}>Lý do báo cáo:</span>
            <span className={styles.detailValue}>{commentReasonLabels[report.reason] || report.reason}</span>

            <span className={styles.detailLabel}>Người báo cáo:</span>
            <span className={styles.detailValue}>{report.reporterUsername}</span>

            <span className={styles.detailLabel}>Ngày gửi:</span>
            <span className={styles.detailValue}>{new Date(report.createdAt).toLocaleString('vi-VN')}</span>

            <span className={styles.detailLabel}>Trạng thái:</span>
            <span className={styles.detailValue}>{statusLabels[report.status]}</span>
          </div>

          {report.description && (
            <div className={styles.reportDescription}>
              <span>Mô tả thêm</span>
              <p>{report.description}</p>
            </div>
          )}

          {report.status === 'REJECTED' && report.rejectReason && (
            <div className={styles.rejectBox}>
              Lý do bác bỏ: {report.rejectReason}
            </div>
          )}

          <div className={styles.rejectForm}>
            <label className={styles.rejectLabel} htmlFor="comment-report-reject-reason">Lý do bác bỏ</label>
            <textarea
              id="comment-report-reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className={`${styles.formInput} ${styles.textarea}`}
              placeholder="Nhập lý do nếu muốn bác bỏ báo cáo..."
            />
          </div>

          <div className={styles.modalActions} style={{ marginTop: '8px' }}>
            <button
              type="button"
              className={styles.btnBan}
              onClick={() => onReview('REJECTED')}
              disabled={report.status === 'REJECTED'}
            >
              Bác bỏ
            </button>
            <button
              type="button"
              className={styles.btnBan}
              onClick={() => onReview('RESOLVED', true, false)}
              disabled={report.status === 'RESOLVED'}
            >
              Ẩn comment
            </button>
            <button
              type="button"
              className={styles.btnBan}
              onClick={() => onReview('RESOLVED', false, true)}
              disabled={report.status === 'RESOLVED'}
            >
              Ban user
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CommentReports: React.FC = () => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();

  const [commentReports, setCommentReports] = useState<AdminCommentReportItem[]>([]);
  const [commentReportPage, setCommentReportPage] = useState<SpringPageResponse<AdminCommentReportItem> | null>(null);
  const [commentReasonFilter, setCommentReasonFilter] = useState<CommentReportReasonFilter>('ALL');

  // Common State
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommentReportStatusFilter>('PENDING');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCommentReport, setSelectedCommentReport] = useState<AdminCommentReportItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      if (typeof responseData === 'string') return responseData;
      if (responseData?.message) return responseData.message;
      if (responseData?.error) return responseData.error;
    }
    return 'Có lỗi xảy ra';
  };

  const fetchReports = useCallback(async (nextPage = page) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await adminCommentReportApi.getCommentReports({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        reason: commentReasonFilter === 'ALL' ? undefined : commentReasonFilter,
        search: search || undefined,
        page: nextPage,
        size: REPORT_TABLE_PAGE_SIZE,
      });
      setCommentReports(response.data?.content || []);
      setCommentReportPage(response.data || null);
    } catch (error) {
      console.error('Lỗi khi tải danh sách báo cáo:', error);
      setCommentReports([]);
      setCommentReportPage(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, commentReasonFilter]);

  useEffect(() => {
    Promise.resolve().then(() => fetchReports());
  }, [fetchReports]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const openCommentReport = (report: AdminCommentReportItem) => {
    setSelectedCommentReport(report);
    setRejectReason(report.rejectReason || '');
  };

  const updateCommentReportReview = async (status: AdminCommentReportStatus, deleteComment = false, banUser = false) => {
    if (!selectedCommentReport) return;
    if (status === 'REJECTED' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do bác bỏ!');
      return;
    }

    try {
      const response = await adminCommentReportApi.reviewCommentReport(selectedCommentReport.id, {
        status,
        deleteComment,
        banUser,
        rejectReason: status === 'REJECTED' ? rejectReason.trim() : undefined,
      });
      setCommentReports((prev) => prev.map((report) => (
        report.id === selectedCommentReport.id ? response.data : report
      )));
      setSelectedCommentReport(null);
      setRejectReason('');
      await fetchReports(page);
    } catch (error) {
      console.error('Lỗi khi cập nhật báo cáo bình luận:', error);
      alert(getErrorMessage(error));
    }
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
  };

  const canGoPrevious = Boolean(commentReportPage && !commentReportPage.first);
  const canGoNext = Boolean(commentReportPage && !commentReportPage.last);

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminShell}>
        <section className={styles.adminPanel}>
          <nav className={styles.adminNav}>
            <div className={styles.sidebarHeader}>
              <span className={styles.brandText}>Manga<span>Blade</span></span>
            </div>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/dashboard')}>
              <BarChart3 size={16} /> Dashboard
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/users')}>
              <Users size={16} /> Quản lý User
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/manga')}>
              <BookOpen size={16} /> Quản lý Truyện
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/content-moderation')}>
              <FileCheck size={16} /> Kiểm duyệt nội dung
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/chapter-reports')}>
              <AlertTriangle size={16} /> Báo cáo lỗi chương
            </button>
            <button className={`${styles.adminNavItem} ${styles.active}`} onClick={() => navigate('/admin/comment-reports')}>
              <MessageSquare size={16} /> Báo cáo bình luận
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/author-requests')}>
              <FileText size={16} /> Đơn đăng ký Tác giả
            </button>
          </nav>

          <main className={styles.adminContent}>
            <div className={styles.pageTitleSection}>
              <div>
                <h2 className={styles.pageTitle}>Báo cáo bình luận</h2>
                <p className={styles.pageSubtitle}>
                  Xem và xử lý các báo cáo bình luận vi phạm chính sách của MangaBlade từ độc giả.
                </p>
              </div>
              <button className={styles.adminUserChip} type="button" aria-label="Tài khoản quản trị">
                <span className={styles.adminAvatar}>{(displayName || 'A').charAt(0).toUpperCase()}</span>
                <span className={styles.adminUserMeta}>
                  <span className={styles.adminUserName}>{displayName || 'Admin'}</span>
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
                    placeholder="Tìm bình luận, người đăng hoặc người báo cáo"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className={`${styles.formInput} ${styles.searchInput}`}
                  />
                </form>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setPage(0);
                    setStatusFilter(event.target.value as CommentReportStatusFilter);
                  }}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="CHECKING">Đang kiểm tra</option>
                  <option value="RESOLVED">Đã xử lý</option>
                  <option value="REJECTED">Bác bỏ</option>
                </select>

                <select
                  value={commentReasonFilter}
                  onChange={(event) => {
                    setPage(0);
                    setCommentReasonFilter(event.target.value as CommentReportReasonFilter);
                  }}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả lý do</option>
                  <option value="SPAM">Spam / Quảng cáo</option>
                  <option value="HARASSMENT">Xúc phạm / Độc hại</option>
                  <option value="SPOILER">Tiết lộ nội dung (Spoiler)</option>
                  <option value="HATE_SPEECH">Phát ngôn thù ghét</option>
                  <option value="OTHER">Lý do khác</option>
                </select>
              </div>
            </div>

            <div className={`${styles.userTablePanel} ${styles.mangaTablePanel}`}>
              <div className={styles.tableFrame}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th className={styles.idColumn}>ID</th>
                      <th className={styles.mangaInfoColumn}>Bình luận / Truyện</th>
                      <th className={styles.roleColumn}>Lý do báo cáo</th>
                      <th className={styles.statusColumn}>Status</th>
                      <th className={styles.actionColumn}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commentReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.emptyCell}>
                          {loading ? 'Đang tải báo cáo...' : errorMessage || 'Không có dữ liệu hiển thị.'}
                        </td>
                      </tr>
                    ) : (
                      commentReports.map((report) => (
                        <tr key={report.id}>
                          <td className={styles.idCell}>{report.id}</td>
                          <td>
                            <span className={styles.userName} style={{ maxWidth: '420px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                              "<CommentText content={report.commentContent} />"
                            </span>
                            <span className={styles.userEmail}>
                              bởi {report.commentAuthorUsername} • {report.mangaTitle} {report.chapterNumber ? `(Chap ${report.chapterNumber})` : ''}
                            </span>
                          </td>
                          <td>{commentReasonLabels[report.reason] || report.reason}</td>
                          <td>
                            <span className={`${styles.plainStatus} ${
                              report.status === 'REJECTED'
                                ? styles.dotDanger
                                : report.status === 'RESOLVED'
                                  ? styles.dotSuccess
                                  : styles.statusPendingText
                            }`}>
                              {statusLabels[report.status]}
                            </span>
                          </td>
                          <td>
                            <div className={styles.iconActions}>
                              <button type="button" className={styles.iconBtn} onClick={() => openCommentReport(report)} aria-label="Xem chi tiết báo cáo">
                                <Eye size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {commentReportPage && commentReportPage.totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.btnPage}
                    disabled={!canGoPrevious || loading}
                    onClick={() => goToPage(page - 1)}
                  >
                    Trước
                  </button>
                  <span className={styles.pageCount}>
                    {commentReportPage.number + 1}/{commentReportPage.totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.btnPage}
                    disabled={!canGoNext || loading}
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

      {selectedCommentReport && (
        <CommentReportDetailModal
          report={selectedCommentReport}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onReview={updateCommentReportReview}
          onClose={() => {
            setSelectedCommentReport(null);
            setRejectReason('');
          }}
        />
      )}
    </div>
  );
};
