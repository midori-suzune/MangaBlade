package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.CommentReport;
import com.mangablade.backend.enums.CommentReportReason;
import com.mangablade.backend.enums.CommentReportStatus;
import com.mangablade.backend.utils.querysql.CommentReportQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface CommentReportRepository extends JpaRepository<CommentReport, Long> {
    long countByStatusIn(Collection<CommentReportStatus> statuses);

    @Query(CommentReportQuery.FIND_REPORTS)
    Page<CommentReport> findReports(
            @Param("status") CommentReportStatus status,
            @Param("reason") CommentReportReason reason,
            @Param("search") String search,
            Pageable pageable
    );
}
