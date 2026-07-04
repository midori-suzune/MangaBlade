package com.mangablade.backend.entities;

import java.time.Instant;

import com.mangablade.backend.enums.CommentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "comment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotNull
    @Column(name = "manga_id", nullable = false)
    private Long mangaId;

    @Column(name = "chapter_id")
    private Long chapterId;

    @Column(name = "parent_id")
    private Long parentId;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CommentStatus status = CommentStatus.VISIBLE;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant updatedAt;

    @Column(name = "deleted_at", columnDefinition = "DATETIME(3)")
    private Instant deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manga_id", insertable = false, updatable = false)
    private Manga manga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "chapter_id", referencedColumnName = "id", insertable = false, updatable = false),
            @JoinColumn(name = "manga_id", referencedColumnName = "manga_id", insertable = false, updatable = false)
    })
    private Chapter chapter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Comment parent;

}
