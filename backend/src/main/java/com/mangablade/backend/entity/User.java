package com.mangablade.backend.entity;

import java.time.LocalDateTime;

import com.mangablade.backend.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uq_users_email", columnNames = "email"),
        @UniqueConstraint(name = "uq_users_username", columnNames = "username")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(nullable = false)
    private String email;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String username;

    @NotBlank
    @Size(max = 255)
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Size(max = 1000)
    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Column(name = "email_verified_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "password_changed_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime passwordChangedAt;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime updatedAt;

}
