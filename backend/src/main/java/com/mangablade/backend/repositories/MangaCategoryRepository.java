package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.MangaCategory;
import com.mangablade.backend.entities.MangaCategoryId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MangaCategoryRepository extends JpaRepository<MangaCategory, MangaCategoryId> {

    boolean existsByMangaIdAndCategoryId(Long mangaId, Long categoryId);
}
