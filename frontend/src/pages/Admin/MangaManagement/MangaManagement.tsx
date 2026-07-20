import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import styles from '../Admin.module.css';

type MangaStatusFilter = 'ALL' | 'ongoing' | 'completed' | 'hidden';
type MangaOriginFilter = 'ALL' | 'crawl' | 'author';
type MangaOrigin = Exclude<MangaOriginFilter, 'ALL'>;

interface MangaManagementItem {
  id: number;
  title: string;
  slug: string;
  author: string;
  authorEmail?: string;
  origin: MangaOrigin;
  status: Exclude<MangaStatusFilter, 'ALL'>;
  chapters: number;
  reads: number;
  updatedAt: string;
  hiddenReason?: string;
  thumbnail: string;
}

const prototypeManga: MangaManagementItem[] = [
  {
    id: 54,
    title: 'Đảo Hải Tặc',
    slug: 'one-piece',
    author: 'Eiichiro Oda',
    origin: 'crawl',
    status: 'ongoing',
    chapters: 1121,
    reads: 12840,
    updatedAt: '2026-07-20T08:20:00',
    thumbnail: 'https://img.otruyenapi.com/uploads/comics/one-piece-thumb.jpg',
  },
  {
    id: 53,
    title: 'Hướng Dẫn Sinh Tồn Trong Học Viện',
    slug: 'huong-dan-sinh-ton-trong-hoc-vien',
    author: 'Korita',
    origin: 'crawl',
    status: 'ongoing',
    chapters: 86,
    reads: 1842,
    updatedAt: '2026-07-19T22:10:00',
    thumbnail: 'https://img.otruyenapi.com/uploads/comics/huong-dan-sinh-ton-trong-hoc-vien-thumb.jpg',
  },
  {
    id: 52,
    title: 'Toàn Trí Độc Giả',
    slug: 'toan-tri-doc-gia',
    author: 'sing N song',
    origin: 'crawl',
    status: 'ongoing',
    chapters: 217,
    reads: 9350,
    updatedAt: '2026-07-18T19:35:00',
    thumbnail: 'https://img.otruyenapi.com/uploads/comics/toan-tri-doc-gia-thumb.jpg',
  },
  {
    id: 49,
    title: 'Tôi Thăng Cấp Một Mình',
    slug: 'toi-thang-cap-mot-minh',
    author: 'Chugong',
    origin: 'crawl',
    status: 'completed',
    chapters: 201,
    reads: 15120,
    updatedAt: '2026-07-17T12:05:00',
    thumbnail: 'https://img.otruyenapi.com/uploads/comics/toi-thang-cap-mot-minh-thumb.jpg',
  },
  {
    id: 46,
    title: 'Lưỡi Kiếm Vụn',
    slug: 'luoi-kiem-vun',
    author: 'nguyen_author',
    authorEmail: 'nguyen.author@gmail.com',
    origin: 'author',
    status: 'ongoing',
    chapters: 12,
    reads: 318,
    updatedAt: '2026-07-16T09:15:00',
    thumbnail: 'https://img.otruyenapi.com/uploads/comics/blue-lock-thumb.jpg',
  },
];

const statusLabels: Record<MangaManagementItem['status'], string> = {
  ongoing: 'Phát hành',
  completed: 'Hoàn thành',
  hidden: 'Bị ẩn',
};

const originLabels: Record<MangaOrigin, string> = {
  crawl: 'Crawl',
  author: 'Tác giả đăng',
};

interface MangaVisibilityModalProps {
  manga: MangaManagementItem;
  reason: string;
  setReason: (reason: string) => void;
  notifyAuthor: boolean;
  setNotifyAuthor: (notifyAuthor: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function MangaVisibilityModal({
  manga,
  reason,
  setReason,
  notifyAuthor,
  setNotifyAuthor,
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

          {!willShow && isAuthorManga && (
            <div className={styles.notifyPanel}>
              <label className={styles.notifyToggle}>
                <input
                  type="checkbox"
                  checked={notifyAuthor}
                  onChange={(event) => setNotifyAuthor(event.target.checked)}
                />
                <span>Gửi email thông báo cho tác giả</span>
              </label>
              {notifyAuthor && (
                <div className={styles.notifyPreview}>
                  <div>
                    <span>Người nhận</span>
                    <strong>{manga.authorEmail || '-'}</strong>
                  </div>
                  <div>
                    <span>Nội dung</span>
                    <strong>Tên truyện và lý do xử lý</strong>
                  </div>
                </div>
              )}
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
  const [mangaItems, setMangaItems] = useState<MangaManagementItem[]>(prototypeManga);
  const [visibilityTarget, setVisibilityTarget] = useState<MangaManagementItem | null>(null);
  const [visibilityReason, setVisibilityReason] = useState('');
  const [notifyAuthor, setNotifyAuthor] = useState(true);

  const filteredManga = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return mangaItems.filter((manga) => {
      const matchesSearch = !normalizedSearch
        || manga.title.toLowerCase().includes(normalizedSearch)
        || manga.slug.toLowerCase().includes(normalizedSearch)
        || manga.author.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || manga.status === statusFilter;
      const matchesOrigin = originFilter === 'ALL' || manga.origin === originFilter;
      return matchesSearch && matchesStatus && matchesOrigin;
    });
  }, [mangaItems, originFilter, search, statusFilter]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  const toggleHidden = (id: number) => {
    const target = mangaItems.find((manga) => manga.id === id);
    if (!target) return;
    if (target.status !== 'hidden' && !visibilityReason.trim()) {
      alert('Vui lòng nhập lý do ẩn truyện.');
      return;
    }

    setMangaItems((current) => current.map((manga) => (
      manga.id === id
        ? {
            ...manga,
            status: manga.status === 'hidden' ? 'ongoing' : 'hidden',
            hiddenReason: manga.status === 'hidden' ? undefined : visibilityReason.trim(),
          }
        : manga
    )));
    setVisibilityTarget(null);
    setVisibilityReason('');
    setNotifyAuthor(true);
  };

  const openVisibilityModal = (manga: MangaManagementItem) => {
    setVisibilityTarget(manga);
    setVisibilityReason('');
    setNotifyAuthor(manga.origin === 'author');
  };

  const formatNumber = (value: number) => value.toLocaleString('vi-VN');

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
                  onChange={(event) => setStatusFilter(event.target.value as MangaStatusFilter)}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ongoing">Phát hành</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="hidden">Bị ẩn</option>
                </select>

                <select
                  value={originFilter}
                  onChange={(event) => setOriginFilter(event.target.value as MangaOriginFilter)}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="ALL">Tất cả nguồn</option>
                  <option value="crawl">Crawl</option>
                  <option value="author">Tác giả đăng</option>
                </select>
              </div>
            </div>

            <div className={styles.userTablePanel}>
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
                    {filteredManga.length === 0 ? (
                      <tr>
                        <td colSpan={8} className={styles.emptyCell}>
                          Không có dữ liệu hiển thị.
                        </td>
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
                              <button type="button" className={styles.iconBtn} aria-label="Xem truyện">
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
            </div>
          </main>
        </section>
      </div>
      {visibilityTarget && (
        <MangaVisibilityModal
          manga={visibilityTarget}
          reason={visibilityReason}
          setReason={setVisibilityReason}
          notifyAuthor={notifyAuthor}
          setNotifyAuthor={setNotifyAuthor}
          onConfirm={() => toggleHidden(visibilityTarget.id)}
          onClose={() => {
            setVisibilityTarget(null);
            setVisibilityReason('');
            setNotifyAuthor(true);
          }}
        />
      )}
    </div>
  );
};
