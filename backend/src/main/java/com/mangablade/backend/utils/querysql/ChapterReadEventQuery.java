package com.mangablade.backend.utils.querysql;

public class ChapterReadEventQuery {
    public static final String COUNT_READS_BY_DATE = """
            SELECT DATE(read_at) AS readDate, COUNT(*) AS readCount
            FROM chapter_read_event
            WHERE read_at >= :startAt AND read_at < :endAt
            GROUP BY DATE(read_at)
            ORDER BY DATE(read_at)
            """;
}
