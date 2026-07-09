import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import styles from "./Header.module.css";

export function Header() {
    const { isAuthenticated, user, logout, openAuthModal } = useAuthStore();

    return (
        <header className={styles.topHeaderWrapper}>
            <div className={styles.topHeader}>
                <Link to="/" className={styles.logo}>Manga<span>Blade</span></Link>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon} aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img">
                            <circle cx="11" cy="11" r="7"></circle>
                            <path d="m16.5 16.5 4 4"></path>
                        </svg>
                    </span>
                    <input type="text" placeholder="Tìm kiếm truyện..."/>
                </div>
                {isAuthenticated && user ? (
                    <div className={styles.userInfo}>
                        <span className={styles.username}>{user.username}</span>
                        <button className={styles.btnLogout} onClick={logout}>Đăng xuất</button>
                    </div>
                ) : (
                    <div className={styles.authButtons}>
                        <button className={styles.btnSignup} onClick={() => openAuthModal('login')}>Đăng nhập</button>
                    </div>
                )}
            </div>
        </header>
    )
}
