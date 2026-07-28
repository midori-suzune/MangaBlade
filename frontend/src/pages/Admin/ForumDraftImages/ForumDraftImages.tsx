import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Home,
  Eye,
  FileCheck,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Trash2,
  Users,
} from "lucide-react";

import {adminForumDraftImageApi} from "../../../api/adminForumDraftImageApi";
import type {AdminForumDraftImageItem} from "../../../api/adminForumDraftImageApi";
import type {SpringPageResponse} from "../../../types/user";
import {useAuthStore} from "../../../stores/authStore";
import styles from "../Admin.module.css";

type DraftAgeFilter = "1" | "24" | "168";

const draftAgeLabels: Record<DraftAgeFilter, string> = {
  "1": "Cũ hơn 1 giờ",
  "24": "Cũ hơn 24 giờ",
  "168": "Cũ hơn 7 ngày",
};

const DRAFT_IMAGE_PAGE_SIZE = 3;

const emptyDraftImagePage: SpringPageResponse<AdminForumDraftImageItem> = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  size: DRAFT_IMAGE_PAGE_SIZE,
  number: 0,
  first: true,
  last: true,
  empty: true,
};

function formatBytes(value: number) {
  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.round(value / 1024)} KB`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const ForumDraftImages: React.FC = () => {
  const navigate = useNavigate();
  const {displayName} = useAuthStore();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState<DraftAgeFilter>("24");
  const [imagePage, setImagePage] = useState<SpringPageResponse<AdminForumDraftImageItem>>(emptyDraftImagePage);
  const [totalSize, setTotalSize] = useState(0);
  const [page, setPage] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagedImages = imagePage.content;
  const totalPages = imagePage.totalPages;
  const currentPage = imagePage.number;
  const isAllSelected = pagedImages.length > 0 && pagedImages.every((image) => selectedIds.includes(image.id));
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const getErrorMessage = useCallback((fallback: string, err: unknown) => {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as {message?: string; error?: string} | undefined;
      return data?.message || data?.error || fallback;
    }
    return fallback;
  }, []);

  const loadDraftImages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminForumDraftImageApi.getDraftImages({
        olderThanHours: Number(ageFilter),
        search: search || undefined,
        page,
        size: DRAFT_IMAGE_PAGE_SIZE,
      });

      setImagePage(response.data.images);
      setTotalSize(response.data.totalSizeBytes);
    } catch (err) {
      setError(getErrorMessage("Không thể tải danh sách ảnh nháp.", err));
    } finally {
      setLoading(false);
    }
  }, [ageFilter, getErrorMessage, page, search]);

  useEffect(() => {
    Promise.resolve().then(() => loadDraftImages());
  }, [loadDraftImages]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput);
    setPage(0);
    setSelectedIds([]);
  }

  function toggleSelectionMode() {
    setSelectionMode((current) => {
      if (current) setSelectedIds([]);
      return !current;
    });
  }

  function toggleSelectImage(imageId: number) {
    setSelectedIds((current) => (
      current.includes(imageId)
        ? current.filter((id) => id !== imageId)
        : [...current, imageId]
    ));
  }

  function toggleSelectAll() {
    const pageIds = pagedImages.map((image) => image.id);
    setSelectedIds((current) => (
      isAllSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])]
    ));
  }

  async function deleteImages(ids: number[]) {
    if (ids.length === 0) return;
    if (!window.confirm(`Xoá ${ids.length} ảnh nháp chưa đăng?`)) return;

    setDeleting(true);
    setError(null);

    try {
      if (ids.length === 1) {
        await adminForumDraftImageApi.deleteDraftImage(ids[0]);
      } else {
        await adminForumDraftImageApi.deleteDraftImages(ids);
      }

      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      const deletedAllCurrentPage = pagedImages.length > 0 && pagedImages.every((image) => ids.includes(image.id));
      if (deletedAllCurrentPage && currentPage > 0) {
        setPage(currentPage - 1);
      } else {
        await loadDraftImages();
      }
    } catch (err) {
      setError(getErrorMessage("Không thể xóa ảnh nháp.", err));
    } finally {
      setDeleting(false);
    }
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    setSelectedIds([]);
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminShell}>
        <section className={styles.adminPanel}>
          <nav className={styles.adminNav}>
            <div className={styles.sidebarHeader}>
              <span className={styles.brandText}>Manga<span>Blade</span></span>
            </div>
            <button className={styles.adminNavItem} onClick={() => navigate("/admin/dashboard")}>
              <BarChart3 size={16} /> Dashboard
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate("/admin/users")}>
              <Users size={16} /> Quản lý User
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate("/admin/manga")}>
              <BookOpen size={16} /> Quản lý Truyện
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate("/admin/content-moderation")}>
              <FileCheck size={16} /> Kiểm duyệt nội dung
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate("/admin/chapter-reports")}>
              <AlertTriangle size={16} /> Báo cáo lỗi chương
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate("/admin/comment-reports")}>
              <MessageSquare size={16} /> Báo cáo bình luận
            </button>
            <button className={`${styles.adminNavItem} ${styles.active}`} onClick={() => navigate("/admin/forum-draft-images")}>
              <ImageIcon size={16} /> Dọn Ảnh
            </button>
            <button className={styles.adminNavItem} onClick={() => navigate("/admin/author-requests")}>
              <FileText size={16} /> Đơn đăng ký Tác giả
            </button>
          </nav>

          <main className={styles.adminContent}>
            <div className={styles.pageTitleSection}>
              <div>
                <h2 className={styles.pageTitle}>Dọn ảnh nháp</h2>
              </div>
              <button className={styles.adminUserChip} type="button" aria-label="Về trang chủ" onClick={() => navigate("/")}>
                <span className={styles.adminAvatar}>{(displayName || "A").charAt(0).toUpperCase()}</span>
                <span className={styles.adminUserMeta}>
                  <span className={styles.adminUserName}>{displayName || "Admin"}</span>
                  <span className={styles.adminUserRole}>Super Admin</span>
                </span>
                <Home size={16} className={styles.chipIcon} />
              </button>
            </div>

            <section className={styles.moderationSummaryGrid}>
              <article>
                <span>Ảnh nháp</span>
                <strong>{imagePage.totalElements}</strong>
              </article>
              <article>
                <span>Dung lượng nháp</span>
                <strong>{formatBytes(totalSize)}</strong>
              </article>
              <article>
                <span>Tiêu chí dọn</span>
                <strong>{draftAgeLabels[ageFilter]}</strong>
              </article>
            </section>

            <div className={styles.tableToolbar}>
              <div className={styles.tableToolbarLeft}>
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                  <input
                    type="text"
                    placeholder="Tìm user, objectKey hoặc URL"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className={`${styles.formInput} ${styles.searchInput}`}
                  />
                </form>
                <select
                  value={ageFilter}
                  onChange={(event) => {
                    setAgeFilter(event.target.value as DraftAgeFilter);
                    setPage(0);
                    setSelectedIds([]);
                  }}
                  className={`${styles.formInput} ${styles.authorStatusSelect}`}
                >
                  <option value="1">Cũ hơn 1 giờ</option>
                  <option value="24">Cũ hơn 24 giờ</option>
                  <option value="168">Cũ hơn 7 ngày</option>
                </select>
              </div>

              <div className={styles.tableToolbarActions}>
                {selectionMode && selectedIds.length > 0 && (
                  <button
                    className={styles.btnDangerOutline}
                    type="button"
                    onClick={() => deleteImages(selectedIds)}
                    disabled={deleting}
                  >
                    <Trash2 size={15} /> <span>Delete</span>
                  </button>
                )}
                <button className={styles.btnPrimary} type="button" onClick={toggleSelectionMode} disabled={deleting}>
                  <Trash2 size={15} /> <span>{selectionMode ? "Cancel" : "Remove"}</span>
                </button>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={`${styles.userTablePanel} ${styles.mangaTablePanel}`}>
              <div className={styles.tableFrame}>
                <table className={`${styles.historyTable} ${styles.draftImageTable}`}>
                  <thead>
                    <tr>
                      {selectionMode && (
                        <th className={styles.checkboxColumn}>
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                            aria-label="Chọn tất cả ảnh nháp"
                          />
                        </th>
                      )}
                      <th className={styles.idColumn}>ID</th>
                      <th className={styles.draftPreviewColumn}>Preview</th>
                      <th className={styles.usernameColumn}>Uploader</th>
                      <th>Object key</th>
                      <th className={styles.roleColumn}>Dung lượng</th>
                      <th className={styles.roleColumn}>Mime</th>
                      <th className={styles.dateColumn}>Uploaded At</th>
                      <th className={styles.actionColumn}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={selectionMode ? 9 : 8} className={styles.emptyCell}>
                          Đang tải ảnh nháp...
                        </td>
                      </tr>
                    ) : pagedImages.length === 0 ? (
                      <tr>
                        <td colSpan={selectionMode ? 9 : 8} className={styles.emptyCell}>
                          Không có ảnh nháp phù hợp tiêu chí hiện tại.
                        </td>
                      </tr>
                    ) : (
                      pagedImages.map((image) => (
                        <tr key={image.id}>
                          {selectionMode && (
                            <td className={styles.checkboxColumn}>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(image.id)}
                                onChange={() => toggleSelectImage(image.id)}
                                aria-label={`Chọn ảnh ${image.id}`}
                              />
                            </td>
                          )}
                          <td className={styles.idCell}>{image.id}</td>
                          <td>
                            <img src={image.url} alt="" className={styles.draftImageThumb} />
                          </td>
                          <td>
                            <span className={styles.userName}>{image.username}</span>
                            <span className={styles.userEmail}>user #{image.userId}</span>
                          </td>
                          <td className={styles.truncateCell}>{image.objectKey}</td>
                          <td>{formatBytes(image.fileSize)}</td>
                          <td>{image.mimeType}</td>
                          <td>{formatDate(image.createdAt)}</td>
                          <td>
                            <div className={styles.iconActions}>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => window.open(image.url, "_blank", "noopener,noreferrer")}
                                aria-label="Xem ảnh"
                              >
                                <Eye size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.btnPage}
                    disabled={!canGoPrevious}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Trước
                  </button>
                  <span className={styles.pageCount}>
                    {currentPage + 1}/{totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.btnPage}
                    disabled={!canGoNext}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </main>
        </section>
      </div>
    </div>
  );
};
