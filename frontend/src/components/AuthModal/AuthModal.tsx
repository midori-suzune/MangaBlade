import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import styles from "./AuthModal.module.css";
import {
  login as loginApi,
  register as registerApi,
  forgotPassword as forgotPasswordApi,
  verifyOtp as verifyOtpApi,
  resendOtp as resendOtpApi,
} from "../../api/authApi";
import { useAuthStore } from "../../stores/authStore";
import type { ApiResponse, AuthResponse } from "../../types/auth";
import axios from "axios";
import { useGoogleLogin } from '@react-oauth/google';
import { googleLogin as googleLoginApi } from '../../api/authApi';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    login: authLogin,
  } = useAuthStore();

  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authModalTab === 'login' || authModalTab === 'register' || authModalTab === 'forgot') {
      Promise.resolve().then(() => {
        setView(authModalTab);
      });
    }
  }, [authModalTab]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setError("");
      setSuccess("");
      setFieldErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);

      if (!isAuthModalOpen) {
        setEmail("");
        setPassword("");
        setUsername("");
        setConfirmPassword("");
        setOtp("");
      }
    });
  }, [view, isAuthModalOpen]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const result = await googleLoginApi({ credential: tokenResponse.access_token });
        if (result.success) {
          authLogin(result.payload.accessToken, result.payload.userInfo, true);
          closeAuthModal();
        } else {
          setError(result.message || 'Google login failed');
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data) {
          const data = err.response.data as ApiResponse<AuthResponse>;
          setError(data.message || 'Google login failed');
        } else {
          setError('An error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    },
  });

  if (!isAuthModalOpen) return null;

  function validateLogin(): boolean {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateRegister(): boolean {
    const errors: Record<string, string> = {};
    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length > 50) {
      errors.username = "Username must be at most 50 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Mật khẩu không được để trống";
    } else if (password.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Mật khẩu phải chứa ít nhất 1 chữ cái viết thường";
    } else if (!/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
      errors.password = "Mật khẩu phải chứa ít nhất 1 số hoặc ký tự đặc biệt";
    } else if (password.length > 72) {
      errors.password = "Mật khẩu không được vượt quá 72 ký tự";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateLogin()) return;

    setLoading(true);
    try {
      const result = await loginApi({ email, password });
      if (result.success) {
        authLogin(result.payload.accessToken, result.payload.userInfo, rememberMe);
        closeAuthModal();
      } else {
        if (result.fieldsErrors) {
          setFieldErrors(result.fieldsErrors);
        }
        setError(result.message || "Login failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<AuthResponse>;
        if (data.fieldsErrors) {
          setFieldErrors(data.fieldsErrors);
        }
        if (data.message && data.message.toLowerCase().includes("email not verified")) {
          setVerificationEmail(email);
          setOtp("");
          setView("verify");
          setSuccess("Tài khoản chưa được xác thực. Vui lòng nhập mã OTP gửi tới Email của bạn.");
        } else {
          setError(data.message || "Login failed");
        }
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateRegister()) return;

    setLoading(true);
    try {
      const result = await registerApi({ username, email, password });
      if (result.success) {
        setSuccess("Mã OTP đã được gửi vào Email của bạn. Vui lòng xác thực.");
        setVerificationEmail(email);
        setOtp("");
        setView("verify");
        setPassword("");
        setConfirmPassword("");
      } else {
        if (result.fieldsErrors) {
          setFieldErrors(result.fieldsErrors);
        }
        setError(result.message || "Registration failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<void>;
        if (data.fieldsErrors) {
          setFieldErrors(data.fieldsErrors);
        }
        setError(data.message || "Registration failed");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setFieldErrors({ email: "Email is required" });
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPasswordApi({ email });
      if (result.success) {
        setSuccess(
            "Password reset link has been sent to your email. Please check your inbox.",
        );
        setEmail("");
      } else {
        if (result.fieldsErrors) {
          setFieldErrors(result.fieldsErrors);
        }
        setError(result.message || "Failed to send recovery request");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<void>;
        if (data.fieldsErrors) {
          setFieldErrors(data.fieldsErrors);
        }
        setError(data.message || "Failed to send recovery request");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtpSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!otp || otp.length !== 6) {
      setFieldErrors({ otp: "Mã OTP phải có đúng 6 chữ số" });
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpApi({ email: verificationEmail, otp });
      if (result.success) {
        setSuccess("Xác thực Email thành công! Bạn có thể đăng nhập ngay.");
        setView("login");
        setOtp("");
      } else {
        setError(result.message || "Xác thực thất bại");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<void>;
        setError(data.message || "Xác thực thất bại");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await resendOtpApi({ email: verificationEmail });
      if (result.success) {
        setSuccess("Mã OTP mới đã được gửi thành công!");
        setResendCooldown(30);
      } else {
        setError(result.message || "Gửi lại mã thất bại");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiResponse<void>;
        setError(data.message || "Gửi lại mã thất bại");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
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
        <div
            className={styles.modal}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
        >
          <button
              className={styles.closeBtn}
              onClick={closeAuthModal}
              aria-label="Đóng"
          >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className={styles.logo}>
            Manga<span>Blade</span>
          </div>

          {view !== "forgot" && view !== "verify" ? (
              <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${view === "login" ? styles.activeTab : ""}`}
                    onClick={() => setView("login")}
                >
                  Đăng nhập
                </button>
                <button
                    className={`${styles.tab} ${view === "register" ? styles.activeTab : ""}`}
                    onClick={() => setView("register")}
                >
                  Tạo tài khoản
                </button>
              </div>
          ) : view === "forgot" ? (
              <h2 className={styles.forgotHeading}>Khôi phục mật khẩu</h2>
          ) : (
              <h2 className={styles.forgotHeading}>Email xác thực</h2>
          )}

          {success && <div className={styles.successBanner}>{success}</div>}
          {error && <div className={styles.errorBanner}>{error}</div>}

          {view === "forgot" ? (
              <form
                  onSubmit={handleForgotPasswordSubmit}
                  className={styles.form}
                  noValidate
              >
                <div className={styles.field}>
                  <label htmlFor="modal-forgot-email" className={styles.label}>
                    Email
                  </label>
                  <input
                      id="modal-forgot-email"
                      type="email"
                      className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                  />
                  {fieldErrors.email && (
                      <span className={styles.fieldError}>{fieldErrors.email}</span>
                  )}
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                >
                  {loading ? "Đang gửi..." : "Gửi yêu cầu khôi phục"}
                </button>

                <p className={styles.footer}>
                  <button
                      type="button"
                      className={styles.link}
                      onClick={() => setView("login")}
                  >
                    Quay lại Đăng nhập
                  </button>
                </p>
              </form>
          ) : view === "login" ? (
              <form onSubmit={handleLoginSubmit} className={styles.form} noValidate>
                <div className={styles.field}>
                  <label htmlFor="modal-email" className={styles.label}>
                    Email
                  </label>
                  <input
                      id="modal-email"
                      type="email"
                      className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                  />
                  {fieldErrors.email && (
                      <span className={styles.fieldError}>{fieldErrors.email}</span>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="modal-password" className={styles.label}>
                    Mật khẩu
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                        id="modal-password"
                        type={showPassword ? "text" : "password"}
                        className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
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
                        aria-label={
                          showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                        }
                    >
                      {showPassword ? (
                          <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                      ) : (
                          <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                      <span className={styles.fieldError}>
                  {fieldErrors.password}
                </span>
                  )}
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

                <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "-8px",
                      marginBottom: "8px",
                    }}
                >
                  <button
                      type="button"
                      className={styles.link}
                      onClick={() => setView("forgot")}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <div className={styles.divider}>
                  <span>hoặc tiếp tục với</span>
                </div>

                <button
                    type="button"
                    className={styles.googleBtn}
                    onClick={() => handleGoogleLogin()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.42l3.66-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                  </svg>
                  Tiếp tục với Google
                </button>

                <p className={styles.footer}>
                  Chưa có tài khoản?{" "}
                  <button
                      type="button"
                      className={styles.link}
                      onClick={() => setView("register")}
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </form>
          ) : view === "register" ? (
              <form
                  onSubmit={handleRegisterSubmit}
                  className={styles.form}
                  noValidate
              >
                <div className={styles.field}>
                  <label htmlFor="modal-username" className={styles.label}>
                    Tên tài khoản
                  </label>
                  <input
                      id="modal-username"
                      type="text"
                      className={`${styles.input} ${fieldErrors.username ? styles.inputError : ""}`}
                      placeholder="Nhập tên tài khoản"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                  />
                  {fieldErrors.username && (
                      <span className={styles.fieldError}>
                  {fieldErrors.username}
                </span>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="modal-reg-email" className={styles.label}>
                    Email
                  </label>
                  <input
                      id="modal-reg-email"
                      type="email"
                      className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                  />
                  {fieldErrors.email && (
                      <span className={styles.fieldError}>{fieldErrors.email}</span>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="modal-reg-password" className={styles.label}>
                    Mật khẩu
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                        id="modal-reg-password"
                        type={showPassword ? "text" : "password"}
                        className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
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
                        aria-label={
                          showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                        }
                    >
                      {showPassword ? (
                          <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                      ) : (
                          <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                      <span className={styles.fieldError}>
                  {fieldErrors.password}
                </span>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="modal-confirm-password" className={styles.label}>
                    Xác nhận mật khẩu
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                        id="modal-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ""}`}
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
                        aria-label={
                          showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                        }
                    >
                      {showConfirmPassword ? (
                          <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                      ) : (
                          <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                      <span className={styles.fieldError}>
                  {fieldErrors.confirmPassword}
                </span>
                  )}
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                >
                  {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
                </button>

                <p className={styles.footer}>
                  Đã có tài khoản?{" "}
                  <button
                      type="button"
                      className={styles.link}
                      onClick={() => setView("login")}
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </form>
          ) : (
              <form onSubmit={handleVerifyOtpSubmit} className={styles.form} noValidate>
                <p className={styles.emailLead} style={{ fontSize: '13px', textAlign: 'center', marginBottom: '24px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Hãy cho chúng tôi biết rằng địa chỉ email này thuộc về bạn. Nhập mã OTP 6 số đã được gửi tới <strong>{verificationEmail}</strong>
                </p>

                <div className={styles.field}>
                  <label htmlFor="modal-otp" className={styles.label}>
                    Mã xác nhận (OTP)
                  </label>
                  <input
                      id="modal-otp"
                      type="text"
                      maxLength={6}
                      className={`${styles.input} ${fieldErrors.otp ? styles.inputError : ""}`}
                      placeholder="Nhập mã xác nhận"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      autoComplete="one-time-code"
                  />
                  {fieldErrors.otp && (
                      <span className={styles.fieldError}>{fieldErrors.otp}</span>
                  )}
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                >
                  {loading ? "Đang xác thực..." : "Tiếp tục"}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                      type="button"
                      className={styles.link}
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      style={{ opacity: resendCooldown > 0 ? 0.6 : 1 }}
                  >
                    {resendCooldown > 0 ? `Gửi lại thư sau ${resendCooldown}s` : "Gửi lại thư"}
                  </button>
                </div>

                <p className={styles.footer}>
                  Muốn quay lại?{" "}
                  <button
                      type="button"
                      className={styles.link}
                      onClick={() => setView("login")}
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </form>
          )}
        </div>
      </div>
  );
}
