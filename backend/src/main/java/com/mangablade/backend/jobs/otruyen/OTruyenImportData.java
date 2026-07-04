package com.mangablade.backend.jobs.otruyen;


import com.mangablade.backend.services.otruyen.OTruyenImportService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OTruyenImportData {

    private final OTruyenImportService importDataService;

    @Scheduled(cron = "${spring.app.otruyen.import-cron}" , zone = "Asia/Ho_Chi_Minh")
    public void importData(){
        importDataService.importManga("wind-breaker");
    }

}
