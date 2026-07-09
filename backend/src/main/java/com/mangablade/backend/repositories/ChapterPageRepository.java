package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.ChapterPage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChapterPageRepository extends JpaRepository<ChapterPage, Long> {

}
