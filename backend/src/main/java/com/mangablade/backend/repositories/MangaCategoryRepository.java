package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.MangaCategory;
import com.mangablade.backend.entities.MangaCategoryId;
import com.mangablade.backend.utils.querysql.MangaCategoryQuery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MangaCategoryRepository extends JpaRepository<MangaCategory, MangaCategoryId> {

    boolean existsByMangaIdAndCategoryId(Long mangaId, Long categoryId);

    @Query(MangaCategoryQuery.FIND_CATEGORY_NAMES_BY_MANGA_ID)
    List<String> findCategoryNamesByMangaId(@Param("mangaId") Long mangaId);
}
