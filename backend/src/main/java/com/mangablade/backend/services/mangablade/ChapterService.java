package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.ChapterProjection;

import java.util.List;

public interface ChapterService {
    String getLastestChapterByMangaId(Long mangaId);
    List<ChapterProjection> getChapterByMangaId(Long mangaId);
}
