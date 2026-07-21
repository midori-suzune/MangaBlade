package com.mangablade.backend.services.mangablade;

import java.time.Instant;
import java.util.stream.Collectors;

import com.mangablade.backend.dtos.response.AdminMangaResponse;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.Notification;
import com.mangablade.backend.enums.MangaSourceType;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.ChapterReadEventRepository;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.repositories.NotificationRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminMangaService {
    private final MangaRepository mangaRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterReadEventRepository chapterReadEventRepository;
    private final AuthorService authorService;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<AdminMangaResponse> findManga(String search, String status, String origin, Pageable pageable) {
        MangaSourceType sourceType = toSourceType(origin);
        Boolean hidden = null;
        String visibleStatus = null;

        if ("hidden".equals(status)) {
            hidden = true;
        } else if (status != null && !status.isBlank()) {
            hidden = false;
            visibleStatus = status;
        }

        return mangaRepository.findAdminManga(search, visibleStatus, sourceType, hidden, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public AdminMangaResponse toggleVisibility(Long id, String reason, Long adminId) {
        Manga manga = mangaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MANGA_NOT_FOUND));

        Instant now = Instant.now();
        if (manga.getDeletedAt() == null) {
            String normalizedReason = reason == null ? "" : reason.trim();
            if (normalizedReason.isBlank()) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            manga.setDeletedAt(now);
            manga.setDeletedBy(adminId);
            manga.setHiddenReason(normalizedReason);
            createAuthorHiddenNotification(manga);
        } else {
            manga.setDeletedAt(null);
            manga.setDeletedBy(null);
            manga.setHiddenReason(null);
        }

        manga.setUpdatedAt(now);
        return toResponse(mangaRepository.save(manga));
    }

    private MangaSourceType toSourceType(String origin) {
        if (origin == null || origin.isBlank()) {
            return null;
        }
        if ("author".equals(origin)) {
            return MangaSourceType.LOCAL;
        }
        if ("crawl".equals(origin)) {
            return MangaSourceType.OTRUYEN;
        }
        return null;
    }

    private AdminMangaResponse toResponse(Manga manga) {
        long chapters = chapterRepository.countByMangaId(manga.getId());
        long reads = chapterReadEventRepository.countByMangaId(manga.getId());
        String author = resolveAuthor(manga);
        String thumbnail = manga.getLocalCoverUrl() != null && !manga.getLocalCoverUrl().isBlank()
                ? manga.getLocalCoverUrl()
                : manga.getThumbUrl();

        return AdminMangaResponse.builder()
                .id(manga.getId())
                .title(manga.getTitle())
                .slug(manga.getSlug())
                .author(author)
                .authorEmail(manga.getOwner() == null ? null : manga.getOwner().getEmail())
                .origin(manga.getMetadataSource() == MangaSourceType.LOCAL ? "author" : "crawl")
                .status(manga.getDeletedAt() == null ? manga.getStatus() : "hidden")
                .chapters(chapters)
                .reads(reads)
                .updatedAt(manga.getUpdatedAt())
                .hiddenReason(manga.getHiddenReason())
                .thumbnail(thumbnail)
                .build();
    }

    private String resolveAuthor(Manga manga) {
        if (manga.getOwner() != null) {
            return manga.getOwner().getUsername();
        }

        String authors = authorService.findByMangaId(manga.getId()).stream()
                .map(author -> author.getAuthorName())
                .filter(name -> name != null && !name.isBlank())
                .collect(Collectors.joining(", "));

        return authors.isBlank() ? "-" : authors;
    }

    private void createAuthorHiddenNotification(Manga manga) {
        if (manga.getOwnerUserId() == null) {
            return;
        }

        notificationRepository.save(Notification.builder()
                .userId(manga.getOwnerUserId())
                .type("MANGA_HIDDEN")
                .title("Truyện bị ẩn")
                .message("Truyện \"" + manga.getTitle() + "\" đã bị ẩn. Vui lòng xem lý do trong trang quản lý truyện.")
                .targetType("MANGA")
                .targetId(manga.getId())
                .createdAt(Instant.now())
                .build());
    }
}
