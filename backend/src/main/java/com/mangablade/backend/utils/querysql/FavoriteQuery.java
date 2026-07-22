package com.mangablade.backend.utils.querysql;

public class FavoriteQuery {
    public static final String FIND_BY_USER_ID_WITH_MANGA = """
            select f
            from Favorite f
            join fetch f.manga m
            where f.userId = :userId
            order by m.updatedAt desc
            """;

    public static final String UPDATE_LAST_SEEN_CHAPTER_NUMBER = """
            update Favorite f
            set f.lastSeenChapterNumber = :chapterNumber
            where f.userId = :userId
              and f.mangaId = :mangaId
            """;
}
