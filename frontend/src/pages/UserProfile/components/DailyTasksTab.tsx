import { useState } from "react";
import { CalendarCheck, BookOpen, MessageSquare, History, RotateCw, ListChecks } from "lucide-react";
import { useAuthStore } from "../../../stores/authStore";
import styles from "../UserProfile.module.css";

const PRIZES = [
    { text: "10 EXP", value: 10 },
    { text: "20 EXP", value: 20 },
    { text: "30 EXP", value: 30 },
    { text: "50 EXP", value: 50 },
    { text: "100 EXP", value: 100 },
    { text: "15 EXP", value: 15 },
    { text: "25 EXP", value: 25 },
    { text: "40 EXP", value: 40 }
];

const COLORS = ["#f43f5e", "#f59e0b", "#6366f1", "#10b981", "#ec4899", "#3b82f6", "#8b5cf6", "#14b8a6"];

type SubTab = "tasks" | "checkin" | "wheel" | "history";

interface HistoryEntry {
    time: string;
    type: string;
    amount: number;
}

export function DailyTasksTab() {
    const { user } = useAuthStore();

    const computeInitialState = () => {
        if (!user) return { exp: 420, level: 5, checkIn: false, spun: false, prize: null as string | null, history: [] as HistoryEntry[] };

        const todayStr = new Date().toDateString();
        const savedCheckIn = localStorage.getItem(`checkin_${user.id}_${todayStr}`);
        let initialExp = 420;
        const checkIn = savedCheckIn === "claimed";
        if (checkIn) initialExp = 440;

        const savedSpin = localStorage.getItem(`spin_${user.id}_${todayStr}`);
        let spun = false;
        let prize: string | null = null;
        if (savedSpin === "spun") {
            spun = true;
            const savedPrize = localStorage.getItem(`spin_prize_${user.id}_${todayStr}`);
            if (savedPrize) {
                prize = `Hôm nay bạn đã quay trúng ${savedPrize}!`;
                const val = PRIZES.find(p => p.text === savedPrize)?.value || 0;
                initialExp += val;
            }
        }

        let level = 5;
        let exp = initialExp;
        if (initialExp >= 500) {
            exp = initialExp - 500;
            level = 6;
        }

        const savedHistory = localStorage.getItem(`exp_history_${user.id}`);
        const history: HistoryEntry[] = savedHistory ? JSON.parse(savedHistory) : [];

        return { exp, level, checkIn, spun, prize, history };
    };

    const [initialState] = useState(computeInitialState);
    const [exp, setExp] = useState(initialState.exp);
    const [level, setLevel] = useState(initialState.level);
    const [isCheckInClaimed, setIsCheckInClaimed] = useState(initialState.checkIn);
    const [activeSubTab, setActiveSubTab] = useState<SubTab>("tasks");
    const [expHistory, setExpHistory] = useState<HistoryEntry[]>(initialState.history);

    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [hasSpun, setHasSpun] = useState(initialState.spun);
    const [prizeText, setPrizeText] = useState<string | null>(initialState.prize);

    const addHistoryEntry = (type: string, amount: number) => {
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        const entry: HistoryEntry = { time: timeStr, type, amount };
        const updated = [entry, ...expHistory];
        setExpHistory(updated);
        if (user?.id) {
            localStorage.setItem(`exp_history_${user.id}`, JSON.stringify(updated));
        }
    };

    const handleClaimPoints = () => {
        if (isCheckInClaimed) return;
        setIsCheckInClaimed(true);
        if (user?.id) {
            localStorage.setItem(`checkin_${user.id}_${new Date().toDateString()}`, "claimed");
        }

        addHistoryEntry("Điểm danh", 20);

        const newExp = exp + 20;
        if (newExp >= 500) {
            setExp(newExp - 500);
            setLevel(level + 1);
            alert("Chúc mừng! Bạn đã nhận 20 Điểm EXP và lên cấp mới!");
        } else {
            setExp(newExp);
            alert("Nhận 20 Điểm EXP thành công!");
        }
    };

    const handleSpin = () => {
        if (isSpinning || hasSpun) return;

        setIsSpinning(true);
        const prizeIndex = Math.floor(Math.random() * PRIZES.length);
        const targetAngle = 360 - (prizeIndex * 45);
        const newRotation = rotation + (360 * 5) + targetAngle - (rotation % 360);
        const finalRotation = newRotation + (Math.random() * 24 - 12);
        setRotation(finalRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setHasSpun(true);
            const prize = PRIZES[prizeIndex];
            setPrizeText(`Chúc mừng! Bạn đã quay trúng ${prize.text}`);

            addHistoryEntry("Vòng quay", prize.value);

            const newExp = exp + prize.value;
            if (newExp >= 500) {
                setExp(newExp - 500);
                setLevel(level + 1);
            } else {
                setExp(newExp);
            }

            if (user?.id) {
                localStorage.setItem(`spin_${user.id}_${new Date().toDateString()}`, "spun");
                localStorage.setItem(`spin_prize_${user.id}_${new Date().toDateString()}`, prize.text);
            }
        }, 4000);
    };

    if (!user) return null;

    const subTabs: { key: SubTab; label: string; icon: React.ReactNode }[] = [
        { key: "tasks", label: "Nhiệm vụ", icon: <ListChecks size={15} /> },
        { key: "checkin", label: "Điểm danh", icon: <CalendarCheck size={15} /> },
        { key: "wheel", label: "Vòng quay", icon: <RotateCw size={15} /> },
        { key: "history", label: "Lịch sử", icon: <History size={15} /> },
    ];

    return (
        <div>
            <div className={styles.pageTitleSection}>
                <h1 className={styles.pageTitle}>Nhiệm vụ hàng ngày</h1>
                <p className={styles.pageSubtitle}>
                    Hoàn thành các thử thách mỗi ngày để tích lũy EXP và nâng cấp tài khoản.
                </p>
            </div>

            <div className={styles.profileHeaderBanner} style={{ padding: "20px", marginBottom: "24px" }}>
                <div style={{ flexGrow: 1 }}>
                    <div className={styles.levelProgressContainer}>
                        <span className={styles.levelBadgeText}>Cấp {level}</span>
                        <div className={styles.levelProgressBarOuter} style={{ width: "100%", maxWidth: "320px" }}>
                            <div 
                                className={styles.levelProgressBarInner} 
                                style={{ width: `${(exp / 500) * 100}%` }}
                            ></div>
                        </div>
                        <span className={styles.levelExpText}>{exp} / 500 EXP</span>
                    </div>
                </div>
            </div>

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

            {activeSubTab === "tasks" && (
                <div className={styles.settingsSection}>
                    <div className={styles.taskList}>
                        <div className={styles.taskItem}>
                            <div className={styles.taskInfo}>
                                <span className={styles.taskIcon}><CalendarCheck size={18} /></span>
                                <div className={styles.taskDetails}>
                                    <span className={styles.taskName}>Điểm danh hàng ngày</span>
                                    <span className={styles.taskDesc}>Đăng nhập vào MangaBlade mỗi ngày <span className={styles.taskReward}>+20 Điểm</span></span>
                                </div>
                            </div>
                            <button 
                                className={`${styles.btnTask} ${isCheckInClaimed ? styles.done : styles.claim}`}
                                onClick={handleClaimPoints}
                                disabled={isCheckInClaimed}
                            >
                                {isCheckInClaimed ? "Đã nhận" : "Nhận thưởng"}
                            </button>
                        </div>

                        <div className={styles.taskItem}>
                            <div className={styles.taskInfo}>
                                <span className={styles.taskIcon}><BookOpen size={18} /></span>
                                <div className={styles.taskDetails}>
                                    <span className={styles.taskName}>Đọc 3 chương truyện</span>
                                    <span className={styles.taskDesc}>Đọc bất kỳ chương truyện nào hệ thống hỗ trợ <span className={styles.taskReward}>+50 Điểm</span></span>
                                </div>
                            </div>
                            <div className={styles.taskAction}>
                                <span className={styles.taskProgressText}>1 / 3</span>
                                <button className={`${styles.btnTask} ${styles.go}`} onClick={() => alert("Chức năng đọc truyện đang mở rộng!")}>Làm tiếp</button>
                            </div>
                        </div>

                        <div className={styles.taskItem}>
                            <div className={styles.taskInfo}>
                                <span className={styles.taskIcon}><MessageSquare size={18} /></span>
                                <div className={styles.taskDetails}>
                                    <span className={styles.taskName}>Viết 1 bình luận</span>
                                    <span className={styles.taskDesc}>Để lại bình luận đóng góp ý kiến dưới truyện <span className={styles.taskReward}>+30 Điểm</span></span>
                                </div>
                            </div>
                            <div className={styles.taskAction}>
                                <span className={styles.taskProgressText}>0 / 1</span>
                                <button className={`${styles.btnTask} ${styles.go}`} onClick={() => alert("Vui lòng gửi bình luận ở trang chi tiết truyện!")}>Đi đến</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === "checkin" && (
                <div className={styles.settingsSection}>
                    <div className={styles.checkinPanel}>
                        <div className={styles.checkinStatus}>
                            <CalendarCheck size={40} style={{ color: isCheckInClaimed ? "var(--color-green)" : "var(--color-accent)" }} />
                            <div className={styles.checkinInfo}>
                                <h3 className={styles.checkinTitle}>
                                    {isCheckInClaimed ? "Đã điểm danh hôm nay!" : "Điểm danh hàng ngày"}
                                </h3>
                                <p className={styles.checkinDesc}>
                                    {isCheckInClaimed 
                                        ? "Bạn đã nhận thưởng điểm danh. Hãy quay lại vào ngày mai!" 
                                        : "Nhấn nút bên dưới để nhận 20 Điểm EXP mỗi ngày."}
                                </p>
                            </div>
                        </div>
                        <button 
                            className={`${styles.btnPrimary} ${isCheckInClaimed ? styles.btnDisabled : ""}`}
                            onClick={handleClaimPoints}
                            disabled={isCheckInClaimed}
                            style={{ marginTop: "20px", width: "100%" }}
                        >
                            {isCheckInClaimed ? "✓ Đã điểm danh" : "Điểm danh nhận +20 EXP"}
                        </button>
                    </div>
                </div>
            )}

            {activeSubTab === "wheel" && (
                <div className={styles.wheelContainer} style={{ borderTop: "none", marginTop: 0, paddingTop: 0 }}>
                    <span className={styles.sectionLabel} style={{ marginBottom: "16px" }}>Vòng quay may mắn hàng ngày</span>
                    <div className={styles.wheelWrapper}>
                        <div className={styles.wheelPointer}>
                            <svg width="36" height="36" viewBox="0 0 36 36">
                                <polygon points="18,36 6,4 30,4" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
                                <polygon points="18,32 9,8 27,8" fill="#fbbf24" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div 
                            className={styles.wheelCircle}
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            <svg viewBox="0 0 300 300">
                                {PRIZES.map((prize, idx) => {
                                    const n = PRIZES.length;
                                    const angleStep = 360 / n;
                                    const startDeg = idx * angleStep;
                                    const endDeg = (idx + 1) * angleStep;
                                    const startRad = ((startDeg - 90) * Math.PI) / 180;
                                    const endRad = ((endDeg - 90) * Math.PI) / 180;
                                    const r = 148;
                                    const x1 = 150 + r * Math.cos(startRad);
                                    const y1 = 150 + r * Math.sin(startRad);
                                    const x2 = 150 + r * Math.cos(endRad);
                                    const y2 = 150 + r * Math.sin(endRad);
                                    const pathData = `M 150 150 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                                    const midDeg = startDeg + angleStep / 2;
                                    const midRad = ((midDeg - 90) * Math.PI) / 180;
                                    const textR = 95;
                                    const tx = 150 + textR * Math.cos(midRad);
                                    const ty = 150 + textR * Math.sin(midRad);

                                    const textRotation = midDeg;

                                    return (
                                        <g key={idx}>
                                            <path d={pathData} fill={COLORS[idx]} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                                            <text 
                                                x={tx} 
                                                y={ty} 
                                                fill="#ffffff" 
                                                fontSize="12" 
                                                fontWeight="700" 
                                                textAnchor="middle" 
                                                dominantBaseline="central"
                                                transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                                                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                                            >
                                                {prize.text}
                                            </text>
                                        </g>
                                    );
                                })}

                                <circle cx="150" cy="150" r="32" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                            </svg>
                        </div>
                        <button 
                            className={`${styles.wheelCenterButton} ${(isSpinning || hasSpun) ? styles.disabled : ""}`}
                            onClick={handleSpin}
                            disabled={isSpinning || hasSpun}
                        >
                            {isSpinning ? "..." : "QUAY"}
                        </button>
                    </div>

                    {prizeText && (
                        <div className={styles.wheelPrizeBanner}>
                            {prizeText}
                        </div>
                    )}
                    
                    <p className={styles.wheelInstruction}>
                        {hasSpun ? "Bạn đã sử dụng lượt quay của hôm nay. Hãy quay lại vào ngày mai!" : "Mỗi ngày bạn có 1 lượt quay miễn phí để nhận thêm EXP tích lũy."}
                    </p>
                </div>
            )}

            {activeSubTab === "history" && (
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
            )}
        </div>
    );
}
