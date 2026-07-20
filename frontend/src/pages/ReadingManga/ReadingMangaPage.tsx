import {Link, useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, ArrowRight, MessageCircle} from "lucide-react";

import styles from "./ReadingMangaPage.module.css";
import type {ChapterPageRequest, ChapterPageResponse, MangaCommentResponse} from "../../types/manga.ts";
import {useEffect, useMemo, useState} from "react";
import {createChapterComment, deleteMangaComment, getChapterComments, requestChapterPage} from "../../api/mangaApi.ts";
import {useAuthStore} from "../../stores/authStore.ts";
import {CommentEditor} from "../../components/CommentEmojiPicker/CommentEditor.tsx";
import {CommentEmojiPicker} from "../../components/CommentEmojiPicker/CommentEmojiPicker.tsx";
import {CommentText} from "../../components/CommentEmojiPicker/CommentText.tsx";

export function ReadingMangaPage() {


    const { slug , chapterNumber} = useParams<{ slug : string ; chapterNumber : string}>();
    const navigate = useNavigate();
    const {isAuthenticated, openAuthModal, user} = useAuthStore();
    const [error, setError] = useState<string>("");
    const [chapterPage, setChapterPage] = useState<ChapterPageResponse[] | null>();
    const [comments, setComments] = useState<MangaCommentResponse[]>([]);
    const [commentContent, setCommentContent] = useState("");
    const [commentError, setCommentError] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const chapterPageRequest : ChapterPageRequest = useMemo<ChapterPageRequest>( () => ({
        slugManga : slug as string ,
        chapterNumber : chapterNumber as string

    }),[slug, chapterNumber]);

    useEffect(() => {
        async function request(){
            try{
               const data =await requestChapterPage(chapterPageRequest);
               console.log(data);
                setChapterPage(data.payload);
                setError("");
            }catch{
                setError(`Error chapter page ${chapterPageRequest.chapterNumber}`);
            }
        }
        void request()
    }, [chapterPageRequest]);

    useEffect(() => {
        async function requestComments() {
            if (!slug || !chapterNumber) return;

            try {
                const data = await getChapterComments(slug, chapterNumber);
                setComments(data.payload);
                setCommentError("");
            } catch {
                setCommentError("Không thể tải bình luận.");
            }
        }

        void requestComments();
    }, [slug, chapterNumber]);

    const title = chapterPage?.[0]?.mangaTitle ?? "";
    const chapterLabel = `Chương ${chapterPage?.[0]?.chapterNumber ?? chapterNumber ?? ""}`;
    const previousChapterNumber = chapterPage?.[0]?.previousChapterNumber;
    const nextChapterNumber = chapterPage?.[0]?.nextChapterNumber;
    const hasPrevChapter = Boolean(previousChapterNumber);
    const hasNextChapter = Boolean(nextChapterNumber);

    function nextChapterPage(){
         if (!hasNextChapter) return;
         navigate(`/manga/${slug}/c/${nextChapterNumber}`);
    }

    function prevChapterPage(){
        if (!hasPrevChapter) return;
        navigate(`/manga/${slug}/c/${previousChapterNumber}`);
    }

    async function handleSubmitComment() {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        const content = commentContent.trim();
        if (!content || !slug || !chapterNumber) {
            return;
        }

        setCommentSubmitting(true);
        try {
            const data = await createChapterComment(slug, chapterNumber, {content});
            setComments((current) => [data.payload, ...current]);
            setCommentContent("");
            setCommentError("");
        } catch {
            setCommentError("Không thể gửi bình luận.");
        } finally {
            setCommentSubmitting(false);
        }
    }

    function canDeleteComment(comment: MangaCommentResponse) {
        return Boolean(user && (user.role === "ADMIN" || user.id === comment.user.id));
    }

    async function handleDeleteComment(commentId: number) {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn gỡ bình luận này?")) {
            return;
        }

        setDeletingCommentId(commentId);
        try {
            await deleteMangaComment(commentId);
            setComments((current) => current.filter((comment) => comment.id !== commentId));
            setCommentError("");
        } catch {
            setCommentError("Không thể gỡ bình luận.");
        } finally {
            setDeletingCommentId(null);
        }
    }

    function getAvatarLabel(username?: string) {
        return (username || "U").slice(0, 1).toUpperCase();
    }

    function getCommentAuthorName(userId: number, username: string) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser && currentUser.id === userId) {
            return useAuthStore.getState().displayName || getPublicUsername(username);
        }
        const cachedName = localStorage.getItem(`displayName_${userId}`);
        return cachedName || getPublicUsername(username);
    }

    function getPublicUsername(username: string) {
        const atIndex = username.indexOf("@");
        if (atIndex > 0) {
            return username.slice(0, atIndex);
        }
        return username;
    }

    return (
        <div className={styles.readerPageBg}>
            <main className={styles.mainContainer}>
                <section className={`${styles.cardBox} ${styles.chapterControl}`}>
                    <nav className={styles.breadcrumbTop} aria-label="Breadcrumb">
                        <Link to="/">Trang Chủ</Link>
                        <span>/</span>
                        <Link to={`/manga/${slug}`}>{title}</Link>
                        <span>/</span>
                        <strong>{chapterLabel}</strong>
                    </nav>

                    <h1 className={styles.detailTitle}>
                        <Link to={`/manga/${slug}`}>{title}</Link> - {chapterLabel}
                    </h1>
                    <time className={styles.chapterTime}>Cập nhật lúc: 21:41 03/11/2021</time>

                    <div className={styles.topNavBtns}>
                        <button
                            className={`${styles.btnNav} ${!hasPrevChapter ? styles.disabled : ""}`}
                            type="button"
                            onClick={prevChapterPage}
                            disabled={!hasPrevChapter}
                        >
                            <ArrowLeft aria-hidden="true" />
                            Chap trước
                        </button>
                        <button
                            className={`${styles.btnNav} ${!hasNextChapter ? styles.disabled : ""}`}
                            type="button"
                            onClick={nextChapterPage}
                            disabled={!hasNextChapter}
                        >
                            Chap sau
                            <ArrowRight aria-hidden="true" />
                        </button>
                    </div>
                </section>

                <section className={styles.chapterContent} aria-label="Nội dung chương">
                    {error && <p>{error}</p>}
                    {chapterPage?.map((page, index) => (
                        <div className={styles.pageChapter} id={`page_${index}`} key={page.imageUrl}>
                            <img src={page.imageUrl} alt={`Page ${index + 1}`} />
                        </div>
                    ))}
                </section>

                <section className={`${styles.cardBox} ${styles.bottomNav}`}>
                    <div className={styles.navBtns}>
                        <button
                            className={`${styles.btnNav} ${!hasPrevChapter ? styles.disabled : ""}`}
                            type="button"
                            onClick={prevChapterPage}
                            disabled={!hasPrevChapter}
                        >
                            <ArrowLeft aria-hidden="true" />
                            Chap trước
                        </button>
                        <button
                            className={`${styles.btnNav} ${!hasNextChapter ? styles.disabled : ""}`}
                            type="button"
                            onClick={nextChapterPage}
                            disabled={!hasNextChapter}
                        >
                            Chap sau
                            <ArrowRight aria-hidden="true" />
                        </button>
                    </div>

                    <nav className={styles.breadcrumbBottom} aria-label="Breadcrumb">
                        <Link to="/">Trang Chủ</Link>
                        <span>/</span>
                        <Link to={`/manga/${slug}`}>{title}</Link>
                        <span>/</span>
                        <strong>{chapterLabel}</strong>
                    </nav>
                </section>

                <section className={`${styles.cardBox} ${styles.commentSection}`}>
                    <h2 className={styles.sectionTitleSmall}>
                        <MessageCircle aria-hidden="true" />
                        Bình Luận ({comments.length})
                    </h2>

                    <div className={styles.commentInputBox}>
                        <div className={styles.commentAvatar}>{getAvatarLabel(user?.username)}</div>
                        <div className={styles.commentInputWrapper}>
                            <CommentEditor
                                placeholder="Nhập bình luận của bạn..."
                                minRows={3}
                                value={commentContent}
                                onChange={setCommentContent}
                            />
                            <div className={styles.commentActions}>
                                <CommentEmojiPicker />
                                <button
                                    className={styles.btnSubmitComment}
                                    type="button"
                                    onClick={handleSubmitComment}
                                    disabled={commentSubmitting || !commentContent.trim()}
                                >
                                    {commentSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                                </button>
                            </div>
                            {commentError && <p className={styles.commentError}>{commentError}</p>}
                        </div>
                    </div>

                    <div className={styles.detailComments}>
                        {comments.map((comment) => (
                            <article className={styles.commentItem} key={comment.id}>
                                <div className={`${styles.commentAvatar} ${styles.sampleAvatar}`}>
                                    {getAvatarLabel(getCommentAuthorName(comment.user.id, comment.user.username))}
                                </div>
                                <div className={styles.commentBody}>
                                    <div className={styles.commentBubble}>
                                        <div className={styles.commentAuthorRow}>
                                            <span className={styles.commentAuthor}>{getCommentAuthorName(comment.user.id, comment.user.username)}</span>
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
                                            <span className={styles.commentBadge}>{chapterLabel}</span>
                                        </div>
                                        <p className={styles.commentText}>
                                            <CommentText content={comment.content} />
                                        </p>
                                    </div>
                                    <div className={styles.commentFooterActions}>
                                        <span>{new Date(comment.createdAt).toLocaleDateString("vi-VN")}</span>
                                        <button type="button">Thích</button>
                                        <button type="button">Trả lời</button>
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
                                </div>
                            </article>
                        ))}
                        {comments.length === 0 && (
                            <p className={styles.emptyComments}>Chưa có bình luận nào cho chương này.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
