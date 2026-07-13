package com.mangablade.backend.dtos.response;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MangaSearchResponse {
    private String title;
    private String slug;
    private String thumbUrl;
    private String latestChapterNumber;
    private Instant updatedAt;
    private List<String> authors;
    private List<String> categorySlugs;
    private List<String> categoryNames;
}
