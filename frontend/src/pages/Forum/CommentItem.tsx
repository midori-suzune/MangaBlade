import type {ForumCommentResponse} from "../../types/forum.ts";
import {CommentText} from "../../components/CommentEmojiPicker/CommentText.tsx";
import styles from "./ForumPage.module.css";
import {formatTime, getInitial, getRoleBadge} from "./forumUtils.ts";

import { useAuthStore } from "../../stores/authStore.ts";

function getRoleBadgeClass(role?: string | null) {
    if (role === "ADMIN") return `${styles.commentBadge} ${styles.adminBadge}`;
    if (role === "AUTHOR") return `${styles.commentBadge} ${styles.authorBadge}`;
    return `${styles.commentBadge} ${styles.memberBadge}`;
}

function resolveUserAvatar(user?: ForumCommentResponse['user']) {
    if (!user?.id) return null;
    const currentUser = useAuthStore.getState().user;
    const currentAvatarUrl = useAuthStore.getState().avatarUrl;
    if (currentUser && currentUser.id === user.id) {
        return currentAvatarUrl || user.avatarUrl || null;
    }
    return localStorage.getItem(`avatar_${user.id}`) || user.avatarUrl || null;
}

function CommentBadge({ user }: { user?: ForumCommentResponse['user'] }) {
    if (user?.activeTitle) {
        return (
            <span
                className={`${styles.commentBadge} ${styles.titleBadge}`}
                style={user.activeTitleColor ? {color: user.activeTitleColor} : undefined}
            >
                {user.activeTitle}
            </span>
        );
    }
    return <span className={getRoleBadgeClass(user?.role)}>{getRoleBadge(user?.role)}</span>;
}

export function CommentItem({
    comment,
    currentUserId,
    onDelete,
    onLike,
    onReply,
    isReply = false,
    replyToUsername
}: {
    comment: ForumCommentResponse;
    currentUserId?: number;
    onDelete: (commentId: number) => void;
    onLike: (commentId: number) => void;
    onReply: (comment: ForumCommentResponse) => void;
    isReply?: boolean;
    replyToUsername?: string;
}) {
    const authorName = comment.user?.username || "Người dùng";
    const canDelete = currentUserId !== undefined && comment.user?.id === currentUserId;
    const roleClass = comment.user?.role === "ADMIN"
        ? styles.adminComment
        : comment.user?.role === "AUTHOR"
            ? styles.authorComment
            : styles.memberComment;

    const userAvatar = resolveUserAvatar(comment.user);

    return (
        <article className={`${styles.commentItem} ${isReply ? styles.replyItem : ""}`}>
            <div className={styles.commentAvatar}>
                {userAvatar ? (
                    <img src={userAvatar} alt={authorName} className={styles.avatarImg} />
                ) : (
                    getInitial(authorName)
                )}
            </div>
            <div className={styles.commentBody}>
                <div className={`${styles.commentBubble} ${roleClass}`}>
                    <div className={styles.commentAuthorRow}>
                        <span className={styles.commentAuthor}>{authorName}</span>
                        <CommentBadge user={comment.user} />
                    </div>
                    <p className={styles.commentText}>
                        {replyToUsername && <span className={styles.replyMention}>@{replyToUsername}</span>}
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
            </div>
        </article>
    );
}
