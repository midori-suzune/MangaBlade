package com.mangablade.backend.repositories;

import com.mangablade.backend.entities.ForumThread;
import com.mangablade.backend.enums.ForumThreadCategory;
import com.mangablade.backend.enums.ForumThreadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {
    @EntityGraph(attributePaths = {"user", "user.activeTitle"})
    Page<ForumThread> findByStatusIn(Collection<ForumThreadStatus> statuses, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "user.activeTitle"})
    Page<ForumThread> findByCategoryAndStatusIn(
            ForumThreadCategory category,
            Collection<ForumThreadStatus> statuses,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "user.activeTitle"})
    Optional<ForumThread> findByIdAndStatusIn(Long id, Collection<ForumThreadStatus> statuses);
}
