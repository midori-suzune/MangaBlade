package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.MangaDetailResponse;
import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.entities.Manga;

import java.util.List;

public interface MangaService {

    List<MangaResponse> fetchAllManga();

    MangaDetailResponse fetchMangaDetailBySlug(String slug);

}
