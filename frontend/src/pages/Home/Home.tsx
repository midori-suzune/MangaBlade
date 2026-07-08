import styles from "./Home.module.css";

const comics = [
    {title: "Bảng Trạng Thái Bí Mật...", chapter: "Chapter 32", time: "42 Phút Trước"},
    {title: "Destiny Unchain Online", chapter: "Chapter 41", time: "1 Giờ Trước", hot: true},
    {title: "Sự Thức Tỉnh Của Hắc M...", chapter: "Chapter 183", time: "1 Giờ Trước", hot: true},
    {title: "Lúc Đó Tôi Không Biết...", chapter: "Chapter 80", time: "2 Giờ Trước"},
    {title: "Shakkin 100 Oku No Ka...", chapter: "Chapter 6.5", time: "2 Giờ Trước"},
    {title: "Cao Thủ Xuống Núi", chapter: "Chapter 120", time: "3 Giờ Trước"},
    {title: "Bắt Đầu Đánh Dấu Thánh...", chapter: "Chapter 55", time: "3 Giờ Trước"},
    {title: "Trọng Sinh Trở Lại", chapter: "Chapter 90", time: "4 Giờ Trước"},
    {title: "Ma Tôn Trở Lại", chapter: "Chapter 220", time: "5 Giờ Trước", hot: true},
    {title: "Học Viện Pháp Thuật", chapter: "Chapter 34", time: "6 Giờ Trước"},
    {title: "Thiên Đạo Tu Thư Quán", chapter: "Chapter 112", time: "6 Giờ Trước"},
    {title: "Toàn Trí Độc Giả", chapter: "Chapter 98", time: "7 Giờ Trước"},
    {title: "Nguyên Tôn", chapter: "Chapter 500", time: "10 Giờ Trước"},
    {title: "Võ Thần Chúa Tể", chapter: "Chapter 3102", time: "12 Giờ Trước", hot: true},
    {title: "Thiên Kim Khảo Cổ", chapter: "Chapter 45", time: "1 Ngày Trước"},
    {title: "Hồi Sinh Thập Niên 80", chapter: "Chapter 15", time: "1 Ngày Trước"},
    {title: "Ta Bất Địch Thiên Hạ", chapter: "Chapter 19", time: "2 Ngày Trước"},
    {title: "Nghịch Thiên Tà Thần", chapter: "Chapter 2005", time: "2 Ngày Trước"},
    {title: "Yêu Thần Ký", chapter: "Chapter 310", time: "3 Ngày Trước"},
    {title: "Luyện Khí Mười Vạn Năm", chapter: "Chapter 145", time: "4 Ngày Trước"},
];

const ranking = [
    {title: "Võ Luyện Đỉnh Phong", views: "15,432,000"},
    {title: "Đại Quản Gia Là Ma Hoàng", views: "9,120,500"},
    {title: "Solo Leveling", views: "8,050,100"},
];

const history = [
    {title: "Ta Là Tà Đế", desc: "Đọc tiếp: Chap 150"},
    {title: "Trọng Sinh Đô Thị Tu Tiên", desc: "Đọc tiếp: Chap 20"},
];

const comments = [
    {
        author: "DarkKnight99",
        time: "5 phút trước",
        text: "Trận này main đánh ảo quá, hóng chap sau xem ông trưởng lão xử lý sao.",
        comic: "Võ Luyện Đỉnh Phong - Chap 3512",
    },
    {
        author: "HoaHongGai",
        time: "12 phút trước",
        text: "Nét vẽ bộ này ngày càng đẹp lên, nội dung cũng cuốn nữa. Cảm ơn nhóm dịch nhiều.",
        comic: "Đại Quản Gia Là Ma Hoàng - Chap 450",
    },
    {
        author: "WibuChua",
        time: "30 phút trước",
        text: "Cho mình hỏi lịch ra chap mới của bộ này là thứ mấy hàng tuần vậy mọi người?",
        comic: "Solo Leveling - Chap 179",
    },
    {
        author: "SherlockHomeless",
        time: "2 giờ trước",
        text: "Theo kinh nghiệm đọc truyện của tôi thì nhân vật này có thể là trùm cuối giả dạng.",
        comic: "Toàn Trí Độc Giả - Chap 98",
    },
    {
        author: "TrinhThamPho",
        time: "2 giờ trước",
        text: "Theo kinh nghiệm đọc truyện của tôi thì nhân vật này có thể là trùm cuối giả dạng.",
        comic: "Toàn Trí Độc Giả - Chap 98",
    },
];

