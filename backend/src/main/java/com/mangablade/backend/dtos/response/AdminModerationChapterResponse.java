package com.mangablade.backend.dtos.response;

import java.time.Instant;
import java.util.List;

import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.entities.ChapterPage;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.User;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminModerationChapterResponse {
    private Long id;
    private String chapterNumber;
    private String title;
    private int pageCount;
    private String approvalStatus;
    private Instant submittedAt;
    private String rejectionReason;
    private List<String> previewPages;
    private Long mangaId;
    private String mangaTitle;
    private String mangaSlug;
    private String authorName;
    private String thumbnail;

    public static AdminModerationChapterResponse from(Chapter chapter, List<ChapterPage> pages) {
        Manga manga = chapter.getManga();
        User owner = manga == null ? null : manga.getOwner();

        return AdminModerationChapterResponse.builder()
                .id(chapter.getId())
                .chapterNumber(chapter.getChapterNumber())
                .title(chapter.getTitle())
                .pageCount(pages.size())
                .approvalStatus(chapter.getApprovalStatus() == null ? "DRAFT" : chapter.getApprovalStatus().name())
                .submittedAt(chapter.getSubmittedAt())
                .rejectionReason(chapter.getRejectionReason())
                .previewPages(pages.stream().map(ChapterPage::getImageUrl).toList())
                .mangaId(manga == null ? chapter.getMangaId() : manga.getId())
                .mangaTitle(manga == null ? "-" : manga.getTitle())
                .mangaSlug(manga == null ? "" : manga.getSlug())
                .authorName(owner == null ? "-" : owner.getUsername())
                .thumbnail(manga == null ? null : firstNonBlank(manga.getLocalCoverUrl(), manga.getThumbUrl()))
                .build();
    }

    private static String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }
}
