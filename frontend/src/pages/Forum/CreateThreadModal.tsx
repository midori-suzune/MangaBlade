import {useRef, useState} from "react";
import type {ReactNode} from "react";
import type {ClipboardEvent, FormEvent} from "react";
import {
    Bold,
    Code2,
    Eye,
    Heading1,
    Heading2,
    ImagePlus,
    Italic,
    Link,
    List,
    ListOrdered,
    PenLine,
    Plus,
    Quote,
    X
} from "lucide-react";
import {CommentEmojiPicker} from "../../components/CommentEmojiPicker/CommentEmojiPicker.tsx";
import type {ForumAttachmentResponse, ForumThreadCategory} from "../../types/forum.ts";
import {ForumMarkdown} from "./ForumMarkdown.tsx";
import styles from "./ForumPage.module.css";
import {THREAD_TITLE_MAX_LENGTH, threadCategories} from "./forumConstants.ts";

const MAX_FORUM_IMAGES = 5;
const imageMarkdownPattern = /!\[[^\]]*]\([^)]+\)/g;
type EditorMode = "write" | "preview";

function getClipboardImageFiles(event: ClipboardEvent): File[] {
    const filesFromClipboard = Array.from(event.clipboardData.files)
        .filter((file) => file.type.startsWith("image/"));
    const existingFileKeys = new Set(filesFromClipboard.map((file) => `${file.name}-${file.size}-${file.type}`));
    const filesFromItems = Array.from(event.clipboardData.items)
        .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file))
        .filter((file) => {
            const fileKey = `${file.name}-${file.size}-${file.type}`;
            if (existingFileKeys.has(fileKey)) return false;
            existingFileKeys.add(fileKey);
            return true;
        });

    return [...filesFromClipboard, ...filesFromItems];
}

