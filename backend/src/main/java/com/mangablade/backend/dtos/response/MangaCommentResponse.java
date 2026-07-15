package com.mangablade.backend.dtos.response;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MangaCommentResponse {
    private Long id;
    private String content;
    private Instant createdAt;
    private User user;
    @Builder.Default
    private List<MangaCommentResponse> replies = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class User {
        private Long id;
        private String username;
        private String activeTitle;
        private String activeTitleColor;
    }
}
