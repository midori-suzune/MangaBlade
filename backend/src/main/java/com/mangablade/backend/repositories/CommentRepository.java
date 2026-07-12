package com.mangablade.backend.repositories;

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
}
