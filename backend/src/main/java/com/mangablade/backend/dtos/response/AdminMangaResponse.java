package com.mangablade.backend.dtos.response;

import java.time.Instant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminMangaResponse {
    private Long id;
    private String title;
    private String slug;
    private String author;
    private String authorEmail;
    private String origin;
    private String status;
    private long chapters;
    private long reads;
    private Instant updatedAt;
    private String hiddenReason;
    private String thumbnail;
}
