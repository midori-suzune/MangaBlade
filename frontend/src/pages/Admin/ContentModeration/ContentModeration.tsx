import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCheck,
  FileText,
  Layers,
  MessageSquare,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import {
  adminContentModerationApi,
  type AdminModerationChapter,
  type AdminModerationManga,
  type ModerationStatus,
} from '../../../api/adminContentModerationApi';
import styles from '../Admin.module.css';

type ReviewStatus = ModerationStatus;
type ReviewStatusFilter = 'ALL' | ReviewStatus;
type ReviewScope = 'manga' | 'chapter';
const MODERATION_PAGE_SIZE = 50;
const FALLBACK_COVER = 'https://via.placeholder.com/150x200?text=No+Cover';

interface ReviewChapter {
  id: number;
  chapterNumber: string;
  title: string;
  pageCount: number;
  approvalStatus: ReviewStatus;
  submittedAt: string | null;
  rejectionReason?: string;
  previewPages: string[];
}

interface ReviewManga {
  id: number;
  title: string;
  slug: string;
  originName: string | null;
  description: string;
  authorName: string;
  authorEmail: string;
  status: string;
  approvalStatus: ReviewStatus;
  categoryNames: string[];
  chapterCount: number;
  submittedAt: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string;
  thumbnail: string;
  chapters: ReviewChapter[];
}

interface ChapterReviewItem extends ReviewChapter {
  mangaId: number;
  mangaTitle: string;
  mangaSlug: string;
  authorName: string;
  thumbnail: string;
}

const statusLabels: Record<ReviewStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

function getStatusClass(status: ReviewStatus) {
  if (status === 'APPROVED') return styles.dotSuccess;
  if (status === 'REJECTED') return styles.dotDanger;
  return styles.statusPendingText;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
}

interface MangaReviewModalProps {
  manga: ReviewManga;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  onReview: (status: ReviewStatus) => void;
  onOpenChapter: (chapter: ChapterReviewItem) => void;
  onClose: () => void;
}

function MangaReviewModal({ manga, rejectReason, setRejectReason, onReview, onOpenChapter, onClose }: MangaReviewModalProps) {
  const pendingChapters = manga.chapters.filter((chapter) => chapter.approvalStatus === 'PENDING').length;

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modalCard} ${styles.moderationModalCard}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Kiểm duyệt truyện tác giả</h3>
          <button onClick={onClose} className={styles.modalClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.moderationDetailHeader}>
            <img src={manga.thumbnail} alt="" className={styles.moderationCoverLarge} />
            <div className={styles.moderationDetailMeta}>
              <span className={`${styles.dotStatus} ${getStatusClass(manga.approvalStatus)}`}>
                {statusLabels[manga.approvalStatus]}
              </span>
              <h4>{manga.title}</h4>
              <p>{manga.description}</p>
            </div>
          </div>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Tác giả:</span>
            <span className={styles.detailValue}>{manga.authorName}</span>
            <span className={styles.detailLabel}>Trạng thái truyện:</span>
            <span className={styles.detailValue}>{manga.status}</span>
            <span className={styles.detailLabel}>Thể loại:</span>
            <span className={styles.detailValue}>{manga.categoryNames.join(', ')}</span>
            <span className={styles.detailLabel}>Chương:</span>
            <span className={styles.detailValue}>{manga.chapterCount} chương, {pendingChapters} chờ duyệt</span>
            <span className={styles.detailLabel}>Ngày gửi:</span>
            <span className={styles.detailValue}>{formatDate(manga.submittedAt)}</span>
          </div>
          {manga.rejectionReason && (
            <div className={styles.rejectBox}>Lý do từ chối: {manga.rejectionReason}</div>
          )}
          <div className={styles.moderationSectionTitle}>Chapter trong truyện</div>
          <div className={styles.chapterReviewList}>
            {manga.chapters.map((chapter) => (
              <button
                type="button"
                className={styles.chapterReviewItem}
                key={chapter.id}
                onClick={() => onOpenChapter({
                  ...chapter,
                  mangaId: manga.id,
                  mangaTitle: manga.title,
                  mangaSlug: manga.slug,
                  authorName: manga.authorName,
                  thumbnail: manga.thumbnail,
                })}
              >
                <span>
                  <strong>Chapter {chapter.chapterNumber}</strong>
                  <small>{chapter.title}</small>
                </span>
                <span className={`${styles.plainStatus} ${getStatusClass(chapter.approvalStatus)}`}>
                  {statusLabels[chapter.approvalStatus]}
                </span>
              </button>
            ))}
          </div>
          <div className={styles.rejectForm}>
            <label className={styles.rejectLabel} htmlFor="manga-review-reject">Lý do từ chối truyện</label>
            <textarea
              id="manga-review-reject"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className={`${styles.formInput} ${styles.textarea}`}
              placeholder="Nhập lý do nếu từ chối truyện..."
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnPrimary} onClick={() => onReview('APPROVED')}>
              <Check size={15} /> <span>Duyệt truyện</span>
            </button>
            <button type="button" className={styles.btnDangerOutline} onClick={() => onReview('REJECTED')}>
              <X size={15} /> <span>Từ chối truyện</span>
            </button>
            <button type="button" className={styles.btnOutline} onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChapterReviewModalProps {
  chapter: ChapterReviewItem;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  onReview: (status: ReviewStatus) => void;
  onClose: () => void;
}

