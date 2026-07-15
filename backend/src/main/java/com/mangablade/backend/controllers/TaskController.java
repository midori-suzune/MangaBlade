package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.DailyStatusResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/daily-status")
    public ResponseEntity<ApiResponse<DailyStatusResponse>> getDailyStatus(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.<DailyStatusResponse>builder()
                        .success(true)
                        .message("Daily status retrieved successfully")
                        .payload(taskService.getDailyStatus(user.getId()))
                        .build()
        );
    }

    @PostMapping("/claim-checkin")
    public ResponseEntity<ApiResponse<Integer>> claimCheckIn(@AuthenticationPrincipal User user) {
        int expGained = taskService.claimCheckIn(user.getId());
        return ResponseEntity.ok(
                ApiResponse.<Integer>builder()
                        .success(true)
                        .message("Check-in reward claimed successfully")
                        .payload(expGained)
                        .build()
        );
    }

    @PostMapping("/spin-wheel")
    public ResponseEntity<ApiResponse<Integer>> spinWheel(@AuthenticationPrincipal User user) {
        int expGained = taskService.spinWheel(user.getId());
        return ResponseEntity.ok(
                ApiResponse.<Integer>builder()
                        .success(true)
                        .message("Lucky wheel spun successfully")
                        .payload(expGained)
                        .build()
        );
    }

    @PostMapping("/claim-achievement/{achievementId}")
    public ResponseEntity<ApiResponse<Integer>> claimAchievement(
            @AuthenticationPrincipal User user,
            @PathVariable Long achievementId
    ) {
        int expGained = taskService.claimAchievement(user.getId(), achievementId);
        return ResponseEntity.ok(
                ApiResponse.<Integer>builder()
                        .success(true)
                        .message("Achievement reward claimed successfully")
                        .payload(expGained)
                        .build()
        );
    }
}
