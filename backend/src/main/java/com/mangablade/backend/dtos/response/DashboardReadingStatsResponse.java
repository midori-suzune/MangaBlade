package com.mangablade.backend.dtos.response;

import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardReadingStatsResponse {
    private long totalReads;
    private long previousTotalReads;
    private long readDelta;
    private List<DailyReadStat> dailyReads;

    @Data
    @Builder
    public static class DailyReadStat {
        private LocalDate date;
        private String label;
        private long reads;
    }
}
