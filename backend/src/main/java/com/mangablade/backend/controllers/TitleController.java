package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.TitleResponse;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.services.mangablade.TitleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/titles")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TitleController {

    private final TitleService titleService;

    @GetMapping("/unlocked")
    public ResponseEntity<ApiResponse<List<TitleResponse>>> getUnlockedTitles(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.<List<TitleResponse>>builder()
                        .success(true)
                        .message("Unlocked titles retrieved successfully")
                        .payload(titleService.getUnlockedTitles(user.getId()))
                        .build()
        );
    }

    @PostMapping("/equip")
    public ResponseEntity<ApiResponse<Void>> equipTitle(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long titleId
    ) {
        titleService.equipTitle(user.getId(), titleId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Title equipped successfully")
                        .build()
        );
    }
}
