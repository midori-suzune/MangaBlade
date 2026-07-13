package com.mangablade.backend.repositories;

import com.mangablade.backend.search.document.MangaSearchDocument;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MangaSearchRepository extends ElasticsearchRepository<MangaSearchDocument, Long> {

    @Query("""
            {
              "bool": {
                "should": [
                  {
                    "multi_match": {
                      "query": "?0",
                      "fields": ["title^3", "authors"],
                      "type": "best_fields"
                    }
                  },
                  {
                    "match_phrase_prefix": {
                      "title": {
                        "query": "?0",
                        "boost": 4
                      }
                    }
                  },
                  {
                    "match_phrase_prefix": {
                      "authors": {
                        "query": "?0",
                        "boost": 2
                      }
                    }
                  },
                  {
                    "wildcard": {
                      "title": {
                        "value": "*?0*",
                        "case_insensitive": true,
                        "boost": 1
                      }
                    }
                  },
                  {
                    "wildcard": {
                      "authors": {
                        "value": "*?0*",
                        "case_insensitive": true,
                        "boost": 1
                      }
                    }
                  }
                ],
                "minimum_should_match": 1
              }
            }
            """)
    Page<MangaSearchDocument> searchByTitleOrAuthors(String keyword, Pageable pageable);
}
