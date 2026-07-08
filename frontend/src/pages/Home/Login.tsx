import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// ĐÃ SỬA: Lùi 2 cấp thư mục (../../) để đi từ pages/Home/ ra src/ rồi mới vào api/mangaApi
import axiosClient from '../../api/mangaApi';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra luồng trải nghiệm hệ thống qua tiền tố /management
  const isManagementRoute = location.pathname.startsWith('/management');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Gửi yêu cầu xác thực tài khoản lên hệ thống Backend
      const res = await axiosClient.post('/auth/login', { usernameOrEmail, password });
      const { accessToken, role, username } = res.data;

      // Logic chặn quyền nghiêm ngặt: Từ chối độc giả truy cập khu vực quản lý
      if (isManagementRoute && role === 'ROLE_USER') {
        setError('Tài khoản của bạn không có quyền truy cập vào phân hệ này!');
        setIsLoading(false);
        return;
      }

      // Lưu trữ thông tin định danh Token an toàn vào LocalStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);

      // Điều hướng rẽ nhánh màn hình dựa theo vai trò tài khoản được phân quyền
      if (role === 'ROLE_ADMIN') {
        navigate('/management/admin/dashboard');
      } else if (role === 'ROLE_AUTHOR') {
        navigate('/management/author/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError('Tài khoản hoặc mật khẩu không chính xác!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>
          Manga<span style={styles.logoHighlight}>Blade</span>
        </h1>
        
        <h2 style={styles.subtitle}>
          {isManagementRoute ? '🔑 CỔNG QUẢN LÝ SYSTEM' : '👋 CHÀO MỪNG ĐỘC GIẢ'}
        </h2>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username hoặc Email</label>
            <input
              type="text"
              placeholder="Nhập tài khoản của bạn..."
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitBtn,
              backgroundColor: isManagementRoute ? '#2eb85c' : '#e50914',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập Hệ Thống'}
          </button>
        </form>

        <div style={styles.footerText}>
          {isManagementRoute ? 'Khu vực bảo mật nội bộ phục vụ điều hành.' : 'Trải nghiệm thế giới truyện tranh bản quyền đỉnh cao.'}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#141414',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#1f1f1f',
    padding: '40px 30px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    border: '1px solid #2d2d2d',
    boxSizing: 'border-box',
  },
  logo: {
    textAlign: 'center',
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#ffffff',
  },
  logoHighlight: {
    color: '#e50914',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#aaaaaa',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    color: '#cccccc',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#2b2b2b',
    border: '1px solid #3d3d3d',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  errorAlert: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    border: '1px solid #e50914',
    color: '#ff4d4d',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666666',
    marginTop: '30px',
    lineHeight: '1.5',
  },
};

export default Login;