package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.CategoryResponse;
import com.mangablade.backend.repositories.CategoryRepository;
import com.mangablade.backend.services.mangablade.CategoryService;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> fetchAllCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(category -> CategoryResponse.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .slug(category.getSlug())
                        .build())
                .toList();
    }
}
