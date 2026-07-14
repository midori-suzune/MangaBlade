package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.MangaAuthorProjection;
import com.mangablade.backend.entities.MangaAuthor;
import com.mangablade.backend.entities.MangaAuthorId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MangaAuthorRepository extends JpaRepository<MangaAuthor, MangaAuthorId> {
    boolean existsByMangaIdAndAuthorId(Long mangaId, Long authorId);

    @Query("""
            select a.id as authorId,
                   a.name as authorName,
                   m.id as mangaId
            from MangaAuthor ma
            join ma.author a
            join ma.manga m
            where ma.mangaId = :mangaId
            """)
    List<MangaAuthorProjection> findAuthorsByMangaId(@Param("mangaId") Long mangaId);
}
