package com.mangablade.backend.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorStatsOverviewResponse {
    private Long totalManga;
    private Long totalViews;
    private Long totalFollows;
    private Long totalComments;
}
