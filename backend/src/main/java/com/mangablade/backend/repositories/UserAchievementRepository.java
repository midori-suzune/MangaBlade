package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, UserAchievement.UserAchievementId> {
    List<UserAchievement> findByUserId(Long userId);
}
