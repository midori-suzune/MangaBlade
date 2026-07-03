package com.mangablade.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "manga_like")
@IdClass(MangaLikeId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MangaLike {
    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Id
    @Column(name = "manga_id", nullable = false)
    private Long mangaId;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manga_id", insertable = false, updatable = false)
    private Manga manga;
}
