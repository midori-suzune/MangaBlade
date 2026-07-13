import {Link, useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, ArrowRight, Clock, Flag, MessageCircle, ThumbsUp} from "lucide-react";

import styles from "./ReadingMangaPage.module.css";
import type {ChapterPageRequest, ChapterPageResponse} from "../../types/manga.ts";
import {useEffect, useMemo, useState} from "react";
import {requestChapterPage} from "../../api/mangaApi.ts";

export function ReadingMangaPage() {


    const { slug , chapterNumber} = useParams<{ slug : string ; chapterNumber : string}>();
    const navigate = useNavigate();
    const [error, setError] = useState<string>("");
    const [chapterPage, setChapterPage] = useState<ChapterPageResponse[] | null>();
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
                        Bình Luận (184)
                    </h2>

                    <div className={styles.commentInputBox}>
                        <div className={styles.commentAvatar}>U</div>
                        <div className={styles.commentInputWrapper}>
                            <textarea placeholder="Nhập bình luận của bạn..." rows={3}></textarea>
                            <div className={styles.commentActions}>
                                <button className={styles.btnSubmitComment} type="button">Gửi bình luận</button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.detailComments}>
                        <article className={styles.commentItem}>
                            <div className={`${styles.commentAvatar} ${styles.sampleAvatar}`}>Đ</div>
                            <div className={styles.commentBody}>
                                <div className={styles.commentBubble}>
                                    <div className={styles.commentAuthorRow}>
                                        <span className={styles.commentAuthor}>Zhane</span>
                                        <span className={styles.commentBadge}>Chương 4</span>
                                    </div>
                                    <p className={styles.commentText}>Bộ này hay quá, hóng chap mới admin ơi!</p>
                                </div>
                                <div className={styles.commentFooterActions}>
                                    <span><Clock aria-hidden="true" /> 4 ngày trước</span>
                                    <button type="button"><ThumbsUp aria-hidden="true" /> Thích 5</button>
                                    <button type="button"><Flag aria-hidden="true" /> Báo cáo</button>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            </main>
        </div>
    );
}
