package com.mangablade.backend.services.otruyen;


import com.mangablade.backend.entities.*;
import com.mangablade.backend.integration.otruyen.OTruyenClient;
import com.mangablade.backend.integration.otruyen.response.OTruyenChapterResponse;
import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;
import com.mangablade.backend.integration.otruyen.response.OtruyenCategoryResponse;
import com.mangablade.backend.mapper.AuthorMapper;
import com.mangablade.backend.mapper.CategoryMapper;
import com.mangablade.backend.mapper.ChapterMapper;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.*;

import org.springframework.data.domain.PageRequest;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.logging.Logger;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OTruyenImportService {

    private final MangaRepository mangaRepository;
    private final MangaMapper mangaMapper;
    private final ChapterMapper chapterMapper;
    private final ChapterRepository chapterRepository;
    private final OTruyenClient oTruyenClient;
    private final ChapterPageRepository chapterPageRepository;
    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;
    private final MangaAuthorRepository mangaAuthorRepository;
    private final MangaCategoryRepository mangaCategoryRepository;
    private final CategoryMapper categoryMapper;
    private final CategoryRepository categoryRepository;


    @Scheduled(cron = "${spring.app.otruyen.chapter-page-import-cron}", zone = "Asia/Ho_Chi_Minh")
    public void fetchChapterPages() {
        log.info("Starting chapter page import");
        var chapters = chapterRepository.findChaptersWithoutPages(PageRequest.of(0, 5));
        log.info("Found {} chapters without pages", chapters.size());

        for (Chapter chapter : chapters) {
            log.debug("Importing pages for chapterId={}", chapter.getId());
            var response = oTruyenClient.fetchApiChapterByUrl(chapter.getChapterApiUrl());

            String domain = response.getData().getDomainCdn();
            String chapterPath = response.getData().getItem().getChapterPath();
            var images = response.getData().getItem().getChapterImages();

            if (images == null) {
                log.warn("No images found for chapterId={}", chapter.getId());
            }

            if (images != null) {
                List<ChapterPage> chapterPages = new ArrayList<>();
                Instant createdAt = Instant.now();

                for (var image : images) {
                    String imageUrl = domain + "/" + chapterPath + "/" + image.getImageFile();

                    chapterPages.add(ChapterPage.builder()
                            .chapterId(chapter.getId())
                            .pageNumber(image.getPageNumber())
                            .imageUrl(imageUrl)
                            .createdAt(createdAt)
                            .build());
                }

                chapterPageRepository.saveAll(chapterPages);
                log.info("Imported {} pages for chapterId={}", chapterPages.size(), chapter.getId());
            }
        }
        log.info("Finished chapter page import");
    }

    @Transactional
    public Manga importManga(OTruyenMangaResponse response) {
        log.info("Starting manga import: otruyenMangaId={}",
                response.getData().getItem().getOtruyenMangaId());

        var newManga = mangaMapper.toEntity(response);
        var manga = mangaRepository.findByOtruyenMangaId(response.getData().getItem().getOtruyenMangaId())
                .orElseGet(() -> mangaRepository.save(newManga)
        );
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

    @Transactional
    public void importChapter(OTruyenMangaResponse response, Manga manga) {
        log.info("Starting chapter import: mangaId={}", manga.getId());

        Map<String, OTruyenChapterResponse.ChapterData> remoteChapters = new LinkedHashMap<>();

        // Deduplicate remote chapters by number, keeping the latest entry.
        for (var server : response.getData().getItem().getChapters()) {
            for (var chapterData : server.getSeverData()) {
                String chapterNumber = chapterData.getChapterNumber();

                if (chapterNumber != null) {
                    remoteChapters.put(chapterNumber, chapterData);
                }
            }
        }

        Map<String, Chapter> existingChapters = new HashMap<>();

        // query chapter and add it into map [ 102 | chapter entity  ]
        for (Chapter chapter : chapterRepository.findAllByMangaId(manga.getId())) {
            existingChapters.put(chapter.getChapterNumber(), chapter);
        }

        List<Chapter> chaptersToSave = new ArrayList<>();

        // Create missing chapters and update existing chapter metadata.
        for (var chapterData : remoteChapters.values()) {

            Chapter chapter = existingChapters.get(chapterData.getChapterNumber());

            if (chapter == null) {
                chapter = chapterMapper.toEntity(chapterData, manga);
            } else {
                chapter.setChapterApiUrl(chapterData.getChapterApiUrl());
                chapter.setTitle(chapterData.getTitle());
            }

            chaptersToSave.add(chapter);
        }

        chapterRepository.saveAll(chaptersToSave);
        log.info("Finished chapter import: mangaId={}, chapters={}",
                manga.getId(), chaptersToSave.size());
    }
}
