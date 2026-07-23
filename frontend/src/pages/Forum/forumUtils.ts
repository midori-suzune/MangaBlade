import type {ForumCommentResponse, ForumThreadResponse} from "../../types/forum.ts";

export function getInitial(name?: string | null) {
    return (name?.trim().slice(0, 1) || "U").toUpperCase();
}

export function getRoleBadge(role?: string | null) {
    if (role === "ADMIN") return "Admin";
    if (role === "AUTHOR") return "Author";
    return "Member";
}

export function formatTime(value?: string | null) {
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

export function flattenComments(comments: ForumCommentResponse[]): ForumCommentResponse[] {
    return comments.flatMap((comment) => [comment, ...flattenComments(comment.replies ?? [])]);
}

function hasComment(comments: ForumCommentResponse[], commentId: number): boolean {
    return flattenComments(comments).some((comment) => comment.id === commentId);
}

export function appendComment(
    comments: ForumCommentResponse[],
    nextComment: ForumCommentResponse
): ForumCommentResponse[] {
    if (hasComment(comments, nextComment.id)) {
        return comments;
    }

    if (!nextComment.replyToCommentId) {
        return [{...nextComment, replies: nextComment.replies ?? []}, ...comments];
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

export function removeComment(comments: ForumCommentResponse[], commentId: number): ForumCommentResponse[] {
    return comments
        .filter((comment) => comment.id !== commentId)
        .map((comment) => ({
            ...comment,
            replies: removeComment(comment.replies ?? [], commentId)
        }));
}

export function updateCommentLike(
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

export function upsertThread(threads: ForumThreadResponse[], nextThread: ForumThreadResponse) {
    const filteredThreads = threads.filter((thread) => thread.id !== nextThread.id);
    return [nextThread, ...filteredThreads];
}
