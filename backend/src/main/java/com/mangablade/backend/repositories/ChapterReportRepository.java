package com.mangablade.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;

import com.mangablade.backend.entities.ChapterReport;
import com.mangablade.backend.enums.ChapterReportStatus;
import com.mangablade.backend.enums.ChapterReportType;

@Repository
public interface ChapterReportRepository extends JpaRepository<ChapterReport, Long> {
    long countByStatusIn(Collection<ChapterReportStatus> statuses);

    @EntityGraph(attributePaths = {"manga", "chapter", "reporter"})
    @Query(
            value = """
                    SELECT r
                    FROM ChapterReport r
                    LEFT JOIN r.manga m
                    LEFT JOIN r.chapter c
                    LEFT JOIN r.reporter u
                    WHERE (:status IS NULL OR r.status = :status)
                    AND (:type IS NULL OR r.type = :type)
                    AND (:search IS NULL
                        OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(c.chapterNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(r)
                    FROM ChapterReport r
                    LEFT JOIN r.manga m
                    LEFT JOIN r.chapter c
                    LEFT JOIN r.reporter u
                    WHERE (:status IS NULL OR r.status = :status)
                    AND (:type IS NULL OR r.type = :type)
                    AND (:search IS NULL
                        OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(c.chapterNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                        OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')))
                    """
    )
    Page<ChapterReport> findAdminReports(
            @Param("status") ChapterReportStatus status,
            @Param("type") ChapterReportType type,
            @Param("search") String search,
            Pageable pageable
    );
}
