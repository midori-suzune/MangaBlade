package com.mangablade.backend.utils.querysql;

public class ForumAttachmentQuery {

    public static final String ATTACH_TO_THREAD = """
            UPDATE ForumAttachment a
            SET a.status = 'ATTACHED', a.threadId = :threadId, a.attachedAt = :now
            WHERE a.id IN :ids AND a.userId = :userId AND a.status = 'TEMP'
            """;

    public static final String FIND_ADMIN_DRAFT_IMAGES = """
            SELECT new com.mangablade.backend.dtos.response.AdminForumDraftImageResponse(
                a.id,
                a.userId,
                u.username,
                a.objectKey,
                a.url,
                a.mimeType,
                a.fileSize,
                a.createdAt
            )
            FROM ForumAttachment a
            LEFT JOIN User u ON u.id = a.userId
            WHERE a.status = 'TEMP'
              AND a.threadId IS NULL
              AND a.commentId IS NULL
              AND a.createdAt < :before
              AND (
                  :search IS NULL
                  OR LOWER(a.objectKey) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(a.url) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR CONCAT('', a.userId) LIKE CONCAT('%', :search, '%')
              )
            """;

    public static final String COUNT_ADMIN_DRAFT_IMAGES = """
            SELECT COUNT(a)
            FROM ForumAttachment a
            LEFT JOIN User u ON u.id = a.userId
            WHERE a.status = 'TEMP'
              AND a.threadId IS NULL
              AND a.commentId IS NULL
              AND a.createdAt < :before
              AND (
                  :search IS NULL
                  OR LOWER(a.objectKey) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(a.url) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR CONCAT('', a.userId) LIKE CONCAT('%', :search, '%')
              )
            """;

    public static final String SUM_ADMIN_DRAFT_IMAGE_SIZE = """
            SELECT COALESCE(SUM(a.fileSize), 0)
            FROM ForumAttachment a
            LEFT JOIN User u ON u.id = a.userId
            WHERE a.status = 'TEMP'
              AND a.threadId IS NULL
              AND a.commentId IS NULL
              AND a.createdAt < :before
              AND (
                  :search IS NULL
                  OR LOWER(a.objectKey) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(a.url) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR CONCAT('', a.userId) LIKE CONCAT('%', :search, '%')
              )
            """;

    public static final String FIND_DELETABLE_DRAFT_IMAGES_BY_IDS = """
            SELECT a
            FROM ForumAttachment a
            WHERE a.id IN :ids
              AND a.status = 'TEMP'
              AND a.threadId IS NULL
              AND a.commentId IS NULL
            """;

    public static final String MARK_DRAFT_IMAGES_DELETED = """
            UPDATE ForumAttachment a
            SET a.status = 'DELETED', a.deletedAt = :now
            WHERE a.id IN :ids
              AND a.status = 'TEMP'
              AND a.threadId IS NULL
              AND a.commentId IS NULL
            """;

    public static final String DELETE_ORPHANED_ATTACHMENTS = """
            UPDATE ForumAttachment a
            SET a.status = 'DELETED', a.deletedAt = :now
            WHERE a.status = 'TEMP'
              AND a.threadId IS NULL
              AND a.commentId IS NULL
              AND a.createdAt < :before
            """;
}
