CREATE TABLE forum_attachment (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,

    thread_id BIGINT,
    comment_id BIGINT,

    storage_provider VARCHAR(30) NOT NULL,
    object_key VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,

    width INT,
    height INT,

    status VARCHAR(20) NOT NULL DEFAULT 'TEMP',
    created_at DATETIME(3) NOT NULL,
    attached_at DATETIME(3),
    deleted_at DATETIME(3),

    PRIMARY KEY (id),

    CONSTRAINT fk_forum_attachment_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_forum_attachment_thread
        FOREIGN KEY (thread_id) REFERENCES forum_thread(id),

    CONSTRAINT fk_forum_attachment_comment
        FOREIGN KEY (comment_id) REFERENCES forum_comment(id),

    CONSTRAINT chk_forum_attachment_status
        CHECK (status IN ('TEMP', 'ATTACHED', 'DELETED')),

    CONSTRAINT chk_forum_attachment_provider
        CHECK (storage_provider IN ('R2', 'CLOUDINARY')),

    CONSTRAINT chk_forum_attachment_context
        CHECK (
            status != 'ATTACHED' OR
            thread_id IS NOT NULL OR
            comment_id IS NOT NULL
        )
);
