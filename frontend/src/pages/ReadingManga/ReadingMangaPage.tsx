import {Link, useNavigate, useParams} from "react-router-dom";

import styles from "./ReadingMangaPage.module.css";
import type {ChapterPageRequest, ChapterPageResponse} from "../../types/manga.ts";
import {useEffect, useMemo, useState} from "react";
import {requestChapterPage} from "../../api/mangaApi.ts";


function ArrowLeftIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5"></path>
            <path d="m12 19-7-7 7-7"></path>
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
        </svg>
    );
}

function CommentIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
        </svg>
    );
}

function ThumbsUpIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10v12"></path>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path>
        </svg>
    );
}

function FlagIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <path d="M4 22V15"></path>
        </svg>
    );
}

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
    const currentChapter = Number(chapterNumber);
    const latestChapter = Number(chapterPage?.[0]?.latestChapterNumber);
    let hasPrevChapter = false;
    let hasNextChapter = false;

    if (Number.isFinite(currentChapter)) {
        if (currentChapter > 1) {
            hasPrevChapter = true;
        } else {
            hasPrevChapter = false;
        }

        if (Number.isFinite(latestChapter)) {
            if (currentChapter < latestChapter) {
                hasNextChapter = true;
            } else {
                hasNextChapter = false;
            }
        } else {
            hasNextChapter = false;
        }
    } else {
        hasPrevChapter = false;
        hasNextChapter = false;
    }

    function nextChapterPage(){
         if (!hasNextChapter) return;
         navigate(`/manga/${slug}/c/${currentChapter + 1}`);
    }

    function prevChapterPage(){
        if (!hasPrevChapter) return;
        navigate(`/manga/${slug}/c/${currentChapter - 1}`);
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
                            <ArrowLeftIcon />
                            Chap trước
                        </button>
                        <button
                            className={`${styles.btnNav} ${!hasNextChapter ? styles.disabled : ""}`}
                            type="button"
                            onClick={nextChapterPage}
                            disabled={!hasNextChapter}
                        >
                            Chap sau
                            <ArrowRightIcon />
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
                            <ArrowLeftIcon />
                            Chap trước
                        </button>
                        <button
                            className={`${styles.btnNav} ${!hasNextChapter ? styles.disabled : ""}`}
                            type="button"
                            onClick={nextChapterPage}
                            disabled={!hasNextChapter}
                        >
                            Chap sau
                            <ArrowRightIcon />
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
                        <CommentIcon />
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
                                    <span><ClockIcon /> 4 ngày trước</span>
                                    <button type="button"><ThumbsUpIcon /> Thích 5</button>
                                    <button type="button"><FlagIcon /> Báo cáo</button>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            </main>
        </div>
    );
}
