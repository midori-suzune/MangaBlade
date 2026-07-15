package com.mangablade.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_daily_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDailyTasks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "task_date", nullable = false)
    private LocalDate taskDate;

    @Column(name = "check_in_claimed", nullable = false)
    @Builder.Default
    private Boolean checkInClaimed = false;

    @Column(name = "chapters_read", nullable = false)
    @Builder.Default
    private Integer chaptersRead = 0;

    @Column(name = "chapters_reward_claimed", nullable = false)
    @Builder.Default
    private Boolean chaptersRewardClaimed = false;

    @Column(name = "comments_posted", nullable = false)
    @Builder.Default
    private Integer commentsPosted = 0;

    @Column(name = "comments_reward_claimed", nullable = false)
    @Builder.Default
    private Boolean commentsRewardClaimed = false;

    @Column(name = "lucky_wheel_spun", nullable = false)
    @Builder.Default
    private Boolean luckyWheelSpun = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
