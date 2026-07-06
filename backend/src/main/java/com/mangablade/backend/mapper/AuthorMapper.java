package com.mangablade.backend.mapper;

import com.mangablade.backend.entities.Author;
import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuthorMapper {

    public Author toEntity( String author) {
        return Author.builder()
                .name(author)
                .build();
    }
}
