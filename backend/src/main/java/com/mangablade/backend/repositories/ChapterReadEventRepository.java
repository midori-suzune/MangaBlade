package com.mangablade.backend.repositories;

import java.time.Instant;
import java.util.List;

import com.mangablade.backend.dtos.response.DailyReadCountProjection;
import com.mangablade.backend.entities.ChapterReadEvent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChapterReadEventRepository extends JpaRepository<ChapterReadEvent, Long> {
    @Query(
            value = """
                    SELECT DATE(read_at) AS readDate, COUNT(*) AS readCount
                    FROM chapter_read_event
                    WHERE read_at >= :startAt AND read_at < :endAt
                    GROUP BY DATE(read_at)
                    ORDER BY DATE(read_at)
                    """,
            nativeQuery = true
    )
    List<DailyReadCountProjection> countReadsByDate(
            @Param("startAt") Instant startAt,
            @Param("endAt") Instant endAt
    );

    long countByReadAtGreaterThanEqualAndReadAtLessThan(Instant startAt, Instant endAt);

    long countByMangaId(Long mangaId);
}
