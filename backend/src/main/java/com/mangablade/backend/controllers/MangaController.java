package com.mangablade.backend.controllers;


import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.services.mangablade.MangaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/manga")
public class MangaController {

    private final MangaService mangaService;

    @GetMapping
    public ResponseEntity<ApiResponse<MangaResponse>> getManga() {
        var manga = mangaService.fetchAllManga();
        return ResponseEntity.ok(
                ApiResponse.<MangaResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(manga)
                        .build()
        );
    }
}
