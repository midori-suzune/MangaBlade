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
import com.mangablade.backend.utils.querysql.ChapterReportQuery;

@Repository
public interface ChapterReportRepository extends JpaRepository<ChapterReport, Long> {
    long countByStatusIn(Collection<ChapterReportStatus> statuses);

    @EntityGraph(attributePaths = {"manga", "chapter", "reporter"})
    @Query(
            value = ChapterReportQuery.FIND_ADMIN_REPORTS,
            countQuery = ChapterReportQuery.COUNT_ADMIN_REPORTS
    )
    Page<ChapterReport> findAdminReports(
            @Param("status") ChapterReportStatus status,
            @Param("type") ChapterReportType type,
            @Param("search") String search,
            Pageable pageable
    );
}
