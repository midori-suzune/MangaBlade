package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorMangaResponse {
    private Long id;
    private String title;
    private String slug;
    private String originName;
    private String description;
    private String status;
    private String approvalStatus;
    private String rejectionReason;
    private Instant submittedAt;
    private Long viewCount;
    private Long followCount;
    private Long chapterCount;
    private String thumbUrl;
    private String localCoverUrl;
    private Instant createdAt;
    private Instant updatedAt;
    private List<CategoryResponse> categories;
}
