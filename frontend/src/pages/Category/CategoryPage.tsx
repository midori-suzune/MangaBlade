import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { filterManga } from '../../api/mangaApi';
import type { MangaSearchResponse } from '../../types/manga';
import { getTimeAgo } from '../../utils/time';
import styles from './CategoryPage.module.css';

interface Category {
  id: string;
  name: string;
  description: string;
}

const CATEGORIES: Category[] = [
  { id: 'hanh-dong', name: 'Hành động', description: 'Thể loại bao gồm các cảnh chiến đấu kịch tính, võ thuật, rượt đuổi gay cấn và phô diễn sức mạnh.' },
  { id: 'phieu-luu', name: 'Phiêu lưu', description: 'Thể loại phiêu lưu, mạo hiểm, thường là hành trình của các nhân vật khám phá thế giới mới.' },
  { id: 'hoat-hinh', name: 'Hoạt hình', description: 'Những câu chuyện truyện tranh được vẽ theo phong cách anime sống động.' },
  { id: 'chuyen-sinh', name: 'Chuyển sinh', description: 'Hành trình bắt đầu lại cuộc đời mới ở một thế giới khác sau khi chuyển thế.' },
  { id: 'hai-huoc', name: 'Hài hước', description: 'Thể loại mang lại tiếng cười sảng khoái, các tình huống dí dỏm, vui nhộn đời thường.' }
];

const SORT_OPTIONS = [
  { id: 'update', label: 'Ngày cập nhật giảm dần' },
  { id: 'chapters', label: 'Số chapter giảm dần' },
  { id: 'follow', label: 'Theo dõi' },
  { id: 'comment', label: 'Bình luận' }
];

export function CategoryPage() {
  // Pending filter states
  const [pendingCategoryIds, setPendingCategoryIds] = useState<string[]>([]);
  const [pendingSortBy, setPendingSortBy] = useState<string>('update');
  const [pendingAuthor, setPendingAuthor] = useState<string>('');
  const [debouncedAuthor, setDebouncedAuthor] = useState('');
  const [manga, setManga] = useState<MangaSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryNames = useMemo(() => {
    if (pendingCategoryIds.length === 0) return '';
    return CATEGORIES
      .filter(c => pendingCategoryIds.includes(c.id))
      .map(c => c.name)
      .join(', ');
  }, [pendingCategoryIds]);

  const descriptionText = useMemo(() => {
    if (pendingCategoryIds.length === 0) {
      return 'Danh sách tổng hợp tất cả các bộ truyện tranh thuộc mọi thể loại.';
    }
    if (pendingCategoryIds.length === 1) {
      const cat = CATEGORIES.find(c => c.id === pendingCategoryIds[0]);
      return cat ? cat.description : '';
    }
    return `Đang lọc truyện theo sự kết hợp của các thể loại: ${selectedCategoryNames}.`;
  }, [pendingCategoryIds, selectedCategoryNames]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedAuthor(pendingAuthor.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [pendingAuthor]);

  useEffect(() => {
    let cancelled = false;

    async function loadManga() {
      setLoading(true);
      setError(null);

      try {
        const response = await filterManga({
          category: pendingCategoryIds[0],
          author: debouncedAuthor || undefined,
          sort: pendingSortBy,
          page: 0,
          size: 20,
        });

        if (!cancelled) {
          setManga(response.success ? response.payload : []);
        }
      } catch {
        if (!cancelled) {
          setManga([]);
          setError('Không thể tải danh sách truyện.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadManga();

    return () => {
      cancelled = true;
    };
  }, [pendingCategoryIds, debouncedAuthor, pendingSortBy]);

  return (
    <div className={styles.mainContainer}>
      <section className={styles.leftMain}>
        <h1 className={styles.pageTitle}>Tất cả thể loại truyện tranh</h1>
        
        <div className={styles.descriptionBox}>
          <p>{descriptionText}</p>
        </div>

        <div className={styles.filterPanel}>
          <div className={styles.filterRow}>
            <span className={styles.filterGroupLabel}>Thể loại truyện</span>
            <select
              className={styles.filterSelect}
              value={pendingCategoryIds[0] ?? 'all'}
              onChange={(event) => {
                const nextCategoryId = event.target.value;
                setPendingCategoryIds(nextCategoryId === 'all' ? [] : [nextCategoryId]);
              }}
            >
              <option value="all">Tất cả</option>
              {CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterRow}>
            <span className={styles.filterGroupLabel}>Tác giả</span>
            <input
              type="text"
              className={styles.authorInput}
              placeholder="Nhập tên tác giả..."
              value={pendingAuthor}
              onChange={(e) => setPendingAuthor(e.target.value)}
            />
          </div>

          <div className={styles.filterRow}>
            <span className={styles.filterGroupLabel}>Sắp xếp</span>
            <select
              className={styles.filterSelect}
              value={pendingSortBy}
              onChange={(event) => setPendingSortBy(event.target.value)}
            >
              {SORT_OPTIONS.map(sortOpt => (
                <option key={sortOpt.id} value={sortOpt.id}>
                  {sortOpt.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.comicGrid}>
          {manga.map(comic => (
            <article className={styles.comicCard} key={comic.slug}>
              <Link to={`/manga/${comic.slug}`} className={styles.comicCover} aria-label={comic.title}>
                <span className={styles.comicTag}>{getTimeAgo(comic.updatedAt)}</span>
                {comic.thumbUrl && <img src={comic.thumbUrl} alt={comic.title} />}
                <span className={styles.coverText}>Ảnh Bìa</span>
              </Link>
              <div className={styles.comicInfo}>
                <Link to={`/manga/${comic.slug}`} className={styles.comicTitle}>{comic.title}</Link>
                <span className={styles.comicChapter}>
                  {comic.latestChapterNumber ? `Chapter ${comic.latestChapterNumber}` : 'Chưa có chapter'}
                </span>
              </div>
            </article>
          ))}
          {loading && (
            <p className={styles.noResults}>Đang tải truyện...</p>
          )}
          {!loading && manga.length === 0 && (
            <p className={styles.noResults}>Không tìm thấy truyện nào thuộc bộ lọc này.</p>
          )}
        </div>

        <nav className={styles.pagination} aria-label="Phân trang thể loại">
          {["«", "‹", "1", "2", "3", "4", "5", "›", "»"].map((page) => (
            <a href="#" className={`${styles.pageLink} ${page === "2" ? styles.active : ""}`} key={page}>
              {page}
            </a>
          ))}
        </nav>
      </section>

    </div>
  );
}
