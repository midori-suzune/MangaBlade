package com.mangablade.backend.utils.querysql;

public class MangaCategoryQuery {
    public static final String FIND_CATEGORY_NAMES_BY_MANGA_ID = """
            SELECT c.name
            FROM MangaCategory mc
            JOIN mc.category c
            WHERE mc.mangaId = :mangaId
            ORDER BY c.name ASC
            """;
}
