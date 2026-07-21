package com.mangablade.backend.dtos.request;

import com.mangablade.backend.enums.ChapterReportStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminChapterReportReviewRequest {
    @NotNull
    private ChapterReportStatus status;

    @Size(max = 1000)
    private String rejectReason;
}
