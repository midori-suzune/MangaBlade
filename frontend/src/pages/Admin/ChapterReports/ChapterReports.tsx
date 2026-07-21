import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  FileCheck,
  FileText,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { adminChapterReportApi } from '../../../api/adminChapterReportApi';
import type { AdminChapterReportItem, AdminChapterReportStatus, AdminChapterReportType } from '../../../api/adminChapterReportApi';
import type { SpringPageResponse } from '../../../types/user';
import styles from '../Admin.module.css';

type ChapterReportStatusFilter = 'ALL' | AdminChapterReportStatus;
type ChapterReportTypeFilter = 'ALL' | AdminChapterReportType;
const REPORT_TABLE_PAGE_SIZE = 10;

const statusLabels: Record<AdminChapterReportStatus, string> = {
  PENDING: 'Chờ xử lý',
  CHECKING: 'Đang kiểm tra',
  RESOLVED: 'Đã xử lý',
  REJECTED: 'Từ chối',
};

const typeLabels: Record<Exclude<ChapterReportTypeFilter, 'ALL'>, string> = {
  IMAGE_BROKEN: 'Ảnh lỗi',
  MISSING_PAGE: 'Thiếu trang',
  WRONG_ORDER: 'Sai thứ tự',
  DUPLICATE_CHAPTER: 'Trùng chương',
  WRONG_CONTENT: 'Nội dung sai',
};

interface ReportDetailModalProps {
  report: AdminChapterReportItem;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  onStatusChange: (status: AdminChapterReportStatus) => void;
  onClose: () => void;
}

