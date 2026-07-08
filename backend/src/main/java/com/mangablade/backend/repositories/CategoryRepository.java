package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.Category;
import com.mangablade.backend.entities.MangaCategory;
import com.mangablade.backend.entities.MangaCategoryId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByOtruyenCategoryId(String otruyenCategoryId);


}
