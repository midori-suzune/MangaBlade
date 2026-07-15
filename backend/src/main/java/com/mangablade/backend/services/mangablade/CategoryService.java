package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> fetchAllCategories();
}
