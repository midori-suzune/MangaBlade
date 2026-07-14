package com.mangablade.backend.repositories;

import com.mangablade.backend.dtos.response.ReadingHistoryResponse;
import com.mangablade.backend.entities.ReadingHistory;
import com.mangablade.backend.utils.querysql.ReadingHistoryQuery;

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

    @Query(ReadingHistoryQuery.FIND_RECENT_BY_USER_ID)
    List<ReadingHistoryResponse> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query(ReadingHistoryQuery.FIND_LATEST_BY_USER_ID_AND_MANGA_SLUG)
    Optional<ReadingHistoryResponse> findLatestByUserIdAndMangaSlug(
            @Param("userId") Long userId,
            @Param("slug") String slug
    );
}
