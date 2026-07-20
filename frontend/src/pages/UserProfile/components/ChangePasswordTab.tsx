import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePassword as changePasswordApi } from "../../../api/authApi";
import styles from "../UserProfile.module.css";
import axios from "axios";
import type { ApiResponse } from "../../../types/auth";

export function ChangePasswordTab() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setErrorMessage(null);

        if (newPassword.length < 8) {
            setErrorMessage("Mật khẩu mới phải có tối thiểu 8 ký tự!");
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setErrorMessage("Mật khẩu mới phải chứa ít nhất 1 chữ cái viết hoa!");
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            setErrorMessage("Mật khẩu mới phải chứa ít nhất 1 chữ cái viết thường!");
            return;
        }

        if (!/[0-9]/.test(newPassword) && !/[^A-Za-z0-9]/.test(newPassword)) {
            setErrorMessage("Mật khẩu mới phải chứa ít nhất 1 số hoặc ký tự đặc biệt!");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        setLoading(true);
        try {
            const response = await changePasswordApi({
                currentPassword,
                newPassword,
            });

            if (response.success) {
                setSuccessMessage("Thay đổi mật khẩu thành công!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setErrorMessage(response.message || "Đã xảy ra lỗi khi đổi mật khẩu.");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const data = err.response.data as ApiResponse<void>;
                if (data.message === "Incorrect current password") {
                    setErrorMessage("Mật khẩu hiện tại không chính xác!");
                } else if (data.message === "Google accounts do not support local password changes") {
                    setErrorMessage("Tài khoản đăng nhập bằng Google không hỗ trợ đổi mật khẩu trực tiếp!");
                } else {
                    setErrorMessage(data.message || "Thay đổi mật khẩu thất bại.");
                }
            } else {
                setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className={styles.pageTitleSection}>
                <h1 className={styles.pageTitle}>Thay đổi mật khẩu</h1>
                <p className={styles.pageSubtitle}>
                    Cập nhật mật khẩu mới để bảo mật tài khoản của bạn.
                </p>
            </div>

            {successMessage && (
                <div className={styles.alertSuccess}>
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className={styles.alertError}>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleChangePassword}>
                <div className={styles.settingsSection}>
                    <label htmlFor="current-pw" className={styles.sectionLabel}>Mật khẩu hiện tại</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showCurrentPw ? "text" : "password"}
                            id="current-pw"
                            className={styles.formInput}
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.eyeToggle}
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            aria-label="Toggle password visibility"
                            disabled={loading}
                        >
                            {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <label htmlFor="new-pw" className={styles.sectionLabel}>Mật khẩu mới</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showNewPw ? "text" : "password"}
                            id="new-pw"
                            className={styles.formInput}
                            placeholder="Tối thiểu 8 ký tự"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.eyeToggle}
                            onClick={() => setShowNewPw(!showNewPw)}
                            aria-label="Toggle password visibility"
                            disabled={loading}
                        >
                            {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <label htmlFor="confirm-pw" className={styles.sectionLabel}>Xác nhận mật khẩu mới</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showConfirmPw ? "text" : "password"}
                            id="confirm-pw"
                            className={styles.formInput}
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.eyeToggle}
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            aria-label="Toggle password visibility"
                            disabled={loading}
                        >
                            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", borderTop: "1px solid var(--color-border)", paddingTop: "20px" }}>
                    <button type="submit" className={styles.btnSubmit} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
                    </button>
                </div>
            </form>
        </div>
    );
}
