package com.mangablade.backend.dtos.response;

import com.mangablade.backend.enums.ForumThreadCategory;
import com.mangablade.backend.enums.ForumThreadStatus;
import com.mangablade.backend.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumThreadResponse {
    private Long id;
    private ForumThreadCategory category;
    private String title;
    private String content;
    private ForumThreadStatus status;
    private Integer viewCount;
    private Integer commentCount;
    private Instant lastCommentedAt;
    private Instant createdAt;
    private Instant updatedAt;
    private User user;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class User {
        private Long id;
        private String username;
        private String avatarUrl;
        private UserRole role;
        private String activeTitle;
        private String activeTitleColor;
    }
}
