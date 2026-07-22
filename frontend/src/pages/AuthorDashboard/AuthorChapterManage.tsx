import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthorDashboardLayout } from './AuthorDashboardLayout';
import { authorMangaApi } from '../../api/authorMangaApi';
import type { AuthorChapterResponse, AuthorMangaResponse } from '../../types/author';
import { ArrowLeft, Plus, Edit3, Image, Trash2, Send, X, Save, Menu, HelpCircle, XCircle } from 'lucide-react';
import styles from './AuthorDashboard.module.css';

interface AuthorChapterManageProps {
  standalone?: boolean;
}

const getStatusBadge = (status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED') => {
  switch (status) {
    case 'DRAFT':
      return <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-muted)' }}>Bản nháp</span>;
    case 'PENDING':
      return <span style={{ fontWeight: '600', fontSize: '13px', color: '#4f46e5' }}>Chờ duyệt</span>;
    case 'APPROVED':
      return <span style={{ fontWeight: '600', fontSize: '13px', color: '#10b981' }}>Đã duyệt</span>;
    case 'REJECTED':
      return <span style={{ fontWeight: '600', fontSize: '13px', color: '#ef4444' }}>Từ chối</span>;
    default:
      return null;
  }
};

interface MangaHeaderCardProps {
  manga: AuthorMangaResponse;
  isMangaDropdownOpen: boolean;
  setIsMangaDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleNavigate: (path: string) => void;
  handleSubmitMangaReview: (id: number) => void;
  handleCancelMangaReview: (id: number) => void;
  handleDeleteManga: (id: number) => void;
}

