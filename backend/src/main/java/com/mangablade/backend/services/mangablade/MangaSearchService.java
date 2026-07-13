package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.MangaSearchResponse;
import com.mangablade.backend.entities.Manga;

import java.util.List;

public interface MangaSearchService {
    List<MangaSearchResponse> search(String keyword, int limit);

    void indexManga(Manga manga);
}
