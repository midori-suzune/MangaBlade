import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {FormEvent} from "react";
import type {Client, StompSubscription} from "@stomp/stompjs";
import {
    MessageCircle,
    Plus,
    Send,
    Users,
    X
} from "lucide-react";
import {
    createForumComment,
    createForumThread,
    deleteForumComment,
    getForumComments,
    getForumThread,
    getForumThreads,
    toggleForumCommentLike
} from "../../api/forumApi.ts";
import {createForumSocketClient, subscribeForumEvent} from "../../api/forumSocket.ts";
import {CommentEditor} from "../../components/CommentEmojiPicker/CommentEditor.tsx";
import {CommentEmojiPicker} from "../../components/CommentEmojiPicker/CommentEmojiPicker.tsx";
import {CommentText} from "../../components/CommentEmojiPicker/CommentText.tsx";
import {useAuthStore} from "../../stores/authStore.ts";
import type {
    ForumCommentDeletedPayload,
    ForumCommentLikePayload,
    ForumCommentResponse,
    ForumPresenceResponse,
    ForumThreadCategory,
    ForumThreadDeletedPayload,
    ForumThreadResponse
} from "../../types/forum.ts";
import styles from "./ForumPage.module.css";

const threadCategories: Array<{label: string; value: ForumThreadCategory}> = [
    {label: "Thông báo", value: "ANNOUNCEMENT"},
    {label: "Thảo luận", value: "DISCUSSION"},
    {label: "Tìm truyện", value: "FIND_MANGA"},
    {label: "Góp ý", value: "FEEDBACK"}
];
const THREAD_TITLE_MAX_LENGTH = 150;

type CategoryFilter = "ALL" | ForumThreadCategory;

const categoryLabels = threadCategories.reduce<Record<ForumThreadCategory, string>>((acc, category) => {
    acc[category.value] = category.label;
    return acc;
}, {} as Record<ForumThreadCategory, string>);

function getInitial(name?: string | null) {
    return (name?.trim().slice(0, 1) || "U").toUpperCase();
}

function getRoleBadge(role?: string | null) {
    if (role === "ADMIN") return "Admin";
    if (role === "AUTHOR") return "Author";
    return "Member";
}

function getRoleBadgeClass(role?: string | null) {
    if (role === "ADMIN") return `${styles.commentBadge} ${styles.adminBadge}`;
    if (role === "AUTHOR") return `${styles.commentBadge} ${styles.authorBadge}`;
    return `${styles.commentBadge} ${styles.memberBadge}`;
}

function formatTime(value?: string | null) {
    if (!value) {
        return "chưa có";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "vừa xong";
    }

    const diffSeconds = Math.max(Math.floor((Date.now() - date.getTime()) / 1000), 0);
    if (diffSeconds < 60) return "vừa xong";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} phút trước`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffSeconds / 86400)} ngày trước`;
}

function flattenComments(comments: ForumCommentResponse[]): ForumCommentResponse[] {
    return comments.flatMap((comment) => [comment, ...flattenComments(comment.replies ?? [])]);
}

function hasComment(comments: ForumCommentResponse[], commentId: number): boolean {
    return flattenComments(comments).some((comment) => comment.id === commentId);
}

function appendComment(comments: ForumCommentResponse[], nextComment: ForumCommentResponse): ForumCommentResponse[] {
    if (hasComment(comments, nextComment.id)) {
        return comments;
    }

    if (!nextComment.replyToCommentId) {
        return [...comments, {...nextComment, replies: nextComment.replies ?? []}];
    }

    return comments.map((comment) => {
        if (comment.id === nextComment.replyToCommentId) {
            return {
                ...comment,
                replies: [...(comment.replies ?? []), {...nextComment, replies: nextComment.replies ?? []}]
            };
        }

        return {
            ...comment,
            replies: appendComment(comment.replies ?? [], nextComment)
        };
    });
}

function removeComment(comments: ForumCommentResponse[], commentId: number): ForumCommentResponse[] {
    return comments
        .filter((comment) => comment.id !== commentId)
        .map((comment) => ({
            ...comment,
            replies: removeComment(comment.replies ?? [], commentId)
        }));
}

function updateCommentLike(
    comments: ForumCommentResponse[],
    commentId: number,
    likeCount: number,
    isLiked?: boolean
): ForumCommentResponse[] {
    return comments.map((comment) => ({
        ...comment,
        likeCount: comment.id === commentId ? likeCount : comment.likeCount,
        isLiked: comment.id === commentId && isLiked !== undefined ? isLiked : comment.isLiked,
        replies: updateCommentLike(comment.replies ?? [], commentId, likeCount, isLiked)
    }));
}

