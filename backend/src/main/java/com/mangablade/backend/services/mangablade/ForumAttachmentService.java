package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.ForumAttachmentResponse;
import com.mangablade.backend.entities.ForumAttachment;
import com.mangablade.backend.entities.User;
import com.mangablade.backend.enums.ForumAttachmentStatus;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.ForumAttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
}
