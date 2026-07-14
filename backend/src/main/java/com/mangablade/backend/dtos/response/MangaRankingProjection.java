package com.mangablade.backend.dtos.response;

public interface MangaRankingProjection {
    String getSlug();

    String getTitle();

    String getThumbUrl();

    Long getLikeCount();

    Long getFollowCount();

    Long getViewCount();
}
