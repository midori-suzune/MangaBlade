import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  FileText,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import styles from '../Admin.module.css';

type ChapterReportStatus = 'PENDING' | 'CHECKING' | 'RESOLVED' | 'REJECTED';
type ChapterReportStatusFilter = 'ALL' | ChapterReportStatus;
type ChapterReportTypeFilter = 'ALL' | 'IMAGE_BROKEN' | 'MISSING_PAGE' | 'WRONG_ORDER' | 'DUPLICATE_CHAPTER' | 'WRONG_CONTENT';

interface ChapterReportItem {
  id: number;
  mangaTitle: string;
  mangaSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  type: Exclude<ChapterReportTypeFilter, 'ALL'>;
  reporter: string;
  description: string;
  status: ChapterReportStatus;
  createdAt: string;
  screenshotUrl?: string;
  rejectReason?: string;
}

const prototypeReports: ChapterReportItem[] = [
  {
    id: 1008,
    mangaTitle: 'Đảo Hải Tặc',
    mangaSlug: 'one-piece',
    chapterNumber: 1121,
    chapterTitle: 'Tương lai của biển cả',
    type: 'IMAGE_BROKEN',
    reporter: 'dinhLam728',
    description: 'Trang 8 và trang 9 không tải được ảnh.',
    status: 'PENDING',
    createdAt: '2026-07-20T09:12:00',
    screenshotUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 1007,
    mangaTitle: 'Toàn Trí Độc Giả',
    mangaSlug: 'toan-tri-doc-gia',
    chapterNumber: 217,
    chapterTitle: 'Kịch bản cuối',
    type: 'MISSING_PAGE',
    reporter: 'blade_reader',
    description: 'Thiếu đoạn cuối chương, chuyển trang là sang chapter khác.',
    status: 'CHECKING',
    createdAt: '2026-07-20T08:40:00',
  },
  {
    id: 1006,
    mangaTitle: 'Tôi Thăng Cấp Một Mình',
    mangaSlug: 'toi-thang-cap-mot-minh',
    chapterNumber: 201,
    chapterTitle: 'Kết thúc',
    type: 'WRONG_ORDER',
    reporter: 'vquang3246',
    description: 'Thứ tự ảnh bị đảo từ trang 14.',
    status: 'PENDING',
    createdAt: '2026-07-19T21:05:00',
  },
  {
    id: 1005,
    mangaTitle: 'Hướng Dẫn Sinh Tồn Trong Học Viện',
    mangaSlug: 'huong-dan-sinh-ton-trong-hoc-vien',
    chapterNumber: 86,
    chapterTitle: 'Bài kiểm tra thứ ba',
    type: 'DUPLICATE_CHAPTER',
    reporter: 'chuHieu457',
    description: 'Chapter này trùng nội dung với chương 85.',
    status: 'RESOLVED',
    createdAt: '2026-07-19T16:22:00',
  },
  {
    id: 1004,
    mangaTitle: 'Lưỡi Kiếm Vụn',
    mangaSlug: 'luoi-kiem-vun',
    chapterNumber: 12,
    chapterTitle: 'Vết nứt',
    type: 'WRONG_CONTENT',
    reporter: 'reader_07',
    description: 'Nội dung không đúng với tên chương.',
    status: 'REJECTED',
    createdAt: '2026-07-18T11:30:00',
    rejectReason: 'Đã kiểm tra, nội dung đúng bản tác giả gửi.',
  },
];

const statusLabels: Record<ChapterReportStatus, string> = {
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
  report: ChapterReportItem;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  onZoomImage: (imageUrl: string) => void;
  onStatusChange: (status: ChapterReportStatus) => void;
  onClose: () => void;
}

function ReportDetailModal({ report, rejectReason, setRejectReason, onZoomImage, onStatusChange, onClose }: ReportDetailModalProps) {
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

          {report.screenshotUrl && (
            <div className={styles.reportScreenshot}>
              <span>Ảnh đính kèm</span>
              <button type="button" className={styles.reportScreenshotButton} onClick={() => onZoomImage(report.screenshotUrl!)}>
                <img src={report.screenshotUrl} alt="" />
              </button>
            </div>
          )}

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
  const [reports, setReports] = useState<ChapterReportItem[]>(prototypeReports);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChapterReportStatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<ChapterReportTypeFilter>('ALL');
  const [selectedReport, setSelectedReport] = useState<ChapterReportItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesSearch = !normalizedSearch
        || report.mangaTitle.toLowerCase().includes(normalizedSearch)
        || report.chapterTitle.toLowerCase().includes(normalizedSearch)
        || report.reporter.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || report.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reports, search, statusFilter, typeFilter]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  const formatDate = (value: string) => new Date(value).toLocaleDateString('vi-VN');

  const openReport = (report: ChapterReportItem) => {
    setSelectedReport(report);
    setRejectReason(report.rejectReason || '');
  };

  const updateReportStatus = (status: ChapterReportStatus) => {
    if (!selectedReport) return;
    if (status === 'REJECTED' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    const updatedReport: ChapterReportItem = {
      ...selectedReport,
      status,
      rejectReason: status === 'REJECTED' ? rejectReason.trim() : undefined,
    };

    setReports((current) => current.map((report) => (
      report.id === selectedReport.id ? updatedReport : report
    )));
    setSelectedReport(updatedReport);
    if (status !== 'REJECTED') {
      setRejectReason('');
    }
  };

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
                  onChange={(event) => setStatusFilter(event.target.value as ChapterReportStatusFilter)}
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
                  onChange={(event) => setTypeFilter(event.target.value as ChapterReportTypeFilter)}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả lỗi</option>
                  <option value="IMAGE_BROKEN">Ảnh lỗi</option>
                  <option value="MISSING_PAGE">Thiếu trang</option>
                  <option value="WRONG_ORDER">Sai thứ tự</option>
                  <option value="DUPLICATE_CHAPTER">Trùng chương</option>
                  <option value="WRONG_CONTENT">Nội dung sai</option>
                </select>
              </div>
            </div>

            <div className={styles.userTablePanel}>
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
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={styles.emptyCell}>
                          Không có dữ liệu hiển thị.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => (
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
            </div>
          </main>
        </section>
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onZoomImage={setZoomImageUrl}
          onStatusChange={updateReportStatus}
          onClose={() => {
            setSelectedReport(null);
            setRejectReason('');
          }}
        />
      )}
      {zoomImageUrl && (
        <div className={styles.imageZoomBackdrop} onClick={() => setZoomImageUrl(null)}>
          <button type="button" className={styles.imageZoomClose} onClick={() => setZoomImageUrl(null)}>
            &times;
          </button>
          <img src={zoomImageUrl} alt="" className={styles.imageZoomPreview} />
        </div>
      )}
    </div>
  );
};
