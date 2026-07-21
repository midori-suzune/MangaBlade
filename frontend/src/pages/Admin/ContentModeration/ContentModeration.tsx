import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import styles from '../Admin.module.css';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type ReviewStatusFilter = 'ALL' | ReviewStatus;
type ReviewScope = 'manga' | 'chapter';

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

const prototypeMangaReviews: ReviewManga[] = [
  {
    id: 801,
    title: 'Lưỡi Kiếm Vụn',
    slug: 'luoi-kiem-vun',
    originName: 'Broken Blade Edge',
    description: 'Một kiếm sĩ mất linh lực cố gắng phục dựng thanh kiếm gia truyền sau trận chiến biên giới.',
    authorName: 'nguyen_author',
    authorEmail: 'author@demo.com',
    status: 'Đang tiến hành',
    approvalStatus: 'PENDING',
    categoryNames: ['Action', 'Fantasy', 'Drama'],
    chapterCount: 3,
    submittedAt: '2026-07-20T09:30:00',
    reviewedAt: null,
    thumbnail: 'https://img.otruyenapi.com/uploads/comics/blue-lock-thumb.jpg',
    chapters: [
      {
        id: 9101,
        chapterNumber: '1',
        title: 'Vết nứt đầu tiên',
        pageCount: 4,
        approvalStatus: 'PENDING',
        submittedAt: '2026-07-20T09:35:00',
        previewPages: [
          'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=500&q=80',
        ],
      },
      {
        id: 9102,
        chapterNumber: '2',
        title: 'Người canh cổng',
        pageCount: 2,
        approvalStatus: 'PENDING',
        submittedAt: '2026-07-20T10:12:00',
        previewPages: [
          'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=500&q=80',
        ],
      },
      {
        id: 9103,
        chapterNumber: '3',
        title: 'Lời thề',
        pageCount: 0,
        approvalStatus: 'REJECTED',
        submittedAt: '2026-07-20T10:45:00',
        rejectionReason: 'Chương chưa có trang ảnh.',
        previewPages: [],
      },
    ],
  },
  {
    id: 802,
    title: 'Thành Phố Sau Mưa',
    slug: 'thanh-pho-sau-mua',
    originName: null,
    description: 'Một nhóm học sinh điều tra chuỗi dị tượng xuất hiện sau cơn mưa tím kéo dài bảy ngày.',
    authorName: 'lam_writer',
    authorEmail: 'lam.writer@demo.com',
    status: 'Tạm ngưng',
    approvalStatus: 'APPROVED',
    categoryNames: ['Mystery', 'School Life'],
    chapterCount: 2,
    submittedAt: '2026-07-18T15:15:00',
    reviewedAt: '2026-07-19T08:20:00',
    thumbnail: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=500&q=80',
    chapters: [
      {
        id: 9201,
        chapterNumber: '1',
        title: 'Ngày thứ tám',
        pageCount: 5,
        approvalStatus: 'APPROVED',
        submittedAt: '2026-07-18T15:30:00',
        previewPages: [
          'https://images.unsplash.com/photo-1494883759339-0b042055a4ee?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80',
        ],
      },
      {
        id: 9202,
        chapterNumber: '2',
        title: 'Bản đồ dưới sân trường',
        pageCount: 4,
        approvalStatus: 'PENDING',
        submittedAt: '2026-07-20T06:05:00',
        previewPages: [
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=500&q=80',
        ],
      },
    ],
  },
  {
    id: 803,
    title: 'Bếp Trưởng Dị Giới',
    slug: 'bep-truong-di-gioi',
    originName: 'Isekai Chef',
    description: 'Đầu bếp trẻ mở quán ăn giữa thành phố mạo hiểm giả và dùng món ăn để giải lời nguyền.',
    authorName: 'novel_kid',
    authorEmail: 'novel@demo.com',
    status: 'Đang tiến hành',
    approvalStatus: 'REJECTED',
    categoryNames: ['Comedy', 'Fantasy'],
    chapterCount: 1,
    submittedAt: '2026-07-17T11:00:00',
    reviewedAt: '2026-07-17T14:15:00',
    rejectionReason: 'Ảnh bìa chưa đúng tỷ lệ và mô tả quá ngắn.',
    thumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80',
    chapters: [
      {
        id: 9301,
        chapterNumber: '1',
        title: 'Nồi súp đầu tiên',
        pageCount: 3,
        approvalStatus: 'APPROVED',
        submittedAt: '2026-07-17T11:30:00',
        previewPages: [
          'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=500&q=80',
        ],
      },
    ],
  },
];

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
              <span>{manga.slug}</span>
              <p>{manga.description}</p>
            </div>
          </div>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Tác giả:</span>
            <span className={styles.detailValue}>{manga.authorName} - {manga.authorEmail}</span>
            <span className={styles.detailLabel}>Tên khác:</span>
            <span className={styles.detailValue}>{manga.originName || '-'}</span>
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
  const [mangaReviews, setMangaReviews] = useState<ReviewManga[]>(prototypeMangaReviews);
  const [selectedManga, setSelectedManga] = useState<ReviewManga | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterReviewItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const chapterReviews = useMemo<ChapterReviewItem[]>(() => (
    mangaReviews.flatMap((manga) => manga.chapters.map((chapter) => ({
      ...chapter,
      mangaId: manga.id,
      mangaTitle: manga.title,
      mangaSlug: manga.slug,
      authorName: manga.authorName,
      thumbnail: manga.thumbnail,
    })))
  ), [mangaReviews]);

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

  const pendingMangaCount = mangaReviews.filter((manga) => manga.approvalStatus === 'PENDING').length;
  const pendingChapterCount = chapterReviews.filter((chapter) => chapter.approvalStatus === 'PENDING').length;
  const approvedContentCount = mangaReviews.filter((manga) => manga.approvalStatus === 'APPROVED').length
    + chapterReviews.filter((chapter) => chapter.approvalStatus === 'APPROVED').length;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  const reviewManga = (status: ReviewStatus) => {
    if (!selectedManga) return;
    if (status === 'REJECTED' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối truyện.');
      return;
    }

    const updatedManga: ReviewManga = {
      ...selectedManga,
      approvalStatus: status,
      reviewedAt: new Date().toISOString(),
      rejectionReason: status === 'REJECTED' ? rejectReason.trim() : undefined,
    };

    setMangaReviews((current) => current.map((manga) => (
      manga.id === selectedManga.id ? updatedManga : manga
    )));
    setSelectedManga(updatedManga);
    if (status !== 'REJECTED') setRejectReason('');
  };

  const reviewChapter = (status: ReviewStatus) => {
    if (!selectedChapter) return;
    if (status === 'REJECTED' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối chapter.');
      return;
    }

    const updatedChapter: ChapterReviewItem = {
      ...selectedChapter,
      approvalStatus: status,
      rejectionReason: status === 'REJECTED' ? rejectReason.trim() : undefined,
    };

    setMangaReviews((current) => current.map((manga) => (
      manga.id !== selectedChapter.mangaId
        ? manga
        : {
            ...manga,
            chapters: manga.chapters.map((chapter) => (
              chapter.id === selectedChapter.id
                ? {
                    ...chapter,
                    approvalStatus: status,
                    rejectionReason: status === 'REJECTED' ? rejectReason.trim() : undefined,
                  }
                : chapter
            )),
          }
    )));
    setSelectedChapter(updatedChapter);
    if (status !== 'REJECTED') setRejectReason('');
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
                          <td colSpan={8} className={styles.emptyCell}>Không có dữ liệu hiển thị.</td>
                        </tr>
                      ) : (
                        filteredManga.map((manga) => (
                          <tr key={manga.id}>
                            <td className={styles.idCell}>{manga.id}</td>
                            <td>
                              <div className={styles.mangaInfoCell}>
                                <img src={manga.thumbnail} alt="" className={styles.mangaThumb} />
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
                          <td colSpan={7} className={styles.emptyCell}>Không có dữ liệu hiển thị.</td>
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
