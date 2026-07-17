package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.ChapterPageResponse;
import com.mangablade.backend.dtos.response.ChapterProjection;
import com.mangablade.backend.dtos.response.ReadingHistoryResponse;
import com.mangablade.backend.repositories.ChapterPageRepository;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.ReadingHistoryRepository;
import com.mangablade.backend.services.mangablade.ChapterService;
import com.mangablade.backend.services.mangablade.TaskService;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private static final int DEFAULT_READING_HISTORY_SIZE = 20;
    private static final int MAX_READING_HISTORY_SIZE = 50;

    private final ChapterRepository chapterRepository;
    private  final ChapterPageRepository chapterPageRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final TaskService taskService;

    @Override
    public String getLastestChapterByMangaId(Long mangaId) {
        return chapterRepository.getLatestChapterByMangaId(mangaId);
    }

    @Override
    public List<ChapterProjection> getChapterByMangaId(Long mangaId) {
        return chapterRepository.getChaptersByMangaId(mangaId);
    }

    @Override
    public List<ChapterPageResponse> fetchChapterPage(String slug, String chapterNumber) {
        return chapterPageRepository.findPagesBySlugAndChapterNumber(slug, chapterNumber);
    }

    @Override
    @Transactional
    public void recordReadingHistory(Long userId, String slug, String chapterNumber) {
        var chapter = chapterRepository.findByMangaSlugAndChapterNumber(slug, chapterNumber);

        if (chapter.isEmpty()) {
            return;
        }

        var now = Instant.now();
        var affectedRows = readingHistoryRepository.upsertReadingHistory(
                userId,
                chapter.get().getMangaId(),
                chapter.get().getId(),
                now
        );

        if (affectedRows == 1) {
            taskService.handleChapterRead(userId);
        }
    }

    @Override
    public List<ReadingHistoryResponse> fetchReadingHistory(Long userId) {
        return fetchReadingHistory(userId, null, 0, 5);
    }

    @Override
    public List<ReadingHistoryResponse> fetchReadingHistory(Long userId, String query, int page, int size) {
        return readingHistoryRepository.findRecentByUserId(
                userId,
                normalizeSearchQuery(query),
                PageRequest.of(Math.max(page, 0), normalizeReadingHistorySize(size))
        );
    }

    @Override
    public Optional<ReadingHistoryResponse> fetchLatestReadingHistory(Long userId, String slug) {
        return readingHistoryRepository.findLatestByUserIdAndMangaSlug(userId, slug);
    }

    private String normalizeSearchQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }

        return query.trim();
    }

    private int normalizeReadingHistorySize(int size) {
        if (size <= 0) {
            return DEFAULT_READING_HISTORY_SIZE;
        }

        return Math.min(size, MAX_READING_HISTORY_SIZE);
    }
}
