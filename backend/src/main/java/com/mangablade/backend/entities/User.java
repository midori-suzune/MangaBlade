package com.mangablade.backend.entities;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import com.mangablade.backend.enums.AuthProvider;
import com.mangablade.backend.enums.UserRole;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
public class User implements UserDetails {
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

    @Size(max = 255)
    @Column(name = "password_hash", nullable = true)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 10)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "provider_id")
    private String providerId;

    @Size(max = 1000)
    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @Size(max = 100)
    @Column(name = "display_name", length = 100)
    private String displayName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Column(nullable = false)
    @Builder.Default
    private Integer level = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer exp = 0;

    @Column(name = "active_title_id")
    private Long activeTitleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_title_id", insertable = false, updatable = false)
    private Title activeTitle;

    @NotNull
    @Column(name = "is_banned", nullable = false)
    @Builder.Default
    private boolean isBanned = false;

    @Column(name = "email_verified_at", columnDefinition = "DATETIME(3)")
    private Instant emailVerifiedAt;

    @Column(name = "password_changed_at", columnDefinition = "DATETIME(3)")
    private Instant passwordChangedAt;

    @NotNull
    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false, columnDefinition = "DATETIME(3)")
    private Instant updatedAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    // --- SỬA LẠI ĐỂ SPRING SECURITY TỰ ĐỘNG CHẶN KHI TÀI KHOẢN BỊ BAN ---
    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
