import { useState, useMemo } from 'react';
import styles from './CategoryPage.module.css';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface MangaMock {
  id: string;
  title: string;
  chapter: string;
  timeAgo: string;
  isHot?: boolean;
  status: 'completed' | 'ongoing';
  categories: string[];
  author: string;
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
  { id: 'new', label: 'Truyện mới' },
  { id: 'chapters', label: 'Số chapter giảm dần' },
  { id: 'follow', label: 'Theo dõi' },
  { id: 'comment', label: 'Bình luận' }
];

const MOCK_MANGAS: MangaMock[] = [
  { id: '1', title: 'Bảng Trạng Thái Bị Khóa', chapter: 'Chapter 32', timeAgo: '42 Phút Trước', isHot: true, status: 'ongoing', categories: ['hanh-dong', 'phieu-luu', 'chuyen-sinh'], author: 'Tiêu Đỉnh' },
  { id: '2', title: 'Destiny Unchain Online', chapter: 'Chapter 41', timeAgo: '1 Giờ Trước', isHot: true, status: 'ongoing', categories: ['phieu-luu', 'ky-ao'], author: 'Cổ Long' },
  { id: '3', title: 'Sự Thức Tỉnh Của Thần', chapter: 'Chapter 183', timeAgo: '1 Giờ Trước', isHot: true, status: 'completed', categories: ['hanh-dong', 'ky-ao'], author: 'Đường Gia Tam Thiếu' },
  { id: '4', title: 'Lúc Đó Tôi Không Biết', chapter: 'Chapter 80', timeAgo: '2 Giờ Trước', isHot: false, status: 'ongoing', categories: ['ngon-tinh', 'doi-thuong'], author: 'Ngã Chi Cật Tây Hồng Thị' },
  { id: '5', title: 'Shakkin 100 Oku No Vợ', chapter: 'Chapter 6.5', timeAgo: '2 Giờ Trước', isHot: false, status: 'completed', categories: ['hai-huoc', 'ngon-tinh'], author: 'Kim Dung' },
  { id: '6', title: 'Ta Là Tà Đế', chapter: 'Chapter 442', timeAgo: '2 Giờ Trước', isHot: true, status: 'ongoing', categories: ['hanh-dong', 'vo-thuat', 'chuyen-sinh'], author: 'Tiêu Đỉnh' },
  { id: '7', title: 'Trọng Sinh Đô Thị Tu Tiên', chapter: 'Chapter 925', timeAgo: '3 Giờ Trước', isHot: false, status: 'ongoing', categories: ['vo-thuat', 'chuyen-sinh'], author: 'Thiên Tằm Thổ Đậu' },
  { id: '8', title: 'Solo Leveling', chapter: 'Chapter 179', timeAgo: '3 Giờ Trước', isHot: true, status: 'completed', categories: ['hanh-dong', 'phieu-luu', 'ky-ao'], author: 'Chugong' },
  { id: '9', title: 'Toàn Trí Độc Giả', chapter: 'Chapter 199', timeAgo: '4 Giờ Trước', isHot: true, status: 'ongoing', categories: ['phieu-luu', 'hanh-dong', 'trinh-tham'], author: 'singNsong' },
  { id: '10', title: 'Đại Quản Gia Là Ma Hoàng', chapter: 'Chapter 450', timeAgo: '4 Giờ Trước', isHot: true, status: 'ongoing', categories: ['hanh-dong', 'chuyen-sinh', 'vo-thuat'], author: 'Thiên Tằm Thổ Đậu' },
  { id: '11', title: 'Thám Tử Lừng Danh Conan', chapter: 'Chapter 1125', timeAgo: '5 Giờ Trước', isHot: false, status: 'ongoing', categories: ['trinh-tham', 'hoc-duong'], author: 'Aoyama Gosho' },
  { id: '12', title: 'Kẻ Ăn Hồn', chapter: 'Chapter 15', timeAgo: '5 Giờ Trước', isHot: false, status: 'completed', categories: ['kinh-di', 'huyen-bi'], author: 'Nguyễn Nhật Ánh' },
  { id: '13', title: 'Tiệm Ăn Kỳ Quái', chapter: 'Chapter 48', timeAgo: '6 Giờ Trước', isHot: false, status: 'ongoing', categories: ['doi-thuong', 'hai-huoc', 'ky-ao'], author: 'Kim Dung' },
  { id: '14', title: 'Lớp Học Ám Sát', chapter: 'Chapter 180', timeAgo: '6 Giờ Trước', isHot: false, status: 'completed', categories: ['hoc-duong', 'hai-huoc', 'hanh-dong'], author: 'Yusei Matsui' },
  { id: '15', title: 'Doraemon', chapter: 'Chapter 820', timeAgo: '7 Giờ Trước', isHot: false, status: 'ongoing', categories: ['hai-huoc', 'phieu-luu', 'doi-thuong'], author: 'Fujiko F. Fujio' }
];

