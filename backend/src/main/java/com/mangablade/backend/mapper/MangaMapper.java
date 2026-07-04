package com.mangablade.backend.mapper;

import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.enums.MangaSourceType;
import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;

import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class MangaMapper {

    public Manga toEntity(OTruyenMangaResponse response){
        return Manga.
                builder()
                .otruyenMangaId(response.getData().getItem().getId())
                .sourceType(MangaSourceType.OTRUYEN)
                .slug(response.getData().getItem().getSlug())
                .title(response.getData().getItem().getName())
                .description(response.getData().getItem().getDescription())
                .status(response.getData().getItem().getStatus())
                .thumbUrl(response.getData().getItem().getThumblUrl())
                .createdAt(Instant.now())
                .updatedAt(response.getData().getItem().getUpdatedAt())
                .build();
    }
}
