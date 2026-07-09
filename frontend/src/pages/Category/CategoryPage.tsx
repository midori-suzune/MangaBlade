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
  { id: 'hai-huoc', name: 'Hài hước', description: 'Thể loại mang lại tiếng cười sảng khoái, các tình huống dí dỏm, vui nhộn đời thường.' },
  { id: 'truyen-tranh', name: 'Truyện tranh', description: 'Các tác phẩm truyện tranh vẽ tay (Comic) phương Tây hoặc nội địa.' },
  { id: 'nau-an', name: 'Nấu ăn', description: 'Câu chuyện xoay quanh thế giới ẩm thực, thi đấu nấu ăn và các món ngon.' },
  { id: 'co-dai', name: 'Cổ đại', description: 'Truyện lấy bối cảnh lịch sử xưa, hoàng cung hoặc võ hiệp thời xưa.' },
  { id: 'dong-nhan', name: 'Đồng nhân', description: 'Thể loại truyện viết về các nhân vật sẵn có từ tác phẩm khác theo góc nhìn mới.' },
  { id: 'kich-tinh', name: 'Kịch tính', description: 'Những tình huống cao trào, thắt nút mở nút kích thích tâm lý người đọc.' },
  { id: 'ky-ao', name: 'Kỳ ảo', description: 'Thế giới tưởng tượng phong phú với phép thuật, thần thoại và các sinh vật huyền bí.' },
  { id: 'lich-su', name: 'Lịch sử', description: 'Các tác phẩm lấy cảm hứng hoặc tái hiện các sự kiện lịch sử có thật.' },
  { id: 'kinh-di', name: 'Kinh dị', description: 'Yếu tố giật gân, đáng sợ, khám phá khía cạnh tâm linh rùng rợn và hồi hộp.' },
  { id: 'nguoi-dong', name: 'Người đóng', description: 'Các bộ truyện được chuyển thể hoặc lấy phong cách từ phim ảnh đời thực.' },
  { id: 'vo-thuat', name: 'Võ thuật', description: 'Tập trung vào tinh thần thượng võ, các kỹ năng chiến đấu võ đạo đỉnh cao.' },
  { id: 'co-giap', name: 'Cơ giáp', description: 'Thể loại viễn tưởng tập trung vào các robot khổng lồ, chiến tranh công nghệ cao.' },
  { id: 'huyen-bi', name: 'Huyền bí', description: 'Những hiện tượng siêu nhiên chưa có lời giải đáp, kích thích sự tò mò.' },
  { id: 'ngon-tinh', name: 'Ngôn tình', description: 'Những câu chuyện tình cảm lãng mạn, sâu lắng và nhiều cung bậc cảm xúc giữa các nhân vật chính.' },
  { id: 'tam-ly', name: 'Tâm lý', description: 'Khai thác sâu vào thế giới nội tâm, suy nghĩ phức tạp của nhân vật.' },
  { id: 'doi-thuong', name: 'Đời thường', description: 'Những câu chuyện nhẹ nhàng, mộc mạc về cuộc sống hàng ngày đầy ý nghĩa.' },
  { id: 'the-thao', name: 'Thể thao', description: 'Xoay quanh hoạt động thể thao cá nhân hay đồng đội, tinh thần nỗ lực bền bỉ.' },
  { id: 'trinh-tham', name: 'Trinh thám', description: 'Những vụ án bí ẩn, các suy luận logic và cuộc đấu trí căng thẳng để tìm ra sự thật.' },
  { id: 'hoc-duong', name: 'Học đường', description: 'Xoay quanh cuộc sống học sinh, sinh viên, tình bạn, tình yêu tuổi học trò hồn nhiên.' }
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

function CheckIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <polyline points="1.5 4 3.5 6 6.5 2" />
    </svg>
  );
}

