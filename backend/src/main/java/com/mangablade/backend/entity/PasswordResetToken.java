package com.mangablade.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "password_reset_token", uniqueConstraints =
@UniqueConstraint(name = "uq_password_reset_token_hash", columnNames = "token_hash"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank
    @Size(min = 64, max = 64)
    @Column(name = "token_hash", nullable = false, length = 64, columnDefinition = "CHAR(64)")
    private String tokenHash;

    @NotNull
    @Column(name = "expires_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime expiresAt;

    @Column(name = "used_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime usedAt;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
