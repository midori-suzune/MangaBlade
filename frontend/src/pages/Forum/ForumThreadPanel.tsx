import {MessageCircle, Plus, Users} from "lucide-react";
import type {ForumThreadResponse} from "../../types/forum.ts";
import styles from "./ForumPage.module.css";
import {categoryLabels, threadCategories, type CategoryFilter} from "./forumConstants.ts";
import {formatTime} from "./forumUtils.ts";

export function ForumThreadPanel({
    activeCategory,
    activeThreadId,
    isAuthenticated,
    isLoadingThreads,
    onlineCounts,
    threads,
    onCreateClick,
    onSelectCategory,
    onSelectThread
}: {
    activeCategory: CategoryFilter;
    activeThreadId: number | null;
    isAuthenticated: boolean;
    isLoadingThreads: boolean;
    onlineCounts: Record<number, number>;
    threads: ForumThreadResponse[];
    onCreateClick: () => void;
    onSelectCategory: (category: CategoryFilter) => void;
    onSelectThread: (threadId: number) => void;
}) {
    return (
        <section className={styles.threadPanel} aria-label="Danh sách chủ đề">
            <div className={styles.panelHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Diễn Đàn</h1>
                </div>
                <span className={styles.liveBadge}>Live</span>
            </div>

            <div className={styles.createThreadBar}>
                <button type="button" onClick={onCreateClick}>
                    <Plus size={16} />
                    {isAuthenticated ? "Đăng bài" : "Đăng nhập để đăng bài"}
                </button>
            </div>

            <div className={styles.categoryFilters} aria-label="Lọc thread theo phân loại">
                {[{label: "Tất cả", value: "ALL" as const}, ...threadCategories].map((category) => (
                    <button
                        className={category.value === activeCategory ? styles.activeCategoryFilter : ""}
                        key={category.value}
                        type="button"
                        onClick={() => onSelectCategory(category.value)}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            <div className={styles.threadList}>
                {isLoadingThreads && <div className={styles.emptyState}>Đang tải forum...</div>}
                {!isLoadingThreads && threads.length === 0 && (
                    <div className={styles.emptyState}>
                        {activeCategory === "ALL"
                            ? "Chưa có thread nào."
                            : `Chưa có thread trong ${categoryLabels[activeCategory]}.`}
                    </div>
                )}
                {threads.map((thread) => (
                    <button
                        className={`${styles.threadCard} ${thread.id === activeThreadId ? styles.activeThread : ""}`}
                        key={thread.id}
                        type="button"
                        onClick={() => onSelectThread(thread.id)}
                    >
                        <span className={styles.threadCategory}>{categoryLabels[thread.category]}</span>
                        <span className={styles.threadTitle}>{thread.title}</span>
                        <span className={styles.threadMeta}>
                            <span><MessageCircle size={14} /> {thread.commentCount} bình luận</span>
                            <span><Users size={14} /> {onlineCounts[thread.id] ?? 0}</span>
                            <span>{formatTime(thread.lastCommentedAt ?? thread.createdAt)}</span>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
