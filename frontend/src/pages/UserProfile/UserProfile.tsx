import { useSearchParams } from "react-router-dom";
import { LogIn, User, BookOpen, CalendarCheck, Clock, Key, LogOut, Feather } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { AccountSettingsTab } from "./components/AccountSettingsTab";
import { ChangePasswordTab } from "./components/ChangePasswordTab";
import { MangaMarkTag } from "./components/MangaMarkTag";
import { HistoryTab } from "./components/HistoryTab";
import { DailyTasksTab } from "./components/DailyTasksTab";
import { AuthorRegistrationTab } from "./components/AuthorRegistrationTab";
import styles from "./UserProfile.module.css";

function UnauthorizedProfileView({ onLoginClick }: { onLoginClick: () => void }) {
    return (
        <div className={styles.profilePage}>
            <div className={styles.pageContainer}>
                <div className={styles.profileCard}>
                    <div className={styles.unauthorizedContainer}>
                        <LogIn size={48} className={styles.unauthorizedIcon} style={{ color: "var(--color-accent)" }} />
                        <h2 className={styles.unauthorizedTitle}>Yêu cầu đăng nhập</h2>
                        <p className={styles.unauthorizedDesc}>
                            Vui lòng đăng nhập tài khoản của bạn để truy cập và cài đặt hồ sơ cá nhân.
                        </p>
                        <button className={styles.btnLogin} onClick={onLoginClick}>
                            Đăng nhập ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface TabContentProps {
    activeTab: string;
    showAuthorTab: boolean;
    userRole: string;
}

function TabContent({ activeTab, showAuthorTab, userRole }: TabContentProps) {
    switch (activeTab) {
        case "settings":
            return <AccountSettingsTab />;
        case "password":
            return <ChangePasswordTab />;
        case "manga":
            return <MangaMarkTag />;
        case "history":
            return <HistoryTab />;
        case "tasks":
            return <DailyTasksTab />;
        case "author":
            return showAuthorTab ? <AuthorRegistrationTab userRole={userRole} /> : null;
        default:
            return null;
    }
}

export function UserProfile() {
    const { isAuthenticated, user, openAuthModal, logout, displayName } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "settings";

    if (!isAuthenticated || !user) {
        return <UnauthorizedProfileView onLoginClick={() => openAuthModal("login")} />;
    }

    const handleTabChange = (tabName: string) => {
        setSearchParams({ tab: tabName });
    };

    const showAuthorTab = user.role !== 'ADMIN';

    return (
        <div className={styles.profilePage}>
            <div className={styles.pageContainer}>
                <div className={styles.profileLayoutContainer}>
                    <aside className={styles.profileSidebar}>
                        <div className={styles.sidebarUserCard}>
                            <div className={styles.sidebarUserMeta}>
                                <span className={styles.sidebarUserTitleLabel}>Tài khoản của</span>
                                <span className={styles.sidebarUserName}>{displayName}</span>
                            </div>
                        </div>

                        <nav className={styles.sidebarNav}>
                            <button 
                                className={`${styles.sidebarNavItem} ${activeTab === "settings" ? styles.sidebarActiveItem : ""}`}
                                onClick={() => handleTabChange("settings")}
                            >
                                <User size={16} /> Thông tin tài khoản
                            </button>
                            <button 
                                className={`${styles.sidebarNavItem} ${activeTab === "manga" ? styles.sidebarActiveItem : ""}`}
                                onClick={() => handleTabChange("manga")}
                            >
                                <BookOpen size={16} /> Truyện theo dõi
                            </button>
                            <button 
                                className={`${styles.sidebarNavItem} ${activeTab === "tasks" ? styles.sidebarActiveItem : ""}`}
                                onClick={() => handleTabChange("tasks")}
                            >
                                <CalendarCheck size={16} /> Nhiệm vụ hàng ngày
                            </button>
                            <button 
                                className={`${styles.sidebarNavItem} ${activeTab === "history" ? styles.sidebarActiveItem : ""}`}
                                onClick={() => handleTabChange("history")}
                            >
                                <Clock size={16} /> Lịch sử đọc
                            </button>
                            <button 
                                className={`${styles.sidebarNavItem} ${activeTab === "password" ? styles.sidebarActiveItem : ""}`}
                                onClick={() => handleTabChange("password")}
                            >
                                <Key size={16} /> Đổi mật khẩu
                            </button>
                            {showAuthorTab && (
                                <button 
                                    className={`${styles.sidebarNavItem} ${activeTab === "author" ? styles.sidebarActiveItem : ""}`}
                                    onClick={() => handleTabChange("author")}
                                >
                                    <Feather size={16} /> {user.role === 'AUTHOR' ? 'Tác giả' : 'Đăng ký Tác giả'}
                                </button>
                            )}
                            <button 
                                className={`${styles.sidebarNavItem} ${styles.sidebarLogoutItem}`}
                                onClick={() => logout()}
                            >
                                <LogOut size={16} /> Đăng xuất
                            </button>
                        </nav>
                    </aside>

                    <main className={styles.profileMainContent}>
                        <div className={styles.profileCard}>
                            <TabContent activeTab={activeTab} showAuthorTab={showAuthorTab} userRole={user.role} />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
