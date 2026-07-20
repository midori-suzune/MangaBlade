import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { BookOpen, PlusCircle, BarChart3, ArrowLeft } from 'lucide-react';
import styles from './AuthorDashboard.module.css';

interface AuthorDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: 'manga-list' | 'manga-create' | 'statistics';
}

export const AuthorDashboardLayout: React.FC<AuthorDashboardLayoutProps> = ({ children, activeTab }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const avatarUrl = useAuthStore((s) => s.avatarUrl);

  return (
    <div className={styles.profilePage}>
      <div className={styles.pageContainer}>
        <div className={styles.profileLayout}>
          {/* Sidebar */}
          <aside className={styles.profileSidebar}>
            <div className={styles.sidebarUserCard}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className={styles.sidebarAvatar} />
              ) : (
                <div className={styles.sidebarAvatarPlaceholder}>
                  {user?.username?.slice(0, 1).toUpperCase()}
                </div>
              )}
              <h3 className={styles.sidebarUserName}>{user?.username}</h3>
              <span className={styles.sidebarUserRole}>Tác giả (Author)</span>
            </div>

            <nav className={styles.sidebarNav}>
              <button
                onClick={() => navigate('/author/manga')}
                className={`${styles.sidebarNavItem} ${activeTab === 'manga-list' ? styles.sidebarActiveItem : ''}`}
              >
                <BookOpen size={16} />
                Truyện của tôi
              </button>
              <button
                onClick={() => navigate('/author/manga/create')}
                className={`${styles.sidebarNavItem} ${activeTab === 'manga-create' ? styles.sidebarActiveItem : ''}`}
              >
                <PlusCircle size={16} />
                Đăng truyện mới
              </button>
              <button
                onClick={() => navigate('/author/statistics')}
                className={`${styles.sidebarNavItem} ${activeTab === 'statistics' ? styles.sidebarActiveItem : ''}`}
              >
                <BarChart3 size={16} />
                Thống kê tác phẩm
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={styles.sidebarNavItem}
                style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', borderRadius: 0 }}
              >
                <ArrowLeft size={16} />
                Quay lại cá nhân
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.profileCard}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
