package com.mangablade.backend.controllers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.NotificationResponse;
import com.mangablade.backend.dtos.response.PageResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getMine(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<NotificationResponse> notifications = notificationService.findMine(
                user.getId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<NotificationResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách thông báo thành công")
                        .payload(PageResponse.from(notifications))
                        .build()
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> countUnread(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.<Long>builder()
                        .success(true)
                        .message("Lấy số thông báo chưa đọc thành công")
                        .payload(notificationService.countUnread(user.getId()))
                        .build()
        );
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        NotificationResponse notification = notificationService.markRead(user.getId(), id);

        return ResponseEntity.ok(
                ApiResponse.<NotificationResponse>builder()
                        .success(true)
                        .message("Đánh dấu thông báo đã đọc thành công")
                        .payload(notification)
                        .build()
        );
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal User user) {
        notificationService.markAllRead(user.getId());

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Đánh dấu tất cả thông báo đã đọc thành công")
                        .build()
        );
    }
}
