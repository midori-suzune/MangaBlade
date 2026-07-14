package com.mangablade.backend.services.otruyen;

import com.mangablade.backend.integration.otruyen.OTruyenClient;
import com.mangablade.backend.repositories.OTruyenImportTargetRepository;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
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
    private final OTruyenImportTargetRepository oTruyenImportTargetRepository;

    @Value("${spring.app.otruyen.importer.max-manga-per-run:1}")
    private int maxMangaPerRun;

    @Scheduled(cron = "${spring.app.otruyen.manga-import-cron}", zone = "Asia/Ho_Chi_Minh")
    public void fetchMangaData() {
        var pageSize = Math.max(maxMangaPerRun, 1);
        var targets = oTruyenImportTargetRepository.findNextTargets(PageRequest.of(0, pageSize));

        if (targets.isEmpty()) {
            log.info("No OTruyen import targets found");
            return;
        }

        log.info("Starting OTruyen manga import: targets={}", targets.size());

        for (var target : targets) {
            var importedAt = Instant.now();

            try {
                var response = oTruyenClient.fetchApiMangaBySlug(target.getSlug());
                oTruyenImportService.importManga(response, target);

                target.markSuccess(importedAt);
                log.info("Imported OTruyen manga: slug={}", target.getSlug());
            } catch (Exception e) {
                target.markFailure(importedAt);
                log.error("Failed to import manga: {}", target.getSlug(), e);
            }

            oTruyenImportTargetRepository.save(target);
        }

        log.info("Finished OTruyen manga import");
    }
}
