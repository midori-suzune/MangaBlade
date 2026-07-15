import React, { useRef, useState, useEffect, useCallback } from "react";
import { Pencil } from "lucide-react";
import { useAuthStore } from "../../../stores/authStore";
import { getUnlockedTitles, equipTitle, type TitleResponse } from "../../../api/taskApi";
import styles from "../UserProfile.module.css";

export function AccountSettingsTab() {
    const { 
        user, 
        avatarUrl, 
        displayName: storeDisplayName, 
        updateAvatar, 
        updateDisplayName, 
        level, 
        exp,
        updateActiveTitle 
    } = useAuthStore();
    const [displayName, setDisplayName] = useState(storeDisplayName || "");
    const [unlockedTitles, setUnlockedTitles] = useState<TitleResponse[]>([]);
    const [selectedTitleId, setSelectedTitleId] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxExp = (40 * level * level) + (260 * level) + 200;

    const fetchTitles = useCallback(async () => {
        try {
            const res = await getUnlockedTitles();
            if (res.success && res.payload) {
                setUnlockedTitles(res.payload);
                const equipped = res.payload.find(t => t.equipped);
                if (equipped) {
                    setSelectedTitleId(equipped.id.toString());
                } else {
                    setSelectedTitleId("");
                }
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(fetchTitles);
    }, [fetchTitles, level]);

    const handleUpdateSettings = async () => {
        if (!displayName.trim()) {
            alert("Vui lòng điền họ tên hiển thị!");
            return;
        }

        try {
            await updateDisplayName(displayName);

            const titleIdVal = selectedTitleId ? parseInt(selectedTitleId, 10) : null;
            const res = await equipTitle(titleIdVal);
            if (res.success) {
                const selected = unlockedTitles.find(t => t.id === titleIdVal);
                updateActiveTitle(selected ? selected.name : null, selected ? selected.colorCode : null);
                setUnlockedTitles(prev => prev.map(t => ({
                    ...t,
                    equipped: t.id === titleIdVal
                })));
            }
            alert("Cập nhật tài khoản thành công!");
        } catch {
            alert("Lỗi khi cập nhật thông tin tài khoản!");
        }
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
                updateAvatar(result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return null;

    const currentEquipped = unlockedTitles.find(t => t.equipped);

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
                    <h2 className={styles.profileMetaName}>
                        {displayName}
                        {currentEquipped && (
                            <span 
                                style={{ 
                                    marginLeft: "8px", 
                                    fontSize: "12px", 
                                    padding: "2px 8px", 
                                    borderRadius: "4px", 
                                    backgroundColor: `${currentEquipped.colorCode}20`,
                                    color: currentEquipped.colorCode,
                                    border: `1px solid ${currentEquipped.colorCode}`
                                }}
                            >
                                {currentEquipped.name}
                            </span>
                        )}
                    </h2>
                    <span className={styles.profileMetaUsername}>@{user.username}</span>
                    <div className={styles.profileMetaLevelBox}>
                        <div className={styles.levelProgressContainer}>
                            <span className={styles.levelBadgeText}>Cấp {level}</span>
                            <div className={styles.levelProgressBarOuter}>
                                <div 
                                    className={styles.levelProgressBarInner} 
                                    style={{ width: `${(exp / maxExp) * 100}%` }}
                                ></div>
                            </div>
                            <span className={styles.levelExpText}>{exp} / {maxExp} EXP</span>
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

            <div className={styles.formGrid2} style={{ marginBottom: "20px" }}>
                <div className={styles.settingsSection} style={{ marginBottom: 0 }}>
                    <label htmlFor="equip-title" className={styles.sectionLabel}>Danh hiệu hiển thị</label>
                    <select
                        id="equip-title"
                        className={styles.formInput}
                        value={selectedTitleId}
                        onChange={(e) => setSelectedTitleId(e.target.value)}
                    >
                        <option value="">Không sử dụng danh hiệu</option>
                        {unlockedTitles.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.name} (Yêu cầu cấp {t.requiredLevel})
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.settingsSection} style={{ marginBottom: 0 }}>
                    <label className={styles.sectionLabel}>Username đăng nhập</label>
                    <input
                        type="text"
                        className={styles.formInput}
                        value={user.username}
                        readOnly
                        disabled
                        style={{ backgroundColor: "#f8fafc", cursor: "not-allowed", color: "#64748b" }}
                    />
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
