package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.AuthorChapterCreateRequest;
import com.mangablade.backend.dtos.request.AuthorMangaCreateRequest;
import com.mangablade.backend.dtos.response.*;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.AuthorMangaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/author")
@RequiredArgsConstructor
public class AuthorMangaController {

    private final AuthorMangaService authorMangaService;

    // ==========================================
    // STATISTICS ENDPOINTS
    // ==========================================

    @GetMapping("/stats/overview")
    public ResponseEntity<ApiResponse<AuthorStatsOverviewResponse>> getStatsOverview(
            @AuthenticationPrincipal User user
    ) {
        AuthorStatsOverviewResponse response = authorMangaService.getStatsOverview(user);
        return ResponseEntity.ok(
                ApiResponse.<AuthorStatsOverviewResponse>builder()
                        .success(true)
                        .message("Lấy thống kê tổng quan thành công!")
                        .payload(response)
                        .build()
        );
    }

    @GetMapping("/stats/mangas")
    public ResponseEntity<ApiResponse<Page<AuthorMangaStatsResponse>>> getMangaStats(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<AuthorMangaStatsResponse> response = authorMangaService.getMangaStats(user, pageable);
        return ResponseEntity.ok(
                ApiResponse.<Page<AuthorMangaStatsResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách thống kê từng tác phẩm thành công!")
                        .payload(response)
                        .build()
        );
    }

    // ==========================================
    // MANGA ENDPOINTS
    // ==========================================

    @PostMapping("/manga")
    public ResponseEntity<ApiResponse<AuthorMangaResponse>> createManga(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AuthorMangaCreateRequest request
    ) {
        AuthorMangaResponse response = authorMangaService.createManga(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<AuthorMangaResponse>builder()
                        .success(true)
                        .message("Tạo bản nháp truyện thành công!")
                        .payload(response)
                        .build()
        );
    }

    @PostMapping("/manga/{identifier}/cover")
    public ResponseEntity<ApiResponse<AuthorMangaResponse>> uploadCover(
            @AuthenticationPrincipal User user,
            @PathVariable String identifier,
            @RequestParam("file") MultipartFile file
    ) {
        AuthorMangaResponse response = authorMangaService.uploadCover(user, identifier, file);
        return ResponseEntity.ok(
                ApiResponse.<AuthorMangaResponse>builder()
                        .success(true)
                        .message("Tải ảnh bìa lên Cloudinary thành công!")
                        .payload(response)
                        .build()
        );
    }

    @GetMapping("/manga")
    public ResponseEntity<ApiResponse<Page<AuthorMangaResponse>>> getMyMangas(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<AuthorMangaResponse> response = authorMangaService.getMyMangas(user, pageable);
        return ResponseEntity.ok(
                ApiResponse.<Page<AuthorMangaResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách truyện thành công!")
                        .payload(response)
                        .build()
        );
    }

    @GetMapping("/manga/{identifier}")
    public ResponseEntity<ApiResponse<AuthorMangaResponse>> getMangaByIdentifier(
            @AuthenticationPrincipal User user,
            @PathVariable String identifier
    ) {
        AuthorMangaResponse response = authorMangaService.getMangaByIdentifier(user, identifier);
        return ResponseEntity.ok(
                ApiResponse.<AuthorMangaResponse>builder()
                        .success(true)
                        .message("Lấy thông tin truyện thành công!")
                        .payload(response)
                        .build()
        );
    }

    @PutMapping("/manga/{identifier}")
    public ResponseEntity<ApiResponse<AuthorMangaResponse>> updateManga(
            @AuthenticationPrincipal User user,
            @PathVariable String identifier,
            @Valid @RequestBody AuthorMangaCreateRequest request
    ) {
        AuthorMangaResponse response = authorMangaService.updateManga(user, identifier, request);
        return ResponseEntity.ok(
                ApiResponse.<AuthorMangaResponse>builder()
                        .success(true)
                        .message("Cập nhật thông tin truyện thành công!")
                        .payload(response)
                        .build()
        );
    }