function upsertThread(threads: ForumThreadResponse[], nextThread: ForumThreadResponse) {
    const filteredThreads = threads.filter((thread) => thread.id !== nextThread.id);
    return [nextThread, ...filteredThreads];
}

function CommentItem({
    comment,
    currentUserId,
    depth,
    onDelete,
    onLike,
    onReply
}: {
    comment: ForumCommentResponse;
    currentUserId?: number;
    depth: number;
    onDelete: (commentId: number) => void;
    onLike: (commentId: number) => void;
    onReply: (comment: ForumCommentResponse) => void;
}) {
    const authorName = comment.user?.username || "Người dùng";
    const canDelete = currentUserId !== undefined && comment.user?.id === currentUserId;

    return (
        <article className={styles.commentItem} style={{marginLeft: depth ? Math.min(depth * 34, 68) : 0}}>
            <div className={styles.commentAvatar}>{getInitial(authorName)}</div>
            <div className={styles.commentBody}>
                <div className={styles.commentBubble}>
                    <div className={styles.commentAuthorRow}>
                        <span className={styles.commentAuthor}>{authorName}</span>
                        {comment.user?.activeTitle && (
                            <span
                                className={`${styles.commentBadge} ${styles.titleBadge}`}
                                style={comment.user.activeTitleColor ? {color: comment.user.activeTitleColor} : undefined}
                            >
                                {comment.user.activeTitle}
                            </span>
                        )}
                        {!comment.user?.activeTitle && (
                            <span className={getRoleBadgeClass(comment.user?.role)}>{getRoleBadge(comment.user?.role)}</span>
                        )}
                    </div>
                    <p className={styles.commentText}>
                        <CommentText content={comment.content} />
                    </p>
                </div>
                <div className={styles.commentFooter}>
                    <span>{formatTime(comment.createdAt)}</span>
                    <button type="button" onClick={() => onLike(comment.id)}>
                        {comment.isLiked ? "Đã thích" : "Thích"} ({comment.likeCount})
                    </button>
                    <button type="button" onClick={() => onReply(comment)}>Trả lời</button>
                    {canDelete && (
                        <button type="button" onClick={() => onDelete(comment.id)}>Gỡ</button>
                    )}
                </div>
                {(comment.replies ?? []).map((reply) => (
                    <CommentItem
                        comment={reply}
                        currentUserId={currentUserId}
                        depth={depth + 1}
                        key={reply.id}
                        onDelete={onDelete}
                        onLike={onLike}
                        onReply={onReply}
                    />
                ))}
            </div>
        </article>
    );
}

