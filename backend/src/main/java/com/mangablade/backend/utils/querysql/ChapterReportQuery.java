package com.mangablade.backend.utils.querysql;

public class ChapterReportQuery {
    private static final String ADMIN_REPORT_FILTERS = """
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
            """;

    public static final String FIND_ADMIN_REPORTS = """
            SELECT r
            """ + ADMIN_REPORT_FILTERS;

    public static final String COUNT_ADMIN_REPORTS = """
            SELECT COUNT(r)
            """ + ADMIN_REPORT_FILTERS;
}
