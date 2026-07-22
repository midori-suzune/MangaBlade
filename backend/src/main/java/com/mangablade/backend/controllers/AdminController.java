package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.AdminUserUpdateRequest;
import com.mangablade.backend.dtos.request.AdminChapterReportReviewRequest;
import com.mangablade.backend.dtos.request.AdminContentReviewRequest;
import com.mangablade.backend.dtos.request.AdminMangaVisibilityRequest;
import com.mangablade.backend.dtos.response.AdminChapterReportResponse;
import com.mangablade.backend.dtos.response.AdminMangaResponse;
import com.mangablade.backend.dtos.response.AdminModerationChapterResponse;
import com.mangablade.backend.dtos.response.AdminModerationMangaResponse;
import com.mangablade.backend.dtos.response.AdminUserResponse;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.DashboardReadingStatsResponse;
import com.mangablade.backend.dtos.response.DashboardStatisticResponse;
import com.mangablade.backend.dtos.response.PageResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.ApprovalStatus;
import com.mangablade.backend.enums.ChapterReportStatus;
import com.mangablade.backend.enums.ChapterReportType;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.services.mangablade.AdminDashboardService;
import com.mangablade.backend.services.mangablade.AdminContentModerationService;
import com.mangablade.backend.services.mangablade.AdminMangaService;
import com.mangablade.backend.services.mangablade.ChapterReportService;
import com.mangablade.backend.services.mangablade.CommentReportService;
import com.mangablade.backend.services.mangablade.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final AdminDashboardService adminDashboardService;
    private final AdminContentModerationService adminContentModerationService;
    private final AdminMangaService adminMangaService;
    private final ChapterReportService chapterReportService;
    private final CommentReportService commentReportService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> getUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isBanned,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminUserResponse> users = userService.getUsersPaging(
                role,
                normalizeSearch(search),
                isBanned,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map(AdminUserResponse::from);

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<AdminUserResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách người dùng thành công")
                        .payload(PageResponse.from(users))
                        .build()
        );
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request
    ) {
        User userDetails = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .role(request.getRole())
                .build();
        User updatedUser = userService.updateUser(id, userDetails);

        return ResponseEntity.ok(
                ApiResponse.<AdminUserResponse>builder()
                        .success(true)
                        .message("Cập nhật người dùng thành công")
                        .payload(AdminUserResponse.from(updatedUser))
                        .build()
        );
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentAdmin
    ) {
        userService.deleteUser(id, currentAdmin.getId());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Xóa người dùng thành công")
                        .build()
        );
    }

    @PatchMapping("/users/{id}/toggle-ban")
    public ResponseEntity<ApiResponse<AdminUserResponse>> toggleBan(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentAdmin
    ) {
        User updatedUser = userService.toggleBanUser(id, currentAdmin.getId());
        return ResponseEntity.ok(
                ApiResponse.<AdminUserResponse>builder()
                        .success(true)
                        .message("Cập nhật trạng thái người dùng thành công")
                        .payload(AdminUserResponse.from(updatedUser))
                        .build()
        );
    }

    @GetMapping("/manga")
    public ResponseEntity<ApiResponse<PageResponse<AdminMangaResponse>>> getManga(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Page<AdminMangaResponse> manga = adminMangaService.findManga(
                normalizeSearch(search),
                normalizeSearch(status),
                normalizeSearch(origin),
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"))
        );

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<AdminMangaResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách truyện thành công")
                        .payload(PageResponse.from(manga))
                        .build()
        );
    }

    @PatchMapping("/manga/{id}/visibility")
    public ResponseEntity<ApiResponse<AdminMangaResponse>> toggleMangaVisibility(
            @PathVariable Long id,
            @Valid @RequestBody AdminMangaVisibilityRequest request,
            @AuthenticationPrincipal User currentAdmin
    ) {
        AdminMangaResponse manga = adminMangaService.toggleVisibility(id, request.getReason(), currentAdmin.getId());
        return ResponseEntity.ok(
                ApiResponse.<AdminMangaResponse>builder()
                        .success(true)
                        .message("Cập nhật trạng thái truyện thành công")
                        .payload(manga)
                        .build()
        );
    }

    @GetMapping("/chapter-reports")
    public ResponseEntity<ApiResponse<PageResponse<AdminChapterReportResponse>>> getChapterReports(
            @RequestParam(required = false) ChapterReportStatus status,
            @RequestParam(required = false) ChapterReportType type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminChapterReportResponse> reports = chapterReportService.findReports(
                status,
                type,
                normalizeSearch(search),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<AdminChapterReportResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách báo cáo lỗi chương thành công")
                        .payload(PageResponse.from(reports))
                        .build()
        );
    }

    @PatchMapping("/chapter-reports/{id}/review")
    public ResponseEntity<ApiResponse<AdminChapterReportResponse>> reviewChapterReport(
            @PathVariable Long id,
            @Valid @RequestBody AdminChapterReportReviewRequest request,
            @AuthenticationPrincipal User currentAdmin
    ) {
        Long adminId = currentAdmin == null ? null : currentAdmin.getId();
        AdminChapterReportResponse report = chapterReportService.review(id, request, adminId);
        return ResponseEntity.ok(
                ApiResponse.<AdminChapterReportResponse>builder()
                        .success(true)
                        .message("Cập nhật báo cáo lỗi chương thành công")
                        .payload(report)
                        .build()
        );
    }

    @GetMapping("/comment-reports")
    public ResponseEntity<ApiResponse<PageResponse<com.mangablade.backend.dtos.response.AdminCommentReportResponse>>> getCommentReports(
            @RequestParam(required = false) com.mangablade.backend.enums.CommentReportStatus status,
            @RequestParam(required = false) com.mangablade.backend.enums.CommentReportReason reason,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<com.mangablade.backend.dtos.response.AdminCommentReportResponse> reports = commentReportService.findReports(
                status,
                reason,
                normalizeSearch(search),
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"))
        );

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<com.mangablade.backend.dtos.response.AdminCommentReportResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách báo cáo bình luận thành công")
                        .payload(PageResponse.from(reports))
                        .build()
        );
    }

    @PatchMapping("/comment-reports/{id}/review")
    public ResponseEntity<ApiResponse<com.mangablade.backend.dtos.response.AdminCommentReportResponse>> reviewCommentReport(
            @PathVariable Long id,
            @Valid @RequestBody com.mangablade.backend.dtos.request.AdminCommentReportReviewRequest request,
            @AuthenticationPrincipal User currentAdmin
    ) {
        var report = commentReportService.review(id, request, currentAdmin);
        return ResponseEntity.ok(
                ApiResponse.<com.mangablade.backend.dtos.response.AdminCommentReportResponse>builder()
                        .success(true)
                        .message("Cập nhật báo cáo bình luận thành công")
                        .payload(report)
                        .build()
        );
    }

    @GetMapping("/content-moderation/manga")
    public ResponseEntity<ApiResponse<PageResponse<AdminModerationMangaResponse>>> getModerationManga(
            @RequestParam(required = false) ApprovalStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminModerationMangaResponse> manga = adminContentModerationService.findManga(
                status,
                normalizeSearch(search),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"))
        );

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<AdminModerationMangaResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách truyện cần kiểm duyệt thành công")
                        .payload(PageResponse.from(manga))
                        .build()
        );
    }

    @PatchMapping("/content-moderation/manga/{id}/review")
    public ResponseEntity<ApiResponse<AdminModerationMangaResponse>> reviewModerationManga(
            @PathVariable Long id,
            @Valid @RequestBody AdminContentReviewRequest request,
            @AuthenticationPrincipal User currentAdmin
    ) {
        Long adminId = currentAdmin == null ? null : currentAdmin.getId();
        AdminModerationMangaResponse manga = adminContentModerationService.reviewManga(id, request, adminId);

        return ResponseEntity.ok(
                ApiResponse.<AdminModerationMangaResponse>builder()
                        .success(true)
                        .message("Cập nhật kiểm duyệt truyện thành công")
                        .payload(manga)
                        .build()
        );
    }

    @GetMapping("/content-moderation/chapters")
    public ResponseEntity<ApiResponse<PageResponse<AdminModerationChapterResponse>>> getModerationChapters(
            @RequestParam(required = false) ApprovalStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminModerationChapterResponse> chapters = adminContentModerationService.findChapters(
                status,
                normalizeSearch(search),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"))
        );

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<AdminModerationChapterResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách chapter cần kiểm duyệt thành công")
                        .payload(PageResponse.from(chapters))
                        .build()
        );
    }

    @PatchMapping("/content-moderation/chapters/{id}/review")
    public ResponseEntity<ApiResponse<AdminModerationChapterResponse>> reviewModerationChapter(
            @PathVariable Long id,
            @Valid @RequestBody AdminContentReviewRequest request,
            @AuthenticationPrincipal User currentAdmin
    ) {
        Long adminId = currentAdmin == null ? null : currentAdmin.getId();
        AdminModerationChapterResponse chapter = adminContentModerationService.reviewChapter(id, request, adminId);

        return ResponseEntity.ok(
                ApiResponse.<AdminModerationChapterResponse>builder()
                        .success(true)
                        .message("Cập nhật kiểm duyệt chapter thành công")
                        .payload(chapter)
                        .build()
        );
    }

    @GetMapping("/dashboard/reading-stats")
    public ResponseEntity<ApiResponse<DashboardReadingStatsResponse>> getReadingStats(
            @RequestParam(defaultValue = "7") int days
    ) {
        return ResponseEntity.ok(
                ApiResponse.<DashboardReadingStatsResponse>builder()
                        .success(true)
                        .message("Lấy thống kê lượt đọc thành công")
                        .payload(adminDashboardService.getReadingStats(days))
                        .build()
        );
    }

    @GetMapping("/dashboard/statistics")
    public ResponseEntity<ApiResponse<DashboardStatisticResponse>> getStatistics() {
        return ResponseEntity.ok(
                ApiResponse.<DashboardStatisticResponse>builder()
                        .success(true)
                        .message("Lấy thống kê dashboard thành công")
                        .payload(adminDashboardService.getStatistics())
                        .build()
        );
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim();
    }
}
