import {Link, useNavigate, useParams} from "react-router-dom";
import {AlertTriangle, ArrowLeft, ArrowRight, ArrowUp, ChevronLeft, ChevronRight, Flag, List, MessageCircle, MessageSquare, PenTool, Search, ThumbsUp, X} from "lucide-react";

import styles from "./ReadingMangaPage.module.css";
import type {ChapterPageRequest, ChapterPageResponse, ChapterReportType, ChapterResponse, CommentReportReason, MangaCommentResponse} from "../../types/manga.ts";
import {useEffect, useMemo, useState} from "react";
import {createChapterComment, createChapterReport, createCommentReport, deleteMangaComment, getChapterComments, getMangaBySlug, requestChapterPage, toggleCommentLike} from "../../api/mangaApi.ts";
import {useAuthStore} from "../../stores/authStore.ts";
import type { UserInfo } from "../../types/auth";
import {CommentEditor} from "../../components/CommentEmojiPicker/CommentEditor.tsx";
import {CommentEmojiPicker} from "../../components/CommentEmojiPicker/CommentEmojiPicker.tsx";
import {CommentText} from "../../components/CommentEmojiPicker/CommentText.tsx";

interface CommentItemProps {
    comment: MangaCommentResponse;
    chapterLabel: string;
    deletingCommentId: number | null;
    getAvatarLabel: (username?: string) => string;
    getCommentAuthorName: (userId: number, username: string) => string;
    canDeleteComment: (comment: MangaCommentResponse) => boolean;
    handleDeleteComment: (commentId: number) => void;
    handleToggleLike: (commentId: number) => void;
    handleOpenReportModal: (comment: MangaCommentResponse) => void;
    user: UserInfo | null;
}

function CommentItem({
    comment,
    chapterLabel,
    deletingCommentId,
    getAvatarLabel,
    getCommentAuthorName,
    canDeleteComment,
    handleDeleteComment,
    handleToggleLike,
    handleOpenReportModal,
    user
}: CommentItemProps) {
    return (
        <article className={styles.commentItem}>
            <div className={`${styles.commentAvatar} ${styles.sampleAvatar}`}>
                {getAvatarLabel(getCommentAuthorName(comment.user.id, comment.user.username))}
            </div>
            <div className={styles.commentBody}>
                <div className={styles.commentBubble}>
                    <div className={styles.commentAuthorRow}>
                        <span className={styles.commentAuthor}>{getCommentAuthorName(comment.user.id, comment.user.username)}</span>
                        {(comment.isAuthor || comment.user?.isAuthor) && (
                            <span 
                                style={{ 
                                    marginLeft: "8px", 
                                    fontSize: "11px", 
                                    padding: "2px 8px", 
                                    borderRadius: "12px", 
                                    backgroundColor: "#e0e7ff",
                                    color: "#4f46e5",
                                    border: "1px solid #c7d2fe",
                                    fontWeight: "bold",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    verticalAlign: "middle"
                                }}
                                title="Tác giả của bộ truyện"
                            >
                                <PenTool size={11} /> Tác giả
                            </span>
                        )}
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
                    <button
                        type="button"
                        onClick={() => handleToggleLike(comment.id)}
                        style={{
                            color: comment.isLiked ? "#3b82f6" : "inherit",
                            fontWeight: comment.isLiked ? "bold" : "normal",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                        }}
                    >
                        <ThumbsUp size={13} fill={comment.isLiked ? "#3b82f6" : "none"} color={comment.isLiked ? "#3b82f6" : "currentColor"} />
                        {comment.likeCount && comment.likeCount > 0 ? comment.likeCount : "Thích"}
                    </button>
                    <button
                        type="button"
                        style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                    >
                        <MessageSquare size={12} /> Trả lời
                    </button>
                    {user && user.id !== comment.user.id && (
                        <button
                            type="button"
                            onClick={() => handleOpenReportModal(comment)}
                            title="Báo cáo bình luận vi phạm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                        >
                            <Flag size={12} /> Báo cáo
                        </button>
                    )}
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
    );
}

