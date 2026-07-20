import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthorDashboardLayout } from './AuthorDashboardLayout';
import { authorMangaApi } from '../../api/authorMangaApi';
import { getCategories } from '../../api/mangaApi';
import type { CategoryResponse } from '../../types/manga';
import { UploadCloud, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import styles from './AuthorDashboard.module.css';

interface AuthorMangaEditProps {
  standalone?: boolean;
}

export const AuthorMangaEdit: React.FC<AuthorMangaEditProps> = ({ standalone = false }) => {
  const navigate = useNavigate();
  const { mangaId } = useParams<{ mangaId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const id = standalone ? Number(searchParams.get('mangaId')) : Number(mangaId);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [originName, setOriginName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Đang tiến hành');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Fetch Categories
        const catRes = await getCategories();
        if (catRes.success && catRes.payload) {
          setCategories(catRes.payload);
        }

        // Fetch Manga Detail
        const mangaRes = await authorMangaApi.getMangaDetail(id);
        if (mangaRes.success && mangaRes.payload) {
          const manga = mangaRes.payload;
          setTitle(manga.title);
          setOriginName(manga.originName || '');
          setDescription(manga.description || '');
          setStatus(manga.status);
          setApprovalStatus(manga.approvalStatus);
          setRejectionReason(manga.rejectionReason);
          setSelectedCategories(manga.categories.map((c) => c.id));
          if (manga.localCoverUrl || manga.thumbUrl) {
            setCoverPreview(manga.localCoverUrl || manga.thumbUrl);
          }
        }
      } catch (err) {
        console.error("Error loading manga edit data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCategoryToggle = (catId: number) => {
    if (approvalStatus === 'PENDING') return;
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((item) => item !== catId) : [...prev, catId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (approvalStatus === 'PENDING') return;
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
    if (approvalStatus === 'PENDING') return;
    if (!title.trim()) {
      alert("Vui lòng nhập tên truyện!");
      return;
    }
    if (selectedCategories.length === 0) {
      alert("Vui lòng chọn ít nhất 1 thể loại!");
      return;
    }

    setSaving(true);
    try {
      // 1. Update basic information
      const updateRes = await authorMangaApi.updateManga(id, {
        title,
        originName: originName.trim() || undefined,
        description: description.trim() || undefined,
        status,
        categoryIds: selectedCategories
      });

      if (updateRes.success) {
        // 2. Upload cover if a new file was chosen
        if (coverFile) {
          await authorMangaApi.uploadCover(id, coverFile);
        }
        alert("Cập nhật thông tin truyện thành công!");
        handleCancel();
      } else {
        alert(updateRes.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật thông tin truyện!");
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <>
      <div className={styles.pageTitleSection}>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle}>Chỉnh sửa truyện</h2>
          <p className={styles.pageSubtitle}>Cập nhật thông tin cho tác phẩm của bạn.</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ backgroundColor: '#4f46e5', color: '#ffffff' }} onClick={handleCancel}>
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
          Đang tải dữ liệu truyện...
        </div>
      ) : (
        <>
          {approvalStatus === 'REJECTED' && rejectionReason && (
            <div style={{
              display: 'flex',
              gap: '12px',
              backgroundColor: 'var(--color-red-bg)',
              border: '1px solid var(--color-red)',
              borderRadius: 'var(--border-radius-md)',
              padding: '16px',
              color: 'var(--color-red)',
              marginBottom: '24px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Tác phẩm bị từ chối kiểm duyệt</strong>
                <span>Lý do từ chối của Admin: <strong>{rejectionReason}</strong></span>
                <span style={{ display: 'block', marginTop: '6px', fontSize: '13px' }}>Vui lòng chỉnh sửa lại các thông tin chưa hợp lý và gửi duyệt lại.</span>
              </div>
            </div>
          )}

          {approvalStatus === 'PENDING' && (
            <div style={{
              display: 'flex',
              gap: '12px',
              backgroundColor: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent)',
              borderRadius: 'var(--border-radius-md)',
              padding: '16px',
              color: 'var(--color-accent)',
              marginBottom: '24px',
              alignItems: 'center'
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Truyện đang chờ kiểm duyệt</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Bạn không thể chỉnh sửa thông tin trong lúc tác phẩm đang đợi Admin xét duyệt.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
            <div className={styles.formGrid2}>
              {/* Left Column */}
              <div style={{ display: 'grid', gap: '20px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên truyện *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={approvalStatus === 'PENDING'}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên khác</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={originName}
                    onChange={(e) => setOriginName(e.target.value)}
                    disabled={approvalStatus === 'PENDING'}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trạng thái truyện *</label>
                  <select
                    className={styles.formSelect}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={approvalStatus === 'PENDING'}
                  >
                    <option value="Đang tiến hành">Đang tiến hành</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Tạm ngưng">Tạm ngưng</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ảnh bìa truyện</label>
                <div
                  className={styles.uploadZone}
                  onClick={() => approvalStatus !== 'PENDING' && document.getElementById('cover-file-input')?.click()}
                  style={{
                    height: 'calc(100% - 30px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: approvalStatus === 'PENDING' ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    id="cover-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={approvalStatus === 'PENDING'}
                  />
                  {coverPreview ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', maxHeight: '200px', display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        style={{ maxHeight: '200px', borderRadius: 'var(--border-radius-sm)', objectFit: 'contain' }}
                      />
                      {approvalStatus !== 'PENDING' && (
                        <div style={{ position: 'absolute', bottom: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          Nhấn để đổi ảnh
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <UploadCloud className={styles.uploadZoneIcon} />
                      <div className={styles.uploadZoneText}>Nhấp để tải lên ảnh bìa</div>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={approvalStatus === 'PENDING'}
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
                      disabled={approvalStatus === 'PENDING'}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {approvalStatus !== 'PENDING' && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </>
  );

  if (standalone) {
    return content;
  }

  return (
    <AuthorDashboardLayout activeTab="manga-list">
      {content}
    </AuthorDashboardLayout>
  );
};
