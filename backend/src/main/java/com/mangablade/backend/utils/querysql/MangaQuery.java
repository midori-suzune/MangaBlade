package com.mangablade.backend.utils.querysql;

public class MangaQuery {
    private static final String ADMIN_MANGA_FILTERS = """
            FROM Manga m
            LEFT JOIN m.owner owner
            WHERE (:search IS NULL
                OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(m.slug) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(owner.username) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(owner.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:sourceType IS NULL OR m.metadataSource = :sourceType)
              AND (:hidden IS NULL
                  OR (:hidden = TRUE AND m.deletedAt IS NOT NULL)
                  OR (:hidden = FALSE AND m.deletedAt IS NULL))
              AND (:status IS NULL OR m.status = :status)
            """;

    private static final String MODERATION_MANGA_FILTERS = """
            FROM Manga m
            LEFT JOIN m.owner owner
            WHERE m.deletedAt IS NULL
              AND m.ownerUserId IS NOT NULL
              AND (:status IS NULL OR m.approvalStatus = :status)
              AND (:search IS NULL
                  OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(m.slug) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(owner.username) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(owner.email) LIKE LOWER(CONCAT('%', :search, '%')))
            """;

    public static final String FIND_ADMIN_MANGA = """
            SELECT m
            """ + ADMIN_MANGA_FILTERS;

    public static final String COUNT_ADMIN_MANGA = """
            SELECT COUNT(m)
            """ + ADMIN_MANGA_FILTERS;

    public static final String FIND_MODERATION_MANGA = """
            SELECT m
            """ + MODERATION_MANGA_FILTERS;

    public static final String COUNT_MODERATION_MANGA = """
            SELECT COUNT(m)
            """ + MODERATION_MANGA_FILTERS;

    private static final String FILTER_CONDITIONS = """
            where m.deletedAt is null
              and (:categorySlug is null or exists (
                select 1
                from MangaCategory mc
                join mc.category c
                where mc.mangaId = m.id
                  and c.slug = :categorySlug
            ))
              and (:authorKeyword is null or exists (
                select 1
                from MangaAuthor ma
                join ma.author a
                where ma.mangaId = m.id
                  and lower(a.name) like lower(concat('%', :authorKeyword, '%'))
            ))
            """;

    public static final String FIND_FILTERED_ORDER_BY_UPDATED_AT = """
            select m
            from Manga m
            """ + FILTER_CONDITIONS + """
            order by m.updatedAt desc, m.slug asc
            """;

    public static final String FIND_FILTERED_ORDER_BY_CHAPTERS = """
            select m
            from Manga m
            """ + FILTER_CONDITIONS + """
            order by (
                select max(c.chapterSort)
                from Chapter c
                where c.mangaId = m.id
            ) desc, m.slug asc
            """;

    public static final String FIND_FILTERED_ORDER_BY_FOLLOWS = """
            select m
            from Manga m
            """ + FILTER_CONDITIONS + """
            order by (
                select count(f)
                from Favorite f
                where f.mangaId = m.id
            ) desc, m.slug asc
            """;

    public static final String FIND_FILTERED_ORDER_BY_COMMENTS = """
            select m
            from Manga m
            """ + FILTER_CONDITIONS + """
            order by (
                select count(c)
                from Comment c
                where c.mangaId = m.id
            ) desc, m.slug asc
            """;

    public static final String FIND_TOP_RANKED_BY_FOLLOWS = """
            select
                m.slug as slug,
                m.title as title,
                m.thumbUrl as thumbUrl,
                (select count(f) from Favorite f where f.mangaId = m.id) as followCount,
                (select count(distinct rh.userId) from ReadingHistory rh where rh.mangaId = m.id) as viewCount
            from Manga m
            where m.deletedAt is null
              and (select count(f) from Favorite f where f.mangaId = m.id) > 0
            order by (select count(f) from Favorite f where f.mangaId = m.id) desc,
                     m.updatedAt desc
            limit 5
            """;

    public static final String FIND_TOP_RANKED_BY_VIEWS = """
            select
                m.slug as slug,
                m.title as title,
                m.thumbUrl as thumbUrl,
                (select count(f) from Favorite f where f.mangaId = m.id) as followCount,
                (select count(distinct rh.userId) from ReadingHistory rh where rh.mangaId = m.id) as viewCount
            from Manga m
            where m.deletedAt is null
              and (select count(distinct rh.userId) from ReadingHistory rh where rh.mangaId = m.id) > 0
            order by (select count(distinct rh.userId) from ReadingHistory rh where rh.mangaId = m.id) desc,
                     m.updatedAt desc
            limit 5
            """;

    public static final String FIND_FOLLOWED_MANGA_BY_USER_ID = """
            select m from Manga m
            where m.deletedAt is null
              and exists (select f from Favorite f where f.mangaId = m.id and f.userId = :userId)
            order by m.updatedAt desc
            """;
}
