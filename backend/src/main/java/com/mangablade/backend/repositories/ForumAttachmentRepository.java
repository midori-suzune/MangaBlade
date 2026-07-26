package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.AdminForumDraftImageResponse;
import com.mangablade.backend.entities.ForumAttachment;
import com.mangablade.backend.enums.ForumAttachmentStatus;
import com.mangablade.backend.utils.querysql.ForumAttachmentQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ForumAttachmentRepository extends JpaRepository<ForumAttachment, Long> {

    List<ForumAttachment> findByThreadIdAndStatus(Long threadId, ForumAttachmentStatus status);

    List<ForumAttachment> findByIdInAndUserIdAndStatus(
            List<Long> ids, Long userId, ForumAttachmentStatus status
    );

    @Modifying
    @Query(ForumAttachmentQuery.ATTACH_TO_THREAD)
    int attachToThread(
            @Param("ids") List<Long> ids,
            @Param("threadId") Long threadId,
            @Param("userId") Long userId,
            @Param("now") Instant now
    );

    @Query(
            value = ForumAttachmentQuery.FIND_ADMIN_DRAFT_IMAGES,
            countQuery = ForumAttachmentQuery.COUNT_ADMIN_DRAFT_IMAGES
    )
    Page<AdminForumDraftImageResponse> findAdminDraftImages(
            @Param("before") Instant before,
            @Param("search") String search,
            Pageable pageable
    );

    @Query(ForumAttachmentQuery.SUM_ADMIN_DRAFT_IMAGE_SIZE)
    long sumAdminDraftImageSize(@Param("before") Instant before, @Param("search") String search);

    @Query(ForumAttachmentQuery.FIND_DELETABLE_DRAFT_IMAGES_BY_IDS)
    List<ForumAttachment> findDeletableDraftImagesByIds(@Param("ids") List<Long> ids);

    @Modifying
    @Query(ForumAttachmentQuery.MARK_DRAFT_IMAGES_DELETED)
    int markDraftImagesDeleted(@Param("ids") List<Long> ids, @Param("now") Instant now);

    @Modifying
    @Query(ForumAttachmentQuery.DELETE_ORPHANED_ATTACHMENTS)
    int deleteOrphanedAttachments(@Param("before") Instant before, @Param("now") Instant now);
}