export function CreateThreadModal({
    attachments,
    canUseAnnouncementCategory,
    category,
    content,
    isUploadingImage,
    submitLabel = "Đăng bài",
    title,
    modalTitle = "Tạo thread mới",
    uploadError,
    onAttachmentRemove,
    onCancel,
    onCategoryChange,
    onDismiss,
    onContentChange,
    onImageSelect,
    onSubmit,
    onTitleChange
}: {
    attachments: ForumAttachmentResponse[];
    canUseAnnouncementCategory: boolean;
    category: ForumThreadCategory;
    content: string;
    isUploadingImage: boolean;
    submitLabel?: string;
    title: string;
    modalTitle?: string;
    uploadError: string;
    onAttachmentRemove: (attachmentId: number) => void;
    onCancel: () => void;
    onCategoryChange: (category: ForumThreadCategory) => void;
    onDismiss: () => void;
    onContentChange: (content: string) => void;
    onImageSelect: (files: File[] | FileList | null, insertAt?: number) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onTitleChange: (title: string) => void;
}) {
    const canAddImages = attachments.length < MAX_FORUM_IMAGES && !isUploadingImage;
    const availableThreadCategories = canUseAnnouncementCategory
        ? threadCategories
        : threadCategories.filter((threadCategory) => threadCategory.value !== "ANNOUNCEMENT");
    const contentInputRef = useRef<HTMLTextAreaElement | null>(null);
    const contentHighlightRef = useRef<HTMLPreElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [editorMode, setEditorMode] = useState<EditorMode>("write");

    function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
        const imageFiles = getClipboardImageFiles(event);

        if (imageFiles.length === 0) return;

        event.preventDefault();
        onImageSelect(imageFiles, contentInputRef.current?.selectionStart);
    }

    function insertMarkdown(before: string, after = "", placeholder = "") {
        const textarea = contentInputRef.current;
        const selectionStart = textarea?.selectionStart ?? content.length;
        const selectionEnd = textarea?.selectionEnd ?? selectionStart;
        const selectedText = content.slice(selectionStart, selectionEnd) || placeholder;
        const nextContent = `${content.slice(0, selectionStart)}${before}${selectedText}${after}${content.slice(selectionEnd)}`;
        const nextCursor = selectionStart + before.length + selectedText.length + after.length;

        onContentChange(nextContent);
        setEditorMode("write");
        window.requestAnimationFrame(() => {
            contentInputRef.current?.focus();
            contentInputRef.current?.setSelectionRange(nextCursor, nextCursor);
        });
    }

    function insertLineMarkdown(prefix: string, placeholder: string) {
        const textarea = contentInputRef.current;
        const selectionStart = textarea?.selectionStart ?? content.length;
        const needsLineBreak = selectionStart > 0 && content[selectionStart - 1] !== "\n";
        insertMarkdown(needsLineBreak ? `\n${prefix}` : prefix, "", placeholder);
    }

    function insertEmojiToken(emojiToken: string) {
        const textarea = contentInputRef.current;
        const selectionStart = textarea?.selectionStart ?? content.length;
        const selectionEnd = textarea?.selectionEnd ?? selectionStart;
        const previousCharacter = content[selectionStart - 1];
        const nextCharacter = content[selectionEnd];
        const prefix = previousCharacter && !/\s/.test(previousCharacter) ? " " : "";
        const suffix = nextCharacter && !/\s/.test(nextCharacter) ? " " : "";
        const insertedText = `${prefix}${emojiToken}${suffix || " "}`;
        const nextContent = `${content.slice(0, selectionStart)}${insertedText}${content.slice(selectionEnd)}`;
        const nextCursor = selectionStart + insertedText.length;

        onContentChange(nextContent);
        setEditorMode("write");
        window.requestAnimationFrame(() => {
            contentInputRef.current?.focus();
            contentInputRef.current?.setSelectionRange(nextCursor, nextCursor);
        });
    }

    function renderHighlightedContent(value: string) {
        const nodes: ReactNode[] = [];
        let cursor = 0;

        for (const match of value.matchAll(imageMarkdownPattern)) {
            const index = match.index ?? 0;
            if (index > cursor) {
                nodes.push(value.slice(cursor, index));
            }
            nodes.push(
                <span className={styles.imageMarkdownToken} key={`${index}-${match[0]}`}>
                    {match[0]}
                </span>
            );
            cursor = index + match[0].length;
        }

        if (cursor < value.length) {
            nodes.push(value.slice(cursor));
        }

        return nodes.length > 0 ? nodes : null;
    }

    function syncHighlightScroll() {
        if (!contentInputRef.current || !contentHighlightRef.current) return;
        contentHighlightRef.current.scrollTop = contentInputRef.current.scrollTop;
        contentHighlightRef.current.scrollLeft = contentInputRef.current.scrollLeft;
    }

    return (
        <div
            className={styles.modalBackdrop}
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onDismiss();
                }
            }}
        >
            <form className={styles.createThreadModal} onSubmit={onSubmit}>
                <div className={styles.modalHeader}>
                    <div>
                        <h2>{modalTitle}</h2>
                    </div>
                    <button
                        className={styles.modalCloseButton}
                        type="button"
                        aria-label="Đóng"
                        onClick={onDismiss}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.modalCompactFields}>
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
                            {availableThreadCategories.map((threadCategory) => (
                                <option key={threadCategory.value} value={threadCategory.value}>{threadCategory.label}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className={styles.modalField}>
                    <span>Nội dung bài viết</span>
                    <div className={styles.postEditor}>
                        <div className={styles.editorToolbar}>
                            <div className={styles.editorModeTabs} role="tablist" aria-label="Chế độ soạn bài">
                                <button
                                    className={editorMode === "write" ? styles.activeEditorMode : ""}
                                    type="button"
                                    role="tab"
                                    aria-selected={editorMode === "write"}
                                    onClick={() => setEditorMode("write")}
                                >
                                    <PenLine size={14} />
                                    Viết
                                </button>
                                <button
                                    className={editorMode === "preview" ? styles.activeEditorMode : ""}
                                    type="button"
                                    role="tab"
                                    aria-selected={editorMode === "preview"}
                                    onClick={() => setEditorMode("preview")}
                                >
                                    <Eye size={14} />
                                    Xem trước
                                </button>
                            </div>
                            <span className={styles.toolbarDivider} />
                            <div className={styles.toolbarEmojiPicker}>
                                <CommentEmojiPicker
                                    className={styles.toolbarEmojiGrid}
                                    dispatchInsertEvent={false}
                                    panelPlacement="bottom"
                                    variant="toolbar"
                                    onSelect={insertEmojiToken}
                                />
                            </div>
                            <span className={styles.toolbarDivider} />
                            <button type="button" title="Heading 1" aria-label="Heading 1" onClick={() => insertLineMarkdown("# ", "Tiêu đề")}>
                                <Heading1 size={16} />
                            </button>
                            <button type="button" title="Heading 2" aria-label="Heading 2" onClick={() => insertLineMarkdown("## ", "Mục nhỏ")}>
                                <Heading2 size={16} />
                            </button>
                            <button type="button" title="In đậm" aria-label="In đậm" onClick={() => insertMarkdown("**", "**", "in đậm")}>
                                <Bold size={16} />
                            </button>
                            <button type="button" title="In nghiêng" aria-label="In nghiêng" onClick={() => insertMarkdown("*", "*", "in nghiêng")}>
                                <Italic size={16} />
                            </button>
                            <button type="button" title="Bullet list" aria-label="Bullet list" onClick={() => insertLineMarkdown("- ", "bullet")}>
                                <List size={16} />
                            </button>
                            <button type="button" title="Numbered list" aria-label="Numbered list" onClick={() => insertLineMarkdown("1. ", "numbered")}>
                                <ListOrdered size={16} />
                            </button>
                            <button type="button" title="Trích dẫn" aria-label="Trích dẫn" onClick={() => insertLineMarkdown("> ", "trích dẫn")}>
                                <Quote size={16} />
                            </button>
                            <button type="button" title="Link" aria-label="Link" onClick={() => insertMarkdown("[", "](https://)", "link")}>
                                <Link size={16} />
                            </button>
                            <button type="button" title="Code inline" aria-label="Code inline" onClick={() => insertMarkdown("`", "`", "code inline")}>
                                <Code2 size={16} />
                            </button>
                            <button
                                type="button"
                                title="Chèn ảnh"
                                aria-label="Chèn ảnh"
                                disabled={!canAddImages}
                                onClick={() => imageInputRef.current?.click()}
                            >
                                <ImagePlus size={16} />
                            </button>
                            <input
                                ref={imageInputRef}
                                className={styles.hiddenImageInput}
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                disabled={!canAddImages}
                                multiple
                                type="file"
                                onChange={(event) => {
                                    onImageSelect(event.target.files, contentInputRef.current?.selectionStart);
                                    event.target.value = "";
                                }}
                            />
                        </div>
                        {editorMode === "write" ? (
                            <div className={styles.markdownTextareaShell}>
                                <pre ref={contentHighlightRef} className={styles.markdownTextareaHighlight} aria-hidden="true">
                                    {renderHighlightedContent(content)}
                                    {content.endsWith("\n") ? " " : ""}
                                </pre>
                                <textarea
                                    ref={contentInputRef}
                                    className={styles.markdownTextareaInput}
                                    value={content}
                                    maxLength={10000}
                                    placeholder="Viết nội dung bài viết..."
                                    rows={7}
                                    spellCheck={false}
                                    onChange={(event) => onContentChange(event.target.value)}
                                    onPaste={handlePaste}
                                    onScroll={syncHighlightScroll}
                                />
                            </div>
                        ) : (
                            <div className={styles.markdownPreview}>
                                {content.trim() ? (
                                    <ForumMarkdown attachments={attachments} content={content} />
                                ) : (
                                    <div className={styles.emptyPreview}>Chưa có nội dung để xem trước.</div>
                                )}
                            </div>
                        )}
                        <div className={styles.editorCounter}>{content.length}/10000</div>
                    </div>
                </div>

                {editorMode === "write" && (
                    <div className={styles.modalField}>
                        <span>Ảnh đính kèm</span>
                        {uploadError && <div className={styles.attachmentError}>{uploadError}</div>}
                        {attachments.length > 0 && (
                            <div className={styles.attachmentPreviewGrid}>
                                {attachments.map((attachment) => (
                                    <div className={styles.attachmentPreviewItem} key={attachment.id}>
                                        <img src={attachment.url} alt="" />
                                        <button
                                            type="button"
                                            aria-label="Gỡ ảnh"
                                            onClick={() => onAttachmentRemove(attachment.id)}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {attachments.length === 0 && (
                            <div className={styles.emptyAttachmentState}>
                                {isUploadingImage ? "Đang tải ảnh..." : "Chưa có ảnh đính kèm."}
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.modalActions}>
                    <button className={styles.cancelThreadButton} type="button" onClick={onCancel}>
                        Hủy
                    </button>
                    <button
                        className={styles.createThreadButton}
                        type="submit"
                        disabled={!title.trim() || !content.trim() || isUploadingImage}
                    >
                        <Plus size={15} />
                        {isUploadingImage ? "Đang tải ảnh..." : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}
