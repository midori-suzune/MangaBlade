import styles from "./Home.module.css";
import {useEffect, useState} from "react";
import {getManga} from "../../api/mangaApi.ts";
import type {MangaResponse} from "../../types/manga.ts";
import {getTimeAgo} from "../../utils/time.ts";

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

    const [manga, setManga] = useState<MangaResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getData() {
            try {
                const data = await getManga();
                setManga(data);
            } catch {
                setError("can not load manage data");
            }
        }
        void getData();
    }, []);

    return (
        <div className={styles.mainContainer}>
            <section className={styles.leftMain}>
                <div className={styles.sliderPlaceholder}>
                    <span>Slide Động</span>
                </div>

                <h2 className={styles.sectionTitle}>Truyện Mới Cập Nhật</h2>
                {error && <p className={styles.errorText}>{error}</p>}
                <div className={styles.comicGrid}>
                    {manga.map((comic) => (
                        <article className={styles.comicCard} key={`${comic.title}-${comic.latestChapter.chapterNumber}`}>
                            <a href="#" className={styles.comicCover} aria-label={comic.title}>
                                <span className={styles.comicTag}>{getTimeAgo(comic.updatedAt)}</span>
                                {/*{comic.hot && <span className={`${styles.comicTag} ${styles.hot}`}>Hot</span>}*/}
                                <img src={comic.thumbUrl}
                                     alt={comic.title}  />
                                <span className={styles.coverText}>Ảnh Bìa</span>
                            </a>
                            <div className={styles.comicInfo}>
                                <a href="#" className={styles.comicTitle}>{comic.title}</a>
                                <a href="#" className={styles.comicChapter}>{`Chapter ${comic.latestChapter.chapterNumber}`}</a>
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
