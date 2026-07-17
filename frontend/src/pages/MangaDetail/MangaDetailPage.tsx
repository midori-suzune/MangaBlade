import {Link, useParams} from "react-router-dom";

import type {MangaCommentResponse, MangaDetailResponse, ReadingHistoryResponse} from "../../types/manga.ts";
import {getTimeAgo} from "../../utils/time.ts";
import styles from "./MangaDetailPage.module.css";
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {CommentEditor} from "../../components/CommentEmojiPicker/CommentEditor.tsx";
import {CommentEmojiPicker} from "../../components/CommentEmojiPicker/CommentEmojiPicker.tsx";
import {CommentText} from "../../components/CommentEmojiPicker/CommentText.tsx";
import {
    createMangaComment,
    getLatestReadingHistory,
    getMangaBySlug,
    getMangaComments,
    toggleMangaFollow
} from "../../api/mangaApi.ts";
import {useAuthStore} from "../../stores/authStore.ts";

function getPlainTextFromHtml(html?: string) {
    if (!html) return "";

    const documentHtml = new DOMParser().parseFromString(html, "text/html");
    return documentHtml.body.textContent ?? "";
}

function getChapterNumbersFromStorage(key: string) {
    const value = sessionStorage.getItem(key);
    if (!value) return [];

    try {
        const chapterNumbers = JSON.parse(value);
        if (Array.isArray(chapterNumbers)) {
            return chapterNumbers.filter((chapterNumber): chapterNumber is string => typeof chapterNumber === "string");
        }
    } catch {
        return [];
    }

    return [];
}

function getPublicUsername(username: string) {
    const atIndex = username.indexOf("@");
    if (atIndex > 0) {
        return username.slice(0, atIndex);
    }

    return username;
}

function getCommentAuthorName(userId: number, username: string) {
    const currentUser = useAuthStore.getState().user;
    if (currentUser && currentUser.id === userId) {
        return useAuthStore.getState().displayName || getPublicUsername(username);
    }
    const cachedName = localStorage.getItem(`displayName_${userId}`);
    return cachedName || getPublicUsername(username);
}

const EMPTY_CHAPTERS: MangaDetailResponse["chapters"] = [];
const EMPTY_AUTHORS: MangaDetailResponse["authors"] = [];
const EMPTY_CATEGORIES: MangaDetailResponse["categories"] = [];
const COMMENTS_PER_PAGE = 5;

