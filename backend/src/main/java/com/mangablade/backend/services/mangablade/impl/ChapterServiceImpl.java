package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.ChapterPageResponse;
import com.mangablade.backend.dtos.response.ChapterProjection;
import com.mangablade.backend.dtos.response.ReadingHistoryResponse;
import com.mangablade.backend.entities.ReadingHistory;
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
        var history = readingHistoryRepository.findByUserIdAndChapterId(userId, chapter.get().getId())
                .orElseGet(() -> ReadingHistory.builder()
                        .userId(userId)
                        .mangaId(chapter.get().getMangaId())
                        .chapterId(chapter.get().getId())
                        .pageIndex(0)
                        .lastReadAt(now)
                        .build());

        boolean isNewRead = history.getId() == null;
        history.setLastReadAt(now);
        readingHistoryRepository.save(history);

        if (isNewRead) {
            taskService.handleChapterRead(userId);
        }
    }

    @Override
    public List<ReadingHistoryResponse> fetchReadingHistory(Long userId) {
        return readingHistoryRepository.findRecentByUserId(userId, PageRequest.of(0, 5));
    }

    @Override
    public Optional<ReadingHistoryResponse> fetchLatestReadingHistory(Long userId, String slug) {
        return readingHistoryRepository.findLatestByUserIdAndMangaSlug(userId, slug);
    }
}
