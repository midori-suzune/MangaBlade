package com.mangablade.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "favorite")
@IdClass(FavoriteId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {
    @Id
    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Id
    @NotNull
    @Column(name = "manga_id", nullable = false)
    private Long mangaId;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime createdAt;

    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @JoinColumn(name = "manga_id", insertable = false, updatable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Manga manga;
}
