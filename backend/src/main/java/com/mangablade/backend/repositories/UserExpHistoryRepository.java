package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.UserExpHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserExpHistoryRepository extends JpaRepository<UserExpHistory, Long> {
    List<UserExpHistory> findTop15ByUserIdOrderByCreatedAtDesc(Long userId);
}
