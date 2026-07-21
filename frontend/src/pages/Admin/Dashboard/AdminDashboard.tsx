import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChevronDown,
  FileCheck,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';
import { dashboardApi, type DashboardReadingStats, type DashboardStatistic } from '../../../api/dashboardApi';
import { useAuthStore } from '../../../stores/authStore';
import styles from '../Admin.module.css';

const fallbackStatistics: DashboardStatistic = {
  totalUsers: 0,
  newUsersToday: 0,
  totalManga: 0,
  newMangaToday: 0,
  ongoingManga: 0,
  completedManga: 0,
  hiddenManga: 0,
  totalComments: 0,
  newCommentsToday: 0,
  totalAuthorRequests: 0,
  pendingAuthorRequests: 0,
  pendingChapterReports: 0,
};

const fallbackReadingStats: DashboardReadingStats = {
  totalReads: 0,
  previousTotalReads: 0,
  readDelta: 0,
  dailyReads: [
  { label: 'T2', reads: 0 },
  { label: 'T3', reads: 0 },
  { label: 'T4', reads: 0 },
  { label: 'T5', reads: 0 },
  { label: 'T6', reads: 0 },
  { label: 'T7', reads: 0 },
  { label: 'CN', reads: 0 },
  ].map((item) => ({ ...item, date: '' })),
};

const recentActivities = [
  { title: 'nguyen_author gửi đơn đăng ký tác giả', time: '8 phút trước', status: 'Chờ duyệt' },
  { title: 'Solo Leveling cập nhật chương 201', time: '34 phút trước', status: 'Published' },
  { title: 'blade_reader bị khóa do spam bình luận', time: '1 giờ trước', status: 'Moderation' },
  { title: 'Thêm 24 truyện từ nguồn OTruyen', time: '2 giờ trước', status: 'Import' },
];

interface TrafficTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ value?: number }>;
}

