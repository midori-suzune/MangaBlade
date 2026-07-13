import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReadingHistory } from "../../../api/mangaApi";
import type { ReadingHistoryResponse } from "../../../types/manga";
import styles from "../UserProfile.module.css";

export function HistoryTab() {
    const navigate = useNavigate();
    const [realHistory, setRealHistory] = useState<ReadingHistoryResponse[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        getReadingHistory()
            .then((res) => {
                if (res.success && res.payload) {
                    setRealHistory(res.payload);
                }
            })
            .catch((err) => {
                console.error("Failed to load reading history:", err);
            })
            .finally(() => {
                setLoadingHistory(false);
            });
    }, []);

    return (
        <div>
            <div className={styles.pageTitleSection}>
                <h1 className={styles.pageTitle}>Lịch sử đọc</h1>
                <p className={styles.pageSubtitle}>
                    Lịch sử các chương truyện bạn đã đọc gần đây.
                </p>
            </div>

            {loadingHistory ? (
                <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>Đang tải lịch sử...</p>
            ) : realHistory.length > 0 ? (
                <div className={styles.bookmarksGrid}>
                    {realHistory.map((historyItem, idx) => (
                        <article 
                            key={idx} 
                            className={styles.mangaCard} 
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/manga/${historyItem.mangaSlug}/c/${historyItem.chapterNumber}`)}
                        >
                            <div className={styles.mangaCover}>
                                <span className={`${styles.mangaTag} ${styles.time}`}>
                                    {new Date(historyItem.lastReadAt).toLocaleDateString("vi-VN")}
                                </span>
                                <span className={`${styles.mangaTag} ${styles.hot}`}>Đọc tiếp</span>
                                {historyItem.thumbUrl ? (
                                    <img src={historyItem.thumbUrl} alt={historyItem.mangaTitle} />
                                ) : (
                                    <div className={styles.mangaCoverPlaceholder}>Ảnh Bìa</div>
                                )}
                            </div>
                            <div className={styles.mangaInfo}>
                                <h2 className={styles.mangaTitle}>{historyItem.mangaTitle}</h2>
                                <span className={styles.mangaProgress}>Chương {historyItem.chapterNumber}</span>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "40px 0" }}>
                    Bạn chưa đọc truyện nào gần đây.
                </p>
            )}
        </div>
    );
}
