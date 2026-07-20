import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthorDashboardLayout } from './AuthorDashboardLayout';
import { authorMangaApi } from '../../api/authorMangaApi';
import { ArrowLeft, UploadCloud, Save, Trash2, CheckCircle } from 'lucide-react';
import styles from './AuthorDashboard.module.css';

interface LocalPageFile {
  file: File;
  previewUrl: string;
}

interface AuthorChapterUploadProps {
  standalone?: boolean;
}

export const AuthorChapterUpload: React.FC<AuthorChapterUploadProps> = ({ standalone = false }) => {
  const navigate = useNavigate();
  const { mangaId, chapterId } = useParams<{ mangaId: string; chapterId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const mId = standalone ? Number(searchParams.get('mangaId')) : Number(mangaId);
  const cId = standalone ? Number(searchParams.get('chapterId')) : Number(chapterId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chapterNumber, setChapterNumber] = useState('');
  const [mangaTitle, setMangaTitle] = useState('');

  // Existing uploaded pages
  const [existingPages, setExistingPages] = useState<{ id: number; pageNumber: number; imageUrl: string }[]>([]);

  // Newly selected local files
  const [newFiles, setNewFiles] = useState<LocalPageFile[]>([]);

  const fetchData = async () => {
    if (!mId || !cId) return;
    setLoading(true);
    try {
      // Get manga detail
      const mangaRes = await authorMangaApi.getMangaDetail(mId);
      if (mangaRes.success && mangaRes.payload) {
        setMangaTitle(mangaRes.payload.title);
      }

      // Get chapter detail
      const chapterRes = await authorMangaApi.getChapters(mId);
      if (chapterRes.success && chapterRes.payload) {
        const currentChapter = chapterRes.payload.content.find((ch) => ch.id === cId);
        if (currentChapter) {
          setChapterNumber(currentChapter.chapterNumber);
        }
      }

      // Get existing page URLs
      const pagesRes = await authorMangaApi.getChapterPages(cId);
      if (pagesRes.success && pagesRes.payload) {
        setExistingPages(pagesRes.payload.sort((a, b) => a.pageNumber - b.pageNumber));
      }
    } catch (err) {
      console.error("Error loading chapter pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mId, cId]);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const newPageFiles = selected.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setNewFiles((prev) => [...prev, ...newPageFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const dropped = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
      const newPageFiles = dropped.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setNewFiles((prev) => [...prev, ...newPageFiles]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => {
      const itemToRemove = prev[index];
      URL.revokeObjectURL(itemToRemove.previewUrl);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleCancel = () => {
    if (standalone) {
      setSearchParams({ tab: 'author-chapters', mangaId: String(mId) });
    } else {
      navigate(`/author/manga/${mId}/chapters`);
    }
  };

  const handleSave = async () => {
    if (newFiles.length === 0 && existingPages.length === 0) {
      alert("Chương truyện phải chứa ít nhất 1 trang ảnh!");
      return;
    }

    setSaving(true);
    try {
      // Upload new files
      const filesToUpload = newFiles.map((nf) => nf.file);
      const res = await authorMangaApi.uploadChapterPages(cId, filesToUpload);
      if (res.success) {
        alert("Lưu và upload trang ảnh thành công!");
        setNewFiles([]);
        fetchData();
      } else {
        alert(res.message || "Upload trang ảnh thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi upload trang ảnh!");
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <>
      <div className={styles.pageTitleSection}>
        <div className={styles.titleArea}>
          <h2 className={styles.pageTitle}>Upload trang ảnh chương</h2>
          <p className={styles.pageSubtitle}>
            Truyện: <strong style={{ color: 'var(--color-text-main)' }}>{mangaTitle}</strong> &gt; Chương: <strong>{chapterNumber}</strong>
          </p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ backgroundColor: '#4f46e5', color: '#ffffff' }} onClick={handleCancel}>
          <ArrowLeft size={16} /> Quay lại chương
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
          Đang tải dữ liệu trang ảnh...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '28px' }}>
          {/* Drag & Drop Upload Zone */}
          <div
            className={styles.uploadZone}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pages-input')?.click()}
          >
            <input
              id="pages-input"
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFilesSelect}
            />
            <UploadCloud className={styles.uploadZoneIcon} />
            <div className={styles.uploadZoneText}>Kéo thả nhiều tệp ảnh vào đây hoặc click để chọn</div>
            <div className={styles.uploadZoneSubtext}>Hỗ trợ định dạng JPG, PNG, WEBP. Ảnh tự động sắp xếp theo tên file.</div>
          </div>

          {/* New Selected Pages Preview */}
          {newFiles.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                  Ảnh mới chuẩn bị upload ({newFiles.length} trang)
                </h4>
                <button
                  onClick={handleSave}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? "Đang upload..." : "Bắt đầu upload"}
                </button>
              </div>
              <div className={styles.chapterPagesGrid}>
                {newFiles.map((nf, index) => (
                  <div key={`new-${index}`} className={styles.chapterPageCard}>
                    <img src={nf.previewUrl} alt={`New page ${index + 1}`} className={styles.chapterPageImg} />
                    <button
                      className={styles.btnRemovePage}
                      onClick={() => removeNewFile(index)}
                      title="Hủy trang này"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className={styles.chapterPageFooter}>Trang {existingPages.length + index + 1} (Mới)</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Uploaded Pages */}
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>
              Trang ảnh hiện tại của chương ({existingPages.length} trang)
            </h4>
            {existingPages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--color-text-muted)'
              }}>
                Chưa có trang ảnh nào trong chương này.
              </div>
            ) : (
              <div className={styles.chapterPagesGrid}>
                {existingPages.map((page, index) => (
                  <div key={page.id} className={styles.chapterPageCard}>
                    <img src={page.imageUrl} alt={`Uploaded page ${index + 1}`} className={styles.chapterPageImg} />
                    <div className={styles.chapterPageFooter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--color-green)' }}>
                      <CheckCircle size={10} /> Trang {page.pageNumber}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
