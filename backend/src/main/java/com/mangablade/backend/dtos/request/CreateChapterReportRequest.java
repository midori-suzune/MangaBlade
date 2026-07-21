package com.mangablade.backend.dtos.request;

import com.mangablade.backend.enums.ChapterReportType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateChapterReportRequest {
    @NotNull
    private ChapterReportType type;

    @Size(max = 100)
    private String pageHint;

    @NotBlank
    private String description;
}
