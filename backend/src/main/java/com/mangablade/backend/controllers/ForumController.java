package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.request.CreateForumCommentRequest;
import com.mangablade.backend.dtos.request.CreateForumThreadRequest;
import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.CommentLikeResponse;
import com.mangablade.backend.dtos.response.ForumCommentResponse;
import com.mangablade.backend.dtos.response.ForumThreadResponse;
import com.mangablade.backend.dtos.response.PageResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.ForumThreadCategory;
import com.mangablade.backend.services.mangablade.ForumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/forum")
public class ForumController {
    private final ForumService forumService;

    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<PageResponse<ForumThreadResponse>>> getThreads(
            @RequestParam(required = false) ForumThreadCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ForumThreadResponse>>builder()
                        .success(true)
                        .message("success")
                        .payload(forumService.findThreads(category, page, size))
                        .build()
        );
    }

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<ApiResponse<ForumThreadResponse>> getThread(@PathVariable Long threadId) {
        return ResponseEntity.ok(
                ApiResponse.<ForumThreadResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(forumService.findThread(threadId))
                        .build()
        );
    }

    @PostMapping("/threads")
    public ResponseEntity<ApiResponse<ForumThreadResponse>> createThread(
            @Valid @RequestBody CreateForumThreadRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ForumThreadResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(forumService.createThread(request, user))
                        .build()
        );
    }

    @DeleteMapping("/threads/{threadId}")
    public ResponseEntity<ApiResponse<Void>> deleteThread(
            @PathVariable Long threadId,
            @AuthenticationPrincipal User user
    ) {
        forumService.deleteThread(threadId, user);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("success")
                        .build()
        );
    }

    @GetMapping("/threads/{threadId}/comments")
    public ResponseEntity<ApiResponse<List<ForumCommentResponse>>> getComments(
            @PathVariable Long threadId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                ApiResponse.<List<ForumCommentResponse>>builder()
                        .success(true)
                        .message("success")
                        .payload(forumService.findComments(threadId, user))
                        .build()
        );
    }

    @PostMapping("/threads/{threadId}/comments")
    public ResponseEntity<ApiResponse<ForumCommentResponse>> createComment(
            @PathVariable Long threadId,
            @Valid @RequestBody CreateForumCommentRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ForumCommentResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(forumService.createComment(threadId, request, user))
                        .build()
        );
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user
    ) {
        forumService.deleteComment(commentId, user);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("success")
                        .build()
        );
    }

    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<ApiResponse<CommentLikeResponse>> toggleCommentLike(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                ApiResponse.<CommentLikeResponse>builder()
                        .success(true)
                        .message("success")
                        .payload(forumService.toggleCommentLike(commentId, user))
                        .build()
        );
    }
}
