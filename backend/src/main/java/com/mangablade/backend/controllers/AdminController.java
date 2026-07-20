package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.AdminUserUpdateRequest;
import com.mangablade.backend.dtos.response.AdminUserResponse;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.DashboardReadingStatsResponse;
import com.mangablade.backend.dtos.response.DashboardStatisticResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.UserRole;
import com.mangablade.backend.services.mangablade.AdminDashboardService;
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

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getUsers(
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
                ApiResponse.<Page<AdminUserResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách người dùng thành công")
                        .payload(users)
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
