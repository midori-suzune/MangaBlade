package com.mangablade.backend.controllers;


import com.mangablade.backend.dtos.request.CreateCommentRequest;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.MangaCommentResponse;
import com.mangablade.backend.dtos.response.MangaDetailResponse;
import com.mangablade.backend.dtos.response.MangaInteractionResponse;
import com.mangablade.backend.dtos.response.MangaRankingResponse;
import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.CommentService;
import com.mangablade.backend.services.mangablade.MangaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/manga")
public class MangaController {

    private final MangaService mangaService;
    private final CommentService commentService;

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

    @GetMapping("/ranking")
    public ResponseEntity<ApiResponse<List<MangaRankingResponse>>> getRanking(
            @RequestParam(defaultValue = "likes") String sort
    ) {
        var ranking = mangaService.fetchRanking(sort);
        return ResponseEntity.ok(
                ApiResponse.<List<MangaRankingResponse>>builder()
                        .success(true)
                        .message("success")
                        .payload(ranking)
                        .build()
        );
    }

    @PostMapping("/{slug}")
    public ResponseEntity<ApiResponse<MangaDetailResponse>> showMangaDetail(
            @PathVariable String slug,
            @AuthenticationPrincipal User user
    ) {
        var mangaDetail = mangaService.fetchMangaDetailBySlug(slug, user != null ? user.getId() : null);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.<MangaDetailResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(mangaDetail)
                        .build()
        );

    }

    @PostMapping("/{slug}/follow")
    public ResponseEntity<ApiResponse<MangaInteractionResponse>> toggleFollow(
            @PathVariable String slug,
            @AuthenticationPrincipal User user
    ) {
        var interaction = mangaService.toggleFollow(slug, user.getId());
        return ResponseEntity.ok(
                ApiResponse.<MangaInteractionResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(interaction)
                        .build()
        );
    }

    @PostMapping("/{slug}/like")
    public ResponseEntity<ApiResponse<MangaInteractionResponse>> toggleLike(
            @PathVariable String slug,
            @AuthenticationPrincipal User user
    ) {
        var interaction = mangaService.toggleLike(slug, user.getId());
        return ResponseEntity.ok(
                ApiResponse.<MangaInteractionResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(interaction)
                        .build()
        );
    }

    @GetMapping("/{slug}/comments")
    public ResponseEntity<ApiResponse<List<MangaCommentResponse>>> getComments(@PathVariable String slug) {
        var comments = commentService.findByMangaSlug(slug);
        return ResponseEntity.ok(
                ApiResponse.<List<MangaCommentResponse>>builder()
                        .success(true)
                        .message("success")
                        .payload(comments)
                        .build()
        );
    }

    @PostMapping("/{slug}/comments")
    public ResponseEntity<ApiResponse<MangaCommentResponse>> createComment(
            @PathVariable String slug,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal User user
    ) {
        var comment = commentService.create(slug, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<MangaCommentResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(comment)
                        .build()
        );
    }
}
