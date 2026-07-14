package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.Category;
import com.mangablade.backend.utils.querysql.CategoryQuery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByOtruyenCategoryId(String otruyenCategoryId);

    @Query(CategoryQuery.FIND_BY_MANGA_ID)
    List<Category> findByMangaId(@Param("mangaId") Long mangaId);
}
