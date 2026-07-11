package com.mangablade.backend.dtos.response;

import com.mangablade.backend.enums.MangaSourceType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MangaDetailResponse {
    private String title;
    private MangaSourceType sourceType ;
    private String description;
    private String status ;
    private String thumbUrl ;
    private Instant updatedAt ;
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();
    @Builder.Default
    private List<Author> authors = new ArrayList<>();
    @Builder.Default
    private List<Category> categories = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Chapter {
        private String chapterNumber;
        private String chapterUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Category {
        private Long id;
        private String name;
        private String slug;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Author {
        private Long id;
        private String name;
    }
}
