package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.MangaAuthorProjection;
import com.mangablade.backend.dtos.response.MangaSearchResponse;
import com.mangablade.backend.entities.Category;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.repositories.CategoryRepository;
import com.mangablade.backend.repositories.MangaSearchRepository;
import com.mangablade.backend.search.document.MangaSearchDocument;
import com.mangablade.backend.services.mangablade.AuthorService;
import com.mangablade.backend.services.mangablade.ChapterService;
import com.mangablade.backend.services.mangablade.MangaSearchService;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MangaSearchServiceImpl implements MangaSearchService {

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 20;

    private final MangaSearchRepository mangaSearchRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorService authorService;
    private final ChapterService chapterService;

    @Override
    public List<MangaSearchResponse> search(String keyword, int limit) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }

        var pageSize = normalizeLimit(limit);
        return mangaSearchRepository.searchByTitleOrAuthors(keyword.trim(), PageRequest.of(0, pageSize))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<MangaSearchResponse> filter(String category, String author, String sort, int page, int size) {
        var categorySlug = normalizeFilter(category);
        var authorKeyword = normalizeFilter(author);
        var pageable = PageRequest.of(Math.max(page, 0), normalizeLimit(size), resolveSort(sort));

        if (categorySlug != null && authorKeyword != null) {
            return mangaSearchRepository.findByCategorySlugsAndAuthorsContaining(categorySlug, authorKeyword, pageable)
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }

        if (categorySlug != null) {
            return mangaSearchRepository.findByCategorySlugs(categorySlug, pageable)
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }

        if (authorKeyword != null) {
            return mangaSearchRepository.findByAuthorsContaining(authorKeyword, pageable)
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }

        return mangaSearchRepository.findAll(pageable)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void indexManga(Manga manga) {
        mangaSearchRepository.save(toDocument(manga));
    }

    private int normalizeLimit(int limit) {
        if (limit <= 0) {
            return DEFAULT_LIMIT;
        }

        return Math.min(limit, MAX_LIMIT);
    }

    private String normalizeFilter(String value) {
        if (value == null || value.isBlank() || "all".equalsIgnoreCase(value.trim())) {
            return null;
        }

        return value.trim();
    }

    private Sort resolveSort(String sort) {
        if ("chapters".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "latestChapterNumber");
        }

        return Sort.by(Sort.Direction.DESC, "updatedAt");
    }

    private MangaSearchDocument toDocument(Manga manga) {
        var authors = authorService.findByMangaId(manga.getId())
                .stream()
                .map(MangaAuthorProjection::getAuthorName)
                .toList();
        var categories = categoryRepository.findByMangaId(manga.getId());
        var categorySlugs = categories.stream()
                .map(Category::getSlug)
                .toList();
        var categoryNames = categories.stream()
                .map(Category::getName)
                .toList();

        return MangaSearchDocument.builder()
                .id(manga.getId())
                .slug(manga.getSlug())
                .title(manga.getTitle())
                .authors(authors)
                .categorySlugs(categorySlugs)
                .categoryNames(categoryNames)
                .thumbUrl(manga.getThumbUrl())
                .latestChapterNumber(chapterService.getLastestChapterByMangaId(manga.getId()))
                .updatedAt(manga.getUpdatedAt())
                .build();
    }

    private MangaSearchResponse toResponse(MangaSearchDocument document) {
        return MangaSearchResponse.builder()
                .title(document.getTitle())
                .slug(document.getSlug())
                .thumbUrl(document.getThumbUrl())
                .latestChapterNumber(document.getLatestChapterNumber())
                .updatedAt(document.getUpdatedAt())
                .authors(document.getAuthors())
                .categorySlugs(document.getCategorySlugs())
                .categoryNames(document.getCategoryNames())
                .build();
    }
}
