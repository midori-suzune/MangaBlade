package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.MangaDetailResponse;
import com.mangablade.backend.dtos.response.MangaInteractionResponse;
import com.mangablade.backend.dtos.response.MangaRankingProjection;
import com.mangablade.backend.dtos.response.MangaRankingResponse;
import com.mangablade.backend.dtos.response.MangaResponse;
import com.mangablade.backend.entities.Favorite;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.MangaLike;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.CategoryRepository;
import com.mangablade.backend.repositories.FavoriteRepository;
import com.mangablade.backend.repositories.MangaLikeRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.services.mangablade.AuthorService;
import com.mangablade.backend.services.mangablade.ChapterService;
import com.mangablade.backend.services.mangablade.MangaService;
import com.mangablade.backend.services.mangablade.TaskService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MangaServiceImpl implements MangaService {

    private final MangaRepository mangaRepository;
    private final ChapterService chapterService;
    private final MangaMapper mangaMapper;
    private final AuthorService authorService;
    private final CategoryRepository categoryRepository;
    private final FavoriteRepository favoriteRepository;
    private final MangaLikeRepository mangaLikeRepository;
    private final TaskService taskService;

    @Override
    public List<MangaResponse> fetchAllManga() {
        var entity = mangaRepository.findAll();
        return entity.stream().map(e -> {
            var latestChapter = chapterService.getLastestChapterByMangaId(e.getId());
            var response = mangaMapper.toResponse(e);
            response.getLatestChapter().setChapterNumber(latestChapter);
            return response;
        }).toList();
    }

    @Override
    public List<MangaRankingResponse> fetchRanking(String sort) {
        if ("follows".equalsIgnoreCase(sort)) {
            return toRankingResponses(mangaRepository.findTopRankedByFollows());
        }
        if ("views".equalsIgnoreCase(sort)) {
            return toRankingResponses(mangaRepository.findTopRankedByViews());
        }

        return toRankingResponses(mangaRepository.findTopRankedByLikes());
    }

    private List<MangaRankingResponse> toRankingResponses(List<MangaRankingProjection> projections) {
        return projections.stream()
                .map(projection -> new MangaRankingResponse(
                        projection.getSlug(),
                        projection.getTitle(),
                        projection.getThumbUrl(),
                        projection.getLikeCount(),
                        projection.getFollowCount(),
                        projection.getViewCount()
                ))
                .toList();
    }

    @Override
    public MangaDetailResponse fetchMangaDetailBySlug(String slug, Long userId) {
        var manga = findMangaBySlugOrThrow(slug);
        var chapterList = chapterService.getChapterByMangaId(manga.getId());
        var list = chapterList.stream().map(chapter -> MangaDetailResponse.Chapter.builder()
                .chapterNumber(chapter.getChapterNumber())
                .chapterUrl(chapter.getChapterUrl())
                .build()).toList();
        var authors = authorService.findByMangaId(manga.getId()).stream()
                .map(author -> new MangaDetailResponse.Author(author.getAuthorId(), author.getAuthorName()))
                .toList();
        var categories = categoryRepository.findByMangaId(manga.getId()).stream()
                .map(category -> new MangaDetailResponse.Category(category.getId(), category.getName(), category.getSlug()))
                .toList();
        var interaction = getInteraction(manga.getId(), userId);

        return MangaDetailResponse.builder()
                .title(manga.getTitle())
                .status(manga.getStatus())
                .thumbUrl(manga.getThumbUrl())
                .description(manga.getDescription())
                .sourceType(manga.getMetadataSource())
                .updatedAt(manga.getUpdatedAt())
                .followed(interaction.isFollowed())
                .liked(interaction.isLiked())
                .authors(authors)
                .categories(categories)
                .chapters(list)
                .build();
    }

    @Override
    @Transactional
    public MangaInteractionResponse toggleFollow(String slug, Long userId) {
        var manga = findMangaBySlugOrThrow(slug);
        var isFollowed = favoriteRepository.existsByUserIdAndMangaId(userId, manga.getId());

        int currentFollowCount = (int) favoriteRepository.countByUserId(userId);

        if (isFollowed) {
            favoriteRepository.deleteByUserIdAndMangaId(userId, manga.getId());
            currentFollowCount = Math.max(0, currentFollowCount - 1);
        } else {
            favoriteRepository.save(Favorite.builder()
                    .userId(userId)
                    .mangaId(manga.getId())
                    .createdAt(Instant.now())
                    .build());
            currentFollowCount = currentFollowCount + 1;
        }

        taskService.handleMangaFollowUpdate(userId, currentFollowCount);

        return MangaInteractionResponse.builder()
                .followed(!isFollowed)
                .liked(mangaLikeRepository.existsByUserIdAndMangaId(userId, manga.getId()))
                .build();
    }

    @Override
    @Transactional
    public MangaInteractionResponse toggleLike(String slug, Long userId) {
        var manga = findMangaBySlugOrThrow(slug);
        var isLiked = mangaLikeRepository.existsByUserIdAndMangaId(userId, manga.getId());

        if (isLiked) {
            mangaLikeRepository.deleteByUserIdAndMangaId(userId, manga.getId());
        } else {
            mangaLikeRepository.save(MangaLike.builder()
                    .userId(userId)
                    .mangaId(manga.getId())
                    .createdAt(Instant.now())
                    .build());
        }

        return MangaInteractionResponse.builder()
                .followed(favoriteRepository.existsByUserIdAndMangaId(userId, manga.getId()))
                .liked(!isLiked)
                .build();
    }

    private MangaInteractionResponse getInteraction(Long mangaId, Long userId) {
        if (userId == null) {
            return MangaInteractionResponse.builder()
                    .followed(false)
                    .liked(false)
                    .build();
        }

        return MangaInteractionResponse.builder()
                .followed(favoriteRepository.existsByUserIdAndMangaId(userId, mangaId))
                .liked(mangaLikeRepository.existsByUserIdAndMangaId(userId, mangaId))
                .build();
    }

    private Manga findMangaBySlugOrThrow(String slug) {
        return mangaRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.warn("Manga not found: slug={}", slug);
                    return new AppException(ErrorCode.MANGA_NOT_FOUND);
                });
    }

    @Override
    public List<MangaResponse> fetchFollowedManga(Long userId) {
        var entity = mangaRepository.findFollowedMangaByUserId(userId);
        return entity.stream().map(e -> {
            var latestChapter = chapterService.getLastestChapterByMangaId(e.getId());
            var response = mangaMapper.toResponse(e);
            response.getLatestChapter().setChapterNumber(latestChapter);
            return response;
        }).toList();
    }
}
