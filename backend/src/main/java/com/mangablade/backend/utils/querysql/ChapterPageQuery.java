package com.mangablade.backend.utils.querysql;

public class ChapterPageQuery {
    public static final String FIND_PAGES_BY_SLUG_AND_CHAPTER_NUMBER = """
            select m.title as mangaTitle,
                   c.chapter_number as chapterNumber,
                   cp.image_url as imageUrl,
                   (
                       select c2.chapter_number
                       from chapter c2
                       where c2.manga_id = m.id
                         and exists (
                             select 1
                             from chapter_page cp2
                             where cp2.chapter_id = c2.id
                         )
                       order by coalesce(c2.chapter_sort, cast(c2.chapter_number as decimal(10,3))) desc
                       limit 1
                   ) as latestChapterNumber,
                   (
                       select c2.chapter_number
                       from chapter c2
                       where c2.manga_id = m.id
                         and exists (
                             select 1
                             from chapter_page cp2
                             where cp2.chapter_id = c2.id
                         )
                         and coalesce(c2.chapter_sort, cast(c2.chapter_number as decimal(10,3)))
                             < coalesce(c.chapter_sort, cast(c.chapter_number as decimal(10,3)))
                       order by coalesce(c2.chapter_sort, cast(c2.chapter_number as decimal(10,3))) desc
                       limit 1
                   ) as previousChapterNumber,
                   (
                       select c2.chapter_number
                       from chapter c2
                       where c2.manga_id = m.id
                         and exists (
                             select 1
                             from chapter_page cp2
                             where cp2.chapter_id = c2.id
                         )
                         and coalesce(c2.chapter_sort, cast(c2.chapter_number as decimal(10,3)))
                             > coalesce(c.chapter_sort, cast(c.chapter_number as decimal(10,3)))
                       order by coalesce(c2.chapter_sort, cast(c2.chapter_number as decimal(10,3))) asc
                       limit 1
                   ) as nextChapterNumber
            from chapter_page cp
            join chapter c on cp.chapter_id = c.id
            join manga m on c.manga_id = m.id
            where m.slug = :slug
              and c.chapter_number = :chapterNumber
            order by cp.page_number asc
            """;
}
