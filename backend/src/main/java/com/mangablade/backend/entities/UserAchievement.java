package com.mangablade.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.io.Serializable;

@Entity
@Table(name = "user_achievements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(UserAchievement.UserAchievementId.class)
public class UserAchievement {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "achievement_id")
    private Long achievementId;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @Column(name = "reward_claimed", nullable = false)
    @Builder.Default
    private Boolean rewardClaimed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achievement_id", insertable = false, updatable = false)
    private Achievement achievement;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAchievementId implements Serializable {
        private Long userId;
        private Long achievementId;
    }
}