const MangaHeaderCard: React.FC<MangaHeaderCardProps> = ({
  manga,
  isMangaDropdownOpen,
  setIsMangaDropdownOpen,
  handleNavigate,
  handleSubmitMangaReview,
  handleCancelMangaReview,
  handleDeleteManga,
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      backgroundColor: 'var(--color-bg)',
      borderRadius: 'var(--border-radius-md)',
      padding: '24px',
      marginBottom: '32px',
      border: '1px solid var(--color-border)',
      flexWrap: 'wrap',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 100 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMangaDropdownOpen(!isMangaDropdownOpen);
          }}
          className={`${styles.btn} ${styles.btnSecondary}`}
          title="Thao tác truyện"
          aria-label="Thao tác truyện"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            padding: '6px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <Menu size={18} />
        </button>

        {isMangaDropdownOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 4px)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-sm)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              minWidth: '180px',
              padding: '4px 0',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <button
              onClick={() => {
                setIsMangaDropdownOpen(false);
                handleNavigate(`/author/manga/${manga.id}/edit`);
              }}
              disabled={manga.approvalStatus === 'PENDING'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                background: 'none',
                border: 'none',
                color: manga.approvalStatus === 'PENDING' ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                cursor: manga.approvalStatus === 'PENDING' ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Edit3 size={14} /> Chỉnh sửa thông tin
            </button>

            {(manga.approvalStatus === 'DRAFT' || manga.approvalStatus === 'REJECTED') && (
              <button
                onClick={() => {
                  setIsMangaDropdownOpen(false);
                  handleSubmitMangaReview(manga.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-main)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Send size={14} /> Gửi kiểm duyệt truyện
              </button>
            )}

            {manga.approvalStatus === 'PENDING' && (
              <button
                onClick={() => {
                  setIsMangaDropdownOpen(false);
                  handleCancelMangaReview(manga.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-danger, #ef4444)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <XCircle size={14} /> Hủy yêu cầu duyệt
              </button>
            )}

            {manga.approvalStatus === 'REJECTED' && (
              <button
                onClick={() => {
                  setIsMangaDropdownOpen(false);
                  alert(`Lý do từ chối truyện:\n\n${manga.rejectionReason || "Chưa có lý do chi tiết từ Admin."}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <HelpCircle size={14} /> Xem lý do từ chối
              </button>
            )}

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

            <button
              onClick={() => {
                setIsMangaDropdownOpen(false);
                handleDeleteManga(manga.id);
              }}
              disabled={manga.approvalStatus === 'PENDING'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                background: 'none',
                border: 'none',
                color: manga.approvalStatus === 'PENDING' ? 'var(--color-text-muted)' : '#ef4444',
                fontWeight: '600',
                cursor: manga.approvalStatus === 'PENDING' ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                width: '100%',
                opacity: manga.approvalStatus === 'PENDING' ? 0.5 : 1
              }}
            >
              <Trash2 size={14} /> Gỡ truyện
            </button>
          </div>
        )}
      </div>

      <div style={{ width: '120px', flexShrink: 0 }}>
        <img
          src={manga.localCoverUrl || manga.thumbUrl || 'https://via.placeholder.com/150x200?text=No+Cover'}
          alt={manga.title}
          style={{
            width: '100%',
            borderRadius: '8px',
            aspectRatio: '3/4',
            objectFit: 'cover',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--color-border)'
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--color-text-main)' }}>
            {manga.title}
          </h3>
          {getStatusBadge(manga.approvalStatus)}
        </div>

        {manga.originName && (
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Tên khác: <strong style={{ color: 'var(--color-text-main)' }}>{manga.originName}</strong>
          </div>
        )}

        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span>Trạng thái: <strong style={{ color: 'var(--color-text-main)' }}>{manga.status}</strong></span>
          <span>Lượt xem: <strong style={{ color: 'var(--color-text-main)' }}>{manga.viewCount.toLocaleString('vi-VN')}</strong></span>
          <span>Theo dõi: <strong style={{ color: 'var(--color-text-main)' }}>{manga.followCount.toLocaleString('vi-VN')}</strong></span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
          {manga.categories.map(c => (
            <span key={c.id} style={{
              fontSize: '11px',
              backgroundColor: 'var(--color-accent-bg)',
              color: 'var(--color-accent)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: '600'
            }}>
              {c.name}
            </span>
          ))}
        </div>

        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          margin: '8px 0 0 0',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {manga.description || "Chưa có mô tả tóm tắt cho truyện này."}
        </p>
      </div>
    </div>
  );
};

interface ChapterRowProps {
  chapter: AuthorChapterResponse;
  index: number;
  chaptersLength: number;
  activeDropdownId: number | null;
  setActiveDropdownId: React.Dispatch<React.SetStateAction<number | null>>;
  mId: number | string;
  handleNavigate: (path: string) => void;
  handleOpenEditModal: (chapter: AuthorChapterResponse) => void;
  handleSubmitChapterReview: (chapterId: number) => void;
  handleCancelChapterReview: (chapterId: number) => void;
  handleDeleteChapter: (chapterId: number) => void;
}

const ChapterRow: React.FC<ChapterRowProps> = ({
  chapter,
  index,
  chaptersLength,
  activeDropdownId,
  setActiveDropdownId,
  mId,
  handleNavigate,
  handleOpenEditModal,
  handleSubmitChapterReview,
  handleCancelChapterReview,
  handleDeleteChapter,
}) => {
  const isNearBottom = index >= chaptersLength - 2;

  return (
    <tr key={chapter.id}>
      <td style={{ fontWeight: '700' }}>Chương {chapter.chapterNumber}</td>
      <td>{chapter.title || <em style={{ color: 'var(--color-text-muted)' }}>Không có tiêu đề</em>}</td>
      <td>
        <strong>{chapter.pageCount || 0}</strong> trang
      </td>
      <td>
        {getStatusBadge(chapter.approvalStatus)}
      </td>
      <td>
        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdownId(activeDropdownId === chapter.id ? null : chapter.id);
            }}
            className={`${styles.btn} ${styles.btnSecondary}`}
            title="Thao tác"
            aria-label="Thao tác"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              padding: '6px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
          >
            <Menu size={16} />
          </button>

          {activeDropdownId === chapter.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                right: 0,
                ...(isNearBottom ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '160px',
                padding: '4px 0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <button
                onClick={() => {
                  setActiveDropdownId(null);
                  handleNavigate(`/author/manga/${mId}/chapters/${chapter.id}/upload`);
                }}
                disabled={chapter.approvalStatus === 'PENDING'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  background: 'none',
                  border: 'none',
                  color: chapter.approvalStatus === 'PENDING' ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                  cursor: chapter.approvalStatus === 'PENDING' ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Image size={14} /> Quản lý trang ảnh
              </button>

              <button
                onClick={() => {
                  setActiveDropdownId(null);
                  handleOpenEditModal(chapter);
                }}
                disabled={chapter.approvalStatus === 'PENDING'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  background: 'none',
                  border: 'none',
                  color: chapter.approvalStatus === 'PENDING' ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                  cursor: chapter.approvalStatus === 'PENDING' ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Edit3 size={14} /> Sửa thông tin
              </button>

              {(chapter.approvalStatus === 'DRAFT' || chapter.approvalStatus === 'REJECTED') && (
                <button
                  onClick={() => {
                    setActiveDropdownId(null);
                    handleSubmitChapterReview(chapter.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <Send size={14} /> Gửi kiểm duyệt
                </button>
              )}

              {chapter.approvalStatus === 'PENDING' && (
                <button
                  onClick={() => {
                    setActiveDropdownId(null);
                    handleCancelChapterReview(chapter.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger, #ef4444)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <XCircle size={14} /> Hủy yêu cầu duyệt
                </button>
              )}

              {chapter.approvalStatus === 'REJECTED' && (
                <button
                  onClick={() => {
                    setActiveDropdownId(null);
                    alert(`Lý do từ chối chương ${chapter.chapterNumber}:\n\n${chapter.rejectionReason || "Chưa có lý do chi tiết từ Admin."}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <HelpCircle size={14} /> Xem lý do từ chối
                </button>
              )}

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setActiveDropdownId(null);
                  handleDeleteChapter(chapter.id);
                }}
                disabled={chapter.approvalStatus === 'PENDING'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  background: 'none',
                  border: 'none',
                  color: chapter.approvalStatus === 'PENDING' ? 'var(--color-text-muted)' : '#ef4444',
                  fontWeight: '600',
                  cursor: chapter.approvalStatus === 'PENDING' ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  opacity: chapter.approvalStatus === 'PENDING' ? 0.5 : 1
                }}
              >
                <Trash2 size={14} /> Gỡ chương
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingChapter: AuthorChapterResponse | null;
  chapterNumber: string;
  setChapterNumber: (val: string) => void;
  chapterTitle: string;
  setChapterTitle: (val: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ChapterModal: React.FC<ChapterModalProps> = ({
  isOpen,
  onClose,
  editingChapter,
  chapterNumber,
  setChapterNumber,
  chapterTitle,
  setChapterTitle,
  submitting,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius-md)',
        padding: '28px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
            {editingChapter ? 'Sửa thông tin chương' : 'Thêm chương mới'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Chương số *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Ví dụ: 1, 2, 2.5, 3"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tiêu đề chương (không bắt buộc)</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Ví dụ: Khởi đầu mới"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={onClose}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={submitting}
            >
              <Save size={16} /> {submitting ? 'Đang lưu...' : 'Lưu chương'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AuthorChapterManage: React.FC<AuthorChapterManageProps> = ({ standalone = false }) => {
  const navigate = useNavigate();
  const { mangaId } = useParams<{ mangaId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const mangaIdParam = searchParams.get('mangaId');
  const mId = standalone ? (mangaIdParam || mangaId || '') : (mangaId || '');

  const [manga, setManga] = useState<AuthorMangaResponse | null>(null);
  const [chapters, setChapters] = useState<AuthorChapterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<AuthorChapterResponse | null>(null);
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dropdown State
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isMangaDropdownOpen, setIsMangaDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
      setIsMangaDropdownOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const fetchData = useCallback(async () => {
    if (!mId) return;
    setLoading(true);
    try {
      const mangaRes = await authorMangaApi.getMangaDetail(mId);
      if (mangaRes.success && mangaRes.payload) {
        setManga(mangaRes.payload);
      }

      const chapterRes = await authorMangaApi.getChapters(mId, page, 20);
      if (chapterRes.success && chapterRes.payload) {
        setChapters(chapterRes.payload.content);
        setTotalPages(chapterRes.payload.totalPages);
      }
    } catch (err) {
      console.error("Error loading chapter management:", err);
    } finally {
      setLoading(false);
    }
  }, [mId, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleNavigate = (path: string) => {
    if (standalone) {
      if (path === '/author/manga') {
        setSearchParams({ tab: 'author-manga' });
      } else if (path.includes('/edit')) {
        setSearchParams({ tab: 'author-manga-edit', mangaId: String(mId) });
      } else if (path.includes('/upload')) {
        const parts = path.split('/');
        setSearchParams({ tab: 'author-chapter-upload', mangaId: parts[3], chapterId: parts[5] });
      }
    } else {
      navigate(path);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingChapter(null);
    setChapterNumber('');
    setChapterTitle('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (chapter: AuthorChapterResponse) => {
    setEditingChapter(chapter);
    setChapterNumber(chapter.chapterNumber);
    setChapterTitle(chapter.title || '');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterNumber.trim()) {
      alert("Vui lòng nhập số chương!");
      return;
    }

    setSubmitting(true);
    try {
      if (editingChapter) {
        const res = await authorMangaApi.updateChapter(editingChapter.id, {
          chapterNumber,
          title: chapterTitle.trim() || undefined
        });
        if (res.success) {
          alert("Cập nhật chương thành công!");
          setIsModalOpen(false);
          fetchData();
        } else {
          alert(res.message || "Cập nhật chương thất bại!");
        }
      } else {
        const res = await authorMangaApi.createChapter(mId, {
          chapterNumber,
          title: chapterTitle.trim() || undefined
        });
        if (res.success) {
          alert("Thêm chương mới thành công!");
          setIsModalOpen(false);
          fetchData();
        } else {
          alert(res.message || "Thêm chương thất bại!");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu thông tin chương!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitChapterReview = async (chapterId: number) => {
    if (!window.confirm("Bạn muốn gửi kiểm duyệt chương này? Sau khi gửi sẽ không được chỉnh sửa đến khi hoàn tất duyệt.")) return;
    try {
      const res = await authorMangaApi.submitChapter(chapterId);
      if (res.success) {
        alert("Gửi duyệt chương thành công!");
        fetchData();
      } else {
        alert(res.message || "Gửi duyệt thất bại!");
      }
    } catch {
      alert("Lỗi khi gửi duyệt chương!");
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ chương này?")) return;
    try {
      const res = await authorMangaApi.deleteChapter(chapterId);
      if (res.success) {
        alert("Gỡ chương thành công!");
        fetchData();
      } else {
        alert(res.message || "Gỡ chương thất bại!");
      }
    } catch {
      alert("Lỗi khi gỡ chương!");
    }
  };

  const handleSubmitMangaReview = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi kiểm duyệt truyện này? Sau khi gửi, bạn không thể chỉnh sửa cho đến khi được duyệt.")) return;
    try {
      const res = await authorMangaApi.submitManga(id);
      if (res.success) {
        alert("Gửi kiểm duyệt truyện thành công!");
        fetchData();
      } else {
        alert(res.message || "Gửi kiểm duyệt thất bại!");
      }
    } catch {
      alert("Lỗi khi gửi kiểm duyệt!");
    }
  };

  const handleDeleteManga = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ truyện này? Hành động này sẽ ẩn truyện khỏi hệ thống.")) return;
    try {
      const res = await authorMangaApi.deleteManga(id);
      if (res.success) {
        alert("Gỡ truyện thành công!");
        handleNavigate('/author/manga');
      } else {
        alert(res.message || "Gỡ truyện thất bại!");
      }
    } catch {
      alert("Lỗi khi gỡ truyện!");
    }
  };

  const handleCancelMangaReview = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu duyệt truyện này? Truyện cùng tất cả các chương đang chờ duyệt của truyện này sẽ trở lại trạng thái Bản nháp.")) return;
    try {
      const res = await authorMangaApi.cancelMangaSubmission(id);
      if (res.success) {
        alert("Hủy yêu cầu duyệt truyện thành công!");
        fetchData();
      } else {
        alert(res.message || "Hủy yêu cầu duyệt thất bại!");
      }
    } catch {
      alert("Lỗi khi hủy yêu cầu duyệt!");
    }
  };

  const handleCancelChapterReview = async (chapterId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu duyệt chương này? Chương sẽ trở lại trạng thái Bản nháp.")) return;
    try {
      const res = await authorMangaApi.cancelChapterSubmission(chapterId);
      if (res.success) {
        alert("Hủy yêu cầu duyệt chương thành công!");
        fetchData();
      } else {
        alert(res.message || "Hủy yêu cầu duyệt thất bại!");
      }
    } catch {
      alert("Lỗi khi hủy yêu cầu duyệt chương!");
    }
  };

  const content = (
    <>
      <div className={styles.pageTitleSection}>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle}>Chi tiết & Quản lý Truyện</h2>
          <p className={styles.pageSubtitle}>Xem thông tin chi tiết và cập nhật các chương truyện của bạn.</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ backgroundColor: '#4f46e5', color: '#ffffff' }} onClick={() => handleNavigate('/author/manga')}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>

      {manga && (
        <MangaHeaderCard
          manga={manga}
          isMangaDropdownOpen={isMangaDropdownOpen}
          setIsMangaDropdownOpen={setIsMangaDropdownOpen}
          handleNavigate={handleNavigate}
          handleSubmitMangaReview={handleSubmitMangaReview}
          handleCancelMangaReview={handleCancelMangaReview}
          handleDeleteManga={handleDeleteManga}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--color-text-main)' }}>
          Danh sách chương {manga && `(${chapters.length})`}
        </h3>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleOpenCreateModal}
          disabled={!manga || manga.approvalStatus === 'PENDING'}
          style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            opacity: !manga || manga.approvalStatus === 'PENDING' ? 0.5 : 1,
            cursor: !manga || manga.approvalStatus === 'PENDING' ? 'not-allowed' : 'pointer'
          }}
        >
          <Plus size={16} /> Thêm chương mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
          Đang tải danh sách chương...
        </div>
      ) : chapters.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--color-text-muted)'
        }}>
          Truyện chưa có chương nào. Nhấp vào "Thêm chương mới" để bắt đầu!
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Chương số</th>
                <th>Tiêu đề chương</th>
                <th>Số trang ảnh</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter, index) => (
                <ChapterRow
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  chaptersLength={chapters.length}
                  activeDropdownId={activeDropdownId}
                  setActiveDropdownId={setActiveDropdownId}
                  mId={mId}
                  handleNavigate={handleNavigate}
                  handleOpenEditModal={handleOpenEditModal}
                  handleSubmitChapterReview={handleSubmitChapterReview}
                  handleCancelChapterReview={handleCancelChapterReview}
                  handleDeleteChapter={handleDeleteChapter}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ padding: '6px 12px' }}
          >
            Trước
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ padding: '6px 12px' }}
          >
            Sau
          </button>
        </div>
      )}

      <ChapterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingChapter={editingChapter}
        chapterNumber={chapterNumber}
        setChapterNumber={setChapterNumber}
        chapterTitle={chapterTitle}
        setChapterTitle={setChapterTitle}
        submitting={submitting}
        onSubmit={handleModalSubmit}
      />
    </>
  );

  if (standalone) {
    return content;
  }

  return (
    <AuthorDashboardLayout activeTab="manga-list">
      {content}
    </AuthorDashboardLayout>
  );
};
