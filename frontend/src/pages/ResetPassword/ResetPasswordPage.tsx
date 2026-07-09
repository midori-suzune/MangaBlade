import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { resetPassword } from '../../api/authApi';
import type { ApiResponse } from '../../types/auth';
import axios from 'axios';
import styles from './ResetPasswordPage.module.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isLengthValid = newPassword.length >= 8;
  const isCaseValid = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const isCharValid = /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);
  
  const isRequirementsMet = isLengthValid && isCaseValid && isCharValid;
  const isConfirmValid = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = isRequirementsMet && isConfirmValid && token;

  const handleBackToLogin = () => {
    openAuthModal('login');
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    if (!token) {
      setError('Password reset token is missing or invalid.');
      return;
    }

    if (!isRequirementsMet) {
      setError('Password does not meet all requirements.');
      return;
    }

    if (!isConfirmValid) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({ token, newPassword });
      if (response.success) {
        setSuccess('Your password has been reset successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        if (response.fieldsErrors) {
          setFieldErrors(response.fieldsErrors);
        }
        setError(response.message || 'Failed to reset password.');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<void>;
        if (data.fieldsErrors) {
          setFieldErrors(data.fieldsErrors);
        }
        setError(data.message || 'Failed to reset password.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={handleBackToLogin} className={styles.backButton} aria-label="Quay lại Đăng nhập">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Đăng nhập
      </button>

      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className={styles.title}>Đặt lại mật khẩu</h1>
        <p className={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn</p>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && (
          <div className={styles.successBanner}>
            <p>{success}</p>
            <button onClick={handleBackToLogin} className={styles.successLoginBtn}>
              Đăng nhập ngay
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {!token && (
              <div className={styles.warningBanner}>
                Cảnh báo: Không tìm thấy mã thông báo (token) trong liên kết. Bạn sẽ không thể gửi biểu mẫu này.
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="new-password" className={styles.label}>Mật khẩu mới</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  className={`${styles.input} ${fieldErrors.newPassword ? styles.inputError : ''}`}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showNewPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.newPassword && <span className={styles.fieldError}>{fieldErrors.newPassword}</span>}
            </div>

            <div className={styles.checklist}>
              <p className={styles.checklistTitle}>Yêu cầu mật khẩu:</p>
              <ul className={styles.checklistList}>
                <li className={styles.checklistItem}>
                  <span className={`${styles.dot} ${isLengthValid ? styles.dotValid : styles.dotInvalid}`} />
                  <span className={isLengthValid ? styles.textValid : styles.textInvalid}>Ít nhất 8 ký tự</span>
                </li>
                <li className={styles.checklistItem}>
                  <span className={`${styles.dot} ${isCaseValid ? styles.dotValid : styles.dotInvalid}`} />
                  <span className={isCaseValid ? styles.textValid : styles.textInvalid}>Bao gồm chữ hoa và chữ thường</span>
                </li>
                <li className={styles.checklistItem}>
                  <span className={`${styles.dot} ${isCharValid ? styles.dotValid : styles.dotInvalid}`} />
                  <span className={isCharValid ? styles.textValid : styles.textInvalid}>Bao gồm số hoặc ký tự đặc biệt</span>
                </li>
              </ul>
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm-password" className={styles.label}>Xác nhận mật khẩu</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={!isFormValid || loading}>
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <button onClick={handleBackToLogin} className={styles.linkBtn}>
            Nhớ mật khẩu? Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}
