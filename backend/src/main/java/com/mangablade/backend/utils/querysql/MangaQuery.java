package com.mangablade.backend.utils.querysql;

public class MangaQuery {
    public static final String FIND_TOP_RANKED_BY_FOLLOWS = """
            select
                m.slug as slug,
                m.title as title,
                m.thumbUrl as thumbUrl,
                (select count(ml) from MangaLike ml where ml.mangaId = m.id) as likeCount,
                (select count(f) from Favorite f where f.mangaId = m.id) as followCount,
                (select count(distinct rh.userId) from ReadingHistory rh where rh.mangaId = m.id) as viewCount
            from Manga m
            where (select count(f) from Favorite f where f.mangaId = m.id) > 0
            order by (select count(f) from Favorite f where f.mangaId = m.id) desc,
                     m.updatedAt desc
            limit 5
            """;

    public static final String FIND_TOP_RANKED_BY_VIEWS = """
            select
                m.slug as slug,
                m.title as title,
                m.thumbUrl as thumbUrl,
                (select count(ml) from MangaLike ml where ml.mangaId = m.id) as likeCount,
                (select count(f) from Favorite f where f.mangaId = m.id) as followCount,
                (select count(distinct rh.userId) from ReadingHistory rh where rh.mangaId = m.id) as viewCount
            from Manga m
            where (select count(distinct rh.userId) from ReadingHistory rh where rh.mangaId = m.id) > 0
            order by (select count(distinct rh.userId) from ReadingHistory rh where rh.mangaId = m.id) desc,
                     m.updatedAt desc
            limit 5
            """;

    public static final String FIND_FOLLOWED_MANGA_BY_USER_ID = """
            select m from Manga m
            where exists (select f from Favorite f where f.mangaId = m.id and f.userId = :userId)
            order by m.updatedAt desc
            """;
}
