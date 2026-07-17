import { useEffect, useMemo, useState } from "react";
import { Check, Search, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { getFollowedManga, markFollowedMangaLatestChapterSeen, toggleMangaFollow } from "../../api/mangaApi";
import { useAuthStore } from "../../stores/authStore";
import type { MangaResponse } from "../../types/manga";
import styles from "./FollowedManga.module.css";

function getFollowedItemKey(item: MangaResponse) {
    return item.slug;
}

export function FollowedManga() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const openAuthModal = useAuthStore((state) => state.openAuthModal);
    const [items, setItems] = useState<MangaResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const selectedCount = selectedKeys.length;

    const visibleItems = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();

        if (!keyword) {
            return items;
        }

        return items.filter((item) => (
            item.title.toLowerCase().includes(keyword)
            || item.slug.toLowerCase().includes(keyword)
        ));
    }, [items, searchQuery]);

    useEffect(() => {
        let cancelled = false;

        async function loadFollowedManga() {
            if (!isAuthenticated) {
                setItems([]);
                openAuthModal("login");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await getFollowedManga();

                if (!cancelled) {
                    setItems(response.success ? response.payload : []);
                    setSelectedKeys([]);
                }
            } catch {
                if (!cancelled) {
                    setItems([]);
                    setError("Không thể tải danh sách theo dõi.");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadFollowedManga();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, openAuthModal]);

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

    async function removeSelectedItems() {
        if (selectedKeys.length === 0) {
            return;
        }

        try {
            setError(null);
            await Promise.all(selectedKeys.map((slug) => toggleMangaFollow(slug)));
            setItems((currentItems) => currentItems.filter((item) => !selectedKeys.includes(getFollowedItemKey(item))));
            setSelectedKeys([]);
            setIsEditing(false);
        } catch {
            setError("Không thể bỏ theo dõi các truyện đã chọn.");
        }
    }

    async function readLatestChapter(item: MangaResponse) {
        const chapterNumber = item.latestChapter?.chapterNumber;

        if (!chapterNumber) {
            navigate(`/manga/${item.slug}`);
            return;
        }

        setItems((currentItems) => currentItems.map((currentItem) => (
            currentItem.slug === item.slug
                ? {
                    ...currentItem,
                    hasNewChapter: false,
                    lastSeenChapterNumber: chapterNumber,
                }
                : currentItem
        )));

        try {
            await markFollowedMangaLatestChapterSeen(item.slug);
        } catch {
            setError("Không thể cập nhật trạng thái chapter mới.");
        } finally {
            navigate(`/manga/${item.slug}/c/${chapterNumber}`);
        }
    }

    return (
        <main className={styles.followPage}>
            <section className={styles.pageTitleBlock}>
                <h1>Truyện theo dõi</h1>
                <p>Quản lý các bộ truyện đang theo dõi và mở nhanh chương mới nhất.</p>
            </section>

            <section className={styles.followPanel}>
                <div className={styles.followHeader}>
                    <div className={styles.headerTitle}>
                        <h2>Danh sách theo dõi</h2>
                        <span>{items.length} truyện</span>
                    </div>
                    <div className={styles.headerActions}>
                        <label className={styles.followSearch}>
                            <Search size={15} />
                            <input
                                type="search"
                                placeholder="Tìm truyện theo dõi"
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
                            Bỏ theo dõi{selectedCount > 0 ? ` (${selectedCount})` : ""}
                        </button>
                    )}
                </div>

                <div className={styles.followList}>
                    {error && <p className={styles.listMessage}>{error}</p>}
                    {isLoading && <p className={styles.listMessage}>Đang tải truyện theo dõi...</p>}
                    {!isLoading && !error && visibleItems.length === 0 && (
                        <p className={styles.listMessage}>Không tìm thấy truyện theo dõi phù hợp.</p>
                    )}
                    {visibleItems.map((item) => {
                        const itemKey = getFollowedItemKey(item);
                        const isSelected = selectedKeys.includes(itemKey);
                        return (
                            <article className={`${styles.followItem} ${isEditing ? styles.editingFollowItem : ""}`} key={itemKey}>
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
                                <Link to={`/manga/${item.slug}`} className={styles.followMain}>
                                    <img src={item.thumbUrl} alt={item.title} />
                                    <div className={styles.followInfo}>
                                        <h3>{item.title}</h3>
                                    </div>
                                </Link>
                                {!isEditing && item.hasNewChapter && (
                                    <button
                                        type="button"
                                        className={styles.readNewButton}
                                        onClick={() => void readLatestChapter(item)}
                                    >
                                        Chapter mới
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
