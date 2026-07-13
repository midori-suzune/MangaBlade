package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.MangaRankingResponse;
import com.mangablade.backend.entities.Manga;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface MangaRepository extends JpaRepository<Manga, Long> {
    Optional<Manga> findByOtruyenMangaId(String id);

    Optional<Manga> findBySlug(String slug);

    @Query("""
            select new com.mangablade.backend.dtos.response.MangaRankingResponse(
                m.slug,
                m.title,
                m.thumbUrl,
                (select count(ml) from MangaLike ml where ml.mangaId = m.id),
                (select count(f) from Favorite f where f.mangaId = m.id)
            )
            from Manga m
            where (select count(ml) from MangaLike ml where ml.mangaId = m.id) > 0
            order by (select count(ml) from MangaLike ml where ml.mangaId = m.id) desc,
                     m.updatedAt desc
            limit 5
            """)
    List<MangaRankingResponse> findTopRankedByLikes();

    @Query("""
            select new com.mangablade.backend.dtos.response.MangaRankingResponse(
                m.slug,
                m.title,
                m.thumbUrl,
                (select count(ml) from MangaLike ml where ml.mangaId = m.id),
                (select count(f) from Favorite f where f.mangaId = m.id)
            )
            from Manga m
            where (select count(f) from Favorite f where f.mangaId = m.id) > 0
            order by (select count(f) from Favorite f where f.mangaId = m.id) desc,
                     m.updatedAt desc
            limit 5
            """)
    List<MangaRankingResponse> findTopRankedByFollows();

    @Query("""
            select m from Manga m
            where exists (select f from Favorite f where f.mangaId = m.id and f.userId = :userId)
            order by m.updatedAt desc
            """)
    List<Manga> findFollowedMangaByUserId(@Param("userId") Long userId);
}
