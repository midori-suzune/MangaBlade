package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.services.mangablade.MangaService;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MangaServiceImpl implements MangaService {

    private final MangaRepository mangaRepository;
    private final ChapterRepository chapterRepository;
    private final MangaMapper mangaMapper;

    @Override
    public MangaResponse fetchAllManga() {
        var entity = mangaRepository.findById(1L).orElseThrow(
                () -> new RuntimeException("Manga not found with id")
        );

        var latestChapter = chapterRepository.getLatestChapterByMangaId(entity.getId());

        var response = mangaMapper.toResponse(entity);
        response.getLatestChapter().setChapterNumber(latestChapter);
        return response;
    }
}
