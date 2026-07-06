package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.Category;
import com.mangablade.backend.entities.MangaCategory;
import com.mangablade.backend.entities.MangaCategoryId;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByOtruyenCategoryId(String otruyenCategoryId);


}
