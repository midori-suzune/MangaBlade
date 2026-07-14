package com.mangablade.backend.services.otruyen;


import com.mangablade.backend.entities.*;
import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;
import com.mangablade.backend.integration.otruyen.response.OtruyenCategoryResponse;
import com.mangablade.backend.mapper.AuthorMapper;
import com.mangablade.backend.mapper.CategoryMapper;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.*;

import org.springframework.stereotype.Service;

import java.util.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OTruyenImportService {

    private final MangaRepository mangaRepository;
    private final MangaMapper mangaMapper;
    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;
    private final MangaAuthorRepository mangaAuthorRepository;
    private final MangaCategoryRepository mangaCategoryRepository;
    private final CategoryMapper categoryMapper;
    private final CategoryRepository categoryRepository;


    @Transactional
    public Manga importManga(OTruyenMangaResponse response, OTruyenImportTarget target) {
        log.info("Starting manga import: otruyenMangaId={}",
                response.getData().getItem().getOtruyenMangaId());

        var newManga = mangaMapper.toEntity(response);
        var manga = mangaRepository.findByOtruyenMangaId(response.getData().getItem().getOtruyenMangaId())
                .orElseGet(() -> mangaRepository.save(newManga)
        );
        if (target.getCloudinaryFolderSlug() != null && !target.getCloudinaryFolderSlug().isBlank()) {
            manga.setCloudinaryFolderSlug(target.getCloudinaryFolderSlug());
        }
        manga.setUpdatedAt(response.getData().getSeoOnPage().getUpdatedAt());
        var categories = getOtruyenCategoryResponses(response, manga);

        var authors = response.getData().getItem().getAuthors();

        authors.forEach(name -> {
            var author =  authorRepository.findByName(name).orElseGet(() -> authorMapper.toEntity(name));
            author.setName(name);

            var getAuthor =  authorRepository.save(author);
            if(!mangaAuthorRepository.existsByMangaIdAndAuthorId((manga.getId()), (getAuthor.getId()))){
                var mangaAuthor = MangaAuthor.builder()
                        .mangaId(manga.getId())
                        .authorId(getAuthor.getId())
                        .build();
                mangaAuthorRepository.save(mangaAuthor);
            }
        });

        log.info("Finished manga import: mangaId={}, categories={}, authors={}",
                manga.getId(), categories.size(), authors.size());
        return manga;

    }

    private List<OtruyenCategoryResponse> getOtruyenCategoryResponses(OTruyenMangaResponse response, Manga manga) {
        var categories = response.getData().getItem().getCategories();

        // category
        categories.forEach(category -> {
            var entity  = categoryRepository.findByOtruyenCategoryId(category.getOtruyenCategoryId()).orElseGet(
                    () -> categoryMapper.toEntity(category)
            );
            entity.setName(category.getName());
            entity.setSlug(category.getSlug());

            var getEntity = categoryRepository.save(entity);

            if(!mangaCategoryRepository.existsByMangaIdAndCategoryId( manga.getId(),(getEntity.getId()))){
                var mangaCategory = MangaCategory.builder()
                        .mangaId(manga.getId())
                        .categoryId(getEntity.getId())
                        .build();
                mangaCategoryRepository.save(mangaCategory);
            }

        });
        return categories;
    }
}