export function CategoryPage() {
  // Pending filter states
  const [pendingCategoryIds, setPendingCategoryIds] = useState<string[]>([]);
  const [pendingStatus, setPendingStatus] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [pendingSortBy, setPendingSortBy] = useState<string>('update');
  const [pendingAuthor, setPendingAuthor] = useState<string>('');

  // Applied filter states
  const [appliedCategoryIds, setAppliedCategoryIds] = useState<string[]>([]);
  const [appliedStatus, setAppliedStatus] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [appliedSortBy, setAppliedSortBy] = useState<string>('update');
  const [appliedAuthor, setAppliedAuthor] = useState<string>('');

  const handleToggleCategory = (id: string) => {
    if (id === 'all') {
      setPendingCategoryIds([]);
      return;
    }
    setPendingCategoryIds(prev => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter(cId => cId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleApplyFilters = () => {
    setAppliedCategoryIds(pendingCategoryIds);
    setAppliedStatus(pendingStatus);
    setAppliedSortBy(pendingSortBy);
    setAppliedAuthor(pendingAuthor);
  };

  const handleResetFilters = () => {
    setPendingCategoryIds([]);
    setPendingStatus('all');
    setPendingSortBy('update');
    setPendingAuthor('');

    setAppliedCategoryIds([]);
    setAppliedStatus('all');
    setAppliedSortBy('update');
    setAppliedAuthor('');
  };

  const selectedCategoryNames = useMemo(() => {
    if (appliedCategoryIds.length === 0) return '';
    return CATEGORIES
      .filter(c => appliedCategoryIds.includes(c.id))
      .map(c => c.name)
      .join(', ');
  }, [appliedCategoryIds]);

  const descriptionText = useMemo(() => {
    if (appliedCategoryIds.length === 0) {
      return 'Danh sách tổng hợp tất cả các bộ truyện tranh thuộc mọi thể loại.';
    }
    if (appliedCategoryIds.length === 1) {
      const cat = CATEGORIES.find(c => c.id === appliedCategoryIds[0]);
      return cat ? cat.description : '';
    }
    return `Đang lọc truyện theo sự kết hợp của các thể loại: ${selectedCategoryNames}.`;
  }, [appliedCategoryIds, selectedCategoryNames]);

  const filteredAndSortedMangas = useMemo(() => {
    const list = MOCK_MANGAS.filter(manga => {
      const matchesCategory = appliedCategoryIds.length === 0 || 
        appliedCategoryIds.every(cId => manga.categories.includes(cId));
      const matchesStatus = appliedStatus === 'all' || manga.status === appliedStatus;
      const matchesAuthor = !appliedAuthor.trim() || 
        manga.author.toLowerCase().includes(appliedAuthor.toLowerCase().trim());
      return matchesCategory && matchesStatus && matchesAuthor;
    });

    if (appliedSortBy === 'chapters') {
      return [...list].sort((a, b) => {
        const numA = parseFloat(a.chapter.replace(/[^\d.]/g, '')) || 0;
        const numB = parseFloat(b.chapter.replace(/[^\d.]/g, '')) || 0;
        return numB - numA;
      });
    }

    if (appliedSortBy === 'new') {
      return [...list].sort((a, b) => b.id.localeCompare(a.id));
    }

    return list;
  }, [appliedCategoryIds, appliedStatus, appliedAuthor, appliedSortBy]);

  return (
    <div className={styles.mainContainer}>
      <section className={styles.leftMain}>
        <h1 className={styles.pageTitle}>Tất cả thể loại truyện tranh</h1>
        
        <div className={styles.descriptionBox}>
          <p>{descriptionText}</p>
        </div>

        {/* Horizontal Category Selector with Checkboxes */}
        <div className={styles.categoriesSelector}>
          <span className={styles.selectorLabel}>Thể loại:</span>
          <div className={styles.categoriesList}>
            <button
              type="button"
              className={`${styles.categoryTag} ${pendingCategoryIds.length === 0 ? styles.activeTag : ''}`}
              onClick={() => handleToggleCategory('all')}
            >
              <span className={`${styles.checkbox} ${pendingCategoryIds.length === 0 ? styles.checked : ''}`}>
                {pendingCategoryIds.length === 0 && <CheckIcon />}
              </span>
              Tất cả
            </button>
            {CATEGORIES.map(category => {
              const isChecked = pendingCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`${styles.categoryTag} ${isChecked ? styles.activeTag : ''}`}
                  onClick={() => handleToggleCategory(category.id)}
                >
                  <span className={`${styles.checkbox} ${isChecked ? styles.checked : ''}`}>
                    {isChecked && <CheckIcon />}
                  </span>
                  {category.name}
                </button>
              );
            })}
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

      {/* Advanced Filter Panel on the Right */}
      <aside className={styles.rightMain}>
        <div className={styles.filterPanel}>
          <h2 className={styles.filterTitle}>Bộ lọc nâng cao</h2>
          
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Trạng thái:</span>
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
                className={`${styles.filterBtn} ${pendingStatus === 'completed' ? styles.activeStatus : ''}`}
                onClick={() => setPendingStatus('completed')}
              >
                Hoàn thành
              </button>
              <button 
                type="button"
                className={`${styles.filterBtn} ${pendingStatus === 'ongoing' ? styles.activeStatus : ''}`}
                onClick={() => setPendingStatus('ongoing')}
              >
                Đang tiến hành
              </button>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Tác giả:</span>
            <input 
              type="text" 
              className={styles.authorInput}
              placeholder="Nhập tên tác giả..." 
              value={pendingAuthor}
              onChange={(e) => setPendingAuthor(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Sắp xếp theo:</span>
            <div className={styles.sortFilters}>
              {[
                { id: 'update', label: 'Ngày cập nhật' },
                { id: 'new', label: 'Truyện mới' },
                { id: 'topall', label: 'Top all' },
                { id: 'topmonth', label: 'Top tháng' },
                { id: 'topweek', label: 'Top tuần' },
                { id: 'topday', label: 'Top ngày' },
                { id: 'follow', label: 'Theo dõi' },
                { id: 'comment', label: 'Bình luận' },
                { id: 'chapters', label: 'Số chapter' },
                { id: 'topfollow', label: 'Top Follow' }
              ].map(sortOpt => (
                <button
                  key={sortOpt.id}
                  type="button"
                  className={`${styles.sortBtn} ${pendingSortBy === sortOpt.id ? styles.activeSort : ''}`}
                  onClick={() => setPendingSortBy(sortOpt.id)}
                >
                  {sortOpt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button type="button" onClick={handleApplyFilters} className={styles.applyBtn}>
              Áp dụng
            </button>
            <button type="button" onClick={handleResetFilters} className={styles.resetBtn}>
              Đặt lại
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
