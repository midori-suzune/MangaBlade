package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.ForumAttachment;
import com.mangablade.backend.enums.ForumAttachmentStatus;
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
    @Query("""
        UPDATE ForumAttachment a
        SET a.status = 'ATTACHED', a.threadId = :threadId, a.attachedAt = :now
        WHERE a.id IN :ids AND a.userId = :userId AND a.status = 'TEMP'
    """)
    int attachToThread(
            @Param("ids") List<Long> ids,
            @Param("threadId") Long threadId,
            @Param("userId") Long userId,
            @Param("now") Instant now
    );

    @Modifying
    @Query("""
        UPDATE ForumAttachment a
        SET a.status = 'DELETED', a.deletedAt = :now
        WHERE a.status = 'TEMP' AND a.createdAt < :before
    """)
    int deleteOrphanedAttachments(@Param("before") Instant before, @Param("now") Instant now);
}
