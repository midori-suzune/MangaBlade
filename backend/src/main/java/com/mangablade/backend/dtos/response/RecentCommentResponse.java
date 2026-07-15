package com.mangablade.backend.dtos.response;

import java.time.Instant;

public interface RecentCommentResponse {
    Long getId();

    String getContent();

    Instant getCreatedAt();

    Long getUserId();

    String getUsername();

    String getMangaSlug();

    String getMangaTitle();

    String getChapterNumber();

    String getActiveTitle();

    String getActiveTitleColor();
}
