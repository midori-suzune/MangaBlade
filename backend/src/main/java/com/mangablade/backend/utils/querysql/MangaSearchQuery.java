package com.mangablade.backend.utils.querysql;

public class MangaSearchQuery {
    public static final String SEARCH_BY_TITLE_OR_AUTHORS = """
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
            """;

    public static final String FIND_BY_CATEGORY_SLUG = """
            {
              "match": {
                "categorySlugs": "?0"
              }
            }
            """;

    public static final String FIND_BY_AUTHOR = """
            {
              "match": {
                "authors": "?0"
              }
            }
            """;

    public static final String FIND_BY_CATEGORY_SLUG_AND_AUTHOR = """
            {
              "bool": {
                "must": [
                  {
                    "match": {
                      "categorySlugs": "?0"
                    }
                  },
                  {
                    "match": {
                      "authors": "?1"
                    }
                  }
                ]
              }
            }
            """;
}
