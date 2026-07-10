# MangaBlade - Design Tokens & Guidelines

Dưới đây là bộ thông số cơ bản (Design System) đang được sử dụng xuyên suốt cho các giao diện (Trang chủ & Trang chi tiết) của MangaBlade. Bạn có thể sử dụng các thông số này để code sang React/TailwindCSS hoặc các framework khác một cách đồng bộ.

## 1. Màu Sắc (Colors)

### 🎨 Màu Thương Hiệu (Brand/Primary)
- **Primary (Xanh Chàm):** `#6366f1` (Dùng cho logo, link hover, nút Đăng nhập/Gửi, phân trang active).
- **Primary Hover:** `#4f46e5` hoặc `#7c3aed`.

### 🌑 Màu Chữ (Typography Colors)
- **Text Primary (Tiêu đề, text chính):** `#1e293b` (Màu xám than đậm, rất sang và dễ đọc).
- **Text Secondary (Đoạn văn, mô tả):** `#475569` (Màu xám trung tính).
- **Text Muted (Ngày tháng, text phụ):** `#94a3b8` hoặc `#64748b` (Màu xám nhạt).

### 📐 Màu Nền & Viền (Background & Borders)
- **Nền trang Web (Body):** `#f4f6f8`
- **Nền Container/Card:** `#ffffff` (Trắng)
- **Nền Khối Phụ (Bong bóng chat, input):** `#f1f5f9` hoặc `#f8fafc`
- **Đường kẻ viền (Border/Divider):** `#e2e8f0` hoặc `#f1f5f9` (Giúp chia cắt layout rất nhẹ nhàng).

### 🚨 Màu Nút Hành Động (Action/Status Colors)
- **Nút Đọc truyện (Xanh lá):** `#84cc16` (Hover: `#65a30d`)
- **Nút Theo dõi / Tag Hot (Hồng/Đỏ):** `#fb7185` hoặc `#ef4444` (Hover: `#e11d48`)
- **Nút Thích (Tím):** `#c084fc` (Hover: `#9333ea`)
- **Nút Xem thêm (Cam):** `#f59e0b` (Hover: `#d97706`)

---

## 2. Typography (Kiểu Chữ)
- **Font Family:** `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` (hoặc có thể dùng `Inter` nếu tích hợp Google Fonts).
- **Kích thước cơ bản:** `14px` - `15px`.
- **Line-height:** `1.5` cho cảm giác đọc thoáng đãng.
- **Font-weight:** 
  - `400` (Bình thường)
  - `500`, `600` (Nhấn mạnh, tên tác giả, chương)
  - `700`, `800` (Tiêu đề chính, số thứ hạng)

---

## 3. Bố Cục & Layout (Spacing & Sizes)
- **Chiều rộng tối đa (Max-width):** `1300px` (Dành cho màn hình Desktop, giúp tận dụng không gian rộng rãi).
- **Khoảng cách 2 cột (Gap):** `24px` (Giữa `left-main` và `right-main`).
- **Tỉ lệ ảnh bìa truyện (Aspect Ratio):** `3:4`. Kích thước bìa trang chi tiết: `200x275px`.

### Bo góc (Border Radius)
- **Khối Container / Card truyện:** `12px` (Bo tròn hiện đại).
- **Nút bấm / Ảnh bìa / Input:** `4px` đến `8px`.
- **Avatar / Phân trang:** `50%` (Hình tròn hoàn hảo).

### Bóng đổ (Box Shadow)
- **Đổ bóng cơ bản (Container):** `0 1px 3px rgba(0,0,0,0.05)` (Giúp khối màu trắng nổi nhẹ lên nền xám).
- **Đổ bóng hiệu ứng nổi bật (Ảnh bìa chi tiết):** `0 4px 15px rgba(0,0,0,0.12)`.
