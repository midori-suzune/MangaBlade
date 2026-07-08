import styles from "./Category.module.css";
import { Link } from "react-router-dom";
import { mockComics, categoriesList } from "../../mockData";

export function Category() {
    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftMain}>
                <h1 className={styles.pageTitle}>Tất cả thể loại truyện tranh</h1>
                
                <div className={styles.categoryDescBox}>
                    Thể loại phiêu lưu, mạo hiểm, thường là hành trình của các nhân vật
                </div>

                <div className={styles.comicGrid}>
                    {mockComics.slice(0, 15).map((manga) => (
                        <article className={styles.comicCard} key={manga.id}>
                            <Link to="#" className={styles.comicCover} aria-label={manga.title}>
                                <span className={styles.comicTag}>{manga.time}</span>
                                {manga.hot && <span className={`${styles.comicTag} ${styles.hot}`}>Hot</span>}
                                <span className={styles.coverText}>Ảnh Bìa</span>
                            </Link>
                            <div className={styles.comicInfo}>
                                <Link to="#" className={styles.comicTitle}>{manga.title}</Link>
                                <Link to="#" className={styles.comicChapter}>{manga.chapter}</Link>
                            </div>
                        </article>
                    ))}
                </div>

                <nav className={styles.pagination} aria-label="Phân trang thể loại">
                    {["«", "‹", "1", "2", "3", "4", "5", "›", "»"].map((page) => (
                        <Link to="#" className={`${styles.pageLink} ${page === "1" ? styles.active : ""}`} key={page}>
                            {page}
                        </Link>
                    ))}
                </nav>
            </div>

            <aside className={styles.rightSidebar}>
                <div className={styles.sidebarFilter}>
                    <h2 className={styles.sidebarTitle}>Bộ lọc truyện</h2>
                    
                    <div className={styles.filterBlock}>
                        <label className={styles.filterLabel}>Tên tác giả</label>
                        <input type="text" className={styles.filterInput} placeholder="Nhập tên tác giả..." />
                    </div>

                    <div className={styles.filterBlock}>
                        <label className={styles.filterLabel}>Thể loại</label>
                        <select className={styles.filterSelect} defaultValue="Adventure">
                            <option value="all">Tất cả</option>
                            {categoriesList.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterBlock}>
                        <label className={styles.filterLabel}>Trạng thái</label>
                        <select className={styles.filterSelect} defaultValue="completed">
                            <option value="all">Tất cả</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="ongoing">Đang tiến hành</option>
                        </select>
                    </div>

                    <div className={styles.filterBlock}>
                        <label className={styles.filterLabel}>Sắp xếp theo</label>
                        <select className={styles.filterSelect} defaultValue="updated">
                            <option value="updated">Ngày cập nhật</option>
                            <option value="new">Truyện mới</option>
                            <option value="top_all">Top tất cả</option>
                            <option value="top_month">Top tháng</option>
                            <option value="top_week">Top tuần</option>
                            <option value="top_day">Top ngày</option>
                            <option value="follow">Theo dõi</option>
                            <option value="comments">Bình luận</option>
                            <option value="chapters">Số chapter</option>
                            <option value="top_follow">Top theo dõi</option>
                        </select>
                    </div>

                    <button className={styles.applyFilterBtn}>Áp dụng</button>
                </div>
            </aside>
        </div>
    );
}
