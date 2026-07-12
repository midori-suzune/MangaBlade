import styles from "./Home.module.css";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Eye, Heart} from "lucide-react";
import {getManga, getMangaRanking, getReadingHistory} from "../../api/mangaApi.ts";
import type {MangaRankingResponse, MangaResponse, ReadingHistoryResponse} from "../../types/manga.ts";
import {getTimeAgo} from "../../utils/time.ts";
import {MangaSlider} from "../../components/MangaSlider/MangaSlider.tsx";
import {toSlug} from "../../utils/slug.ts";
import {useAuthStore} from "../../stores/authStore.ts";

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

export function Home() {

    const [manga, setManga] = useState<MangaResponse[]>([]);
    const [ranking, setRanking] = useState<MangaRankingResponse[]>([]);
    const [rankingMode, setRankingMode] = useState<'likes' | 'follows'>('likes');
    const [readingHistory, setReadingHistory] = useState<ReadingHistoryResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const featuredManga = manga.slice(0, 5);

    useEffect(() => {
        async function getData() {
            try {
                const response = await getManga();
                if (response.success) {
                    setManga(response.payload);
                }
            } catch {
                setError("Không thể tải dữ liệu truyện");
            }
        }
        void getData();
    }, []);

    useEffect(() => {
        async function getRanking() {
            try {
                const response = await getMangaRanking(rankingMode);
                if (response.success) {
                    setRanking(response.payload);
                }
            } catch {
                setRanking([]);
            }
        }

        void getRanking();
    }, [rankingMode]);

    useEffect(() => {
        async function loadReadingHistory() {
            if (!isAuthenticated) {
                setReadingHistory([]);
                return;
            }

            try {
                const response = await getReadingHistory();
                if (response.success) {
                    setReadingHistory(response.payload);
                }
            } catch {
                setReadingHistory([]);
            }
        }

        void loadReadingHistory();
    }, [isAuthenticated]);

    function formatRankingCount(value: number) {
        return new Intl.NumberFormat("en-US").format(value);
    }

    return (
        <div className={styles.mainContainer}>
            <section className={styles.leftMain}>
                <MangaSlider manga={featuredManga} />

                <h2 className={styles.sectionTitle}>Truyện Mới Cập Nhật</h2>
                {error && <p className={styles.errorText}>{error}</p>}
                <div className={styles.comicGrid}>
                    {manga.map((comic) => (
                        <article className={styles.comicCard} key={`${comic.title}-${comic.latestChapter.chapterNumber}`}>
                            <Link
                                to={`/manga/${toSlug(comic.title)}`}
                                state={{manga: comic}}
                                className={styles.comicCover}
                                aria-label={comic.title}
                            >
                                <span className={styles.comicTag}>{getTimeAgo(comic.updatedAt)}</span>
                                {/*{comic.hot && <span className={`${styles.comicTag} ${styles.hot}`}>Hot</span>}*/}
                                <img src={comic.thumbUrl}
                                     alt={comic.title}  />
                                <span className={styles.coverText}>Ảnh Bìa</span>
                            </Link>
                            <div className={styles.comicInfo}>
                                <Link
                                    to={`/manga/${toSlug(comic.title)}`}
                                    state={{manga: comic}}
                                    className={styles.comicTitle}
                                >
                                    {comic.title}
                                </Link>
                                <Link
                                    to={`/manga/${toSlug(comic.title)}/c/${comic.latestChapter.chapterNumber}`}
                                    className={styles.comicChapter}
                                >
                                    {`Chapter ${comic.latestChapter.chapterNumber}`}
                                </Link>
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
                            <button
                                className={rankingMode === "likes" ? styles.activeFilter : ""}
                                type="button"
                                aria-label="Xếp hạng theo lượt thích"
                                title="Lượt thích"
                                onClick={() => setRankingMode("likes")}
                            >
                                <Heart className={styles.inlineIcon} aria-hidden="true" />
                            </button>
                            <button
                                className={rankingMode === "follows" ? styles.activeFilter : ""}
                                type="button"
                                aria-label="Xếp hạng theo lượt theo dõi"
                                title="Lượt theo dõi"
                                onClick={() => setRankingMode("follows")}
                            >
                                <Eye className={styles.inlineIcon} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div className={styles.sidebarList}>
                        {ranking.map((item, index) => (
                            <Link to={`/manga/${item.slug}`} className={styles.sidebarItem} key={item.slug}>
                                <span className={styles.sidebarNumber}>{index + 1}</span>
                                <span className={styles.sidebarThumb}>
                                    {item.thumbUrl && <img src={item.thumbUrl} alt={item.title} />}
                                </span>
                                <span className={styles.sidebarInfo}>
                                    <span className={styles.sidebarTitle}>{item.title}</span>
                                    <span className={styles.sidebarDesc}>
                                        {rankingMode === "likes" ? (
                                            <Heart className={styles.inlineIcon} aria-hidden="true" />
                                        ) : (
                                            <Eye className={styles.inlineIcon} aria-hidden="true" />
                                        )}
                                        {formatRankingCount(rankingMode === "likes" ? item.likeCount : item.followCount)}
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className={styles.sectionTitle}>Lịch Sử Đọc</h2>
                    {!isAuthenticated ? (
                        <p className={styles.loginRequiredText}>Vui lòng đăng nhập</p>
                    ) : readingHistory.length > 0 ? (
                        <div className={styles.historyList}>
                            {readingHistory.map((item) => (
                                <Link
                                    className={styles.historyItem}
                                    to={`/manga/${item.mangaSlug}/c/${item.chapterNumber}`}
                                    key={`${item.mangaSlug}-${item.chapterNumber}`}
                                >
                                    <span className={styles.historyThumb}>
                                        {item.thumbUrl && <img src={item.thumbUrl} alt={item.mangaTitle} />}
                                    </span>
                                    <span className={styles.historyInfo}>
                                        <span className={styles.historyTitle}>{item.mangaTitle}</span>
                                        <span className={styles.historyMeta}>
                                            Chương {item.chapterNumber}
                                        </span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.loginRequiredText}>Chưa có lịch sử đọc</p>
                    )}
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
