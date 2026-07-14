package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.ChapterPageResponse;
import com.mangablade.backend.entities.ChapterPage;
import com.mangablade.backend.utils.querysql.ChapterPageQuery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterPageRepository extends JpaRepository<ChapterPage, Long> {
    boolean existsByChapterId(Long chapterId);

    void deleteByChapterId(Long chapterId);

    @Query(value = ChapterPageQuery.FIND_PAGES_BY_SLUG_AND_CHAPTER_NUMBER, nativeQuery = true)
    List<ChapterPageResponse> findPagesBySlugAndChapterNumber(
            @Param("slug") String slug,
            @Param("chapterNumber") String chapterNumber
    );

}
