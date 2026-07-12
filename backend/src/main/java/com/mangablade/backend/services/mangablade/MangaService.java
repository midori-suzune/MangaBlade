package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.MangaDetailResponse;
import com.mangablade.backend.dtos.response.MangaInteractionResponse;
import com.mangablade.backend.dtos.response.MangaRankingResponse;
import com.mangablade.backend.dtos.response.MangaResponse;

import java.util.List;

public interface MangaService {

    List<MangaResponse> fetchAllManga();

    List<MangaRankingResponse> fetchRanking(String sort);

    MangaDetailResponse fetchMangaDetailBySlug(String slug, Long userId);

    MangaInteractionResponse toggleFollow(String slug, Long userId);

    MangaInteractionResponse toggleLike(String slug, Long userId);

}
