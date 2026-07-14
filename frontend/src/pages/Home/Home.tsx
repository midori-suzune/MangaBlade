import styles from "./Home.module.css";
import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {Eye, Heart} from "lucide-react";
import {getManga, getMangaRanking, getReadingHistory, getRecentUserComments} from "../../api/mangaApi.ts";
import type {
    MangaRankingResponse,
    MangaResponse,
    MangaWithLatestChapter,
    ReadingHistoryResponse,
    RecentCommentResponse
} from "../../types/manga.ts";
import {getTimeAgo} from "../../utils/time.ts";
import {MangaSlider} from "../../components/MangaSlider/MangaSlider.tsx";
import {toSlug} from "../../utils/slug.ts";
import {useAuthStore} from "../../stores/authStore.ts";
import {CommentText} from "../../components/CommentEmojiPicker/CommentText.tsx";

function getRandomManga<T>(items: T[], limit: number) {
    const shuffledItems = [...items];

    for (let index = shuffledItems.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
    }

    return shuffledItems.slice(0, limit);
}

function hasLatestChapter(comic: MangaResponse): comic is MangaWithLatestChapter {
    return Boolean(comic.latestChapter?.chapterNumber);
}

export function Home() {

    const [manga, setManga] = useState<MangaResponse[]>([]);
    const [ranking, setRanking] = useState<MangaRankingResponse[]>([]);
    const [likedRanking, setLikedRanking] = useState<MangaRankingResponse[]>([]);
    const [rankingMode, setRankingMode] = useState<'likes' | 'views'>('likes');
    const [readingHistory, setReadingHistory] = useState<ReadingHistoryResponse[]>([]);
    const [recentComments, setRecentComments] = useState<RecentCommentResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const readableManga = useMemo(() => manga.filter(hasLatestChapter), [manga]);

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
        async function getLikedRanking() {
            try {
                const response = await getMangaRanking("likes");
                if (response.success) {
                    setLikedRanking(response.payload);
                }
            } catch {
                setLikedRanking([]);
            }
        }

        void getLikedRanking();
    }, []);

    const featuredManga = useMemo(() => {
        if (readableManga.length === 0) {
            return [];
        }

        const rankedManga = likedRanking
            .map((rankedItem) => readableManga.find((comic) => (
                toSlug(comic.title) === rankedItem.slug || comic.title === rankedItem.title
            )))
            .filter((comic): comic is MangaWithLatestChapter => Boolean(comic));

        if (rankedManga.length > 0) {
            return getRandomManga(rankedManga, 5);
        }

        return getRandomManga(readableManga, 5);
    }, [likedRanking, readableManga]);

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

    useEffect(() => {
        async function loadRecentComments() {
            try {
                const response = await getRecentUserComments();
                if (response.success) {
                    setRecentComments(response.payload);
                }
            } catch {
                setRecentComments([]);
            }
        }

        void loadRecentComments();
    }, []);

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
                    {readableManga.map((comic) => (
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
                                className={rankingMode === "views" ? styles.activeFilter : ""}
                                type="button"
                                aria-label="Xếp hạng theo lượt đọc"
                                title="Lượt đọc"
                                onClick={() => setRankingMode("views")}
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
                                        {formatRankingCount(rankingMode === "likes" ? item.likeCount : item.viewCount)}
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
                        {recentComments.map((comment) => {
                            const commentTarget = comment.chapterNumber
                                ? `/manga/${comment.mangaSlug}/c/${comment.chapterNumber}`
                                : `/manga/${comment.mangaSlug}`;
                            const comicLabel = comment.chapterNumber
                                ? `${comment.mangaTitle} - Chương ${comment.chapterNumber}`
                                : comment.mangaTitle;

                            return (
                                <article className={styles.commentItem} key={comment.id}>
                                    <div className={styles.commentAvatar}>{comment.username.slice(0, 1).toUpperCase()}</div>
                                    <div className={styles.commentContent}>
                                        <div className={styles.commentHeader}>
                                            <span className={styles.commentAuthor}>{comment.username}</span>
                                            <span className={styles.commentTime}>{getTimeAgo(comment.createdAt)}</span>
                                        </div>
                                        <p className={styles.commentText}>
                                            <CommentText content={comment.content} />
                                        </p>
                                        <Link to={commentTarget} className={styles.commentComicTitle}>{comicLabel}</Link>
                                    </div>
                                </article>
                            );
                        })}
                        {recentComments.length === 0 && (
                            <p className={styles.loginRequiredText}>Chưa có bình luận mới</p>
                        )}
                    </div>
                </section>
            </aside>
        </div>
    )
}
