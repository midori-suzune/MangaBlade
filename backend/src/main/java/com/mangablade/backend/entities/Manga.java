package com.mangablade.backend.entities;

import java.time.Instant;

import com.mangablade.backend.enums.ApprovalStatus;
import com.mangablade.backend.enums.ChapterPageSource;
import com.mangablade.backend.enums.MangaSourceType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "manga", uniqueConstraints = {
        @UniqueConstraint(name = "uq_manga_otruyen_id", columnNames = "otruyen_manga_id"),
        @UniqueConstraint(name = "uq_manga_slug", columnNames = "slug")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Manga {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 24)
    @Column(name = "otruyen_manga_id", length = 24, columnDefinition = "CHAR(24)")
    private String otruyenMangaId;

    @Column(name = "owner_user_id")
    private Long ownerUserId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "metadata_source", nullable = false, length = 20)
    @Builder.Default
    private MangaSourceType metadataSource = MangaSourceType.OTRUYEN;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "chapter_page_source", nullable = false, length = 20)
    @Builder.Default
    private ChapterPageSource chapterPageSource = ChapterPageSource.TRUYENQQ;

    @NotBlank
    @Size(max = 550)
    @Column(nullable = false, length = 550)
    private String slug;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String title;

    @Size(max = 500)
    @Column(name = "origin_name", length = 500)
    private String originName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 550)
    @Column(name = "cloudinary_folder_slug", length = 550)
    private String cloudinaryFolderSlug;

    @NotBlank
    @Size(max = 30)
    @Column(nullable = false, length = 30)
    private String status;

    @Size(max = 500)
    @Column(name = "thumb_url", length = 500)
    private String thumbUrl;

    @Size(max = 1000)
    @Column(name = "local_cover_url", length = 1000)
    private String localCoverUrl;

    @Size(max = 1000)
    @Column(name = "hidden_reason", length = 1000)
    private String hiddenReason;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.DRAFT;

    @Column(name = "submitted_at", columnDefinition = "DATETIME(3)")
    private Instant submittedAt;

    @Column(name = "reviewed_at", columnDefinition = "DATETIME(3)")
    private Instant reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Size(max = 1000)
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant updatedAt;

    @Column(name = "deleted_at", columnDefinition = "DATETIME(3)")
    private Instant deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", insertable = false, updatable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by", insertable = false, updatable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by", insertable = false, updatable = false)
    private User deletedByUser;

}
