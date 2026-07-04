package com.mangablade.backend.services.otruyen;


import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.entities.ChapterPage;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.integration.otruyen.OTruyenClient;
import com.mangablade.backend.integration.otruyen.response.OTruyenChapterResponse;
import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;
import com.mangablade.backend.mapper.ChapterMapper;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.ChapterPageRepository;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OTruyenImportService {
    private final MangaRepository mangaRepository;
    private final MangaMapper mangaMapper;
    private final ChapterMapper chapterMapper;
    private final ChapterRepository chapterRepository;
    private final OTruyenClient oTruyenClient;
    private final ChapterPageRepository chapterPageRepository;

    @Scheduled(cron = "${spring.app.otruyen.manga-import-cron}", zone = "Asia/Ho_Chi_Minh")
    public void fetchMangaData() {
        // fetch api
        var response = oTruyenClient.fetchMangaBySlug("wind-breaker");
        var manga = importManga(response);
        importChapter(response, manga);
    }

    @Scheduled(cron = "${spring.app.otruyen.chapter-page-import-cron}", zone = "Asia/Ho_Chi_Minh")
    public void fetchChapterPages() {
        var chapters = chapterRepository.findChaptersWithoutPages(PageRequest.of(0, 5));

        for (Chapter chapter : chapters) {
            var response = oTruyenClient.fetchChapterByUrl(chapter.getChapterApiUrl());

            String domain = response.getData().getDomainCdn();
            String chapterPath = response.getData().getItem().getChapterPath();
            var images = response.getData().getItem().getChapterImages();

            if (images != null) {
                List<ChapterPage> chapterPages = new ArrayList<>();
                Instant createdAt = Instant.now();

                for (var image : images) {
                    String imageUrl = domain + "/" + chapterPath + "/" + image.getImageFile();

                    chapterPages.add(ChapterPage.builder()
                            .chapterId(chapter.getId())
                            .pageNumber(image.getPageNumber())
                            .imageUrl(imageUrl)
                            .createdAt(createdAt)
                            .build());
                }

                chapterPageRepository.saveAll(chapterPages);
            }
        }
    }

    public Manga importManga(OTruyenMangaResponse response) {
        // save manga
        var newManga = mangaMapper.toEntity(response);
        var manga = mangaRepository.findByOtruyenMangaId(response.getData().getItem().getId()).orElse(newManga);
        return mangaRepository.save(manga);
    }

    public void importChapter(OTruyenMangaResponse response, Manga manga) {

        Map<String, OTruyenChapterResponse.ChapterData> remoteChapters = new LinkedHashMap<>();

        // Deduplicate remote chapters by number, keeping the latest entry.
        for (var server : response.getData().getItem().getChapters()) {
            for (var chapterData : server.getSeverData()) {
                String chapterNumber = chapterData.getChapterNumber();

                if (chapterNumber != null) {
                    remoteChapters.put(chapterNumber, chapterData);
                }
            }
        }

        Map<String, Chapter> existingChapters = new HashMap<>();

        // query chapter and add it into map [ 102 | chapter entity  ]
        for (Chapter chapter : chapterRepository.findAllByMangaId(manga.getId())) {
            existingChapters.put(chapter.getChapterNumber(), chapter);
        }

        List<Chapter> chaptersToSave = new ArrayList<>();

        // Create missing chapters and update existing chapter metadata.
        for (var chapterData : remoteChapters.values()) {

            Chapter chapter = existingChapters.get(chapterData.getChapterNumber());

            if (chapter == null) {
                chapter = chapterMapper.toEntity(chapterData, manga);
            } else {
                chapter.setChapterApiUrl(chapterData.getChapterApiUrl());
                chapter.setTitle(chapterData.getTitle());
            }

            chaptersToSave.add(chapter);
        }

        chapterRepository.saveAll(chaptersToSave);
    }
}
