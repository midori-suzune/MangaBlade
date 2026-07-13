import { useState } from "react";
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

interface LuckyWheelProps {
    user: { id: number } | null;
    exp: number;
    setExp: (exp: number) => void;
    level: number;
    setLevel: (level: number) => void;
    addHistoryEntry: (type: string, amount: number) => void;
    initialSpun: boolean;
    initialPrize: string | null;
}

export function LuckyWheel({
    user,
    exp,
    setExp,
    level,
    setLevel,
    addHistoryEntry,
    initialSpun,
    initialPrize
}: LuckyWheelProps) {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [hasSpun, setHasSpun] = useState(initialSpun);
    const [prizeText, setPrizeText] = useState<string | null>(initialPrize);

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

    return (
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
    );
}
