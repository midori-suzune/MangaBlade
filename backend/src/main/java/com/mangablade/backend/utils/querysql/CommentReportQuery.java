package com.mangablade.backend.utils.querysql;

public class CommentReportQuery {
    public static final String FIND_REPORTS = """
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
            """;
}
