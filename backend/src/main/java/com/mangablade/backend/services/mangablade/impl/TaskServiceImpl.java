package com.mangablade.backend.services.mangablade.impl;

import com.mangablade.backend.dtos.response.DailyStatusResponse;
import com.mangablade.backend.entities.*;
import com.mangablade.backend.exceptions.AppException;
import com.mangablade.backend.exceptions.ErrorCode;
import com.mangablade.backend.repositories.*;
import com.mangablade.backend.services.mangablade.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final UserRepository userRepository;
    private final UserDailyTasksRepository userDailyTasksRepository;
    private final UserExpHistoryRepository userExpHistoryRepository;
    private final UserStatsRepository userStatsRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    private static final int[] WHEEL_PRIZES = {10, 15, 20, 25, 30, 40, 50, 100};

    @Override
    @Transactional
    public DailyStatusResponse getDailyStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserDailyTasks daily = getOrCreateDailyTasks(userId, LocalDate.now());
        UserStats stats = getOrCreateUserStats(userId);

        String activeTitle = user.getActiveTitle() != null ? user.getActiveTitle().getName() : null;
        String activeTitleColor = user.getActiveTitle() != null ? user.getActiveTitle().getColorCode() : null;

        List<UserExpHistory> histories = userExpHistoryRepository.findTop15ByUserIdOrderByCreatedAtDesc(userId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.systemDefault());

        List<DailyStatusResponse.ExpHistoryItem> expHistoryItems = histories.stream()
                .map(h -> DailyStatusResponse.ExpHistoryItem.builder()
                        .time(formatter.format(h.getCreatedAt()))
                        .type(translateSourceType(h.getSourceType()))
                        .amount(h.getExpGained())
                        .build())
                .collect(Collectors.toList());

        List<Achievement> achievements = achievementRepository.findAll();
        Map<Long, UserAchievement> userCompletedMap = userAchievementRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(UserAchievement::getAchievementId, ua -> ua));

        List<DailyStatusResponse.AchievementItem> achievementItems = achievements.stream()
                .map(a -> {
                    UserAchievement ua = userCompletedMap.get(a.getId());
                    boolean completed = ua != null;
                    boolean rewardClaimed = completed && ua.getRewardClaimed();
                    int currentValue = "READ_CHAPTER".equals(a.getTargetType()) ? stats.getTotalChaptersRead() : stats.getTotalMangaFollowed();

                    return DailyStatusResponse.AchievementItem.builder()
                            .id(a.getId())
                            .title(a.getTitle())
                            .description(a.getDescription())
                            .targetValue(a.getTargetValue())
                            .currentValue(currentValue)
                            .completed(completed)
                            .rewardClaimed(rewardClaimed)
                            .expReward(a.getExpReward())
                            .build();
                })
                .collect(Collectors.toList());

        return DailyStatusResponse.builder()
                .level(user.getLevel())
                .exp(user.getExp())
                .activeTitle(activeTitle)
                .activeTitleColor(activeTitleColor)
                .checkInClaimed(daily.getCheckInClaimed())
                .chaptersRead(daily.getChaptersRead())
                .chaptersRewardClaimed(daily.getChaptersRewardClaimed())
                .commentsPosted(daily.getCommentsPosted())
                .commentsRewardClaimed(daily.getCommentsRewardClaimed())
                .luckyWheelSpun(daily.getLuckyWheelSpun())
                .expHistory(expHistoryItems)
                .achievements(achievementItems)
                .build();
    }

    @Override
    @Transactional
    public int claimCheckIn(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserDailyTasks daily = getOrCreateDailyTasks(userId, LocalDate.now());
        if (daily.getCheckInClaimed()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        daily.setCheckInClaimed(true);
        userDailyTasksRepository.save(daily);

        addExp(user, 20, "CHECK_IN");
        return 20;
    }

    @Override
    @Transactional
    public int spinWheel(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserDailyTasks daily = getOrCreateDailyTasks(userId, LocalDate.now());
        if (daily.getLuckyWheelSpun()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        int expGained = WHEEL_PRIZES[new Random().nextInt(WHEEL_PRIZES.length)];

        daily.setLuckyWheelSpun(true);
        userDailyTasksRepository.save(daily);

        addExp(user, expGained, "LUCKY_WHEEL");
        return expGained;
    }

    @Override
    @Transactional
    public void handleChapterRead(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        UserDailyTasks daily = getOrCreateDailyTasks(userId, LocalDate.now());
        daily.setChaptersRead(daily.getChaptersRead() + 1);

        if (daily.getChaptersRead() >= 3 && !daily.getChaptersRewardClaimed()) {
            daily.setChaptersRewardClaimed(true);
            addExp(user, 50, "READ_CHAPTER");
        }
        userDailyTasksRepository.save(daily);

        UserStats stats = getOrCreateUserStats(userId);
        stats.setTotalChaptersRead(stats.getTotalChaptersRead() + 1);
        userStatsRepository.save(stats);

        checkAchievements(user, stats);
    }

    @Override
    @Transactional
    public void handleCommentPosted(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        UserDailyTasks daily = getOrCreateDailyTasks(userId, LocalDate.now());
        daily.setCommentsPosted(daily.getCommentsPosted() + 1);

        if (daily.getCommentsPosted() >= 1 && !daily.getCommentsRewardClaimed()) {
            daily.setCommentsRewardClaimed(true);
            addExp(user, 30, "COMMENT");
        }
        userDailyTasksRepository.save(daily);
    }

    @Override
    @Transactional
    public void handleMangaFollowUpdate(Long userId, int currentFollowCount) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        UserStats stats = getOrCreateUserStats(userId);
        stats.setTotalMangaFollowed(currentFollowCount);
        userStatsRepository.save(stats);

        checkAchievements(user, stats);
    }

    @Override
    @Transactional
    public int claimAchievement(Long userId, Long achievementId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserAchievement ua = userAchievementRepository.findById(new UserAchievement.UserAchievementId(userId, achievementId))
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_PASSWORD));

        if (ua.getRewardClaimed()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        ua.setRewardClaimed(true);
        userAchievementRepository.save(ua);

        addExp(user, ua.getAchievement().getExpReward(), "ACHIEVEMENT");
        return ua.getAchievement().getExpReward();
    }

    private UserDailyTasks getOrCreateDailyTasks(Long userId, LocalDate date) {
        return userDailyTasksRepository.findByUserIdAndTaskDate(userId, date)
                .orElseGet(() -> userDailyTasksRepository.save(UserDailyTasks.builder()
                        .userId(userId)
                        .taskDate(date)
                        .checkInClaimed(false)
                        .chaptersRead(0)
                        .chaptersRewardClaimed(false)
                        .commentsPosted(0)
                        .commentsRewardClaimed(false)
                        .luckyWheelSpun(false)
                        .build()));
    }

    private UserStats getOrCreateUserStats(Long userId) {
        return userStatsRepository.findById(userId)
                .orElseGet(() -> userStatsRepository.save(UserStats.builder()
                        .userId(userId)
                        .totalChaptersRead(0)
                        .totalMangaFollowed(0)
                        .build()));
    }

    private void addExp(User user, int amount, String sourceType) {
        int newExp = user.getExp() + amount;
        int currentLevel = user.getLevel();

        while (true) {
            int required = (40 * currentLevel * currentLevel) + (260 * currentLevel) + 200;
            if (newExp >= required) {
                newExp -= required;
                currentLevel++;
            } else {
                break;
            }
        }

        user.setExp(newExp);
        user.setLevel(currentLevel);
        userRepository.save(user);

        userExpHistoryRepository.save(UserExpHistory.builder()
                .userId(user.getId())
                .sourceType(sourceType)
                .expGained(amount)
                .createdAt(Instant.now())
                .build());
    }

    private void checkAchievements(User user, UserStats stats) {
        List<Achievement> achievements = achievementRepository.findAll();
        Map<Long, UserAchievement> userCompletedMap = userAchievementRepository.findByUserId(user.getId()).stream()
                .collect(Collectors.toMap(UserAchievement::getAchievementId, ua -> ua));

        for (Achievement a : achievements) {
            if (!userCompletedMap.containsKey(a.getId())) {
                boolean completed = false;
                if ("READ_CHAPTER".equals(a.getTargetType())) {
                    completed = stats.getTotalChaptersRead() >= a.getTargetValue();
                } else if ("FOLLOW_MANGA".equals(a.getTargetType())) {
                    completed = stats.getTotalMangaFollowed() >= a.getTargetValue();
                }

                if (completed) {
                    userAchievementRepository.save(UserAchievement.builder()
                            .userId(user.getId())
                            .achievementId(a.getId())
                            .completedAt(Instant.now())
                            .rewardClaimed(false)
                            .build());
                }
            }
        }
    }

    private String translateSourceType(String raw) {
        switch (raw) {
            case "CHECK_IN": return "Điểm danh";
            case "LUCKY_WHEEL": return "Vòng quay";
            case "READ_CHAPTER": return "Đọc truyện";
            case "COMMENT": return "Bình luận";
            case "ACHIEVEMENT": return "Thành tựu";
            default: return raw;
        }
    }
}
