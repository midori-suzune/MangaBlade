package com.mangablade.backend.entities;

<<<<<<< HEAD
import java.time.Instant;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.mangablade.backend.enums.AuthProvider;
import com.mangablade.backend.enums.UserRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
=======
import com.mangablade.backend.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
>>>>>>> fa490662811fb42461c9bf5cbefa6b31f992facf

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

<<<<<<< HEAD
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

    @NotNull
=======
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

>>>>>>> fa490662811fb42461c9bf5cbefa6b31f992facf
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

<<<<<<< HEAD
    // --- THÊM TRƯỜNG NÀY ĐỂ QUẢN LÝ BAN/UNBAN ---
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
        return !isBanned; 
    }
=======
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
>>>>>>> fa490662811fb42461c9bf5cbefa6b31f992facf
}