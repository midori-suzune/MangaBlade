package com.mangablade.backend.entities;

import java.time.Instant;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "chapter_read_event")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterReadEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @NotNull
    @Column(name = "manga_id", nullable = false)
    private Long mangaId;

    @NotNull
    @Column(name = "chapter_id", nullable = false)
    private Long chapterId;

    @NotNull
    @Column(name = "read_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant readAt;

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
