import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {FormEvent} from "react";
import type {Client, StompSubscription} from "@stomp/stompjs";
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
import {CreateThreadModal} from "./CreateThreadModal.tsx";
import {ForumThreadDetail} from "./ForumThreadDetail.tsx";
import {ForumThreadPanel} from "./ForumThreadPanel.tsx";
import styles from "./ForumPage.module.css";
import type {CategoryFilter} from "./forumConstants.ts";
import {
    appendComment,
    flattenComments,
    removeComment,
    updateCommentLike,
    upsertThread
} from "./forumUtils.ts";

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
        let cancelled = false;

        void Promise.resolve().then(async () => {
            if (!cancelled) {
                await loadThreads();
            }
        });

        return () => {
            cancelled = true;
        };
    }, [loadThreads]);

    useEffect(() => {
        let cancelled = false;

        async function loadThreadData() {
            if (!activeThreadId) {
                if (!cancelled) {
                    setActiveThreadDetail(null);
                    setComments([]);
                }
                return;
            }

            if (!cancelled) {
                setIsLoadingComments(true);
                setErrorMessage("");
            }

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

        void Promise.resolve().then(loadThreadData);
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
                <ForumThreadPanel
                    activeCategory={activeCategory}
                    activeThreadId={activeThreadId}
                    isAuthenticated={isAuthenticated}
                    isLoadingThreads={isLoadingThreads}
                    onlineCounts={onlineCounts}
                    threads={threads}
                    onCreateClick={() => isAuthenticated ? setIsCreateModalOpen(true) : openAuthModal("login")}
                    onSelectCategory={(category) => {
                        setActiveCategory(category);
                        setActiveThreadId(null);
                        setActiveThreadDetail(null);
                        setComments([]);
                    }}
                    onSelectThread={setActiveThreadId}
                />

                <ForumThreadDetail
                    activeThread={activeThread}
                    comments={comments}
                    currentUsername={currentUsername}
                    draft={draft}
                    errorMessage={errorMessage}
                    isAuthenticated={isAuthenticated}
                    isLoadingComments={isLoadingComments}
                    onlineCount={activeThread ? onlineCounts[activeThread.id] ?? 0 : 0}
                    replyTarget={replyTarget}
                    userId={user?.id}
                    onCancelReply={() => setReplyTarget(null)}
                    onDeleteComment={handleDeleteComment}
                    onDraftChange={setDraft}
                    onLikeComment={handleToggleLike}
                    onReply={setReplyTarget}
                    onSubmitComment={handleSubmitComment}
                />
            </div>

            {isCreateModalOpen && (
                <CreateThreadModal
                    category={newThreadCategory}
                    content={newThreadExcerpt}
                    title={newThreadTitle}
                    onCategoryChange={setNewThreadCategory}
                    onClose={() => setIsCreateModalOpen(false)}
                    onContentChange={setNewThreadExcerpt}
                    onSubmit={handleCreateThread}
                    onTitleChange={setNewThreadTitle}
                />
            )}
        </div>
    );
}
