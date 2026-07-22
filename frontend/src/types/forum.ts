export type ForumThreadCategory = "ANNOUNCEMENT" | "DISCUSSION" | "FIND_MANGA" | "FEEDBACK";

export type ForumThreadStatus = "VISIBLE" | "HIDDEN" | "DELETED" | "LOCKED";

export type CommentStatus = "VISIBLE" | "HIDDEN" | "DELETED";

export type ForumUser = {
  id: number;
  username: string;
  avatarUrl?: string | null;
  role?: "USER" | "AUTHOR" | "ADMIN" | null;
  activeTitle?: string | null;
  activeTitleColor?: string | null;
};

export type ForumThreadResponse = {
  id: number;
  category: ForumThreadCategory;
  title: string;
  content: string;
  status: ForumThreadStatus;
  viewCount: number;
  commentCount: number;
  lastCommentedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ForumUser | null;
};

export type ForumCommentResponse = {
  id: number;
  threadId: number;
  replyToCommentId?: number | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  user?: ForumUser | null;
  replies: ForumCommentResponse[];
};

export type CreateForumThreadRequest = {
  category: ForumThreadCategory;
  title: string;
  content: string;
};

export type CreateForumCommentRequest = {
  content: string;
  replyToCommentId?: number | null;
};

export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type ForumRealtimeEvent<T = unknown> = {
  type:
    | "THREAD_CREATED"
    | "THREAD_DELETED"
    | "COMMENT_CREATED"
    | "COMMENT_DELETED"
    | "COMMENT_LIKE_UPDATED"
    | "PRESENCE_UPDATED";
  payload: T;
  occurredAt: string;
};

export type ForumThreadDeletedPayload = {
  threadId: number;
};

export type ForumCommentDeletedPayload = {
  threadId: number;
  commentId: number;
  commentCount: number;
};

export type ForumCommentLikePayload = {
  threadId: number;
  commentId: number;
  liked: boolean;
  likeCount: number;
};

export type ForumPresenceResponse = {
  threadId: number;
  onlineCount: number;
};
