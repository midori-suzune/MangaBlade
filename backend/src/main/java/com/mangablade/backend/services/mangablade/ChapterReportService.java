package com.mangablade.backend.services.mangablade;

import java.time.Instant;

import com.mangablade.backend.dtos.request.CreateChapterReportRequest;
import com.mangablade.backend.entities.ChapterReport;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.ChapterReportStatus;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.ChapterReportRepository;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChapterReportService {
    private final MangaRepository mangaRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterReportRepository chapterReportRepository;

    @Transactional
    public void create(String slug, String chapterNumber, CreateChapterReportRequest request, User user) {
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        var manga = mangaRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.warn("Manga not found when creating chapter report: slug={}", slug);
                    return new AppException(ErrorCode.MANGA_NOT_FOUND);
                });

        var chapter = chapterRepository.findByMangaIdAndChapterNumber(manga.getId(), chapterNumber)
                .orElseThrow(() -> {
                    log.warn("Chapter not found when creating chapter report: mangaId={}, chapterNumber={}", manga.getId(), chapterNumber);
                    return new AppException(ErrorCode.CHAPTER_NOT_FOUND);
                });

        var now = Instant.now();
        chapterReportRepository.save(
                ChapterReport.builder()
                        .userId(user.getId())
                        .mangaId(manga.getId())
                        .chapterId(chapter.getId())
                        .type(request.getType())
                        .description(buildDescription(request))
                        .status(ChapterReportStatus.PENDING)
                        .createdAt(now)
                        .updatedAt(now)
                        .build()
        );
    }

    private String buildDescription(CreateChapterReportRequest request) {
        var description = request.getDescription().trim();
        var pageHint = request.getPageHint();

        if (pageHint == null || pageHint.isBlank()) {
            return description;
        }

        return "Trang liên quan: " + pageHint.trim() + "\n" + description;
    }
}
