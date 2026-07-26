import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {FormEvent} from "react";
import type {Client, StompSubscription} from "@stomp/stompjs";
import {
    createForumComment,
    createForumThread,
    deleteForumComment,
    deleteForumThread,
    getForumComments,
    getForumThread,
    getForumThreads,
    toggleForumCommentLike,
    updateForumThread,
    uploadForumImage
} from "../../api/forumApi.ts";
import {createForumSocketClient, subscribeForumEvent} from "../../api/forumSocket.ts";
import {useAuthStore} from "../../stores/authStore.ts";
import type {
    ForumCommentDeletedPayload,
    ForumCommentLikePayload,
    ForumCommentResponse,
    ForumAttachmentResponse,
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
    const [editingThread, setEditingThread] = useState<ForumThreadResponse | null>(null);
    const [newThreadTitle, setNewThreadTitle] = useState("");
    const [newThreadCategory, setNewThreadCategory] = useState<ForumThreadCategory>("DISCUSSION");
    const [newThreadExcerpt, setNewThreadExcerpt] = useState("");
    const [newThreadAttachments, setNewThreadAttachments] = useState<ForumAttachmentResponse[]>([]);
    const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
    const [draft, setDraft] = useState("");
    const [replyTarget, setReplyTarget] = useState<ForumCommentResponse | null>(null);
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const threadSubscriptionRef = useRef<StompSubscription | null>(null);

    const activeThread = useMemo(
        () => activeThreadDetail ?? threads.find((thread) => thread.id === activeThreadId) ?? null,
        [activeThreadDetail, activeThreadId, threads]
    );

    function resetCreateThreadDraft() {
        setNewThreadTitle("");
        setNewThreadCategory(user?.role === "ADMIN" ? "ANNOUNCEMENT" : "DISCUSSION");
        setNewThreadExcerpt("");
        setNewThreadAttachments([]);
        setUploadError("");
    }

    function openEditThreadModal(thread: ForumThreadResponse) {
        setEditingThread(thread);
        setNewThreadTitle(thread.title);
        setNewThreadCategory(thread.category);
        setNewThreadExcerpt(thread.content);
        setNewThreadAttachments(thread.attachments ?? []);
        setUploadError("");
        setIsCreateModalOpen(true);
    }

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

                if (event.type === "THREAD_UPDATED") {
                    const thread = event.payload as ForumThreadResponse;
                    setThreads((currentThreads) => upsertThread(currentThreads, thread));
                    setActiveThreadDetail((currentThread) => (
                        currentThread?.id === thread.id ? thread : currentThread
                    ));
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
            if (event.type === "THREAD_UPDATED") {
                const thread = event.payload as ForumThreadResponse;
                setThreads((currentThreads) => upsertThread(currentThreads, thread));
                setActiveThreadDetail((currentThread) => (
                    currentThread?.id === thread.id ? thread : currentThread
                ));
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
            const request = {
                category: newThreadCategory,
                title,
                content,
                attachmentIds: newThreadAttachments.map((attachment) => attachment.id)
            };
            const response = editingThread
                ? await updateForumThread(editingThread.id, request)
                : await createForumThread(request);
            if (response.payload) {
                setThreads((currentThreads) => upsertThread(currentThreads, response.payload as ForumThreadResponse));
                setActiveThreadId(response.payload.id);
                setActiveThreadDetail(response.payload as ForumThreadResponse);
            }
            resetCreateThreadDraft();
            setEditingThread(null);
            setIsCreateModalOpen(false);
        } catch {
            setErrorMessage(editingThread ? "Không cập nhật được thread." : "Không đăng được thread.");
        }
    }

    async function handleForumImageSelect(files: File[] | FileList | null, insertAt?: number) {
        if (!files?.length) return;

        const remainingSlots = 5 - newThreadAttachments.length;
        const selectedFiles = Array.from(files).slice(0, Math.max(remainingSlots, 0));
        if (selectedFiles.length === 0) {
            setUploadError("Mỗi thread chỉ được đính kèm tối đa 5 ảnh.");
            return;
        }

        const oversizedFile = selectedFiles.find((file) => file.size > 5 * 1024 * 1024);
        if (oversizedFile) {
            setUploadError(`Ảnh "${oversizedFile.name}" vượt quá 5MB.`);
            return;
        }

        const invalidFile = selectedFiles.find((file) => !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type));
        if (invalidFile) {
            setUploadError(`Ảnh "${invalidFile.name}" không đúng định dạng hỗ trợ.`);
            return;
        }

        setIsUploadingImage(true);
        setUploadError("");
        try {
            const uploadedAttachments = await Promise.all(selectedFiles.map(async (file) => {
                const response = await uploadForumImage(file);
                return response.payload;
            }));
            const validAttachments = uploadedAttachments.filter(
                (attachment): attachment is ForumAttachmentResponse => Boolean(attachment)
            );

            setNewThreadAttachments((currentAttachments) => [
                ...currentAttachments,
                ...validAttachments
            ].slice(0, 5));
            if (validAttachments.length > 0) {
                const imageTokens = validAttachments
                    .map((attachment) => `![Ảnh đính kèm](attachment:${attachment.id})`)
                    .join("\n\n");

                setNewThreadExcerpt((currentContent) => {
                    const safeInsertAt = Math.min(
                        Math.max(insertAt ?? currentContent.length, 0),
                        currentContent.length
                    );
                    const prefix = currentContent.slice(0, safeInsertAt);
                    const suffix = currentContent.slice(safeInsertAt);
                    const before = prefix && !prefix.endsWith("\n") ? "\n\n" : "";
                    const after = suffix && !suffix.startsWith("\n") ? "\n\n" : "";
                    return `${prefix}${before}${imageTokens}${after}${suffix}`;
                });
            }
            if (files.length > selectedFiles.length) {
                setUploadError("Chỉ 5 ảnh đầu tiên được đính kèm vào thread.");
            }
        } catch {
            setUploadError("Không tải được ảnh đính kèm.");
        } finally {
            setIsUploadingImage(false);
        }
    }

    async function handleSubmitComment() {
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

    async function handleDeleteThread(threadId: number) {
        if (!window.confirm("Gỡ bài viết này?")) return;

        try {
            await deleteForumThread(threadId);
            setThreads((currentThreads) => currentThreads.filter((thread) => thread.id !== threadId));
            setActiveThreadId((currentActiveId) => currentActiveId === threadId ? null : currentActiveId);
            setActiveThreadDetail((currentThread) => currentThread?.id === threadId ? null : currentThread);
            setComments([]);
        } catch {
            setErrorMessage("Không gỡ được bài viết.");
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
                    onCreateClick={() => {
                        if (!isAuthenticated) {
                            openAuthModal("login");
                            return;
                        }
                        setEditingThread(null);
                        resetCreateThreadDraft();
                        setIsCreateModalOpen(true);
                    }}
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
                    userRole={user?.role}
                    onCancelReply={() => setReplyTarget(null)}
                    onDeleteComment={handleDeleteComment}
                    onDeleteThread={handleDeleteThread}
                    onDraftChange={setDraft}
                    onEditThread={openEditThreadModal}
                    onLikeComment={handleToggleLike}
                    onReply={setReplyTarget}
                    onSubmitComment={handleSubmitComment}
                />
            </div>

            {isCreateModalOpen && (
                <CreateThreadModal
                    attachments={newThreadAttachments}
                    canUseAnnouncementCategory={user?.role === "ADMIN"}
                    category={newThreadCategory}
                    content={newThreadExcerpt}
                    isUploadingImage={isUploadingImage}
                    modalTitle={editingThread ? "Chỉnh sửa bài viết" : "Tạo thread mới"}
                    submitLabel={editingThread ? "Lưu thay đổi" : "Đăng bài"}
                    title={newThreadTitle}
                    uploadError={uploadError}
                    onAttachmentRemove={(attachmentId) => {
                        const attachment = newThreadAttachments.find((item) => item.id === attachmentId);
                        setNewThreadAttachments((currentAttachments) => (
                            currentAttachments.filter((attachment) => attachment.id !== attachmentId)
                        ));
                        if (attachment) {
                            setNewThreadExcerpt((currentContent) => (
                                currentContent
                                    .replace(`![Ảnh đính kèm](attachment:${attachment.id})`, "")
                                    .replace(`![Ảnh đính kèm](${attachment.url})`, "")
                                    .replace(/\n{3,}/g, "\n\n")
                                    .trimStart()
                            ));
                        }
                    }}
                    onCancel={() => {
                        setIsCreateModalOpen(false);
                        setEditingThread(null);
                        resetCreateThreadDraft();
                    }}
                    onCategoryChange={setNewThreadCategory}
                    onDismiss={() => {
                        setIsCreateModalOpen(false);
                        setEditingThread(null);
                    }}
                    onContentChange={setNewThreadExcerpt}
                    onImageSelect={handleForumImageSelect}
                    onSubmit={handleCreateThread}
                    onTitleChange={setNewThreadTitle}
                />
            )}
        </div>
    );
}
