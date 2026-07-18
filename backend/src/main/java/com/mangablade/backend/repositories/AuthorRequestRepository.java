package com.mangablade.backend.repositories;

import java.util.Optional;
import com.mangablade.backend.entities.AuthorRequest;
import com.mangablade.backend.enums.AuthorRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorRequestRepository extends JpaRepository<AuthorRequest, Long> {
    Optional<AuthorRequest> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndStatus(Long userId, AuthorRequestStatus status);
    Page<AuthorRequest> findByStatus(AuthorRequestStatus status, Pageable pageable);
}
