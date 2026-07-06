package com.mangablade.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "manga_author")
@IdClass(MangaAuthorId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MangaAuthor {
    @Id
    @NotNull
    @Column(name = "manga_id", nullable = false)
    private Long mangaId;

    @Id
    @NotNull
    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @JoinColumn(name = "manga_id", insertable = false, updatable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Manga manga;

    @JoinColumn(name = "author_id", insertable = false, updatable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Author author;
}
