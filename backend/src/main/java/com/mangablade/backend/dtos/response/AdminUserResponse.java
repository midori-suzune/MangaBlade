package com.mangablade.backend.dtos.response;

import java.time.Instant;

import com.mangablade.backend.entities.Title;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.AuthProvider;
import com.mangablade.backend.enums.UserRole;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private boolean banned;
    private Boolean online;
    private Instant createdAt;
    private Long activeTitleId;
    private TitleSummary activeTitle;
    private String avatarUrl;
    private String providerId;
    private AuthProvider authProvider;

    public static AdminUserResponse from(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .banned(user.isBanned())
                .online(false)
                .createdAt(user.getCreatedAt())
                .activeTitleId(user.getActiveTitleId())
                .activeTitle(TitleSummary.from(user.getActiveTitle()))
                .avatarUrl(user.getAvatarUrl())
                .providerId(user.getProviderId())
                .authProvider(user.getAuthProvider())
                .build();
    }

    @Data
    @Builder
    public static class TitleSummary {
        private Long id;
        private String name;

        public static TitleSummary from(Title title) {
            if (title == null) {
                return null;
            }
            return TitleSummary.builder()
                    .id(title.getId())
                    .name(title.getName())
                    .build();
        }
    }
}
