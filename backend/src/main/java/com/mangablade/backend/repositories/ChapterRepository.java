package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.ChapterProjection;
import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.utils.querysql.ChapterQuery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findAllByMangaId(Long mangaId);

    org.springframework.data.domain.Page<Chapter> findByMangaId(Long mangaId, org.springframework.data.domain.Pageable pageable);

    long countByMangaId(Long mangaId);

    Optional<Chapter> findByMangaIdAndChapterNumber(Long mangaId, String chapterNumber);

    @Query(ChapterQuery.FIND_BY_MANGA_SLUG_AND_CHAPTER_NUMBER)
    Optional<Chapter> findByMangaSlugAndChapterNumber(
            @Param("slug") String slug,
            @Param("chapterNumber") String chapterNumber
    );

    @Query(
            value = ChapterQuery.GET_LATEST_CHAPTER_BY_MANGA_ID,
            nativeQuery = true
    )
    String getLatestChapterByMangaId(@Param("mangaId") Long mangaId);

    @Query(
            value = ChapterQuery.GET_CHAPTERS_BY_MANGA_ID,
            nativeQuery = true
    )
    List<ChapterProjection> getChaptersByMangaId(@Param("id") Long mangaId);
}
