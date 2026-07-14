package com.mangablade.backend.entities;

import java.math.BigDecimal;
import java.time.Instant;

import com.mangablade.backend.enums.ApprovalStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "chapter", uniqueConstraints = {
        @UniqueConstraint(name = "uq_chapter_id_manga", columnNames = {"id", "manga_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "manga_id", nullable = false)
    private Long mangaId;

    @Size(max = 500)
    @Column(length = 500)
    private String title;

    @Size(max = 30)
    @Column(name = "chapter_number", length = 30)
    private String chapterNumber;

    @Digits(integer = 7, fraction = 3)
    @Column(name = "chapter_sort", precision = 10, scale = 3)
    private BigDecimal chapterSort;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manga_id", insertable = false, updatable = false)
    private Manga manga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by", insertable = false, updatable = false)
    private User reviewer;
}
