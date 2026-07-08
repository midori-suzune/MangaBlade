
import styles from "./Footer.module.css";

export function Footer() {
    return (
        <footer className={styles.siteFooter}>
            <div className={styles.footerContainer}>
                <div className={styles.footerColMain}>
                    <a href="#" className={styles.logo}>Manga<span>Blade</span></a>
                    <p className={styles.footerDesc}>
                        Nền tảng đọc truyện tranh trực tuyến miễn phí, cập nhật nhanh nhất. Đầy đủ các thể loại truyện tranh mới nhất.
                    </p>
                    <p className={styles.footerCopyright}>© 2024 MangaBlade - Truyện Hay Online</p>
                </div>

                <div className={styles.footerColLinks}>
                    <h3 className={styles.footerTitle}>Liên Kết</h3>
                    <div className={styles.footerLinks}>
                        <a href="#">Về Chúng Tôi</a>
                        <a href="#">Chính Sách Bảo Mật</a>
                        <a href="#">Liên Hệ</a>
                    </div>
                </div>

                <div className={styles.footerColStats}>
                    <h3 className={styles.footerTitle}>Thông Tin</h3>
                    <div className={styles.footerStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statIcon} aria-hidden="true">
                                <svg viewBox="0 0 24 24">
                                    <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </span>
                            <span>Lượt truy cập:</span>
                            <span className={styles.statValue}>36,637</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statIcon} aria-hidden="true">
                                <svg viewBox="0 0 24 24">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </span>
                            <span>Đang truy cập:</span>
                            <span className={styles.statValue}>17</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