function ChapterReviewModal({ chapter, rejectReason, setRejectReason, onReview, onClose }: ChapterReviewModalProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const activePreviewUrl = chapter.previewPages[previewIndex];
  const hasMultiplePages = chapter.previewPages.length > 1;
  const goPrevPage = () => {
    setPreviewIndex((current) => (
      current === 0 ? chapter.previewPages.length - 1 : current - 1
    ));
  };
  const goNextPage = () => {
    setPreviewIndex((current) => (
      current === chapter.previewPages.length - 1 ? 0 : current + 1
    ));
  };

  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrevPage();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNextPage();
      }
      if (event.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreviewOpen, chapter.previewPages.length]);

  return (
    <>
      <div className={styles.modalBackdrop}>
        <div className={`${styles.modalCard} ${styles.moderationModalCard}`}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Kiểm duyệt chapter</h3>
            <button onClick={onClose} className={styles.modalClose}>
              &times;
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.mangaModalHeader}>
              <img src={chapter.thumbnail} alt="" className={styles.mangaModalThumb} />
              <div>
                <div className={styles.userDetailName}>{chapter.mangaTitle}</div>
                <div className={styles.userDetailEmail}>Chapter {chapter.chapterNumber} - {chapter.title}</div>
              </div>
            </div>
            <div className={styles.detailGrid}>
              <span className={styles.detailLabel}>Tác giả:</span>
              <span className={styles.detailValue}>{chapter.authorName}</span>
              <span className={styles.detailLabel}>Slug:</span>
              <span className={styles.detailValue}>{chapter.mangaSlug}</span>
              <span className={styles.detailLabel}>Số trang:</span>
              <span className={styles.detailValue}>{chapter.pageCount}</span>
              <span className={styles.detailLabel}>Ngày gửi:</span>
              <span className={styles.detailValue}>{formatDate(chapter.submittedAt)}</span>
              <span className={styles.detailLabel}>Trạng thái:</span>
              <span className={`${styles.detailValue} ${styles.plainStatus} ${getStatusClass(chapter.approvalStatus)}`}>
                {statusLabels[chapter.approvalStatus]}
              </span>
            </div>
            {chapter.rejectionReason && (
              <div className={styles.rejectBox}>Lý do từ chối: {chapter.rejectionReason}</div>
            )}
          {chapter.previewPages.length > 0 ? (
            <button
              type="button"
              className={styles.moderationPreviewTrigger}
              onClick={() => {
                setPreviewIndex(0);
                setIsPreviewOpen(true);
              }}
            >
              Preview trang truyện
              <span>{chapter.previewPages.length} trang</span>
            </button>
          ) : (
            <div className={styles.rejectBox}>Chapter này chưa có ảnh trang để kiểm tra.</div>
          )}
            <div className={styles.rejectForm}>
              <label className={styles.rejectLabel} htmlFor="chapter-review-reject">Lý do từ chối chapter</label>
              <textarea
                id="chapter-review-reject"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                className={`${styles.formInput} ${styles.textarea}`}
                placeholder="Nhập lý do nếu từ chối chapter..."
              />
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnPrimary} onClick={() => onReview('APPROVED')}>
                <Check size={15} /> <span>Duyệt chapter</span>
              </button>
              <button type="button" className={styles.btnDangerOutline} onClick={() => onReview('REJECTED')}>
                <X size={15} /> <span>Từ chối chapter</span>
              </button>
              <button type="button" className={styles.btnOutline} onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
      {isPreviewOpen && (
        <div className={styles.chapterReaderPreview}>
          <div className={styles.chapterReaderPreviewInner}>
            <div className={styles.chapterReaderTopbar}>
              <div>
              <strong>{chapter.mangaTitle}</strong>
              <span>Chapter {chapter.chapterNumber} - {chapter.title}</span>
            </div>
            <span>Trang {previewIndex + 1} / {chapter.previewPages.length}</span>
            <button type="button" onClick={() => setIsPreviewOpen(false)}>
              Đóng
            </button>
          </div>
          <div className={styles.chapterReaderCanvas}>
            {hasMultiplePages && (
              <button type="button" className={`${styles.chapterReaderNav} ${styles.chapterReaderPrev}`} onClick={goPrevPage} aria-label="Trang trước">
                <ChevronLeft size={28} />
              </button>
            )}
            {activePreviewUrl && (
              <figure className={styles.chapterReaderPage}>
                <img src={activePreviewUrl} alt="" />
              </figure>
            )}
            {hasMultiplePages && (
              <button type="button" className={`${styles.chapterReaderNav} ${styles.chapterReaderNext}`} onClick={goNextPage} aria-label="Trang sau">
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </>
  );
}

export const ContentModeration: React.FC = () => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();
  const [scope, setScope] = useState<ReviewScope>('manga');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>('PENDING');
  const [mangaReviews, setMangaReviews] = useState<ReviewManga[]>([]);
  const [chapterReviews, setChapterReviews] = useState<ChapterReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingMangaCount, setPendingMangaCount] = useState(0);
  const [pendingChapterCount, setPendingChapterCount] = useState(0);
  const [approvedContentCount, setApprovedContentCount] = useState(0);
  const [selectedManga, setSelectedManga] = useState<ReviewManga | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterReviewItem | null>(null);
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

  const mapChapter = (chapter: AdminModerationChapter): ChapterReviewItem => ({
    ...chapter,
    title: chapter.title || '',
    rejectionReason: chapter.rejectionReason || undefined,
    thumbnail: chapter.thumbnail || FALLBACK_COVER,
  });

  const mapManga = (manga: AdminModerationManga): ReviewManga => ({
    ...manga,
    description: manga.description || '',
    rejectionReason: manga.rejectionReason || undefined,
    thumbnail: manga.thumbnail || FALLBACK_COVER,
    chapters: manga.chapters.map(mapChapter),
  });

  const loadSummary = useCallback(async () => {
    try {
      const [pendingManga, pendingChapters, approvedManga, approvedChapters] = await Promise.all([
        adminContentModerationApi.getManga({ status: 'PENDING', page: 0, size: 1 }),
        adminContentModerationApi.getChapters({ status: 'PENDING', page: 0, size: 1 }),
        adminContentModerationApi.getManga({ status: 'APPROVED', page: 0, size: 1 }),
        adminContentModerationApi.getChapters({ status: 'APPROVED', page: 0, size: 1 }),
      ]);

      setPendingMangaCount(pendingManga.data.totalElements);
      setPendingChapterCount(pendingChapters.data.totalElements);
      setApprovedContentCount(approvedManga.data.totalElements + approvedChapters.data.totalElements);
    } catch (error) {
      console.error('Lỗi khi tải thống kê kiểm duyệt:', error);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search || undefined,
        page: 0,
        size: MODERATION_PAGE_SIZE,
      };

      if (scope === 'manga') {
        const response = await adminContentModerationApi.getManga(params);
        setMangaReviews(response.data.content.map(mapManga));
      } else {
        const response = await adminContentModerationApi.getChapters(params);
        setChapterReviews(response.data.content.map(mapChapter));
      }
    } catch (error) {
      console.error('Lỗi khi tải nội dung kiểm duyệt:', error);
      alert(getErrorMessage(error));
      if (scope === 'manga') {
        setMangaReviews([]);
      } else {
        setChapterReviews([]);
      }
    } finally {
      setLoading(false);
    }
  }, [scope, search, statusFilter]);

  useEffect(() => {
    Promise.resolve().then(() => loadSummary());
  }, [loadSummary]);

  useEffect(() => {
    Promise.resolve().then(() => loadReviews());
  }, [loadReviews]);

  const filteredManga = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return mangaReviews.filter((manga) => {
      const matchesSearch = !normalizedSearch
        || manga.title.toLowerCase().includes(normalizedSearch)
        || manga.slug.toLowerCase().includes(normalizedSearch)
        || manga.authorName.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || manga.approvalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mangaReviews, search, statusFilter]);

  const filteredChapters = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return chapterReviews.filter((chapter) => {
      const matchesSearch = !normalizedSearch
        || chapter.mangaTitle.toLowerCase().includes(normalizedSearch)
        || chapter.title.toLowerCase().includes(normalizedSearch)
        || chapter.authorName.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || chapter.approvalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [chapterReviews, search, statusFilter]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  const reviewManga = async (status: ReviewStatus) => {
    if (!selectedManga) return;
    if (status === 'REJECTED' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối truyện.');
      return;
    }

    try {
      const response = await adminContentModerationApi.reviewManga(
        selectedManga.id,
        status,
        status === 'REJECTED' ? rejectReason.trim() : undefined,
      );
      const updatedManga = mapManga(response.data);

      setMangaReviews((current) => current.map((manga) => (
        manga.id === selectedManga.id ? updatedManga : manga
      )));
      setSelectedManga(updatedManga);
      if (status !== 'REJECTED') setRejectReason('');
      await loadSummary();
    } catch (error) {
      console.error('Lỗi khi kiểm duyệt truyện:', error);
      alert(getErrorMessage(error));
    }
  };

  const reviewChapter = async (status: ReviewStatus) => {
    if (!selectedChapter) return;
    if (status === 'REJECTED' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối chapter.');
      return;
    }

    try {
      const response = await adminContentModerationApi.reviewChapter(
        selectedChapter.id,
        status,
        status === 'REJECTED' ? rejectReason.trim() : undefined,
      );
      const updatedChapter = mapChapter(response.data);

      setChapterReviews((current) => current.map((chapter) => (
        chapter.id === selectedChapter.id ? updatedChapter : chapter
      )));
      setMangaReviews((current) => current.map((manga) => (
        manga.id !== selectedChapter.mangaId
          ? manga
          : {
              ...manga,
              chapters: manga.chapters.map((chapter) => (
                chapter.id === selectedChapter.id ? updatedChapter : chapter
              )),
            }
      )));
      setSelectedChapter(updatedChapter);
      if (status !== 'REJECTED') setRejectReason('');
      await loadSummary();
    } catch (error) {
      console.error('Lỗi khi kiểm duyệt chapter:', error);
      alert(getErrorMessage(error));
    }
  };

  const openManga = (manga: ReviewManga) => {
    setSelectedManga(manga);
    setSelectedChapter(null);
    setRejectReason(manga.rejectionReason || '');
  };

  const openChapter = (chapter: ChapterReviewItem) => {
    setSelectedChapter(chapter);
    setRejectReason(chapter.rejectionReason || '');
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
            <button className={`${styles.adminNavItem} ${styles.active}`} onClick={() => navigate('/admin/content-moderation')}>
              <FileCheck size={16} /> Kiểm duyệt nội dung
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/chapter-reports')}>
              <AlertTriangle size={16} /> Báo cáo lỗi chương
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/comment-reports')}>
              <MessageSquare size={16} /> Báo cáo bình luận
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/author-requests')}>
              <FileText size={16} /> Đơn đăng ký Tác giả
            </button>
          </nav>

          <main className={styles.adminContent}>
            <div className={styles.pageTitleSection}>
              <div>
                <h2 className={styles.pageTitle}>Kiểm duyệt nội dung</h2>
                <p className={styles.pageSubtitle}>
                  Duyệt hoặc từ chối truyện và từng chapter do tác giả gửi lên trước khi public.
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

            <section className={styles.moderationSummaryGrid}>
              <article>
                <span>Truyện chờ duyệt</span>
                <strong>{pendingMangaCount}</strong>
              </article>
              <article>
                <span>Chapter chờ duyệt</span>
                <strong>{pendingChapterCount}</strong>
              </article>
              <article>
                <span>Nội dung đã duyệt</span>
                <strong>{approvedContentCount}</strong>
              </article>
            </section>

            <div className={styles.tableToolbar}>
              <div className={styles.tableToolbarLeft}>
                <div className={styles.moderationTabs}>
                  <button type="button" className={scope === 'manga' ? styles.active : ''} onClick={() => setScope('manga')}>
                    <BookOpen size={15} /> Truyện
                  </button>
                  <button type="button" className={scope === 'chapter' ? styles.active : ''} onClick={() => setScope('chapter')}>
                    <Layers size={15} /> Chapter
                  </button>
                </div>
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                  <input
                    type="text"
                    placeholder={scope === 'manga' ? 'Tìm truyện, slug hoặc tác giả' : 'Tìm truyện, chapter hoặc tác giả'}
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className={`${styles.formInput} ${styles.searchInput}`}
                  />
                </form>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as ReviewStatusFilter)}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="APPROVED">Đã duyệt</option>
                  <option value="REJECTED">Từ chối</option>
                </select>
              </div>
            </div>

            <div className={styles.userTablePanel}>
              <div className={styles.tableFrame}>
                {scope === 'manga' ? (
                  <table className={`${styles.historyTable} ${styles.mangaTable}`}>
                    <thead>
                      <tr>
                        <th className={styles.idColumn}>ID</th>
                        <th className={styles.mangaInfoColumn}>Truyện</th>
                        <th className={styles.usernameColumn}>Tác giả</th>
                        <th className={styles.roleColumn}>Thể loại</th>
                        <th className={styles.statusColumn}>Duyệt</th>
                        <th className={styles.roleColumn}>Chapters</th>
                        <th className={styles.dateColumn}>Submitted</th>
                        <th className={styles.actionColumn}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredManga.length === 0 ? (
                        <tr>
                          <td colSpan={8} className={styles.emptyCell}>
                            {loading ? 'Đang tải dữ liệu kiểm duyệt...' : 'Không có dữ liệu hiển thị.'}
                          </td>
                        </tr>
                      ) : (
                        filteredManga.map((manga) => (
                          <tr key={manga.id}>
                            <td className={styles.idCell}>{manga.id}</td>
                            <td>
                              <div className={styles.mangaInfoCell}>
                                <div className={styles.mangaInfoText}>
                                  <span className={styles.userName}>{manga.title}</span>
                                  <span className={styles.userEmail}>{manga.slug}</span>
                                </div>
                              </div>
                            </td>
                            <td className={styles.truncateCell}>{manga.authorName}</td>
                            <td className={styles.truncateCell}>{manga.categoryNames.join(', ')}</td>
                            <td>
                              <span className={`${styles.plainStatus} ${getStatusClass(manga.approvalStatus)}`}>
                                {statusLabels[manga.approvalStatus]}
                              </span>
                            </td>
                            <td>{manga.chapterCount}</td>
                            <td>{formatDate(manga.submittedAt)}</td>
                            <td>
                              <div className={styles.iconActions}>
                                <button type="button" className={styles.iconBtn} onClick={() => openManga(manga)} aria-label="Xem chi tiết truyện">
                                  <Eye size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        <th className={styles.idColumn}>ID</th>
                        <th className={styles.mangaInfoColumn}>Truyện / Chapter</th>
                        <th className={styles.usernameColumn}>Tác giả</th>
                        <th className={styles.roleColumn}>Pages</th>
                        <th className={styles.statusColumn}>Duyệt</th>
                        <th className={styles.dateColumn}>Submitted</th>
                        <th className={styles.actionColumn}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChapters.length === 0 ? (
                        <tr>
                          <td colSpan={7} className={styles.emptyCell}>
                            {loading ? 'Đang tải dữ liệu kiểm duyệt...' : 'Không có dữ liệu hiển thị.'}
                          </td>
                        </tr>
                      ) : (
                        filteredChapters.map((chapter) => (
                          <tr key={chapter.id}>
                            <td className={styles.idCell}>{chapter.id}</td>
                            <td>
                              <span className={styles.userName}>{chapter.mangaTitle}</span>
                              <span className={styles.userEmail}>Chapter {chapter.chapterNumber} - {chapter.title}</span>
                            </td>
                            <td className={styles.truncateCell}>{chapter.authorName}</td>
                            <td>{chapter.pageCount}</td>
                            <td>
                              <span className={`${styles.plainStatus} ${getStatusClass(chapter.approvalStatus)}`}>
                                {statusLabels[chapter.approvalStatus]}
                              </span>
                            </td>
                            <td>{formatDate(chapter.submittedAt)}</td>
                            <td>
                              <div className={styles.iconActions}>
                                <button type="button" className={styles.iconBtn} onClick={() => openChapter(chapter)} aria-label="Xem chi tiết chapter">
                                  <Eye size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </main>
        </section>
      </div>

      {selectedManga && (
        <MangaReviewModal
          manga={selectedManga}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onReview={reviewManga}
          onOpenChapter={(chapter) => {
            setSelectedManga(null);
            openChapter(chapter);
          }}
          onClose={() => {
            setSelectedManga(null);
            setRejectReason('');
          }}
        />
      )}
      {selectedChapter && (
        <ChapterReviewModal
          chapter={selectedChapter}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onReview={reviewChapter}
          onClose={() => {
            setSelectedChapter(null);
            setRejectReason('');
          }}
        />
      )}
    </div>
  );
};
