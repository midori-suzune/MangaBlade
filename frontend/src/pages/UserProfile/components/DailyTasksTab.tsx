import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, BookOpen, MessageSquare, History, RotateCw, ListChecks, Award } from "lucide-react";
import { useAuthStore } from "../../../stores/authStore";
import { LuckyWheel } from "./LuckyWheel";
import { getDailyStatus, claimCheckIn, claimAchievement, type DailyStatusResponse } from "../../../api/taskApi";
import styles from "../UserProfile.module.css";

type SubTab = "tasks" | "achievements" | "checkin" | "wheel" | "history";

function HeaderSection({ level, exp, maxExp }: { level: number; exp: number; maxExp: number }) {
  return (
    <>
      <div className={styles.pageTitleSection}>
        <h1 className={styles.pageTitle}>Nhiệm vụ & Thành tựu</h1>
        <p className={styles.pageSubtitle}>
          Hoàn thành các thử thách mỗi ngày và tích lũy các cột mốc trọn đời để nâng cấp tài khoản.
        </p>
      </div>

      <div className={styles.profileHeaderBanner} style={{ padding: "20px", marginBottom: "24px" }}>
        <div style={{ flexGrow: 1 }}>
          <div className={styles.levelProgressContainer}>
            <span className={styles.levelBadgeText}>Cấp {level}</span>
            <div className={styles.levelProgressBarOuter} style={{ width: "100%", maxWidth: "320px" }}>
              <div
                className={styles.levelProgressBarInner}
                style={{ width: `${(exp / maxExp) * 100}%` }}
              ></div>
            </div>
            <span className={styles.levelExpText}>{exp} / {maxExp} EXP</span>
          </div>
        </div>
      </div>
    </>
  );
}

