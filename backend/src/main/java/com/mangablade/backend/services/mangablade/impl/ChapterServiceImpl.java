package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.services.mangablade.ChapterService;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;

    @Override
    public String getLastestChapterByMangaId(Long mangaId) {
        return chapterRepository.getLatestChapterByMangaId(mangaId);
    }
}