function ReportDetailModal({ report, rejectReason, setRejectReason, onStatusChange, onClose }: ReportDetailModalProps) {
  const chapterPath = `/manga/${report.mangaSlug}/c/${report.chapterNumber}`;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Chi tiết báo cáo lỗi chương</h3>
          <button onClick={onClose} className={styles.modalClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Truyện:</span>
            <span className={styles.detailValue}>{report.mangaTitle}</span>

            <span className={styles.detailLabel}>Chương:</span>
            <span className={styles.detailValue}>Chapter {report.chapterNumber} - {report.chapterTitle}</span>

            <span className={styles.detailLabel}>Loại lỗi:</span>
            <span className={styles.detailValue}>{typeLabels[report.type]}</span>

            <span className={styles.detailLabel}>Người báo cáo:</span>
            <span className={styles.detailValue}>{report.reporter}</span>

            <span className={styles.detailLabel}>Status:</span>
            <span className={styles.detailValue}>{statusLabels[report.status]}</span>
          </div>

          <div className={styles.reportDescription}>
            <span>Mô tả</span>
            <p>{report.description}</p>
          </div>

          {report.status === 'REJECTED' && report.rejectReason && (
            <div className={styles.rejectBox}>
              Lý do từ chối: {report.rejectReason}
            </div>
          )}

          <div className={styles.rejectForm}>
            <label className={styles.rejectLabel} htmlFor="chapter-report-reject-reason">Lý do từ chối</label>
            <textarea
              id="chapter-report-reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className={`${styles.formInput} ${styles.textarea}`}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnOutline} onClick={() => window.open(chapterPath, '_blank')}>
              <Eye size={15} /> <span>Mở chương</span>
            </button>
            <button type="button" className={styles.btnOutline} onClick={() => onStatusChange('CHECKING')}>
              <AlertTriangle size={15} /> <span>Đang kiểm tra</span>
            </button>
            <button type="button" className={styles.btnPrimary} onClick={() => onStatusChange('RESOLVED')}>
              <Check size={15} /> <span>Đã xử lý</span>
            </button>
            <button type="button" className={styles.btnDangerOutline} onClick={() => onStatusChange('REJECTED')}>
              <X size={15} /> <span>Từ chối</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ChapterReports: React.FC = () => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();
  const [reports, setReports] = useState<AdminChapterReportItem[]>([]);
  const [reportPage, setReportPage] = useState<SpringPageResponse<AdminChapterReportItem> | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChapterReportStatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<ChapterReportTypeFilter>('ALL');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedReport, setSelectedReport] = useState<AdminChapterReportItem | null>(null);
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
      const response = await adminChapterReportApi.getReports({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        search: search || undefined,
        page: nextPage,
        size: REPORT_TABLE_PAGE_SIZE,
      });
      setReports(response.data.content);
      setReportPage(response.data);
    } catch (error) {
      console.error('Lỗi khi tải báo cáo lỗi chương:', error);
      setReports([]);
      setReportPage(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    Promise.resolve().then(() => fetchReports());
  }, [fetchReports]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const formatDate = (value: string) => new Date(value).toLocaleDateString('vi-VN');

  const openReport = (report: AdminChapterReportItem) => {
    setSelectedReport(report);
    setRejectReason(report.rejectReason || '');
  };

  const updateReportStatus = async (status: AdminChapterReportStatus) => {
    if (!selectedReport) return;
    if (status === 'REJECTED' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      const response = await adminChapterReportApi.reviewReport(
        selectedReport.id,
        status,
        status === 'REJECTED' ? rejectReason.trim() : undefined,
      );
      setReports((current) => current.map((report) => (
        report.id === selectedReport.id ? response.data : report
      )));
      setSelectedReport(response.data);
      if (status !== 'REJECTED') {
        setRejectReason('');
      }
      await fetchReports(page);
    } catch (error) {
      console.error('Lỗi khi cập nhật báo cáo lỗi chương:', error);
      alert(getErrorMessage(error));
    }
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
  };

  const canGoPrevious = Boolean(reportPage && !reportPage.first);
  const canGoNext = Boolean(reportPage && !reportPage.last);

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
            <button className={`${styles.adminNavItem} ${styles.active}`} onClick={() => navigate('/admin/chapter-reports')}>
              <AlertTriangle size={16} /> Báo cáo lỗi chương
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/author-requests')}>
              <FileText size={16} /> Đơn đăng ký Tác giả
            </button>
          </nav>

          <main className={styles.adminContent}>
            <div className={styles.pageTitleSection}>
              <div>
                <h2 className={styles.pageTitle}>Báo cáo lỗi chương</h2>
                <p className={styles.pageSubtitle}>
                  Xem và xử lý các báo cáo lỗi người đọc gửi về từng chương.
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
                    placeholder="Tìm truyện, chương hoặc người báo cáo"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className={`${styles.formInput} ${styles.searchInput}`}
                  />
                </form>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setPage(0);
                    setStatusFilter(event.target.value as ChapterReportStatusFilter);
                  }}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="CHECKING">Đang kiểm tra</option>
                  <option value="RESOLVED">Đã xử lý</option>
                  <option value="REJECTED">Từ chối</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) => {
                    setPage(0);
                    setTypeFilter(event.target.value as ChapterReportTypeFilter);
                  }}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả lỗi</option>
                  <option value="IMAGE_BROKEN">Ảnh lỗi</option>
                  <option value="MISSING_PAGE">Thiếu trang</option>
                  <option value="WRONG_ORDER">Sai thứ tự</option>
                  <option value="DUPLICATE_CHAPTER">Trùng chương</option>
                </select>
              </div>
            </div>

            <div className={`${styles.userTablePanel} ${styles.mangaTablePanel}`}>
              <div className={styles.tableFrame}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th className={styles.idColumn}>ID</th>
                      <th className={styles.mangaInfoColumn}>Truyện / Chương</th>
                      <th className={styles.roleColumn}>Loại lỗi</th>
                      <th className={styles.usernameColumn}>Người báo cáo</th>
                      <th className={styles.statusColumn}>Status</th>
                      <th className={styles.dateColumn}>Created At</th>
                      <th className={styles.actionColumn}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={styles.emptyCell}>
                          {loading ? 'Đang tải báo cáo...' : errorMessage || 'Không có dữ liệu hiển thị.'}
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id}>
                          <td className={styles.idCell}>{report.id}</td>
                          <td>
                            <span className={styles.userName}>{report.mangaTitle}</span>
                            <span className={styles.userEmail}>Chapter {report.chapterNumber} - {report.chapterTitle}</span>
                          </td>
                          <td>{typeLabels[report.type]}</td>
                          <td className={styles.truncateCell}>{report.reporter}</td>
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
                          <td>{formatDate(report.createdAt)}</td>
                          <td>
                            <div className={styles.iconActions}>
                              <button type="button" className={styles.iconBtn} onClick={() => openReport(report)} aria-label="Xem chi tiết báo cáo">
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

              {reportPage && reportPage.totalPages > 1 && (
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
                    {reportPage.number + 1}/{reportPage.totalPages}
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

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onStatusChange={updateReportStatus}
          onClose={() => {
            setSelectedReport(null);
            setRejectReason('');
          }}
        />
      )}
    </div>
  );
};
