package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.ChapterPageRequest;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.ChapterPageResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.ChapterService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j

@RequestMapping("api/v1/chapter")
public class ChapterController {

    private final ChapterService chapterService ;

    @PostMapping
    public ResponseEntity<ApiResponse<List<ChapterPageResponse>>> getChapterPageRequest(
            @RequestBody ChapterPageRequest request,
            @AuthenticationPrincipal User user
    ){
        log.info(
                "Chapter request: slugManga={}, userId={}, username={}, role={}",
                request.getSlugManga(),
                user != null ? user.getId() : null,
                user != null ? user.getUsername() : null,
                user != null ? user.getRole() : null
        );
        var chapterPage = chapterService.fetchChapterPage(request.getSlugManga(), request.getChapterNumber());
        chapterService.recordChapterRead(
                user != null ? user.getId() : null,
                request.getSlugManga(),
                request.getChapterNumber()
        );
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.<List<ChapterPageResponse>>builder()
                        .success(true)
                        .message("Success")
                        .payload(chapterPage)
                        .build()
        );
    }
}
