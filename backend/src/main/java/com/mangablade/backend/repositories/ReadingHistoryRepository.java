package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.ReadingHistoryResponse;
import com.mangablade.backend.entities.ReadingHistory;
import com.mangablade.backend.utils.querysql.ReadingHistoryQuery;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Long> {

    Optional<ReadingHistory> findByUserIdAndChapterId(Long userId, Long chapterId);

    long countByMangaId(Long mangaId);

    @Modifying
    @Query(value = """
            INSERT INTO reading_history (user_id, manga_id, chapter_id, page_index, last_read_at)
            VALUES (:userId, :mangaId, :chapterId, 0, :lastReadAt)
            ON DUPLICATE KEY UPDATE
                last_read_at = VALUES(last_read_at)
            """, nativeQuery = true)
    int upsertReadingHistory(
            @Param("userId") Long userId,
            @Param("mangaId") Long mangaId,
            @Param("chapterId") Long chapterId,
            @Param("lastReadAt") Instant lastReadAt
    );

    @Query(ReadingHistoryQuery.FIND_RECENT_BY_USER_ID)
    List<ReadingHistoryResponse> findRecentByUserId(
            @Param("userId") Long userId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query(ReadingHistoryQuery.FIND_LATEST_BY_USER_ID_AND_MANGA_SLUG)
    Optional<ReadingHistoryResponse> findLatestByUserIdAndMangaSlug(
            @Param("userId") Long userId,
            @Param("slug") String slug
    );
}
