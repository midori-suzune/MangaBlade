package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.MangaCategory;
import com.mangablade.backend.entities.MangaCategoryId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MangaCategoryRepository extends JpaRepository<MangaCategory, MangaCategoryId> {

    boolean existsByMangaIdAndCategoryId(Long mangaId, Long categoryId);

    @Query("""
            SELECT c.name
            FROM MangaCategory mc
            JOIN mc.category c
            WHERE mc.mangaId = :mangaId
            ORDER BY c.name ASC
            """)
    List<String> findCategoryNamesByMangaId(@Param("mangaId") Long mangaId);
}
