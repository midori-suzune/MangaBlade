package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.MangaDetailResponse;
import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.CategoryRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.services.mangablade.AuthorService;
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
    private final AuthorService authorService;
    private final CategoryRepository categoryRepository;

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

    @Override
    public MangaDetailResponse fetchMangaDetailBySlug(String slug) {
        var manga = mangaRepository.findBySlug(slug);
        var chapterList = chapterService.getChapterByMangaId(manga.getId());
        var list = chapterList.stream().map(chapter -> MangaDetailResponse.Chapter.builder()
                .chapterNumber(chapter.getChapterNumber())
                .chapterUrl(chapter.getChapterUrl())
                .build()).toList();
        var authors = authorService.findByMangaId(manga.getId()).stream()
                .map(author -> new MangaDetailResponse.Author(author.getAuthorId(), author.getAuthorName()))
                .toList();
        var categories = categoryRepository.findByMangaId(manga.getId()).stream()
                .map(category -> new MangaDetailResponse.Category(category.getId(), category.getName(), category.getSlug()))
                .toList();

        return MangaDetailResponse.builder()
                .title(manga.getTitle())
                .status(manga.getStatus())
                .thumbUrl(manga.getThumbUrl())
                .description(manga.getDescription())
                .sourceType(manga.getSourceType())
                .updatedAt(manga.getUpdatedAt())
                .authors(authors)
                .categories(categories)
                .chapters(list)
                .build();
    }
}
