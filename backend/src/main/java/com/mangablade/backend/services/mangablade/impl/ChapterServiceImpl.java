package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.ChapterProjection;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.services.mangablade.ChapterService;

import org.springframework.stereotype.Service;

import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;

    @Override
    public String getLastestChapterByMangaId(Long mangaId) {
        return chapterRepository.getLatestChapterByMangaId(mangaId);
    }

    @Override
    public List<ChapterProjection> getChapterByMangaId(Long mangaId) {
        return chapterRepository.getChaptersByMangaId(mangaId);
    }
}
