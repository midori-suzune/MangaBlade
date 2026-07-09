package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.MangaResponse;

import java.util.List;

public interface MangaService {

    List<MangaResponse> fetchAllManga();
}