export function CategoryPage() {
  // Pending filter states
  const [pendingCategoryIds, setPendingCategoryIds] = useState<string[]>([]);
  const [pendingStatus, setPendingStatus] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [pendingSortBy, setPendingSortBy] = useState<string>('update');
  const [pendingAuthor, setPendingAuthor] = useState<string>('');

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

  const filteredAndSortedMangas = useMemo(() => {
    const list = MOCK_MANGAS.filter(manga => {
      const matchesCategory = pendingCategoryIds.length === 0 || 
        pendingCategoryIds.every(cId => manga.categories.includes(cId));
      const matchesStatus = pendingStatus === 'all' || manga.status === pendingStatus;
      const matchesAuthor = !pendingAuthor.trim() || 
        manga.author.toLowerCase().includes(pendingAuthor.toLowerCase().trim());
      return matchesCategory && matchesStatus && matchesAuthor;
    });

    if (pendingSortBy === 'chapters') {
      return [...list].sort((a, b) => {
        const numA = parseFloat(a.chapter.replace(/[^\d.]/g, '')) || 0;
        const numB = parseFloat(b.chapter.replace(/[^\d.]/g, '')) || 0;
        return numB - numA;
      });
    }

    if (pendingSortBy === 'new') {
      return [...list].sort((a, b) => b.id.localeCompare(a.id));
    }

    return list;
  }, [pendingCategoryIds, pendingStatus, pendingAuthor, pendingSortBy]);

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
            <span className={styles.filterGroupLabel}>Tình trạng</span>
            <div className={styles.statusFilters}>
              <button
                type="button"
                className={`${styles.filterBtn} ${pendingStatus === 'all' ? styles.activeStatus : ''}`}
                onClick={() => setPendingStatus('all')}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${pendingStatus === 'ongoing' ? styles.activeStatus : ''}`}
                onClick={() => setPendingStatus('ongoing')}
              >
                Đang tiến hành
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${pendingStatus === 'completed' ? styles.activeStatus : ''}`}
                onClick={() => setPendingStatus('completed')}
              >
                Hoàn thành
              </button>
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

        <div className={styles.comicGrid}>
          {filteredAndSortedMangas.map(comic => (
            <article className={styles.comicCard} key={comic.id}>
              <div className={styles.comicCover}>
                <span className={styles.comicTag}>{comic.timeAgo}</span>
                {comic.isHot && <span className={`${styles.comicTag} ${styles.hot}`}>Hot</span>}
                <span className={styles.coverText}>Ảnh Bìa</span>
              </div>
              <div className={styles.comicInfo}>
                <span className={styles.comicTitle}>{comic.title}</span>
                <span className={styles.comicChapter}>{comic.chapter}</span>
              </div>
            </article>
          ))}
          {filteredAndSortedMangas.length === 0 && (
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
