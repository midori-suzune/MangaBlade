package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MangaRankingResponse {
    private String slug;
    private String title;
    private String thumbUrl;
    private Long likeCount;
    private Long followCount;
    private Long viewCount;
}
