import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { filterManga, getCategories } from '../../api/mangaApi';
import type { CategoryResponse, MangaSearchResponse } from '../../types/manga';
import { getTimeAgo } from '../../utils/time';
import styles from './CategoryPage.module.css';

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
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const selectedCategorySlug = pendingCategoryIds[0];
  const selectedCategoryName = categories.find(category => category.slug === selectedCategorySlug)?.name ?? 'Tất cả';

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedAuthor(pendingAuthor.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [pendingAuthor]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setCategoryError(null);
        const response = await getCategories();
        if (!cancelled) {
          setCategories(response.success ? response.payload : []);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setCategoryError('Không thể tải thể loại truyện.');
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

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
          size: 30,
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

        <div className={styles.filterPanel}>
          <div className={styles.filterRow}>
            <span className={styles.filterGroupLabel}>Thể loại truyện</span>
            <div className={styles.categoryMenu}>
              <button
                type="button"
                className={styles.categoryMenuButton}
                aria-expanded={isCategoryMenuOpen}
                onClick={() => setIsCategoryMenuOpen((current) => !current)}
              >
                <span>{selectedCategoryName}</span>
                <span className={styles.categoryMenuChevron}>⌄</span>
              </button>

              {isCategoryMenuOpen && (
                <div className={styles.categoryMenuPanel}>
                  <button
                    type="button"
                    className={`${styles.categoryOption} ${!selectedCategorySlug ? styles.activeCategoryOption : ''}`}
                    onClick={() => {
                      setPendingCategoryIds([]);
                      setIsCategoryMenuOpen(false);
                    }}
                  >
                    Tất cả
                  </button>
                  {categories.map(category => (
                    <button
                      type="button"
                      key={category.id}
                      className={`${styles.categoryOption} ${selectedCategorySlug === category.slug ? styles.activeCategoryOption : ''}`}
                      onClick={() => {
                        setPendingCategoryIds([category.slug]);
                        setIsCategoryMenuOpen(false);
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

        {categoryError && <p className={styles.errorText}>{categoryError}</p>}
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
