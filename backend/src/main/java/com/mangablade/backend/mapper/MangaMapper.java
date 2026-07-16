package com.mangablade.backend.mapper;

import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.enums.ChapterPageSource;
import com.mangablade.backend.enums.MangaSourceType;
import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;

import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class MangaMapper {
    public Manga toEntity(OTruyenMangaResponse response) {
        return Manga.builder()
                .otruyenMangaId(response.getData().getItem().getOtruyenMangaId())
                .metadataSource(MangaSourceType.OTRUYEN)
                .chapterPageSource(ChapterPageSource.TRUYENQQ)
                .slug(response.getData().getItem().getSlug())
                .cloudinaryFolderSlug(response.getData().getItem().getSlug())
                .title(response.getData().getItem().getName())
                .description(response.getData().getItem().getDescription())
                .status(response.getData().getItem().getStatus())
                .thumbUrl(response.getData().getSeoOnPage().getSeoSchema().getThumbUrl())
                .createdAt(Instant.now())
                .updatedAt(response.getData().getSeoOnPage().getUpdatedAt())
                .build();
    }

    public MangaResponse toResponse(Manga manga) {
        return MangaResponse.builder()
                .slug(manga.getSlug())
                .title(manga.getTitle())
                .updatedAt(manga.getUpdatedAt())
                .latestChapter(new MangaResponse.LatestChapter())
                .thumbUrl(manga.getThumbUrl())
                .build();
    }
}
