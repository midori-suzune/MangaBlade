package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.Manga;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MangaRepository extends JpaRepository<Manga, Long> {
    Optional<Manga> findByOtruyenMangaId(String id);
}
