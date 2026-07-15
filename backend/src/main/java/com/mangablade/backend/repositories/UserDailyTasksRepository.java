package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.UserDailyTasks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface UserDailyTasksRepository extends JpaRepository<UserDailyTasks, Long> {
    Optional<UserDailyTasks> findByUserIdAndTaskDate(Long userId, LocalDate taskDate);
}
