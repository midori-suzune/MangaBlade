package com.mangablade.backend.entities;

import java.time.Instant;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "chapter_page", uniqueConstraints =
@UniqueConstraint(name = "uq_chapter_page_number", columnNames = {"chapter_id", "page_number"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterPage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "chapter_id", nullable = false)
    private Long chapterId;

    @NotNull
    @Positive
    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @NotBlank
    @Size(max = 1000)
    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", insertable = false, updatable = false)
    private Chapter chapter;
}
