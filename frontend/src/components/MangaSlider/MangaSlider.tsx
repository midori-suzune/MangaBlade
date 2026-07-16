import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

import type {MangaWithLatestChapter} from "../../types/manga.ts";
import {getTimeAgo} from "../../utils/time.ts";
import styles from "./MangaSlider.module.css";

type MangaSliderProps = {
    manga: MangaWithLatestChapter[];
};

export function MangaSlider({manga}: MangaSliderProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const activeIndex = manga.length === 0 ? 0 : activeSlide % manga.length;
    const activeManga = manga[activeIndex];

    useEffect(() => {
        if (manga.length === 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % manga.length);
        }, 3000);

        return () => window.clearInterval(timer);
    }, [manga.length]);

    if (!activeManga) {
        return (
            <div className={styles.sliderPlaceholder}>
                <span>Slide Động</span>
            </div>
        );
    }

    return (
        <section
            className={styles.heroSlider}
            style={{backgroundImage: `url(${activeManga.thumbUrl})`}}
            aria-label="Truyện nổi bật"
        >
            <div className={styles.heroScrim}>
                <div className={styles.heroContent}>
                    <span className={styles.heroEyebrow}>{getTimeAgo(activeManga.updatedAt)}</span>
                    <h1 className={styles.heroTitle}>{activeManga.title}</h1>
                    <p className={styles.heroChapter}>
                        Chapter {activeManga.latestChapter.chapterNumber}
                    </p>
                    <Link
                        to={`/manga/${activeManga.slug}`}
                        state={{manga: activeManga}}
                        className={styles.heroButton}
                    >
                        Đọc Ngay
                    </Link>
                </div>

                <img
                    className={styles.heroCover}
                    src={activeManga.thumbUrl}
                    alt={activeManga.title}
                />

                {manga.length > 1 && (
                    <div className={styles.heroDots} aria-label="Chọn truyện nổi bật">
                        {manga.map((item, index) => (
                            <button
                                className={`${styles.heroDot} ${index === activeIndex ? styles.activeDot : ""}`}
                                key={`${item.title}-${item.latestChapter.chapterNumber}`}
                                type="button"
                                onClick={() => setActiveSlide(index)}
                                aria-label={`Chuyển tới ${item.title}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
