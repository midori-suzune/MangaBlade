package com.mangablade.backend.dtos.response;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MangaResponse {
    private String slug;
    private String title;
    private String thumbUrl;
    private Instant updatedAt;
    private LatestChapter latestChapter;
    private String lastSeenChapterNumber;
    private boolean hasNewChapter;

    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    public static class LatestChapter {
        private String chapterNumber;
    }
}
