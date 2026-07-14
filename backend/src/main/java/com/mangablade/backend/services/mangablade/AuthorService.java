package com.mangablade.backend.services.mangablade;


import com.mangablade.backend.dtos.response.MangaAuthorProjection;

import java.util.List;

public interface AuthorService {

    List<MangaAuthorProjection> findByMangaId(Long mangaId);
}
