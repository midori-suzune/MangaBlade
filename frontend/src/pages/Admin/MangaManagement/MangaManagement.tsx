import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Eye,
  EyeOff,
  FileCheck,
  FileText,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { adminMangaApi } from '../../../api/adminMangaApi';
import type { AdminMangaItem, AdminMangaOrigin } from '../../../api/adminMangaApi';
import type { SpringPageResponse } from '../../../types/user';
import styles from '../Admin.module.css';

type MangaStatusFilter = 'ALL' | 'ongoing' | 'completed' | 'hidden';
type MangaOriginFilter = 'ALL' | 'crawl' | 'author';
const MANGA_TABLE_PAGE_SIZE = 10;

const statusLabels: Record<AdminMangaItem['status'], string> = {
  ongoing: 'Phát hành',
  completed: 'Hoàn thành',
  hidden: 'Bị ẩn',
};

const originLabels: Record<AdminMangaOrigin, string> = {
  crawl: 'Crawl',
  author: 'Tác giả đăng',
};

interface MangaVisibilityModalProps {
  manga: AdminMangaItem;
  reason: string;
  setReason: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function MangaVisibilityModal({
  manga,
  reason,
  setReason,
  onConfirm,
  onClose,
}: MangaVisibilityModalProps) {
  const willShow = manga.status === 'hidden';
  const isAuthorManga = manga.origin === 'author';

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {willShow ? 'Hiện truyện' : isAuthorManga ? 'Ẩn truyện tác giả' : 'Ẩn truyện'}
          </h3>
          <button onClick={onClose} className={styles.modalClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.mangaModalHeader}>
            <img src={manga.thumbnail} alt="" className={styles.mangaModalThumb} />
            <div>
              <div className={styles.userDetailName}>{manga.title}</div>
              <div className={styles.userDetailEmail}>{manga.slug}</div>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Trạng thái hiện tại:</span>
            <span className={styles.detailValue}>{statusLabels[manga.status]}</span>

            <span className={styles.detailLabel}>Sau khi xác nhận:</span>
            <span className={styles.detailValue}>{willShow ? 'Phát hành' : 'Bị ẩn'}</span>
          </div>

          {!willShow && (
            <div className={styles.rejectForm}>
              <label className={styles.rejectLabel} htmlFor="manga-hidden-reason">Lý do ẩn truyện</label>
              <textarea
                id="manga-hidden-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className={`${styles.formInput} ${styles.textarea}`}
              />
            </div>
          )}

          {willShow && manga.hiddenReason && (
            <div className={styles.rejectBox}>
              Lý do đang lưu: {manga.hiddenReason}
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnOutline} onClick={onClose}>
              Hủy
            </button>
            <button type="button" className={styles.btnPrimary} onClick={onConfirm}>
              {willShow ? 'Xác nhận' : 'Ẩn truyện'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const MangaManagement: React.FC = () => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MangaStatusFilter>('ALL');
  const [originFilter, setOriginFilter] = useState<MangaOriginFilter>('ALL');
  const [mangaItems, setMangaItems] = useState<AdminMangaItem[]>([]);
  const [mangaPage, setMangaPage] = useState<SpringPageResponse<AdminMangaItem> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [visibilityTarget, setVisibilityTarget] = useState<AdminMangaItem | null>(null);
  const [visibilityReason, setVisibilityReason] = useState('');

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      if (typeof responseData === 'string') return responseData;
      if (responseData?.message) return responseData.message;
      if (responseData?.error) return responseData.error;
    }
    return 'Có lỗi xảy ra';
  };

  const fetchManga = useCallback(async (nextPage = page) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await adminMangaApi.getManga({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        origin: originFilter === 'ALL' ? undefined : originFilter,
        search: search || undefined,
        page: nextPage,
        size: MANGA_TABLE_PAGE_SIZE,
      });
      setMangaItems(response.data.content);
      setMangaPage(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách truyện:', error);
      setMangaItems([]);
      setMangaPage(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [originFilter, page, search, statusFilter]);

  useEffect(() => {
    Promise.resolve().then(() => fetchManga());
  }, [fetchManga]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const toggleHidden = async (id: number) => {
    const target = mangaItems.find((manga) => manga.id === id);
    if (!target) return;
    if (target.status !== 'hidden' && !visibilityReason.trim()) {
      alert('Vui lòng nhập lý do ẩn truyện.');
      return;
    }

    try {
      const response = await adminMangaApi.toggleVisibility(id, visibilityReason.trim() || undefined);
      setMangaItems((current) => current.map((manga) => (
        manga.id === id ? response.data : manga
      )));
      setVisibilityTarget(null);
      setVisibilityReason('');
      await fetchManga(page);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái truyện:', error);
      alert(getErrorMessage(error));
    }
  };

  const openVisibilityModal = (manga: AdminMangaItem) => {
    setVisibilityTarget(manga);
    setVisibilityReason('');
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
  };

  const formatNumber = (value: number) => value.toLocaleString('vi-VN');
  const canGoPrevious = Boolean(mangaPage && !mangaPage.first);
  const canGoNext = Boolean(mangaPage && !mangaPage.last);

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
            <button className={`${styles.adminNavItem} ${styles.active}`} onClick={() => navigate('/admin/manga')}>
              <BookOpen size={16} /> Quản lý Truyện
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate('/admin/content-moderation')}>
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
                <h2 className={styles.pageTitle}>Quản lý Truyện</h2>
                <p className={styles.pageSubtitle}>
                  Kiểm tra kho truyện, lọc nội dung, cập nhật trạng thái hoặc xử lý truyện cần gỡ.
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
                    placeholder="Tìm tên truyện, slug hoặc tác giả"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className={`${styles.formInput} ${styles.searchInput}`}
                  />
                </form>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setPage(0);
                    setStatusFilter(event.target.value as MangaStatusFilter);
                  }}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ongoing">Phát hành</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="hidden">Bị ẩn</option>
                </select>

                <select
                  value={originFilter}
                  onChange={(event) => {
                    setPage(0);
                    setOriginFilter(event.target.value as MangaOriginFilter);
                  }}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả nguồn</option>
                  <option value="crawl">Crawl</option>
                  <option value="author">Tác giả đăng</option>
                </select>
              </div>
            </div>

            <div className={`${styles.userTablePanel} ${styles.mangaTablePanel}`}>
              <div className={styles.tableFrame}>
                <table className={`${styles.historyTable} ${styles.mangaTable}`}>
                  <thead>
                    <tr>
                      <th className={styles.idColumn}>ID</th>
                      <th className={styles.mangaInfoColumn}>Truyện</th>
                      <th className={styles.usernameColumn}>Tác giả</th>
                      <th className={styles.roleColumn}>Nguồn</th>
                      <th className={styles.statusColumn}>Status</th>
                      <th className={styles.roleColumn}>Chapters</th>
                      <th className={styles.roleColumn}>Lượt đọc</th>
                      <th className={styles.actionColumn}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mangaItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className={styles.emptyCell}>
                          {loading ? 'Đang tải dữ liệu...' : errorMessage || 'Không có dữ liệu hiển thị.'}
                        </td>
                      </tr>
                    ) : (
                      mangaItems.map((manga) => (
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
                          <td className={styles.truncateCell}>{manga.author}</td>
                          <td>{originLabels[manga.origin]}</td>
                          <td>
                            <span className={`${styles.dotStatus} ${manga.status === 'hidden' ? styles.dotDanger : styles.dotSuccess}`}>
                              {statusLabels[manga.status]}
                            </span>
                          </td>
                          <td>{formatNumber(manga.chapters)}</td>
                          <td>{formatNumber(manga.reads)}</td>
                          <td>
                            <div className={styles.iconActions}>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => window.open(`/manga/${manga.slug}`, '_blank', 'noopener,noreferrer')}
                                aria-label="Xem truyện"
                              >
                                <Eye size={15} />
                              </button>
                              <button type="button" className={styles.iconBtn} onClick={() => openVisibilityModal(manga)} aria-label="Ẩn hoặc hiện truyện">
                                <EyeOff size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {mangaPage && mangaPage.totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.btnPage}
                    disabled={!canGoPrevious}
                    onClick={() => goToPage(page - 1)}
                  >
                    Trước
                  </button>
                  <span className={styles.pageCount}>
                    {page + 1}/{mangaPage.totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.btnPage}
                    disabled={!canGoNext}
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
      {visibilityTarget && (
        <MangaVisibilityModal
          manga={visibilityTarget}
          reason={visibilityReason}
          setReason={setVisibilityReason}
          onConfirm={() => toggleHidden(visibilityTarget.id)}
          onClose={() => {
            setVisibilityTarget(null);
            setVisibilityReason('');
          }}
        />
      )}
    </div>
  );
};