    @DeleteMapping("/manga/{identifier}")
    public ResponseEntity<ApiResponse<Void>> deleteManga(
            @AuthenticationPrincipal User user,
            @PathVariable String identifier
    ) {
        authorMangaService.deleteManga(user, identifier);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Xóa bản nháp truyện thành công!")
                        .build()
        );
    }

    @PostMapping("/manga/{identifier}/submit")
    public ResponseEntity<ApiResponse<Void>> submitManga(
            @AuthenticationPrincipal User user,
            @PathVariable String identifier
    ) {
        authorMangaService.submitManga(user, identifier);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Gửi duyệt bộ truyện thành công! Bộ truyện đang chờ Admin kiểm duyệt.")
                        .build()
        );
    }

    @PostMapping("/manga/{identifier}/cancel-submit")
    public ResponseEntity<ApiResponse<Void>> cancelMangaSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable String identifier
    ) {
        authorMangaService.cancelMangaSubmission(user, identifier);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Hủy yêu cầu duyệt bộ truyện thành công!")
                        .build()
        );
    }

    // ==========================================
    // CHAPTER ENDPOINTS
    // ==========================================

    @GetMapping("/manga/{identifier}/chapters")
    public ResponseEntity<ApiResponse<Page<AuthorChapterResponse>>> getChapters(
            @AuthenticationPrincipal User user,
            @PathVariable String identifier,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<AuthorChapterResponse> response = authorMangaService.getChapters(user, identifier, pageable);
        return ResponseEntity.ok(
                ApiResponse.<Page<AuthorChapterResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách chương thành công!")
                        .payload(response)
                        .build()
        );
    }

    @PostMapping("/manga/{identifier}/chapters")
    public ResponseEntity<ApiResponse<AuthorChapterResponse>> createChapter(
            @AuthenticationPrincipal User user,
            @PathVariable String identifier,
            @Valid @RequestBody AuthorChapterCreateRequest request
    ) {
        AuthorChapterResponse response = authorMangaService.createChapter(user, identifier, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<AuthorChapterResponse>builder()
                        .success(true)
                        .message("Tạo chương mới thành công!")
                        .payload(response)
                        .build()
        );
    }

    @GetMapping("/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<AuthorChapterResponse>> getChapterDetail(
            @AuthenticationPrincipal User user,
            @PathVariable Long chapterId
    ) {
        AuthorChapterResponse response = authorMangaService.getChapterDetail(user, chapterId);
        return ResponseEntity.ok(
                ApiResponse.<AuthorChapterResponse>builder()
                        .success(true)
                        .message("Lấy thông tin chương thành công!")
                        .payload(response)
                        .build()
        );
    }

    @PutMapping("/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<AuthorChapterResponse>> updateChapter(
            @AuthenticationPrincipal User user,
            @PathVariable Long chapterId,
            @Valid @RequestBody AuthorChapterCreateRequest request
    ) {
        AuthorChapterResponse response = authorMangaService.updateChapter(user, chapterId, request);
        return ResponseEntity.ok(
                ApiResponse.<AuthorChapterResponse>builder()
                        .success(true)
                        .message("Cập nhật thông tin chương thành công!")
                        .payload(response)
                        .build()
        );
    }

    @DeleteMapping("/chapters/{chapterId}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(
            @AuthenticationPrincipal User user,
            @PathVariable Long chapterId
    ) {
        authorMangaService.deleteChapter(user, chapterId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Xóa chương truyện thành công!")
                        .build()
        );
    }

    @PostMapping("/chapters/{chapterId}/submit")
    public ResponseEntity<ApiResponse<Void>> submitChapter(
            @AuthenticationPrincipal User user,
            @PathVariable Long chapterId
    ) {
        authorMangaService.submitChapter(user, chapterId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Gửi duyệt chương thành công! Chương đang chờ Admin kiểm duyệt.")
                        .build()
        );
    }

    @PostMapping("/chapters/{chapterId}/cancel-submit")
    public ResponseEntity<ApiResponse<Void>> cancelChapterSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long chapterId
    ) {
        authorMangaService.cancelChapterSubmission(user, chapterId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Hủy yêu cầu duyệt chương thành công!")
                        .build()
        );
    }

    // ==========================================
    // CHAPTER PAGES ENDPOINTS
    // ==========================================

    @GetMapping("/chapters/{chapterId}/pages")
    public ResponseEntity<ApiResponse<List<AuthorChapterPageResponse>>> getChapterPages(
            @AuthenticationPrincipal User user,
            @PathVariable Long chapterId
    ) {
        List<AuthorChapterPageResponse> response = authorMangaService.getChapterPages(user, chapterId);
        return ResponseEntity.ok(
                ApiResponse.<List<AuthorChapterPageResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách ảnh trang thành công!")
                        .payload(response)
                        .build()
        );
    }

    @PostMapping("/chapters/{chapterId}/pages/upload")
    public ResponseEntity<ApiResponse<List<AuthorChapterPageResponse>>> uploadChapterPages(
            @AuthenticationPrincipal User user,
            @PathVariable Long chapterId,
            @RequestParam("files") MultipartFile[] files
    ) {
        List<AuthorChapterPageResponse> response = authorMangaService.uploadChapterPages(user, chapterId, files);
        return ResponseEntity.ok(
                ApiResponse.<List<AuthorChapterPageResponse>>builder()
                        .success(true)
                        .message("Tải danh sách ảnh trang truyện lên Cloudinary thành công!")
                        .payload(response)
                        .build()
        );
    }
}
