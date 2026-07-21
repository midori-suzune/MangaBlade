package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorChapterResponse {
    private Long id;
    private Long mangaId;
    private String chapterNumber;
    private String title;
    private Integer chapterSort;
    private Integer pageCount;
    private String approvalStatus;
    private String rejectionReason;
    private Instant submittedAt;
    private Instant createdAt;
}
