import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import styles from "./Menu.module.css";

export function Menu() {
    const { isAuthenticated, openAuthModal } = useAuthStore();
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        return localStorage.getItem("mangablade-theme") === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("mangablade-theme", theme);
    }, [theme]);

    function requireLogin(event: React.MouseEvent<HTMLAnchorElement>) {
        if (isAuthenticated) {
            return;
        }

        event.preventDefault();
        openAuthModal("login");
    }

    return (
        <header className={styles.bottomHeaderWrapper}>
            <div className={styles.bottomHeader}>
            <nav className={styles.navLinks} aria-label="Main navigation">
                <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''} end>Trang chủ</NavLink>
                <NavLink to="/category" className={({ isActive }) => isActive ? styles.active : ''}>Thể loại</NavLink>
                <NavLink to="/forum" className={({ isActive }) => isActive ? styles.active : ''}>Diễn Đàn</NavLink>
                <NavLink
                    to="/followed-manga"
                    className={({ isActive }) => isActive ? styles.active : ''}
                    onClick={requireLogin}
                >
                    Theo dõi
                </NavLink>
                <NavLink
                    to="/reading-history"
                    className={({ isActive }) => isActive ? styles.active : ''}
                    onClick={requireLogin}
                >
                    Lịch sử đọc
                </NavLink>
            </nav>
            <div className={styles.menuRightIcons}>
                <button
                    className={`${styles.themeToggleBtn} ${theme === "dark" ? styles.dark : ""}`}
                    title={theme === "dark" ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
                    type="button"
                    aria-label={theme === "dark" ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
                    aria-pressed={theme === "dark"}
                    onClick={() => setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5">
                        </path>
                        <path d="M9 18h6"></path>
                        <path d="M10 22h4"></path>
                    </svg>
                </button>
            </div>
            </div>
        </header>
    );
}
