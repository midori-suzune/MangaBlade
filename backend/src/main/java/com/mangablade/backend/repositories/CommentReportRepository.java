package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.CommentReport;
import com.mangablade.backend.enums.CommentReportReason;
import com.mangablade.backend.enums.CommentReportStatus;
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

    @Query("""
            SELECT r FROM CommentReport r
            JOIN FETCH r.comment c
            JOIN FETCH r.reporter u
            JOIN FETCH c.manga m
            LEFT JOIN FETCH c.user cu
            LEFT JOIN FETCH c.chapter ch
            WHERE (:status IS NULL OR r.status = :status)
              AND (:reason IS NULL OR r.reason = :reason)
              AND (
                  :search IS NULL OR :search = ''
                  OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(c.content) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<CommentReport> findReports(
            @Param("status") CommentReportStatus status,
            @Param("reason") CommentReportReason reason,
            @Param("search") String search,
            Pageable pageable
    );
}
