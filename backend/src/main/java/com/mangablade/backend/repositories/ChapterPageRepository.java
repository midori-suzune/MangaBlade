package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.ChapterPageResponse;
import com.mangablade.backend.entities.ChapterPage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterPageRepository extends JpaRepository<ChapterPage, Long> {

    @Query("""
      select m.title as mangaTitle,
             c.chapterNumber as chapterNumber,
             cp.imageUrl as imageUrl
      from ChapterPage as cp
      join cp.chapter c
      join c.manga m
      where m.slug = :slug
        and c.chapterNumber = :chapterNumber
      order by cp.pageNumber asc
  """)
    List<ChapterPageResponse> findPagesBySlugAndChapterNumber(
            @Param("slug") String slug,
            @Param("chapterNumber") String chapterNumber
    );

}
