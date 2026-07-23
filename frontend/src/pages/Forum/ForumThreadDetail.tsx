import type {FormEvent} from "react";
import {useMemo} from "react";
import {MessageCircle, Send, Users} from "lucide-react";
import type {ForumCommentResponse, ForumThreadResponse} from "../../types/forum.ts";
import {CommentEditor} from "../../components/CommentEmojiPicker/CommentEditor.tsx";
import {CommentEmojiPicker} from "../../components/CommentEmojiPicker/CommentEmojiPicker.tsx";
import {CommentItem} from "./CommentItem.tsx";
import styles from "./ForumPage.module.css";
import {categoryLabels} from "./forumConstants.ts";
import {flattenComments, formatTime, getInitial, getRoleBadge} from "./forumUtils.ts";

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
    userId,
    onCancelReply,
    onDeleteComment,
    onDraftChange,
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
    userId?: number;
    onCancelReply: () => void;
    onDeleteComment: (commentId: number) => void;
    onDraftChange: (value: string) => void;
    onLikeComment: (commentId: number) => void;
    onReply: (comment: ForumCommentResponse) => void;
    onSubmitComment: (event: FormEvent<HTMLFormElement>) => void;
}) {
    const flatComments = useMemo(
        () => flattenComments(comments)
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [comments]
    );

    const commentById = useMemo(() => {
        return new Map(flatComments.map((comment) => [comment.id, comment]));
    }, [flatComments]);

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
                            <span className={`${styles.threadCategory} ${styles.threadHeroCategory}`}>
                                {categoryLabels[activeThread.category]}
                            </span>
                            <h2 className={styles.chatTitle}>{activeThread.title}</h2>
                            <p className={styles.threadPostText}>{activeThread.content}</p>
                        </div>
                        <div className={styles.chatStats}>
                            <span><MessageCircle size={16} /> {activeThread.commentCount}</span>
                            <span><Users size={16} /> {onlineCount}</span>
                        </div>
                    </div>

                    <form className={styles.commentInputBox} onSubmit={onSubmitComment}>
                        <div className={styles.commentAvatar}>{getInitial(currentUsername)}</div>
                        <div className={styles.commentInputWrapper}>
                            {replyTarget && (
                                <div className={styles.replyTarget}>
                                    <span>Trả lời {replyTarget.user?.username || "người dùng"}</span>
                                    <button type="button" onClick={onCancelReply}>Hủy</button>
                                </div>
                            )}
                            <CommentEditor
                                value={draft}
                                placeholder={isAuthenticated ? "Nhập bình luận..." : "Đăng nhập để bình luận..."}
                                minRows={3}
                                onChange={onDraftChange}
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

                    <div className={styles.commentList}>
                        {isLoadingComments && <div className={styles.emptyState}>Đang tải bình luận...</div>}
                        {!isLoadingComments && comments.length === 0 && (
                            <div className={styles.emptyState}>Chưa có bình luận nào.</div>
                        )}
                        {flatComments.map((comment) => (
                            <CommentItem
                                comment={comment}
                                currentUserId={userId}
                                key={comment.id}
                                onDelete={onDeleteComment}
                                onLike={onLikeComment}
                                onReply={onReply}
                                replyToUsername={comment.replyToCommentId
                                    ? commentById.get(comment.replyToCommentId)?.user?.username
                                    : undefined}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.noThreadState}>Chọn hoặc tạo một thread để bắt đầu.</div>
            )}
        </section>
    );
}
