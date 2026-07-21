package com.mangablade.backend.dtos.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatisticResponse {
    private long totalUsers;
    private long newUsersToday;
    private long totalManga;
    private long newMangaToday;
    private long ongoingManga;
    private long completedManga;
    private long hiddenManga;
    private long totalComments;
    private long newCommentsToday;
    private long totalAuthorRequests;
    private long pendingAuthorRequests;
    private long pendingChapterReports;
}