function TrafficTooltip({ active, label, payload }: TrafficTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const reads = payload[0].value ?? 0;

  return (
    <div className={styles.dashboardTooltip}>
      <span>Ngày {label}</span>
      <strong>Lượt đọc: {Number(reads).toLocaleString('vi-VN')}</strong>
    </div>
  );
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();
  const [statistics, setStatistics] = useState<DashboardStatistic>(fallbackStatistics);
  const [readingStats, setReadingStats] = useState<DashboardReadingStats>(fallbackReadingStats);

  useEffect(() => {
    dashboardApi.getStatistics()
      .then(setStatistics)
      .catch((error) => {
        console.error('Lỗi khi tải thống kê dashboard:', error);
        setStatistics(fallbackStatistics);
      });

    dashboardApi.getReadingStats(7)
      .then(setReadingStats)
      .catch((error) => {
        console.error('Lỗi khi tải thống kê lượt đọc:', error);
        setReadingStats(fallbackReadingStats);
      });
  }, []);

  const yAxisMax = useMemo(() => {
    const maxReads = Math.max(...readingStats.dailyReads.map((item) => item.reads), 0);
    return Math.max(100, Math.ceil(maxReads / 25) * 25);
  }, [readingStats.dailyReads]);

  const readDeltaLabel = readingStats.readDelta >= 0
    ? `+${readingStats.readDelta.toLocaleString('vi-VN')}`
    : readingStats.readDelta.toLocaleString('vi-VN');
  const overviewStats = [
    {
      label: 'Người dùng',
      value: statistics.totalUsers.toLocaleString('vi-VN'),
      change: `+${statistics.newUsersToday.toLocaleString('vi-VN')}`,
    },
    {
      label: 'Truyện',
      value: statistics.totalManga.toLocaleString('vi-VN'),
      change: `+${statistics.newMangaToday.toLocaleString('vi-VN')}`,
    },
    {
      label: 'Bình luận',
      value: statistics.totalComments.toLocaleString('vi-VN'),
      change: `+${statistics.newCommentsToday.toLocaleString('vi-VN')}`,
    },
    {
      label: 'Đơn tác giả',
      value: statistics.totalAuthorRequests.toLocaleString('vi-VN'),
      change: `${statistics.pendingAuthorRequests.toLocaleString('vi-VN')} chờ duyệt`,
    },
  ];
  const mangaStats = [
    { label: 'Đang phát hành', value: statistics.ongoingManga.toLocaleString('vi-VN') },
    { label: 'Hoàn thành', value: statistics.completedManga.toLocaleString('vi-VN') },
    { label: 'Bị ẩn', value: statistics.hiddenManga.toLocaleString('vi-VN') },
  ];

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminShell}>
        <section className={styles.adminPanel}>
          <nav className={styles.adminNav}>
            <div className={styles.sidebarHeader}>
              <span className={styles.brandText}>Manga<span>Blade</span></span>
            </div>
            <button
              className={`${styles.adminNavItem} ${styles.active}`}
              onClick={() => navigate('/admin/dashboard')}
            >
              <BarChart3 size={16} /> Dashboard
            </button>
            <button
              className={styles.adminNavItem}
              onClick={() => navigate('/admin/users')}
            >
              <Users size={16} /> Quản lý User
            </button>
            <button
              className={styles.adminNavItem}
              onClick={() => navigate('/admin/manga')}
            >
              <BookOpen size={16} /> Quản lý Truyện
            </button>
            <button
              className={styles.adminNavItem}
              onClick={() => navigate('/admin/content-moderation')}
            >
              <FileCheck size={16} /> Kiểm duyệt nội dung
            </button>
            <button
              className={styles.adminNavItem}
              onClick={() => navigate('/admin/chapter-reports')}
            >
              <AlertTriangle size={16} /> Báo cáo lỗi chương
            </button>
            <button
              className={styles.adminNavItem}
              onClick={() => navigate('/admin/author-requests')}
            >
              <FileText size={16} /> Đơn đăng ký Tác giả
            </button>
          </nav>

          <main className={styles.adminContent}>
            <div className={styles.pageTitleSection}>
              <div>
                <h2 className={styles.pageTitle}>Dashboard</h2>
                <p className={styles.pageSubtitle}>
                  Theo dõi nhanh dữ liệu vận hành, nội dung và hoạt động kiểm duyệt.
                </p>
              </div>
              <button className={styles.adminUserChip} type="button" aria-label="Tài khoản quản trị">
                <span className={styles.adminAvatar}>{(displayName || 'A').charAt(0).toUpperCase()}</span>
                <span className={styles.adminUserMeta}>
                  <span className={styles.adminUserName}>{displayName || 'Admin'}</span>
                  <span className={styles.adminUserRole}>Super Admin</span>
                </span>
                <ChevronDown size={16} className={styles.chipIcon} />
              </button>
            </div>

            <section className={styles.dashboardStatsGrid}>
              {overviewStats.map((stat) => (
                <article className={styles.dashboardStatCard} key={stat.label}>
                  <div className={styles.dashboardStatMeta}>
                    <span className={styles.dashboardStatLabel}>{stat.label}</span>
                    <strong className={styles.dashboardStatValue}>{stat.value}</strong>
                    <span className={styles.dashboardStatChange}>{stat.change}</span>
                  </div>
                </article>
              ))}
            </section>

            <section className={styles.dashboardGrid}>
              <article className={styles.dashboardPanelWide}>
                <div className={styles.dashboardPanelHeader}>
                  <div>
                    <h3 className={styles.dashboardPanelTitle}>Lượt đọc trong tuần</h3>
                    <p className={styles.dashboardPanelSubtitle}>
                      Tổng {readingStats.totalReads.toLocaleString('vi-VN')} lượt đọc, {readingStats.readDelta >= 0 ? 'tăng' : 'giảm'} {Math.abs(readingStats.readDelta).toLocaleString('vi-VN')} lượt so với tuần trước.
                    </p>
                  </div>
                  <span className={styles.dashboardMetricBadge}>
                    <TrendingUp size={15} /> {readDeltaLabel}
                  </span>
                </div>

                <div className={styles.dashboardChart}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={readingStats.dailyReads} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                      <CartesianGrid vertical={false} stroke="#edf1f6" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#667085', fontSize: 13, fontWeight: 500 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#667085', fontSize: 12, fontWeight: 500 }}
                        domain={[0, yAxisMax]}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        content={<TrafficTooltip />}
                      />
                      <Bar dataKey="reads" fill="#bfdbfe" stroke="#111827" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className={styles.dashboardPanel}>
                <div className={styles.dashboardPanelHeader}>
                  <div>
                    <h3 className={styles.dashboardPanelTitle}>Kho truyện</h3>
                    <p className={styles.dashboardPanelSubtitle}>Trạng thái nội dung hiện tại.</p>
                  </div>
                </div>
                <div className={styles.dashboardList}>
                  {mangaStats.map((item) => (
                    <div className={styles.dashboardListRow} key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className={styles.dashboardGrid}>
              <article className={styles.dashboardPanel}>
                <div className={styles.dashboardPanelHeader}>
                  <div>
                    <h3 className={styles.dashboardPanelTitle}>Tác vụ hôm nay</h3>
                    <p className={styles.dashboardPanelSubtitle}>Các điểm cần admin xử lý.</p>
                  </div>
                </div>
                <div className={styles.dashboardTodoList}>
                  <button type="button" onClick={() => navigate('/admin/author-requests')}>
                    <FileText size={16} /> Duyệt {statistics.pendingAuthorRequests.toLocaleString('vi-VN')} đơn tác giả
                  </button>
                  <button type="button" onClick={() => navigate('/admin/chapter-reports')}>
                    <AlertTriangle size={16} /> Kiểm tra {statistics.pendingChapterReports.toLocaleString('vi-VN')} báo cáo lỗi chương
                  </button>
                </div>
              </article>

              <article className={styles.dashboardPanelWide}>
                <div className={styles.dashboardPanelHeader}>
                  <div>
                    <h3 className={styles.dashboardPanelTitle}>Hoạt động gần đây</h3>
                    <p className={styles.dashboardPanelSubtitle}>Nhật ký thao tác và cập nhật hệ thống.</p>
                  </div>
                </div>
                <div className={styles.dashboardActivityList}>
                  {recentActivities.map((activity) => (
                    <div className={styles.dashboardActivityItem} key={activity.title}>
                      <div>
                        <strong>{activity.title}</strong>
                        <span>{activity.time}</span>
                      </div>
                      <em>{activity.status}</em>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </main>
        </section>
      </div>
    </div>
  );
};
