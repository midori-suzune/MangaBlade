package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.MangaSearchResponse;
import com.mangablade.backend.entities.Manga;

import java.util.List;

public interface MangaSearchService {
    List<MangaSearchResponse> search(String keyword, int limit);

    List<MangaSearchResponse> filter(String category, String author, String sort, int page, int size);

    void indexManga(Manga manga);
}
