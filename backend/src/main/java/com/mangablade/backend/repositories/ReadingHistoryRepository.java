package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.ReadingHistoryResponse;
import com.mangablade.backend.entities.ReadingHistory;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Long> {

    Optional<ReadingHistory> findByUserIdAndChapterId(Long userId, Long chapterId);

    @Query("""
            select new com.mangablade.backend.dtos.response.ReadingHistoryResponse(
                m.slug,
                m.title,
                m.thumbUrl,
                c.chapterNumber,
                rh.lastReadAt
            )
            from ReadingHistory rh
            join rh.manga m
            join rh.chapter c
            where rh.userId = :userId
              and rh.lastReadAt = (
                  select max(rh2.lastReadAt)
                  from ReadingHistory rh2
                  where rh2.userId = rh.userId
                    and rh2.mangaId = rh.mangaId
              )
            order by rh.lastReadAt desc
            """)
    List<ReadingHistoryResponse> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("""
            select new com.mangablade.backend.dtos.response.ReadingHistoryResponse(
                m.slug,
                m.title,
                m.thumbUrl,
                c.chapterNumber,
                rh.lastReadAt
            )
            from ReadingHistory rh
            join rh.manga m
            join rh.chapter c
            where rh.userId = :userId
              and m.slug = :slug
            order by rh.lastReadAt desc
            limit 1
            """)
    Optional<ReadingHistoryResponse> findLatestByUserIdAndMangaSlug(
            @Param("userId") Long userId,
            @Param("slug") String slug
    );
}
