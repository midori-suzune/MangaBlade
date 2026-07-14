package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.RecentCommentResponse;
import com.mangablade.backend.entities.Comment;
import com.mangablade.backend.enums.CommentStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
            select c
            from Comment c
            join fetch c.user
            where c.mangaId = :mangaId
              and c.status = :status
              and c.parentId is null
            order by c.createdAt desc
            """)
    List<Comment> findRootCommentsByMangaId(
            @Param("mangaId") Long mangaId,
            @Param("status") CommentStatus status
    );

    @Query("""
            select c
            from Comment c
            join fetch c.user
            where c.parentId in :parentIds
              and c.status = :status
            order by c.createdAt asc
            """)
    List<Comment> findRepliesByParentIds(
            @Param("parentIds") List<Long> parentIds,
            @Param("status") CommentStatus status
    );

    @Query("""
            select new com.mangablade.backend.dtos.response.RecentCommentResponse(
                c.id,
                c.content,
                c.createdAt,
                u.id,
                u.username,
                m.slug,
                m.title,
                ch.chapterNumber
            )
            from Comment c
            join c.user u
            join c.manga m
            left join c.chapter ch
            where c.status = :status
              and c.createdAt = (
                  select max(c2.createdAt)
                  from Comment c2
                  where c2.userId = c.userId
                    and c2.status = :status
              )
            order by c.createdAt desc
            limit 5
            """)
    List<RecentCommentResponse> findRecentDistinctUserComments(@Param("status") CommentStatus status);
}