export function MangaDetailPage() {
    const {slug = ""} = useParams<{slug: string}>();
    const [manga, setManga] = useState<MangaDetailResponse>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [comments, setComments] = useState<MangaCommentResponse[]>([]);
    const [continueHistory, setContinueHistory] = useState<ReadingHistoryResponse | null>(null);
    const [commentContent, setCommentContent] = useState("");
    const [commentError, setCommentError] = useState<string | null>(null);
    const [replyParentId, setReplyParentId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
    const [replyError, setReplyError] = useState<string | null>(null);
    const [expandedReplyParentIds, setExpandedReplyParentIds] = useState<number[]>([]);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [submittingReplyParentId, setSubmittingReplyParentId] = useState<number | null>(null);
    const [visibleCommentCount, setVisibleCommentCount] = useState(COMMENTS_PER_PAGE);
    const chapterListRef = useRef<HTMLDivElement>(null);
    const chapterListScrollTop = useRef(0);
    const selectedChapterRef = useRef<HTMLLIElement>(null);
    const activeChapterStorageKey = `manga-detail-active-chapter-${slug}`;
    const visitedChaptersStorageKey = `manga-detail-visited-chapters-${slug}`;
    const [activeChapterNumber, setActiveChapterNumber] = useState<string | null>(() => {
        return sessionStorage.getItem(activeChapterStorageKey);
    });
    const [visitedChapterNumbers, setVisitedChapterNumbers] = useState<string[]>(() => {
        return getChapterNumbersFromStorage(visitedChaptersStorageKey);
    });
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const openAuthModal = useAuthStore((state) => state.openAuthModal);

    useEffect(() => {

        async function loadMangaDetail() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getMangaBySlug(slug);
                if (response.success) {
                    setManga(response.payload);
                    return;
                }

                setError("Không thể tải thông tin truyện");
            } catch {
                setError("Không thể tải thông tin truyện");
            } finally {
                setIsLoading(false);
            }
        }

        void loadMangaDetail();
    }, [slug]);

    useEffect(() => {
        async function loadComments() {
            try {
                const response = await getMangaComments(slug);
                if (response.success) {
                    setComments(response.payload);
                    setVisibleCommentCount(COMMENTS_PER_PAGE);
                }
            } catch {
                setComments([]);
                setVisibleCommentCount(COMMENTS_PER_PAGE);
            }
        }

        void loadComments();
    }, [slug]);

    useEffect(() => {
        async function loadContinueHistory() {
            if (!isAuthenticated) {
                setContinueHistory(null);
                return;
            }

            try {
                const response = await getLatestReadingHistory(slug);
                setContinueHistory(response.success ? response.payload : null);
            } catch {
                setContinueHistory(null);
            }
        }

        void loadContinueHistory();
    }, [isAuthenticated, slug]);

    const title = manga?.title
    const thumbUrl = manga?.thumbUrl
    const updatedAt = manga?.updatedAt
    const chapters = manga?.chapters ?? EMPTY_CHAPTERS
    const description = manga?.description
    const status = manga?.status
    const sourceType = manga?.sourceType
    const authors = manga?.authors ?? EMPTY_AUTHORS
    const categories = manga?.categories ?? EMPTY_CATEGORIES
    const firstChapter = chapters[chapters.length - 1]
    const descriptionText = useMemo(() => getPlainTextFromHtml(description), [description]);
    const visibleComments = comments.slice(0, visibleCommentCount);
    const hasMoreComments = visibleCommentCount < comments.length;

    useLayoutEffect(() => {
        if (activeChapterNumber && selectedChapterRef.current) {
            selectedChapterRef.current.scrollIntoView({
                block: "center",
            });
            sessionStorage.removeItem(activeChapterStorageKey);
            return;
        }

        if (chapterListRef.current) {
            chapterListRef.current.scrollTop = chapterListScrollTop.current;
        }
    }, [activeChapterNumber, activeChapterStorageKey, chapters]);

    function handleChapterListScroll() {
        if (chapterListRef.current) {
            chapterListScrollTop.current = chapterListRef.current.scrollTop;
        }
    }

    function handleChapterClick(chapterNumber: string) {
        setActiveChapterNumber(chapterNumber);
        sessionStorage.setItem(activeChapterStorageKey, chapterNumber);

        setVisitedChapterNumbers((currentChapterNumbers) => {
            if (currentChapterNumbers.includes(chapterNumber)) {
                return currentChapterNumbers;
            }

            const nextChapterNumbers = [...currentChapterNumbers, chapterNumber];
            sessionStorage.setItem(visitedChaptersStorageKey, JSON.stringify(nextChapterNumbers));
            return nextChapterNumbers;
        });
    }

    async function handleToggleFollow() {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        try {
            setActionError(null);
            const response = await toggleMangaFollow(slug);
            if (response.success && response.payload) {
                setManga((currentManga) => currentManga ? {
                    ...currentManga,
                    followed: response.payload.followed,
                } : currentManga);
            }
        } catch {
            setActionError("Không thể cập nhật theo dõi");
        }
    }

    async function handleSubmitComment() {
        const content = commentContent.trim();

        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        if (!content) {
            setCommentError("Vui lòng nhập bình luận");
            return;
        }

        try {
            setIsSubmittingComment(true);
            setCommentError(null);
            const response = await createMangaComment(slug, {content});
            if (response.success && response.payload) {
                setComments((currentComments) => [response.payload, ...currentComments]);
                setVisibleCommentCount((currentCount) => Math.max(currentCount, COMMENTS_PER_PAGE));
                setCommentContent("");
            }
        } catch {
            setCommentError("Không thể gửi bình luận");
        } finally {
            setIsSubmittingComment(false);
        }
    }

    async function handleSubmitReply(parentId: number) {
        const content = replyContent.trim();

        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        if (!content) {
            setReplyError("Vui lòng nhập trả lời");
            return;
        }

        try {
            setSubmittingReplyParentId(parentId);
            setReplyError(null);
            const replyText = replyingToUsername ? `@${replyingToUsername} ${content}` : content;
            const response = await createMangaComment(slug, {content: replyText, parentId});
            if (response.success && response.payload) {
                setComments((currentComments) => currentComments.map((comment) => {
                    if (comment.id !== parentId) {
                        return comment;
                    }

                    return {
                        ...comment,
                        replies: [...(comment.replies ?? []), response.payload],
                    };
                }));
                setExpandedReplyParentIds((currentIds) => currentIds.includes(parentId)
                    ? currentIds
                    : [...currentIds, parentId]);
                setReplyParentId(null);
                setReplyContent("");
                setReplyingToUsername(null);
            }
        } catch {
            setReplyError("Không thể gửi trả lời");
        } finally {
            setSubmittingReplyParentId(null);
        }
    }

    function toggleReplies(parentId: number) {
        setExpandedReplyParentIds((currentIds) => currentIds.includes(parentId)
            ? currentIds.filter((currentId) => currentId !== parentId)
            : [...currentIds, parentId]);
    }

    return (
        <div className={styles.mainContainer}>
            <section className={styles.detailContainer}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link to="/">Trang Chủ</Link>
                    <span>/</span>
                    <span className={styles.current}>{title}</span>
                </nav>

                {error && <p className={styles.errorText}>{error}</p>}

                <section className={styles.mangaInfoBox}>
                    <div className={styles.coverFrame}>
                        {thumbUrl ? <img src={thumbUrl} alt={title}/> :
                            <span className={styles.coverPlaceholder}>Ảnh Bìa</span>}
                    </div>

                    <div className={styles.mangaDetails}>
                        <h1 className={styles.mangaTitle}>{title}</h1>

                        <ul className={styles.mangaMeta}>
                            <li>
                                <span className={styles.metaLabel}>Tên khác</span>
                                <span className={styles.metaValue}>{title}</span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Tác giả</span>
                                <span className={styles.metaValue}>
                                    {authors.length > 0 ? authors.map((author) => author.name).join(", ") : "Đang cập nhật"}
                                </span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Thể loại</span>
                                <span className={styles.metaValue}>
                                    {categories.length > 0 ? categories.map((category) => category.name).join(", ") : "Đang cập nhật"}
                                </span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Cập nhật</span>
                                <span
                                    className={styles.metaValue}>{updatedAt ? updatedAt.split("T")[0] : "Đang cập nhật"}</span>
                            </li>

                            <li>
                                <span className={styles.metaLabel}>Tình trạng</span>
                                <span className={styles.metaValue}>{status}</span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Nguồn</span>
                                <span className={styles.metaValue}>{sourceType}</span>
                            </li>
                        </ul>

                        <div className={styles.mangaActions}>
                            <Link
                                className={`${styles.actionButton} ${styles.readButton}`}
                                to={`/manga/${slug}/c/${firstChapter?.chapterNumber}`}
                                aria-disabled={!firstChapter}
                            >
                                Đọc từ đầu
                            </Link>
                            {continueHistory && (
                                <Link
                                    className={`${styles.actionButton} ${styles.continueButton}`}
                                    to={`/manga/${slug}/c/${continueHistory.chapterNumber}`}
                                >
                                    Đọc tiếp
                                </Link>
                            )}
                            <button
                                className={`${styles.actionButton} ${styles.followButton} ${manga?.followed ? styles.activeActionButton : ""}`}
                                type="button"
                                onClick={handleToggleFollow}
                            >
                                {manga?.followed ? "Đã theo dõi" : "Theo dõi"}
                            </button>
                        </div>
                        {actionError && <p className={styles.actionErrorText}>{actionError}</p>}
                    </div>
                </section>

                <section className={styles.mangaSection}>
                    <h2 className={styles.sectionTitle}>Giới Thiệu</h2>
                    <p className={styles.description}>{descriptionText}</p>
                </section>

                <section className={styles.mangaSection}>
                    <h2 className={styles.sectionTitle}>Danh Sách Chương</h2>
                    <div
                        className={styles.chapterListContainer}
                        ref={chapterListRef}
                        onScroll={handleChapterListScroll}
                    >
                        {chapters.length > 0 ? (
                            <ul className={styles.chapterList}>
                                {chapters.map((chapter) => {
                                    const isSelectedChapter = activeChapterNumber === chapter.chapterNumber;
                                    const isVisitedChapter = visitedChapterNumbers.includes(chapter.chapterNumber);

                                    return (
                                        <li
                                            key={`${chapter.chapterNumber}-${chapter.chapterUrl}`}
                                            ref={isSelectedChapter ? selectedChapterRef : undefined}
                                        >
                                            <Link
                                                to={`/manga/${slug}/c/${chapter.chapterNumber}`}
                                                className={`${styles.chapterName} ${isVisitedChapter ? styles.visitedChapterName : ""}`}
                                                onClick={() => handleChapterClick(chapter.chapterNumber)}
                                            >
                                                Chương {chapter.chapterNumber}
                                            </Link>
                                            <span
                                                className={styles.chapterDate}>{updatedAt ? getTimeAgo(updatedAt) : "Đang cập nhật"}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className={styles.emptyText}>{isLoading ? "Đang tải danh sách chương..." : "Chưa có chương nào."}</p>
                        )}
                    </div>
                </section>

                <section className={styles.mangaSection}>
                    <h2 className={styles.sectionTitle}>Bình Luận</h2>
                    <div className={styles.commentInputBox}>
                        <div className={styles.commentAvatar}>
                            {user?.username?.slice(0, 1).toUpperCase() ?? "U"}
                        </div>
                        <div className={styles.commentInputWrapper}>
                            <CommentEditor
                                placeholder="Nhập bình luận của bạn về truyện này..."
                                minRows={3}
                                value={commentContent}
                                onChange={setCommentContent}
                            />
                            <div className={styles.commentActions}>
                                <CommentEmojiPicker />
                                <button
                                    className={styles.submitCommentButton}
                                    type="button"
                                    onClick={handleSubmitComment}
                                    disabled={isSubmittingComment}
                                >
                                    {isSubmittingComment ? "Đang gửi..." : "Gửi bình luận"}
                                </button>
                            </div>
                            {commentError && <p className={styles.commentErrorText}>{commentError}</p>}
                        </div>
                    </div>

                    <div className={styles.commentList}>
                        {comments.length > 0 ? (
                            visibleComments.map((comment) => (
                                <article className={styles.commentItem} key={comment.id}>
                                    {(() => {
                                        const isRepliesExpanded = expandedReplyParentIds.includes(comment.id);

                                        return (
                                            <>
                                                <div className={styles.commentAvatar}>
                                                    {getCommentAuthorName(comment.user.id, comment.user.username).slice(0, 1).toUpperCase()}
                                                </div>
                                                <div className={styles.commentBody}>
                                                    <div className={styles.commentBubble}>
                                                        <div className={styles.commentAuthorRow}>
                                                            <span
                                                                className={styles.commentAuthor}>{getCommentAuthorName(comment.user.id, comment.user.username)}</span>
                                                            {comment.user.activeTitle && (
                                                                <span 
                                                                    style={{ 
                                                                        marginLeft: "8px", 
                                                                        fontSize: "10px", 
                                                                        padding: "1px 6px", 
                                                                        borderRadius: "3px", 
                                                                        backgroundColor: `${comment.user.activeTitleColor || '#6b7280'}18`,
                                                                        color: comment.user.activeTitleColor || '#6b7280',
                                                                        border: `1px solid ${comment.user.activeTitleColor || '#6b7280'}`,
                                                                        fontWeight: "bold",
                                                                        verticalAlign: "middle"
                                                                    }}
                                                                >
                                                                    {comment.user.activeTitle}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className={styles.commentText}>
                                                            <CommentText content={comment.content} />
                                                        </p>
                                                    </div>
                                                    <div className={styles.commentFooter}>
                                                        <span>{getTimeAgo(comment.createdAt)}</span>
                                                        <button type="button">Thích</button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setReplyParentId(comment.id);
                                                                setReplyContent("");
                                                                setReplyingToUsername(getCommentAuthorName(comment.user.id, comment.user.username));
                                                                setReplyError(null);
                                                            }}
                                                        >
                                                            Trả lời
                                                        </button>
                                                        <button type="button">Báo cáo</button>
                                                    </div>
                                                    {comment.replies?.length > 0 && (
                                                        <button
                                                            className={styles.replyCountButton}
                                                            type="button"
                                                            onClick={() => toggleReplies(comment.id)}
                                                        >
                                                            {isRepliesExpanded ? "Ẩn phản hồi" : `${comment.replies.length} phản hồi`}
                                                        </button>
                                                    )}
                                                    {comment.replies?.length > 0 && isRepliesExpanded && (
                                            <div className={styles.replyList}>
                                                {comment.replies.map((reply) => (
                                                    <article className={styles.replyItem} key={reply.id}>
                                                        <div className={styles.replyAvatar}>
                                                            {getCommentAuthorName(reply.user.id, reply.user.username).slice(0, 1).toUpperCase()}
                                                        </div>
                                                        <div className={styles.replyBody}>
                                                            <div className={styles.commentBubble}>
                                                                <div className={styles.commentAuthorRow}>
                                                                    <span className={styles.commentAuthor}>
                                                                        {getCommentAuthorName(reply.user.id, reply.user.username)}
                                                                    </span>
                                                                    {reply.user.activeTitle && (
                                                                        <span 
                                                                            style={{ 
                                                                                marginLeft: "8px", 
                                                                                fontSize: "10px", 
                                                                                padding: "1px 6px", 
                                                                                borderRadius: "3px", 
                                                                                backgroundColor: `${reply.user.activeTitleColor || '#6b7280'}18`,
                                                                                color: reply.user.activeTitleColor || '#6b7280',
                                                                                border: `1px solid ${reply.user.activeTitleColor || '#6b7280'}`,
                                                                                fontWeight: "bold",
                                                                                verticalAlign: "middle"
                                                                            }}
                                                                        >
                                                                            {reply.user.activeTitle}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className={styles.commentText}>
                                                                    <CommentText content={reply.content} />
                                                                </p>
                                                            </div>
                                                            <div className={styles.commentFooter}>
                                                                <span>{getTimeAgo(reply.createdAt)}</span>
                                                                <button type="button">Thích</button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setReplyParentId(comment.id);
                                                                        setReplyContent("");
                                                                        setReplyingToUsername(getCommentAuthorName(reply.user.id, reply.user.username));
                                                                        setReplyError(null);
                                                                    }}
                                                                >
                                                                    Trả lời
                                                                </button>
                                                                <button type="button">Báo cáo</button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                                    )}
                                                    {replyParentId === comment.id && (
                                            <div className={styles.replyInputBox}>
                                                <div className={styles.replyAvatar}>
                                                    {user?.username?.slice(0, 1).toUpperCase() ?? "U"}
                                                </div>
                                                <div className={styles.commentInputWrapper}>
                                                    <CommentEditor
                                                        placeholder={`Trả lời ${replyingToUsername ?? getCommentAuthorName(comment.user.id, comment.user.username)}...`}
                                                        minRows={2}
                                                        value={replyContent}
                                                        onChange={setReplyContent}
                                                    />
                                                    <div className={styles.replyActions}>
                                                        <CommentEmojiPicker />
                                                        <div className={styles.replyButtonGroup}>
                                                            <button
                                                                className={styles.cancelReplyButton}
                                                                type="button"
                                                                onClick={() => {
                                                                    setReplyParentId(null);
                                                                    setReplyContent("");
                                                                    setReplyingToUsername(null);
                                                                    setReplyError(null);
                                                                }}
                                                            >
                                                                Hủy
                                                            </button>
                                                            <button
                                                                className={styles.submitCommentButton}
                                                                type="button"
                                                                onClick={() => handleSubmitReply(comment.id)}
                                                                disabled={submittingReplyParentId === comment.id}
                                                            >
                                                                {submittingReplyParentId === comment.id ? "Đang gửi..." : "Gửi trả lời"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {replyError && <p className={styles.commentErrorText}>{replyError}</p>}
                                                </div>
                                            </div>
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </article>
                            ))
                        ) : (
                            <p className={styles.emptyText}>Chưa có bình luận nào.</p>
                        )}
                    </div>
                    {hasMoreComments && (
                        <div className={styles.commentMoreActions}>
                            <button
                                className={styles.loadMoreCommentsButton}
                                type="button"
                                onClick={() => setVisibleCommentCount((currentCount) => currentCount + COMMENTS_PER_PAGE)}
                            >
                                Xem thêm
                            </button>
                        </div>
                    )}
                </section>
            </section>
        </div>
    );
}
