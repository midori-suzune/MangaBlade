package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.AuthorRequestCreateRequest;
import com.mangablade.backend.dtos.request.AuthorRequestReviewRequest;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.AuthorRequestResponse;
import com.mangablade.backend.dtos.response.PageResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.AuthorRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class AuthorRequestController {

    private final AuthorRequestService authorRequestService;

    @PostMapping("/author-requests")
    public ResponseEntity<ApiResponse<AuthorRequestResponse>> submitRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AuthorRequestCreateRequest req) {
        
        AuthorRequestResponse response = authorRequestService.submitRequest(user, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<AuthorRequestResponse>builder()
                        .success(true)
                        .message("Đăng ký làm tác giả thành công")
                        .payload(response)
                        .build()
        );
    }

    @GetMapping("/author-requests/me")
    public ResponseEntity<ApiResponse<AuthorRequestResponse>> getMyRequest(
            @AuthenticationPrincipal User user) {
        
        AuthorRequestResponse response = authorRequestService.getMyRequest(user).orElse(null);
        return ResponseEntity.ok(
                ApiResponse.<AuthorRequestResponse>builder()
                        .success(true)
                        .message("Lấy thông tin đăng ký thành công")
                        .payload(response)
                        .build()
        );
    }

    @GetMapping("/admin/author-requests")
    public ResponseEntity<ApiResponse<PageResponse<AuthorRequestResponse>>> getAllRequests(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        Page<AuthorRequestResponse> response = authorRequestService.getAllRequests(
                status,
                search,
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"))
        );
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<AuthorRequestResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách đăng ký thành công")
                        .payload(PageResponse.from(response))
                        .build()
        );
    }

    @PutMapping("/admin/author-requests/{id}/review")
    public ResponseEntity<ApiResponse<Void>> reviewRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody AuthorRequestReviewRequest req) {
        
        authorRequestService.reviewRequest(id, admin, req);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Đánh giá đơn đăng ký thành công")
                        .build()
        );
    }
}
