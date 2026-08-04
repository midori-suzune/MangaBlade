import {useEffect, useMemo, useRef, useState} from "react";
import {MessageCircle, MoreHorizontal, Pencil, Send, Trash2, Users} from "lucide-react";
import type {ForumCommentResponse, ForumThreadResponse} from "../../types/forum.ts";
import {CommentEditor} from "../../components/CommentEmojiPicker/CommentEditor.tsx";
import {CommentEmojiPicker} from "../../components/CommentEmojiPicker/CommentEmojiPicker.tsx";
import {CommentItem} from "./CommentItem.tsx";
import {ForumMarkdown} from "./ForumMarkdown.tsx";
import styles from "./ForumPage.module.css";
import {categoryLabels} from "./forumConstants.ts";
import {flattenComments, formatTime, getInitial, getRoleBadge} from "./forumUtils.ts";

const hasImageTokenPattern = /!\[[^\]]*]\(([^)\s]+)\)/;

function getRoleBadgeClass(role?: string | null) {
    if (role === "ADMIN") return `${styles.commentBadge} ${styles.adminBadge}`;
    if (role === "AUTHOR") return `${styles.commentBadge} ${styles.authorBadge}`;
    return `${styles.commentBadge} ${styles.memberBadge}`;
}

export function ForumThreadDetail({
    activeThread,
    comments,
    currentUsername,
    draft,
    errorMessage,
    isAuthenticated,
    isLoadingComments,
    onlineCount,
    replyTarget,
    userRole,
    userId,
    onCancelReply,
    onDeleteComment,
    onDeleteThread,
    onDraftChange,
    onEditThread,
    onLikeComment,
    onReply,
    onSubmitComment
}: {
    activeThread: ForumThreadResponse | null;
    comments: ForumCommentResponse[];
    currentUsername: string;
    draft: string;
    errorMessage: string;
    isAuthenticated: boolean;
    isLoadingComments: boolean;
    onlineCount: number;
    replyTarget: ForumCommentResponse | null;
    userRole?: string;
    userId?: number;
    onCancelReply: () => void;
    onDeleteComment: (commentId: number) => void;
    onDeleteThread: (threadId: number) => void;
    onDraftChange: (value: string) => void;
    onEditThread: (thread: ForumThreadResponse) => void;
    onLikeComment: (commentId: number) => void;
    onReply: (comment: ForumCommentResponse) => void;
    onSubmitComment: () => void;
}) {
    const [expandedCommentIds, setExpandedCommentIds] = useState<number[]>([]);
    const [isThreadMenuOpen, setIsThreadMenuOpen] = useState(false);
    const threadActionMenuRef = useRef<HTMLDivElement | null>(null);
    const flatComments = useMemo(
        () => flattenComments(comments),
        [comments]
    );

    const sortedRootComments = useMemo(
        () => comments
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [comments]
    );

    const commentById = useMemo(() => {
        return new Map(flatComments.map((comment) => [comment.id, comment]));
    }, [flatComments]);

    function toggleReplies(commentId: number) {
        setExpandedCommentIds((currentIds) => (
            currentIds.includes(commentId)
                ? currentIds.filter((id) => id !== commentId)
                : [...currentIds, commentId]
        ));
    }

    function renderComment(comment: ForumCommentResponse) {
        const replies = flattenComments(comment.replies ?? [])
            .slice()
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const isExpanded = expandedCommentIds.includes(comment.id);

        return (
            <div className={styles.commentThread} key={comment.id}>
                <CommentItem
                    comment={comment}
                    currentUserId={userId}
                    onDelete={onDeleteComment}
                    onLike={onLikeComment}
                    onReply={onReply}
                />
                {replies.length > 0 && (
                    <button
                        className={styles.replyCountButton}
                        type="button"
                        onClick={() => toggleReplies(comment.id)}
                    >
                        {isExpanded ? "Thu gọn phản hồi" : `Xem ${replies.length} phản hồi`}
                    </button>
                )}
                {replies.length > 0 && isExpanded && (
                    <div className={styles.replyList}>
                        {replies.map((reply) => (
                            <CommentItem
                                comment={reply}
                                currentUserId={userId}
                                isReply
                                key={reply.id}
                                onDelete={onDeleteComment}
                                onLike={onLikeComment}
                                onReply={onReply}
                                replyToUsername={reply.replyToCommentId
                                    ? commentById.get(reply.replyToCommentId)?.user?.username
                                    : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const canEditActiveThread = Boolean(
        activeThread && activeThread.user?.id === userId
    );
    const canDeleteActiveThread = Boolean(
        activeThread && (activeThread.user?.id === userId || userRole === "ADMIN")
    );

    useEffect(() => {
        if (!isThreadMenuOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (!threadActionMenuRef.current?.contains(event.target as Node)) {
                setIsThreadMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isThreadMenuOpen]);

    return (
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
                            <span className={`${styles.threadCategory} ${styles.threadHeroCategory} ${activeThread.category === "ANNOUNCEMENT" ? styles.announcementCategory : ""}`}>
                                {categoryLabels[activeThread.category]}
                            </span>
                            <h2 className={styles.chatTitle}>{activeThread.title}</h2>
                            <div className={styles.threadPostContent}>
                                <ForumMarkdown attachments={activeThread.attachments} content={activeThread.content} />
                            </div>
                            {activeThread.attachments && activeThread.attachments.length > 0 && !hasImageTokenPattern.test(activeThread.content) && (
                                <div className={styles.threadPostImages}>
                                    {activeThread.attachments.map((attachment) => (
                                        <img src={attachment.url} alt="" key={attachment.id} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles.chatStats}>
                            <span><MessageCircle size={16} /> {activeThread.commentCount}</span>
                            <span><Users size={16} /> {onlineCount}</span>
                            {canDeleteActiveThread && (
                                <div className={styles.threadActionMenu} ref={threadActionMenuRef}>
                                    <button
                                        className={styles.threadActionTrigger}
                                        type="button"
                                        aria-label="Tùy chọn bài viết"
                                        onClick={() => setIsThreadMenuOpen((current) => !current)}
                                    >
                                        <MoreHorizontal size={17} />
                                    </button>
                                    {isThreadMenuOpen && (
                                        <div className={styles.threadActionDropdown}>
                                            {canEditActiveThread && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsThreadMenuOpen(false);
                                                        onEditThread(activeThread);
                                                    }}
                                                >
                                                    <Pencil size={14} />
                                                    Chỉnh sửa bài viết
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsThreadMenuOpen(false);
                                                    onDeleteThread(activeThread.id);
                                                }}
                                            >
                                                <Trash2 size={14} />
                                                Gỡ bài viết
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <form
                        className={styles.commentInputBox}
                        onSubmit={(event) => {
                            event.preventDefault();
                            onSubmitComment();
                        }}
                    >
                        <div className={styles.commentAvatar}>{getInitial(currentUsername)}</div>
                        <div className={styles.commentInputWrapper}>
                            {replyTarget && (
                                <div className={styles.replyTarget}>
                                    <span>Trả lời {replyTarget.user?.username || "người dùng"}</span>
                                </div>
                            )}
                            <CommentEditor
                                value={draft}
                                placeholder={isAuthenticated ? "Nhập bình luận..." : "Đăng nhập để bình luận..."}
                                minRows={3}
                                autoFocusKey={replyTarget?.id ?? null}
                                onChange={onDraftChange}
                                onSubmit={onSubmitComment}
                            />
                            <div className={styles.commentActions}>
                                <CommentEmojiPicker />
                                <div className={styles.commentButtonGroup}>
                                    {replyTarget && (
                                        <button
                                            className={styles.cancelReplyButton}
                                            type="button"
                                            onClick={onCancelReply}
                                        >
                                            Hủy
                                        </button>
                                    )}
                                    <button className={styles.submitCommentButton} type="submit" disabled={!draft.trim()}>
                                        <Send size={15} />
                                        Gửi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className={styles.commentList}>
                        {isLoadingComments && <div className={styles.emptyState}>Đang tải bình luận...</div>}
                        {!isLoadingComments && comments.length === 0 && (
                            <div className={styles.emptyState}>Chưa có bình luận nào.</div>
                        )}
                        {sortedRootComments.map((comment) => renderComment(comment))}
                    </div>
                </>
            ) : (
                <div className={styles.noThreadState}>Chọn hoặc tạo một thread để bắt đầu.</div>
            )}
        </section>
    );
}
