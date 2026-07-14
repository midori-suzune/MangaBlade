package com.mangablade.backend.utils.querysql;

public class CategoryQuery {
    public static final String FIND_BY_MANGA_ID = """
            select c
            from MangaCategory mc
            join mc.category c
            where mc.mangaId = :mangaId
            order by c.name asc
            """;
}
