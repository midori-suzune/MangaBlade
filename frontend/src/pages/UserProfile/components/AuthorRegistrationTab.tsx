import { useState } from "react";
import { Feather, CheckCircle, Clock, BookOpen, BarChart3, MessageSquare } from "lucide-react";
import styles from "../UserProfile.module.css";

interface AuthorRegistrationTabProps {
  userRole: string;
}

export function AuthorRegistrationTab({ userRole }: AuthorRegistrationTabProps) {
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'pending' | 'submitted'>('idle');

  if (userRole === 'AUTHOR') {
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
          backgroundColor: 'var(--color-green-bg)',
          borderRadius: 'var(--border-radius-sm)',
          color: 'var(--color-green)',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          <CheckCircle size={20} />
          Vai trò hiện tại: Tác giả (Author)
        </div>
      </div>
    );
  }

  const handleSubmitApplication = async () => {
    setApplicationStatus('pending');
    setTimeout(() => {
      setApplicationStatus('submitted');
    }, 1000);
  };

  if (applicationStatus === 'submitted') {
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
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: '#fef3c7',
          borderRadius: 'var(--border-radius-sm)',
          color: '#92400e',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          <Clock size={20} />
          Trạng thái: Đang chờ duyệt
        </div>
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
          Điều kiện & Lưu ý
        </h3>
        <ul style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          lineHeight: 2,
          paddingLeft: '20px',
          margin: 0
        }}>
          <li>Truyện đăng tải cần tuân thủ quy định nội dung của MangaBlade.</li>
          <li>Mỗi truyện/chương sẽ được Admin kiểm duyệt trước khi hiển thị công khai.</li>
          <li>Nội dung vi phạm bản quyền hoặc không phù hợp sẽ bị từ chối.</li>
          <li>Tác giả có thể bị thu hồi quyền nếu vi phạm nghiêm trọng.</li>
        </ul>
      </div>

      <button
        className={styles.btnTask}
        disabled={applicationStatus === 'pending'}
        onClick={handleSubmitApplication}
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
          cursor: applicationStatus === 'pending' ? 'not-allowed' : 'pointer',
          opacity: applicationStatus === 'pending' ? 0.7 : 1,
          transition: 'opacity 0.2s ease'
        }}
      >
        {applicationStatus === 'pending' ? 'Đang gửi đơn...' : 'Gửi đơn đăng ký làm Tác giả'}
      </button>
    </div>
  );
}
