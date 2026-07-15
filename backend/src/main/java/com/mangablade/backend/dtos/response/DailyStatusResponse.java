package com.mangablade.backend.dtos.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatusResponse {
    private Integer level;
    private Integer exp;
    private String activeTitle;
    private String activeTitleColor;
    
    private Boolean checkInClaimed;
    private Integer chaptersRead;
    private Boolean chaptersRewardClaimed;
    private Integer commentsPosted;
    private Boolean commentsRewardClaimed;
    private Boolean luckyWheelSpun;
    
    private List<ExpHistoryItem> expHistory;
    private List<AchievementItem> achievements;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpHistoryItem {
        private String time;
        private String type;
        private Integer amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementItem {
        private Long id;
        private String title;
        private String description;
        private Integer targetValue;
        private Integer currentValue;
        private Boolean completed;
        private Boolean rewardClaimed;
        private Integer expReward;
    }
}
