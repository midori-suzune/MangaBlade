import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import styles from "./Header.module.css";

export function Header() {
    const { isAuthenticated, user, logout, openAuthModal } = useAuthStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
            setAvatarUrl(savedAvatar);
        } else {
            setAvatarUrl(null);
        }
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    <div className={styles.headerRightActions}>
                        <button className={styles.btnNotification} aria-label="Thông báo" onClick={() => alert('Tính năng thông báo đang được phát triển!')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </button>
                        
                        <div className={styles.userMenuContainer} ref={dropdownRef}>
                            <button className={styles.avatarBtn} onClick={() => setIsDropdownOpen(!isDropdownOpen)} aria-label="Menu cá nhân">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>{user.username.charAt(0).toUpperCase()}</span>
                                )}
                            </button>
                            {isDropdownOpen && (
                                <div className={`${styles.dropdownMenu} ${styles.show}`}>
                                    <div className={styles.dropdownUserInfo}>
                                        <span className={styles.dropdownUserName}>{user.username}</span>
                                        <span className={styles.dropdownUserEmail}>{user.email}</span>
                                    </div>
                                    <div className={styles.dropdownDivider}></div>
                                    <Link to="/profile?tab=settings" onClick={() => setIsDropdownOpen(false)} className={styles.dropdownItem}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                        </svg>
                                        Cài đặt tài khoản
                                    </Link>
                                    <Link to="/profile?tab=tasks" onClick={() => setIsDropdownOpen(false)} className={styles.dropdownItem}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                            <polyline points="9 16 11 18 15 14"></polyline>
                                        </svg>
                                        Nhiệm vụ hàng ngày
                                    </Link>
                                    <Link to="/profile?tab=password" onClick={() => setIsDropdownOpen(false)} className={styles.dropdownItem}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                                        </svg>
                                        Thay đổi mật khẩu
                                    </Link>
                                    <Link to="/profile?tab=manga" onClick={() => setIsDropdownOpen(false)} className={styles.dropdownItem}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                        Theo dõi
                                    </Link>
                                    <Link to="/profile?tab=history" onClick={() => setIsDropdownOpen(false)} className={styles.dropdownItem}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        Lịch sử đọc
                                    </Link>
                                    <div className={styles.dropdownDivider}></div>
                                    <button onClick={() => { setIsDropdownOpen(false); logout(); }} className={`${styles.dropdownItem} ${styles.logout}`}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.authButtons}>
                        <button className={styles.btnSignup} onClick={() => openAuthModal('login')}>Đăng nhập</button>
                    </div>
                )}
            </div>
        </header>
    );
}
