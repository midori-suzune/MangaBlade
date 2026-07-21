package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.RecentCommentResponse;
import com.mangablade.backend.entities.Comment;
import com.mangablade.backend.enums.CommentStatus;
import com.mangablade.backend.utils.querysql.CommentQuery;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant startAt, Instant endAt);

    long countByMangaId(Long mangaId);

    @Query(CommentQuery.FIND_ROOT_COMMENTS_BY_MANGA_ID)
    List<Comment> findRootCommentsByMangaId(
            @Param("mangaId") Long mangaId,
            @Param("status") CommentStatus status
    );

    @Query(CommentQuery.FIND_ROOT_COMMENTS_BY_MANGA_ID_AND_CHAPTER_ID)
    List<Comment> findRootCommentsByMangaIdAndChapterId(
            @Param("mangaId") Long mangaId,
            @Param("chapterId") Long chapterId,
            @Param("status") CommentStatus status
    );

    @Query(CommentQuery.FIND_REPLIES_BY_PARENT_IDS)
    List<Comment> findRepliesByParentIds(
            @Param("parentIds") List<Long> parentIds,
            @Param("status") CommentStatus status
    );

    @Query(CommentQuery.FIND_RECENT_DISTINCT_USER_COMMENTS)
    List<RecentCommentResponse> findRecentDistinctUserComments(
            @Param("status") CommentStatus status,
            Pageable pageable
    );
}