function EyeIcon() {
    return (
        <svg className={styles.inlineIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    )
}

export function Home() {
    return (
        <div className={styles.mainContainer}>
            <section className={styles.leftMain}>
                <div className={styles.sliderPlaceholder}>
                    <span>Slide Động</span>
                </div>

                <h2 className={styles.sectionTitle}>Truyện Mới Cập Nhật</h2>
                <div className={styles.comicGrid}>
                    {comics.map((comic) => (
                        <article className={styles.comicCard} key={`${comic.title}-${comic.chapter}`}>
                            <a href="#" className={styles.comicCover} aria-label={comic.title}>
                                <span className={styles.comicTag}>{comic.time}</span>
                                {comic.hot && <span className={`${styles.comicTag} ${styles.hot}`}>Hot</span>}
                                <span className={styles.coverText}>Ảnh Bìa</span>
                            </a>
                            <div className={styles.comicInfo}>
                                <a href="#" className={styles.comicTitle}>{comic.title}</a>
                                <a href="#" className={styles.comicChapter}>{comic.chapter}</a>
                            </div>
                        </article>
                    ))}
                </div>

                <nav className={styles.pagination} aria-label="Phân trang truyện mới">
                    {["«", "‹", "1", "2", "3", "4", "5", "›", "»"].map((page) => (
                        <a href="#" className={`${styles.pageLink} ${page === "2" ? styles.active : ""}`} key={page}>
                            {page}
                        </a>
                    ))}
                </nav>
            </section>

            <aside className={styles.rightMain}>
                <section>
                    <div className={styles.rankingHeader}>
                        <h2 className={styles.sectionTitle}>Bảng Xếp Hạng</h2>
                        <div className={styles.rankingFilters}>
                            <button className={styles.activeFilter} type="button">Ngày</button>
                            <button type="button">Tuần</button>
                            <button type="button">Tháng</button>
                        </div>
                    </div>
                    <div className={styles.sidebarList}>
                        {ranking.map((item, index) => (
                            <a href="#" className={styles.sidebarItem} key={item.title}>
                                <span className={styles.sidebarNumber}>{index + 1}</span>
                                <span className={styles.sidebarThumb}></span>
                                <span className={styles.sidebarInfo}>
                                    <span className={styles.sidebarTitle}>{item.title}</span>
                                    <span className={styles.sidebarDesc}><EyeIcon /> {item.views}</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className={styles.sectionTitle}>Lịch Sử Đọc</h2>
                    <div className={styles.sidebarList}>
                        {history.map((item) => (
                            <a href="#" className={styles.sidebarItem} key={item.title}>
                                <span className={styles.sidebarThumb}></span>
                                <span className={styles.sidebarInfo}>
                                    <span className={styles.sidebarTitle}>{item.title}</span>
                                    <span className={styles.sidebarDesc}>{item.desc}</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className={styles.sectionTitle}>Bình Luận Mới</h2>
                    <div className={styles.commentList}>
                        {comments.map((comment) => (
                            <article className={styles.commentItem} key={`${comment.author}-${comment.comic}`}>
                                <div className={styles.commentAvatar}>{comment.author.slice(0, 1)}</div>
                                <div className={styles.commentContent}>
                                    <div className={styles.commentHeader}>
                                        <span className={styles.commentAuthor}>{comment.author}</span>
                                        <span className={styles.commentTime}>{comment.time}</span>
                                    </div>
                                    <p className={styles.commentText}>{comment.text}</p>
                                    <a href="#" className={styles.commentComicTitle}>{comment.comic}</a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </aside>
        </div>
    )
}
