import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import styles from './AuthModal.module.css';
import { login as loginApi, register as registerApi, forgotPassword as forgotPasswordApi } from '../../api/authApi';
import { useAuthStore } from '../../stores/authStore';
import type { ApiResponse, AuthResponse } from '../../types/auth';
import axios from 'axios';

export function AuthModal() {
  const { isAuthModalOpen, authModalTab, openAuthModal, closeAuthModal, login: authLogin } = useAuthStore();

  // Common/Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Register states
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Clear fields and errors when modal tab switches or closes
  useEffect(() => {
    setError('');
    setSuccess('');
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    // Keep credentials when switching tabs, but clear register-only fields when opening/closing
    if (!isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setUsername('');
      setConfirmPassword('');
    }
  }, [authModalTab, isAuthModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  function validateLogin(): boolean {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    }
    if (!password) {
      errors.password = 'Mật khẩu không được để trống';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateRegister(): boolean {
    const errors: Record<string, string> = {};
    if (!username.trim()) {
      errors.username = 'Tên tài khoản không được để trống';
    } else if (username.length > 50) {
      errors.username = 'Tên tài khoản tối đa 50 ký tự';
    }

    if (!email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    }

    if (!password) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải chứa ít nhất 8 ký tự';
    } else if (password.length > 72) {
      errors.password = 'Mật khẩu tối đa 72 ký tự';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateLogin()) return;

    setLoading(true);
    try {
      const result = await loginApi({ email, password });
      if (result.success) {
        authLogin(result.payload.accessToken, result.payload.user, rememberMe);
        closeAuthModal();
      } else {
        if (result.fieldsErrors) {
          setFieldErrors(result.fieldsErrors);
        }
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<AuthResponse>;
        if (data.fieldsErrors) {
          setFieldErrors(data.fieldsErrors);
        }
        setError(data.message || 'Đăng nhập thất bại');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateRegister()) return;

    setLoading(true);
    try {
      const result = await registerApi({ username, email, password });
      if (result.success) {
        setSuccess('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        // Switch to login tab
        openAuthModal('login');
        // Pre-fill the login email
        setPassword('');
        setConfirmPassword('');
      } else {
        if (result.fieldsErrors) {
          setFieldErrors(result.fieldsErrors);
        }
        setError(result.message || 'Đăng ký thất bại');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<void>;
        if (data.fieldsErrors) {
          setFieldErrors(data.fieldsErrors);
        }
        setError(data.message || 'Đăng ký thất bại');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setFieldErrors({ email: 'Email không được để trống' });
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: 'Vui lòng nhập địa chỉ email hợp lệ' });
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPasswordApi({ email });
      if (result.success) {
        setSuccess('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
        setEmail('');
      } else {
        if (result.fieldsErrors) {
          setFieldErrors(result.fieldsErrors);
        }
        setError(result.message || 'Gửi yêu cầu khôi phục thất bại');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<void>;
        if (data.fieldsErrors) {
          setFieldErrors(data.fieldsErrors);
        }
        setError(data.message || 'Gửi yêu cầu khôi phục thất bại');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      closeAuthModal();
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true">
        <button className={styles.closeBtn} onClick={closeAuthModal} aria-label="Đóng">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className={styles.logo}>
          Manga<span>Blade</span>
        </div>

        {authModalTab !== 'forgot' ? (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${authModalTab === 'login' ? styles.activeTab : ''}`}
              onClick={() => openAuthModal('login')}
            >
              Đăng nhập
            </button>
            <button
              className={`${styles.tab} ${authModalTab === 'register' ? styles.activeTab : ''}`}
              onClick={() => openAuthModal('register')}
            >
              Tạo tài khoản
            </button>
          </div>
        ) : (
          <h2 className={styles.forgotHeading}>Khôi phục mật khẩu</h2>
        )}

        {success && <div className={styles.successBanner}>{success}</div>}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {authModalTab === 'forgot' ? (
          <form onSubmit={handleForgotPasswordSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="modal-forgot-email" className={styles.label}>Email</label>
              <input
                id="modal-forgot-email"
                type="email"
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
            </button>

            <p className={styles.footer}>
              <button type="button" className={styles.link} onClick={() => openAuthModal('login')}>
                Quay lại Đăng nhập
              </button>
            </p>
          </form>
        ) : authModalTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="modal-email" className={styles.label}>Email</label>
              <input
                id="modal-email"
                type="email"
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="modal-password" className={styles.label}>Mật khẩu</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? (
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
              {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
            </div>

            <div className={styles.rememberRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px', marginBottom: '8px' }}>
              <button type="button" className={styles.link} onClick={() => openAuthModal('forgot')}>
                Quên mật khẩu?
              </button>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <div className={styles.divider}>
              <span>hoặc tiếp tục với</span>
            </div>

            <button
              type="button"
              className={styles.googleBtn}
              onClick={() => alert('Chức năng đăng nhập bằng Google sắp ra mắt')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.42l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Tiếp tục với Google
            </button>

            <p className={styles.footer}>
              Chưa có tài khoản?{' '}
              <button type="button" className={styles.link} onClick={() => openAuthModal('register')}>
                Đăng ký ngay
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="modal-username" className={styles.label}>Tên tài khoản</label>
              <input
                id="modal-username"
                type="text"
                className={`${styles.input} ${fieldErrors.username ? styles.inputError : ''}`}
                placeholder="Nhập tên tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              {fieldErrors.username && <span className={styles.fieldError}>{fieldErrors.username}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="modal-reg-email" className={styles.label}>Email</label>
              <input
                id="modal-reg-email"
                type="email"
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="modal-reg-password" className={styles.label}>Mật khẩu</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="modal-reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                  placeholder="Tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? (
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
              {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="modal-confirm-password" className={styles.label}>Xác nhận mật khẩu</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="modal-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
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

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>

            <p className={styles.footer}>
              Đã có tài khoản?{' '}
              <button type="button" className={styles.link} onClick={() => openAuthModal('login')}>
                Đăng nhập ngay
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
