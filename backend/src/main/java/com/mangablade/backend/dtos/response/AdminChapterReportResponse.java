package com.mangablade.backend.dtos.response;

import java.time.Instant;

import com.mangablade.backend.entities.ChapterReport;
import com.mangablade.backend.enums.ChapterReportStatus;
import com.mangablade.backend.enums.ChapterReportType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminChapterReportResponse {
    private Long id;
    private String mangaTitle;
    private String mangaSlug;
    private String chapterNumber;
    private String chapterTitle;
    private ChapterReportType type;
    private String reporter;
    private String description;
    private ChapterReportStatus status;
    private Instant createdAt;
    private String rejectReason;

    public static AdminChapterReportResponse from(ChapterReport report) {
        return AdminChapterReportResponse.builder()
                .id(report.getId())
                .mangaTitle(report.getManga() == null ? "-" : report.getManga().getTitle())
                .mangaSlug(report.getManga() == null ? "" : report.getManga().getSlug())
                .chapterNumber(report.getChapter() == null ? "" : report.getChapter().getChapterNumber())
                .chapterTitle(report.getChapter() == null ? "" : report.getChapter().getTitle())
                .type(report.getType())
                .reporter(report.getReporter() == null ? "-" : report.getReporter().getUsername())
                .description(report.getDescription())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .rejectReason(report.getRejectReason())
                .build();
    }
}
