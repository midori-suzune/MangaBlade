import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFollowedManga } from "../../../api/mangaApi";
import type { MangaResponse } from "../../../types/manga";
import { toSlug } from "../../../utils/slug";
import styles from "../UserProfile.module.css";

export function MangaMarkTag() {
    const [followedManga, setFollowedManga] = useState<MangaResponse[]>([]);
    const [loadingFollowed, setLoadingFollowed] = useState(true);

    useEffect(() => {
        getFollowedManga()
            .then((res) => {
                if (res.success && res.payload) {
                    setFollowedManga(res.payload);
                }
            })
            .catch((err) => {
                console.error("Failed to load followed manga:", err);
            })
            .finally(() => {
                setLoadingFollowed(false);
            });
    }, []);

    return (
        <div>
            <div className={styles.pageTitleSection}>
                <h1 className={styles.pageTitle}>Truyện đang theo dõi</h1>
                <p className={styles.pageSubtitle}>
                    Danh sách các bộ truyện bạn đã đánh dấu theo dõi.
                </p>
            </div>

            {loadingFollowed ? (
                <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>Đang tải danh sách...</p>
            ) : followedManga.length > 0 ? (
                <div className={styles.bookmarksGrid}>
                    {followedManga.map((manga) => (
                        <Link to={`/manga/${toSlug(manga.title)}`} key={manga.title} className={styles.mangaCard}>
                            <div className={styles.mangaCover}>
                                {manga.thumbUrl ? (
                                    <img src={manga.thumbUrl} alt={manga.title} />
                                ) : (
                                    <div className={styles.mangaCoverPlaceholder}>Ảnh Bìa</div>
                                )}
                            </div>
                            <div className={styles.mangaInfo}>
                                <h2 className={styles.mangaTitle}>{manga.title}</h2>
                                {manga.latestChapter?.chapterNumber && (
                                    <span className={styles.mangaProgress}>
                                        Chương {manga.latestChapter.chapterNumber}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "40px 0" }}>
                    Bạn chưa theo dõi bộ truyện nào.
                </p>
            )}
        </div>
    );
}