interface BreadcrumbProps {
    className: string;
    slug: string;
    title: string;
    chapterLabel: string;
}

function Breadcrumb({ className, slug, title, chapterLabel }: BreadcrumbProps) {
    return (
        <nav className={className} aria-label="Breadcrumb">
            <Link to="/">Trang Chủ</Link>
            <span>/</span>
            <Link to={`/manga/${slug}`}>{title}</Link>
            <span>/</span>
            <strong>{chapterLabel}</strong>
        </nav>
    );
}

interface ChapterNavigationProps {
    className: string;
    hasPrevChapter: boolean;
    hasNextChapter: boolean;
    prevChapterPage: () => void;
    nextChapterPage: () => void;
}

function ChapterNavigation({
    className,
    hasPrevChapter,
    hasNextChapter,
    prevChapterPage,
    nextChapterPage
}: ChapterNavigationProps) {
    return (
        <div className={className}>
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
    );
}

interface ReportPanelProps {
    title: string;
    chapterLabel: string;
    reportType: ChapterReportType;
    setReportType: (type: ChapterReportType) => void;
    reportPage: string;
    setReportPage: (page: string) => void;
    reportDescription: string;
    setReportDescription: (desc: string) => void;
    reportMessage: string;
    reportSubmitting: boolean;
    handleSubmitReport: () => void;
}

