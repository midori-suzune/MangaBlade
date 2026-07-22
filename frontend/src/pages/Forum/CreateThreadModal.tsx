import type {FormEvent} from "react";
import {Plus, X} from "lucide-react";
import type {ForumThreadCategory} from "../../types/forum.ts";
import styles from "./ForumPage.module.css";
import {THREAD_TITLE_MAX_LENGTH, threadCategories} from "./forumConstants.ts";

export function CreateThreadModal({
    category,
    content,
    title,
    onCategoryChange,
    onClose,
    onContentChange,
    onSubmit,
    onTitleChange
}: {
    category: ForumThreadCategory;
    content: string;
    title: string;
    onCategoryChange: (category: ForumThreadCategory) => void;
    onClose: () => void;
    onContentChange: (content: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onTitleChange: (title: string) => void;
}) {
    return (
        <div
            className={styles.modalBackdrop}
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <form className={styles.createThreadModal} onSubmit={onSubmit}>
                <div className={styles.modalHeader}>
                    <div>
                        <h2>Tạo thread mới</h2>
                        <p>Chọn phân loại để người đọc tìm đúng chủ đề.</p>
                    </div>
                    <button
                        className={styles.modalCloseButton}
                        type="button"
                        aria-label="Đóng"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <label className={styles.modalField}>
                    <span>Tiêu đề</span>
                    <input
                        autoFocus
                        maxLength={THREAD_TITLE_MAX_LENGTH}
                        value={title}
                        placeholder="Nhập tiêu đề thread..."
                        onChange={(event) => onTitleChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                            }
                        }}
                    />
                    <span className={styles.fieldCounter}>
                        {title.length}/{THREAD_TITLE_MAX_LENGTH}
                    </span>
                </label>

                <label className={styles.modalField}>
                    <span>Phân loại</span>
                    <select
                        value={category}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                            }
                        }}
                        onChange={(event) => onCategoryChange(event.target.value as ForumThreadCategory)}
                    >
                        {threadCategories.map((threadCategory) => (
                            <option key={threadCategory.value} value={threadCategory.value}>{threadCategory.label}</option>
                        ))}
                    </select>
                </label>

                <label className={styles.modalField}>
                    <span>Nội dung bài viết</span>
                    <div className={styles.postEditor}>
                        <textarea
                            value={content}
                            maxLength={10000}
                            placeholder="Viết nội dung bài viết..."
                            rows={7}
                            onChange={(event) => onContentChange(event.target.value)}
                        />
                        <div className={styles.editorCounter}>{content.length}/10000</div>
                    </div>
                </label>

                <div className={styles.modalActions}>
                    <button className={styles.cancelThreadButton} type="button" onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        className={styles.createThreadButton}
                        type="submit"
                        disabled={!title.trim() || !content.trim()}
                    >
                        <Plus size={15} />
                        Đăng bài
                    </button>
                </div>
            </form>
        </div>
    );
}
