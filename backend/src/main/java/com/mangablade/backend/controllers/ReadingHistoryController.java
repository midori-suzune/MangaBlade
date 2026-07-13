package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.ReadingHistoryResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.ChapterService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/reading-history")
public class ReadingHistoryController {

    private final ChapterService chapterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReadingHistoryResponse>>> getReadingHistory(
            @AuthenticationPrincipal User user
    ) {
        var history = chapterService.fetchReadingHistory(user.getId());
        return ResponseEntity.ok(
                ApiResponse.<List<ReadingHistoryResponse>>builder()
                        .success(true)
                        .message("success")
                        .payload(history)
                        .build()
        );
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ReadingHistoryResponse>> getLatestReadingHistory(
            @PathVariable String slug,
            @AuthenticationPrincipal User user
    ) {
        var history = chapterService.fetchLatestReadingHistory(user.getId(), slug).orElse(null);
        return ResponseEntity.ok(
                ApiResponse.<ReadingHistoryResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(history)
                        .build()
        );
    }
}
