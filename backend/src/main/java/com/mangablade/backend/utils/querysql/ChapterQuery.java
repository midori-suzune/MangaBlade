package com.mangablade.backend.utils.querysql;

public class ChapterQuery {
    public static final String FIND_BY_MANGA_SLUG_AND_CHAPTER_NUMBER = """
            select c
            from Chapter c
            join c.manga m
            where m.slug = :slug
              and c.chapterNumber = :chapterNumber
            """;

    public static final String GET_LATEST_CHAPTER_BY_MANGA_ID = """
            SELECT chapter_number
            FROM chapter c
            WHERE c.manga_id = :mangaId
              AND EXISTS (
                  SELECT 1
                  FROM chapter_page cp
                  WHERE cp.chapter_id = c.id
              )
            ORDER BY COALESCE(c.chapter_sort, CAST(c.chapter_number AS DECIMAL(10,2))) DESC
            LIMIT 1
            """;

    public static final String GET_CHAPTERS_BY_MANGA_ID = """
            select c.chapter_number as chapterNumber,
                   null as chapterUrl
            from chapter c
            where c.manga_id = :id
              and exists (
                  select 1
                  from chapter_page cp
                  where cp.chapter_id = c.id
              )
            order by cast(c.chapter_number as decimal(10,2)) desc
            """;
}
