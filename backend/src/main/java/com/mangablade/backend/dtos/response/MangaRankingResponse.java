package com.mangablade.backend.dtos.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MangaRankingResponse {
    private String slug;
    private String title;
    private String thumbUrl;
    private Long followCount;
    private Long viewCount;
}
