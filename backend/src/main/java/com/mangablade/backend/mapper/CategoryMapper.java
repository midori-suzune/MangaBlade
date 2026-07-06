package com.mangablade.backend.mapper;


import com.mangablade.backend.entities.Category;
import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.integration.otruyen.response.OtruyenCategoryResponse;

import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(OtruyenCategoryResponse categoryResponse) {
        return Category.builder()
                .otruyenCategoryId(categoryResponse.getOtruyenCategoryId())
                .name(categoryResponse.getName())
                .slug(categoryResponse.getSlug())
                .build();

    }
}
