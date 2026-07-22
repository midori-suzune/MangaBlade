package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.ForumCommentLike;
import com.mangablade.backend.entities.ForumCommentLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumCommentLikeRepository extends JpaRepository<ForumCommentLike, ForumCommentLikeId> {
    boolean existsByUserIdAndCommentId(Long userId, Long commentId);
    long countByCommentId(Long commentId);
    void deleteByUserIdAndCommentId(Long userId, Long commentId);
}
