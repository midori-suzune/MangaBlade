import React, { useEffect, useState } from 'react';
import { AuthorDashboardLayout } from './AuthorDashboardLayout';
import { authorMangaApi } from '../../api/authorMangaApi';
import type { AuthorStatsOverview, AuthorMangaStats } from '../../types/author';
import styles from './AuthorDashboard.module.css';

interface AuthorStatisticsProps {
  standalone?: boolean;
}

export const AuthorStatistics: React.FC<AuthorStatisticsProps> = ({ standalone = false }) => {
  const [overview, setOverview] = useState<AuthorStatsOverview | null>(null);
  const [mangaStats, setMangaStats] = useState<AuthorMangaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const overviewRes = await authorMangaApi.getStatsOverview();
      if (overviewRes.success && overviewRes.payload) {
        setOverview(overviewRes.payload);
      }

      const mangaStatsRes = await authorMangaApi.getMangaStats(page, 10);
      if (mangaStatsRes.success && mangaStatsRes.payload) {
        setMangaStats(mangaStatsRes.payload.content);
        setTotalPages(mangaStatsRes.payload.totalPages);
      }
    } catch (err) {
      console.error("Error fetching author stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [page]);

  const getStatusBadge = (status: string) => {
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
        return <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-muted)' }}>{status}</span>;
    }
  };

  const content = (
    <>
      <div className={styles.pageTitleSection}>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle}>Thống kê tác phẩm</h2>
          <p className={styles.pageSubtitle}>Xem thống kê chi tiết lượt xem, lượt theo dõi và tương tác của độc giả đối với các tác phẩm của bạn.</p>
        </div>
      </div>

      {loading && !overview ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
          Đang thống kê số liệu...
        </div>
      ) : (
        <>
          {/* Stats Overview Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statsCard}>
              <div className={styles.statsInfo}>
                <span className={styles.statsLabel}>Tổng số truyện</span>
                <span className={styles.statsVal}>{overview?.totalManga || 0}</span>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.statsInfo}>
                <span className={styles.statsLabel}>Tổng lượt xem</span>
                <span className={styles.statsVal}>{(overview?.totalViews || 0).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.statsInfo}>
                <span className={styles.statsLabel}>Tổng lượt theo dõi</span>
                <span className={styles.statsVal}>{(overview?.totalFollows || 0).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.statsInfo}>
                <span className={styles.statsLabel}>Tổng bình luận</span>
                <span className={styles.statsVal}>{overview?.totalComments || 0}</span>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Hiệu số chi tiết từng tác phẩm</h3>
          {mangaStats.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-text-muted)'
            }}>
              Chưa có tác phẩm nào để thống kê.
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tên truyện</th>
                    <th>Trạng thái</th>
                    <th>Lượt xem</th>
                    <th>Lượt theo dõi</th>
                    <th>Bình luận</th>
                  </tr>
                </thead>
                <tbody>
                  {mangaStats.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.mangaRowInfo}>
                          <img
                            src={item.thumbUrl || 'https://via.placeholder.com/150x200?text=No+Cover'}
                            alt={item.title}
                            className={styles.mangaThumb}
                          />
                          <strong className={styles.mangaTitleText}>{item.title}</strong>
                        </div>
                      </td>
                      <td>{getStatusBadge(item.approvalStatus)}</td>
                      <td>
                        <strong>{item.viewCount.toLocaleString('vi-VN')}</strong>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-accent)' }}>
                          {item.followCount.toLocaleString('vi-VN')}
                        </strong>
                      </td>
                      <td>
                        <strong>{item.commentCount.toLocaleString('vi-VN')}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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
        </>
      )}
    </>
  );

  if (standalone) {
    return content;
  }

  return (
    <AuthorDashboardLayout activeTab="statistics">
      {content}
    </AuthorDashboardLayout>
  );
};
