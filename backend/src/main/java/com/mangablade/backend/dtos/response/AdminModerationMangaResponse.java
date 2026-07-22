package com.mangablade.backend.dtos.response;

import java.time.Instant;
import java.util.List;

import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.User;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminModerationMangaResponse {
    private Long id;
    private String title;
    private String slug;
    private String originName;
    private String description;
    private String authorName;
    private String authorEmail;
    private String status;
    private String approvalStatus;
    private List<String> categoryNames;
    private int chapterCount;
    private Instant submittedAt;
    private Instant reviewedAt;
    private String rejectionReason;
    private String thumbnail;
    private List<AdminModerationChapterResponse> chapters;

    public static AdminModerationMangaResponse from(
            Manga manga,
            List<String> categoryNames,
            List<AdminModerationChapterResponse> chapters
    ) {
        User owner = manga.getOwner();

        return AdminModerationMangaResponse.builder()
                .id(manga.getId())
                .title(manga.getTitle())
                .slug(manga.getSlug())
                .originName(manga.getOriginName())
                .description(manga.getDescription())
                .authorName(owner == null ? "-" : owner.getUsername())
                .authorEmail(owner == null ? "-" : owner.getEmail())
                .status(manga.getStatus())
                .approvalStatus(manga.getApprovalStatus() == null ? "DRAFT" : manga.getApprovalStatus().name())
                .categoryNames(categoryNames)
                .chapterCount(chapters.size())
                .submittedAt(manga.getSubmittedAt())
                .reviewedAt(manga.getReviewedAt())
                .rejectionReason(manga.getRejectionReason())
                .thumbnail(firstNonBlank(manga.getLocalCoverUrl(), manga.getThumbUrl()))
                .chapters(chapters)
                .build();
    }

    private static String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }
}
