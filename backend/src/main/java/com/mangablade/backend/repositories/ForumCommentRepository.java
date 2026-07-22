package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.ForumComment;
import com.mangablade.backend.enums.CommentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    @EntityGraph(attributePaths = {"user", "user.activeTitle"})
    List<ForumComment> findByThreadIdAndReplyToCommentIdIsNullAndStatusOrderByCreatedAtAsc(
            Long threadId,
            CommentStatus status
    );

    @EntityGraph(attributePaths = {"user", "user.activeTitle"})
    List<ForumComment> findByReplyToCommentIdInAndStatusOrderByCreatedAtAsc(
            Collection<Long> replyToCommentIds,
            CommentStatus status
    );

    Optional<ForumComment> findByIdAndStatus(Long id, CommentStatus status);
}
