import type {ForumCommentResponse} from "../../types/forum.ts";
import {CommentText} from "../../components/CommentEmojiPicker/CommentText.tsx";
import styles from "./ForumPage.module.css";
import {formatTime, getInitial, getRoleBadge} from "./forumUtils.ts";

function getRoleBadgeClass(role?: string | null) {
    if (role === "ADMIN") return `${styles.commentBadge} ${styles.adminBadge}`;
    if (role === "AUTHOR") return `${styles.commentBadge} ${styles.authorBadge}`;
    return `${styles.commentBadge} ${styles.memberBadge}`;
}

export function CommentItem({
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
