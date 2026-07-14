package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.ChapterPageResponse;
import com.mangablade.backend.dtos.response.ChapterProjection;
import com.mangablade.backend.dtos.response.ReadingHistoryResponse;

import java.util.List;
import java.util.Optional;

public interface ChapterService {
    String getLastestChapterByMangaId(Long mangaId);
    List<ChapterProjection> getChapterByMangaId(Long mangaId);

    List<ChapterPageResponse> fetchChapterPage(String slug, String chapterNumber);

    void recordReadingHistory(Long userId, String slug, String chapterNumber);

    List<ReadingHistoryResponse> fetchReadingHistory(Long userId);

    Optional<ReadingHistoryResponse> fetchLatestReadingHistory(Long userId, String slug);
}
