import {Link, useParams} from "react-router-dom";

import type {CommentReportReason, MangaCommentResponse, MangaDetailResponse, ReadingHistoryResponse} from "../../types/manga.ts";
import {getTimeAgo} from "../../utils/time.ts";
import styles from "./MangaDetailPage.module.css";
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {CommentEditor} from "../../components/CommentEmojiPicker/CommentEditor.tsx";
import {CommentEmojiPicker} from "../../components/CommentEmojiPicker/CommentEmojiPicker.tsx";
import {CommentText} from "../../components/CommentEmojiPicker/CommentText.tsx";
import {
    createCommentReport,
    createMangaComment,
    deleteMangaComment,
    getLatestReadingHistory,
    getMangaBySlug,
    getMangaComments,
    toggleCommentLike,
    toggleMangaFollow
} from "../../api/mangaApi.ts";
import {useAuthStore} from "../../stores/authStore.ts";
import { Flag, MessageSquare, PenTool, ThumbsUp, X } from "lucide-react";
import type { UserInfo } from "../../types/auth";

function getPlainTextFromHtml(html?: string) {
    if (!html) return "";

    const documentHtml = new DOMParser().parseFromString(html, "text/html");
    return documentHtml.body.textContent ?? "";
}

function getChapterNumbersFromStorage(key: string) {
    const value = sessionStorage.getItem(key);
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
        return [];
    }
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

interface MangaCommentItemProps {
    comment: MangaCommentResponse;
    expandedReplyParentIds: number[];
    getCommentAuthorName: (userId: number, username: string) => string;
    getTimeAgo: (dateString: string) => string;
    setReplyParentId: (id: number | null) => void;
    setReplyContent: (content: string) => void;
    setReplyingToUsername: (username: string | null) => void;
    setReplyError: (error: string | null) => void;
    canDeleteComment: (comment: MangaCommentResponse) => boolean;
    handleDeleteComment: (commentId: number) => void;
    deletingCommentId: number | null;
    toggleReplies: (id: number) => void;
    replyParentId: number | null;
    replyingToUsername: string | null;
    replyContent: string;
    submittingReplyParentId: number | null;
    handleSubmitReply: (parentId: number) => void;
    replyError: string | null;
    user: UserInfo | null;
    handleToggleLike: (commentId: number) => void;
    handleOpenReportModal: (comment: MangaCommentResponse) => void;
}

interface MangaReplyItemProps {
    reply: MangaCommentResponse["replies"][0];
    commentId: number;
    getCommentAuthorName: (userId: number, username: string) => string;
    getTimeAgo: (dateString: string) => string;
    setReplyParentId: (id: number | null) => void;
    setReplyContent: (content: string) => void;
    setReplyingToUsername: (username: string | null) => void;
    setReplyError: (error: string | null) => void;
    canDeleteComment: (reply: MangaCommentResponse) => boolean;
    handleDeleteComment: (commentId: number) => void;
    deletingCommentId: number | null;
    handleToggleLike: (commentId: number) => void;
    handleOpenReportModal: (comment: MangaCommentResponse) => void;
    user: UserInfo | null;
}

