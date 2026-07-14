package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.MangaAuthorProjection;
import com.mangablade.backend.repositories.MangaAuthorRepository;
import com.mangablade.backend.services.mangablade.AuthorService;

import org.springframework.stereotype.Service;

import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {

    private final MangaAuthorRepository mangaAuthorRepository;

    @Override
    public List<MangaAuthorProjection> findByMangaId(Long mangaId) {
        return mangaAuthorRepository.findAuthorsByMangaId(mangaId);
    }
}
