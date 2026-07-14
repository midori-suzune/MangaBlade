package com.mangablade.backend.repositories;

import com.mangablade.backend.search.document.MangaSearchDocument;
import com.mangablade.backend.utils.querysql.MangaSearchQuery;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MangaSearchRepository extends ElasticsearchRepository<MangaSearchDocument, Long> {

    @Query(MangaSearchQuery.SEARCH_BY_TITLE_OR_AUTHORS)
    Page<MangaSearchDocument> searchByTitleOrAuthors(String keyword, Pageable pageable);

    @Query(MangaSearchQuery.FIND_BY_CATEGORY_SLUG)
    Page<MangaSearchDocument> findByCategorySlugs(String categorySlug, Pageable pageable);

    @Query(MangaSearchQuery.FIND_BY_AUTHOR)
    Page<MangaSearchDocument> findByAuthorsContaining(String author, Pageable pageable);

    @Query(MangaSearchQuery.FIND_BY_CATEGORY_SLUG_AND_AUTHOR)
    Page<MangaSearchDocument> findByCategorySlugsAndAuthorsContaining(String categorySlug, String author, Pageable pageable);
}
