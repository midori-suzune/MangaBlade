DROP DATABASE IF EXISTS MangaBlade;

CREATE DATABASE IF NOT EXISTS MangaBlade
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE MangaBlade;

CREATE TABLE titles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    required_level INT NOT NULL,
    color_code VARCHAR(20) DEFAULT '#6b7280',
    PRIMARY KEY (id)
);

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    password_hash VARCHAR(255),
    avatar_url VARCHAR(1000),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    level INT NOT NULL DEFAULT 0,
    exp INT NOT NULL DEFAULT 0,
    active_title_id BIGINT,
    auth_provider VARCHAR(10) NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    email_verified_at DATETIME(3),
    password_changed_at DATETIME(3),
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_username (username),
    CONSTRAINT chk_users_role CHECK (role IN ('USER', 'AUTHOR', 'ADMIN')),
    CONSTRAINT chk_users_auth_provider CHECK (auth_provider IN ('LOCAL', 'GOOGLE')),
    CONSTRAINT fk_users_active_title FOREIGN KEY (active_title_id) REFERENCES titles(id)
);

CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    target_type VARCHAR(50),
    target_id BIGINT,
    read_at DATETIME(3),
    created_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE email_verification_token (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    used_at DATETIME(3),
    created_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_email_verification_token_hash (token_hash),
    CONSTRAINT fk_email_verification_token_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE password_reset_token (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    used_at DATETIME(3),
    created_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_password_reset_token_hash (token_hash),
    CONSTRAINT fk_password_reset_token_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE author_requests (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    pen_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    social_link VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reject_reason VARCHAR(500),
    created_at DATETIME(3) NOT NULL,
    reviewed_at DATETIME(3),
    reviewed_by BIGINT,

    PRIMARY KEY (id),
    CONSTRAINT fk_author_requests_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_author_requests_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT chk_author_requests_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE TABLE author (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_author_name (name)
);

CREATE TABLE category (
    id BIGINT NOT NULL AUTO_INCREMENT,
    otruyen_category_id CHAR(24) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_category_otruyen_id (otruyen_category_id),
    UNIQUE KEY uq_category_slug (slug)
);

CREATE TABLE manga (
    id BIGINT NOT NULL AUTO_INCREMENT,
    otruyen_manga_id CHAR(24),
    owner_user_id BIGINT,
    metadata_source VARCHAR(20) NOT NULL DEFAULT 'OTRUYEN',
    chapter_page_source VARCHAR(20) NOT NULL DEFAULT 'TRUYENQQ',
    slug VARCHAR(550) NOT NULL,
    title VARCHAR(500) NOT NULL,
    origin_name VARCHAR(500),
    description TEXT,
    cloudinary_folder_slug VARCHAR(550),
    status VARCHAR(30) NOT NULL,
    thumb_url VARCHAR(500),
    local_cover_url VARCHAR(1000),
    hidden_reason VARCHAR(1000) NULL,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    submitted_at DATETIME(3),
    reviewed_at DATETIME(3),
    reviewed_by BIGINT,
    rejection_reason VARCHAR(1000),
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    deleted_at DATETIME(3),
    deleted_by BIGINT,

    PRIMARY KEY (id),
    UNIQUE KEY uq_manga_otruyen_id (otruyen_manga_id),
    UNIQUE KEY uq_manga_slug (slug),
    CONSTRAINT fk_manga_owner FOREIGN KEY (owner_user_id) REFERENCES users(id),
    CONSTRAINT fk_manga_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT fk_manga_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
    CONSTRAINT chk_manga_metadata_source CHECK (metadata_source IN ('OTRUYEN', 'LOCAL')),
    CONSTRAINT chk_manga_chapter_page_source CHECK (chapter_page_source IN ('TRUYENQQ', 'LOCAL_UPLOAD')),
    CONSTRAINT chk_manga_approval_status CHECK (approval_status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'))
);

CREATE TABLE manga_author (
    manga_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,

    PRIMARY KEY (manga_id, author_id),
    CONSTRAINT fk_manga_author_manga FOREIGN KEY (manga_id) REFERENCES manga(id),
    CONSTRAINT fk_manga_author_author FOREIGN KEY (author_id) REFERENCES author(id)
);

CREATE TABLE manga_category (
    manga_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,

    PRIMARY KEY (manga_id, category_id),
    CONSTRAINT fk_manga_category_manga FOREIGN KEY (manga_id) REFERENCES manga(id),
    CONSTRAINT fk_manga_category_category FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE chapter (
    id BIGINT NOT NULL AUTO_INCREMENT,
    manga_id BIGINT NOT NULL,
    title VARCHAR(500),
    chapter_number VARCHAR(30),
    chapter_sort DECIMAL(10, 3),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    submitted_at DATETIME(3),
    reviewed_at DATETIME(3),
    reviewed_by BIGINT,
    rejection_reason VARCHAR(1000),
    created_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_chapter_id_manga (id, manga_id),
    CONSTRAINT fk_chapter_manga FOREIGN KEY (manga_id) REFERENCES manga(id),
    CONSTRAINT fk_chapter_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT chk_chapter_approval_status CHECK (approval_status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'))
);

CREATE TABLE chapter_page (
    id BIGINT NOT NULL AUTO_INCREMENT,
    chapter_id BIGINT NOT NULL,
    page_number INT NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    created_at DATETIME(3) NOT NULL,
    cloudinary_public_id VARCHAR(550) NULL,
    image_provider VARCHAR(30) NOT NULL DEFAULT 'CLOUDINARY',

    PRIMARY KEY (id),
    UNIQUE KEY uq_chapter_page_number (chapter_id, page_number),
    CONSTRAINT fk_chapter_page_chapter FOREIGN KEY (chapter_id) REFERENCES chapter(id),
    CONSTRAINT chk_chapter_page_number CHECK (page_number > 0)
);

CREATE TABLE favorite (
    user_id BIGINT NOT NULL,
    manga_id BIGINT NOT NULL,
    created_at DATETIME(3) NOT NULL,
    last_seen_chapter_number VARCHAR(30) NULL,
    PRIMARY KEY (user_id, manga_id),
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_favorite_manga FOREIGN KEY (manga_id) REFERENCES manga(id)
);

CREATE TABLE reading_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    manga_id BIGINT NOT NULL,
    chapter_id BIGINT NOT NULL,
    page_index INT NOT NULL DEFAULT 0,
    last_read_at DATETIME(3) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reading_history_user_chapter (user_id, chapter_id),
    CONSTRAINT fk_reading_history_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_reading_history_manga FOREIGN KEY (manga_id) REFERENCES manga(id),
    CONSTRAINT fk_reading_history_chapter_manga FOREIGN KEY (chapter_id, manga_id) REFERENCES chapter(id, manga_id)
);

CREATE TABLE chapter_reports (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    manga_id BIGINT NOT NULL,
    chapter_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    screenshot_url VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reject_reason VARCHAR(1000),
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    reviewed_at DATETIME(3),
    reviewed_by BIGINT,

    PRIMARY KEY (id),
    CONSTRAINT fk_chapter_reports_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_chapter_reports_manga FOREIGN KEY (manga_id) REFERENCES manga(id),
    CONSTRAINT fk_chapter_reports_chapter FOREIGN KEY (chapter_id) REFERENCES chapter(id),
    CONSTRAINT fk_chapter_reports_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT chk_chapter_reports_type CHECK (type IN ('IMAGE_BROKEN', 'MISSING_PAGE', 'WRONG_ORDER', 'DUPLICATE_CHAPTER', 'WRONG_CONTENT')),
    CONSTRAINT chk_chapter_reports_status CHECK (status IN ('PENDING', 'CHECKING', 'RESOLVED', 'REJECTED'))
);

CREATE TABLE chapter_read_event (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT,
    manga_id BIGINT NOT NULL,
    chapter_id BIGINT NOT NULL,
    read_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_chapter_read_event_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_chapter_read_event_manga FOREIGN KEY (manga_id) REFERENCES manga(id),
    CONSTRAINT fk_chapter_read_event_chapter_manga FOREIGN KEY (chapter_id, manga_id) REFERENCES chapter(id, manga_id)
);

CREATE TABLE comment (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    manga_id BIGINT NOT NULL,
    chapter_id BIGINT,
    parent_id BIGINT,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE',
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    deleted_at DATETIME(3),

    PRIMARY KEY (id),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_comment_manga FOREIGN KEY (manga_id) REFERENCES manga(id),
    CONSTRAINT fk_comment_chapter_manga FOREIGN KEY (chapter_id, manga_id) REFERENCES chapter(id, manga_id),
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES comment(id),
    CONSTRAINT chk_comment_status CHECK (status IN ('VISIBLE', 'HIDDEN', 'DELETED'))
);

CREATE TABLE comment_like (
    user_id BIGINT NOT NULL,
    comment_id BIGINT NOT NULL,

    PRIMARY KEY (user_id, comment_id),
    CONSTRAINT fk_comment_like_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_comment_like_comment FOREIGN KEY (comment_id) REFERENCES comment(id)
);

CREATE TABLE otruyen_import_target (
    id BIGINT NOT NULL AUTO_INCREMENT,
    slug VARCHAR(550) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    cloudinary_folder_slug VARCHAR(550),
    priority INT NOT NULL DEFAULT 0,
    last_imported_at DATETIME(3),
    last_success_at DATETIME(3),
    last_failed_at DATETIME(3),
    fail_count INT NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_otruyen_import_target_slug (slug)
);

CREATE TABLE user_exp_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    exp_gained INT NOT NULL,
    created_at DATETIME(3) NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_exp_history_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_daily_tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    task_date DATE NOT NULL,
    check_in_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    chapters_read INT NOT NULL DEFAULT 0,
    chapters_reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    comments_posted INT NOT NULL DEFAULT 0,
    comments_reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    lucky_wheel_spun BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (id),
    UNIQUE KEY uq_user_daily_task_date (user_id, task_date),
    CONSTRAINT fk_user_daily_tasks_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_stats (
    user_id BIGINT NOT NULL,
    total_chapters_read INT NOT NULL DEFAULT 0,
    total_manga_followed INT NOT NULL DEFAULT 0,

    PRIMARY KEY (user_id),
    CONSTRAINT fk_user_stats_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE achievements (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value INT NOT NULL,
    exp_reward INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE user_achievements (
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    completed_at DATETIME(3) NOT NULL,
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (user_id, achievement_id),
    CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_achievements_ach FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

INSERT INTO otruyen_import_target (
    slug,
    enabled,
    cloudinary_folder_slug,
    priority,
    fail_count,
    created_at,
    updated_at
)
VALUES
    ('the-doraemon-special-doi-quan-doraemons-dac-bietdoi-quan-doremon-them', TRUE, 'doi-quan-doraemon-dac-biet', 0, 0, NOW(3), NOW(3)),
    ('dao-hai-tac', TRUE, 'one-piece', 0, 0, NOW(3), NOW(3)),
    ('huong-dan-sinh-ton-trong-hoc-vien', TRUE, 'huong-dan-sinh-ton-trong-hoc-vien', 0, 0, NOW(3), NOW(3)),
    ('arya-ban-ben-thinh-thoang-lai-treu-gheo-toi-bang-tieng-nga', TRUE, 'arya-ban-ben-thinh-thoang-lai-treu-gheo-toi-bang-tieng-nga', 0, 0, NOW(3), NOW(3)),
    ('dai-quan-gia-la-ma-hoang', TRUE, 'dai-quan-gia-la-ma-hoang', 0, 0, NOW(3), NOW(3)),
    ('dai-vuong-tha-mang', TRUE, 'dai-vuong-tha-mang', 0, 0, NOW(3), NOW(3)),
    ('vua-bong-chuyen', TRUE, 'haikyuu', 0, 0, NOW(3), NOW(3)),
    ('cuu-vi-ho-ly-mau', TRUE, 'naruto', 0, 0, NOW(3), NOW(3)),
    ('thien-su-nha-ben', TRUE, 'thien-su-nha-ben', 0, 0, NOW(3), NOW(3)),
    ('nisekoi-tinh-yeu-gia-tao', TRUE, 'tinh-yeu-gia-tao', 0, 0, NOW(3), NOW(3)),
    ('toan-tri-doc-gia-omniscient-reader', TRUE, 'toan-tri-doc-gia', 0, 0, NOW(3), NOW(3)),
    ('toi-thang-cap-mot-minh', TRUE, 'toi-thang-cap-mot-minh', 0, 0, NOW(3), NOW(3)),
    ('cot-binh-tro-lai', TRUE, 'cot-binh-tro-lai', 0, 0, NOW(3), NOW(3)),
    ('gia-dinh-diep-vien', TRUE, 'gia-dinh-diep-vien', 0, 0, NOW(3), NOW(3)),
    ('doc-thoai-cua-nguoi-duoc-si', TRUE, 'doc-thoai-cua-nguoi-duoc-si', 0, 0, NOW(3), NOW(3)),
    ('su-dieu-tri-dac-biet-cua-tinh-linh', TRUE, 'su-dieu-tri-dac-biet-cua-tinh-linh', 0, 0, NOW(3), NOW(3)),
    ('witchriv', TRUE, 'witchriv', 0, 0, NOW(3), NOW(3)),
    ('me-nao-con-nay', TRUE, 'me-nao-con-nay', 0, 0, NOW(3), NOW(3)),
    ('quai-luc-loan-than', TRUE, 'quai-luc-loan-than', 0, 0, NOW(3), NOW(3)),
    ('mao-hiem-gia-cuoi-cung', TRUE, 'mao-hiem-gia-cuoi-cung', 0, 0, NOW(3), NOW(3)),
    ('nhung-doa-hoa-thom-no-diem-kieu', TRUE, 'the-fragrant-flower-blooms-with-dignity', 0, 0, NOW(3), NOW(3)),
    ('blue-box', TRUE, 'blue-box', 0, 0, NOW(3), NOW(3)),
    ('gacha-vo-han', TRUE, 'gacha-vo-han', 0, 0, NOW(3), NOW(3)),
    ('tham-tu-conan', TRUE, 'tham-tu-conan', 0, 0, NOW(3), NOW(3)),
    ('the-gioi-sau-tan-the', TRUE, 'the-gioi-sau-tan-the', 0, 0, NOW(3), NOW(3)),
    ('tinh-tu-kiem-si', TRUE, 'tinh-tu-kiem-si', 0, 0, NOW(3), NOW(3))
AS new_target
ON DUPLICATE KEY UPDATE
    enabled = new_target.enabled,
    cloudinary_folder_slug = new_target.cloudinary_folder_slug,
    priority = new_target.priority,
    updated_at = NOW(3);

INSERT INTO titles (id, name, required_level, color_code) VALUES
    (1, 'Ngưng Khí Cảnh', 1, '#10B981'),
    (2, 'Trúc Cơ Cảnh', 3, '#3B82F6'),
    (3, 'Kết Đan Cảnh', 5, '#8B5CF6'),
    (4, 'Nguyên Anh Cảnh', 8, '#EF4444'),
    (5, 'Hóa Thần Cảnh', 10, '#A855F7');

INSERT INTO achievements (title, description, target_type, target_value, exp_reward) VALUES
    ('Độc giả chăm chỉ I', 'Đọc đủ 50 chương truyện', 'READ_CHAPTER', 50, 100),
    ('Độc giả chăm chỉ II', 'Đọc đủ 200 chương truyện', 'READ_CHAPTER', 200, 300),
    ('Mọt sách huyền thoại', 'Đọc đủ 500 chương truyện', 'READ_CHAPTER', 500, 1000),
    ('Người sưu tầm tin tức', 'Theo dõi đủ 10 bộ truyện', 'FOLLOW_MANGA', 10, 150),
    ('Bộ sưu tập khổng lồ', 'Theo dõi đủ 50 bộ truyện', 'FOLLOW_MANGA', 50, 500);
