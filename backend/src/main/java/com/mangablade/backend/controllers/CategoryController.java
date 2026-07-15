package com.mangablade.backend.controllers;

import com.mangablade.backend.dtos.response.ApiResponse;
import com.mangablade.backend.dtos.response.CategoryResponse;
import com.mangablade.backend.services.mangablade.CategoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        var categories = categoryService.fetchAllCategories();
        return ResponseEntity.ok(
                ApiResponse.<List<CategoryResponse>>builder()
                        .success(true)
                        .message("success")
                        .payload(categories)
                        .build()
        );
    }
}
