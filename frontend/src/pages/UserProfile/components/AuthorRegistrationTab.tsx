import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Feather, CheckCircle, Clock, BookOpen, BarChart3, MessageSquare, AlertCircle, X } from "lucide-react";
import { authorRequestApi, type AuthorRequestResponse } from "../../../api/authorRequestApi";
import styles from "../UserProfile.module.css";

interface AuthorRegistrationTabProps {
  userRole: string;
}

export function AuthorRegistrationTab({ userRole }: AuthorRegistrationTabProps) {
  const [view, setView] = useState<'loading' | 'intro' | 'form' | 'pending' | 'rejected' | 'author'>('loading');
  const [myRequest, setMyRequest] = useState<AuthorRequestResponse | null>(null);
  
  const [penName, setPenName] = useState("");
  const [phone, setPhone] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMyRequest = useCallback(async () => {
    try {
      const res = await authorRequestApi.getMyRequest();
      if (res.success && res.payload) {
        setMyRequest(res.payload);
        if (res.payload.status === 'PENDING') {
          setView('pending');
        } else if (res.payload.status === 'REJECTED') {
          setView('rejected');
        } else if (res.payload.status === 'APPROVED') {
          setView('author');
        } else {
          setView('intro');
        }
      } else {
        setView('intro');
      }
    } catch {
      setView('intro');
    }
  }, []);

  useEffect(() => {
    if (userRole === 'AUTHOR') {
      Promise.resolve().then(() => setView('author'));
    } else {
      Promise.resolve().then(fetchMyRequest);
    }
  }, [userRole, fetchMyRequest]);

  const handleVerifyPhone = () => {
    if (!phone.trim()) {
      alert("Vui lòng điền số điện thoại!");
      return;
    }
    setOtpCode("");
    setOtpError("");
    setShowOtpModal(true);
  };

  const handleOtpConfirm = () => {
    if (otpCode === "123456") {
      setPhoneVerified(true);
      setShowOtpModal(false);
    } else {
      setOtpError("Mã xác minh không chính xác. Vui lòng nhập 123456 để thử.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penName.trim() || !phone.trim() || !socialLink.trim()) {
      alert("Vui lòng điền đầy đủ các trường thông tin!");
      return;
    }
    if (!phoneVerified) {
      alert("Vui lòng xác minh số điện thoại!");
      return;
    }
    if (!agreedTerms) {
      alert("Vui lòng đồng ý với cam kết điều khoản!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authorRequestApi.submit({
        penName,
        phone,
        socialLink
      });
      if (res.success) {
        setMyRequest(res.payload);
        setView('pending');
      } else {
        alert(res.message || "Gửi đơn đăng ký thất bại!");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Lỗi khi gửi đơn đăng ký!");
      } else {
        alert("Lỗi khi gửi đơn đăng ký!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Đang tải thông tin...</p>
      </div>
    );
  }

  if (view === 'author') {
    return (
      <div>
        <div className={styles.pageTitleSection}>
          <h2 className={styles.pageTitle}>Bạn đã là Tác giả!</h2>
          <p className={styles.pageSubtitle}>
            Tài khoản của bạn đã được nâng cấp lên vai trò Tác giả. Hãy truy cập trang Quản lý Tác giả để bắt đầu đăng truyện.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: '#def7ec',
          borderRadius: 'var(--border-radius-sm)',
          color: '#03543f',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          <CheckCircle size={20} />
          Vai trò hiện tại: Tác giả (Author)
        </div>
      </div>
    );
  }

  if (view === 'pending') {
    return (
      <div>
        <div className={styles.pageTitleSection}>
          <h2 className={styles.pageTitle}>Đơn đăng ký đã được gửi</h2>
          <p className={styles.pageSubtitle}>
            Đơn đăng ký trở thành Tác giả của bạn đang chờ Admin xét duyệt. Bạn sẽ nhận được thông báo khi đơn được phê duyệt.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 0',
          color: '#4f46e5',
          fontWeight: 600,
          fontSize: '14.5px',
          marginBottom: '24px'
        }}>
          <Clock size={18} />
          Trạng thái: Đang chờ duyệt
        </div>

        {myRequest && (
          <div style={{
            padding: '20px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: 'var(--color-surface)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              Thông tin đã đăng ký
            </h3>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'inline-block', width: '120px' }}>Bút danh:</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{myRequest.penName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'inline-block', width: '120px' }}>Số điện thoại:</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{myRequest.phone}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'inline-block', width: '120px' }}>Link mạng xã hội:</span>
                <a href={myRequest.socialLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
                  {myRequest.socialLink}
                </a>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'inline-block', width: '120px' }}>Ngày gửi:</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>
                  {new Date(myRequest.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'rejected') {
    return (
      <div>
        <div className={styles.pageTitleSection}>
          <h2 className={styles.pageTitle}>Đơn đăng ký bị từ chối</h2>
          <p className={styles.pageSubtitle}>
            Đơn đăng ký làm tác giả của bạn đã bị từ chối bởi quản trị viên.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: '#fde8e8',
          borderRadius: 'var(--border-radius-sm)',
          color: '#9b1c1c',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Lý do từ chối:</div>
            <div style={{ lineHeight: 1.5 }}>{myRequest?.rejectReason || "Không có lý do chi tiết."}</div>
          </div>
        </div>

        <button
          className={styles.btnTask}
          onClick={() => {
            setPenName(myRequest?.penName || "");
            setPhone(myRequest?.phone || "");
            setSocialLink(myRequest?.socialLink || "");
            setPhoneVerified(true);
            setAgreedTerms(false);
            setView('form');
          }}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '15px',
            fontWeight: 600,
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer'
          }}
        >
          Gửi lại đơn đăng ký mới
        </button>
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div>
        <div className={styles.pageTitleSection}>
          <h2 className={styles.pageTitle}>Điền thông tin đăng ký</h2>
          <p className={styles.pageSubtitle}>
            Vui lòng điền đầy đủ thông tin bên dưới để gửi đơn đăng ký trở thành Tác giả.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div className={styles.formGrid2} style={{ marginBottom: 0 }}>
            <div className={styles.settingsSection} style={{ marginBottom: 0 }}>
              <label htmlFor="pen-name" className={styles.sectionLabel}>Bút danh tác giả</label>
              <input
                type="text"
                id="pen-name"
                className={styles.formInput}
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                placeholder="Nhập tên bút danh hiển thị"
                required
              />
            </div>

            <div className={styles.settingsSection} style={{ marginBottom: 0 }}>
              <label htmlFor="phone-number" className={styles.sectionLabel}>
                Số điện thoại liên hệ
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="tel"
                  id="phone-number"
                  className={styles.formInput}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneVerified(false);
                  }}
                  placeholder="Nhập số điện thoại"
                  required
                  style={{ flex: 1 }}
                />
                {phoneVerified ? (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#03543f',
                    backgroundColor: '#def7ec',
                    padding: '0 12px',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: '13px',
                    fontWeight: 600,
                    height: '42px',
                    border: '1px solid #bcf0da'
                  }}>
                    ✓ Đã xác minh
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    style={{
                      padding: '0 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer',
                      height: '42px'
                    }}
                  >
                    Xác minh SĐT
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.settingsSection} style={{ marginBottom: 0 }}>
            <label htmlFor="social-link" className={styles.sectionLabel}>Link mạng xã hội (Facebook/Zalo/LinkedIn/Portfolio)</label>
            <input
              type="url"
              id="social-link"
              className={styles.formInput}
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="https://facebook.com/username hoặc link mạng xã hội của bạn"
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px' }}>
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              style={{ marginTop: '4px', cursor: 'pointer' }}
            />
            <label htmlFor="agree-terms" style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, cursor: 'pointer' }}>
              Tôi cam kết mọi nội dung đăng tải là hợp pháp, không vi phạm bản quyền và chịu hoàn toàn trách nhiệm.
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setView('intro')}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '15px',
                fontWeight: 600,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                cursor: 'pointer'
              }}
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={submitting || !penName.trim() || !phone.trim() || !socialLink.trim() || !phoneVerified || !agreedTerms}
              style={{
                flex: 2,
                padding: '12px',
                fontSize: '15px',
                fontWeight: 600,
                backgroundColor: 'var(--color-accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                cursor: (submitting || !penName.trim() || !phone.trim() || !socialLink.trim() || !phoneVerified || !agreedTerms) ? 'not-allowed' : 'pointer',
                opacity: (submitting || !penName.trim() || !phone.trim() || !socialLink.trim() || !phoneVerified || !agreedTerms) ? 0.6 : 1
              }}
            >
              {submitting ? 'Đang gửi đơn...' : 'Gửi đơn đăng ký'}
            </button>
          </div>
        </form>

        {showOtpModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <button
                onClick={() => setShowOtpModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
              >
                <X size={20} />
              </button>
              
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Xác minh số điện thoại
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
                Mã xác minh đã gửi tới SĐT của bạn <strong style={{ color: 'var(--color-accent)' }}>(Demo: Nhập 123456)</strong>
              </p>

              <div style={{ display: 'grid', gap: '16px' }}>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ""));
                    setOtpError("");
                  }}
                  placeholder="Nhập 6 chữ số OTP"
                  style={{
                    padding: '12px',
                    fontSize: '18px',
                    textAlign: 'center',
                    letterSpacing: '6px',
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--border-radius-sm)',
                    outline: 'none'
                  }}
                />

                {otpError && (
                  <p style={{ fontSize: '12px', color: '#9b1c1c', margin: 0 }}>{otpError}</p>
                )}

                <button
                  type="button"
                  onClick={handleOtpConfirm}
                  style={{
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: 600,
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const benefits = [
    {
      icon: <BookOpen size={20} />,
      title: "Đăng tải truyện",
      desc: "Tạo và đăng tải các bộ truyện tranh của riêng bạn lên MangaBlade."
    },
    {
      icon: <Feather size={20} />,
      title: "Quản lý chương",
      desc: "Thêm chương mới, upload trang truyện và sắp xếp nội dung dễ dàng."
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Thống kê chi tiết",
      desc: "Theo dõi lượt xem, lượt theo dõi và xu hướng đọc của độc giả."
    },
    {
      icon: <MessageSquare size={20} />,
      title: "Tương tác với độc giả",
      desc: "Trả lời bình luận của độc giả với huy hiệu Tác giả bên cạnh tên."
    }
  ];

  return (
    <div>
      <div className={styles.pageTitleSection}>
        <h2 className={styles.pageTitle}>Đăng ký trở thành Tác giả</h2>
        <p className={styles.pageSubtitle}>
          Nâng cấp tài khoản của bạn để bắt đầu sáng tạo và chia sẻ truyện tranh với cộng đồng MangaBlade.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {benefits.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '14px',
              padding: '18px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--color-surface)',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              color: 'var(--color-accent)',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--color-text-main)',
                marginBottom: '4px'
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5
              }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '20px',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-sm)',
        backgroundColor: 'var(--color-surface)'
      }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--color-text-main)',
          marginBottom: '12px'
        }}>
          Lưu ý
        </h3>
        <ul style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          lineHeight: 2,
          paddingLeft: '20px',
          margin: 0
        }}>
          <li>Mỗi truyện/chương sẽ được Admin kiểm duyệt trước khi hiển thị công khai.</li>
          <li>Đăng tải nội dung tiêu cực/phản cảm sẽ bị vô hiệu hóa tài khoản.</li>
        </ul>
      </div>

      <button
        className={styles.btnTask}
        onClick={() => setView('form')}
        style={{
          marginTop: '24px',
          width: '100%',
          padding: '12px',
          fontSize: '15px',
          fontWeight: 600,
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--border-radius-sm)',
          cursor: 'pointer'
        }}
      >
        Đăng ký ngay
      </button>
    </div>
  );
}
