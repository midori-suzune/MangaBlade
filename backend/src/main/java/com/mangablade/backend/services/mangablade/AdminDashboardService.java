package com.mangablade.backend.services.mangablade;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.mangablade.backend.dtos.response.DashboardReadingStatsResponse;
import com.mangablade.backend.dtos.response.DashboardStatisticResponse;
import com.mangablade.backend.dtos.response.DailyReadCountProjection;
import com.mangablade.backend.enums.AuthorRequestStatus;
import com.mangablade.backend.enums.ChapterReportStatus;
import com.mangablade.backend.repositories.AuthorRequestRepository;
import com.mangablade.backend.repositories.ChapterReadEventRepository;
import com.mangablade.backend.repositories.ChapterReportRepository;
import com.mangablade.backend.repositories.CommentRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.repositories.UserRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private static final int DEFAULT_READING_STATS_DAYS = 7;
    private static final int MAX_READING_STATS_DAYS = 31;

    private final ChapterReadEventRepository chapterReadEventRepository;
    private final UserRepository userRepository;
    private final MangaRepository mangaRepository;
    private final CommentRepository commentRepository;
    private final AuthorRequestRepository authorRequestRepository;
    private final ChapterReportRepository chapterReportRepository;

    public DashboardStatisticResponse getStatistics() {
        LocalDate today = LocalDate.now(Clock.systemUTC());
        var startAt = today.atStartOfDay().toInstant(ZoneOffset.UTC);
        var endAt = today.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        return DashboardStatisticResponse.builder()
                .totalUsers(userRepository.count())
                .newUsersToday(userRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startAt, endAt))
                .totalManga(mangaRepository.count())
                .newMangaToday(mangaRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startAt, endAt))
                .ongoingManga(mangaRepository.countByStatus("ongoing"))
                .completedManga(mangaRepository.countByStatus("completed"))
                .hiddenManga(mangaRepository.countByDeletedAtIsNotNull())
                .totalComments(commentRepository.count())
                .newCommentsToday(commentRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startAt, endAt))
                .totalAuthorRequests(authorRequestRepository.count())
                .pendingAuthorRequests(authorRequestRepository.countByStatus(AuthorRequestStatus.PENDING))
                .pendingChapterReports(chapterReportRepository.countByStatusIn(List.of(
                        ChapterReportStatus.PENDING,
                        ChapterReportStatus.CHECKING
                )))
                .build();
    }

    public DashboardReadingStatsResponse getReadingStats(int days) {
        int normalizedDays = normalizeDays(days);
        LocalDate today = LocalDate.now(Clock.systemUTC());
        LocalDate startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endDate = startDate.plusDays(normalizedDays);
        LocalDate previousStartDate = startDate.minusDays(normalizedDays);

        var startAt = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        var endAt = endDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        var previousStartAt = previousStartDate.atStartOfDay().toInstant(ZoneOffset.UTC);

        List<DailyReadCountProjection> readCountRows = chapterReadEventRepository.countReadsByDate(startAt, endAt);

        Map<LocalDate, Long> readsByDate = new HashMap<>();

        for (DailyReadCountProjection row : readCountRows) {
            LocalDate readDate = row.getReadDate();
            Long readCount = row.getReadCount();
            readsByDate.put(readDate, readCount == null ? 0L : readCount);
        }

        List<DashboardReadingStatsResponse.DailyReadStat> dailyReads = new ArrayList<>();
        for (int i = 0; i < normalizedDays; i++) {
            LocalDate date = startDate.plusDays(i);
            DashboardReadingStatsResponse.DailyReadStat dailyRead = DashboardReadingStatsResponse.DailyReadStat.builder()
                    .date(date)
                    .label(toVietnameseWeekdayLabel(date))
                    .reads(readsByDate.getOrDefault(date, 0L))
                    .build();
            dailyReads.add(dailyRead);
        }

        long totalReads = 0;
        for (DashboardReadingStatsResponse.DailyReadStat dailyRead : dailyReads) {
            totalReads += dailyRead.getReads();
        }

        long previousTotalReads = chapterReadEventRepository.countByReadAtGreaterThanEqualAndReadAtLessThan(
                previousStartAt,
                startAt
        );

        return DashboardReadingStatsResponse.builder()
                .totalReads(totalReads)
                .previousTotalReads(previousTotalReads)
                .readDelta(totalReads - previousTotalReads)
                .dailyReads(dailyReads)
                .build();
    }

    private int normalizeDays(int days) {
        if (days <= 0) {
            return DEFAULT_READING_STATS_DAYS;
        }

        return Math.min(days, MAX_READING_STATS_DAYS);
    }

    private String toVietnameseWeekdayLabel(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> "T2";
            case TUESDAY -> "T3";
            case WEDNESDAY -> "T4";
            case THURSDAY -> "T5";
            case FRIDAY -> "T6";
            case SATURDAY -> "T7";
            case SUNDAY -> "CN";
        };
    }
}
