package com.mangablade.backend.dtos.response;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RecentCommentResponse {
    private Long id;
    private String content;
    private Instant createdAt;
    private Long userId;
    private String username;
    private String mangaSlug;
    private String mangaTitle;
    private String chapterNumber;
    private String activeTitle;
    private String activeTitleColor;

    public RecentCommentResponse(Long id, String content, Instant createdAt, Long userId, String username, 
                                 String mangaSlug, String mangaTitle, String chapterNumber, 
                                 String activeTitle, String activeTitleColor) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.userId = userId;
        this.username = username;
        this.mangaSlug = mangaSlug;
        this.mangaTitle = mangaTitle;
        this.chapterNumber = chapterNumber;
        this.activeTitle = activeTitle;
        this.activeTitleColor = activeTitleColor;
    }
}
