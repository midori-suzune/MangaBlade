package com.mangablade.backend.services.mangablade;

import java.time.Instant;
import java.util.List;

import com.mangablade.backend.dtos.request.AdminContentReviewRequest;
import com.mangablade.backend.dtos.response.AdminModerationChapterResponse;
import com.mangablade.backend.dtos.response.AdminModerationMangaResponse;
import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.enums.ApprovalStatus;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.ChapterPageRepository;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaCategoryRepository;
import com.mangablade.backend.repositories.MangaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminContentModerationService {
    private final MangaRepository mangaRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterPageRepository chapterPageRepository;
    private final MangaCategoryRepository mangaCategoryRepository;

    @Transactional(readOnly = true)
    public Page<AdminModerationMangaResponse> findManga(ApprovalStatus status, String search, Pageable pageable) {
        return mangaRepository.findModerationManga(status, normalizeSearch(search), pageable)
                .map(this::mapManga);
    }

    @Transactional(readOnly = true)
    public Page<AdminModerationChapterResponse> findChapters(ApprovalStatus status, String search, Pageable pageable) {
        return chapterRepository.findModerationChapters(status, normalizeSearch(search), pageable)
                .map(this::mapChapter);
    }

    @Transactional
    public AdminModerationMangaResponse reviewManga(Long mangaId, AdminContentReviewRequest request, Long adminId) {
        validateReviewRequest(request);

        Manga manga = mangaRepository.findById(mangaId)
                .orElseThrow(() -> new AppException(ErrorCode.MANGA_NOT_FOUND));

        Instant now = Instant.now();
        manga.setApprovalStatus(request.getStatus());
        manga.setReviewedAt(now);
        manga.setReviewedBy(adminId);
        manga.setRejectionReason(request.getStatus() == ApprovalStatus.REJECTED ? request.getRejectReason().trim() : null);
        manga.setUpdatedAt(now);

        return mapManga(mangaRepository.save(manga));
    }

    @Transactional
    public AdminModerationChapterResponse reviewChapter(Long chapterId, AdminContentReviewRequest request, Long adminId) {
        validateReviewRequest(request);

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        chapter.setApprovalStatus(request.getStatus());
        chapter.setReviewedAt(Instant.now());
        chapter.setReviewedBy(adminId);
        chapter.setRejectionReason(request.getStatus() == ApprovalStatus.REJECTED ? request.getRejectReason().trim() : null);

        return mapChapter(chapterRepository.save(chapter));
    }

    private AdminModerationMangaResponse mapManga(Manga manga) {
        List<String> categoryNames = mangaCategoryRepository.findCategoryNamesByMangaId(manga.getId());
        List<AdminModerationChapterResponse> chapters = chapterRepository.findAllByMangaId(manga.getId())
                .stream()
                .map(this::mapChapter)
                .toList();

        return AdminModerationMangaResponse.from(manga, categoryNames, chapters);
    }

    private AdminModerationChapterResponse mapChapter(Chapter chapter) {
        var pages = chapterPageRepository.findByChapterIdOrderByPageNumberAsc(chapter.getId());
        return AdminModerationChapterResponse.from(chapter, pages);
    }

    private void validateReviewRequest(AdminContentReviewRequest request) {
        if (request.getStatus() != ApprovalStatus.APPROVED && request.getStatus() != ApprovalStatus.REJECTED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (request.getStatus() == ApprovalStatus.REJECTED
                && (request.getRejectReason() == null || request.getRejectReason().isBlank())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim();
    }
}
