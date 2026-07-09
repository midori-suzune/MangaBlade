package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.services.mangablade.ChapterService;
import com.mangablade.backend.services.mangablade.MangaService;

import org.springframework.stereotype.Service;

import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MangaServiceImpl implements MangaService {

    private final MangaRepository mangaRepository;
    private final ChapterService chapterService;
    private final MangaMapper mangaMapper;

    @Override
    public List<MangaResponse> fetchAllManga() {
        var entity = mangaRepository.findAll();
        return entity.stream().map(e -> {
            var latestChapter = chapterService.getLastestChapterByMangaId(e.getId());
            var response = mangaMapper.toResponse(e);
            response.getLatestChapter().setChapterNumber(latestChapter);
            return response;
        }).toList();
    }
}
