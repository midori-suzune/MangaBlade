package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.MangaLike;
import com.mangablade.backend.entities.MangaLikeId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MangaLikeRepository extends JpaRepository<MangaLike, MangaLikeId> {

    boolean existsByUserIdAndMangaId(Long userId, Long mangaId);

    void deleteByUserIdAndMangaId(Long userId, Long mangaId);
}
