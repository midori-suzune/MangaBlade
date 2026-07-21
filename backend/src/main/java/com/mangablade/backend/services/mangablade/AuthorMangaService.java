package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.request.AuthorChapterCreateRequest;
import com.mangablade.backend.dtos.request.AuthorMangaCreateRequest;
import com.mangablade.backend.dtos.response.*;
import com.mangablade.backend.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AuthorMangaService {
    AuthorMangaResponse createManga(User user, AuthorMangaCreateRequest request);
    AuthorMangaResponse uploadCover(User user, String identifier, MultipartFile file);
    Page<AuthorMangaResponse> getMyMangas(User user, Pageable pageable);
    AuthorMangaResponse getMangaByIdentifier(User user, String identifier);
    AuthorMangaResponse updateManga(User user, String identifier, AuthorMangaCreateRequest request);
    void deleteManga(User user, String identifier);
    void submitManga(User user, String identifier);

    // Chapter management
    Page<AuthorChapterResponse> getChapters(User user, String identifier, Pageable pageable);
    AuthorChapterResponse getChapterDetail(User user, Long chapterId);
    AuthorChapterResponse createChapter(User user, String identifier, AuthorChapterCreateRequest request);
    AuthorChapterResponse updateChapter(User user, Long chapterId, AuthorChapterCreateRequest request);
    void deleteChapter(User user, Long chapterId);
    void submitChapter(User user, Long chapterId);

    // Chapter pages management
    List<AuthorChapterPageResponse> getChapterPages(User user, Long chapterId);
    List<AuthorChapterPageResponse> uploadChapterPages(User user, Long chapterId, MultipartFile[] files);

    // Statistics
    AuthorStatsOverviewResponse getStatsOverview(User user);
    Page<AuthorMangaStatsResponse> getMangaStats(User user, Pageable pageable);
}
