package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.AdminForumDraftImageDeleteResponse;
import com.mangablade.backend.dtos.response.AdminForumDraftImageListResponse;
import com.mangablade.backend.dtos.response.ForumAttachmentResponse;
import com.mangablade.backend.dtos.response.PageResponse;
import com.mangablade.backend.entities.ForumAttachment;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.ForumAttachmentStatus;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.ForumAttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumAttachmentService {

    private static final int MAX_IMAGES_PER_THREAD = 5;

    private final R2StorageService r2StorageService;
    private final ForumAttachmentRepository forumAttachmentRepository;

    @Transactional
    public ForumAttachmentResponse uploadForumImage(MultipartFile file, User user) {
        if (user == null) throw new AppException(ErrorCode.UNAUTHORIZED);

        var result = r2StorageService.uploadForumImage(file, user.getId());

        var attachment = ForumAttachment.builder()
                .userId(user.getId())
                .storageProvider("R2")
                .objectKey(result.objectKey())
                .url(result.url())
                .mimeType(result.mimeType())
                .fileSize(result.fileSize())
                .status(ForumAttachmentStatus.TEMP)
                .createdAt(Instant.now())
                .build();

        var saved = forumAttachmentRepository.save(attachment);
        return toResponse(saved);
    }

    @Transactional
    public List<ForumAttachmentResponse> attachToThread(List<Long> attachmentIds, Long threadId, Long userId) {
        if (attachmentIds == null || attachmentIds.isEmpty()) return List.of();
        if (attachmentIds.size() > MAX_IMAGES_PER_THREAD) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var now = Instant.now();
        forumAttachmentRepository.attachToThread(attachmentIds, threadId, userId, now);

        return forumAttachmentRepository.findByThreadIdAndStatus(threadId, ForumAttachmentStatus.ATTACHED)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ForumAttachmentResponse> getThreadAttachments(Long threadId) {
        return forumAttachmentRepository.findByThreadIdAndStatus(threadId, ForumAttachmentStatus.ATTACHED)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AdminForumDraftImageListResponse getAdminDraftImages(int olderThanHours, String search, Pageable pageable) {
        Instant before = resolveDraftBefore(olderThanHours);
        var images = forumAttachmentRepository.findAdminDraftImages(before, normalizeSearch(search), pageable);
        long totalSizeBytes = forumAttachmentRepository.sumAdminDraftImageSize(before, normalizeSearch(search));

        return AdminForumDraftImageListResponse.builder()
                .images(PageResponse.from(images))
                .totalCount(images.getTotalElements())
                .totalSizeBytes(totalSizeBytes)
                .build();
    }

    @Transactional
    public AdminForumDraftImageDeleteResponse deleteAdminDraftImage(Long id) {
        return deleteAdminDraftImages(List.of(id));
    }

    @Transactional
    public AdminForumDraftImageDeleteResponse deleteAdminDraftImages(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<ForumAttachment> attachments = forumAttachmentRepository.findDeletableDraftImagesByIds(ids);
        if (attachments.isEmpty()) {
            throw new AppException(ErrorCode.ATTACHMENT_NOT_FOUND);
        }

        attachments.forEach(attachment -> r2StorageService.deleteForumImage(attachment.getObjectKey()));

        List<Long> deletableIds = attachments.stream().map(ForumAttachment::getId).toList();
        int deletedCount = forumAttachmentRepository.markDraftImagesDeleted(deletableIds, Instant.now());
        long deletedSizeBytes = attachments.stream()
                .map(ForumAttachment::getFileSize)
                .filter(size -> size != null)
                .mapToLong(Long::longValue)
                .sum();

        return AdminForumDraftImageDeleteResponse.builder()
                .deletedCount(deletedCount)
                .deletedSizeBytes(deletedSizeBytes)
                .build();
    }

    private ForumAttachmentResponse toResponse(ForumAttachment a) {
        return ForumAttachmentResponse.builder()
                .id(a.getId())
                .url(a.getUrl())
                .mimeType(a.getMimeType())
                .fileSize(a.getFileSize())
                .width(a.getWidth())
                .height(a.getHeight())
                .build();
    }

    private Instant resolveDraftBefore(int olderThanHours) {
        if (olderThanHours < 1) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        return Instant.now().minus(Duration.ofHours(olderThanHours));
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim();
    }
}