function MangaReplyItem({
    reply,
    commentId,
    getCommentAuthorName,
    getTimeAgo,
    setReplyParentId,
    setReplyContent,
    setReplyingToUsername,
    setReplyError,
    canDeleteComment,
    handleDeleteComment,
    deletingCommentId,
    handleToggleLike,
    handleOpenReportModal,
    user
}: MangaReplyItemProps) {
    return (
        <article className={styles.replyItem}>
            <div className={styles.replyAvatar}>
                {getCommentAuthorName(reply.user.id, reply.user.username).slice(0, 1).toUpperCase()}
            </div>
            <div className={styles.replyBody}>
                <div className={styles.commentBubble}>
                    <div className={styles.commentAuthorRow}>
                        <span className={styles.commentAuthor}>
                            {getCommentAuthorName(reply.user.id, reply.user.username)}
                        </span>
                        {(reply.isAuthor || reply.user?.isAuthor) && (
                            <span 
                                style={{ 
                                    marginLeft: "8px", 
                                    fontSize: "11px", 
                                    padding: "2px 8px", 
                                    borderRadius: "12px", 
                                    backgroundColor: "#e0e7ff",
                                    color: "#4f46e5",
                                    border: "1px solid #c7d2fe",
                                    fontWeight: "bold",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    verticalAlign: "middle"
                                }}
                                title="Tác giả của bộ truyện"
                            >
                                <PenTool size={11} /> Tác giả
                            </span>
                        )}
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
                    <button
                        type="button"
                        onClick={() => handleToggleLike(reply.id)}
                        style={{
                            color: reply.isLiked ? "#3b82f6" : "inherit",
                            fontWeight: reply.isLiked ? "bold" : "normal",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                        }}
                    >
                        <ThumbsUp size={13} fill={reply.isLiked ? "#3b82f6" : "none"} color={reply.isLiked ? "#3b82f6" : "currentColor"} />
                        {reply.likeCount && reply.likeCount > 0 ? reply.likeCount : "Thích"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setReplyParentId(commentId);
                            setReplyContent("");
                            setReplyingToUsername(getCommentAuthorName(reply.user.id, reply.user.username));
                            setReplyError(null);
                        }}
                        style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                    >
                        <MessageSquare size={12} /> Trả lời
                    </button>
                    {user && user.id !== reply.user.id && (
                        <button
                            type="button"
                            onClick={() => handleOpenReportModal(reply)}
                            title="Báo cáo bình luận vi phạm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                        >
                            <Flag size={12} /> Báo cáo
                        </button>
                    )}
                    {canDeleteComment(reply) && (
                        <button
                            type="button"
                            onClick={() => void handleDeleteComment(reply.id)}
                            disabled={deletingCommentId === reply.id}
                        >
                            {deletingCommentId === reply.id ? "Đang gỡ..." : "Gỡ"}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

interface MangaReplyInputProps {
    comment: MangaCommentResponse;
    replyingToUsername: string | null;
    getCommentAuthorName: (userId: number, username: string) => string;
    replyContent: string;
    setReplyContent: (content: string) => void;
    setReplyParentId: (id: number | null) => void;
    setReplyingToUsername: (username: string | null) => void;
    setReplyError: (error: string | null) => void;
    handleSubmitReply: (parentId: number) => void;
    submittingReplyParentId: number | null;
    replyError: string | null;
    user: UserInfo | null;
}

function MangaReplyInput({
    comment,
    replyingToUsername,
    getCommentAuthorName,
    replyContent,
    setReplyContent,
    setReplyParentId,
    setReplyingToUsername,
    setReplyError,
    handleSubmitReply,
    submittingReplyParentId,
    replyError,
    user
}: MangaReplyInputProps) {
    return (
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
    );
}

interface CommentBubbleProps {
    comment: MangaCommentResponse;
    getCommentAuthorName: (userId: number, username: string) => string;
    getTimeAgo: (value: string) => string;
    setReplyParentId: (v: number | null) => void;
    setReplyContent: (v: string) => void;
    setReplyingToUsername: (v: string | null) => void;
    setReplyError: (v: string | null) => void;
    canDeleteComment: (c: MangaCommentResponse) => boolean;
    handleDeleteComment: (id: number) => void;
    deletingCommentId: number | null;
    user: UserInfo | null;
    handleToggleLike: (id: number) => void;
    handleOpenReportModal: (c: MangaCommentResponse) => void;
}

function CommentBubble({
    comment,
    getCommentAuthorName,
    getTimeAgo,
    setReplyParentId,
    setReplyContent,
    setReplyingToUsername,
    setReplyError,
    canDeleteComment,
    handleDeleteComment,
    deletingCommentId,
    user,
    handleToggleLike,
    handleOpenReportModal
}: CommentBubbleProps) {
    return (
        <>
            <div className={styles.commentBubble}>
                <div className={styles.commentAuthorRow}>
                    <span className={styles.commentAuthor}>
                        {getCommentAuthorName(comment.user.id, comment.user.username)}
                    </span>
                    {(comment.isAuthor || comment.user?.isAuthor) && (
                        <span 
                            style={{ 
                                marginLeft: "8px", 
                                fontSize: "11px", 
                                padding: "2px 8px", 
                                borderRadius: "12px", 
                                backgroundColor: "#e0e7ff",
                                color: "#4f46e5",
                                border: "1px solid #c7d2fe",
                                fontWeight: "bold",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                verticalAlign: "middle"
                            }}
                            title="Tác giả của bộ truyện"
                        >
                            <PenTool size={11} /> Tác giả
                        </span>
                    )}
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
                <button
                    type="button"
                    onClick={() => handleToggleLike(comment.id)}
                    style={{
                        color: comment.isLiked ? "#3b82f6" : "inherit",
                        fontWeight: comment.isLiked ? "bold" : "normal",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}
                >
                    <ThumbsUp size={13} fill={comment.isLiked ? "#3b82f6" : "none"} color={comment.isLiked ? "#3b82f6" : "currentColor"} />
                    {comment.likeCount && comment.likeCount > 0 ? comment.likeCount : "Thích"}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setReplyParentId(comment.id);
                        setReplyContent("");
                        setReplyingToUsername(getCommentAuthorName(comment.user.id, comment.user.username));
                        setReplyError(null);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                >
                    <MessageSquare size={12} /> Trả lời
                </button>
                {user && user.id !== comment.user.id && (
                    <button
                        type="button"
                        onClick={() => handleOpenReportModal(comment)}
                        title="Báo cáo bình luận vi phạm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                    >
                        <Flag size={12} /> Báo cáo
                    </button>
                )}
                {canDeleteComment(comment) && (
                    <button
                        type="button"
                        onClick={() => void handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                    >
                        {deletingCommentId === comment.id ? "Đang gỡ..." : "Gỡ"}
                    </button>
                )}
            </div>
        </>
    );
}

function MangaCommentItem({
    comment,
    expandedReplyParentIds,
    getCommentAuthorName,
    getTimeAgo,
    setReplyParentId,
    setReplyContent,
    setReplyingToUsername,
    setReplyError,
    canDeleteComment,
    handleDeleteComment,
    deletingCommentId,
    toggleReplies,
    replyParentId,
    replyingToUsername,
    replyContent,
    submittingReplyParentId,
    handleSubmitReply,
    replyError,
    user,
    handleToggleLike,
    handleOpenReportModal
}: MangaCommentItemProps) {
    const isRepliesExpanded = expandedReplyParentIds.includes(comment.id);
    return (
        <article className={styles.commentItem}>
            <div className={styles.commentAvatar}>
                {getCommentAuthorName(comment.user.id, comment.user.username).slice(0, 1).toUpperCase()}
            </div>
            <div className={styles.commentBody}>
                <CommentBubble
                    comment={comment}
                    getCommentAuthorName={getCommentAuthorName}
                    getTimeAgo={getTimeAgo}
                    setReplyParentId={setReplyParentId}
                    setReplyContent={setReplyContent}
                    setReplyingToUsername={setReplyingToUsername}
                    setReplyError={setReplyError}
                    canDeleteComment={canDeleteComment}
                    handleDeleteComment={handleDeleteComment}
                    deletingCommentId={deletingCommentId}
                    user={user}
                    handleToggleLike={handleToggleLike}
                    handleOpenReportModal={handleOpenReportModal}
                />
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
                            <MangaReplyItem
                                key={reply.id}
                                reply={reply}
                                commentId={comment.id}
                                getCommentAuthorName={getCommentAuthorName}
                                getTimeAgo={getTimeAgo}
                                setReplyParentId={setReplyParentId}
                                setReplyContent={setReplyContent}
                                setReplyingToUsername={setReplyingToUsername}
                                setReplyError={setReplyError}
                                canDeleteComment={canDeleteComment}
                                handleDeleteComment={handleDeleteComment}
                                deletingCommentId={deletingCommentId}
                                handleToggleLike={handleToggleLike}
                                handleOpenReportModal={handleOpenReportModal}
                                user={user}
                            />
                        ))}
                    </div>
                )}
                {replyParentId === comment.id && (
                    <MangaReplyInput
                        comment={comment}
                        replyingToUsername={replyingToUsername}
                        getCommentAuthorName={getCommentAuthorName}
                        replyContent={replyContent}
                        setReplyContent={setReplyContent}
                        setReplyParentId={setReplyParentId}
                        setReplyingToUsername={setReplyingToUsername}
                        setReplyError={setReplyError}
                        handleSubmitReply={handleSubmitReply}
                        submittingReplyParentId={submittingReplyParentId}
                        replyError={replyError}
                        user={user}
                    />
                )}
            </div>
        </article>
    );
}

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
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
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

    // Comment Report & Like states
    const [reportingComment, setReportingComment] = useState<MangaCommentResponse | null>(null);
    const [commentReportReason, setCommentReportReason] = useState<CommentReportReason>("SPAM");
    const [commentReportDesc, setCommentReportDesc] = useState("");
    const [commentReportSubmitting, setCommentReportSubmitting] = useState(false);
    const [commentReportMsg, setCommentReportMsg] = useState("");

    async function handleToggleLike(commentId: number) {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }
        try {
            const res = await toggleCommentLike(commentId);
            if (res.success && res.payload) {
                const { liked, likeCount } = res.payload;
                const updateLike = (list: MangaCommentResponse[]): MangaCommentResponse[] => {
                    return list.map((item) => {
                        if (item.id === commentId) {
                            return { ...item, isLiked: liked, likeCount };
                        }
                        if (item.replies && item.replies.length > 0) {
                            return { ...item, replies: updateLike(item.replies) };
                        }
                        return item;
                    });
                };
                setComments((prev) => updateLike(prev));
            }
        } catch (err) {
            console.error("Failed to toggle comment like:", err);
        }
    }

    function handleOpenReportModal(c: MangaCommentResponse) {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }
        setReportingComment(c);
        setCommentReportReason("SPAM");
        setCommentReportDesc("");
        setCommentReportMsg("");
    }

    async function handleSubmitCommentReport(e: React.FormEvent) {
        e.preventDefault();
        if (!reportingComment) return;
        setCommentReportSubmitting(true);
        setCommentReportMsg("");
        try {
            const res = await createCommentReport(reportingComment.id, {
                reason: commentReportReason,
                description: commentReportDesc.trim() || undefined,
            });
            if (res.success) {
                setCommentReportMsg("Gửi báo cáo bình luận thành công! Cảm ơn bạn.");
                setTimeout(() => {
                    setReportingComment(null);
                    setCommentReportMsg("");
                }, 1500);
            }
        } catch {
            setCommentReportMsg("Báo cáo thất bại, vui lòng thử lại.");
        } finally {
            setCommentReportSubmitting(false);
        }
    }

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
    const authorNames = authors
        .map((author) => author.name?.trim())
        .filter((name): name is string => Boolean(name));
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

    function canDeleteComment(comment: MangaCommentResponse) {
        return Boolean(user && (user.role === "ADMIN" || user.id === comment.user.id));
    }

    function removeCommentById(commentList: MangaCommentResponse[], commentId: number) {
        return commentList
            .filter((comment) => comment.id !== commentId)
            .map((comment) => ({
                ...comment,
                replies: comment.replies?.filter((reply) => reply.id !== commentId) ?? [],
            }));
    }

    async function handleDeleteComment(commentId: number) {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn gỡ bình luận này?")) {
            return;
        }

        try {
            setDeletingCommentId(commentId);
            setCommentError(null);
            await deleteMangaComment(commentId);
            setComments((currentComments) => removeCommentById(currentComments, commentId));
        } catch {
            setCommentError("Không thể gỡ bình luận");
        } finally {
            setDeletingCommentId(null);
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
                                    {authorNames.length > 0 ? authorNames.join(", ") : "Đang cập nhật"}
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
                                <MangaCommentItem
                                    key={comment.id}
                                    comment={comment}
                                    expandedReplyParentIds={expandedReplyParentIds}
                                    getCommentAuthorName={getCommentAuthorName}
                                    getTimeAgo={getTimeAgo}
                                    setReplyParentId={setReplyParentId}
                                    setReplyContent={setReplyContent}
                                    setReplyingToUsername={setReplyingToUsername}
                                    setReplyError={setReplyError}
                                    canDeleteComment={canDeleteComment}
                                    handleDeleteComment={handleDeleteComment}
                                    deletingCommentId={deletingCommentId}
                                    toggleReplies={toggleReplies}
                                    replyParentId={replyParentId}
                                    replyingToUsername={replyingToUsername}
                                    replyContent={replyContent}
                                    submittingReplyParentId={submittingReplyParentId}
                                    handleSubmitReply={handleSubmitReply}
                                    replyError={replyError}
                                    user={user}
                                    handleToggleLike={handleToggleLike}
                                    handleOpenReportModal={handleOpenReportModal}
                                />
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

            {/* Modal Báo cáo Bình luận */}
            {reportingComment && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    backdropFilter: "blur(4px)"
                }} onClick={() => setReportingComment(null)}>
                    <div style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        width: "90%",
                        maxWidth: "440px",
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: 700 }}>Báo cáo bình luận</h3>
                            <button
                                type="button"
                                onClick={() => setReportingComment(null)}
                                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCommentReport} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: 600, marginBottom: "6px" }}>
                                    Lý do báo cáo:
                                </label>
                                <select
                                    value={commentReportReason}
                                    onChange={(e) => setCommentReportReason(e.target.value as CommentReportReason)}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", outline: "none" }}
                                >
                                    <option value="SPAM">Spam / Quảng cáo rác</option>
                                    <option value="HARASSMENT">Ngôn từ xúc phạm / Độc hại</option>
                                    <option value="SPOILER">Tiết lộ nội dung / Spoiler</option>
                                    <option value="HATE_SPEECH">Phát ngôn thù ghét</option>
                                    <option value="OTHER">Lý do khác</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: 600, marginBottom: "6px" }}>
                                    Mô tả thêm (Không bắt buộc):
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Chi tiết lý do báo cáo..."
                                    value={commentReportDesc}
                                    onChange={(e) => setCommentReportDesc(e.target.value)}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", resize: "none", outline: "none" }}
                                />
                            </div>

                            {commentReportMsg && (
                                <p style={{ margin: 0, fontSize: "13px", color: commentReportMsg.includes("thành công") ? "#10b981" : "#ef4444" }}>
                                    {commentReportMsg}
                                </p>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                                <button
                                    type="button"
                                    onClick={() => setReportingComment(null)}
                                    style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={commentReportSubmitting}
                                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-accent)", color: "#ffffff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                                >
                                    {commentReportSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
