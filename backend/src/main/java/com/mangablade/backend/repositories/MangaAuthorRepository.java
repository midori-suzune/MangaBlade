package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.MangaAuthor;
import com.mangablade.backend.entities.MangaAuthorId;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MangaAuthorRepository extends JpaRepository<MangaAuthor, MangaAuthorId> {


    boolean existsByMangaIdAndAuthorId(Long mangaId, Long authorId);
}
