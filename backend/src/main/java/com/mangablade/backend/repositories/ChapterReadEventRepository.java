package com.mangablade.backend.repositories;

import java.time.Instant;
import java.util.List;

import com.mangablade.backend.dtos.response.DailyReadCountProjection;
import com.mangablade.backend.entities.ChapterReadEvent;
import com.mangablade.backend.utils.querysql.ChapterReadEventQuery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChapterReadEventRepository extends JpaRepository<ChapterReadEvent, Long> {
    @Query(
            value = ChapterReadEventQuery.COUNT_READS_BY_DATE,
            nativeQuery = true
    )
    List<DailyReadCountProjection> countReadsByDate(
            @Param("startAt") Instant startAt,
            @Param("endAt") Instant endAt
    );

    long countByReadAtGreaterThanEqualAndReadAtLessThan(Instant startAt, Instant endAt);

    long countByMangaId(Long mangaId);
}
