import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthorDashboardLayout } from './AuthorDashboardLayout';
import { authorMangaApi } from '../../api/authorMangaApi';
import type { AuthorMangaResponse } from '../../types/author';
import { Plus } from 'lucide-react';
import styles from './AuthorDashboard.module.css';

interface AuthorMangaListProps {
  standalone?: boolean;
}

export const AuthorMangaList: React.FC<AuthorMangaListProps> = ({ standalone = false }) => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [mangas, setMangas] = useState<AuthorMangaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // approvalStatus
  const [mangaStatusFilter, setMangaStatusFilter] = useState(''); // status (Đang tiến hành, ...)

  const fetchMangas = async () => {
    setLoading(true);
    try {
      const res = await authorMangaApi.getMangas(
        statusFilter || undefined,
        page,
        12, // Show 12 items in grid layout for better grid alignment
        searchQuery || undefined,
        mangaStatusFilter || undefined
      );
      if (res.success && res.payload) {
        setMangas(res.payload.content);
        setTotalPages(res.payload.totalPages);
      }
    } catch (err) {
      console.error("Error fetching author mangas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMangas();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [statusFilter, mangaStatusFilter, searchQuery, page]);

  const handleNavigate = (path: string) => {
    if (standalone) {
      if (path === '/author/manga/create') {
        setSearchParams({ tab: 'author-manga-create' });
      } else if (path.includes('/chapters')) {
        const id = path.split('/')[3];
        setSearchParams({ tab: 'author-chapters', mangaId: id });
      }
    } else {
      navigate(path);
    }
  };

  const getApprovalStatusBadge = (status: AuthorMangaResponse['approvalStatus']) => {
    const badgeStyle: React.CSSProperties = {
      minWidth: '60px',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10.5px',
      fontWeight: '700',
      color: '#ffffff',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
    };
    switch (status) {
      case 'DRAFT':
        return <span style={{ ...badgeStyle, backgroundColor: '#64748b' }}>Bản nháp</span>;
      case 'PENDING':
        return <span style={{ ...badgeStyle, backgroundColor: '#29b6f6' }}>Chờ duyệt</span>;
      case 'APPROVED':
        return <span style={{ ...badgeStyle, backgroundColor: '#10b981' }}>Đã duyệt</span>;
      case 'REJECTED':
        return <span style={{ ...badgeStyle, backgroundColor: '#ef4444' }}>Từ chối</span>;
      default:
        return null;
    }
  };

  const content = (
    <>
      <div className={styles.pageTitleSection}>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle}>Truyện của tôi</h2>
          <p className={styles.pageSubtitle}>Quản lý các tác phẩm truyện tranh do chính bạn sáng tác và đăng tải.</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleNavigate('/author/manga/create')}>
          <Plus size={16} /> Đăng truyện mới
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Tìm tên truyện..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          className={styles.formInput}
          style={{ width: '260px', padding: '8px 12px', height: '38px', margin: 0 }}
        />

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className={styles.formSelect}
          style={{ width: '180px', padding: '8px 12px', height: '38px', margin: 0 }}
        >
          <option value="">Tất cả trạng thái duyệt</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>

        <select
          value={mangaStatusFilter}
          onChange={(e) => { setMangaStatusFilter(e.target.value); setPage(0); }}
          className={styles.formSelect}
          style={{ width: '180px', padding: '8px 12px', height: '38px', margin: 0 }}
        >
          <option value="">Tất cả trạng thái truyện</option>
          <option value="Đang tiến hành">Đang tiến hành</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Tạm ngưng">Tạm ngưng</option>
        </select>
      </div>

      {/* Grid Layout */}
      {loading && mangas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
          Đang tải danh sách tác phẩm...
        </div>
      ) : mangas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--color-text-muted)'
        }}>
          Chưa có truyện nào khớp với bộ lọc tìm kiếm.
        </div>
      ) : (
        <div className={styles.mangaGrid}>
          {mangas.map((manga) => (
            <div
              key={manga.id}
              className={styles.mangaCard}
              onClick={() => handleNavigate(`/author/manga/${manga.id}/chapters`)}
              title={`Nhấp để quản lý chi tiết: ${manga.title}`}
            >
              <div className={styles.mangaCardCoverContainer}>
                <img
                  src={manga.localCoverUrl || manga.thumbUrl || 'https://via.placeholder.com/150x200?text=No+Cover'}
                  alt={manga.title}
                  className={styles.mangaCardCover}
                />
                <div className={styles.mangaCardBadgeLeft}>
                  {getApprovalStatusBadge(manga.approvalStatus)}
                </div>
                <div className={styles.mangaCardBadgeRight}>
                  <span style={{
                    minWidth: '60px',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    backgroundColor: '#ff7800',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}>
                    Chương {manga.chapterCount || 0}
                  </span>
                </div>
              </div>
              <div className={styles.mangaCardInfo}>
                <h4 className={styles.mangaCardTitle} title={manga.title}>
                  {manga.title}
                </h4>
                <div className={styles.mangaCardFooter}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {manga.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
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
