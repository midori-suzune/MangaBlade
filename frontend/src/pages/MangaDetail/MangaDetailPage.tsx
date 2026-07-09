import {Link, useLocation, useParams} from "react-router-dom";

import type {MangaResponse} from "../../types/manga.ts";
import {getTimeAgo} from "../../utils/time.ts";
import styles from "./MangaDetailPage.module.css";

type MangaDetailLocationState = {
    manga?: MangaResponse;
};

const fallbackCover = "https://placehold.co/300x400/e2e8f0/64748b?text=MangaBlade";

function titleFromSlug(slug?: string) {
    if (!slug) {
        return "Đang cập nhật";
    }

    return slug
        .split("-")
        .filter(Boolean)
        .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
        .join(" ");
}

function buildChapterList(latestChapter?: string) {
    const latest = Number.parseFloat(latestChapter ?? "1");
    const safeLatest = Number.isFinite(latest) ? latest : 1;

    return Array.from({length: 8}, (_, index) => {
        const number = Math.max(safeLatest - index, 1);
        return {
            chapterNumber: Number.isInteger(number) ? String(number) : number.toFixed(1),
            updatedAt: index === 0 ? "Mới cập nhật" : `${index + 1} ngày trước`,
        };
    });
}

export function MangaDetailPage() {
    const {slug} = useParams();
    const location = useLocation();
    const state = location.state as MangaDetailLocationState | null;
    const manga = state?.manga;
    const title = manga?.title ?? titleFromSlug(slug);
    const coverUrl = manga?.thumbUrl ?? fallbackCover;
    const latestChapter = manga?.latestChapter.chapterNumber ?? "1";
    const chapters = buildChapterList(latestChapter);

    return (
        <div className={styles.mainContainer}>
            <section className={styles.detailContainer}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link to="/">Trang Chủ</Link>
                    <span>/</span>
                    <span className={styles.current}>{title}</span>
                </nav>

                <section className={styles.mangaInfoBox}>
                    <div className={styles.coverFrame}>
                        <img src={coverUrl} alt={title} />
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
                                <span className={styles.metaValue}>Đang cập nhật</span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Cập nhật</span>
                                <span className={styles.metaValue}>{manga ? getTimeAgo(manga.updatedAt) : "Đang cập nhật"}</span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Chapter mới</span>
                                <span className={styles.metaValue}>Chapter {latestChapter}</span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Tình trạng</span>
                                <span className={styles.metaValue}>Đang cập nhật</span>
                            </li>
                            <li>
                                <span className={styles.metaLabel}>Nguồn</span>
                                <span className={styles.metaValue}>OTruyen</span>
                            </li>
                        </ul>

                        <div className={styles.mangaActions}>
                            <button className={`${styles.actionButton} ${styles.readButton}`} type="button">Đọc từ đầu</button>
                            <button className={`${styles.actionButton} ${styles.followButton}`} type="button">Theo dõi</button>
                            <button className={`${styles.actionButton} ${styles.likeButton}`} type="button">Thích</button>
                        </div>
                    </div>
                </section>

                <section className={styles.mangaSection}>
                    <h2 className={styles.sectionTitle}>Giới Thiệu</h2>
                    <p className={styles.description}>
                        <strong>{title}</strong> đang được cập nhật trên MangaBlade. Trang chi tiết hiện dùng dữ liệu từ danh sách truyện,
                        phần mô tả, tác giả, thể loại và danh sách chương đầy đủ sẽ được đồng bộ khi API detail sẵn sàng.
                    </p>
                </section>

                <section className={styles.mangaSection}>
                    <h2 className={styles.sectionTitle}>Danh Sách Chương</h2>
                    <div className={styles.chapterListContainer}>
                        <ul className={styles.chapterList}>
                            {chapters.map((chapter) => (
                                <li key={chapter.chapterNumber}>
                                    <a href="#" className={styles.chapterName}>Chương {chapter.chapterNumber}</a>
                                    <span className={styles.chapterDate}>{chapter.updatedAt}</span>
                                </li>
                            ))}
                        </ul>
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
                                        <span className={styles.commentBadge}>Chapter {latestChapter}</span>
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
