import { useEffect, useState } from "react";
import { Check, Clock, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { getReadingHistory } from "../../api/mangaApi";
import type { ReadingHistoryResponse } from "../../types/manga";
import styles from "./ReadingHistory.module.css";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function getHistoryItemKey(item: ReadingHistoryResponse) {
    return `${item.mangaSlug}-${item.chapterNumber}`;
}

export function ReadingHistory() {
    const [items, setItems] = useState<ReadingHistoryResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const selectedCount = selectedKeys.length;

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        let cancelled = false;

        async function loadReadingHistory() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await getReadingHistory({
                    query: debouncedQuery || undefined,
                    page: 0,
                    size: 20,
                });

                if (!cancelled) {
                    setItems(response.success ? response.payload : []);
                    setSelectedKeys([]);
                }
            } catch {
                if (!cancelled) {
                    setItems([]);
                    setError("Không thể tải lịch sử đọc.");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadReadingHistory();

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    function toggleEditMode() {
        setIsEditing((current) => !current);
        setSelectedKeys([]);
    }

    function toggleSelected(itemKey: string) {
        setSelectedKeys((currentKeys) => (
            currentKeys.includes(itemKey)
                ? currentKeys.filter((key) => key !== itemKey)
                : [...currentKeys, itemKey]
        ));
    }

    function removeSelectedItems() {
        if (selectedKeys.length === 0) {
            return;
        }

        setItems((currentItems) => currentItems.filter((item) => !selectedKeys.includes(getHistoryItemKey(item))));
        setSelectedKeys([]);
        setIsEditing(false);
    }

    return (
        <main className={styles.historyPage}>
            <section className={styles.pageTitleBlock}>
                <h1>Lịch sử đọc truyện</h1>
                <p>Theo dõi các chương đã đọc gần đây và quay lại mạch truyện đang đọc dở.</p>
            </section>

            <div className={styles.dashboardGrid}>
                <section className={styles.recentPanel}>
                    <div className={styles.recentHeader}>
                        <div className={styles.headerTitle}>
                            <h2>Truyện Đang Đọc</h2>
                            <span>{items.length} truyện</span>
                        </div>
                        <div className={styles.headerActions}>
                            <label className={styles.historySearch}>
                                <Search size={15} />
                                    <input
                                        type="search"
                                    placeholder="Tìm lịch sử đọc"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                    />
                            </label>
                            <button type="button" className={styles.editButton} onClick={toggleEditMode}>
                                {isEditing ? "Huỷ" : "Sửa"}
                            </button>
                        </div>
                    </div>
                    <div className={styles.editToolbar}>
                        {isEditing && (
                            <button
                                type="button"
                                className={styles.deleteSelectedButton}
                                disabled={selectedCount === 0}
                                onClick={removeSelectedItems}
                            >
                                <Trash2 size={15} />
                                Xoá đã chọn{selectedCount > 0 ? ` (${selectedCount})` : ""}
                            </button>
                        )}
                    </div>
                    <div className={styles.recentList}>
                        {error && <p className={styles.listMessage}>{error}</p>}
                        {isLoading && <p className={styles.listMessage}>Đang tải lịch sử đọc...</p>}
                        {!isLoading && !error && items.length === 0 && (
                            <p className={styles.listMessage}>Không tìm thấy lịch sử đọc phù hợp.</p>
                        )}
                        {items.map((item) => {
                            const itemKey = getHistoryItemKey(item);
                            const isSelected = selectedKeys.includes(itemKey);

                            return (
                                <article className={`${styles.recentItem} ${isEditing ? styles.editingRecentItem : ""}`} key={itemKey}>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className={`${styles.selectButton} ${isSelected ? styles.selectedButton : ""}`}
                                            aria-label={isSelected ? "Bỏ chọn truyện" : "Chọn truyện"}
                                            onClick={() => toggleSelected(itemKey)}
                                        >
                                            {isSelected && <Check size={15} />}
                                        </button>
                                    )}
                                    <div className={styles.recentMain}>
                                        <Link to={`/manga/${item.mangaSlug}`} className={styles.recentThumb}>
                                            <img src={item.thumbUrl} alt={item.mangaTitle} />
                                        </Link>
                                        <div className={styles.recentInfo}>
                                            <span><Clock size={13} /> {formatDate(item.lastReadAt)}</span>
                                            <Link to={`/manga/${item.mangaSlug}`} className={styles.recentTitle}>{item.mangaTitle}</Link>
                                            <p>Chương {item.chapterNumber}</p>
                                        </div>
                                    </div>
                                    <Link to={`/manga/${item.mangaSlug}/c/${item.chapterNumber}`} className={styles.readButton}>
                                        Đọc tiếp
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                </section>
            </div>
        </main>
    );
}