function SubTabsSelector({
  activeSubTab,
  setActiveSubTab,
}: {
  activeSubTab: SubTab;
  setActiveSubTab: (tab: SubTab) => void;
}) {
  const subTabs: { key: SubTab; label: string; icon: React.ReactNode }[] = [
    { key: "tasks", label: "Nhiệm vụ ngày", icon: <ListChecks size={15} /> },
    { key: "achievements", label: "Thành tựu", icon: <Award size={15} /> },
    { key: "checkin", label: "Điểm danh", icon: <CalendarCheck size={15} /> },
    { key: "wheel", label: "Vòng quay", icon: <RotateCw size={15} /> },
    { key: "history", label: "Lịch sử", icon: <History size={15} /> },
  ];

  return (
    <div className={styles.subTabContainer}>
      {subTabs.map(tab => (
        <button
          key={tab.key}
          className={`${styles.subTabBtn} ${activeSubTab === tab.key ? styles.subTabActive : ""}`}
          onClick={() => setActiveSubTab(tab.key)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function DailyTasksTabContent({
  status,
  handleClaimCheckIn,
}: {
  status: DailyStatusResponse;
  handleClaimCheckIn: () => void;
}) {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.taskList}>
        <div className={styles.taskItem}>
          <div className={styles.taskInfo}>
            <span className={styles.taskIcon}><CalendarCheck size={18} /></span>
            <div className={styles.taskDetails}>
              <span className={styles.taskName}>Điểm danh hàng ngày</span>
              <span className={styles.taskDesc}>Đăng nhập vào MangaBlade mỗi ngày <span className={styles.taskReward}>+20 EXP</span></span>
            </div>
          </div>
          <button
            className={`${styles.btnTask} ${status.checkInClaimed ? styles.done : styles.claim}`}
            onClick={handleClaimCheckIn}
            disabled={status.checkInClaimed}
          >
            {status.checkInClaimed ? "Đã nhận" : "Nhận thưởng"}
          </button>
        </div>

        <div className={styles.taskItem}>
          <div className={styles.taskInfo}>
            <span className={styles.taskIcon}><BookOpen size={18} /></span>
            <div className={styles.taskDetails}>
              <span className={styles.taskName}>Đọc 3 chương truyện</span>
              <span className={styles.taskDesc}>Đọc bất kỳ chương truyện nào hệ thống hỗ trợ <span className={styles.taskReward}>+50 EXP</span></span>
            </div>
          </div>
          <div className={styles.taskAction}>
            <span className={styles.taskProgressText}>{status.chaptersRead} / 3</span>
            {status.chaptersRewardClaimed ? (
              <button className={`${styles.btnTask} ${styles.done}`} disabled>
                Đã nhận
              </button>
            ) : (
              <Link
                to="/"
                className={`${styles.btnTask} ${styles.go}`}
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                Làm ngay
              </Link>
            )}
          </div>
        </div>

        <div className={styles.taskItem}>
          <div className={styles.taskInfo}>
            <span className={styles.taskIcon}><MessageSquare size={18} /></span>
            <div className={styles.taskDetails}>
              <span className={styles.taskName}>Viết 1 bình luận</span>
              <span className={styles.taskDesc}>Để lại bình luận đóng góp ý kiến dưới truyện <span className={styles.taskReward}>+30 EXP</span></span>
            </div>
          </div>
          <div className={styles.taskAction}>
            <span className={styles.taskProgressText}>{status.commentsPosted} / 1</span>
            {status.commentsRewardClaimed ? (
              <button className={`${styles.btnTask} ${styles.done}`} disabled>
                Đã nhận
              </button>
            ) : (
              <Link
                to="/"
                className={`${styles.btnTask} ${styles.go}`}
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                Làm ngay
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementsTabContent({
  achievements,
  handleClaimAchievement,
}: {
  achievements: DailyStatusResponse["achievements"];
  handleClaimAchievement: (id: number) => void;
}) {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.taskList}>
        {achievements.map(ach => {
          const progressPercent = Math.min(100, (ach.currentValue / ach.targetValue) * 100);
          return (
            <div key={ach.id} className={styles.taskItem} style={{ flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className={styles.taskDetails}>
                  <span className={styles.taskName}>{ach.title}</span>
                  <span className={styles.taskDesc}>{ach.description} <span className={styles.taskReward}>+{ach.expReward} EXP</span></span>
                </div>
                {ach.rewardClaimed ? (
                  <button className={`${styles.btnTask} ${styles.done}`} disabled>
                    Đã nhận
                  </button>
                ) : ach.completed ? (
                  <button
                    className={`${styles.btnTask} ${styles.claim}`}
                    onClick={() => handleClaimAchievement(ach.id)}
                  >
                    Nhận thưởng
                  </button>
                ) : (
                  <Link
                    to="/"
                    className={`${styles.btnTask} ${styles.go}`}
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    Làm ngay
                  </Link>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ flexGrow: 1, height: "6px", backgroundColor: "#eaeaea", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "var(--color-accent)", borderRadius: "3px" }}></div>
                </div>
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)", minWidth: "50px", textAlign: "right" }}>
                  {ach.currentValue} / {ach.targetValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckInTabContent({
  status,
  handleClaimCheckIn,
}: {
  status: DailyStatusResponse;
  handleClaimCheckIn: () => void;
}) {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.checkinPanel}>
        <div className={styles.checkinStatus}>
          <CalendarCheck size={40} style={{ color: status.checkInClaimed ? "#10b981" : "var(--color-accent)" }} />
          <div className={styles.checkinInfo}>
            <h3 className={styles.checkinTitle}>
              {status.checkInClaimed ? "Đã điểm danh hôm nay!" : "Điểm danh hàng ngày"}
            </h3>
            <p className={styles.checkinDesc}>
              {status.checkInClaimed
                ? "Bạn đã nhận thưởng điểm danh. Hãy quay lại vào ngày mai!"
                : "Nhấn nút bên dưới để nhận 20 Điểm EXP mỗi ngày."}
            </p>
          </div>
        </div>
        <button
          className={`${styles.btnPrimary} ${status.checkInClaimed ? styles.btnDisabled : ""}`}
          onClick={handleClaimCheckIn}
          disabled={status.checkInClaimed}
          style={{ marginTop: "20px", width: "100%" }}
        >
          {status.checkInClaimed ? "✓ Đã điểm danh" : "Điểm danh nhận +20 EXP"}
        </button>
      </div>
    </div>
  );
}

function HistoryTabContent({ expHistory }: { expHistory: DailyStatusResponse["expHistory"] }) {
  return (
    <div className={styles.settingsSection}>
      {expHistory.length === 0 ? (
        <div className={styles.emptyState}>
          <History size={40} style={{ color: "var(--color-text-muted)", marginBottom: "12px" }} />
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Chưa có lịch sử nhận EXP nào.</p>
        </div>
      ) : (
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Loại</th>
              <th>EXP</th>
            </tr>
          </thead>
          <tbody>
            {expHistory.map((entry, idx) => (
              <tr key={idx}>
                <td>{entry.time}</td>
                <td>{entry.type}</td>
                <td className={styles.historyExpPositive}>+{entry.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function DailyTasksTab() {
  const { updateLevelAndExp } = useAuthStore();
  const [status, setStatus] = useState<DailyStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("tasks");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getDailyStatus();
      if (res.success && res.payload) {
        setStatus(res.payload);
        updateLevelAndExp(res.payload.level, res.payload.exp);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [updateLevelAndExp]);

  useEffect(() => {
    Promise.resolve().then(fetchStatus);
  }, [fetchStatus]);

  const handleClaimCheckIn = async () => {
    if (!status || status.checkInClaimed) return;
    try {
      const res = await claimCheckIn();
      if (res.success) {
        fetchStatus();
      } else {
        alert(res.message || "Điểm danh thất bại");
      }
    } catch {
      alert("Lỗi kết nối đến máy chủ khi điểm danh!");
    }
  };

  const handleClaimAchievement = async (achievementId: number) => {
    try {
      const res = await claimAchievement(achievementId);
      if (res.success) {
        alert(`Chúc mừng! Bạn đã nhận ${res.payload} EXP thành tựu!`);
        fetchStatus();
      } else {
        alert(res.message || "Nhận thưởng thành tựu thất bại");
      }
    } catch {
      alert("Lỗi kết nối đến máy chủ khi nhận thưởng thành tựu!");
    }
  };

  const handleSpinSuccess = () => {
    fetchStatus();
  };

  if (loading) {
    return <div className={styles.loadingState}>Đang tải dữ liệu nhiệm vụ...</div>;
  }
  if (!status) {
    return <div className={styles.emptyState}>Không thể kết nối đến máy chủ nhiệm vụ.</div>;
  }

  const level = status.level;
  const exp = status.exp;
  const maxExp = (40 * level * level) + (260 * level) + 200;

  return (
    <div>
      <HeaderSection level={level} exp={exp} maxExp={maxExp} />
      <SubTabsSelector activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />

      {activeSubTab === "tasks" && (
        <DailyTasksTabContent status={status} handleClaimCheckIn={handleClaimCheckIn} />
      )}

      {activeSubTab === "achievements" && (
        <AchievementsTabContent
          achievements={status.achievements}
          handleClaimAchievement={handleClaimAchievement}
        />
      )}

      {activeSubTab === "checkin" && (
        <CheckInTabContent status={status} handleClaimCheckIn={handleClaimCheckIn} />
      )}

      {activeSubTab === "wheel" && (
        <LuckyWheel
          initialSpun={status.luckyWheelSpun}
          initialPrize={null}
          onSpinSuccess={handleSpinSuccess}
        />
      )}

      {activeSubTab === "history" && (
        <HistoryTabContent expHistory={status.expHistory} />
      )}
    </div>
  );
}
