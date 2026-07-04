package com.mangablade.backend.entities;

import java.time.Instant;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "reading_history", uniqueConstraints =
@UniqueConstraint(name = "uq_reading_history_user_chapter", columnNames = {"user_id", "chapter_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotNull
    @Column(name = "manga_id", nullable = false)
    private Long mangaId;

    @NotNull
    @Column(name = "chapter_id", nullable = false)
    private Long chapterId;

    @NotNull
    @Column(name = "page_index", nullable = false)
    @Builder.Default
    private Integer pageIndex = 0;

    @NotNull
    @Column(name = "last_read_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant lastReadAt;

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
}
