import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthorDashboardLayout } from './AuthorDashboardLayout';
import { authorMangaApi } from '../../api/authorMangaApi';
import { getCategories } from '../../api/mangaApi';
import type { CategoryResponse } from '../../types/manga';
import { UploadCloud, ArrowLeft, Save } from 'lucide-react';
import styles from './AuthorDashboard.module.css';

interface AuthorMangaCreateProps {
  standalone?: boolean;
}

export const AuthorMangaCreate: React.FC<AuthorMangaCreateProps> = ({ standalone = false }) => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [originName, setOriginName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Đang tiến hành');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success && res.payload) {
          setCategories(res.payload);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCats();
  }, []);

  const handleCategoryToggle = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    if (standalone) {
      setSearchParams({ tab: 'author-manga' });
    } else {
      navigate('/author/manga');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Vui lòng nhập tên truyện!");
      return;
    }
    if (selectedCategories.length === 0) {
      alert("Vui lòng chọn ít nhất 1 thể loại!");
      return;
    }

    setLoading(true);
    try {
      // 1. Create manga draft
      const mangaRes = await authorMangaApi.createManga({
        title,
        originName: originName.trim() || undefined,
        description: description.trim() || undefined,
        status,
        categoryIds: selectedCategories
      });

      if (mangaRes.success && mangaRes.payload) {
        const identifier = mangaRes.payload.slug || mangaRes.payload.id;

        // 2. Upload cover if selected
        if (coverFile) {
          await authorMangaApi.uploadCover(identifier, coverFile);
        }

        alert("Tạo truyện mới thành công! Truyện hiện đang ở trạng thái Bản nháp.");
        handleCancel();
      } else {
        alert(mangaRes.message || "Tạo truyện thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi tạo truyện!");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      <div className={styles.pageTitleSection}>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle}>Đăng truyện mới</h2>
          <p className={styles.pageSubtitle}>Điền đầy đủ thông tin bên dưới để tạo một tác phẩm truyện tranh mới.</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ backgroundColor: '#4f46e5', color: '#ffffff' }} onClick={handleCancel}>
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
        <div className={styles.formGrid2}>
          {/* Left Column: Cover Upload & Basic Fields */}
          <div style={{ display: 'grid', gap: '20px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tên truyện *</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Ví dụ: Anh Hùng Trở Lại"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tên khác (nếu có)</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Ví dụ: The Hero Returns"
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Trạng thái truyện *</label>
              <select
                className={styles.formSelect}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Đang tiến hành">Đang tiến hành</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Tạm ngưng">Tạm ngưng</option>
              </select>
            </div>
          </div>

          {/* Right Column: Cover Preview Area */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ảnh bìa truyện</label>
            <div
              className={styles.uploadZone}
              onClick={() => document.getElementById('cover-file-input')?.click()}
              style={{ height: 'calc(100% - 30px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
            >
              <input
                id="cover-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {coverPreview ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', maxHeight: '200px', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    style={{ maxHeight: '200px', borderRadius: 'var(--border-radius-sm)', objectFit: 'contain' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    Nhấn để đổi ảnh
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className={styles.uploadZoneIcon} />
                  <div className={styles.uploadZoneText}>Kéo thả hoặc nhấp để tải lên ảnh bìa</div>
                  <div className={styles.uploadZoneSubtext}>Hỗ trợ JPG, PNG. Tỷ lệ tối ưu 3:4</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Mô tả / Tóm tắt truyện</label>
          <textarea
            className={styles.formTextarea}
            placeholder="Mô tả nội dung cốt truyện, giới thiệu nhân vật..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Thể loại truyện * (Chọn ít nhất 1)</label>
          <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <label key={cat.id} className={styles.categoryCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleCancel}
            disabled={loading}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={loading}
          >
            <Save size={16} /> {loading ? "Đang lưu..." : "Lưu truyện mới"}
          </button>
        </div>
      </form>
    </>
  );

  if (standalone) {
    return content;
  }

  return (
    <AuthorDashboardLayout activeTab="manga-create">
      {content}
    </AuthorDashboardLayout>
  );
};
