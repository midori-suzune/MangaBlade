package com.mangablade.backend.entities;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "otruyen_import_target", uniqueConstraints =
@UniqueConstraint(name = "uq_otruyen_import_target_slug", columnNames = "slug"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OTruyenImportTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 550)
    @Column(nullable = false, length = 550)
    private String slug;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "last_imported_at", columnDefinition = "DATETIME(3)")
    private Instant lastImportedAt;

    @Column(name = "last_success_at", columnDefinition = "DATETIME(3)")
    private Instant lastSuccessAt;

    @Column(name = "last_failed_at", columnDefinition = "DATETIME(3)")
    private Instant lastFailedAt;

    @NotNull
    @Min(0)
    @Column(name = "fail_count", nullable = false)
    @Builder.Default
    private Integer failCount = 0;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant updatedAt;

    public void markSuccess(Instant importedAt) {
        lastImportedAt = importedAt;
        lastSuccessAt = importedAt;
        updatedAt = importedAt;
        failCount = 0;
    }

    public void markFailure(Instant importedAt) {
        lastImportedAt = importedAt;
        lastFailedAt = importedAt;
        updatedAt = importedAt;
        failCount = failCount == null ? 1 : failCount + 1;
    }
}
