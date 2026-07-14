package com.mangablade.backend.dtos.response;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecentCommentResponse {
    private Long id;
    private String content;
    private Instant createdAt;
    private Long userId;
    private String username;
    private String mangaSlug;
    private String mangaTitle;
    private String chapterNumber;
}
