import { useState } from "react";
import { Bell, Check, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import styles from "./FollowedMangaPrototype.module.css";

const followedItems = [
    {
        mangaSlug: "dai-quan-gia-la-ma-hoang",
        mangaTitle: "Đại Quản Gia Là Ma Hoàng",
        latestChapter: "61",
        hasNewChapter: true,
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/dai-quan-gia-la-ma-hoang-thumb.jpg",
        updatedAt: "2026-07-16T15:12:00.000Z",
        status: "Đang tiến hành",
    },
    {
        mangaSlug: "witchriv",
        mangaTitle: "Witchriv",
        latestChapter: "12",
        hasNewChapter: true,
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/witchriv-thumb.jpg",
        updatedAt: "2026-07-16T09:30:00.000Z",
        status: "Đang tiến hành",
    },
    {
        mangaSlug: "doc-thoai-cua-nguoi-duoc-si",
        mangaTitle: "Độc thoại của người dược sĩ",
        latestChapter: "18",
        hasNewChapter: false,
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/doc-thoai-cua-nguoi-duoc-si-thumb.jpg",
        updatedAt: "2026-07-15T08:44:00.000Z",
        status: "Đang tiến hành",
    },
    {
        mangaSlug: "blue-box",
        mangaTitle: "Blue Box",
        latestChapter: "27",
        hasNewChapter: false,
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/blue-box-thumb.jpg",
        updatedAt: "2026-07-15T07:05:00.000Z",
        status: "Đang tiến hành",
    },
    {
        mangaSlug: "tham-tu-conan",
        mangaTitle: "Thám Tử Conan",
        latestChapter: "103",
        hasNewChapter: false,
        thumbUrl: "https://img.otruyenapi.com/uploads/comics/tham-tu-conan-thumb.jpg",
        updatedAt: "2026-07-14T11:18:00.000Z",
        status: "Đang tiến hành",
    },
];

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function getFollowedItemKey(item: (typeof followedItems)[number]) {
    return item.mangaSlug;
}

export function FollowedMangaPrototype() {
    const [items, setItems] = useState(followedItems);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const selectedCount = selectedKeys.length;

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

        setItems((currentItems) => currentItems.filter((item) => !selectedKeys.includes(getFollowedItemKey(item))));
        setSelectedKeys([]);
        setIsEditing(false);
    }

    return (
        <main className={styles.followPage}>
            <section className={styles.pageTitleBlock}>
                <span>Thư viện cá nhân</span>
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
                            <input type="search" placeholder="Tìm truyện theo dõi" />
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
                    {items.map((item) => {
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
                                <Link to={`/manga/${item.mangaSlug}`} className={styles.followMain}>
                                    <img src={item.thumbUrl} alt={item.mangaTitle} />
                                    <div className={styles.followInfo}>
                                        <span><Bell size={13} /> Cập nhật {formatDate(item.updatedAt)}</span>
                                        <h3>{item.mangaTitle}</h3>
                                        <p>{item.status}</p>
                                    </div>
                                </Link>
                                <div className={styles.followMeta}>
                                    {item.hasNewChapter && <span className={styles.newBadge}>Mới</span>}
                                    <Link to={`/manga/${item.mangaSlug}/c/${item.latestChapter}`} className={styles.chapterButton}>
                                        Chapter {item.latestChapter}
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
