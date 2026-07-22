package com.mangablade.backend.dtos.response;

import com.mangablade.backend.enums.CommentStatus;
import com.mangablade.backend.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumCommentResponse {
    private Long id;
    private Long threadId;
    private Long replyToCommentId;
    private String content;
    private CommentStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private Long likeCount;
    private Boolean isLiked;
    private User user;

    @Builder.Default
    private List<ForumCommentResponse> replies = new ArrayList<>();

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
