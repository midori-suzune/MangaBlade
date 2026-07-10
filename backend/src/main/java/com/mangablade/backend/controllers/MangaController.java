package com.mangablade.backend.controllers;


import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.MangaDetailResponse;
import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.services.mangablade.MangaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/manga")
public class MangaController {

    private final MangaService mangaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MangaResponse>>> getManga() {
        var manga = mangaService.fetchAllManga();
        return ResponseEntity.ok(
                ApiResponse.<List<MangaResponse>>builder()
                        .success(true)
                        .message("success")
                        .payload(manga)
                        .build()
        );
    }

    @PostMapping("/{slug}")
    public ResponseEntity<ApiResponse<MangaDetailResponse>> showMangaDetail(@PathVariable String slug) {
        var mangaDetail = mangaService.fetchMangaDetailBySlug(slug);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.<MangaDetailResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(mangaDetail)
                        .build()
        );

    }
}
