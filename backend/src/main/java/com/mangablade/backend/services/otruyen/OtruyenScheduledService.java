package com.mangablade.backend.services.otruyen;

import com.mangablade.backend.integration.otruyen.OTruyenClient;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtruyenScheduledService {
    private final OTruyenClient oTruyenClient;
    private final OTruyenImportService oTruyenImportService;

    @Scheduled(cron = "${spring.app.otruyen.manga-import-cron}", zone = "Asia/Ho_Chi_Minh")
    public void fetchMangaData() {
        try {
            var response = oTruyenClient.fetchApiMangaBySlug("wind-breaker");
            var manga = oTruyenImportService.importManga(response);
            oTruyenImportService.importChapter(response, manga);
        } catch (Exception e) {
            log.error("Failed to import manga: wind-breaker", e);
        }
    }
}