function ReportPanel({
    title,
    chapterLabel,
    reportType,
    setReportType,
    reportPage,
    setReportPage,
    reportDescription,
    setReportDescription,
    reportMessage,
    reportSubmitting,
    handleSubmitReport
}: ReportPanelProps) {
    return (
        <div className={styles.reportPanel}>
            <div className={styles.reportIntro}>
                <strong>{title || "Truyện đang đọc"}</strong>
                <span>{chapterLabel}</span>
            </div>
            <div className={styles.reportGrid}>
                <label className={styles.reportField}>
                    <span>Loại lỗi</span>
                    <select value={reportType} onChange={(event) => setReportType(event.target.value as ChapterReportType)}>
                        <option value="IMAGE_BROKEN">Ảnh bị lỗi / không tải được</option>
                        <option value="MISSING_PAGE">Thiếu trang</option>
                        <option value="WRONG_ORDER">Sai thứ tự trang</option>
                        <option value="DUPLICATE_CHAPTER">Trùng chapter</option>
                    </select>
                </label>
                <label className={styles.reportField}>
                    <span>Trang liên quan</span>
                    <input
                        type="text"
                        value={reportPage}
                        onChange={(event) => setReportPage(event.target.value)}
                        placeholder="Ví dụ: 3, 7-9"
                    />
                </label>
            </div>
            <label className={styles.reportField}>
                <span>Mô tả lỗi</span>
                <textarea
                    value={reportDescription}
                    onChange={(event) => setReportDescription(event.target.value)}
                    placeholder="Mô tả ngắn lỗi bạn gặp trong chương này..."
                />
            </label>
            <div className={styles.reportActions}>
                {reportMessage && <p className={styles.reportMessage}>{reportMessage}</p>}
                <button
                    type="button"
                    className={styles.btnSubmitComment}
                    onClick={handleSubmitReport}
                    disabled={reportSubmitting || !reportDescription.trim()}
                >
                    {reportSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
            </div>
        </div>
    );
}

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
    const [allChapters, setAllChapters] = useState<ChapterResponse[]>([]);
    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [chapterSearch, setChapterSearch] = useState("");
    const [activeSupportTab, setActiveSupportTab] = useState<"comments" | "report">("comments");
    const [reportType, setReportType] = useState<ChapterReportType>("IMAGE_BROKEN");
    const [reportPage, setReportPage] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [reportMessage, setReportMessage] = useState("");
    const [reportSubmitting, setReportSubmitting] = useState(false);

    // Comment Report & Like states
    const [reportingComment, setReportingComment] = useState<MangaCommentResponse | null>(null);
    const [commentReportReason, setCommentReportReason] = useState<CommentReportReason>("SPAM");
    const [commentReportDesc, setCommentReportDesc] = useState("");
    const [commentReportSubmitting, setCommentReportSubmitting] = useState(false);
    const [commentReportMsg, setCommentReportMsg] = useState("");
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

    async function handleToggleLike(commentId: number) {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }
        try {
            const res = await toggleCommentLike(commentId);
            if (res.success && res.payload) {
                const { liked, likeCount } = res.payload;
                setComments((prev) =>
                    prev.map((c) => (c.id === commentId ? { ...c, isLiked: liked, likeCount } : c))
                );
            }
        } catch (err) {
            console.error("Failed to toggle comment like:", err);
        }
    }

    function handleOpenReportModal(c: MangaCommentResponse) {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }
        setReportingComment(c);
        setCommentReportReason("SPAM");
        setCommentReportDesc("");
        setCommentReportMsg("");
    }

    async function handleSubmitCommentReport(e: React.FormEvent) {
        e.preventDefault();
        if (!reportingComment) return;
        setCommentReportSubmitting(true);
        setCommentReportMsg("");
        try {
            const res = await createCommentReport(reportingComment.id, {
                reason: commentReportReason,
                description: commentReportDesc.trim() || undefined,
            });
            if (res.success) {
                setCommentReportMsg("Gửi báo cáo bình luận thành công! Cảm ơn bạn.");
                setTimeout(() => {
                    setReportingComment(null);
                    setCommentReportMsg("");
                }, 1500);
            }
        } catch {
            setCommentReportMsg("Báo cáo thất bại, vui lòng thử lại.");
        } finally {
            setCommentReportSubmitting(false);
        }
    }

    useEffect(() => {
        if (!slug) return;
        async function fetchChapters() {
            try {
                const res = await getMangaBySlug(slug!);
                if (res.success && res.payload?.chapters) {
                    setAllChapters(res.payload.chapters);
                }
            } catch (err) {
                console.error("Failed to load chapter list:", err);
            }
        }
        void fetchChapters();
    }, [slug]);

    const filteredChapters = useMemo(() => {
        if (!chapterSearch.trim()) return allChapters;
        return allChapters.filter((ch) =>
            ch.chapterNumber.toLowerCase().includes(chapterSearch.trim().toLowerCase())
        );
    }, [allChapters, chapterSearch]);

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

    function handleSelectChapter(selectedChapterNum: string) {
        if (!slug || selectedChapterNum === (chapterPage?.[0]?.chapterNumber ?? chapterNumber)) return;
        navigate(`/manga/${slug}/c/${selectedChapterNum}`);
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

    async function handleSubmitReport() {
        if (!isAuthenticated) {
            openAuthModal("login");
            return;
        }

        const description = reportDescription.trim();
        if (!description) {
            setReportMessage("Vui lòng mô tả lỗi cần báo cáo.");
            return;
        }

        if (!slug || !chapterNumber) {
            setReportMessage("Không xác định được chương cần báo cáo.");
            return;
        }

        setReportSubmitting(true);
        try {
            await createChapterReport(slug, chapterNumber, {
                type: reportType,
                pageHint: reportPage.trim() || undefined,
                description,
            });
            setReportMessage("Đã gửi báo cáo lỗi chương.");
            setReportType("IMAGE_BROKEN");
            setReportPage("");
            setReportDescription("");
        } catch {
            setReportMessage("Không thể gửi báo cáo lỗi chương.");
        } finally {
            setReportSubmitting(false);
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
                    <Breadcrumb
                        className={styles.breadcrumbTop}
                        slug={slug || ""}
                        title={title}
                        chapterLabel={chapterLabel}
                    />

                    <h1 className={styles.detailTitle}>
                        <Link to={`/manga/${slug}`}>{title}</Link> - {chapterLabel}
                    </h1>
                    <time className={styles.chapterTime}>Cập nhật lúc: 21:41 03/11/2021</time>

                    <ChapterNavigation
                        className={styles.topNavBtns}
                        hasPrevChapter={hasPrevChapter}
                        hasNextChapter={hasNextChapter}
                        prevChapterPage={prevChapterPage}
                        nextChapterPage={nextChapterPage}
                    />
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
                    <ChapterNavigation
                        className={styles.navBtns}
                        hasPrevChapter={hasPrevChapter}
                        hasNextChapter={hasNextChapter}
                        prevChapterPage={prevChapterPage}
                        nextChapterPage={nextChapterPage}
                    />

                    <Breadcrumb
                        className={styles.breadcrumbBottom}
                        slug={slug || ""}
                        title={title}
                        chapterLabel={chapterLabel}
                    />
                </section>

                <section className={`${styles.cardBox} ${styles.commentSection}`}>
                    <div className={styles.supportTabs} role="tablist" aria-label="Tương tác chương">
                        <button
                            type="button"
                            className={`${styles.supportTab} ${activeSupportTab === "comments" ? styles.activeSupportTab : ""}`}
                            onClick={() => setActiveSupportTab("comments")}
                        >
                            <MessageCircle aria-hidden="true" />
                            Bình luận ({comments.length})
                        </button>
                        <button
                            type="button"
                            className={`${styles.supportTab} ${activeSupportTab === "report" ? styles.activeSupportTab : ""}`}
                            onClick={() => setActiveSupportTab("report")}
                        >
                            <AlertTriangle aria-hidden="true" />
                            Báo cáo lỗi chương
                        </button>
                    </div>

                    {activeSupportTab === "comments" ? (
                        <>
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
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        chapterLabel={chapterLabel}
                                        deletingCommentId={deletingCommentId}
                                        getAvatarLabel={getAvatarLabel}
                                        getCommentAuthorName={getCommentAuthorName}
                                        canDeleteComment={canDeleteComment}
                                        handleDeleteComment={handleDeleteComment}
                                        handleToggleLike={handleToggleLike}
                                        handleOpenReportModal={handleOpenReportModal}
                                        user={user}
                                    />
                                ))}
                                {comments.length === 0 && (
                                    <p className={styles.emptyComments}>Chưa có bình luận nào cho chương này.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <ReportPanel
                            title={title}
                            chapterLabel={chapterLabel}
                            reportType={reportType}
                            setReportType={setReportType}
                            reportPage={reportPage}
                            setReportPage={setReportPage}
                            reportDescription={reportDescription}
                            setReportDescription={setReportDescription}
                            reportMessage={reportMessage}
                            reportSubmitting={reportSubmitting}
                            handleSubmitReport={handleSubmitReport}
                        />
                    )}
                </section>
            </main>

            {/* Floating Bottom Bar (Thanh cố định phía dưới màn hình) */}
            <div className={styles.floatingBottomBar}>
                <button
                    className={`${styles.floatingBtn} ${styles.floatingBtnPrimary}`}
                    type="button"
                    title="Danh sách chương"
                    onClick={() => setIsChapterModalOpen(!isChapterModalOpen)}
                >
                    <List size={18} />
                </button>

                <button
                    className={`${styles.floatingBtn} ${styles.floatingBtnMuted} ${!hasPrevChapter ? styles.disabled : ""}`}
                    type="button"
                    title="Chap trước"
                    onClick={prevChapterPage}
                    disabled={!hasPrevChapter}
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    className={styles.floatingChapterBtn}
                    type="button"
                    onClick={() => setIsChapterModalOpen(!isChapterModalOpen)}
                    title="Bấm để chọn chương"
                >
                    CHƯƠNG {chapterPage?.[0]?.chapterNumber ?? chapterNumber ?? ""}
                </button>

                <button
                    className={`${styles.floatingBtn} ${styles.floatingBtnPrimary} ${!hasNextChapter ? styles.disabled : ""}`}
                    type="button"
                    title="Chap sau"
                    onClick={nextChapterPage}
                    disabled={!hasNextChapter}
                >
                    <ChevronRight size={18} />
                </button>

                <button
                    className={`${styles.floatingBtn} ${styles.floatingBtnPrimary}`}
                    type="button"
                    title="Cuộn lên đầu trang"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    <ArrowUp size={18} />
                </button>
            </div>

            {/* Popup Modal "Chọn chương" (Tham khảo Hình 4) */}
            {isChapterModalOpen && (
                <div className={styles.chapterModalOverlay} onClick={() => setIsChapterModalOpen(false)}>
                    <div className={styles.chapterModalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.chapterModalHeader}>
                            <h3>Chọn chương</h3>
                            <button
                                type="button"
                                className={styles.btnCloseModal}
                                onClick={() => setIsChapterModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {allChapters.length > 8 && (
                            <div className={styles.chapterSearchBox}>
                                <Search size={14} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Tìm chương..."
                                    value={chapterSearch}
                                    onChange={(e) => setChapterSearch(e.target.value)}
                                />
                            </div>
                        )}

                        <div className={styles.chapterModalList}>
                            {filteredChapters.map((ch) => {
                                const isCurrent = ch.chapterNumber === (chapterPage?.[0]?.chapterNumber ?? chapterNumber);
                                return (
                                    <button
                                        key={ch.chapterNumber}
                                        type="button"
                                        className={`${styles.chapterModalItem} ${isCurrent ? styles.activeChapterItem : ""}`}
                                        onClick={() => {
                                            handleSelectChapter(ch.chapterNumber);
                                            setIsChapterModalOpen(false);
                                        }}
                                    >
                                        Chương {ch.chapterNumber}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Báo cáo Bình luận */}
            {reportingComment && (
                <CommentReportModal
                    onClose={() => setReportingComment(null)}
                    commentReportReason={commentReportReason}
                    setCommentReportReason={setCommentReportReason}
                    commentReportDesc={commentReportDesc}
                    setCommentReportDesc={setCommentReportDesc}
                    commentReportMsg={commentReportMsg}
                    commentReportSubmitting={commentReportSubmitting}
                    onSubmit={handleSubmitCommentReport}
                />
            )}
        </div>
    );
}

interface CommentReportModalProps {
    onClose: () => void;
    commentReportReason: CommentReportReason;
    setCommentReportReason: (r: CommentReportReason) => void;
    commentReportDesc: string;
    setCommentReportDesc: (d: string) => void;
    commentReportMsg: string;
    commentReportSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

function CommentReportModal({
    onClose,
    commentReportReason,
    setCommentReportReason,
    commentReportDesc,
    setCommentReportDesc,
    commentReportMsg,
    commentReportSubmitting,
    onSubmit
}: CommentReportModalProps) {
    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)"
        }} onClick={onClose}>
            <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                width: "90%",
                maxWidth: "440px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: 700 }}>Báo cáo bình luận</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                    >
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={onSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: 600, marginBottom: "6px" }}>
                            Lý do báo cáo:
                        </label>
                        <select
                            value={commentReportReason}
                            onChange={(e) => setCommentReportReason(e.target.value as CommentReportReason)}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", outline: "none" }}
                        >
                            <option value="SPAM">Spam / Quảng cáo rác</option>
                            <option value="HARASSMENT">Ngôn từ xúc phạm / Độc hại</option>
                            <option value="SPOILER">Tiết lộ nội dung / Spoiler</option>
                            <option value="HATE_SPEECH">Phát ngôn thù ghét</option>
                            <option value="OTHER">Lý do khác</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: 600, marginBottom: "6px" }}>
                            Mô tả thêm (Không bắt buộc):
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Chi tiết lý do báo cáo..."
                            value={commentReportDesc}
                            onChange={(e) => setCommentReportDesc(e.target.value)}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: "13px", resize: "none", outline: "none" }}
                        />
                    </div>

                    {commentReportMsg && (
                        <p style={{ margin: 0, fontSize: "13px", color: commentReportMsg.includes("thành công") ? "#10b981" : "#ef4444" }}>
                            {commentReportMsg}
                        </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={commentReportSubmitting}
                            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-accent)", color: "#ffffff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                        >
                            {commentReportSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
