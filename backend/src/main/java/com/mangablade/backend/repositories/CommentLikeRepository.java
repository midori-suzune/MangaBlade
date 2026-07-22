package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.CommentLike;
import com.mangablade.backend.entities.CommentLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, CommentLikeId> {
    boolean existsByUserIdAndCommentId(Long userId, Long commentId);
    long countByCommentId(Long commentId);
    void deleteByUserIdAndCommentId(Long userId, Long commentId);
    List<CommentLike> findByUserIdAndCommentIdIn(Long userId, Collection<Long> commentIds);
}
