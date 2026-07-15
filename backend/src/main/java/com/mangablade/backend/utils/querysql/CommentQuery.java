package com.mangablade.backend.utils.querysql;

public class CommentQuery {
    public static final String FIND_ROOT_COMMENTS_BY_MANGA_ID = """
            select c
            from Comment c
            join fetch c.user u
            left join fetch u.activeTitle
            where c.mangaId = :mangaId
              and c.chapterId is null
              and c.status = :status
              and c.parentId is null
            order by c.createdAt desc
            """;

    public static final String FIND_ROOT_COMMENTS_BY_MANGA_ID_AND_CHAPTER_ID = """
            select c
            from Comment c
            join fetch c.user u
            left join fetch u.activeTitle
            where c.mangaId = :mangaId
              and c.chapterId = :chapterId
              and c.status = :status
              and c.parentId is null
            order by c.createdAt desc
            """;

    public static final String FIND_REPLIES_BY_PARENT_IDS = """
            select c
            from Comment c
            join fetch c.user u
            left join fetch u.activeTitle
            where c.parentId in :parentIds
              and c.status = :status
            order by c.createdAt asc
            """;

    public static final String FIND_RECENT_DISTINCT_USER_COMMENTS = """
            select
                c.id as id,
                c.content as content,
                c.createdAt as createdAt,
                u.id as userId,
                u.username as username,
                m.slug as mangaSlug,
                m.title as mangaTitle,
                ch.chapterNumber as chapterNumber,
                t.name as activeTitle,
                t.colorCode as activeTitleColor
            from Comment c
            join c.user u
            left join u.activeTitle t
            join c.manga m
            left join c.chapter ch
            where c.status = :status
              and c.createdAt = (
                  select max(c2.createdAt)
                  from Comment c2
                  where c2.userId = c.userId
                    and c2.status = :status
              )
            order by c.createdAt desc
            """;
}
