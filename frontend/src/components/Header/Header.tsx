import styles from "./Header.module.css";

export function Header() {
    return (
        <header className={styles.topHeaderWrapper}>
            <div className={styles.topHeader}>
                <a href="#" className={styles.logo}>Manga<span>Blade</span></a>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon} aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img">
                            <circle cx="11" cy="11" r="7"></circle>
                            <path d="m16.5 16.5 4 4"></path>
                        </svg>
                    </span>
                    <input type="text" placeholder="Tìm kiếm truyện..."/>
                </div>
                <div className={styles.authButtons}>
                    <button className={styles.btnSignup}>Đăng ký</button>
                    <button className={styles.btnLogin}>Đăng nhập</button>
                </div>
            </div>
        </header>
    )
}
