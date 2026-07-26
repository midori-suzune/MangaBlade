package com.mangablade.backend.entities;

import com.mangablade.backend.enums.ForumAttachmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "forum_attachment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "thread_id")
    private Long threadId;

    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "storage_provider", nullable = false, length = 30)
    private String storageProvider;

    @Column(name = "object_key", nullable = false, length = 500)
    private String objectKey;

    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ForumAttachmentStatus status = ForumAttachmentStatus.TEMP;

    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant createdAt;

    @Column(name = "attached_at", columnDefinition = "DATETIME(3)")
    private Instant attachedAt;

    @Column(name = "deleted_at", columnDefinition = "DATETIME(3)")
    private Instant deletedAt;
}
