import { useState } from "react";
import { Clock, EllipsisVertical, Search } from "lucide-react";
import { Link } from "react-router-dom";

import styles from "./ReadingHistoryPrototype.module.css";

const historyItems = [
    {
        mangaSlug: "witchriv",
        mangaTitle: "Witchriv",
        chapterNumber: "12",
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/witchriv-thumb.jpg",
        lastReadAt: "2026-07-16T09:30:00.000Z",
        progress: 65,
    },
    {
        mangaSlug: "dai-quan-gia-la-ma-hoang",
        mangaTitle: "Đại Quản Gia Là Ma Hoàng",
        chapterNumber: "61",
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/dai-quan-gia-la-ma-hoang-thumb.jpg",
        lastReadAt: "2026-07-15T15:12:00.000Z",
        progress: 48,
    },
    {
        mangaSlug: "doc-thoai-cua-nguoi-duoc-si",
        mangaTitle: "Độc thoại của người dược sĩ",
        chapterNumber: "18",
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/doc-thoai-cua-nguoi-duoc-si-thumb.jpg",
        lastReadAt: "2026-07-15T08:44:00.000Z",
        progress: 33,
    },
    {
        mangaSlug: "blue-box",
        mangaTitle: "Blue Box",
        chapterNumber: "27",
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/blue-box-thumb.jpg",
        lastReadAt: "2026-07-15T07:05:00.000Z",
        progress: 66,
    },
    {
        mangaSlug: "tham-tu-conan",
        mangaTitle: "Thám Tử Conan",
        chapterNumber: "103",
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/tham-tu-conan-thumb.jpg",
        lastReadAt: "2026-07-14T11:18:00.000Z",
        progress: 21,
    },
];

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function ReadingHistoryPrototype() {
    const [activeTab, setActiveTab] = useState<"reading" | "read">("reading");
    const actionLabel = activeTab === "read" ? "Đọc lại" : "Đọc tiếp";

    return (
        <main className={styles.historyPage}>
            <section className={styles.pageTitleBlock}>
                <span>Lịch sử cá nhân</span>
                <h1>Lịch sử đọc truyện</h1>
                <p>Theo dõi các chương đã đọc gần đây và quay lại mạch truyện đang đọc dở.</p>
            </section>

            <div className={styles.dashboardGrid}>
                <section className={styles.recentPanel}>
                    <div className={styles.recentHeader}>
                        <div className={styles.historyTabs}>
                            <button
                                type="button"
                                className={activeTab === "reading" ? styles.activeHistoryTab : ""}
                                onClick={() => setActiveTab("reading")}
                            >
                                Truyện đang đọc
                            </button>
                            <button
                                type="button"
                                className={activeTab === "read" ? styles.activeHistoryTab : ""}
                                onClick={() => setActiveTab("read")}
                            >
                                Truyện đã đọc
                            </button>
                        </div>
                        <label className={styles.historySearch}>
                            <Search size={15} />
                            <input type="search" placeholder="Tìm truyện đã đọc" />
                        </label>
                    </div>
                    <div className={styles.recentList}>
                        {historyItems.map((item) => (
                            <article className={styles.recentItem} key={`${item.mangaSlug}-${item.chapterNumber}`}>
                                <Link to={`/manga/${item.mangaSlug}/c/${item.chapterNumber}`} className={styles.recentMain}>
                                    <img src={item.thumbUrl} alt={item.mangaTitle} />
                                    <div className={styles.recentInfo}>
                                        <span><Clock size={13} /> {formatDate(item.lastReadAt)}</span>
                                        <h3>{item.mangaTitle}</h3>
                                        <p>Chương {item.chapterNumber}</p>
                                    </div>
                                </Link>
                                <Link to={`/manga/${item.mangaSlug}/c/${item.chapterNumber}`} className={styles.readButton}>
                                    {actionLabel}
                                </Link>
                                <button type="button" className={styles.moreButton} aria-label="Tùy chọn">
                                    <EllipsisVertical size={18} />
                                </button>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
