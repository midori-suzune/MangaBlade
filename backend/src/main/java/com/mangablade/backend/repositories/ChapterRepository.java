package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.Chapter;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findAllByMangaId(Long mangaId);

    @Query("""
            SELECT c
            FROM Chapter c
            WHERE c.chapterApiUrl IS NOT NULL
              AND NOT EXISTS (
                  SELECT cp.id
                  FROM ChapterPage cp
                  WHERE cp.chapterId = c.id
              )
            ORDER BY c.id
            """)
    List<Chapter> findChaptersWithoutPages(Pageable pageable);

    @Query(
            value = """
              SELECT chapter_number
              FROM chapter
              WHERE manga_id = :mangaId
              ORDER BY CAST(chapter_number AS DECIMAL(10,2)) DESC
              LIMIT 1
              """,
            nativeQuery = true
    )
    String getLatestChapterByMangaId(@Param("mangaId") Long mangaId);
}
