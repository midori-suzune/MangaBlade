package com.mangablade.backend.services.mangablade;

import com.mangablade.backend.dtos.response.DailyStatusResponse;

public interface TaskService {
    DailyStatusResponse getDailyStatus(Long userId);
    int claimCheckIn(Long userId);
    int spinWheel(Long userId);
    void handleChapterRead(Long userId);
    void handleCommentPosted(Long userId);
    void handleMangaFollowUpdate(Long userId, int currentFollowCount);
    int claimAchievement(Long userId, Long achievementId);
}
