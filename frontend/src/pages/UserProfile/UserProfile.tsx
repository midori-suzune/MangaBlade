import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LogIn, User, BookOpen, CalendarCheck, Clock, Key, LogOut, Feather, PlusCircle, BarChart3 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { AccountSettingsTab } from "./components/AccountSettingsTab";
import { ChangePasswordTab } from "./components/ChangePasswordTab";
import { MangaMarkTag } from "./components/MangaMarkTag";
import { HistoryTab } from "./components/HistoryTab";
import { DailyTasksTab } from "./components/DailyTasksTab";
import { AuthorRegistrationTab } from "./components/AuthorRegistrationTab";

import { AuthorMangaList } from "../AuthorDashboard/AuthorMangaList";
import { AuthorMangaCreate } from "../AuthorDashboard/AuthorMangaCreate";
import { AuthorMangaEdit } from "../AuthorDashboard/AuthorMangaEdit";
import { AuthorChapterManage } from "../AuthorDashboard/AuthorChapterManage";
import { AuthorChapterUpload } from "../AuthorDashboard/AuthorChapterUpload";
import { AuthorStatistics } from "../AuthorDashboard/AuthorStatistics";

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
        case "author-manga":
            return <AuthorMangaList standalone={true} />;
        case "author-manga-create":
            return <AuthorMangaCreate standalone={true} />;
        case "author-manga-edit":
            return <AuthorMangaEdit standalone={true} />;
        case "author-chapters":
            return <AuthorChapterManage standalone={true} />;
        case "author-chapter-upload":
            return <AuthorChapterUpload standalone={true} />;
        case "author-statistics":
            return <AuthorStatistics standalone={true} />;
        default:
            return null;
    }
}

export function UserProfile() {
    const { isAuthenticated, user, openAuthModal, logout, displayName, fetchProfile } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = user?.role === 'AUTHOR' ? 'author-manga' : 'settings';
    const rawTab = searchParams.get("tab");
    const activeTab = (rawTab === "author" && user?.role === 'AUTHOR') ? 'author-manga' : (rawTab || defaultTab);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated, fetchProfile]);

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
                                className={`${styles.sidebarNavItem} ${activeTab === "history" ? styles.sidebarActiveItem : ""}`}
                                onClick={() => handleTabChange("history")}
                            >
                                <Clock size={16} /> Lịch sử đọc
                            </button>

                            <button 
                                className={`${styles.sidebarNavItem} ${activeTab === "tasks" ? styles.sidebarActiveItem : ""}`}
                                onClick={() => handleTabChange("tasks")}
                            >
                                <CalendarCheck size={16} /> Nhiệm vụ hàng ngày
                            </button>

                            <button 
                                className={`${styles.sidebarNavItem} ${activeTab === "password" ? styles.sidebarActiveItem : ""}`}
                                onClick={() => handleTabChange("password")}
                            >
                                <Key size={16} /> Đổi mật khẩu
                            </button>
                            
                            {showAuthorTab && user.role !== 'AUTHOR' && (
                                <button 
                                    className={`${styles.sidebarNavItem} ${activeTab === "author" ? styles.sidebarActiveItem : ""}`}
                                    onClick={() => handleTabChange("author")}
                                >
                                    <Feather size={16} /> Đăng ký Tác giả
                                </button>
                            )}

                            {user.role === 'AUTHOR' && (
                                <>
                                    <button 
                                        className={`${styles.sidebarNavItem} ${["author-manga", "author-manga-edit", "author-chapters", "author-chapter-upload"].includes(activeTab) ? styles.sidebarActiveItem : ""}`}
                                        onClick={() => handleTabChange("author-manga")}
                                    >
                                        <BookOpen size={16} /> Truyện của tôi
                                    </button>
                                    <button 
                                        className={`${styles.sidebarNavItem} ${activeTab === "author-manga-create" ? styles.sidebarActiveItem : ""}`}
                                        onClick={() => handleTabChange("author-manga-create")}
                                    >
                                        <PlusCircle size={16} /> Đăng truyện mới
                                    </button>
                                    <button 
                                        className={`${styles.sidebarNavItem} ${activeTab === "author-statistics" ? styles.sidebarActiveItem : ""}`}
                                        onClick={() => handleTabChange("author-statistics")}
                                    >
                                        <BarChart3 size={16} /> Thống kê tác phẩm
                                    </button>
                                </>
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
