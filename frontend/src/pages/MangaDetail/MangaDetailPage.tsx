import {Link} from "react-router-dom";

import type {MangaDetailResponse} from "../../types/manga.ts";
import {getTimeAgo} from "../../utils/time.ts";
import styles from "./MangaDetailPage.module.css";
import {useEffect, useState} from "react";
import {getMangaBySlug} from "../../api/mangaApi.ts";


export function MangaDetailPage() {
    // const {slug} = useParams<{slug: string}>();
    const [manga, setManga] = useState<MangaDetailResponse>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const url = window.location.href
        const slug = url.substring(url.lastIndexOf("/") + 1)
        console.log(slug)
        async function loadMangaDetail() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getMangaBySlug(slug);
                if (response.success) {
                    setManga(response.payload);
                    return;
                }

                setError("Không thể tải thông tin truyện");
            } catch {
                setError("Không thể tải thông tin truyện");
            } finally {
                setIsLoading(false);
            }
        }

        void loadMangaDetail();
    }, []);

    const title = manga?.title
    const thumbUrl = manga?.thumbUrl
    const updatedAt = manga?.updatedAt
    const chapters = manga?.chapters ?? []
    const description = manga?.description
    const status = manga?.status
    const sourceType = manga?.sourceType
    const authors = manga?.authors ?? []
    const firstChapter = chapters[0]

    return (
        <div className={styles.mainContainer}>
            <section className={styles.detailContainer}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link to="/">Trang Chủ</Link>
                    <span>/</span>
                    <span className={styles.current}>{title}</span>
                </nav>

                {error && <p className={styles.errorText}>{error}</p>}

                <section className={styles.mangaInfoBox}>
                    <div className={styles.coverFrame}>
                        {thumbUrl ? <img src={thumbUrl} alt={title} /> : <span className={styles.coverPlaceholder}>Ảnh Bìa</span>}
                    </div>

                    <div className={styles.mangaDetails}>
                        <h1 className={styles.mangaTitle}>{title}</h1>

                        <ul className={styles.mangaMeta}>
                            <li>
                                <span className={styles.metaLabel}>Tên khác</span>
                                <span className={styles.metaValue}>{title}</span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Tác giả</span>
                                <span className={styles.metaValue}>
                                    {authors.length > 0 ? authors.map((author) => author.name).join(", ") : "Đang cập nhật"}
                                </span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Cập nhật</span>
                                <span className={styles.metaValue}>{updatedAt ? updatedAt.split("T")[0] : "Đang cập nhật"}</span>
                            </li>

                            <li>
                                <span className={styles.metaLabel}>Tình trạng</span>
                                <span className={styles.metaValue}>{status}</span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Nguồn</span>
                                <span className={styles.metaValue}>{sourceType}</span>
                            </li>
                        </ul>

                        <div className={styles.mangaActions}>
                            <a
                                className={`${styles.actionButton} ${styles.readButton}`}
                                href={firstChapter?.chapterUrl ?? "#"}
                                aria-disabled={!firstChapter}
                            >
                                Đọc từ đầu
                            </a>
                            <button className={`${styles.actionButton} ${styles.followButton}`} type="button">Theo dõi</button>
                            <button className={`${styles.actionButton} ${styles.likeButton}`} type="button">Thích</button>
                        </div>
                    </div>
                </section>

                <section className={styles.mangaSection}>
                    <h2 className={styles.sectionTitle}>Giới Thiệu</h2>
                    <p className={styles.description}>{description}</p>
                </section>

                <section className={styles.mangaSection}>
                    <h2 className={styles.sectionTitle}>Danh Sách Chương</h2>
                    <div className={styles.chapterListContainer}>
                        {chapters.length > 0 ? (
                            <ul className={styles.chapterList}>
                                {chapters.map((chapter) => (
                                    <li key={`${chapter.chapterNumber}-${chapter.chapterUrl}`}>
                                        <a href={chapter.chapterUrl} className={styles.chapterName}>Chương {chapter.chapterNumber}</a>
                                        <span className={styles.chapterDate}>{updatedAt ? getTimeAgo(updatedAt) : "Đang cập nhật"}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.emptyText}>{isLoading ? "Đang tải danh sách chương..." : "Chưa có chương nào."}</p>
                        )}
                    </div>
                </section>

                <section className={styles.mangaSection}>
                    <h2 className={styles.sectionTitle}>Bình Luận</h2>
                    <div className={styles.commentInputBox}>
                        <div className={styles.commentAvatar}>U</div>
                        <div className={styles.commentInputWrapper}>
                            <textarea placeholder="Nhập bình luận của bạn về truyện này..." rows={3}></textarea>
                            <div className={styles.commentActions}>
                                <button className={styles.submitCommentButton} type="button">Gửi bình luận</button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.commentList}>
                        <article className={styles.commentItem}>
                            <div className={styles.commentAvatar}>M</div>
                            <div className={styles.commentBody}>
                                <div className={styles.commentBubble}>
                                    <div className={styles.commentAuthorRow}>
                                        <span className={styles.commentAuthor}>MangaBlade</span>
                                        {/*{latestChapter && <span className={styles.commentBadge}>Chapter {latestChapter}</span>}*/}
                                    </div>
                                    <p className={styles.commentText}>Khu vực bình luận mẫu cho trang chi tiết truyện.</p>
                                </div>
                                <div className={styles.commentFooter}>
                                    <span>Vừa xong</span>
                                    <button type="button">Thích</button>
                                    <button type="button">Báo cáo</button>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            </section>
        </div>
    );
}
