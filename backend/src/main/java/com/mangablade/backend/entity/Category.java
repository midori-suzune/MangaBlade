package com.mangablade.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "category", uniqueConstraints = {
        @UniqueConstraint(name = "uq_category_otruyen_id", columnNames = "otruyen_category_id"),
        @UniqueConstraint(name = "uq_category_slug", columnNames = "slug")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 24)
    @Column(name = "otruyen_category_id", nullable = false, length = 24, columnDefinition = "CHAR(24)")
    private String otruyenCategoryId;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String slug;
}
