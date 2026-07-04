package com.mangablade.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "manga_category")
@IdClass(MangaCategoryId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MangaCategory {
    @Id
    @Column(name = "manga_id", nullable = false)
    private Long mangaId;

    @Id
    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manga_id", insertable = false, updatable = false)
    private Manga manga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;
}
