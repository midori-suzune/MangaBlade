package com.mangablade.backend.mapper;

import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.integration.otruyen.response.OTruyenChapterResponse;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ChapterMapper {

    public Chapter toEntity(OTruyenChapterResponse.ChapterData chapterData , Manga manga) {
        return Chapter.builder()
                .mangaId(manga.getId())
                .chapterApiUrl(chapterData.getChapterApiUrl())
                .title(chapterData.getTitle())
                .chapterNumber(chapterData.getChapterNumber())
                .chapterSort(toChapterSort(chapterData.getChapterNumber()))
                .createdAt(manga.getCreatedAt())
                .build();
    }

    private BigDecimal toChapterSort(String chapterNumber) {
        if (chapterNumber == null || chapterNumber.isBlank()) {
            return null;
        }

        try {
            return new BigDecimal(chapterNumber.trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
