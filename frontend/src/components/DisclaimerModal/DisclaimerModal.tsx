import { useEffect, useState } from "react";
import phoenixWrightGif from "../../assets/face_troll/71-PhoenixWright.gif";
import truotTuyetGif from "../../assets/gif_anime/truottuyet.gif";
import useMyBrainGif from "../../assets/gif_anime/usemybrain.gif";
import styles from "./DisclaimerModal.module.css";

export function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(window.location.pathname === "/");
  }, []);

  function acceptDisclaimer() {
    setIsOpen(false);
  }

  if (!isOpen) {
    return null;
  }

  return (
      <div className={styles.overlay} role="presentation">
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
          <div className={styles.heading}>
            <div className={styles.headingMedia} aria-hidden="true">
              <img src={phoenixWrightGif} alt="" />
            </div>
            <div className={styles.titleStack}>
              <h2 id="disclaimer-title" className={styles.title}>Miễn trừ trách nhiệm</h2>
              <div className={styles.topMedia} aria-hidden="true">
                <img src={truotTuyetGif} alt="" />
              </div>
            </div>
            <div className={`${styles.headingMedia} ${styles.rightMedia}`} aria-hidden="true">
              <img src={useMyBrainGif} alt="" />
            </div>
          </div>

          <div className={styles.content}>
            <p>
              Website này là nền tảng tổng hợp và giới thiệu các nội dung truyện tranh, manga, manhwa và tiểu thuyết từ nhiều nguồn công khai trên Internet. Toàn bộ nội dung trên website được chia sẻ với mục đích phi thương mại, phục vụ nhu cầu giải trí và tham khảo của người dùng.
            </p>
            <p>
              Chúng tôi không trực tiếp sáng tác, xuất bản hoặc sở hữu bản quyền đối với các nội dung truyện được hiển thị. Tất cả bản quyền, hình ảnh, nội dung và các yếu tố liên quan thuộc về tác giả hoặc đơn vị phát hành tương ứng.
            </p>
            <p>
              Trong trường hợp bạn là chủ sở hữu bản quyền và nhận thấy nội dung của mình xuất hiện trên website mà chưa được sự cho phép, vui lòng liên hệ với chúng tôi để yêu cầu kiểm tra và xử lý. Chúng tôi cam kết sẽ hợp tác và gỡ bỏ nội dung vi phạm (nếu có) trong thời gian sớm nhất.
            </p>
            <p>
              Website không chịu trách nhiệm đối với tính chính xác, đầy đủ hoặc hợp pháp của nội dung được cung cấp từ bên thứ ba. Người dùng tự chịu trách nhiệm khi truy cập và sử dụng nội dung trên trang.
            </p>
            <p>
              Website có thể chứa các liên kết đến bên thứ ba hoặc nội dung được nhúng từ các nguồn bên ngoài. Chúng tôi không kiểm soát và không chịu trách nhiệm đối với nội dung, chính sách hoặc tính bảo mật của các nguồn này.
            </p>
          </div>

          <button type="button" className={styles.acceptBtn} onClick={acceptDisclaimer}>
            Tôi đã hiểu
          </button>
        </div>
      </div>
  );
}
