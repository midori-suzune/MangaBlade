import React, { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useAuthStore } from "../../../stores/authStore";
import styles from "../UserProfile.module.css";

export function AccountSettingsTab() {
    const { user } = useAuthStore();
    const [displayName, setDisplayName] = useState(() => {
        if (user) {
            const saved = localStorage.getItem(`displayName_${user.id}`);
            if (saved) return saved;
            if (user.username) return user.username;
        }
        return "";
    });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
        if (user) return localStorage.getItem(`avatar_${user.id}`);
        return null;
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [exp] = useState(() => {
        if (user) {
            const savedCheckIn = localStorage.getItem(`checkin_${user.id}_${new Date().toDateString()}`);
            if (savedCheckIn === "claimed") return 440;
        }
        return 420;
    });
    const [level] = useState(5);

    const handleUpdateSettings = () => {
        if (!displayName.trim()) {
            alert("Vui lòng điền họ tên hiển thị!");
            return;
        }

        if (user) {
            localStorage.setItem(`displayName_${user.id}`, displayName);
        }

        alert("Cập nhật tài khoản thành công!");
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Kích thước file tối đa là 2MB!");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setAvatarUrl(result);
                if (user?.id) {
                    localStorage.setItem(`avatar_${user.id}`, result);
                }
            };
            reader.readAsDataURL(file);
        }
    };



    if (!user) return null;

    return (
        <div>
            <div className={styles.pageTitleSection}>
                <h1 className={styles.pageTitle}>Hồ sơ tài khoản</h1>
                <p className={styles.pageSubtitle}>
                    Quản lý và cập nhật thông tin tài khoản thành viên.
                </p>
            </div>

            <div className={styles.profileHeaderBanner}>
                <div className={styles.avatarContainerLarge}>
                    <div className={styles.avatarCircleLarge} onClick={() => fileInputRef.current?.click()}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" />
                        ) : (
                            <span className={styles.avatarPlaceholderText}>
                                {displayName.substring(0, 1).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className={styles.avatarEditOverlay} onClick={() => fileInputRef.current?.click()}>
                        <Pencil size={14} />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </div>
                <div className={styles.profileMetaInfo}>
                    <h2 className={styles.profileMetaName}>{displayName}</h2>
                    <span className={styles.profileMetaUsername}>@{user.username}</span>
                    <div className={styles.profileMetaLevelBox}>
                        <div className={styles.levelProgressContainer}>
                            <span className={styles.levelBadgeText}>Cấp {level}</span>
                            <div className={styles.levelProgressBarOuter}>
                                <div 
                                    className={styles.levelProgressBarInner} 
                                    style={{ width: `${(exp / 500) * 100}%` }}
                                ></div>
                            </div>
                            <span className={styles.levelExpText}>{exp} / 500 EXP</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.formGrid2} style={{ marginBottom: "20px" }}>
                <div className={styles.settingsSection} style={{ marginBottom: 0 }}>
                    <label htmlFor="display-name" className={styles.sectionLabel}>Họ tên hiển thị</label>
                    <input
                        type="text"
                        id="display-name"
                        className={styles.formInput}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <div className={styles.settingsSection} style={{ marginBottom: 0 }}>
                    <label htmlFor="email-update" className={styles.sectionLabel}>Email tài khoản</label>
                    <input
                        type="email"
                        id="email-update"
                        className={styles.formInput}
                        value={user.email}
                        readOnly
                        disabled
                        style={{ backgroundColor: "#f8fafc", cursor: "not-allowed", color: "#64748b" }}
                    />
                </div>
            </div>

            <div className={styles.settingsSection}>
                <span className={styles.sectionLabel}>Thông tin hệ thống</span>
                <div className={styles.formGrid2}>
                    <div className={styles.infoBox}>
                        <span className={styles.infoBoxLabel}>Username</span>
                        <span className={styles.infoBoxValue}>{user.username}</span>
                    </div>
                    <div className={styles.infoBox}>
                        <span className={styles.infoBoxLabel}>Ngày gia nhập</span>
                        <span className={styles.infoBoxValue}>10/07/2026</span>
                    </div>
                </div>
            </div>



            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", borderTop: "1px solid var(--color-border)", paddingTop: "20px" }}>
                <button className={styles.btnSubmit} onClick={handleUpdateSettings}>
                    Cập nhật
                </button>
            </div>
        </div>
    );
}
