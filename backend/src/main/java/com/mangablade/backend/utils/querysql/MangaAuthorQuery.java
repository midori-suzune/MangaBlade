package com.mangablade.backend.utils.querysql;

public class MangaAuthorQuery {
    public static final String FIND_AUTHORS_BY_MANGA_ID = """
            select a.id as authorId,
                   a.name as authorName,
                   m.id as mangaId
            from MangaAuthor ma
            join ma.author a
            join ma.manga m
            where ma.mangaId = :mangaId
            """;
}
