package com.mangablade.backend.services.mangablade;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mangablade.backend.dtos.response.NotificationResponse;
import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.entities.Notification;
import com.mangablade.backend.enums.ApprovalStatus;
import com.mangablade.backend.enums.AuthorRequestStatus;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> findMine(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public NotificationResponse markRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        if (!notification.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (notification.getReadAt() == null) {
            notification.setReadAt(Instant.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllRead(Long userId) {
        Page<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged());
        Instant now = Instant.now();
        unread.getContent().stream()
                .filter(notification -> notification.getReadAt() == null)
                .forEach(notification -> notification.setReadAt(now));
        notificationRepository.saveAll(unread.getContent());
    }

    public void createMangaReviewNotification(Manga manga, ApprovalStatus status) {
        if (manga.getOwnerUserId() == null) {
            return;
        }

        if (status == ApprovalStatus.APPROVED) {
            create(
                    manga.getOwnerUserId(),
                    "MANGA_APPROVED",
                    "Truyện đã được duyệt",
                    "Truyện \"" + manga.getTitle() + "\" đã được duyệt và hiển thị trên MangaBlade.",
                    "MANGA",
                    manga.getId()
            );
            return;
        }

        if (status == ApprovalStatus.REJECTED) {
            create(
                    manga.getOwnerUserId(),
                    "MANGA_REJECTED",
                    "Truyện bị từ chối",
                    "Truyện \"" + manga.getTitle() + "\" bị từ chối kiểm duyệt. Vui lòng xem lý do trong trang quản lý truyện.",
                    "MANGA",
                    manga.getId()
            );
        }
    }

    public void createMangaHiddenNotification(Manga manga) {
        if (manga.getOwnerUserId() == null) {
            return;
        }

        create(
                manga.getOwnerUserId(),
                "MANGA_HIDDEN",
                "Truyện bị ẩn",
                "Truyện \"" + manga.getTitle() + "\" đã bị ẩn. Vui lòng xem lý do trong trang quản lý truyện.",
                "MANGA",
                manga.getId()
        );
    }

    public void createMangaRestoredNotification(Manga manga) {
        if (manga.getOwnerUserId() == null) {
            return;
        }

        create(
                manga.getOwnerUserId(),
                "MANGA_RESTORED",
                "Truyện đã được mở lại",
                "Truyện \"" + manga.getTitle() + "\" đã được mở lại.",
                "MANGA",
                manga.getId()
        );
    }

    public void createChapterReviewNotification(Chapter chapter, Manga manga, ApprovalStatus status) {
        if (manga.getOwnerUserId() == null) {
            return;
        }

        String chapterLabel = formatChapterLabel(chapter);
        if (status == ApprovalStatus.APPROVED) {
            create(
                    manga.getOwnerUserId(),
                    "CHAPTER_APPROVED",
                    "Chương đã được duyệt",
                    chapterLabel + " của truyện \"" + manga.getTitle() + "\" đã được duyệt.",
                    "CHAPTER",
                    chapter.getId()
            );
            return;
        }

        if (status == ApprovalStatus.REJECTED) {
            create(
                    manga.getOwnerUserId(),
                    "CHAPTER_REJECTED",
                    "Chương bị từ chối",
                    chapterLabel + " của truyện \"" + manga.getTitle() + "\" bị từ chối kiểm duyệt. Vui lòng xem lý do trong trang quản lý chương.",
                    "CHAPTER",
                    chapter.getId()
            );
        }
    }

    public void createAuthorRequestNotification(Long userId, Long requestId, AuthorRequestStatus status) {
        if (status == AuthorRequestStatus.APPROVED) {
            create(
                    userId,
                    "AUTHOR_REQUEST_APPROVED",
                    "Đơn tác giả đã được duyệt",
                    "Đơn đăng ký tác giả của bạn đã được duyệt. Bạn có thể bắt đầu đăng truyện.",
                    "AUTHOR_REQUEST",
                    requestId
            );
            return;
        }

        if (status == AuthorRequestStatus.REJECTED) {
            create(
                    userId,
                    "AUTHOR_REQUEST_REJECTED",
                    "Đơn tác giả bị từ chối",
                    "Đơn đăng ký tác giả của bạn bị từ chối. Vui lòng xem lý do trong hồ sơ cá nhân.",
                    "AUTHOR_REQUEST",
                    requestId
            );
        }
    }

    private void create(Long userId, String type, String title, String message, String targetType, Long targetId) {
        notificationRepository.save(Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .targetType(targetType)
                .targetId(targetId)
                .createdAt(Instant.now())
                .build());
    }

    private String formatChapterLabel(Chapter chapter) {
        if (chapter.getChapterNumber() != null && !chapter.getChapterNumber().isBlank()) {
            return "Chương " + chapter.getChapterNumber();
        }

        if (chapter.getTitle() != null && !chapter.getTitle().isBlank()) {
            return "Chương \"" + chapter.getTitle() + "\"";
        }

        return "Một chương";
    }
}