export function ForumPage() {
    const {isAuthenticated, openAuthModal, user, displayName} = useAuthStore();
    const [threads, setThreads] = useState<ForumThreadResponse[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
    const [activeThreadDetail, setActiveThreadDetail] = useState<ForumThreadResponse | null>(null);
    const [comments, setComments] = useState<ForumCommentResponse[]>([]);
    const [onlineCounts, setOnlineCounts] = useState<Record<number, number>>({});
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState("");
    const [newThreadCategory, setNewThreadCategory] = useState<ForumThreadCategory>("ANNOUNCEMENT");
    const [newThreadExcerpt, setNewThreadExcerpt] = useState("");
    const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
    const [draft, setDraft] = useState("");
    const [replyTarget, setReplyTarget] = useState<ForumCommentResponse | null>(null);
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const threadSubscriptionRef = useRef<StompSubscription | null>(null);

    const activeThread = useMemo(
        () => activeThreadDetail ?? threads.find((thread) => thread.id === activeThreadId) ?? null,
        [activeThreadDetail, activeThreadId, threads]
    );

    const handleThreadDeleted = useCallback((payload: ForumThreadDeletedPayload) => {
        setThreads((currentThreads) => currentThreads.filter((thread) => thread.id !== payload.threadId));
        setActiveThreadId((currentActiveId) => currentActiveId === payload.threadId ? null : currentActiveId);
    }, []);

    const handleCommentCreated = useCallback((comment: ForumCommentResponse) => {
        setComments((currentComments) => appendComment(currentComments, comment));
        setThreads((currentThreads) => currentThreads.map((thread) => {
            if (thread.id !== comment.threadId) return thread;
            return {
                ...thread,
                commentCount: Math.max(thread.commentCount, flattenComments(comments).length + 1),
                lastCommentedAt: comment.createdAt
            };
        }));
        setActiveThreadDetail((thread) => thread && thread.id === comment.threadId
            ? {...thread, commentCount: thread.commentCount + 1, lastCommentedAt: comment.createdAt}
            : thread
        );
    }, [comments]);

    const handleCommentDeleted = useCallback((payload: ForumCommentDeletedPayload) => {
        setComments((currentComments) => removeComment(currentComments, payload.commentId));
        setThreads((currentThreads) => currentThreads.map((thread) => thread.id === payload.threadId
            ? {...thread, commentCount: payload.commentCount}
            : thread
        ));
        setActiveThreadDetail((thread) => thread && thread.id === payload.threadId
            ? {...thread, commentCount: payload.commentCount}
            : thread
        );
    }, []);

    const handleCommentLikeUpdated = useCallback((payload: ForumCommentLikePayload) => {
        setComments((currentComments) => updateCommentLike(currentComments, payload.commentId, payload.likeCount));
    }, []);

    const loadThreads = useCallback(async () => {
        setIsLoadingThreads(true);
        setErrorMessage("");
        try {
            const response = await getForumThreads({
                category: activeCategory === "ALL" ? undefined : activeCategory,
                page: 0,
                size: 30
            });
            const nextThreads = response.payload?.content ?? [];
            setThreads(nextThreads);
            setActiveThreadId((currentActiveId) => {
                if (currentActiveId && nextThreads.some((thread) => thread.id === currentActiveId)) {
                    return currentActiveId;
                }
                return nextThreads[0]?.id ?? null;
            });
        } catch {
            setErrorMessage("Không tải được danh sách forum.");
        } finally {
            setIsLoadingThreads(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        void loadThreads();
    }, [loadThreads]);

    useEffect(() => {
        if (!activeThreadId) {
            setActiveThreadDetail(null);
            setComments([]);
            return;
        }

        let cancelled = false;
        setIsLoadingComments(true);
        setErrorMessage("");

        async function loadThreadData() {
            try {
                const [threadResponse, commentsResponse] = await Promise.all([
                    getForumThread(activeThreadId as number),
                    getForumComments(activeThreadId as number)
                ]);

                if (cancelled) return;
                setActiveThreadDetail(threadResponse.payload ?? null);
                setComments(commentsResponse.payload ?? []);
                if (threadResponse.payload) {
                    setThreads((currentThreads) => currentThreads.map((thread) => thread.id === threadResponse.payload?.id
                        ? threadResponse.payload
                        : thread
                    ));
                }
            } catch {
                if (!cancelled) {
                    setErrorMessage("Không tải được nội dung thread.");
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingComments(false);
                }
            }
        }

        void loadThreadData();
        return () => {
            cancelled = true;
        };
    }, [activeThreadId]);

    useEffect(() => {
        const client = createForumSocketClient((connectedClient) => {
            setIsSocketConnected(true);
            subscribeForumEvent<unknown>(connectedClient, "/topic/forum/threads", (event) => {
                if (event.type === "THREAD_CREATED") {
                    const thread = event.payload as ForumThreadResponse;
                    setThreads((currentThreads) => {
                        if (activeCategory !== "ALL" && thread.category !== activeCategory) {
                            return currentThreads;
                        }
                        return upsertThread(currentThreads, thread);
                    });
                    setActiveThreadId((currentActiveId) => currentActiveId ?? thread.id);
                }

                if (event.type === "THREAD_DELETED") {
                    handleThreadDeleted(event.payload as ForumThreadDeletedPayload);
                }
            });
        });

        client.activate();
        clientRef.current = client;

        return () => {
            threadSubscriptionRef.current?.unsubscribe();
            client.deactivate();
            clientRef.current = null;
            setIsSocketConnected(false);
        };
    }, [activeCategory, handleThreadDeleted]);

    useEffect(() => {
        const client = clientRef.current;
        threadSubscriptionRef.current?.unsubscribe();
        threadSubscriptionRef.current = null;

        if (!client || !isSocketConnected || !activeThreadId) {
            return;
        }

        const subscription = subscribeForumEvent<unknown>(client, `/topic/forum/threads/${activeThreadId}`, (event) => {
            if (event.type === "THREAD_DELETED") {
                handleThreadDeleted(event.payload as ForumThreadDeletedPayload);
            }
            if (event.type === "COMMENT_CREATED") {
                handleCommentCreated(event.payload as ForumCommentResponse);
            }
            if (event.type === "COMMENT_DELETED") {
                handleCommentDeleted(event.payload as ForumCommentDeletedPayload);
            }
            if (event.type === "COMMENT_LIKE_UPDATED") {
                handleCommentLikeUpdated(event.payload as ForumCommentLikePayload);
            }
            if (event.type === "PRESENCE_UPDATED") {
                const payload = event.payload as ForumPresenceResponse;
                setOnlineCounts((currentCounts) => ({
                    ...currentCounts,
                    [payload.threadId]: payload.onlineCount
                }));
            }
        });

        threadSubscriptionRef.current = subscription;
        client.publish({destination: `/app/forum/threads/${activeThreadId}/join`, body: "{}"});

        return () => {
            client.publish({destination: "/app/forum/threads/leave", body: "{}"});
            subscription.unsubscribe();
        };
    }, [
        activeThreadId,
        handleCommentCreated,
        handleCommentDeleted,
        handleCommentLikeUpdated,
        handleThreadDeleted,
        isSocketConnected
    ]);

    async function handleCreateThread(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        const title = newThreadTitle.trim();
        const content = newThreadExcerpt.trim();
        if (!title || !content) return;

        try {
            const response = await createForumThread({
                category: newThreadCategory,
                title,
                content
            });
            if (response.payload) {
                setThreads((currentThreads) => upsertThread(currentThreads, response.payload as ForumThreadResponse));
                setActiveThreadId(response.payload.id);
            }
            setNewThreadTitle("");
            setNewThreadExcerpt("");
            setIsCreateModalOpen(false);
        } catch {
            setErrorMessage("Không đăng được thread.");
        }
    }

    async function handleSubmitComment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }
        if (!activeThread) return;

        const content = draft.trim();
        if (!content) return;

        try {
            const response = await createForumComment(activeThread.id, {
                content,
                replyToCommentId: replyTarget?.id ?? null
            });
            if (response.payload) {
                setComments((currentComments) => appendComment(currentComments, response.payload as ForumCommentResponse));
            }
            setDraft("");
            setReplyTarget(null);
        } catch {
            setErrorMessage("Không gửi được bình luận.");
        }
    }

    async function handleDeleteComment(commentId: number) {
        try {
            await deleteForumComment(commentId);
            setComments((currentComments) => removeComment(currentComments, commentId));
        } catch {
            setErrorMessage("Không gỡ được bình luận.");
        }
    }

    async function handleToggleLike(commentId: number) {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        try {
            const response = await toggleForumCommentLike(commentId);
            if (response.payload) {
                setComments((currentComments) => updateCommentLike(
                    currentComments,
                    commentId,
                    response.payload?.likeCount ?? 0,
                    response.payload?.liked
                ));
            }
        } catch {
            setErrorMessage("Không cập nhật được lượt thích.");
        }
    }

    const currentUsername = displayName || user?.username || "Bạn";

    return (
        <div className={styles.forumPage}>
            <div className={styles.forumShell}>
                <section className={styles.threadPanel} aria-label="Danh sách chủ đề">
                    <div className={styles.panelHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>Diễn Đàn</h1>
                        </div>
                        <span className={styles.liveBadge}>Live</span>
                    </div>

                    <div className={styles.createThreadBar}>
                        <button type="button" onClick={() => isAuthenticated ? setIsCreateModalOpen(true) : openAuthModal("login")}>
                            <Plus size={16} />
                            Đăng bài
                        </button>
                    </div>

                    <div className={styles.categoryFilters} aria-label="Lọc thread theo phân loại">
                        {[{label: "Tất cả", value: "ALL" as const}, ...threadCategories].map((category) => (
                            <button
                                className={category.value === activeCategory ? styles.activeCategoryFilter : ""}
                                key={category.value}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(category.value);
                                    setActiveThreadId(null);
                                    setActiveThreadDetail(null);
                                    setComments([]);
                                }}
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
                                onClick={() => setActiveThreadId(thread.id)}
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

                <section className={styles.chatPanel} aria-label="Cuộc trò chuyện">
                    {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}
                    {activeThread ? (
                        <>
                            <div className={styles.chatHeader}>
                                <div className={styles.threadHero}>
                                    <div className={styles.commentAvatar}>{getInitial(activeThread.user?.username)}</div>
                                    <div>
                                        <div className={styles.threadHeroAuthorRow}>
                                            <span className={styles.chatAuthorName}>
                                                {activeThread.user?.username || "Người dùng"}
                                            </span>
                                            <span
                                                className={activeThread.user?.activeTitle
                                                    ? `${styles.commentBadge} ${styles.titleBadge}`
                                                    : getRoleBadgeClass(activeThread.user?.role)}
                                                style={activeThread.user?.activeTitleColor
                                                    ? {color: activeThread.user.activeTitleColor}
                                                    : undefined}
                                            >
                                                {activeThread.user?.activeTitle || getRoleBadge(activeThread.user?.role)}
                                            </span>
                                        </div>
                                        <div className={styles.threadHeroMeta}>
                                            <span>@{activeThread.user?.username || "user"}</span>
                                            <span>{formatTime(activeThread.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.threadHeroContent}>
                                    <span className={`${styles.threadCategory} ${styles.threadHeroCategory}`}>
                                        {categoryLabels[activeThread.category]}
                                    </span>
                                    <h2 className={styles.chatTitle}>{activeThread.title}</h2>
                                    <p className={styles.threadPostText}>{activeThread.content}</p>
                                </div>
                                <div className={styles.chatStats}>
                                    <span><MessageCircle size={16} /> {activeThread.commentCount}</span>
                                    <span><Users size={16} /> {onlineCounts[activeThread.id] ?? 0}</span>
                                </div>
                            </div>

                            <div className={styles.commentList}>
                                {isLoadingComments && <div className={styles.emptyState}>Đang tải bình luận...</div>}
                                {!isLoadingComments && comments.length === 0 && (
                                    <div className={styles.emptyState}>Chưa có bình luận nào.</div>
                                )}
                                {comments.map((comment) => (
                                    <CommentItem
                                        comment={comment}
                                        currentUserId={user?.id}
                                        depth={0}
                                        key={comment.id}
                                        onDelete={handleDeleteComment}
                                        onLike={handleToggleLike}
                                        onReply={(nextReplyTarget) => setReplyTarget(nextReplyTarget)}
                                    />
                                ))}
                            </div>

                            <form className={styles.commentInputBox} onSubmit={handleSubmitComment}>
                                <div className={styles.commentAvatar}>{getInitial(currentUsername)}</div>
                                <div className={styles.commentInputWrapper}>
                                    {replyTarget && (
                                        <div className={styles.replyTarget}>
                                            <span>Trả lời {replyTarget.user?.username || "người dùng"}</span>
                                            <button type="button" onClick={() => setReplyTarget(null)}>Hủy</button>
                                        </div>
                                    )}
                                    <CommentEditor
                                        value={draft}
                                        placeholder={isAuthenticated ? "Nhập bình luận..." : "Đăng nhập để bình luận..."}
                                        minRows={3}
                                        onChange={setDraft}
                                    />
                                    <div className={styles.commentActions}>
                                        <CommentEmojiPicker />
                                        <button className={styles.submitCommentButton} type="submit" disabled={!draft.trim()}>
                                            <Send size={15} />
                                            Gửi
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className={styles.noThreadState}>Chọn hoặc tạo một thread để bắt đầu.</div>
                    )}
                </section>
            </div>

            {isCreateModalOpen && (
                <div
                    className={styles.modalBackdrop}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsCreateModalOpen(false);
                        }
                    }}
                >
                    <form className={styles.createThreadModal} onSubmit={handleCreateThread}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Tạo thread mới</h2>
                                <p>Chọn phân loại để người đọc tìm đúng chủ đề.</p>
                            </div>
                            <button
                                className={styles.modalCloseButton}
                                type="button"
                                aria-label="Đóng"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <label className={styles.modalField}>
                            <span>Tiêu đề</span>
                            <input
                                autoFocus
                                maxLength={THREAD_TITLE_MAX_LENGTH}
                                value={newThreadTitle}
                                placeholder="Nhập tiêu đề thread..."
                                onChange={(event) => setNewThreadTitle(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                    }
                                }}
                            />
                            <span className={styles.fieldCounter}>
                                {newThreadTitle.length}/{THREAD_TITLE_MAX_LENGTH}
                            </span>
                        </label>

                        <label className={styles.modalField}>
                            <span>Phân loại</span>
                            <select
                                value={newThreadCategory}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                    }
                                }}
                                onChange={(event) => setNewThreadCategory(event.target.value as ForumThreadCategory)}
                            >
                                {threadCategories.map((category) => (
                                    <option key={category.value} value={category.value}>{category.label}</option>
                                ))}
                            </select>
                        </label>

                        <label className={styles.modalField}>
                            <span>Nội dung bài viết</span>
                            <div className={styles.postEditor}>
                                <textarea
                                    value={newThreadExcerpt}
                                    maxLength={10000}
                                    placeholder="Viết nội dung bài viết..."
                                    rows={7}
                                    onChange={(event) => setNewThreadExcerpt(event.target.value)}
                                />
                                <div className={styles.editorCounter}>{newThreadExcerpt.length}/10000</div>
                            </div>
                        </label>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelThreadButton}
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className={styles.createThreadButton}
                                type="submit"
                                disabled={!newThreadTitle.trim() || !newThreadExcerpt.trim()}
                            >
                                <Plus size={15} />
                                Đăng bài
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
