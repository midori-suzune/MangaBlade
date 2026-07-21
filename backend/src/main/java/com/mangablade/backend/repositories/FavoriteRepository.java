package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.Favorite;
import com.mangablade.backend.entities.FavoriteId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {

    boolean existsByUserIdAndMangaId(Long userId, Long mangaId);

    void deleteByUserIdAndMangaId(Long userId, Long mangaId);

    long countByUserId(Long userId);

    long countByMangaId(Long mangaId);

    @Query("""
            select f
            from Favorite f
            join fetch f.manga m
            where f.userId = :userId
            order by m.updatedAt desc
            """)
    List<Favorite> findByUserIdWithManga(@Param("userId") Long userId);

    @Modifying
    @Query("""
            update Favorite f
            set f.lastSeenChapterNumber = :chapterNumber
            where f.userId = :userId
              and f.mangaId = :mangaId
            """)
    int updateLastSeenChapterNumber(
            @Param("userId") Long userId,
            @Param("mangaId") Long mangaId,
            @Param("chapterNumber") String chapterNumber
    );
}
