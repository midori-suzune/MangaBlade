package com.mangablade.backend.utils.querysql;

public class ReadingHistoryQuery {
    public static final String FIND_RECENT_BY_USER_ID = """
            select new com.mangablade.backend.dtos.response.ReadingHistoryResponse(
                m.slug,
                m.title,
                m.thumbUrl,
                c.chapterNumber,
                rh.lastReadAt
            )
            from ReadingHistory rh
            join rh.manga m
            join rh.chapter c
            where rh.userId = :userId
              and m.deletedAt IS NULL
              and (:query is null
                   or lower(m.title) like lower(concat('%', :query, '%'))
                   or lower(m.slug) like lower(concat('%', :query, '%')))
              and rh.lastReadAt = (
                  select max(rh2.lastReadAt)
                  from ReadingHistory rh2
                  where rh2.userId = rh.userId
                    and rh2.mangaId = rh.mangaId
              )
            order by rh.lastReadAt desc
            """;

    public static final String FIND_LATEST_BY_USER_ID_AND_MANGA_SLUG = """
            select new com.mangablade.backend.dtos.response.ReadingHistoryResponse(
                m.slug,
                m.title,
                m.thumbUrl,
                c.chapterNumber,
                rh.lastReadAt
            )
            from ReadingHistory rh
            join rh.manga m
            join rh.chapter c
            where rh.userId = :userId
              and m.slug = :slug
              and m.deletedAt IS NULL
            order by rh.lastReadAt desc
            limit 1
            """;
}
