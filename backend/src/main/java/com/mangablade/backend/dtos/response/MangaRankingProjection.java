package com.mangablade.backend.dtos.response;

public interface MangaRankingProjection {
    String getSlug();

    String getTitle();

    String getThumbUrl();

    Long getFollowCount();

    Long getViewCount();
}
