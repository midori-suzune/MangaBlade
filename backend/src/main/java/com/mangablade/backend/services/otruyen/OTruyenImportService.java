package com.mangablade.backend.services.otruyen;


import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.integration.otruyen.OTruyenClient;
import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.MangaRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OTruyenImportService {
    private final MangaRepository mangaRepository;
    private final MangaMapper mangaMapper;
    private final OTruyenClient oTruyenClient;


    public void importManga(String slug){
        OTruyenMangaResponse response  = oTruyenClient.getManga(slug);
        var newManga =  mangaMapper.toEntity(response);
        var manga = mangaRepository.findByOtruyenMangaId(response.getData().getItem().getId()).orElse(newManga);
        mangaRepository.save(manga);
    }
}
